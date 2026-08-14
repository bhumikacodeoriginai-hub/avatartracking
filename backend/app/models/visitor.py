"""Visitor models - core visitor management."""

import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Integer, Text, JSON, Float
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import enum

from app.core.database import Base


class ProfileType(str, enum.Enum):
    CLIENT = "client"
    PARENT = "parent"
    STUDENT = "student"
    JOB_APPLICANT = "job_applicant"
    INTERN = "intern"
    VENDOR = "vendor"
    PARTNER = "partner"
    GUEST = "guest"
    OTHER = "other"


class SessionStatus(str, enum.Enum):
    ACTIVE = "active"
    IDLE = "idle"
    COMPLETED = "completed"
    ABANDONED = "abandoned"
    HANDED_OFF = "handed_off"


class ConsentType(str, enum.Enum):
    DATA_COLLECTION = "data_collection"
    BIOMETRIC_ENROLLMENT = "biometric_enrollment"
    COMMUNICATION = "communication"
    DATA_SHARING = "data_sharing"
    ANALYTICS = "analytics"


class Visitor(Base):
    __tablename__ = "visitors"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=True)
    email = Column(String(255), nullable=True, index=True)
    phone = Column(String(50), nullable=True, index=True)
    organization = Column(String(255), nullable=True)
    profile_type = Column(String(50), nullable=True)
    first_visit = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    last_visit = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    visit_count = Column(Integer, default=1)
    consent_status = Column(String(50), default="pending")  # pending, granted, partial, withdrawn
    is_enrolled = Column(Boolean, default=False)
    privacy_preferences = Column(JSON, default=dict)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc),
                       onupdate=lambda: datetime.now(timezone.utc))
    deleted_at = Column(DateTime(timezone=True), nullable=True)  # Soft delete

    # Relationships
    sessions = relationship("VisitorSession", back_populates="visitor")
    consents = relationship("VisitorConsent", back_populates="visitor")
    appointments = relationship("Appointment", back_populates="visitor")
    leads = relationship("Lead", back_populates="visitor")


class VisitorSession(Base):
    __tablename__ = "visitor_sessions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    visitor_id = Column(UUID(as_uuid=True), ForeignKey("visitors.id"), nullable=True)
    session_token = Column(String(255), unique=True, nullable=False)
    track_id = Column(Integer, nullable=True)  # From CV tracking
    started_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    ended_at = Column(DateTime(timezone=True), nullable=True)
    status = Column(String(50), default=SessionStatus.ACTIVE.value)
    detection_confidence = Column(Float, nullable=True)
    purpose = Column(String(255), nullable=True)
    mode = Column(String(50), default="reception")  # current conversation mode
    employee_to_meet = Column(UUID(as_uuid=True), ForeignKey("employees.id"), nullable=True)
    department_routed = Column(UUID(as_uuid=True), ForeignKey("departments.id"), nullable=True)
    conversation_summary = Column(Text, nullable=True)
    language = Column(String(10), default="en")
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    # Relationships
    visitor = relationship("Visitor", back_populates="sessions")
    interactions = relationship("VisitorInteraction", back_populates="session")


class VisitorConsent(Base):
    __tablename__ = "visitor_consents"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    visitor_id = Column(UUID(as_uuid=True), ForeignKey("visitors.id"), nullable=False)
    consent_type = Column(String(50), nullable=False)
    granted = Column(Boolean, default=False)
    granted_at = Column(DateTime(timezone=True), nullable=True)
    withdrawn_at = Column(DateTime(timezone=True), nullable=True)
    ip_address = Column(String(50), nullable=True)
    consent_text_version = Column(String(20), default="1.0")
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    # Relationships
    visitor = relationship("Visitor", back_populates="consents")


class VisitorInteraction(Base):
    __tablename__ = "visitor_interactions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    session_id = Column(UUID(as_uuid=True), ForeignKey("visitor_sessions.id"), nullable=False)
    visitor_id = Column(UUID(as_uuid=True), ForeignKey("visitors.id"), nullable=True)
    message_role = Column(String(20), nullable=False)  # visitor, assistant, system
    message_content = Column(Text, nullable=False)
    intent_detected = Column(String(100), nullable=True)
    language = Column(String(10), default="en")
    metadata = Column(JSON, nullable=True)
    timestamp = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    # Relationships
    session = relationship("VisitorSession", back_populates="interactions")
