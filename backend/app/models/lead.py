"""Lead management models."""

import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, ForeignKey, Text, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.core.database import Base


class Lead(Base):
    __tablename__ = "leads"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    visitor_id = Column(UUID(as_uuid=True), ForeignKey("visitors.id"), nullable=True)
    session_id = Column(UUID(as_uuid=True), ForeignKey("visitor_sessions.id"), nullable=True)
    category = Column(String(50), nullable=False)  # course, internship, job, client, parent, etc.
    name = Column(String(255), nullable=True)
    contact_info = Column(JSON, nullable=True)  # {phone, email}
    requirement = Column(Text, nullable=True)
    interest_level = Column(String(20), default="medium")  # low, medium, high
    conversation_summary = Column(Text, nullable=True)
    source = Column(String(50), default="avatar")  # avatar, website, referral, walk-in
    assigned_to = Column(UUID(as_uuid=True), ForeignKey("employees.id"), nullable=True)
    status = Column(String(50), default="new")  # new, contacted, qualified, converted, lost, archived
    priority = Column(String(20), default="normal")  # low, normal, high, urgent
    followup_date = Column(DateTime(timezone=True), nullable=True)
    metadata = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc),
                       onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    visitor = relationship("Visitor", back_populates="leads")
    followups = relationship("LeadFollowup", back_populates="lead")


class LeadFollowup(Base):
    __tablename__ = "lead_followups"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    lead_id = Column(UUID(as_uuid=True), ForeignKey("leads.id"), nullable=False)
    assigned_to = Column(UUID(as_uuid=True), ForeignKey("employees.id"), nullable=True)
    followup_date = Column(DateTime(timezone=True), nullable=False)
    notes = Column(Text, nullable=True)
    status = Column(String(50), default="pending")  # pending, completed, missed, rescheduled
    completed_at = Column(DateTime(timezone=True), nullable=True)
    outcome = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    # Relationships
    lead = relationship("Lead", back_populates="followups")
