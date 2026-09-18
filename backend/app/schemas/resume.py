from datetime import datetime
from pydantic import BaseModel, ConfigDict

class ResumeResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    filename: str
    extracted_text: str
    created_at: datetime

class ResumeSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    filename: str
    created_at: datetime
    character_count: int
