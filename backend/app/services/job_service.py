import uuid
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
        Returns the created Job.
        """
        # Enforce batch size limit
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
            idempotency_key=job_in.idempotency_key,
            total_count=len(job_in.recipients),
            valid_count=0, # Computed during processing or initially if desired
            completed_count=0,
            failed_count=0,
            status=JobStatus.PENDING
        )
        db.add(db_job)
        db.flush() # Get job ID

        # Create recipients
        # In a very large scale system, we'd use bulk_insert_mappings
        for rec in job_in.recipients:
            # Generate a unique certificate ID for each recipient
            cert_id = f"CERT-{db_job.id.hex[:8].upper()}-{uuid.uuid4().hex[:6].upper()}"
            
            db_recipient = Recipient(
                job_id=db_job.id,
                full_name=rec.full_name,
                email=rec.email,
                certificate_id=cert_id,
                status=RecipientStatus.PENDING
            )
            db.add(db_recipient)

        try:
            db.commit()
            db.refresh(db_job)
            return db_job
        except IntegrityError:
            db.rollback()
            raise ValueError("Failed to create job due to database integrity constraints.")

    @staticmethod
    def get_job(db: Session, job_id: str) -> Job:
        return db.query(Job).filter(Job.id == job_id).first()
        
    @staticmethod
    def get_job_recipients(db: Session, job_id: str, skip: int = 0, limit: int = 100) -> List[Recipient]:
        return db.query(Recipient).filter(Recipient.job_id == job_id).offset(skip).limit(limit).all()
        
    @staticmethod
    def get_certificate_by_id(db: Session, certificate_id: str) -> Recipient:
        return db.query(Recipient).filter(Recipient.certificate_id == certificate_id).first()
