"""Employee model."""

import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.core.database import Base


class Employee(Base):
    __tablename__ = "employees"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), unique=True, nullable=False)
    employee_id = Column(String(50), unique=True, nullable=False)  # e.g., EMP001
    department_id = Column(UUID(as_uuid=True), ForeignKey("departments.id"), nullable=True)
    designation = Column(String(255), nullable=True)
    skills = Column(JSON, default=list)  # List of skills
    working_hours = Column(JSON, nullable=True)  # {"start": "09:00", "end": "18:00"}
    contact_info = Column(JSON, nullable=True)  # {"phone": "", "extension": ""}
    manager_id = Column(UUID(as_uuid=True), ForeignKey("employees.id"), nullable=True)
    office_location = Column(String(255), nullable=True)
    is_available = Column(Boolean, default=True)
    availability_status = Column(String(50), default="available")  # available, busy, away, dnd
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc),
                       onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    user = relationship("User", back_populates="employee")
    department = relationship("Department", back_populates="employees")
    manager = relationship("Employee", remote_side=[id])
    appointments = relationship("Appointment", back_populates="employee")
