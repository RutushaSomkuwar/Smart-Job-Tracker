from typing import List, Dict
from pydantic import BaseModel
from app.schemas.application import ApplicationResponse

class StatusCount(BaseModel):
    status: str
    count: int

class MonthlyTrend(BaseModel):
    month: str
    count: int

class DashboardStats(BaseModel):
    total_applications: int
    status_counts: Dict[str, int]
    interview_rate: float
    offer_rate: float
    recent_applications: List[ApplicationResponse]
    monthly_trends: List[MonthlyTrend]
