"""Course models."""

import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Integer, Text, JSON, Numeric
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.core.database import Base


class Course(Base):
    __tablename__ = "courses"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    duration = Column(String(100), nullable=True)  # e.g., "3 months", "120 hours"
    fee = Column(Numeric(10, 2), nullable=True)
    level = Column(String(50), nullable=True)  # beginner, intermediate, advanced
    syllabus = Column(JSON, nullable=True)  # List of topics
    mode = Column(String(50), default="both")  # online, offline, both
    prerequisites = Column(Text, nullable=True)
    certification = Column(Boolean, default=True)
    placement_assistance = Column(Boolean, default=False)
    category = Column(String(100), nullable=True)  # python, java, devops, etc.
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc),
                       onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    batches = relationship("CourseBatch", back_populates="course")
    enquiries = relationship("CourseEnquiry", back_populates="course")


class CourseBatch(Base):
    __tablename__ = "course_batches"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    course_id = Column(UUID(as_uuid=True), ForeignKey("courses.id"), nullable=False)
    batch_name = Column(String(100), nullable=False)
    start_date = Column(DateTime(timezone=True), nullable=True)
    end_date = Column(DateTime(timezone=True), nullable=True)
    timing = Column(String(100), nullable=True)  # e.g., "Mon-Fri 10AM-12PM"
    max_students = Column(Integer, default=30)
    enrolled_count = Column(Integer, default=0)
    status = Column(String(50), default="upcoming")  # upcoming, ongoing, completed, cancelled
    trainer_id = Column(UUID(as_uuid=True), ForeignKey("employees.id"), nullable=True)
    mode = Column(String(50), default="offline")  # online, offline
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    # Relationships
    course = relationship("Course", back_populates="batches")


class CourseEnquiry(Base):
    __tablename__ = "course_enquiries"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    visitor_id = Column(UUID(as_uuid=True), ForeignKey("visitors.id"), nullable=True)
    course_id = Column(UUID(as_uuid=True), ForeignKey("courses.id"), nullable=True)
    session_id = Column(UUID(as_uuid=True), ForeignKey("visitor_sessions.id"), nullable=True)
    education_level = Column(String(100), nullable=True)
    experience = Column(String(255), nullable=True)
    preferred_mode = Column(String(50), nullable=True)
    preferred_timing = Column(String(100), nullable=True)
    status = Column(String(50), default="new")  # new, contacted, demo_scheduled, enrolled, lost
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc),
                       onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    course = relationship("Course", back_populates="enquiries")
