"""Computer Vision schemas."""

from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class PersonDetection(BaseModel):
    track_id: int
    confidence: float
    bbox: List[float]  # [x1, y1, x2, y2] normalized
    is_approaching: bool = False
    distance_estimate: Optional[float] = None  # relative


class DetectionEvent(BaseModel):
    event_type: str  # person_detected, person_approaching, person_departed
    track_id: int
    confidence: float
    timestamp: datetime
    frame_count: int = 0
    metadata: Optional[dict] = None


class SessionStartEvent(BaseModel):
    session_token: str
    track_id: int
    confidence: float
    timestamp: datetime


class SessionEndEvent(BaseModel):
    session_token: str
    reason: str  # departure, timeout
    duration_seconds: float
    timestamp: datetime


class LivenessResult(BaseModel):
    session_token: str
    is_live: bool
    confidence: float
    checks_passed: List[str] = []  # blink, movement, texture
    timestamp: datetime


class DetectionConfig(BaseModel):
    person_confidence_threshold: float = 0.75
    stable_detection_seconds: float = 1.5
    session_timeout_seconds: int = 300
    liveness_confidence_threshold: float = 0.8
    approach_distance_threshold: float = 0.4
