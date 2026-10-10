from typing import Optional, List
from datetime import datetime, date
from pydantic import BaseModel, ConfigDict, Field, EmailStr
from app.models.job import JobStatus
from app.schemas.recipient import RecipientCreate, RecipientResponse

class JobCreate(BaseModel):
    event_name: str = Field(..., min_length=1, max_length=255)
    organization_name: str = Field(..., min_length=1, max_length=255)
    issue_date: date
    description: Optional[str] = Field(None, max_length=2000)
    idempotency_key: Optional[str] = Field(None, max_length=255)
    recipients: List[RecipientCreate] = Field(..., min_items=1, max_items=1000)

class JobResponse(BaseModel):
    id: str
    event_name: str
    organization_name: str
    issue_date: date
    description: Optional[str]
    status: JobStatus
    total_count: int
    valid_count: int
    completed_count: int
    failed_count: int
    created_at: datetime
    started_at: Optional[datetime]
    completed_at: Optional[datetime]

    model_config = ConfigDict(from_attributes=True)

class JobDetailResponse(JobResponse):
    recipients: List[RecipientResponse] = []
    percentage_completed: float = 0.0

    model_config = ConfigDict(from_attributes=True)
