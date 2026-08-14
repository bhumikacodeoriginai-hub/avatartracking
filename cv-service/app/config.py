"""CV Service configuration."""

from pydantic_settings import BaseSettings


class CVSettings(BaseSettings):
    """Computer Vision service settings."""
    
    # Camera
    CAMERA_INDEX: int = 0
    CAMERA_WIDTH: int = 1280
    CAMERA_HEIGHT: int = 720
    CAMERA_FPS: int = 30
    
    # Detection
    YOLO_MODEL: str = "yolov8n.pt"  # nano model for speed
    PERSON_CLASS_ID: int = 0  # COCO class ID for person
    PERSON_CONFIDENCE_THRESHOLD: float = 0.75
    DETECTION_INTERVAL_MS: int = 100  # Run detection every 100ms
    
    # Temporal validation
    STABLE_DETECTION_SECONDS: float = 1.5
    STABLE_DETECTION_FRAMES: int = 45  # At 30fps
    DEPARTURE_FRAMES: int = 90  # Frames person absent before session ends
    
    # Tracking
    MAX_TRACK_AGE: int = 90
    MIN_TRACK_HITS: int = 3
    IOU_THRESHOLD: float = 0.3
    
    # Liveness
    LIVENESS_ENABLED: bool = True
    LIVENESS_CONFIDENCE_THRESHOLD: float = 0.8
    BLINK_DETECTION_WINDOW: int = 60
    
    # Session
    SESSION_TIMEOUT_SECONDS: int = 300
    APPROACH_DISTANCE_THRESHOLD: float = 0.4
    
    # Backend API
    BACKEND_URL: str = "http://localhost:8000/api/v1"
    API_KEY: str = ""
    
    # Anti-false-positive
    MIN_PERSON_HEIGHT_RATIO: float = 0.15  # Person must be at least 15% of frame height
    MAX_STATIC_FRAMES: int = 300  # If detection doesn't move for 10s, might be poster
    IGNORE_ZONES: list = []  # List of zones to ignore (TV screens, etc.)
    
    class Config:
        env_file = ".env"


cv_settings = CVSettings()
