"""Course management endpoints."""

import uuid
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from typing import List
from datetime import datetime

from app.core.database import get_db
from app.core.security import require_permission, get_current_user
from app.models.course import Course, CourseBatch, CourseEnquiry

router = APIRouter()


class CourseCreate(BaseModel):
    name: str
    description: Optional[str] = None
    duration: Optional[str] = None
    fee: Optional[float] = None
    level: Optional[str] = None
    syllabus: Optional[list] = None
    mode: str = "both"
    prerequisites: Optional[str] = None
    certification: bool = True
    placement_assistance: bool = False
    category: Optional[str] = None


class CourseResponse(BaseModel):
    id: uuid.UUID
    name: str
    description: Optional[str]
    duration: Optional[str]
    fee: Optional[float]
    level: Optional[str]
    syllabus: Optional[list]
    mode: str
    prerequisites: Optional[str]
    certification: bool
    placement_assistance: bool
    category: Optional[str]
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


@router.get("", response_model=list[CourseResponse])
async def list_courses(
    category: Optional[str] = None,
    level: Optional[str] = None,
    is_active: bool = True,
    db: AsyncSession = Depends(get_db),
):
    """List all courses."""
    query = select(Course).where(Course.is_active == is_active)
    
    if category:
        query = query.where(Course.category == category)
    if level:
        query = query.where(Course.level == level)
    
    query = query.order_by(Course.name)
    result = await db.execute(query)
    courses = result.scalars().all()
    return [CourseResponse.model_validate(c) for c in courses]


@router.get("/{course_id}", response_model=CourseResponse)
async def get_course(
    course_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    """Get course details."""
    result = await db.execute(select(Course).where(Course.id == course_id))
    course = result.scalar_one_or_none()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    return CourseResponse.model_validate(course)


@router.post("", response_model=CourseResponse)
async def create_course(
    request: CourseCreate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(require_permission("manage_courses")),
):
    """Create a new course."""
    course = Course(**request.model_dump(exclude_none=True))
    db.add(course)
    await db.commit()
    await db.refresh(course)
    return CourseResponse.model_validate(course)


@router.put("/{course_id}", response_model=CourseResponse)
async def update_course(
    course_id: uuid.UUID,
    request: CourseCreate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(require_permission("manage_courses")),
):
    """Update a course."""
    result = await db.execute(select(Course).where(Course.id == course_id))
    course = result.scalar_one_or_none()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    for field, value in request.model_dump(exclude_none=True).items():
        setattr(course, field, value)
    
    await db.commit()
    await db.refresh(course)
    return CourseResponse.model_validate(course)


@router.get("/{course_id}/batches")
async def get_course_batches(
    course_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    """Get batches for a course."""
    result = await db.execute(
        select(CourseBatch).where(CourseBatch.course_id == course_id)
        .order_by(CourseBatch.start_date.desc())
    )
    batches = result.scalars().all()
    return [{
        "id": str(b.id),
        "batch_name": b.batch_name,
        "start_date": b.start_date,
        "end_date": b.end_date,
        "timing": b.timing,
        "max_students": b.max_students,
        "enrolled_count": b.enrolled_count,
        "status": b.status,
        "mode": b.mode,
    } for b in batches]
