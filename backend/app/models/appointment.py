"""Appointment model."""

import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, ForeignKey, Integer, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.core.database import Base


class Appointment(Base):
    __tablename__ = "appointments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    visitor_id = Column(UUID(as_uuid=True), ForeignKey("visitors.id"), nullable=True)
    employee_id = Column(UUID(as_uuid=True), ForeignKey("employees.id"), nullable=False)
    scheduled_at = Column(DateTime(timezone=True), nullable=False)
    duration_minutes = Column(Integer, default=30)
    status = Column(String(50), default="scheduled")  # scheduled, confirmed, in_progress, completed, cancelled, no_show
    purpose = Column(String(255), nullable=True)
    notes = Column(Text, nullable=True)
    calendar_event_id = Column(String(255), nullable=True)  # External calendar ID
    visitor_name = Column(String(255), nullable=True)  # For unregistered visitors
    visitor_email = Column(String(255), nullable=True)
    visitor_phone = Column(String(50), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc),
                       onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    visitor = relationship("Visitor", back_populates="appointments")
    employee = relationship("Employee", back_populates="appointments")
