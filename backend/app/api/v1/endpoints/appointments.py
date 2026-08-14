"""Appointment management endpoints."""

import uuid
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from pydantic import BaseModel
from datetime import datetime, date, timezone

from app.core.database import get_db
from app.core.security import require_permission
from app.models.appointment import Appointment

router = APIRouter()


class AppointmentCreate(BaseModel):
    visitor_id: Optional[uuid.UUID] = None
    employee_id: uuid.UUID
    scheduled_at: datetime
    duration_minutes: int = 30
    purpose: Optional[str] = None
    notes: Optional[str] = None
    visitor_name: Optional[str] = None
    visitor_email: Optional[str] = None
    visitor_phone: Optional[str] = None


class AppointmentUpdate(BaseModel):
    status: Optional[str] = None
    scheduled_at: Optional[datetime] = None
    duration_minutes: Optional[int] = None
    purpose: Optional[str] = None
    notes: Optional[str] = None


class AppointmentResponse(BaseModel):
    id: uuid.UUID
    visitor_id: Optional[uuid.UUID]
    employee_id: uuid.UUID
    scheduled_at: datetime
    duration_minutes: int
    status: str
    purpose: Optional[str]
    notes: Optional[str]
    visitor_name: Optional[str]
    visitor_email: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


@router.get("", response_model=list[AppointmentResponse])
async def list_appointments(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    status: Optional[str] = None,
    employee_id: Optional[uuid.UUID] = None,
    date_from: Optional[date] = None,
    date_to: Optional[date] = None,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(require_permission("view_appointments")),
):
    """List appointments."""
    query = select(Appointment)
    
    if status:
        query = query.where(Appointment.status == status)
    if employee_id:
        query = query.where(Appointment.employee_id == employee_id)
    if date_from:
        query = query.where(Appointment.scheduled_at >= datetime.combine(date_from, datetime.min.time()))
    if date_to:
        query = query.where(Appointment.scheduled_at <= datetime.combine(date_to, datetime.max.time()))
    
    query = query.order_by(Appointment.scheduled_at.desc())
    query = query.offset((page - 1) * per_page).limit(per_page)
    
    result = await db.execute(query)
    appointments = result.scalars().all()
    return [AppointmentResponse.model_validate(a) for a in appointments]


@router.get("/today", response_model=list[AppointmentResponse])
async def get_today_appointments(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(require_permission("view_appointments")),
):
    """Get today's appointments."""
    today = date.today()
    start = datetime.combine(today, datetime.min.time())
    end = datetime.combine(today, datetime.max.time())
    
    result = await db.execute(
        select(Appointment).where(
            and_(
                Appointment.scheduled_at >= start,
                Appointment.scheduled_at <= end,
            )
        ).order_by(Appointment.scheduled_at)
    )
    appointments = result.scalars().all()
    return [AppointmentResponse.model_validate(a) for a in appointments]


@router.post("", response_model=AppointmentResponse)
async def create_appointment(
    request: AppointmentCreate,
    db: AsyncSession = Depends(get_db),
):
    """Create a new appointment."""
    appointment = Appointment(**request.model_dump(exclude_none=True))
    db.add(appointment)
    await db.commit()
    await db.refresh(appointment)
    return AppointmentResponse.model_validate(appointment)


@router.put("/{appointment_id}", response_model=AppointmentResponse)
async def update_appointment(
    appointment_id: uuid.UUID,
    request: AppointmentUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(require_permission("manage_appointments")),
):
    """Update an appointment."""
    result = await db.execute(select(Appointment).where(Appointment.id == appointment_id))
    appointment = result.scalar_one_or_none()
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    for field, value in request.model_dump(exclude_none=True).items():
        setattr(appointment, field, value)
    
    await db.commit()
    await db.refresh(appointment)
    return AppointmentResponse.model_validate(appointment)
