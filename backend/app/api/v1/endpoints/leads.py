"""Lead management endpoints."""

import uuid
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from datetime import datetime, timezone

from app.core.database import get_db
from app.core.security import require_permission
from app.models.lead import Lead, LeadFollowup
from app.schemas.lead import (
    LeadCreate, LeadUpdate, LeadResponse,
    FollowupCreate, FollowupResponse, LeadStats,
)

router = APIRouter()


@router.get("", response_model=list[LeadResponse])
async def list_leads(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    category: Optional[str] = None,
    status: Optional[str] = None,
    assigned_to: Optional[uuid.UUID] = None,
    priority: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(require_permission("view_leads")),
):
    """List leads with filtering."""
    query = select(Lead)
    
    if category:
        query = query.where(Lead.category == category)
    if status:
        query = query.where(Lead.status == status)
    if assigned_to:
        query = query.where(Lead.assigned_to == assigned_to)
    if priority:
        query = query.where(Lead.priority == priority)
    
    query = query.order_by(Lead.created_at.desc())
    query = query.offset((page - 1) * per_page).limit(per_page)
    
    result = await db.execute(query)
    leads = result.scalars().all()
    return [LeadResponse.model_validate(l) for l in leads]


@router.get("/stats", response_model=LeadStats)
async def get_lead_stats(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(require_permission("view_leads")),
):
    """Get lead statistics."""
    # Total count
    total = await db.execute(select(func.count(Lead.id)))
    
    # By status
    status_counts = {}
    for s in ["new", "contacted", "qualified", "converted", "lost"]:
        count = await db.execute(
            select(func.count(Lead.id)).where(Lead.status == s)
        )
        status_counts[s] = count.scalar() or 0
    
    # By category
    category_result = await db.execute(
        select(Lead.category, func.count(Lead.id))
        .group_by(Lead.category)
    )
    by_category = dict(category_result.all())
    
    return LeadStats(
        total=total.scalar() or 0,
        new=status_counts.get("new", 0),
        contacted=status_counts.get("contacted", 0),
        qualified=status_counts.get("qualified", 0),
        converted=status_counts.get("converted", 0),
        lost=status_counts.get("lost", 0),
        by_category=by_category,
    )


@router.post("", response_model=LeadResponse)
async def create_lead(
    request: LeadCreate,
    db: AsyncSession = Depends(get_db),
):
    """Create a new lead."""
    lead = Lead(**request.model_dump(exclude_none=True))
    db.add(lead)
    await db.commit()
    await db.refresh(lead)
    return LeadResponse.model_validate(lead)


@router.put("/{lead_id}", response_model=LeadResponse)
async def update_lead(
    lead_id: uuid.UUID,
    request: LeadUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(require_permission("manage_leads")),
):
    """Update a lead."""
    result = await db.execute(select(Lead).where(Lead.id == lead_id))
    lead = result.scalar_one_or_none()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    
    for field, value in request.model_dump(exclude_none=True).items():
        setattr(lead, field, value)
    
    lead.updated_at = datetime.now(timezone.utc)
    await db.commit()
    await db.refresh(lead)
    return LeadResponse.model_validate(lead)


@router.post("/{lead_id}/followup", response_model=FollowupResponse)
async def create_followup(
    lead_id: uuid.UUID,
    request: FollowupCreate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(require_permission("manage_leads")),
):
    """Create a followup for a lead."""
    result = await db.execute(select(Lead).where(Lead.id == lead_id))
    lead = result.scalar_one_or_none()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    
    followup = LeadFollowup(
        lead_id=lead_id,
        **request.model_dump(exclude_none=True),
    )
    db.add(followup)
    
    # Update lead followup date
    lead.followup_date = request.followup_date
    
    await db.commit()
    await db.refresh(followup)
    return FollowupResponse.model_validate(followup)
