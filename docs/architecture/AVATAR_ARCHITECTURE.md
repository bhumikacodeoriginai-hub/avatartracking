# Avatar Architecture

## Overview

The AI Avatar is a 3D rendered character displayed on the reception kiosk. It provides a human-like conversational interface with realistic animations, lip synchronization, and natural behavior.

## Technology Stack

- **Rendering**: Three.js with WebGL
- **3D Model**: Ready Player Me / Custom GLTF model
- **Animation**: Mixamo animations + custom blend shapes
- **Lip Sync**: Viseme-based lip synchronization
- **Voice**: Web Speech API + cloud TTS (ElevenLabs/Azure)

## Avatar States

```
┌─────────────────────────────────────────────────────────┐
│                   AVATAR STATE MACHINE                    │
│                                                          │
│  ┌──────┐  person    ┌──────────┐  name     ┌────────┐ │
│  │ IDLE │──detected──►│ GREETING │──received─►│CONVERS-│ │
│  │      │◄──timeout──│          │           │ ATION  │ │
│  └──────┘            └──────────┘           └────┬───┘ │
│     ▲                                            │      │
│     │                ┌──────────┐                │      │
│     │◄───timeout─────│ GOODBYE  │◄───farewell───┘      │
│     │                └──────────┘                       │
│     │                                                    │
│     │    ┌──────────┐  ┌──────────┐                     │
│     ├────│ THINKING │  │ LISTENING│                      │
│     │    └──────────┘  └──────────┘                     │
│     │    ┌──────────┐                                    │
│     └────│  ERROR   │                                    │
│          └──────────┘                                    │
└─────────────────────────────────────────────────────────┘
```

## Animations

| State | Animation | Description |
|-------|-----------|-------------|
| Idle | idle_breathing | Subtle breathing, occasional blink, slight sway |
| Greeting | wave_greeting | Smile, slight wave, eye contact |
| Listening | listening_nod | Occasional nods, attentive expression |
| Thinking | thinking_look | Slight head tilt, processing indicator |
| Speaking | lip_sync + gestures | Lip sync with natural hand gestures |
| Goodbye | wave_goodbye | Friendly wave, smile |
| Error | apologetic | Slight frown, apologetic gesture |

## Lip Synchronization

### Viseme Pipeline
```
TTS Audio → Phoneme Analysis → Viseme Mapping → 
Blend Shape Animation → Real-time Rendering
```

### Viseme Set (15 visemes)
```
sil  - Silence (mouth closed)
PP   - p, b, m
FF   - f, v
TH   - th
DD   - t, d, n
kk   - k, g
CH   - ch, j, sh
SS   - s, z
nn   - n, l
RR   - r
AA   - a
E    - e
I    - i
O    - o
U    - u
```

## Voice System

### Input Pipeline
```
Microphone → VAD (Voice Activity Detection) → 
Noise Suppression → STT Engine → Text
```

### Output Pipeline
```
AI Response Text → TTS Engine → Audio Buffer → 
Phoneme Extraction → Viseme Mapping → 
Simultaneous: Audio Playback + Lip Animation
```

### Voice Characteristics
- Professional, warm tone
- Natural pacing with pauses
- Configurable voice (male/female)
- Multi-language voice switching
- Appropriate emphasis and intonation

## Display Layout

```
┌─────────────────────────────────────────┐
│                                          │
│     ┌────────────────────────────┐      │
│     │                            │      │
│     │      3D AVATAR             │      │
│     │      (Upper body)          │      │
│     │                            │      │
│     └────────────────────────────┘      │
│                                          │
│     ┌────────────────────────────┐      │
│     │  Status / Captions         │      │
│     │  "How can I help you?"     │      │
│     └────────────────────────────┘      │
│                                          │
│     ┌──────┐  ┌──────┐  ┌──────┐       │
│     │ QR   │  │Touch │  │ Info │       │
│     │ Code │  │Regist│  │      │       │
│     └──────┘  └──────┘  └──────┘       │
│                                          │
│  ┌──────────────────────────────────┐   │
│  │    Company Logo + Welcome Text    │   │
│  └──────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

## Accessibility Features

- Large, readable captions
- High contrast mode
- Adjustable speech speed
- Visual indicators for hearing-impaired
- Touch interface alternative
- Keyboard navigation support
