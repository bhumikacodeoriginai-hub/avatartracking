"""Audit log endpoints."""

from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime, date, timedelta

from app.core.database import get_db
from app.core.security import require_permission
from app.models.audit import AuditLog

router = APIRouter()


@router.get("/logs")
async def list_audit_logs(
    page: int = Query(1, ge=1),
    per_page: int = Query(50, ge=1, le=200),
    action: Optional[str] = None,
    resource_type: Optional[str] = None,
    user_id: Optional[str] = None,
    date_from: Optional[date] = None,
    date_to: Optional[date] = None,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(require_permission("view_audit_logs")),
):
    """List audit logs with filtering."""
    query = select(AuditLog)
    
    if action:
        query = query.where(AuditLog.action == action)
    if resource_type:
        query = query.where(AuditLog.resource_type == resource_type)
    if user_id:
        query = query.where(AuditLog.user_id == user_id)
    if date_from:
        query = query.where(AuditLog.created_at >= datetime.combine(date_from, datetime.min.time()))
    if date_to:
        query = query.where(AuditLog.created_at <= datetime.combine(date_to, datetime.max.time()))
    
    query = query.order_by(AuditLog.created_at.desc())
    query = query.offset((page - 1) * per_page).limit(per_page)
    
    result = await db.execute(query)
    logs = result.scalars().all()
    
    return [{
        "id": str(l.id),
        "user_id": str(l.user_id) if l.user_id else None,
        "action": l.action,
        "resource_type": l.resource_type,
        "resource_id": l.resource_id,
        "details": l.details,
        "ip_address": l.ip_address,
        "created_at": l.created_at,
    } for l in logs]
