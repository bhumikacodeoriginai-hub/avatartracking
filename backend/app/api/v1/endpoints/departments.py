"""Department endpoints."""

import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from typing import Optional

from app.core.database import get_db
from app.core.security import require_permission
from app.models.department import Department

router = APIRouter()


class DepartmentCreate(BaseModel):
    name: str
    description: Optional[str] = None
    location: Optional[str] = None
    floor: Optional[str] = None
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None


class DepartmentResponse(BaseModel):
    id: uuid.UUID
    name: str
    description: Optional[str]
    location: Optional[str]
    floor: Optional[str]
    contact_email: Optional[str]
    contact_phone: Optional[str]

    class Config:
        from_attributes = True


@router.get("", response_model=list[DepartmentResponse])
async def list_departments(db: AsyncSession = Depends(get_db)):
    """List all departments."""
    result = await db.execute(select(Department).order_by(Department.name))
    departments = result.scalars().all()
    return [DepartmentResponse.model_validate(d) for d in departments]


@router.get("/{department_id}", response_model=DepartmentResponse)
async def get_department(
    department_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    """Get department details."""
    result = await db.execute(select(Department).where(Department.id == department_id))
    dept = result.scalar_one_or_none()
    if not dept:
        raise HTTPException(status_code=404, detail="Department not found")
    return DepartmentResponse.model_validate(dept)


@router.post("", response_model=DepartmentResponse)
async def create_department(
    request: DepartmentCreate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(require_permission("manage_departments")),
):
    """Create a new department."""
    dept = Department(**request.model_dump(exclude_none=True))
    db.add(dept)
    await db.commit()
    await db.refresh(dept)
    return DepartmentResponse.model_validate(dept)


@router.put("/{department_id}", response_model=DepartmentResponse)
async def update_department(
    department_id: uuid.UUID,
    request: DepartmentCreate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(require_permission("manage_departments")),
):
    """Update a department."""
    result = await db.execute(select(Department).where(Department.id == department_id))
    dept = result.scalar_one_or_none()
    if not dept:
        raise HTTPException(status_code=404, detail="Department not found")
    
    for field, value in request.model_dump(exclude_none=True).items():
        setattr(dept, field, value)
    
    await db.commit()
    await db.refresh(dept)
    return DepartmentResponse.model_validate(dept)
