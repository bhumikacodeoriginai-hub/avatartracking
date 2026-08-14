"""Job and Internship application models."""

import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, ForeignKey, Integer, Text, JSON
from sqlalchemy.dialects.postgresql import UUID

from app.core.database import Base


class InternshipApplication(Base):
    __tablename__ = "internship_applications"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    visitor_id = Column(UUID(as_uuid=True), ForeignKey("visitors.id"), nullable=True)
    session_id = Column(UUID(as_uuid=True), ForeignKey("visitor_sessions.id"), nullable=True)
    name = Column(String(255), nullable=False)
    education = Column(String(255), nullable=True)
    degree = Column(String(255), nullable=True)
    skills = Column(JSON, default=list)
    graduation_year = Column(Integer, nullable=True)
    internship_area = Column(String(100), nullable=True)
    preferred_duration = Column(String(50), nullable=True)
    resume_url = Column(String(500), nullable=True)
    email = Column(String(255), nullable=True)
    phone = Column(String(50), nullable=True)
    status = Column(String(50), default="new")  # new, reviewing, shortlisted, selected, rejected
    assigned_to = Column(UUID(as_uuid=True), ForeignKey("employees.id"), nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc),
                       onupdate=lambda: datetime.now(timezone.utc))


class JobApplication(Base):
    __tablename__ = "job_applications"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    visitor_id = Column(UUID(as_uuid=True), ForeignKey("visitors.id"), nullable=True)
    session_id = Column(UUID(as_uuid=True), ForeignKey("visitor_sessions.id"), nullable=True)
    name = Column(String(255), nullable=False)
    experience_years = Column(Integer, nullable=True)
    skills = Column(JSON, default=list)
    qualification = Column(String(255), nullable=True)
    preferred_role = Column(String(255), nullable=True)
    location_preference = Column(String(255), nullable=True)
    notice_period = Column(String(50), nullable=True)
    resume_url = Column(String(500), nullable=True)
    email = Column(String(255), nullable=True)
    phone = Column(String(50), nullable=True)
    current_company = Column(String(255), nullable=True)
    current_ctc = Column(String(50), nullable=True)
    expected_ctc = Column(String(50), nullable=True)
    status = Column(String(50), default="new")  # new, reviewing, shortlisted, interviewing, selected, rejected
    assigned_to = Column(UUID(as_uuid=True), ForeignKey("employees.id"), nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc),
                       onupdate=lambda: datetime.now(timezone.utc))
