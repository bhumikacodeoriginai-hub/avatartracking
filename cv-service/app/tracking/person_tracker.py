"""Person tracking with session management."""

import time
import uuid
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass, field
from collections import defaultdict
import numpy as np
import structlog

from app.detection.person_detector import Detection

logger = structlog.get_logger()


@dataclass
class TrackedPerson:
    """A tracked person with session state."""
    track_id: int
    first_seen: float
    last_seen: float
    detection_count: int = 0
    is_stable: bool = False
    session_token: Optional[str] = None
    session_active: bool = False
    is_approaching: bool = False
    has_been_greeted: bool = False
    last_center: Tuple[float, float] = (0.5, 0.5)
    movement_history: List[Tuple[float, float]] = field(default_factory=list)
    static_frame_count: int = 0
    
    def update(self, detection: Detection):
        """Update track with new detection."""
        self.last_seen = detection.frame_timestamp
        self.detection_count += 1
        
        # Track movement
        old_center = self.last_center
        self.last_center = detection.center
        self.movement_history.append(detection.center)
        if len(self.movement_history) > 30:
            self.movement_history.pop(0)
        
        # Check if static (potential poster/photo)
        movement = np.sqrt(
            (detection.center[0] - old_center[0])**2 +
            (detection.center[1] - old_center[1])**2
        )
        if movement < 0.005:  # Very little movement
            self.static_frame_count += 1
        else:
            self.static_frame_count = 0


class PersonTracker:
    """Tracks persons across frames and manages interaction sessions."""

    def __init__(self, config):
        self.config = config
        self.tracks: Dict[int, TrackedPerson] = {}
        self.next_track_id = 1
        self.frame_count = 0
        
    def update(self, detections: List[Detection]) -> List[TrackedPerson]:
        """Update tracks with new detections.
        
        Uses simple IoU-based tracking for reliability.
        """
        self.frame_count += 1
        current_time = time.time()
        
        # Match detections to existing tracks
        matched, unmatched_detections, lost_tracks = self._match_tracks(detections)
        
        # Update matched tracks
        for track_id, detection in matched:
            self.tracks[track_id].update(detection)
            
            # Check if detection is now stable
            track = self.tracks[track_id]
            duration = current_time - track.first_seen
            if duration >= self.config.STABLE_DETECTION_SECONDS and track.detection_count >= 10:
                track.is_stable = True
            
            # Check if person is approaching (getting larger in frame)
            if len(track.movement_history) >= 10:
                earlier_y = track.movement_history[-10][1]
                current_y = track.movement_history[-1][1]
                if current_y > earlier_y + 0.02:  # Moving down = approaching camera
                    track.is_approaching = True
        
        # Create new tracks for unmatched detections
        for detection in unmatched_detections:
            track = TrackedPerson(
                track_id=self.next_track_id,
                first_seen=current_time,
                last_seen=current_time,
                detection_count=1,
                last_center=detection.center,
            )
            self.tracks[self.next_track_id] = track
            self.next_track_id += 1
        
        # Handle lost tracks
        for track_id in lost_tracks:
            track = self.tracks[track_id]
            frames_missing = (current_time - track.last_seen) * self.config.CAMERA_FPS
            if frames_missing > self.config.DEPARTURE_FRAMES:
                # Person has left
                if track.session_active:
                    track.session_active = False
                del self.tracks[track_id]
        
        # Return stable tracks
        return [t for t in self.tracks.values() if t.is_stable]

    def start_session(self, track_id: int) -> Optional[str]:
        """Start a session for a tracked person."""
        if track_id not in self.tracks:
            return None
        
        track = self.tracks[track_id]
        if track.session_active:
            return track.session_token
        
        # Check if person might be a static object (poster, etc.)
        if track.static_frame_count > self.config.MAX_STATIC_FRAMES:
            logger.info("Skipping session for static detection", 
                       track_id=track_id, static_frames=track.static_frame_count)
            return None
        
        session_token = str(uuid.uuid4())
        track.session_token = session_token
        track.session_active = True
        
        logger.info("Session started", track_id=track_id, session_token=session_token)
        return session_token

    def end_session(self, track_id: int) -> Optional[str]:
        """End session for a tracked person."""
        if track_id not in self.tracks:
            return None
        
        track = self.tracks[track_id]
        session_token = track.session_token
        track.session_active = False
        track.session_token = None
        
        return session_token

    def get_active_sessions(self) -> List[TrackedPerson]:
        """Get all persons with active sessions."""
        return [t for t in self.tracks.values() if t.session_active]

    def _match_tracks(self, detections: List[Detection]):
        """Match detections to existing tracks using IoU."""
        matched = []
        unmatched_detections = list(range(len(detections)))
        lost_tracks = []
        
        if not self.tracks or not detections:
            return matched, detections, list(self.tracks.keys())
        
        # Calculate IoU between all tracks and detections
        track_ids = list(self.tracks.keys())
        
        for t_idx, track_id in enumerate(track_ids):
            track = self.tracks[track_id]
            best_iou = 0
            best_det_idx = -1
            
            for d_idx in unmatched_detections:
                det = detections[d_idx]
                # Simple distance-based matching
                distance = np.sqrt(
                    (track.last_center[0] - det.center[0])**2 +
                    (track.last_center[1] - det.center[1])**2
                )
                # Convert distance to similarity score
                similarity = max(0, 1 - distance * 3)
                
                if similarity > best_iou and similarity > 0.3:
                    best_iou = similarity
                    best_det_idx = d_idx
            
            if best_det_idx >= 0:
                matched.append((track_id, detections[best_det_idx]))
                unmatched_detections.remove(best_det_idx)
            else:
                lost_tracks.append(track_id)
        
        remaining_detections = [detections[i] for i in unmatched_detections]
        return matched, remaining_detections, lost_tracks
