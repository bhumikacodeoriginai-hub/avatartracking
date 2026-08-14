"""Notification model."""

import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Text, JSON
from sqlalchemy.dialects.postgresql import UUID

from app.core.database import Base


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    recipient_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    type = Column(String(50), nullable=False)  # visitor_arrived, appointment, lead, system
    channel = Column(String(50), default="dashboard")  # dashboard, email, sms, teams, slack
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    metadata = Column(JSON, nullable=True)  # Additional data (visitor_id, etc.)
    is_read = Column(Boolean, default=False)
    sent_at = Column(DateTime(timezone=True), nullable=True)
    read_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
