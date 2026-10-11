import time
import uuid
import traceback
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from sqlalchemy import text, and_, func
from app.db.session import SessionLocal
from app.models.job import Job, JobStatus
from app.models.recipient import Recipient, RecipientStatus
from app.services.certificate_service import CertificateService
from app.services.storage_service import storage_service

class JobWorker:
    def __init__(self, session_factory=None):
        self.max_retries = 3
        self.session_factory = session_factory or SessionLocal

    def run(self):
        """
        Main worker loop.
        In a production environment, this would run in a separate process/container.
        """
        print("Worker started. Polling for pending recipients...")
        while True:
            try:
                processed_count = self.process_next_batch()
                if not processed_count:
                    time.sleep(2) # Polling interval only when queue is empty
            except Exception as e:
                print(f"Worker encountered an error: {e}")
                time.sleep(5)

    def process_next_batch(self):
        with self.session_factory() as db:
            # Check which database dialect we are using
            is_sqlite = db.bind.dialect.name == "sqlite"
            
            if is_sqlite:
                # SQLite fallback
                pending_rows = (
                    db.query(Recipient.id)
                    .filter(
                        (Recipient.status == RecipientStatus.PENDING)
                        | (
                            (Recipient.status == RecipientStatus.PROCESSING)
                            & (Recipient.attempt_count < self.max_retries)
                        )
                    )
                    .order_by(Recipient.created_at.asc())
                    .limit(50)
                    .all()
                )
                recipient_ids = [row[0] for row in pending_rows]
            else:
                # Postgres concurrent queue logic
                query = text("""
                    SELECT id FROM recipients 
                    WHERE status = 'PENDING' OR (status = 'PROCESSING' AND attempt_count < :max_retries AND extract(epoch from (now() - created_at)) > 300)
                    ORDER BY created_at ASC
                    LIMIT 50
                    FOR UPDATE SKIP LOCKED
                """)
                result = db.execute(query, {"max_retries": self.max_retries}).fetchall()
                recipient_ids = [row[0] for row in result]
            
            if not recipient_ids:
                return 0
                
            # Claim them by setting status to PROCESSING
            db.query(Recipient).filter(Recipient.id.in_(recipient_ids)).update(
                {
                    Recipient.status: RecipientStatus.PROCESSING,
                    Recipient.attempt_count: Recipient.attempt_count + 1,
                },
                synchronize_session=False,
            )
            db.commit()

            # Process each claimed recipient individually to isolate failures
            for rec_id in recipient_ids:
                self.process_single_recipient(rec_id)

            return len(recipient_ids)

    def process_single_recipient(self, recipient_id):
        rec_uuid = recipient_id if isinstance(recipient_id, uuid.UUID) else uuid.UUID(str(recipient_id))
        with self.session_factory() as db:
            recipient = db.query(Recipient).filter(Recipient.id == rec_uuid).first()
            if not recipient:
                return

            job = db.query(Job).filter(Job.id == recipient.job_id).first()
            if not job:
                return
            
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
                    description=job.description,
                    presentation_text=job.presentation_text,
                    certificate_title=getattr(job, "certificate_title", "Certificate of Completion"),
                    theme_key=getattr(job, "theme_key", "royal_gold"),
                    border_style=getattr(job, "border_style", "classic_prestige"),
                    signatory_name=getattr(job, "signatory_name", "Dr. Arthur Pendelton"),
                    signatory_title=getattr(job, "signatory_title", "Dean of Computer Engineering"),
                    logo_url=getattr(job, "logo_url", None)
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
                recipient = db.query(Recipient).filter(Recipient.id == rec_uuid).first() # Reload
                if recipient:
                    recipient.error_message = str(e)
                    recipient.error_code = type(e).__name__
                    
                    if recipient.attempt_count >= self.max_retries:
                        recipient.status = RecipientStatus.FAILED
                    else:
                        recipient.status = RecipientStatus.PENDING # Retry later
                        
                    db.commit()
            
            # 4. Check if job is finished
            self.update_job_progress(db, job.id)
            
    def update_job_progress(self, db: Session, job_id):
        """
        Updates the job counters and status based on recipient states.
        """
        job_uuid = job_id if isinstance(job_id, uuid.UUID) else uuid.UUID(str(job_id))
        res = (
            db.query(Recipient.status, func.count(Recipient.id))
            .filter(Recipient.job_id == job_uuid)
            .group_by(Recipient.status)
            .all()
        )
        
        counts = {}
        for status_val, count in res:
            key = status_val.value if hasattr(status_val, "value") else str(status_val)
            counts[key] = count

        completed = counts.get(RecipientStatus.COMPLETED.value, 0)
        failed = counts.get(RecipientStatus.FAILED.value, 0)
        pending = counts.get(RecipientStatus.PENDING.value, 0)
        processing = counts.get(RecipientStatus.PROCESSING.value, 0)
        
        job = db.query(Job).filter(Job.id == job_uuid).first()
        if not job:
            return

        job.completed_count = completed
        job.failed_count = failed
        job.valid_count = job.total_count - failed
        
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
