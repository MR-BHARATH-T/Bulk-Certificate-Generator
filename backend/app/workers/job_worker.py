import time
import uuid
import traceback
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from sqlalchemy import text, and_
from app.db.session import SessionLocal
from app.models.job import Job, JobStatus
from app.models.recipient import Recipient, RecipientStatus
from app.services.certificate_service import CertificateService
from app.services.storage_service import storage_service

class JobWorker:
    def __init__(self):
        self.max_retries = 3

    def run(self):
        """
        Main worker loop.
        In a production environment, this would run in a separate process/container.
        """
        print("Worker started. Polling for pending recipients...")
        while True:
            try:
                self.process_next_batch()
                time.sleep(2) # Polling interval
            except Exception as e:
                print(f"Worker encountered an error: {e}")
                time.sleep(5)

    def process_next_batch(self):
        with SessionLocal() as db:
            # Check which database dialect we are using
            is_sqlite = db.bind.dialect.name == "sqlite"
            
            if is_sqlite:
                # SQLite fallback (no SKIP LOCKED or extract(epoch))
                # For local testing, we skip the 5-minute timeout check on PROCESSING rows
                query = text("""
                    SELECT id FROM recipients 
                    WHERE status = 'PENDING' OR (status = 'PROCESSING' AND attempt_count < :max_retries)
                    ORDER BY created_at ASC
                    LIMIT 10
                """)
            else:
                # Postgres concurrent queue logic
                query = text("""
                    SELECT id FROM recipients 
                    WHERE status = 'PENDING' OR (status = 'PROCESSING' AND attempt_count < :max_retries AND extract(epoch from (now() - created_at)) > 300)
                    ORDER BY created_at ASC
                    LIMIT 10
                    FOR UPDATE SKIP LOCKED
                """)
            
            result = db.execute(query, {"max_retries": self.max_retries}).fetchall()
            
            if not result:
                return
                
            recipient_ids = [row[0] for row in result]
            
            # Claim them by setting status to PROCESSING
            db.execute(
                text("UPDATE recipients SET status = 'PROCESSING', attempt_count = attempt_count + 1 WHERE id IN :ids"),
                {"ids": tuple(recipient_ids)}
            )
            db.commit()

            # Process each claimed recipient individually to isolate failures
            for rec_id in recipient_ids:
                self.process_single_recipient(rec_id)

    def process_single_recipient(self, recipient_id: uuid.UUID):
        with SessionLocal() as db:
            recipient = db.query(Recipient).filter(Recipient.id == recipient_id).first()
            if not recipient:
                return

            job = db.query(Job).filter(Job.id == recipient.job_id).first()
            
            # Update job status if it's the first time processing
            if job.status == JobStatus.PENDING:
                job.status = JobStatus.PROCESSING
                job.started_at = datetime.now(timezone.utc)
                db.commit()

            try:
                # 1. Generate PDF
                pdf_bytes = CertificateService.create_certificate(
                    full_name=recipient.full_name,
                    event_name=job.event_name,
                    organization_name=job.organization_name,
                    issue_date=job.issue_date,
                    certificate_id=recipient.certificate_id,
                    description=job.description
                )
                
                # 2. Upload to Storage
                storage_path = storage_service.upload_pdf(
                    job_id=str(job.id),
                    recipient_id=str(recipient.id),
                    pdf_bytes=pdf_bytes
                )
                
                # 3. Mark as Completed
                recipient.status = RecipientStatus.COMPLETED
                recipient.storage_path = storage_path
                recipient.completed_at = datetime.now(timezone.utc)
                db.commit()
                
            except Exception as e:
                db.rollback()
                recipient = db.query(Recipient).filter(Recipient.id == recipient_id).first() # Reload
                recipient.error_message = str(e)
                recipient.error_code = type(e).__name__
                
                if recipient.attempt_count >= self.max_retries:
                    recipient.status = RecipientStatus.FAILED
                else:
                    recipient.status = RecipientStatus.PENDING # Retry later
                    
                db.commit()
            
            # 4. Check if job is finished
            self.update_job_progress(db, job.id)
            
    def update_job_progress(self, db: Session, job_id: uuid.UUID):
        """
        Updates the job counters and status based on recipient states.
        """
        # Count statuses
        # Using raw SQL or precise SQLAlchemy for counting to avoid locking large rows
        res = db.execute(
            text("""
                SELECT status, COUNT(*) FROM recipients WHERE job_id = :job_id GROUP BY status
            """),
            {"job_id": job_id}
        ).fetchall()
        
        counts = {status: count for status, count in res}
        completed = counts.get(RecipientStatus.COMPLETED.value, 0)
        failed = counts.get(RecipientStatus.FAILED.value, 0)
        pending = counts.get(RecipientStatus.PENDING.value, 0)
        processing = counts.get(RecipientStatus.PROCESSING.value, 0)
        
        job = db.query(Job).filter(Job.id == job_id).first()
        job.completed_count = completed
        job.failed_count = failed
        job.valid_count = job.total_count - failed # Assuming validation failed ones are 'failed'
        
        if pending == 0 and processing == 0:
            job.completed_at = datetime.now(timezone.utc)
            if failed == 0:
                job.status = JobStatus.COMPLETED
            elif completed > 0:
                job.status = JobStatus.PARTIALLY_COMPLETED
            else:
                job.status = JobStatus.FAILED
                
        db.commit()

if __name__ == "__main__":
    worker = JobWorker()
    worker.run()
