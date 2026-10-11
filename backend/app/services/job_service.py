import uuid
import os
import shutil
from datetime import datetime, timezone
from typing import List, Tuple
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from app.models.job import Job, JobStatus
from app.models.recipient import Recipient, RecipientStatus
from app.schemas.job import JobCreate
from app.core.config import settings

class JobService:
    @staticmethod
    def create_job(db: Session, job_in: JobCreate) -> Job:
        """
        Creates a new job and all associated recipients in a single transaction.
        Optimized for bulk generation of up to 1,000,000 recipients using chunked bulk inserts.
        Returns the created Job.
        """
        # Enforce batch size limit (up to 1,000,000 / 10 lakhs)
        if len(job_in.recipients) > settings.MAX_BATCH_SIZE:
            raise ValueError(f"Batch size exceeds maximum limit of {settings.MAX_BATCH_SIZE}.")
            
        # Optional: Handle idempotency
        if job_in.idempotency_key:
            existing_job = db.query(Job).filter(Job.idempotency_key == job_in.idempotency_key).first()
            if existing_job:
                return existing_job

        db_job = Job(
            event_name=job_in.event_name,
            organization_name=job_in.organization_name,
            issue_date=job_in.issue_date,
            description=job_in.description,
            presentation_text=job_in.presentation_text,
            certificate_title=job_in.certificate_title or "Certificate of Completion",
            theme_key=job_in.theme_key or "royal_gold",
            border_style=job_in.border_style or "classic_prestige",
            signatory_name=job_in.signatory_name or "Dr. Arthur Pendelton",
            signatory_title=job_in.signatory_title or "Dean of Computer Engineering",
            logo_url=job_in.logo_url,
            idempotency_key=job_in.idempotency_key,
            total_count=len(job_in.recipients),
            valid_count=0, # Computed during processing or initially if desired
            completed_count=0,
            failed_count=0,
            status=JobStatus.PENDING
        )
        db.add(db_job)
        db.flush() # Get job ID

        # High-performance bulk insert for up to 1,000,000 recipients in chunks
        chunk_size = 5000
        recipient_mappings = []
        job_hex = db_job.id.hex[:8].upper()
        now = datetime.now(timezone.utc)

        for idx, rec in enumerate(job_in.recipients, 1):
            # Globally unique, collision-free certificate ID
            cert_id = f"CERT-{job_hex}-{idx:07d}-{uuid.uuid4().hex[:4].upper()}"
            recipient_mappings.append({
                "id": uuid.uuid4(),
                "job_id": db_job.id,
                "full_name": rec.full_name,
                "email": rec.email,
                "certificate_id": cert_id,
                "status": RecipientStatus.PENDING,
                "attempt_count": 0,
                "created_at": now
            })
            if len(recipient_mappings) >= chunk_size:
                db.bulk_insert_mappings(Recipient, recipient_mappings)
                recipient_mappings.clear()

        if recipient_mappings:
            db.bulk_insert_mappings(Recipient, recipient_mappings)
            recipient_mappings.clear()

        try:
            db.commit()
            db.refresh(db_job)
            return db_job
        except IntegrityError:
            db.rollback()
            raise ValueError("Failed to create job due to database integrity constraints.")

    @staticmethod
    def _to_uuid(val):
        if isinstance(val, uuid.UUID):
            return val
        try:
            return uuid.UUID(str(val))
        except (ValueError, AttributeError):
            return val

    @staticmethod
    def get_job(db: Session, job_id) -> Job:
        return db.query(Job).filter(Job.id == JobService._to_uuid(job_id)).first()
        
    @staticmethod
    def get_job_recipients(db: Session, job_id, skip: int = 0, limit: int = 100) -> List[Recipient]:
        return db.query(Recipient).filter(Recipient.job_id == JobService._to_uuid(job_id)).offset(skip).limit(limit).all()
        
    @staticmethod
    def get_certificate_by_id(db: Session, certificate_id: str) -> Recipient:
        return db.query(Recipient).filter(Recipient.certificate_id == certificate_id).first()

    @staticmethod
    def list_jobs(db: Session, limit: int = 20) -> List[Job]:
        return db.query(Job).order_by(Job.created_at.desc()).limit(limit).all()

    @staticmethod
    def list_certificates(db: Session, query: str = None, limit: int = 50) -> List[Recipient]:
        q = db.query(Recipient)
        if query:
            clean_query = query.strip()
            q = q.filter(
                (Recipient.certificate_id.ilike(f"%{clean_query}%")) |
                (Recipient.full_name.ilike(f"%{clean_query}%")) |
                (Recipient.email.ilike(f"%{clean_query}%"))
            )
        return q.order_by(Recipient.created_at.desc()).limit(limit).all()

    @staticmethod
    def delete_job(db: Session, job_id) -> bool:
        """
        Hard deletes a job, all associated recipients, and generated PDF files on disk.
        """
        job = JobService.get_job(db, job_id)
        if not job:
            return False

        # 1. Delete all recipient files from storage
        recipients = db.query(Recipient).filter(Recipient.job_id == job.id).all()
        for rec in recipients:
            if rec.storage_path:
                try:
                    file_path = os.path.join(settings.LOCAL_STORAGE_DIR, rec.storage_path)
                    if os.path.exists(file_path):
                        os.remove(file_path)
                except Exception as e:
                    print(f"Error removing file for recipient {rec.id}: {e}")

        # Also remove job storage folder if exists
        job_dir = os.path.join(settings.LOCAL_STORAGE_DIR, str(job.id))
        if os.path.exists(job_dir):
            try:
                shutil.rmtree(job_dir)
            except Exception as e:
                print(f"Error removing job dir {job_dir}: {e}")

        # 2. Hard delete recipients from DB
        db.query(Recipient).filter(Recipient.job_id == job.id).delete()

        # 3. Hard delete job from DB
        db.delete(job)
        db.commit()
        return True

    @staticmethod
    def delete_certificate(db: Session, certificate_id: str) -> bool:
        """
        Hard deletes an individual certificate record and its generated PDF file on disk.
        """
        recipient = JobService.get_certificate_by_id(db, certificate_id)
        if not recipient:
            return False

        # 1. Delete file from storage
        if recipient.storage_path:
            try:
                file_path = os.path.join(settings.LOCAL_STORAGE_DIR, recipient.storage_path)
                if os.path.exists(file_path):
                    os.remove(file_path)
            except Exception as e:
                print(f"Error removing file for certificate {certificate_id}: {e}")

        # 2. Update job completed_count / total_count
        job = db.query(Job).filter(Job.id == recipient.job_id).first()
        if job:
            job.total_count = max(0, job.total_count - 1)
            if recipient.status == RecipientStatus.COMPLETED:
                job.completed_count = max(0, job.completed_count - 1)

        # 3. Hard delete recipient from DB
        db.delete(recipient)
        db.commit()
        return True
