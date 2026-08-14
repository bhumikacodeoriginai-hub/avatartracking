"""Visitor schemas."""

from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from uuid import UUID


class VisitorCreate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    organization: Optional[str] = None
    profile_type: Optional[str] = None
    notes: Optional[str] = None


class VisitorUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    organization: Optional[str] = None
    profile_type: Optional[str] = None
    notes: Optional[str] = None


class VisitorResponse(BaseModel):
    id: UUID
    name: Optional[str]
    email: Optional[str]
    phone: Optional[str]
    organization: Optional[str]
    profile_type: Optional[str]
    first_visit: Optional[datetime]
    last_visit: Optional[datetime]
    visit_count: int
    consent_status: str
    is_enrolled: bool
    created_at: datetime

    class Config:
        from_attributes = True


class VisitorSessionCreate(BaseModel):
    track_id: Optional[int] = None
    detection_confidence: Optional[float] = None
    language: str = "en"


class VisitorSessionResponse(BaseModel):
    id: UUID
    visitor_id: Optional[UUID]
    session_token: str
    started_at: datetime
    ended_at: Optional[datetime]
    status: str
    purpose: Optional[str]
    mode: str
    language: str
    conversation_summary: Optional[str]

    class Config:
        from_attributes = True


class VisitorSessionEnd(BaseModel):
    reason: str = "departure"  # departure, timeout, handoff, completed
    summary: Optional[str] = None


class ConsentRequest(BaseModel):
    consent_type: str
    granted: bool
    consent_text_version: str = "1.0"


class ConsentResponse(BaseModel):
    id: UUID
    visitor_id: UUID
    consent_type: str
    granted: bool
    granted_at: Optional[datetime]
    withdrawn_at: Optional[datetime]

    class Config:
        from_attributes = True


class InteractionCreate(BaseModel):
    message_role: str  # visitor, assistant, system
    message_content: str
    intent_detected: Optional[str] = None
    language: str = "en"


class VisitorExportResponse(BaseModel):
    visitor: VisitorResponse
    sessions: List[VisitorSessionResponse]
    consents: List[ConsentResponse]
