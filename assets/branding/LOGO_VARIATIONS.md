# AZORA OS - Logo Variations & Usage Guide

## Logo Family

### Primary Logo
- **File**: `azora-os-logo-primary.svg`
- **Usage**: Main brand applications, headers, official documents
- **Minimum Size**: 120px width (digital), 2 inches (print)
- **Background**: Works on white, light backgrounds

### Secondary Logo (Horizontal)
- **File**: `azora-os-logo-horizontal.svg`
- **Usage**: Website headers, business cards, letterheads
- **Minimum Size**: 100px width (digital), 1.5 inches (print)
- **Background**: Versatile for most applications

### Icon/Symbol Only
- **File**: `azora-os-icon.svg`
- **Usage**: App icons, favicons, social media profiles
- **Minimum Size**: 32px (digital), 0.5 inches (print)
- **Background**: Works on any background with proper contrast

### Monochrome Versions
- **Files**: 
  - `azora-os-logo-black.svg`
  - `azora-os-logo-white.svg`
- **Usage**: Single-color applications, embossing, etching
- **Background**: High contrast applications only

## Color Specifications

### Primary Brand Colors
```css
/* Azora Blue */
--azora-blue: #0066FF;
--azora-blue-rgb: rgb(0, 102, 255);
--azora-blue-hsl: hsl(220, 100%, 50%);

/* Neural Purple */
--neural-purple: #6B46C1;
--neural-purple-rgb: rgb(107, 70, 193);
--neural-purple-hsl: hsl(255, 48%, 52%);

/* Quantum Green */
--quantum-green: #10B981;
--quantum-green-rgb: rgb(16, 185, 129);
--quantum-green-hsl: hsl(160, 84%, 39%);
```

### Gradient Combinations
```css
/* Primary Gradient */
.azora-gradient-primary {
  background: linear-gradient(135deg, #0066FF 0%, #6B46C1 100%);
}

/* Neural Gradient */
.azora-gradient-neural {
  background: linear-gradient(135deg, #6B46C1 0%, #10B981 100%);
}

/* Quantum Gradient */
.azora-gradient-quantum {
  background: linear-gradient(135deg, #10B981 0%, #0066FF 100%);
}

/* Full Spectrum */
.azora-gradient-spectrum {
  background: linear-gradient(135deg, #0066FF 0%, #6B46C1 33%, #10B981 66%, #0066FF 100%);
}
```

## Typography System

### Primary Typeface: Inter
```css
/* Headings */
.azora-heading {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  font-weight: 700;
  letter-spacing: -0.02em;
}

/* Subheadings */
.azora-subheading {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  font-weight: 600;
  letter-spacing: -0.01em;
}

/* Body Text */
.azora-body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  font-weight: 400;
  line-height: 1.6;
}

/* Code/Technical */
.azora-code {
  font-family: 'Inter', 'SF Mono', Monaco, 'Cascadia Code', monospace;
  font-weight: 400;
  letter-spacing: 0.01em;
}
```

### Font Sizes (Responsive Scale)
```css
/* Desktop */
.azora-h1 { font-size: 3.5rem; }    /* 56px */
.azora-h2 { font-size: 2.5rem; }    /* 40px */
.azora-h3 { font-size: 2rem; }      /* 32px */
.azora-h4 { font-size: 1.5rem; }    /* 24px */
.azora-body { font-size: 1rem; }    /* 16px */
.azora-small { font-size: 0.875rem; } /* 14px */

/* Mobile */
@media (max-width: 768px) {
  .azora-h1 { font-size: 2.5rem; }  /* 40px */
  .azora-h2 { font-size: 2rem; }    /* 32px */
  .azora-h3 { font-size: 1.5rem; }  /* 24px */
  .azora-h4 { font-size: 1.25rem; } /* 20px */
}
```

## Icon System

### Style Guidelines
- **Style**: Minimalist, geometric, 2px stroke weight
- **Corner Radius**: 4px for rounded elements
- **Grid**: 24x24px base grid
- **Padding**: 2px internal padding
- **Format**: SVG preferred, PNG fallback

### Icon Categories

#### Core System Icons
- OS/System: Computer, settings, power, update
- AI/Intelligence: Brain, neural network, learning, automation
- Connectivity: Network, cloud, sync, share
- Security: Shield, lock, key, verification

#### Feature Icons
- Development: Code, terminal, git, debug
- Education: Book, graduation, certificate, tutorial
- Finance: Wallet, coin, chart, transaction
- Communication: Message, video, voice, collaboration

#### UI/Navigation Icons
- Actions: Play, pause, stop, record, edit, delete
- Navigation: Arrow, chevron, menu, close, expand
- Status: Success, warning, error, info, loading
- Media: Image, video, audio, document, download

### Icon Usage Examples
```html
<!-- Primary icon with brand color -->
<svg class="azora-icon" fill="#0066FF" width="24" height="24">
  <!-- icon path -->
</svg>

<!-- Icon with gradient -->
<svg class="azora-icon" width="24" height="24">
  <defs>
    <linearGradient id="azora-gradient">
      <stop offset="0%" stop-color="#0066FF"/>
      <stop offset="100%" stop-color="#6B46C1"/>
    </linearGradient>
  </defs>
  <!-- icon path with fill="url(#azora-gradient)" -->
</svg>
```

## Brand Patterns & Textures

### Neural Network Pattern
```css
.azora-neural-bg {
  background-image: 
    radial-gradient(circle at 25% 25%, rgba(0, 102, 255, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 75% 75%, rgba(107, 70, 193, 0.1) 0%, transparent 50%);
  background-size: 100px 100px;
}
```

### Quantum Grid Pattern
```css
.azora-quantum-grid {
  background-image: 
    linear-gradient(rgba(16, 185, 129, 0.1) 1px, transparent 1px),
    linear-gradient(90deg, rgba(16, 185, 129, 0.1) 1px, transparent 1px);
  background-size: 20px 20px;
}
```

### Cosmic Noise Pattern
```css
.azora-cosmic-noise {
  background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><defs><filter id="noise"><feTurbulence baseFrequency="0.9" numOctaves="4" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 0 0 0 0 0 0.4 0 0 0 0 1 0 0 0 0.1 0"/></filter></defs><rect width="100%" height="100%" filter="url(%23noise)"/></svg>');
}
```

## Application Examples

### Website Header
```html
<header class="azora-header">
  <div class="azora-logo">
    <img src="assets/branding/azora-os-logo-horizontal.svg" alt="Azora OS" />
  </div>
  <nav class="azora-nav">
    <!-- navigation items -->
  </nav>
</header>
```

### Business Card Layout
```
┌─────────────────────────────────┐
│  [AZORA OS LOGO]                │
│                                 │
│  John Developer                 │
│  Senior AI Engineer             │
│                                 │
│  john@azora.world              │
│  +1 (555) 123-4567             │
│  azora.world                   │
│                                 │
│  [Neural pattern background]   │
└─────────────────────────────────┘
```

### Email Signature
```html
<div class="azora-signature">
  <img src="azora-os-icon.png" width="32" height="32" />
  <div>
    <strong>Your Name</strong><br>
    <span style="color: #6B7280;">Your Title</span><br>
    <a href="mailto:you@azora.world" style="color: #0066FF;">you@azora.world</a><br>
    <a href="https://azora.world" style="color: #0066FF;">azora.world</a>
  </div>
</div>
```

## File Organization

### Directory Structure
```
assets/branding/
├── logos/
│   ├── svg/
│   │   ├── azora-os-logo-primary.svg
│   │   ├── azora-os-logo-horizontal.svg
│   │   ├── azora-os-icon.svg
│   │   ├── azora-os-logo-black.svg
│   │   └── azora-os-logo-white.svg
│   ├── png/
│   │   ├── azora-os-logo-primary@1x.png
│   │   ├── azora-os-logo-primary@2x.png
│   │   └── azora-os-logo-primary@3x.png
│   └── favicon/
│       ├── favicon.ico
│       ├── favicon-16x16.png
│       ├── favicon-32x32.png
│       └── apple-touch-icon.png
├── icons/
│   ├── system/
│   ├── features/
│   └── ui/
├── patterns/
│   ├── neural-network.svg
│   ├── quantum-grid.svg
│   └── cosmic-noise.svg
└── templates/
    ├── business-card.ai
    ├── letterhead.ai
    ├── presentation.pptx
    └── email-signature.html
```

## Quality Standards

### Vector Graphics (SVG)
- Optimize for web (remove unnecessary metadata)
- Use semantic naming for elements
- Include accessibility attributes
- Maintain scalability at all sizes

### Raster Graphics (PNG/JPG)
- Minimum 300 DPI for print applications
- Multiple resolutions for responsive web (@1x, @2x, @3x)
- Optimized file sizes without quality loss
- Proper color profiles (sRGB for web, CMYK for print)

### Brand Consistency Checklist
- [ ] Logo proportions maintained
- [ ] Correct color values used
- [ ] Appropriate typography applied
- [ ] Sufficient contrast ratios
- [ ] Consistent spacing and alignment
- [ ] Proper file formats for intended use

---

*This logo and brand system ensures consistent, professional representation of Azora OS across all touchpoints while maintaining flexibility for various applications and contexts.*