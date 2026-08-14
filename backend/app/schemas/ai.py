"""AI/Conversation schemas."""

from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any


class ChatRequest(BaseModel):
    session_id: str
    message: str
    language: str = "en"
    visitor_name: Optional[str] = None
    context: Optional[Dict[str, Any]] = None


class ChatResponse(BaseModel):
    response: str
    intent: Optional[str] = None
    mode: Optional[str] = None
    actions: List[Dict[str, Any]] = []
    language: str = "en"
    suggestions: List[str] = []


class IntentDetectionRequest(BaseModel):
    message: str
    context: Optional[Dict[str, Any]] = None


class IntentDetectionResponse(BaseModel):
    intent: str
    confidence: float
    mode: str
    entities: Dict[str, Any] = {}


class TTSRequest(BaseModel):
    text: str
    language: str = "en"
    voice: str = "professional_female"


class TTSResponse(BaseModel):
    audio_url: Optional[str] = None
    audio_base64: Optional[str] = None
    duration_ms: int = 0
    visemes: List[Dict[str, Any]] = []


class STTRequest(BaseModel):
    audio_base64: str
    language: str = "en"
    

class STTResponse(BaseModel):
    text: str
    confidence: float
    language: str
    is_final: bool = True
