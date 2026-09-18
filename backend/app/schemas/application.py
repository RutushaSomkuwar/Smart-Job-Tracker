from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict

class ApplicationBase(BaseModel):
    company: str = Field(..., min_length=1, max_length=150)
    job_title: str = Field(..., min_length=1, max_length=150)
    job_url: Optional[str] = Field(None, max_length=500)
    location: Optional[str] = Field(None, max_length=150)
    job_type: Optional[str] = Field("Full-time", max_length=50)
    applied_date: Optional[date] = Field(default_factory=date.today)
    status: Optional[str] = Field("Applied", max_length=50)
    salary: Optional[str] = Field(None, max_length=100)
    notes: Optional[str] = None

class ApplicationCreate(ApplicationBase):
    pass

class ApplicationUpdate(BaseModel):
    company: Optional[str] = Field(None, min_length=1, max_length=150)
    job_title: Optional[str] = Field(None, min_length=1, max_length=150)
    job_url: Optional[str] = Field(None, max_length=500)
    location: Optional[str] = Field(None, max_length=150)
    job_type: Optional[str] = Field(None, max_length=50)
    applied_date: Optional[date] = None
    status: Optional[str] = Field(None, max_length=50)
    salary: Optional[str] = Field(None, max_length=100)
    notes: Optional[str] = None

class ApplicationResponse(ApplicationBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime
