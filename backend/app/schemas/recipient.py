from typing import Optional
from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field, EmailStr
from app.models.recipient import RecipientStatus

class RecipientCreate(BaseModel):
    full_name: str = Field(..., min_length=1, max_length=255)
    email: Optional[EmailStr] = None

class RecipientResponse(BaseModel):
    id: str
    job_id: str
    full_name: str
    email: Optional[str]
    certificate_id: Optional[str]
    status: RecipientStatus
    error_code: Optional[str]
    error_message: Optional[str]
    created_at: datetime
    completed_at: Optional[datetime]

    model_config = ConfigDict(from_attributes=True)
