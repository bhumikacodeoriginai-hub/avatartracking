"""Liveness detection to prevent spoofing with photos/videos."""

import time
import numpy as np
from typing import Dict, List, Tuple, Optional
from collections import deque
from dataclasses import dataclass
import structlog

logger = structlog.get_logger()


@dataclass
class LivenessResult:
    """Result of liveness detection."""
    is_live: bool
    confidence: float
    checks_passed: List[str]
    checks_failed: List[str]


class LivenessDetector:
    """Multi-factor liveness detection.
    
    Combines multiple signals to determine if a detected person is live:
    1. Blink detection
    2. Micro-movement analysis
    3. Texture analysis (2D vs 3D surface)
    4. Temporal consistency
    """

    def __init__(self, config):
        self.config = config
        self.face_mesh = None
        self._init_face_mesh()
        
        # Per-session state
        self.session_data: Dict[str, Dict] = {}

    def _init_face_mesh(self):
        """Initialize MediaPipe face mesh."""
        try:
            import mediapipe as mp
            self.mp_face_mesh = mp.solutions.face_mesh
            self.face_mesh = self.mp_face_mesh.FaceMesh(
                max_num_faces=1,
                refine_landmarks=True,
                min_detection_confidence=0.5,
                min_tracking_confidence=0.5,
            )
            logger.info("MediaPipe FaceMesh initialized")
        except Exception as e:
            logger.warning("MediaPipe not available, liveness will use fallback", error=str(e))

    def check_liveness(self, frame: np.ndarray, session_token: str) -> LivenessResult:
        """Run liveness checks on a frame.
        
        Args:
            frame: BGR image
            session_token: Session identifier for temporal tracking
            
        Returns:
            LivenessResult with confidence and passed checks
        """
        if session_token not in self.session_data:
            self.session_data[session_token] = {
                "ear_history": deque(maxlen=60),  # Eye aspect ratio history
                "position_history": deque(maxlen=30),
                "blink_detected": False,
                "movement_detected": False,
                "start_time": time.time(),
            }
        
        session = self.session_data[session_token]
        checks_passed = []
        checks_failed = []
        
        # Check 1: Face mesh / blink detection
        blink_result = self._check_blink(frame, session)
        if blink_result:
            checks_passed.append("blink")
        elif time.time() - session["start_time"] > 3:
            checks_failed.append("blink")
        
        # Check 2: Micro-movement
        movement_result = self._check_movement(frame, session)
        if movement_result:
            checks_passed.append("movement")
        elif time.time() - session["start_time"] > 2:
            checks_failed.append("movement")
        
        # Check 3: Texture analysis
        texture_result = self._check_texture(frame)
        if texture_result:
            checks_passed.append("texture")
        else:
            checks_failed.append("texture")
        
        # Calculate overall confidence
        total_checks = len(checks_passed) + len(checks_failed)
        if total_checks == 0:
            confidence = 0.5  # Insufficient data
        else:
            confidence = len(checks_passed) / max(total_checks, 3)
        
        is_live = confidence >= self.config.LIVENESS_CONFIDENCE_THRESHOLD
        
        return LivenessResult(
            is_live=is_live,
            confidence=confidence,
            checks_passed=checks_passed,
            checks_failed=checks_failed,
        )

    def _check_blink(self, frame: np.ndarray, session: Dict) -> bool:
        """Detect natural blinking using eye aspect ratio."""
        if self.face_mesh is None:
            return True  # Fallback: pass if no face mesh available
        
        try:
            import cv2
            rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            results = self.face_mesh.process(rgb_frame)
            
            if not results.multi_face_landmarks:
                return False
            
            landmarks = results.multi_face_landmarks[0]
            
            # Calculate Eye Aspect Ratio (EAR)
            # Left eye landmarks: 33, 160, 158, 133, 153, 144
            # Right eye landmarks: 362, 385, 387, 263, 373, 380
            left_ear = self._calculate_ear(landmarks, [33, 160, 158, 133, 153, 144])
            right_ear = self._calculate_ear(landmarks, [362, 385, 387, 263, 373, 380])
            avg_ear = (left_ear + right_ear) / 2
            
            session["ear_history"].append(avg_ear)
            
            # Detect blink: EAR drops below threshold then recovers
            if len(session["ear_history"]) >= 10:
                ears = list(session["ear_history"])
                min_ear = min(ears[-10:])
                max_ear = max(ears[-10:])
                if max_ear - min_ear > 0.05 and min_ear < 0.2:
                    session["blink_detected"] = True
            
            return session["blink_detected"]
        except Exception:
            return True  # Fail open for blink check

    def _calculate_ear(self, landmarks, indices) -> float:
        """Calculate Eye Aspect Ratio from landmarks."""
        try:
            points = []
            for idx in indices:
                lm = landmarks.landmark[idx]
                points.append((lm.x, lm.y))
            
            # Vertical distances
            v1 = np.sqrt((points[1][0]-points[5][0])**2 + (points[1][1]-points[5][1])**2)
            v2 = np.sqrt((points[2][0]-points[4][0])**2 + (points[2][1]-points[4][1])**2)
            # Horizontal distance
            h = np.sqrt((points[0][0]-points[3][0])**2 + (points[0][1]-points[3][1])**2)
            
            if h == 0:
                return 0.3
            return (v1 + v2) / (2.0 * h)
        except Exception:
            return 0.3

    def _check_movement(self, frame: np.ndarray, session: Dict) -> bool:
        """Check for natural micro-movements."""
        if self.face_mesh is None:
            return True
        
        try:
            import cv2
            rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            results = self.face_mesh.process(rgb_frame)
            
            if not results.multi_face_landmarks:
                return False
            
            # Track nose position for head movement
            nose = results.multi_face_landmarks[0].landmark[1]
            current_pos = (nose.x, nose.y)
            session["position_history"].append(current_pos)
            
            if len(session["position_history"]) >= 10:
                positions = list(session["position_history"])
                # Calculate movement variance
                xs = [p[0] for p in positions[-10:]]
                ys = [p[1] for p in positions[-10:]]
                variance = np.var(xs) + np.var(ys)
                
                # Live person should have some movement (not perfectly still)
                if variance > 0.00001:  # Micro-movements detected
                    session["movement_detected"] = True
            
            return session["movement_detected"]
        except Exception:
            return True

    def _check_texture(self, frame: np.ndarray) -> bool:
        """Texture analysis to differentiate real face from flat image.
        
        Real faces have more high-frequency texture detail than printed photos
        or screen displays.
        """
        try:
            import cv2
            
            # Convert to grayscale
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            
            # Apply Laplacian for high-frequency detail
            laplacian = cv2.Laplacian(gray, cv2.CV_64F)
            variance = laplacian.var()
            
            # Real faces typically have higher texture variance than flat images
            # This is a simple heuristic - in production, use a trained model
            return variance > 50  # Threshold for "real" texture
        except Exception:
            return True  # Fail open

    def cleanup_session(self, session_token: str):
        """Clean up session data."""
        if session_token in self.session_data:
            del self.session_data[session_token]
