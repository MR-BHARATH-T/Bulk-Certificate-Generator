from typing import Optional, Union
from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, ConfigDict, Field, field_validator
from app.models.recipient import RecipientStatus

class RecipientCreate(BaseModel):
    full_name: str = Field(..., min_length=1, max_length=255)
    email: Optional[str] = Field(None, max_length=255)

    @field_validator("email", mode="before")
    @classmethod
    def clean_email(cls, v):
        if v is None:
            return None
        cleaned = str(v).strip()
        return cleaned if cleaned else None

    @field_validator("full_name", mode="before")
    @classmethod
    def clean_full_name(cls, v):
        if not v or not str(v).strip():
            raise ValueError("Full name cannot be empty")
        return str(v).strip()

class RecipientResponse(BaseModel):
    id: Union[UUID, str]
    job_id: Union[UUID, str]
    full_name: str
    email: Optional[str] = None
    certificate_id: Optional[str] = None
    status: RecipientStatus
    error_code: Optional[str] = None
    error_message: Optional[str] = None
    created_at: datetime
    completed_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
