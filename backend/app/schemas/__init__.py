from app.schemas.auth import UserRegister, UserLogin, UserResponse, Token
from app.schemas.application import ApplicationCreate, ApplicationUpdate, ApplicationResponse
from app.schemas.resume import ResumeResponse, ResumeSummary
from app.schemas.analysis import AnalysisRequest, AnalysisResponse, SaveAnalysisRequest
from app.schemas.dashboard import DashboardStats, StatusCount, MonthlyTrend

__all__ = [
    "UserRegister", "UserLogin", "UserResponse", "Token",
    "ApplicationCreate", "ApplicationUpdate", "ApplicationResponse",
    "ResumeResponse", "ResumeSummary",
    "AnalysisRequest", "AnalysisResponse", "SaveAnalysisRequest",
    "DashboardStats", "StatusCount", "MonthlyTrend"
]
