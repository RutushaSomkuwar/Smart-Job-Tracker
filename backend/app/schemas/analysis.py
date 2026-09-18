from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field, ConfigDict

class AnalysisRequest(BaseModel):
    resume_id: int
    job_description: str = Field(..., min_length=10, description="Raw job description text")
    application_id: Optional[int] = None

class AnalysisResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: Optional[int] = None
    resume_id: int
    application_id: Optional[int] = None
    match_percentage: int
    matched_keywords: List[str]
    missing_keywords: List[str]
    recommendations: List[str]
    job_description_snippet: Optional[str] = None
    created_at: Optional[datetime] = None

class SaveAnalysisRequest(BaseModel):
    resume_id: int
    job_description: str
    application_id: Optional[int] = None
    match_percentage: int
    matched_keywords: List[str]
    missing_keywords: List[str]
    recommendations: List[str]
