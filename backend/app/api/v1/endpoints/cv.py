"""Computer Vision endpoints - receives events from edge CV service."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.schemas.cv import (
    DetectionEvent, SessionStartEvent, SessionEndEvent,
    LivenessResult, DetectionConfig,
)
from app.services.cv_service import CVService

router = APIRouter()


@router.post("/detect")
async def person_detected(
    event: DetectionEvent,
    db: AsyncSession = Depends(get_db),
):
    """Receive person detection event from CV service."""
    cv = CVService(db)
    result = await cv.handle_detection_event(event)
    return result


@router.post("/session/start")
async def start_session(
    event: SessionStartEvent,
    db: AsyncSession = Depends(get_db),
):
    """Start a new tracking session."""
    cv = CVService(db)
    result = await cv.start_session(event)
    return result


@router.post("/session/end")
async def end_session(
    event: SessionEndEvent,
    db: AsyncSession = Depends(get_db),
):
    """End a tracking session."""
    cv = CVService(db)
    result = await cv.end_session(event)
    return result


@router.post("/liveness")
async def liveness_check(
    result: LivenessResult,
    db: AsyncSession = Depends(get_db),
):
    """Receive liveness detection result."""
    cv = CVService(db)
    response = await cv.handle_liveness_result(result)
    return response


@router.get("/config", response_model=DetectionConfig)
async def get_detection_config():
    """Get current detection configuration."""
    from app.core.config import settings
    return DetectionConfig(
        person_confidence_threshold=settings.PERSON_CONFIDENCE_THRESHOLD,
        stable_detection_seconds=settings.STABLE_DETECTION_SECONDS,
        session_timeout_seconds=settings.SESSION_TIMEOUT_SECONDS,
        liveness_confidence_threshold=settings.LIVENESS_CONFIDENCE_THRESHOLD,
    )
