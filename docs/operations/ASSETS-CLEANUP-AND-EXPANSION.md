# 🎨 AZORA ASSETS - CLEANUP & EXPANSION PLAN

**Date:** 2025-11-05  
**Status:** Asset Management Overhaul  

---

## 📊 CURRENT STATE ANALYSIS

### ✅ **What We Have** (in `/public/branding/`)

#### Existing Service Logos:
- ✅ azora-mint-logo.svg
- ✅ azora-forge-logo.svg
- ✅ azora-nexus-logo.svg
- ✅ azora-sapiens-logo.svg
- ✅ azora-education-logo.svg
- ✅ azora-aegis-logo.svg
- ✅ azora-covenant-logo.svg
- ✅ azora-oracle-logo.svg
- ✅ azora-pay-logo.svg
- ✅ azora-workspace-logo.svg
- ✅ azora-scriptorium-logo.svg
- ✅ azora-synapse-logo.svg
- ✅ elara-*.svg (7 Elara logos)

#### Core Branding:
- ✅ logo-primary.svg
- ✅ logo-primary-pro.svg
- ✅ logo-white.svg
- ✅ logo-black.svg
- ✅ icon-square.svg
- ✅ icon-app-premium.svg

#### Marketing Assets:
- ✅ Social media templates (Twitter, LinkedIn, YouTube)
- ✅ Email templates
- ✅ Presentation backgrounds
- ✅ Posters
- ✅ Animated logos

---

## ❌ **What's MISSING** (NEW Services Built Today!)

### Missing Service Logos:
- ❌ azora-careers-logo.svg (Job board, freelance marketplace)
- ❌ azora-innovation-hub-logo.svg (Startup incubator)
- ❌ azora-community-logo.svg (Professional social network)
- ❌ azora-student-life-logo.svg (Societies & clubs)
- ❌ azora-erp-logo.svg (Student Information System)
- ❌ azora-library-logo.svg (Digital library)
- ❌ azora-research-center-logo.svg (Research & curriculum)
- ❌ azora-corporate-learning-logo.svg (B2B training)
- ❌ azora-classroom-logo.svg (Live lectures)
- ❌ azora-support-logo.svg (Helpdesk)
- ❌ azora-payments-logo.svg (Billing system)
- ❌ azora-academic-integrity-logo.svg (Anti-plagiarism)
- ❌ azora-credentials-logo.svg (Digital certificates)
- ❌ azora-integration-logo.svg (Marketplace connector)

### Missing Mint-Mine Assets:
- ❌ mint-mine-engine-logo.svg
- ❌ mint-mine-icon.svg
- ❌ mining-status-icons/ (active, paused, earning, etc.)
- ❌ algorithm-icons/ (ERG, IRON, KAS, XMR, AZR)
- ❌ power-mode-icons/ (stealth, balanced, turbo, beast)

### Missing Favicons:
- ❌ Proper favicon.ico (16x16, 32x32, 48x48)
- ❌ apple-touch-icon.png (180x180)
- ❌ android-chrome icons (192x192, 512x512)
- ❌ safari-pinned-tab.svg
- ❌ Proper manifest.json

---

## 🗑️ **What to DELETE** (Duplicates & Unused)

### Duplicate Favicons (13 files!):
```
❌ /services/azora-onboarding/public/favicon.ico
❌ /services/azora-onboarding/public/favicon.svg
❌ /marketplace-ui/public/favicon.svg
❌ /synapse/vigil-ui/public/favicon.svg
❌ /azora/azora-mint-mine-engine-next/public/favicon.svg
❌ /synapse/public/favicon.svg
❌ /synapse/frontend/public/favicon.svg
❌ /pay-ui/public/favicon.svg
❌ /synapse/academy-ui/public/favicon.svg
❌ /app/favicon.ico
❌ /app/favicon.svg
❌ /elara-ide/public/favicon.svg

✅ KEEP ONLY: /public/favicon.svg (master)
```

### Duplicate Assets:
```
❌ /public/azora-dark.png (use SVG instead)
❌ /public/azora-light.png (use SVG instead)
❌ /public/icon.svg (duplicate of azora-favicon.svg)
❌ /branding/logos/azora-crown-logo.svg (old location)
```

### Unused Next.js Defaults:
```
❌ /azora/azora-mint-mine-engine-next/public/file.svg
❌ /azora/azora-mint-mine-engine-next/public/next.svg
❌ /azora/azora-mint-mine-engine-next/public/globe.svg
❌ /azora/azora-mint-mine-engine-next/public/vercel.svg
❌ /azora/azora-mint-mine-engine-next/public/window.svg
❌ /azora-mint-mine-engine-next/public/* (duplicates)
❌ /ingestion-ui/public/placeholder*.svg
```

---

## 🎨 **ASSET CREATION PLAN**

### **PHASE 1: New Service Logos** (Priority: CRITICAL)

Create SVG logos for all new services following existing style:

```svg
Style Guide:
- Size: 512x512px viewBox
- Colors: Primary brand colors
- Style: Flat, modern, minimalist
- Include service icon + "Azora [Service]" text
- Variations: Full color, monochrome white, monochrome black
```

#### 1. Azora Careers Logo
```svg
<!-- Icon: Briefcase + handshake -->
<!-- Colors: Blue (#0066FF) + Green (#00D084) -->
<!-- Tagline: "Your Path to Success" -->
```

#### 2. Azora Innovation Hub Logo
```svg
<!-- Icon: Rocket + lightbulb -->
<!-- Colors: Orange (#FF6B35) + Purple (#8B5CF6) -->
<!-- Tagline: "Build the Future" -->
```

#### 3. Azora Community Logo
```svg
<!-- Icon: Connected people network -->
<!-- Colors: Teal (#14B8A6) + Pink (#EC4899) -->
<!-- Tagline: "Connect. Grow. Succeed." -->
```

#### 4. Azora Student Life Logo
```svg
<!-- Icon: Group of people + celebration -->
<!-- Colors: Yellow (#FBBF24) + Red (#EF4444) -->
<!-- Tagline: "Beyond the Classroom" -->
```

#### 5. Azora ERP Logo
```svg
<!-- Icon: Dashboard/chart -->
<!-- Colors: Indigo (#6366F1) + Gray (#6B7280) -->
<!-- Tagline: "Manage Everything" -->
```

#### 6. Azora Library Logo
```svg
<!-- Icon: Open book + digital elements -->
<!-- Colors: Brown (#92400E) + Blue (#3B82F6) -->
<!-- Tagline: "Knowledge at Your Fingertips" -->
```

#### 7. Azora Research Center Logo
```svg
<!-- Icon: Microscope + atom -->
<!-- Colors: Purple (#7C3AED) + Cyan (#06B6D4) -->
<!-- Tagline: "Discover Tomorrow" -->
```

#### 8. Azora Classroom Logo
```svg
<!-- Icon: Video screen + people -->
<!-- Colors: Green (#10B981) + Blue (#3B82F6) -->
<!-- Tagline: "Learn Together, Anywhere" -->
```

#### 9. Mint-Mine Engine Logo
```svg
<!-- Icon: Pickaxe + coin -->
<!-- Colors: Gold (#F59E0B) + Silver (#94A3B8) -->
<!-- Tagline: "Earn While You Learn" -->
```

---

### **PHASE 2: Favicon System** (Priority: HIGH)

Create comprehensive favicon package:

```
/public/favicons/
├── favicon.ico (multi-size: 16x16, 32x32, 48x48)
├── favicon.svg (vector, any size)
├── apple-touch-icon.png (180x180)
├── android-chrome-192x192.png
├── android-chrome-512x512.png
├── safari-pinned-tab.svg (monochrome)
├── mstile-150x150.png (Windows)
├── browserconfig.xml (Windows)
└── site.webmanifest (PWA)
```

Update HTML head in all apps:
```html
<link rel="icon" type="image/svg+xml" href="/favicons/favicon.svg">
<link rel="icon" type="image/png" sizes="32x32" href="/favicons/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/favicons/favicon-16x16.png">
<link rel="apple-touch-icon" sizes="180x180" href="/favicons/apple-touch-icon.png">
<link rel="manifest" href="/favicons/site.webmanifest">
<link rel="mask-icon" href="/favicons/safari-pinned-tab.svg" color="#0066ff">
<meta name="msapplication-TileColor" content="#0066ff">
<meta name="theme-color" content="#ffffff">
```

---

### **PHASE 3: Mint-Mine Engine Assets** (Priority: HIGH)

#### Mining Status Icons (32x32px):
```
mining-active.svg (pickaxe animation)
mining-paused.svg (pause icon)
mining-earning.svg (coin + arrow up)
mining-idle.svg (pickaxe resting)
mining-error.svg (warning)
```

#### Algorithm Icons (48x48px):
```
algo-erg.svg (Ergo logo)
algo-iron.svg (IronFish logo)
algo-kas.svg (Kaspa logo)
algo-xmr.svg (Monero logo)
algo-azr.svg (AZR custom)
```

#### Power Mode Icons (64x64px):
```
mode-stealth.svg (ninja icon)
mode-balanced.svg (balance scale)
mode-turbo.svg (rocket)
mode-beast.svg (lightning bolt)
```

#### Learning Multiplier Badges (96x96px):
```
multiplier-1x.svg (base)
multiplier-2x.svg (bronze)
multiplier-3x.svg (silver)
multiplier-4x.svg (gold)
multiplier-5x.svg (platinum)
```

---

### **PHASE 4: UI Component Icons** (Priority: MEDIUM)

#### Education Icons:
```
course-icon.svg
assignment-icon.svg
grade-icon.svg
certificate-icon.svg
quiz-icon.svg
video-lecture-icon.svg
```

#### Career Icons:
```
job-icon.svg
freelance-icon.svg
resume-icon.svg
portfolio-icon.svg
interview-icon.svg
salary-icon.svg
```

#### Financial Icons:
```
wallet-icon.svg
transaction-icon.svg
loan-icon.svg
savings-icon.svg
investment-icon.svg
card-icon.svg
```

---

### **PHASE 5: Marketing Assets** (Priority: MEDIUM)

#### Social Media:
```
og-image.png (1200x630) - Open Graph for social sharing
twitter-card.png (1200x600)
linkedin-post.png (1200x627)
instagram-post.png (1080x1080)
facebook-cover.png (820x312)
```

#### App Store:
```
app-icon-ios.png (1024x1024)
app-icon-android.png (512x512)
screenshot-1.png (1242x2688) - iPhone
screenshot-2.png (1242x2688)
screenshot-3.png (1242x2688)
```

#### Email:
```
email-header-primary.svg (600x150)
email-footer.svg (600x100)
email-button.svg (200x50)
```

---

## 🗂️ **REORGANIZED ASSET STRUCTURE**

### **Proposed Structure:**

```
/public/
├── favicons/
│   ├── favicon.ico
│   ├── favicon.svg
│   ├── apple-touch-icon.png
│   ├── android-chrome-192x192.png
│   ├── android-chrome-512x512.png
│   ├── safari-pinned-tab.svg
│   ├── mstile-150x150.png
│   └── site.webmanifest
│
├── branding/
│   ├── logos/
│   │   ├── azora-primary.svg
│   │   ├── azora-white.svg
│   │   ├── azora-black.svg
│   │   └── azora-icon.svg
│   │
│   ├── services/
│   │   ├── education/
│   │   │   ├── sapiens-logo.svg
│   │   │   ├── lms-logo.svg
│   │   │   ├── classroom-logo.svg
│   │   │   ├── library-logo.svg
│   │   │   ├── research-logo.svg
│   │   │   └── student-life-logo.svg
│   │   │
│   │   ├── financial/
│   │   │   ├── mint-logo.svg
│   │   │   ├── mint-mine-logo.svg
│   │   │   ├── payments-logo.svg
│   │   │   └── pay-logo.svg
│   │   │
│   │   ├── career/
│   │   │   ├── careers-logo.svg
│   │   │   └── freelance-logo.svg
│   │   │
│   │   ├── innovation/
│   │   │   ├── innovation-hub-logo.svg
│   │   │   └── incubator-logo.svg
│   │   │
│   │   ├── community/
│   │   │   └── community-logo.svg
│   │   │
│   │   ├── marketplace/
│   │   │   ├── forge-logo.svg
│   │   │   └── nexus-logo.svg
│   │   │
│   │   ├── infrastructure/
│   │   │   ├── aegis-logo.svg
│   │   │   ├── covenant-logo.svg
│   │   │   ├── oracle-logo.svg
│   │   │   ├── synapse-logo.svg
│   │   │   ├── workspace-logo.svg
│   │   │   └── scriptorium-logo.svg
│   │   │
│   │   └── ai/
│   │       └── elara/
│   │           ├── elara-logo.svg
│   │           ├── elara-ide-logo.svg
│   │           ├── elara-mind-logo.svg
│   │           ├── elara-voice-logo.svg
│   │           ├── elara-vision-logo.svg
│   │           ├── elara-heart-logo.svg
│   │           └── elara-dreams-logo.svg
│   │
│   ├── icons/
│   │   ├── ui/
│   │   │   ├── education/
│   │   │   ├── career/
│   │   │   ├── financial/
│   │   │   └── general/
│   │   │
│   │   ├── mining/
│   │   │   ├── status/
│   │   │   ├── algorithms/
│   │   │   ├── power-modes/
│   │   │   └── multipliers/
│   │   │
│   │   └── social/
│   │       ├── linkedin.svg
│   │       ├── twitter.svg
│   │       ├── facebook.svg
│   │       └── youtube.svg
│   │
│   ├── marketing/
│   │   ├── social/
│   │   │   ├── og-image.png
│   │   │   ├── twitter-card.png
│   │   │   └── linkedin-banner.svg
│   │   │
│   │   ├── email/
│   │   │   ├── header.svg
│   │   │   └── footer.svg
│   │   │
│   │   └── app-store/
│   │       ├── ios-icon.png
│   │       └── android-icon.png
│   │
│   └── animations/
│       ├── logo-intro.svg
│       └── loading-spinner.svg
│
└── manifest.json (PWA config)
```

---

## 🔨 **IMPLEMENTATION SCRIPT**

### Cleanup Script:
```bash
#!/bin/bash

echo "🗑️ Cleaning up duplicate assets..."

# Remove duplicate favicons
rm -f services/azora-onboarding/public/favicon.*
rm -f marketplace-ui/public/favicon.svg
rm -f synapse/vigil-ui/public/favicon.svg
rm -f azora/azora-mint-mine-engine-next/public/favicon.svg
rm -f synapse/public/favicon.svg
rm -f synapse/frontend/public/favicon.svg
rm -f pay-ui/public/favicon.svg
rm -f synapse/academy-ui/public/favicon.svg
rm -f app/favicon.ico
rm -f app/favicon.svg
rm -f elara-ide/public/favicon.svg

# Remove duplicate assets
rm -f public/azora-dark.png
rm -f public/azora-light.png
rm -f public/icon.svg
rm -f branding/logos/azora-crown-logo.svg

# Remove Next.js defaults
rm -rf azora/azora-mint-mine-engine-next/public/*.svg
rm -rf azora-mint-mine-engine-next/public/*.svg
rm -f ingestion-ui/public/placeholder*.svg

echo "✅ Cleanup complete!"
```

### Symlink Script (link all favicons to master):
```bash
#!/bin/bash

echo "🔗 Creating favicon symlinks..."

# Create symlinks in all UI projects
ln -sf ../../../../public/favicons/favicon.svg services/azora-onboarding/public/favicon.svg
ln -sf ../../public/favicons/favicon.svg marketplace-ui/public/favicon.svg
ln -sf ../../public/favicons/favicon.svg synapse/vigil-ui/public/favicon.svg
ln -sf ../../../public/favicons/favicon.svg synapse/public/favicon.svg
ln -sf ../../public/favicons/favicon.svg pay-ui/public/favicon.svg
ln -sf ../public/favicons/favicon.svg app/favicon.svg
ln -sf ../../public/favicons/favicon.svg elara-ide/public/favicon.svg

echo "✅ Symlinks created!"
```

---

## 📋 **ASSET CHECKLIST**

### Immediate Actions:
- [ ] Create 14 new service logos
- [ ] Create Mint-Mine Engine branding (logo + icons)
- [ ] Generate complete favicon package
- [ ] Delete duplicate assets (13 favicons + 10 unused files)
- [ ] Reorganize asset structure
- [ ] Update all HTML files with proper favicon links
- [ ] Update manifest.json files
- [ ] Create symlinks for shared assets

### Nice to Have:
- [ ] Create mining status icons
- [ ] Create algorithm icons
- [ ] Create power mode icons
- [ ] Create multiplier badges
- [ ] Create UI component icons
- [ ] Generate social media assets
- [ ] Create app store assets
- [ ] Update email templates

---

## 🎨 **DESIGN SYSTEM**

### Color Palette:
```css
:root {
  /* Primary */
  --azora-blue: #0066FF;
  --azora-dark: #0A0E27;
  --azora-light: #F8FAFC;
  
  /* Services */
  --careers-color: #00D084; /* Green */
  --innovation-color: #FF6B35; /* Orange */
  --community-color: #14B8A6; /* Teal */
  --mint-color: #F59E0B; /* Gold */
  --education-color: #3B82F6; /* Blue */
  --forge-color: #8B5CF6; /* Purple */
  --nexus-color: #EC4899; /* Pink */
  
  /* Mining */
  --mining-active: #10B981; /* Green */
  --mining-paused: #F59E0B; /* Yellow */
  --mining-error: #EF4444; /* Red */
  --mining-idle: #6B7280; /* Gray */
}
```

### Logo Guidelines:
1. **Size:** 512x512px viewBox for SVG
2. **Padding:** 64px margin on all sides
3. **Colors:** Use brand colors from palette
4. **Typography:** Inter Bold for service names
5. **Icon Style:** Flat, modern, minimal
6. **Export:** SVG, PNG (1024x1024), PNG (512x512)

---

## 🚀 **NEXT STEPS**

1. **Week 1:** Create new service logos + Mint-Mine branding
2. **Week 2:** Generate favicon package + update all UIs
3. **Week 3:** Create mining icons + multiplier badges
4. **Week 4:** Create marketing assets + app store assets

---

**GOAL:** World-class, consistent branding across ALL Azora services! 🎨✨

**STATUS:** Ready to execute cleanup + asset creation! 🔥
