# Computer Vision Architecture

## Overview

The Computer Vision (CV) service runs at the edge (on the reception device) to minimize latency and avoid transmitting raw video to the cloud. It handles person detection, tracking, liveness detection, and (for enrolled users) identity verification.

## Pipeline Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                    CV SERVICE (EDGE)                               │
│                                                                    │
│  ┌────────────┐                                                   │
│  │   CAMERA   │                                                   │
│  └─────┬──────┘                                                   │
│        │ frames (30fps)                                           │
│        ▼                                                          │
│  ┌─────────────────┐                                              │
│  │ FRAME PROCESSOR │ ← Resize, normalize                         │
│  └────────┬────────┘                                              │
│           │                                                        │
│           ▼                                                        │
│  ┌─────────────────────────────────────────────────┐              │
│  │          PERSON DETECTOR (YOLOv8)                │              │
│  │                                                   │              │
│  │  Detects:              Ignores:                   │              │
│  │  ✓ Standing person     ✗ Chairs                   │              │
│  │  ✓ Walking person      ✗ Tables                   │              │
│  │  ✓ Sitting person      ✗ Bags/Laptops             │              │
│  │                        ✗ Posters/Photos           │              │
│  │                        ✗ TV screens               │              │
│  │                        ✗ Reflections              │              │
│  │                        ✗ Animals                  │              │
│  │                        ✗ Mannequins               │              │
│  └────────────┬────────────────────────────────────┘              │
│               │ detections (class=person, conf > threshold)        │
│               ▼                                                    │
│  ┌─────────────────────────────────────────────────┐              │
│  │        CONFIDENCE FILTER                         │              │
│  │  - PERSON_CONFIDENCE_THRESHOLD = 0.75           │              │
│  │  - Filter non-person classes                     │              │
│  │  - Size validation (too small = far away)        │              │
│  │  - Position validation                           │              │
│  └────────────┬────────────────────────────────────┘              │
│               │                                                    │
│               ▼                                                    │
│  ┌─────────────────────────────────────────────────┐              │
│  │        TEMPORAL VALIDATOR                        │              │
│  │  - Require detection across N consecutive frames│              │
│  │  - STABLE_DETECTION_FRAMES = 30 (1 sec @30fps) │              │
│  │  - Prevents false triggers from transients       │              │
│  └────────────┬────────────────────────────────────┘              │
│               │                                                    │
│               ▼                                                    │
│  ┌─────────────────────────────────────────────────┐              │
│  │        PERSON TRACKER (DeepSORT/ByteTrack)      │              │
│  │  - Assign tracking IDs                           │              │
│  │  - Track movement across frames                  │              │
│  │  - Detect approach/departure                     │              │
│  │  - Prevent duplicate greetings                   │              │
│  └────────────┬────────────────────────────────────┘              │
│               │                                                    │
│               ▼                                                    │
│  ┌─────────────────────────────────────────────────┐              │
│  │        LIVENESS DETECTOR                         │              │
│  │  - Blink detection                               │              │
│  │  - Head movement analysis                        │              │
│  │  - Texture analysis (2D vs 3D)                   │              │
│  │  - Depth estimation (if stereo camera)           │              │
│  │  - Rejects: photos, screens, videos             │              │
│  └────────────┬────────────────────────────────────┘              │
│               │                                                    │
│               ▼                                                    │
│  ┌─────────────────────────────────────────────────┐              │
│  │     SESSION MANAGER                              │              │
│  │  - Create visitor_session_id                     │              │
│  │  - Track session state                           │              │
│  │  - Detect session end (person leaves)            │              │
│  │  - Notify backend via API                        │              │
│  └─────────────────────────────────────────────────┘              │
│                                                                    │
└──────────────────────────────────────────────────────────────────┘
```

## Detection Configuration

```python
class DetectionConfig:
    # Person detection
    PERSON_CONFIDENCE_THRESHOLD = 0.75
    PERSON_CLASS_ID = 0  # COCO class for person
    
    # Temporal validation
    STABLE_DETECTION_SECONDS = 1.5  # Person must be present for 1.5s
    STABLE_DETECTION_FRAMES = 45   # At 30fps
    
    # Tracking
    MAX_TRACK_AGE = 90   # Frames before track is deleted
    MIN_TRACK_HITS = 3   # Minimum detections to create track
    IOU_THRESHOLD = 0.3  # IoU for track association
    
    # Session management
    SESSION_TIMEOUT_SECONDS = 300   # 5 min inactivity
    APPROACH_DISTANCE_THRESHOLD = 0.4  # Relative to frame size
    DEPARTURE_FRAMES = 90   # Frames person absent before session ends
    
    # Liveness
    LIVENESS_CONFIDENCE_THRESHOLD = 0.8
    BLINK_DETECTION_WINDOW = 60  # Frames to detect a blink
    
    # Camera
    CAMERA_FPS = 30
    FRAME_WIDTH = 1280
    FRAME_HEIGHT = 720
    DETECTION_INTERVAL_MS = 100  # Run detection every 100ms (10fps effective)
```

## Anti-False-Positive Measures

### Object Discrimination
1. **YOLO class filtering**: Only class 0 (person) passes
2. **Size validation**: Detection box must be reasonable size
3. **Aspect ratio**: Human proportions expected
4. **Context**: Ignore detections that don't move for extended periods (might be poster)

### Environmental Robustness
1. **Lighting adaptation**: Auto-exposure handling
2. **Reflection filtering**: Ignore detections near reflective surfaces (configurable zones)
3. **Screen detection**: Filter detections that appear within known screen areas
4. **Temporal consistency**: No action on single-frame detections

### Liveness Checks
1. **Blink detection**: Real humans blink
2. **Micro-movements**: Subtle movement analysis
3. **Depth cues**: Monocular depth estimation
4. **Texture analysis**: Differentiate flat images from 3D faces

## Multi-Person Handling

```
Frame Analysis:
├── Person A (track_id: 1, approaching, session: active)
├── Person B (track_id: 2, standing, session: waiting)
└── Person C (track_id: 3, departing, session: closing)

Priority:
1. Active session has priority
2. Queue others with "Please wait" message
3. Track each person independently
```

## Edge-to-Cloud Communication

```
CV Service (Edge) ─── HTTPS/WebSocket ───► Backend API (Cloud)

Events sent to cloud:
- person_detected: {track_id, confidence, timestamp}
- session_started: {session_id, track_id, timestamp}
- person_approaching: {session_id, distance_estimate}
- liveness_confirmed: {session_id, confidence}
- person_departed: {session_id, timestamp}
- session_ended: {session_id, duration, reason}

NO raw video/images sent to cloud by default.
```

## Privacy Considerations

- Raw video never leaves the device
- Person detection uses generic model (no face encoding by default)
- Identity matching only triggered for enrolled users
- Liveness detection uses local processing
- Only metadata events sent to cloud
- Configurable privacy zones in frame
