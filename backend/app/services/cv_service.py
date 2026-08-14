"""Computer Vision Service - handles detection events from edge service."""

import uuid
from typing import Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime, timezone

from app.schemas.cv import DetectionEvent, SessionStartEvent, SessionEndEvent, LivenessResult
from app.models.visitor import VisitorSession


class CVService:
    """Handles CV events from the edge detection service."""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def handle_detection_event(self, event: DetectionEvent) -> Dict[str, Any]:
        """Handle a person detection event."""
        if event.event_type == "person_detected":
            return {
                "status": "acknowledged",
                "track_id": event.track_id,
                "action": "monitor",
                "message": "Person detected, monitoring for stable presence",
            }
        elif event.event_type == "person_approaching":
            return {
                "status": "acknowledged",
                "track_id": event.track_id,
                "action": "prepare_greeting",
                "message": "Person approaching, prepare avatar greeting",
            }
        elif event.event_type == "person_departed":
            return {
                "status": "acknowledged",
                "track_id": event.track_id,
                "action": "close_session",
                "message": "Person departed",
            }
        
        return {"status": "unknown_event", "event_type": event.event_type}

    async def start_session(self, event: SessionStartEvent) -> Dict[str, Any]:
        """Start a new visitor session from CV detection."""
        session = VisitorSession(
            session_token=event.session_token,
            track_id=event.track_id,
            detection_confidence=event.confidence,
            started_at=event.timestamp,
            status="active",
        )
        self.db.add(session)
        await self.db.commit()
        await self.db.refresh(session)
        
        return {
            "status": "session_created",
            "session_id": str(session.id),
            "session_token": session.session_token,
            "action": "activate_avatar",
            "message": "Session started, avatar should greet visitor",
        }

    async def end_session(self, event: SessionEndEvent) -> Dict[str, Any]:
        """End an active visitor session."""
        result = await self.db.execute(
            select(VisitorSession).where(
                VisitorSession.session_token == event.session_token
            )
        )
        session = result.scalar_one_or_none()
        
        if not session:
            return {"status": "error", "message": "Session not found"}
        
        session.status = "completed"
        session.ended_at = event.timestamp
        await self.db.commit()
        
        return {
            "status": "session_ended",
            "session_id": str(session.id),
            "duration_seconds": event.duration_seconds,
            "reason": event.reason,
            "action": "deactivate_avatar",
            "message": "Session ended, avatar should return to idle",
        }

    async def handle_liveness_result(self, result: LivenessResult) -> Dict[str, Any]:
        """Handle liveness detection result."""
        # Find the session
        session_result = await self.db.execute(
            select(VisitorSession).where(
                VisitorSession.session_token == result.session_token
            )
        )
        session = session_result.scalar_one_or_none()
        
        if not session:
            return {"status": "error", "message": "Session not found"}
        
        if result.is_live and result.confidence >= 0.8:
            return {
                "status": "liveness_confirmed",
                "session_token": result.session_token,
                "confidence": result.confidence,
                "checks_passed": result.checks_passed,
                "action": "proceed_with_interaction",
                "message": "Liveness confirmed, proceed with visitor interaction",
            }
        else:
            return {
                "status": "liveness_failed",
                "session_token": result.session_token,
                "confidence": result.confidence,
                "action": "request_verification",
                "message": "Liveness check failed, request manual verification",
            }
