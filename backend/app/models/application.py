from datetime import datetime, date, timezone
from sqlalchemy import Column, Integer, String, Text, Date, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class JobApplication(Base):
    __tablename__ = "job_applications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    company = Column(String(150), nullable=False, index=True)
    job_title = Column(String(150), nullable=False, index=True)
    job_url = Column(String(500), nullable=True)
    location = Column(String(150), nullable=True)
    job_type = Column(String(50), default="Full-time")  # Full-time, Part-time, Contract, Internship, Remote
    applied_date = Column(Date, default=date.today, nullable=False)
    status = Column(String(50), default="Applied", nullable=False, index=True)  # Applied, Screening, Interview, Assessment, Offer, Rejected, Withdrawn
    salary = Column(String(100), nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    user = relationship("User", back_populates="applications")
    analyses = relationship("JobAnalysis", back_populates="application", cascade="all, delete-orphan")
