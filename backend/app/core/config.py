"""Application configuration using Pydantic Settings."""

from typing import List, Optional
from pydantic_settings import BaseSettings
from pydantic import Field


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # Application
    APP_NAME: str = "AI Office Avatar"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    ENVIRONMENT: str = "development"
    
    # Server
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    ALLOWED_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:3001"]
    
    # Database
    DATABASE_URL: str = "postgresql+asyncpg://avatar:avatar_password@localhost:5432/avatar_db"
    DATABASE_ECHO: bool = False
    DATABASE_POOL_SIZE: int = 20
    DATABASE_MAX_OVERFLOW: int = 10
    
    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"
    
    # Authentication
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # AI / LLM
    OPENAI_API_KEY: Optional[str] = None
    ANTHROPIC_API_KEY: Optional[str] = None
    LLM_MODEL: str = "gpt-4-turbo-preview"
    LLM_TEMPERATURE: float = 0.7
    LLM_MAX_TOKENS: int = 1024
    
    # Speech
    DEEPGRAM_API_KEY: Optional[str] = None
    TTS_PROVIDER: str = "openai"  # openai, elevenlabs, azure
    ELEVENLABS_API_KEY: Optional[str] = None
    
    # Computer Vision
    PERSON_CONFIDENCE_THRESHOLD: float = 0.75
    STABLE_DETECTION_SECONDS: float = 1.5
    SESSION_TIMEOUT_SECONDS: int = 300
    LIVENESS_CONFIDENCE_THRESHOLD: float = 0.8
    
    # Storage
    S3_BUCKET: Optional[str] = None
    S3_REGION: str = "ap-south-1"
    AWS_ACCESS_KEY_ID: Optional[str] = None
    AWS_SECRET_ACCESS_KEY: Optional[str] = None
    
    # Notifications
    SENDGRID_API_KEY: Optional[str] = None
    SLACK_WEBHOOK_URL: Optional[str] = None
    
    # Company
    COMPANY_NAME: str = "AI Solutions Pvt Ltd"
    COMPANY_DOMAIN: str = "aisolutions.com"
    
    # Privacy
    DATA_RETENTION_DAYS: int = 730  # 2 years
    CONVERSATION_RETENTION_DAYS: int = 90
    REQUIRE_CONSENT_FOR_STORAGE: bool = True
    
    # Avatar
    DEFAULT_LANGUAGE: str = "en"
    SUPPORTED_LANGUAGES: List[str] = ["en", "hi", "kn"]
    AVATAR_VOICE: str = "professional_female"
    IDLE_TIMEOUT_SECONDS: int = 30
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
