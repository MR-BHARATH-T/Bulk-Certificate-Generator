from typing import Optional, List, Union
from datetime import datetime, date
from uuid import UUID
from pydantic import BaseModel, ConfigDict, Field, field_validator
from app.models.job import JobStatus
from app.schemas.recipient import RecipientCreate, RecipientResponse

class JobCreate(BaseModel):
    event_name: str = Field(..., min_length=1, max_length=255)
    organization_name: str = Field(..., min_length=1, max_length=255)
    issue_date: date = Field(default_factory=date.today)
    description: Optional[str] = Field(None, max_length=2000)
    presentation_text: Optional[str] = Field(None, max_length=500)
    certificate_title: Optional[str] = Field("Certificate of Completion", max_length=255)
    theme_key: Optional[str] = Field("royal_gold", max_length=100)
    border_style: Optional[str] = Field("classic_prestige", max_length=100)
    signatory_name: Optional[str] = Field("Dr. Arthur Pendelton", max_length=255)
    signatory_title: Optional[str] = Field("Dean of Computer Engineering", max_length=255)
    logo_url: Optional[str] = None
    idempotency_key: Optional[str] = Field(None, max_length=255)
    recipients: List[RecipientCreate] = Field(..., min_length=1, max_length=1000000)

    model_config = ConfigDict(extra="ignore")

    @field_validator("issue_date", mode="before")
    @classmethod
    def clean_issue_date(cls, v):
        if not v or not str(v).strip():
            return date.today()
        if isinstance(v, str):
            clean_str = v.strip()
            try:
                return date.fromisoformat(clean_str)
            except ValueError:
                from datetime import datetime
                for fmt in ("%Y-%m-%d", "%d-%m-%Y", "%m/%d/%Y", "%d/%m/%Y", "%Y/%m/%d"):
                    try:
                        return datetime.strptime(clean_str, fmt).date()
                    except ValueError:
                        pass
                return date.today()
        return v

    @field_validator("description", "presentation_text", "certificate_title", "signatory_name", "signatory_title", mode="before")
    @classmethod
    def clean_optional_strings(cls, v):
        if not v or not str(v).strip():
            return None
        return str(v).strip()

class JobResponse(BaseModel):
    id: Union[UUID, str]
    event_name: str
    organization_name: str
    issue_date: Union[date, datetime]
    description: Optional[str] = None
    presentation_text: Optional[str] = None
    certificate_title: Optional[str] = "Certificate of Completion"
    theme_key: Optional[str] = "royal_gold"
    border_style: Optional[str] = "classic_prestige"
    signatory_name: Optional[str] = "Dr. Arthur Pendelton"
    signatory_title: Optional[str] = "Dean of Computer Engineering"
    logo_url: Optional[str] = None
    status: JobStatus
    total_count: int
    valid_count: int
    completed_count: int
    failed_count: int
    created_at: datetime
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

class JobDetailResponse(JobResponse):
    recipients: List[RecipientResponse] = []
    percentage_completed: float = 0.0

    model_config = ConfigDict(from_attributes=True)
