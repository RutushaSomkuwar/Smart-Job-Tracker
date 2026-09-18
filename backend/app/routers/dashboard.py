from typing import Dict, List
from datetime import datetime, timedelta, timezone
from collections import defaultdict
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models.user import User
from app.models.application import JobApplication
from app.schemas.dashboard import DashboardStats, MonthlyTrend
from app.schemas.application import ApplicationResponse
from app.utils.dependencies import get_current_user

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

ALL_STATUSES = ["Applied", "Screening", "Interview", "Assessment", "Offer", "Rejected", "Withdrawn"]

@router.get("/stats", response_model=DashboardStats)
def get_dashboard_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Compute live analytics, conversion rates, status distributions, 
    and timeline trends for the authenticated user's job applications.
    """
    user_apps = db.query(JobApplication).filter(
        JobApplication.user_id == current_user.id
    ).all()

    total_applications = len(user_apps)

    # Initialize status counts
    status_counts: Dict[str, int] = {status: 0 for status in ALL_STATUSES}
    for app in user_apps:
        if app.status in status_counts:
            status_counts[app.status] += 1
        else:
            status_counts[app.status] = 1

    # Conversion metrics
    # Applications that advanced to interview stage (Interview, Assessment, Offer)
    interview_stage_count = (
        status_counts.get("Interview", 0) +
        status_counts.get("Assessment", 0) +
        status_counts.get("Offer", 0)
    )
    offer_count = status_counts.get("Offer", 0)

    interview_rate = round((interview_stage_count / total_applications) * 100, 1) if total_applications > 0 else 0.0
    offer_rate = round((offer_count / total_applications) * 100, 1) if total_applications > 0 else 0.0

    # Recent applications (last 5)
    recent_apps = sorted(user_apps, key=lambda x: (x.applied_date, x.created_at), reverse=True)[:5]
    recent_responses = [ApplicationResponse.model_validate(app) for app in recent_apps]

    # Monthly trends (last 6 months)
    # Generate past 6 months keys YYYY-MM
    now = datetime.now(timezone.utc)
    month_counts = defaultdict(int)
    for app in user_apps:
        if app.applied_date:
            m_key = app.applied_date.strftime("%Y-%m")
            month_counts[m_key] += 1

    # Generate sequential 6-month list
    monthly_trends: List[MonthlyTrend] = []
    for i in range(5, -1, -1):
        # Calculate date for month offset
        year = now.year
        month = now.month - i
        while month <= 0:
            month += 12
            year -= 1
        m_key = f"{year:04d}-{month:02d}"
        # Formatted readable label e.g., "Jan 2026" or "01/2026"
        d_obj = datetime(year, month, 1)
        label = d_obj.strftime("%b %Y")
        monthly_trends.append(MonthlyTrend(
            month=label,
            count=month_counts.get(m_key, 0)
        ))

    return DashboardStats(
        total_applications=total_applications,
        status_counts=status_counts,
        interview_rate=interview_rate,
        offer_rate=offer_rate,
        recent_applications=recent_responses,
        monthly_trends=monthly_trends
    )
