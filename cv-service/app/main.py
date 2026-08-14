"""CV Service Main - Edge computer vision processing pipeline."""

import asyncio
import time
import signal
import sys
from typing import Optional
import numpy as np
import structlog
import httpx

from app.config import cv_settings
from app.detection.person_detector import PersonDetector
from app.tracking.person_tracker import PersonTracker
from app.liveness.liveness_detector import LivenessDetector

logger = structlog.get_logger()


class CVPipeline:
    """Main computer vision pipeline.
    
    Camera → Frame Capture → Person Detection → Confidence Filter →
    Temporal Validation → Tracking → Liveness → Session Management
    """

    def __init__(self):
        self.config = cv_settings
        self.detector = PersonDetector(self.config)
        self.tracker = PersonTracker(self.config)
        self.liveness = LivenessDetector(self.config)
        self.running = False
        self.camera = None
        self.http_client = httpx.AsyncClient(
            base_url=self.config.BACKEND_URL,
            timeout=10.0,
        )
        
        # State
        self.frame_count = 0
        self.last_detection_time = 0

    async def start(self):
        """Start the CV pipeline."""
        logger.info("Starting CV Pipeline", 
                   camera=self.config.CAMERA_INDEX,
                   confidence=self.config.PERSON_CONFIDENCE_THRESHOLD)
        
        self.running = True
        
        # Open camera
        try:
            import cv2
            self.camera = cv2.VideoCapture(self.config.CAMERA_INDEX)
            self.camera.set(cv2.CAP_PROP_FRAME_WIDTH, self.config.CAMERA_WIDTH)
            self.camera.set(cv2.CAP_PROP_FRAME_HEIGHT, self.config.CAMERA_HEIGHT)
            self.camera.set(cv2.CAP_PROP_FPS, self.config.CAMERA_FPS)
            
            if not self.camera.isOpened():
                logger.error("Failed to open camera")
                return
            
            logger.info("Camera opened successfully",
                       width=self.config.CAMERA_WIDTH,
                       height=self.config.CAMERA_HEIGHT,
                       fps=self.config.CAMERA_FPS)
        except ImportError:
            logger.warning("OpenCV not available - running in simulation mode")
            self.camera = None
        
        # Main processing loop
        await self._processing_loop()

    async def stop(self):
        """Stop the CV pipeline."""
        self.running = False
        if self.camera:
            self.camera.release()
        await self.http_client.aclose()
        logger.info("CV Pipeline stopped")

    async def _processing_loop(self):
        """Main frame processing loop."""
        detection_interval = self.config.DETECTION_INTERVAL_MS / 1000.0
        
        while self.running:
            loop_start = time.time()
            
            # Capture frame
            frame = self._capture_frame()
            if frame is None:
                await asyncio.sleep(0.1)
                continue
            
            self.frame_count += 1
            
            # Run detection at configured interval
            current_time = time.time()
            if current_time - self.last_detection_time >= detection_interval:
                self.last_detection_time = current_time
                
                # Detect persons
                detections = self.detector.detect(frame)
                
                # Update tracker
                stable_tracks = self.tracker.update(detections)
                
                # Process stable tracks
                for track in stable_tracks:
                    await self._process_track(track, frame)
            
            # Maintain target frame rate
            elapsed = time.time() - loop_start
            sleep_time = max(0, (1.0 / self.config.CAMERA_FPS) - elapsed)
            await asyncio.sleep(sleep_time)

    def _capture_frame(self) -> Optional[np.ndarray]:
        """Capture a frame from the camera."""
        if self.camera is None:
            # Simulation mode - generate blank frame
            return np.zeros((self.config.CAMERA_HEIGHT, self.config.CAMERA_WIDTH, 3), 
                          dtype=np.uint8)
        
        ret, frame = self.camera.read()
        if not ret:
            return None
        return frame

    async def _process_track(self, track, frame: np.ndarray):
        """Process a stable tracked person."""
        
        # If no active session and track is stable, start one
        if not track.session_active and track.is_stable and not track.has_been_greeted:
            # Check if this might be a static object (poster/photo)
            if track.static_frame_count > self.config.MAX_STATIC_FRAMES:
                return  # Likely a poster or static image
            
            # Start session
            session_token = self.tracker.start_session(track.track_id)
            if session_token:
                # Run liveness check
                if self.config.LIVENESS_ENABLED:
                    liveness_result = self.liveness.check_liveness(frame, session_token)
                    
                    if not liveness_result.is_live:
                        logger.info("Liveness check failed", 
                                   track_id=track.track_id,
                                   confidence=liveness_result.confidence)
                        # Notify backend about failed liveness
                        await self._notify_backend("cv/liveness", {
                            "session_token": session_token,
                            "is_live": False,
                            "confidence": liveness_result.confidence,
                            "checks_passed": liveness_result.checks_passed,
                            "timestamp": time.time(),
                        })
                        return
                
                # Notify backend - session started
                await self._notify_backend("cv/session/start", {
                    "session_token": session_token,
                    "track_id": track.track_id,
                    "confidence": 0.85,  # Average confidence
                    "timestamp": time.time(),
                })
                
                track.has_been_greeted = True
                logger.info("Person session started", 
                           track_id=track.track_id,
                           session_token=session_token)
        
        # If person is approaching, notify
        elif track.session_active and track.is_approaching:
            await self._notify_backend("cv/detect", {
                "event_type": "person_approaching",
                "track_id": track.track_id,
                "confidence": 0.85,
                "timestamp": time.time(),
            })

    async def _notify_backend(self, endpoint: str, data: dict):
        """Send event to backend API."""
        try:
            response = await self.http_client.post(f"/{endpoint}", json=data)
            if response.status_code != 200:
                logger.warning("Backend notification failed",
                             endpoint=endpoint,
                             status=response.status_code)
        except Exception as e:
            logger.error("Failed to notify backend", 
                        endpoint=endpoint, error=str(e))


async def main():
    """Main entry point for CV service."""
    pipeline = CVPipeline()
    
    # Handle shutdown gracefully
    loop = asyncio.get_event_loop()
    
    def shutdown_handler(signum, frame):
        logger.info("Shutdown signal received")
        asyncio.create_task(pipeline.stop())
    
    signal.signal(signal.SIGINT, shutdown_handler)
    signal.signal(signal.SIGTERM, shutdown_handler)
    
    try:
        await pipeline.start()
    except KeyboardInterrupt:
        await pipeline.stop()


if __name__ == "__main__":
    asyncio.run(main())
