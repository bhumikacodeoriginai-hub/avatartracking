"""AI / Conversation endpoints."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.schemas.ai import (
    ChatRequest, ChatResponse, 
    IntentDetectionRequest, IntentDetectionResponse,
    TTSRequest, TTSResponse,
    STTRequest, STTResponse,
)
from app.services.ai_agent import AIAgentService

router = APIRouter()


@router.post("/chat", response_model=ChatResponse)
async def chat(
    request: ChatRequest,
    db: AsyncSession = Depends(get_db),
):
    """Process a chat message through the AI agent."""
    agent = AIAgentService(db)
    response = await agent.process_message(
        session_id=request.session_id,
        message=request.message,
        language=request.language,
        visitor_name=request.visitor_name,
        context=request.context,
    )
    return response


@router.post("/detect-intent", response_model=IntentDetectionResponse)
async def detect_intent(request: IntentDetectionRequest):
    """Detect visitor intent from a message."""
    agent = AIAgentService(None)
    result = await agent.detect_intent(
        message=request.message,
        context=request.context,
    )
    return result


@router.post("/tts", response_model=TTSResponse)
async def text_to_speech(request: TTSRequest):
    """Convert text to speech."""
    agent = AIAgentService(None)
    result = await agent.text_to_speech(
        text=request.text,
        language=request.language,
        voice=request.voice,
    )
    return result


@router.post("/stt", response_model=STTResponse)
async def speech_to_text(request: STTRequest):
    """Convert speech to text."""
    agent = AIAgentService(None)
    result = await agent.speech_to_text(
        audio_base64=request.audio_base64,
        language=request.language,
    )
    return result
