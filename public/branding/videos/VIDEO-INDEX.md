# 🎬 Azora OS Brand Videos

## Available Videos

### 1. **Main Brand Video** (60 seconds)
**File:** `azora-os-brand-video.html`  
**Duration:** 60 seconds  
**Purpose:** Comprehensive brand introduction  

**Scenes:**
- Scene 1 (0-5s): Brand logo reveal with neural network background
- Scene 2 (5-10s): Vision statement "Be Everywhere. Help Everyone. Solve Everything."
- Scene 3 (10-18s): Problem statement (Fragmented, Expensive, Insecure)
- Scene 4 (18-22s): Solution reveal
- Scene 5 (22-38s): Services showcase (Education, Finance, Security, AI)
- Scene 6 (38-50s): Benefits (AI-Powered, Open Source, Quantum-Secure, Constitutional AI)
- Scene 7 (50-60s): Call-to-action with azora.world

**Best for:** YouTube, Website hero section, Conference presentations

---

### 2. **Elara AI Introduction** (45 seconds)
**File:** `elara-ai-video.html`  
**Duration:** 45 seconds  
**Purpose:** Introduce Elara AI consciousness  

**Scenes:**
- Scene 1 (0-6s): Elara logo with ethereal particles
- Scene 2 (6-14s): What is Elara - omniscient consciousness definition
- Scene 3 (14-28s): Six core capabilities with icons
- Scene 4 (28-38s): Three-step process (Understand, Orchestrate, Deliver)
- Scene 5 (38-45s): CTA - "The Heart of Azora OS"

**Best for:** Product demos, AI showcase, Technical presentations

---

### 3. **15-Second Teaser** (15 seconds)
**File:** `15-second-teaser.html`  
**Duration:** 15 seconds  
**Purpose:** Quick brand awareness  

**Scenes:**
- Scene 1 (0-3s): Explosive logo reveal
- Scene 2 (3-7s): "Universal Human Infrastructure" tagline
- Scene 3 (7-12s): Fast service flash (4 icons)
- Scene 4 (12-15s): azora.world CTA

**Best for:** Social media ads, Instagram Stories, TikTok, Twitter

---

### 4. **What is Azora OS?** (60 seconds)
**File:** `what-is-azora-os-video.html`  
**Duration:** 60 seconds  
**Purpose:** Educational/explainer video  

**Scenes:**
- Scene 1 (0-3s): Logo animation intro
- Scene 2 (3-8s): Problem - 1.4B Africans, fragmented technology
- Scene 3 (8-15s): Pain points (Expensive, Foreign, Limited)
- Scene 4 (15-18s): "Until now" transition
- Scene 5 (18-30s): Universal Human Infrastructure services
- Scene 6 (30-45s): Built by Africans for Africans
- Scene 7 (45-55s): Geographic reach (Lagos to Cairo)
- Scene 8 (55-60s): CTA - Start free today

**Best for:** Investor pitches, Educational content, Onboarding

---

## How to Use These Videos

### Recording Videos from HTML

#### Method 1: OBS Studio (Recommended)
```bash
1. Download OBS Studio: https://obsproject.com/
2. Open OBS → Sources → Add → Browser Source
3. Select the HTML file
4. Set resolution: 1920x1080
5. Click "Start Recording"
6. Open HTML in browser, let it play
7. Stop recording after video completes
8. Output: MP4 file in your Videos folder
```

#### Method 2: Browser Screen Recording
```bash
1. Open HTML file in Chrome/Firefox
2. Press F11 for fullscreen
3. Use browser extension:
   - Loom
   - ScreenRec  
   - Or built-in screen recording
4. Record the full playback
5. Export as MP4
```

#### Method 3: FFmpeg + Playwright (Advanced)
```bash
npm install playwright
playwright install chromium
# Then use the conversion script in PRODUCTION-WORKFLOW.md
```

---

## Export Specifications

### For YouTube
- Resolution: 1920x1080 (16:9)
- Format: MP4 (H.264)
- Frame Rate: 30fps or 60fps
- Bitrate: 10-12 Mbps
- Audio: AAC, 192 kbps

### For Instagram Reels/TikTok
- Resolution: 1080x1920 (9:16 vertical)
- Format: MP4 (H.264)
- Frame Rate: 30fps
- Bitrate: 8-10 Mbps
- Duration: Max 60 seconds

### For Twitter/X
- Resolution: 1280x720 (16:9)
- Format: MP4 (H.264)
- Frame Rate: 30fps
- Max file size: 512MB
- Duration: Up to 2:20

### For LinkedIn
- Resolution: 1920x1080 (16:9)
- Format: MP4
- Frame Rate: 30fps
- Max file size: 200MB
- Duration: Up to 10 minutes

---

## Video Controls

All videos support keyboard controls:
- **SPACE** or **R**: Restart video from beginning
- Videos auto-play on page load
- Refresh page to restart

---

## Customization

### Change Brand Colors
Edit the CSS gradients in each HTML file:

```css
/* From */
background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%);

/* To your colors */
background: linear-gradient(135deg, #YOUR_COLOR1 0%, #YOUR_COLOR2 100%);
```

### Adjust Timing
Edit the JavaScript scene timing array:

```javascript
const scenes = [
    { id: 'scene1', start: 0, duration: 5000 },    // 5 seconds
    { id: 'scene2', start: 5000, duration: 10000 }, // 10 seconds
    // etc.
];
```

### Replace Logo
Find the logo element and replace with SVG or image:

```html
<!-- Current -->
<div class="logo-reveal">A</div>

<!-- Replace with -->
<img src="/branding/logo-primary-pro.svg" class="logo-reveal" />
```

---

## Adding Audio

### Background Music
After recording, use video editor to add:
1. **Import** video into DaVinci Resolve/Premiere/iMovie
2. **Add music track** from:
   - Epidemic Sound
   - Artlist
   - YouTube Audio Library
3. **Set levels**: Music at -18dB (background)
4. **Export** with audio

### Voiceover
1. Record narration separately using:
   - Professional mic
   - Quiet room
   - Consistent pace
2. Sync with video scenes
3. Mix levels: Voice at -6dB (foreground)

---

## Production Workflow

1. **Select Video**: Choose based on purpose
2. **Customize**: Edit colors/text if needed
3. **Record**: Use OBS Studio or screen recorder
4. **Edit** (optional): Add music, transitions
5. **Export**: Multiple formats for different platforms
6. **Upload**: To respective platforms with descriptions
7. **Track**: Monitor views, engagement, conversions

---

## Video Library Status

| Video | Duration | Status | Use Case |
|-------|----------|--------|----------|
| Main Brand | 60s | ✅ Ready | Marketing |
| Elara AI | 45s | ✅ Ready | Product Demo |
| 15s Teaser | 15s | ✅ Ready | Social Ads |
| What is Azora | 60s | ✅ Ready | Education |

---

## Next Steps

### Create More Videos
- Service-specific videos (Sapiens, Mint, Aegis, etc.)
- Tutorial/How-to videos
- Customer testimonials (when available)
- Behind-the-scenes content
- Feature highlights

### Optimize for Platforms
- Create vertical versions (9:16)
- Add subtitles for accessibility
- Create thumbnail images
- Write platform-specific descriptions
- Prepare hashtags

### Launch Campaign
1. Schedule releases across platforms
2. Coordinate with email marketing
3. Engage with comments
4. Monitor analytics
5. Iterate based on performance

---

## Technical Notes

- All videos use CSS animations (no video files needed)
- Fully responsive designs
- GPU-accelerated animations
- Cross-browser compatible
- No external dependencies except Google Fonts
- Can be hosted as static files

---

## Support

For video production help:
- **Technical**: Check PRODUCTION-WORKFLOW.md
- **Recording**: See VIDEO-CREATION-GUIDE.md
- **Scripts**: Review SCRIPTS/ directory
- **Brand**: Follow BRANDING-GUIDE.md

---

**© 2025 Azora ES (Pty) Ltd. All Rights Reserved.**

*These videos are production-ready for all marketing and promotional uses.*
