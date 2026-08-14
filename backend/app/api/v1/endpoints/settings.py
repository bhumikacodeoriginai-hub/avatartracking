"""System settings endpoints."""

from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from datetime import datetime, timezone

from app.core.database import get_db
from app.core.security import require_permission
from app.models.settings import SystemSetting

router = APIRouter()


class SettingUpdate(BaseModel):
    value: dict
    description: Optional[str] = None


@router.get("")
async def list_settings(
    category: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(require_permission("manage_settings")),
):
    """List all system settings."""
    query = select(SystemSetting)
    if category:
        query = query.where(SystemSetting.category == category)
    query = query.order_by(SystemSetting.category, SystemSetting.key)
    
    result = await db.execute(query)
    settings = result.scalars().all()
    return [{
        "id": str(s.id),
        "key": s.key,
        "value": s.value,
        "category": s.category,
        "description": s.description,
        "updated_at": s.updated_at,
    } for s in settings]


@router.put("/{key}")
async def update_setting(
    key: str,
    request: SettingUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(require_permission("manage_settings")),
):
    """Update a system setting."""
    result = await db.execute(select(SystemSetting).where(SystemSetting.key == key))
    setting = result.scalar_one_or_none()
    
    if setting:
        setting.value = request.value
        setting.updated_by = current_user["user_id"]
        setting.updated_at = datetime.now(timezone.utc)
        if request.description:
            setting.description = request.description
    else:
        setting = SystemSetting(
            key=key,
            value=request.value,
            description=request.description,
            updated_by=current_user["user_id"],
        )
        db.add(setting)
    
    await db.commit()
    return {"message": f"Setting '{key}' updated successfully"}


@router.get("/avatar")
async def get_avatar_settings(db: AsyncSession = Depends(get_db)):
    """Get avatar configuration."""
    result = await db.execute(
        select(SystemSetting).where(SystemSetting.category == "avatar")
    )
    settings = result.scalars().all()
    config = {}
    for s in settings:
        config[s.key] = s.value
    
    # Default values
    defaults = {
        "avatar_voice": "professional_female",
        "avatar_language": "en",
        "greeting_message": "Hello! Welcome to our office. How may I help you?",
        "idle_message": "Welcome — I'm your AI Assistant",
        "farewell_message": "Thank you for visiting. Have a great day!",
        "idle_timeout_seconds": 30,
        "supported_languages": ["en", "hi", "kn"],
    }
    
    return {**defaults, **config}


@router.get("/detection")
async def get_detection_settings(db: AsyncSession = Depends(get_db)):
    """Get detection threshold settings."""
    from app.core.config import settings as app_settings
    return {
        "person_confidence_threshold": app_settings.PERSON_CONFIDENCE_THRESHOLD,
        "stable_detection_seconds": app_settings.STABLE_DETECTION_SECONDS,
        "session_timeout_seconds": app_settings.SESSION_TIMEOUT_SECONDS,
        "liveness_confidence_threshold": app_settings.LIVENESS_CONFIDENCE_THRESHOLD,
    }
