"""Employee management endpoints."""

import uuid
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import joinedload

from app.core.database import get_db
from app.core.security import get_current_user, require_permission
from app.models.employee import Employee
from app.models.user import User

router = APIRouter()


@router.get("")
async def list_employees(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    department_id: Optional[uuid.UUID] = None,
    search: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(require_permission("view_employees")),
):
    """List all employees."""
    query = select(Employee).options(joinedload(Employee.user))
    
    if department_id:
        query = query.where(Employee.department_id == department_id)
    if search:
        query = query.join(User).where(
            User.full_name.ilike(f"%{search}%") |
            Employee.employee_id.ilike(f"%{search}%") |
            Employee.designation.ilike(f"%{search}%")
        )
    
    query = query.offset((page - 1) * per_page).limit(per_page)
    result = await db.execute(query)
    employees = result.scalars().all()
    
    return [{
        "id": str(e.id),
        "employee_id": e.employee_id,
        "name": e.user.full_name if e.user else None,
        "email": e.user.email if e.user else None,
        "department_id": str(e.department_id) if e.department_id else None,
        "designation": e.designation,
        "skills": e.skills,
        "is_available": e.is_available,
        "availability_status": e.availability_status,
        "office_location": e.office_location,
    } for e in employees]


@router.get("/{employee_id}")
async def get_employee(
    employee_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(require_permission("view_employees")),
):
    """Get employee details."""
    result = await db.execute(
        select(Employee).options(joinedload(Employee.user))
        .where(Employee.id == employee_id)
    )
    employee = result.scalar_one_or_none()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    
    return {
        "id": str(employee.id),
        "employee_id": employee.employee_id,
        "name": employee.user.full_name if employee.user else None,
        "email": employee.user.email if employee.user else None,
        "department_id": str(employee.department_id) if employee.department_id else None,
        "designation": employee.designation,
        "skills": employee.skills,
        "working_hours": employee.working_hours,
        "contact_info": employee.contact_info,
        "is_available": employee.is_available,
        "availability_status": employee.availability_status,
        "office_location": employee.office_location,
    }


@router.put("/{employee_id}/availability")
async def update_availability(
    employee_id: uuid.UUID,
    is_available: bool,
    status: str = "available",
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Update employee availability status."""
    result = await db.execute(select(Employee).where(Employee.id == employee_id))
    employee = result.scalar_one_or_none()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    
    employee.is_available = is_available
    employee.availability_status = status
    await db.commit()
    return {"message": "Availability updated", "is_available": is_available, "status": status}
