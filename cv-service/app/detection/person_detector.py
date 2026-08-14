"""Person Detection using YOLOv8."""

import time
import numpy as np
from typing import List, Dict, Optional, Tuple
from dataclasses import dataclass, field
import structlog

logger = structlog.get_logger()


@dataclass
class Detection:
    """A single person detection."""
    bbox: Tuple[float, float, float, float]  # x1, y1, x2, y2 (normalized)
    confidence: float
    class_id: int
    frame_timestamp: float
    center: Tuple[float, float] = field(init=False)
    height_ratio: float = field(init=False)
    
    def __post_init__(self):
        x1, y1, x2, y2 = self.bbox
        self.center = ((x1 + x2) / 2, (y1 + y2) / 2)
        self.height_ratio = y2 - y1


class PersonDetector:
    """YOLOv8-based person detector with anti-false-positive measures."""

    def __init__(self, config):
        self.config = config
        self.model = None
        self._load_model()

    def _load_model(self):
        """Load YOLOv8 model."""
        try:
            from ultralytics import YOLO
            self.model = YOLO(self.config.YOLO_MODEL)
            logger.info("YOLOv8 model loaded", model=self.config.YOLO_MODEL)
        except Exception as e:
            logger.error("Failed to load YOLO model", error=str(e))
            self.model = None

    def detect(self, frame: np.ndarray) -> List[Detection]:
        """Detect persons in a frame.
        
        Args:
            frame: BGR image as numpy array (H, W, 3)
            
        Returns:
            List of person detections that pass all filters
        """
        if self.model is None:
            return []
        
        timestamp = time.time()
        frame_h, frame_w = frame.shape[:2]
        
        # Run YOLO inference
        results = self.model(frame, verbose=False, conf=0.5)
        
        detections = []
        
        for result in results:
            boxes = result.boxes
            if boxes is None:
                continue
            
            for i in range(len(boxes)):
                cls_id = int(boxes.cls[i].item())
                conf = float(boxes.conf[i].item())
                
                # Only person class
                if cls_id != self.config.PERSON_CLASS_ID:
                    continue
                
                # Confidence threshold
                if conf < self.config.PERSON_CONFIDENCE_THRESHOLD:
                    continue
                
                # Get normalized bounding box
                x1, y1, x2, y2 = boxes.xyxyn[i].tolist()
                
                detection = Detection(
                    bbox=(x1, y1, x2, y2),
                    confidence=conf,
                    class_id=cls_id,
                    frame_timestamp=timestamp,
                )
                
                # Apply anti-false-positive filters
                if self._validate_detection(detection):
                    detections.append(detection)
        
        return detections

    def _validate_detection(self, detection: Detection) -> bool:
        """Apply anti-false-positive validation rules."""
        
        # 1. Size validation - person must be reasonable size
        if detection.height_ratio < self.config.MIN_PERSON_HEIGHT_RATIO:
            return False  # Too small, probably far away or not a person
        
        # 2. Aspect ratio check - humans are roughly 1:2 to 1:3 width:height
        x1, y1, x2, y2 = detection.bbox
        width = x2 - x1
        height = y2 - y1
        if height > 0:
            aspect_ratio = width / height
            if aspect_ratio > 1.5 or aspect_ratio < 0.15:
                return False  # Unusual proportions for a person
        
        # 3. Ignore zone check
        center_x, center_y = detection.center
        for zone in self.config.IGNORE_ZONES:
            zx1, zy1, zx2, zy2 = zone
            if zx1 <= center_x <= zx2 and zy1 <= center_y <= zy2:
                return False  # Detection in ignore zone (TV/poster area)
        
        return True
