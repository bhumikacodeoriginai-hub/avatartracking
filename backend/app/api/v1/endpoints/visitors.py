"""Visitor management endpoints."""

import uuid
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from datetime import datetime, timezone

from app.core.database import get_db
from app.core.security import get_current_user, require_permission
from app.models.visitor import Visitor, VisitorSession, VisitorConsent, VisitorInteraction
from app.schemas.visitor import (
    VisitorCreate, VisitorUpdate, VisitorResponse,
    VisitorSessionCreate, VisitorSessionResponse, VisitorSessionEnd,
    ConsentRequest, ConsentResponse, InteractionCreate,
)

router = APIRouter()


@router.get("", response_model=list[VisitorResponse])
async def list_visitors(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    profile_type: Optional[str] = None,
    search: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(require_permission("view_visitors")),
):
    """List all visitors with pagination and filtering."""
    query = select(Visitor).where(Visitor.deleted_at.is_(None))
    
    if profile_type:
        query = query.where(Visitor.profile_type == profile_type)
    if search:
        query = query.where(
            Visitor.name.ilike(f"%{search}%") |
            Visitor.email.ilike(f"%{search}%") |
            Visitor.phone.ilike(f"%{search}%")
        )
    
    query = query.order_by(Visitor.last_visit.desc())
    query = query.offset((page - 1) * per_page).limit(per_page)
    
    result = await db.execute(query)
    visitors = result.scalars().all()
    return [VisitorResponse.model_validate(v) for v in visitors]


@router.get("/{visitor_id}", response_model=VisitorResponse)
async def get_visitor(
    visitor_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(require_permission("view_visitors")),
):
    """Get visitor details."""
    result = await db.execute(
        select(Visitor).where(Visitor.id == visitor_id, Visitor.deleted_at.is_(None))
    )
    visitor = result.scalar_one_or_none()
    if not visitor:
        raise HTTPException(status_code=404, detail="Visitor not found")
    return VisitorResponse.model_validate(visitor)


@router.post("", response_model=VisitorResponse)
async def create_visitor(
    request: VisitorCreate,
    db: AsyncSession = Depends(get_db),
):
    """Create a new visitor record."""
    visitor = Visitor(**request.model_dump(exclude_none=True))
    db.add(visitor)
    await db.commit()
    await db.refresh(visitor)
    return VisitorResponse.model_validate(visitor)


@router.put("/{visitor_id}", response_model=VisitorResponse)
async def update_visitor(
    visitor_id: uuid.UUID,
    request: VisitorUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(require_permission("manage_visitors")),
):
    """Update visitor information."""
    result = await db.execute(
        select(Visitor).where(Visitor.id == visitor_id, Visitor.deleted_at.is_(None))
    )
    visitor = result.scalar_one_or_none()
    if not visitor:
        raise HTTPException(status_code=404, detail="Visitor not found")
    
    for field, value in request.model_dump(exclude_none=True).items():
        setattr(visitor, field, value)
    
    visitor.updated_at = datetime.now(timezone.utc)
    await db.commit()
    await db.refresh(visitor)
    return VisitorResponse.model_validate(visitor)


@router.delete("/{visitor_id}")
async def delete_visitor(
    visitor_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(require_permission("manage_visitors")),
):
    """Soft delete a visitor."""
    result = await db.execute(select(Visitor).where(Visitor.id == visitor_id))
    visitor = result.scalar_one_or_none()
    if not visitor:
        raise HTTPException(status_code=404, detail="Visitor not found")
    
    visitor.deleted_at = datetime.now(timezone.utc)
    await db.commit()
    return {"message": "Visitor deleted successfully"}


# --- Sessions ---

@router.post("/sessions", response_model=VisitorSessionResponse)
async def create_session(
    request: VisitorSessionCreate,
    db: AsyncSession = Depends(get_db),
):
    """Create a new visitor session (called by CV service)."""
    session_token = str(uuid.uuid4())
    session = VisitorSession(
        session_token=session_token,
        track_id=request.track_id,
        detection_confidence=request.detection_confidence,
        language=request.language,
    )
    db.add(session)
    await db.commit()
    await db.refresh(session)
    return VisitorSessionResponse.model_validate(session)


@router.get("/sessions/active", response_model=list[VisitorSessionResponse])
async def get_active_sessions(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(require_permission("view_visitors")),
):
    """Get all active visitor sessions."""
    result = await db.execute(
        select(VisitorSession).where(VisitorSession.status == "active")
        .order_by(VisitorSession.started_at.desc())
    )
    sessions = result.scalars().all()
    return [VisitorSessionResponse.model_validate(s) for s in sessions]


@router.put("/sessions/{session_id}/end")
async def end_session(
    session_id: uuid.UUID,
    request: VisitorSessionEnd,
    db: AsyncSession = Depends(get_db),
):
    """End a visitor session."""
    result = await db.execute(
        select(VisitorSession).where(VisitorSession.id == session_id)
    )
    session = result.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    session.status = "completed"
    session.ended_at = datetime.now(timezone.utc)
    session.conversation_summary = request.summary
    await db.commit()
    return {"message": "Session ended", "session_id": str(session_id)}


# --- Consent ---

@router.post("/{visitor_id}/consent", response_model=ConsentResponse)
async def record_consent(
    visitor_id: uuid.UUID,
    request: ConsentRequest,
    db: AsyncSession = Depends(get_db),
):
    """Record visitor consent."""
    consent = VisitorConsent(
        visitor_id=visitor_id,
        consent_type=request.consent_type,
        granted=request.granted,
        granted_at=datetime.now(timezone.utc) if request.granted else None,
        consent_text_version=request.consent_text_version,
    )
    db.add(consent)
    
    # Update visitor consent status
    result = await db.execute(select(Visitor).where(Visitor.id == visitor_id))
    visitor = result.scalar_one_or_none()
    if visitor:
        visitor.consent_status = "granted" if request.granted else "partial"
    
    await db.commit()
    await db.refresh(consent)
    return ConsentResponse.model_validate(consent)


@router.delete("/{visitor_id}/consent/{consent_type}")
async def withdraw_consent(
    visitor_id: uuid.UUID,
    consent_type: str,
    db: AsyncSession = Depends(get_db),
):
    """Withdraw a specific consent."""
    result = await db.execute(
        select(VisitorConsent).where(
            VisitorConsent.visitor_id == visitor_id,
            VisitorConsent.consent_type == consent_type,
            VisitorConsent.granted == True,
        )
    )
    consent = result.scalar_one_or_none()
    if not consent:
        raise HTTPException(status_code=404, detail="Active consent not found")
    
    consent.granted = False
    consent.withdrawn_at = datetime.now(timezone.utc)
    await db.commit()
    return {"message": f"Consent '{consent_type}' withdrawn successfully"}


# --- Data Export ---

@router.get("/{visitor_id}/export")
async def export_visitor_data(
    visitor_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(require_permission("manage_visitors")),
):
    """Export all data for a visitor (data portability)."""
    result = await db.execute(
        select(Visitor).where(Visitor.id == visitor_id)
    )
    visitor = result.scalar_one_or_none()
    if not visitor:
        raise HTTPException(status_code=404, detail="Visitor not found")
    
    # Get sessions
    sessions_result = await db.execute(
        select(VisitorSession).where(VisitorSession.visitor_id == visitor_id)
    )
    sessions = sessions_result.scalars().all()
    
    # Get consents
    consents_result = await db.execute(
        select(VisitorConsent).where(VisitorConsent.visitor_id == visitor_id)
    )
    consents = consents_result.scalars().all()
    
    return {
        "visitor": VisitorResponse.model_validate(visitor),
        "sessions": [VisitorSessionResponse.model_validate(s) for s in sessions],
        "consents": [ConsentResponse.model_validate(c) for c in consents],
    }
