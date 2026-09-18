from typing import List, Optional
from datetime import date
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc, asc
from app.database import get_db
from app.models.user import User
from app.models.application import JobApplication
from app.schemas.application import ApplicationCreate, ApplicationUpdate, ApplicationResponse
from app.utils.dependencies import get_current_user

router = APIRouter(prefix="/applications", tags=["Job Applications"])

VALID_STATUSES = ["Applied", "Screening", "Interview", "Assessment", "Offer", "Rejected", "Withdrawn"]

@router.get("", response_model=List[ApplicationResponse])
def list_applications(
    status_filter: Optional[str] = Query(None, alias="status"),
    search: Optional[str] = Query(None, description="Search by company or job title"),
    date_from: Optional[date] = Query(None),
    date_to: Optional[date] = Query(None),
    sort_by: Optional[str] = Query("applied_date", enum=["applied_date", "company", "status", "created_at"]),
    order: Optional[str] = Query("desc", enum=["asc", "desc"]),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve all job applications for the authenticated user with backend search and filtering."""
    query = db.query(JobApplication).filter(JobApplication.user_id == current_user.id)

    # Filter by status
    if status_filter and status_filter.strip() and status_filter != "All":
        query = query.filter(JobApplication.status == status_filter.strip())

    # Search in company or job_title
    if search and search.strip():
        search_pattern = f"%{search.strip()}%"
        query = query.filter(
            or_(
                JobApplication.company.ilike(search_pattern),
                JobApplication.job_title.ilike(search_pattern),
                JobApplication.location.ilike(search_pattern)
            )
        )

    # Date range filters
    if date_from:
        query = query.filter(JobApplication.applied_date >= date_from)
    if date_to:
        query = query.filter(JobApplication.applied_date <= date_to)

    # Sorting
    sort_column = getattr(JobApplication, sort_by, JobApplication.applied_date)
    if order == "desc":
        query = query.order_by(desc(sort_column), desc(JobApplication.id))
    else:
        query = query.order_by(asc(sort_column), asc(JobApplication.id))

    return query.all()

@router.post("", response_model=ApplicationResponse, status_code=status.HTTP_201_CREATED)
def create_application(
    app_in: ApplicationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new job application record for the current user."""
    # Validate status
    if app_in.status and app_in.status not in VALID_STATUSES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid status '{app_in.status}'. Valid statuses are: {', '.join(VALID_STATUSES)}"
        )

    new_application = JobApplication(
        user_id=current_user.id,
        company=app_in.company.strip(),
        job_title=app_in.job_title.strip(),
        job_url=app_in.job_url.strip() if app_in.job_url else None,
        location=app_in.location.strip() if app_in.location else None,
        job_type=app_in.job_type or "Full-time",
        applied_date=app_in.applied_date or date.today(),
        status=app_in.status or "Applied",
        salary=app_in.salary.strip() if app_in.salary else None,
        notes=app_in.notes.strip() if app_in.notes else None
    )
    db.add(new_application)
    db.commit()
    db.refresh(new_application)
    return new_application

@router.get("/{app_id}", response_model=ApplicationResponse)
def get_application(
    app_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get single job application details. Ensures strict user isolation."""
    application = db.query(JobApplication).filter(
        JobApplication.id == app_id,
        JobApplication.user_id == current_user.id
    ).first()

    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job application not found."
        )

    return application

@router.put("/{app_id}", response_model=ApplicationResponse)
@router.patch("/{app_id}", response_model=ApplicationResponse)
def update_application(
    app_id: int,
    app_update: ApplicationUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update job application details. Ensures strict user isolation."""
    application = db.query(JobApplication).filter(
        JobApplication.id == app_id,
        JobApplication.user_id == current_user.id
    ).first()

    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job application not found."
        )

    update_data = app_update.model_dump(exclude_unset=True)

    if "status" in update_data and update_data["status"] not in VALID_STATUSES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid status '{update_data['status']}'. Valid statuses are: {', '.join(VALID_STATUSES)}"
        )

    for field, value in update_data.items():
        if isinstance(value, str):
            value = value.strip()
        setattr(application, field, value)

    db.commit()
    db.refresh(application)
    return application

@router.delete("/{app_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_application(
    app_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a job application. Ensures strict user isolation."""
    application = db.query(JobApplication).filter(
        JobApplication.id == app_id,
        JobApplication.user_id == current_user.id
    ).first()

    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job application not found."
        )

    db.delete(application)
    db.commit()
    return None
