from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.resume import Resume
from app.models.application import JobApplication
from app.models.analysis import JobAnalysis
from app.schemas.analysis import AnalysisRequest, AnalysisResponse, SaveAnalysisRequest
from app.services.keyword_matcher import analyze_resume_against_job
from app.utils.dependencies import get_current_user

router = APIRouter(prefix="/analysis", tags=["Resume Analysis"])

@router.post("/analyze", response_model=AnalysisResponse)
def analyze_resume(
    req: AnalysisRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Perform on-demand rule-based matching between an uploaded resume and a job description.
    Does not persist unless user explicitly saves it.
    """
    resume = db.query(Resume).filter(
        Resume.id == req.resume_id,
        Resume.user_id == current_user.id
    ).first()

    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found or does not belong to you."
        )

    # If application_id provided, verify ownership
    if req.application_id:
        app_obj = db.query(JobApplication).filter(
            JobApplication.id == req.application_id,
            JobApplication.user_id == current_user.id
        ).first()
        if not app_obj:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Application not found or does not belong to you."
            )

    analysis_result = analyze_resume_against_job(
        resume_text=resume.extracted_text,
        job_description=req.job_description
    )

    return AnalysisResponse(
        resume_id=resume.id,
        application_id=req.application_id,
        match_percentage=analysis_result["match_percentage"],
        matched_keywords=analysis_result["matched_keywords"],
        missing_keywords=analysis_result["missing_keywords"],
        recommendations=analysis_result["recommendations"],
        job_description_snippet=req.job_description[:200] + "..." if len(req.job_description) > 200 else req.job_description
    )

@router.post("/save", response_model=AnalysisResponse, status_code=status.HTTP_201_CREATED)
def save_analysis(
    req: SaveAnalysisRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Save an analysis record to the database, optionally linking to a job application."""
    resume = db.query(Resume).filter(
        Resume.id == req.resume_id,
        Resume.user_id == current_user.id
    ).first()

    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found."
        )

    if req.application_id:
        app_obj = db.query(JobApplication).filter(
            JobApplication.id == req.application_id,
            JobApplication.user_id == current_user.id
        ).first()
        if not app_obj:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Application not found."
            )

    new_analysis = JobAnalysis(
        user_id=current_user.id,
        application_id=req.application_id,
        resume_id=req.resume_id,
        job_description=req.job_description,
        match_percentage=req.match_percentage,
        matched_keywords=req.matched_keywords,
        missing_keywords=req.missing_keywords,
        recommendations=req.recommendations
    )
    db.add(new_analysis)
    db.commit()
    db.refresh(new_analysis)

    return AnalysisResponse(
        id=new_analysis.id,
        resume_id=new_analysis.resume_id,
        application_id=new_analysis.application_id,
        match_percentage=new_analysis.match_percentage,
        matched_keywords=new_analysis.matched_keywords,
        missing_keywords=new_analysis.missing_keywords,
        recommendations=new_analysis.recommendations,
        job_description_snippet=new_analysis.job_description[:200] + "..." if len(new_analysis.job_description) > 200 else new_analysis.job_description,
        created_at=new_analysis.created_at
    )

@router.get("/application/{application_id}", response_model=Optional[AnalysisResponse])
def get_analysis_by_application(
    application_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve the latest resume analysis associated with a specific job application."""
    analysis = db.query(JobAnalysis).filter(
        JobAnalysis.application_id == application_id,
        JobAnalysis.user_id == current_user.id
    ).order_by(JobAnalysis.created_at.desc()).first()

    if not analysis:
        return None

    return AnalysisResponse(
        id=analysis.id,
        resume_id=analysis.resume_id,
        application_id=analysis.application_id,
        match_percentage=analysis.match_percentage,
        matched_keywords=analysis.matched_keywords,
        missing_keywords=analysis.missing_keywords,
        recommendations=analysis.recommendations,
        job_description_snippet=analysis.job_description[:200] + "..." if len(analysis.job_description) > 200 else analysis.job_description,
        created_at=analysis.created_at
    )
