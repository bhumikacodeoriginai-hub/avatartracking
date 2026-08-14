"""Lead schemas."""

from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from datetime import datetime
from uuid import UUID


class LeadCreate(BaseModel):
    visitor_id: Optional[UUID] = None
    session_id: Optional[UUID] = None
    category: str  # course, internship, job, client, parent, student, etc.
    name: Optional[str] = None
    contact_info: Optional[Dict[str, str]] = None
    requirement: Optional[str] = None
    interest_level: str = "medium"
    conversation_summary: Optional[str] = None
    source: str = "avatar"
    priority: str = "normal"


class LeadUpdate(BaseModel):
    status: Optional[str] = None
    assigned_to: Optional[UUID] = None
    priority: Optional[str] = None
    followup_date: Optional[datetime] = None
    notes: Optional[str] = None


class LeadResponse(BaseModel):
    id: UUID
    visitor_id: Optional[UUID]
    category: str
    name: Optional[str]
    contact_info: Optional[Dict[str, Any]]
    requirement: Optional[str]
    interest_level: str
    conversation_summary: Optional[str]
    source: str
    assigned_to: Optional[UUID]
    status: str
    priority: str
    followup_date: Optional[datetime]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class FollowupCreate(BaseModel):
    followup_date: datetime
    notes: Optional[str] = None
    assigned_to: Optional[UUID] = None


class FollowupResponse(BaseModel):
    id: UUID
    lead_id: UUID
    assigned_to: Optional[UUID]
    followup_date: datetime
    notes: Optional[str]
    status: str
    completed_at: Optional[datetime]
    outcome: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class LeadStats(BaseModel):
    total: int
    new: int
    contacted: int
    qualified: int
    converted: int
    lost: int
    by_category: Dict[str, int]
