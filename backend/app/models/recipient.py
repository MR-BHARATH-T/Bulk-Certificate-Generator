import enum
import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, DateTime, Enum, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from app.db.session import Base

class RecipientStatus(str, enum.Enum):
    PENDING = "PENDING"
    PROCESSING = "PROCESSING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"

class Recipient(Base):
    __tablename__ = "recipients"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    job_id = Column(UUID(as_uuid=True), ForeignKey("generation_jobs.id"), nullable=False, index=True)
    
    full_name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=True)
    
    certificate_id = Column(String(255), nullable=True, unique=True, index=True)
    status = Column(Enum(RecipientStatus), default=RecipientStatus.PENDING, nullable=False, index=True)
    storage_path = Column(String(1024), nullable=True)
    
    error_code = Column(String(100), nullable=True)
    error_message = Column(Text, nullable=True)
    attempt_count = Column(Integer, default=0, nullable=False)
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    completed_at = Column(DateTime, nullable=True)
    
    job = relationship("Job", back_populates="recipients")
