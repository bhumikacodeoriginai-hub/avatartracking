# How to Set Up Your Real Human Avatar

## Quick Setup (Image Only)
Save a high-quality headshot photo of a REAL person as:
```
frontend/public/avatar.png
```
The system will display this image with animated glow/pulse effects.

## Best Setup (Video Avatar - Looks like person is ACTUALLY talking)

### Option A: Record yourself or an actor
1. Record a video of the person talking (15-30 seconds, looped)
   - Good lighting, neutral background
   - Camera at eye level, head/shoulders visible
   - Person should be speaking naturally
2. Record a second video of them idle (smiling, slight movement, 5-10 seconds)
3. Save as:
   - `frontend/public/avatar-speaking.mp4` (talking video)
   - `frontend/public/avatar-idle.mp4` (idle/smiling video)
   - `frontend/public/avatar.png` (still photo fallback)

### Option B: Use AI video generation (MOST REALISTIC)
Use one of these services to generate a realistic talking-head video:

1. **D-ID** (https://www.d-id.com) - Upload a photo, it generates talking video
2. **HeyGen** (https://www.heygen.com) - AI avatar that speaks any text
3. **Synthesia** (https://www.synthesia.io) - Professional AI presenters
4. **Colossyan** (https://www.colossyan.com) - Corporate AI avatars

Steps:
1. Choose a professional-looking avatar/presenter
2. Generate a 15-30 second talking video
3. Generate a 5-10 second idle/smiling video
4. Download and save to the paths above

### Option C: Use the CodeOrigin.ai image
Save the futuristic AI woman image as `frontend/public/avatar.png`
The system will add animated effects to make it appear alive.

## File Locations
```
frontend/public/
├── avatar.png              ← Required: Main still image
├── avatar-speaking.mp4     ← Optional: Video of person speaking
├── avatar-idle.mp4         ← Optional: Video of person idle/smiling
└── AVATAR_SETUP.md         ← This file
```

## Notes
- Videos should be cropped to show head + shoulders (portrait style)
- Recommended resolution: 512x512 or higher
- MP4 format with H.264 codec
- Keep videos short (they loop)
- The system auto-detects if videos exist and falls back to image
