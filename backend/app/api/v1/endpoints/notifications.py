"""Notification endpoints."""

import uuid
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from datetime import datetime, timezone

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.notification import Notification

router = APIRouter()


class NotificationSend(BaseModel):
    recipient_id: uuid.UUID
    type: str
    channel: str = "dashboard"
    title: str
    message: str
    metadata: Optional[dict] = None


@router.get("")
async def list_notifications(
    is_read: Optional[bool] = None,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """List notifications for current user."""
    query = select(Notification).where(
        Notification.recipient_id == current_user["user_id"]
    )
    if is_read is not None:
        query = query.where(Notification.is_read == is_read)
    
    query = query.order_by(Notification.created_at.desc())
    query = query.offset((page - 1) * per_page).limit(per_page)
    
    result = await db.execute(query)
    notifications = result.scalars().all()
    return [{
        "id": str(n.id),
        "type": n.type,
        "channel": n.channel,
        "title": n.title,
        "message": n.message,
        "metadata": n.metadata,
        "is_read": n.is_read,
        "created_at": n.created_at,
    } for n in notifications]


@router.put("/{notification_id}/read")
async def mark_as_read(
    notification_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Mark notification as read."""
    result = await db.execute(
        select(Notification).where(
            Notification.id == notification_id,
            Notification.recipient_id == current_user["user_id"],
        )
    )
    notification = result.scalar_one_or_none()
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    notification.is_read = True
    notification.read_at = datetime.now(timezone.utc)
    await db.commit()
    return {"message": "Notification marked as read"}


@router.post("/send")
async def send_notification(
    request: NotificationSend,
    db: AsyncSession = Depends(get_db),
):
    """Send a notification to a user."""
    notification = Notification(
        recipient_id=request.recipient_id,
        type=request.type,
        channel=request.channel,
        title=request.title,
        message=request.message,
        metadata=request.metadata,
        sent_at=datetime.now(timezone.utc),
    )
    db.add(notification)
    await db.commit()
    await db.refresh(notification)
    return {"id": str(notification.id), "message": "Notification sent"}
