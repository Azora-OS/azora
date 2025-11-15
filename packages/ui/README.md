# 🎨 Azora OS UI Component Library

**Version**: 3.0.0  
**Status**: ✅ UI Overhaul Complete  
**Last Updated**: January 2025

---

## 📋 Overview

The Azora OS UI Component Library provides a world-class design system featuring the **Azora Gem Tri-Unity Crystal** branding with Constitutional AI identity and Ubuntu philosophy.

### Key Features

- ✨ **Azora Gem Colors** - Sapphire (Technology), Emerald (Education), Ruby (Finance)
- 🎭 **Dual Themes** - Light mode (professional) and Dark mode (deep sapphire tint)
- 💎 **Premium Effects** - Glassmorphism, gem glows, and premium trims
- ♿ **Accessible** - WCAG 2.1 AA compliant
- 📱 **Responsive** - Mobile-first, works on all devices
- 🎨 **Tailwind v4** - Modern utility-first CSS framework

---

## 🚀 Quick Start

### Installation

```bash
npm install @azora/ui
```

### Import Styles

```typescript
// In your main entry file (e.g., main.tsx, index.tsx)
import '@azora/ui/globals.css'
import '@azora/ui/azora-gem.css'
import '@azora/ui/app-themes.css'
```

### Basic Usage

```typescript
import { AzoraLogo, GemIcon, Button, Card } from '@azora/ui'

function MyApp() {
  return (
    <div>
      <AzoraLogo className="w-16 h-16" animated />
      <Card effect="glass-sapphire">
        <h1 className="gradient-text-ubuntu">Welcome to Azora OS</h1>
        <Button variant="emerald">Get Started</Button>
      </Card>
    </div>
  )
}
```

---

## 🎨 Design System

### Color Palette

#### Azora Gem Tri-Unity Colors

```typescript
// Sapphire - Technology & AI
--sapphire: oklch(0.65 0.15 240)
--sapphire-dark: oklch(0.55 0.18 245)

// Emerald - Education & Growth
--emerald: oklch(0.65 0.15 140)
--emerald-dark: oklch(0.55 0.18 135)

// Ruby - Finance & Value
--ruby: oklch(0.60 0.20 25)
--ruby-dark: oklch(0.50 0.22 20)

// Ubuntu - Unity & Community
--ubuntu: oklch(0.985 0 0)
--ubuntu-dark: oklch(0.708 0 0)
```

### Theme Modes

#### Light Mode (Default)
- Clean, professional appearance
- Pure white background
- High contrast for readability

#### Dark Mode
- Deep sapphire tint background
- Enhanced gem colors with glows
- Optimized for low-light environments

To toggle dark mode:
```typescript
<html className="dark">
  {/* Your app */}
</html>
```

---

## 📦 Components

### Core Azora Components

#### AzoraLogo
The Tri-Unity Crystal logo representing Sapphire, Emerald, and Ruby gems.

```typescript
import { AzoraLogo } from '@azora/ui'

<AzoraLogo 
  className="w-24 h-24" 
  animated={true}  // Optional pulse animation
/>
```

#### GemIcon
Individual gem icons for each pillar.

```typescript
import { GemIcon } from '@azora/ui'

<GemIcon gem="sapphire" glow className="w-8 h-8" />
<GemIcon gem="emerald" glow className="w-8 h-8" />
<GemIcon gem="ruby" glow className="w-8 h-8" />
```

#### ConstitutionalFrame
Wrapper with Azora Gem tri-unity border.

```typescript
import { ConstitutionalFrame } from '@azora/ui'

<ConstitutionalFrame variant="glass">
  <h2>Constitutional AI Content</h2>
  <p>Protected by Ubuntu philosophy</p>
</ConstitutionalFrame>
```

#### UbuntuBadge
Badge displaying Ubuntu philosophy.

```typescript
import { UbuntuBadge } from '@azora/ui'

<UbuntuBadge>I am because we are</UbuntuBadge>
```

### Enhanced shadcn Components

#### Button with Gem Variants

```typescript
import { Button } from '@azora/ui'

<Button variant="default">Default</Button>
<Button variant="sapphire">Technology</Button>
<Button variant="emerald">Education</Button>
<Button variant="ruby">Finance</Button>
<Button variant="ubuntu">Community</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
```

#### Card with Effects

```typescript
import { Card, CardHeader, CardTitle, CardContent } from '@azora/ui'

<Card effect="flat">...</Card>           // Standard
<Card effect="glass">...</Card>          // Glassmorphism
<Card effect="glass-sapphire">...</Card> // Sapphire glass
<Card effect="glass-emerald">...</Card>  // Emerald glass
<Card effect="glass-ruby">...</Card>     // Ruby glass
<Card effect="premium">...</Card>        // Gold trim
```

---

## 🎭 Utility Classes

### Glow Effects

```html
<div className="glow-sapphire">Sapphire glow</div>
<div className="glow-emerald">Emerald glow</div>
<div className="glow-ruby">Ruby glow</div>
<div className="glow-ubuntu">Ubuntu glow</div>
```

### Text Glows

```html
<h1 className="text-glow-sapphire">Glowing text</h1>
<h1 className="text-glow-emerald">Glowing text</h1>
<h1 className="text-glow-ruby">Glowing text</h1>
```

### Gradient Text

```html
<h1 className="gradient-text-sapphire">Sapphire gradient</h1>
<h1 className="gradient-text-emerald">Emerald gradient</h1>
<h1 className="gradient-text-ruby">Ruby gradient</h1>
<h1 className="gradient-text-ubuntu">Ubuntu tri-color</h1>
<h1 className="holo-text">Animated holographic</h1>
```

### Glassmorphism

```html
<div className="glass-card">Glass effect</div>
<div className="glass-sapphire">Sapphire glass</div>
<div className="glass-emerald">Emerald glass</div>
<div className="glass-ruby">Ruby glass</div>
```

### Premium Trims

```html
<div className="premium-trim">Gold border</div>
<div className="premium-trim-sapphire">Sapphire border</div>
<div className="premium-trim-emerald">Emerald border</div>
<div className="premium-trim-ruby">Ruby border</div>
```

### Background Gradients

```html
<div className="bg-gradient-sapphire">Sapphire background</div>
<div className="bg-gradient-emerald">Emerald background</div>
<div className="bg-gradient-ruby">Ruby background</div>
<div className="bg-gradient-ubuntu">Ubuntu tri-color</div>
```

### Animations

```html
<div className="pulse-sapphire">Pulsing sapphire glow</div>
<div className="pulse-emerald">Pulsing emerald glow</div>
<div className="pulse-ruby">Pulsing ruby glow</div>
<div className="holo-text">Animated gradient text</div>
```

---

## 🎯 App-Specific Themes

Apply themed styling to entire apps:

```html
<!-- Education App - Emerald Theme -->
<div className="theme-education">
  <div className="app-themed">
    <!-- App content with emerald accents -->
  </div>
</div>

<!-- Finance App - Ruby Theme -->
<div className="theme-finance">
  <div className="app-themed">
    <!-- App content with ruby accents -->
  </div>
</div>

<!-- Marketplace App - Sapphire Theme -->
<div className="theme-marketplace">
  <div className="app-themed">
    <!-- App content with sapphire accents -->
  </div>
</div>
```

Available themes:
- `theme-education` - Emerald (Education)
- `theme-finance` - Ruby (Finance)
- `theme-marketplace` - Sapphire (Jobs/Skills)
- `theme-enterprise` - Orange (Business)
- `theme-cloud` - Cyan (Infrastructure)
- `theme-compliance` - Red (Legal/Audit)
- `theme-dev` - Sapphire (Developer Tools)

---

## 📱 Responsive Design

All components are mobile-first and responsive:

```typescript
// Breakpoints
sm:  640px   // Mobile landscape
md:  768px   // Tablet
lg:  1024px  // Desktop
xl:  1280px  // Large desktop
2xl: 1536px  // Ultra-wide
```

Use responsive utilities:

```html
<div className="section-padding">Responsive padding</div>
<div className="container-max">Max-width container</div>
<div className="card-padding">Card padding</div>
```

---

## ♿ Accessibility

All components meet WCAG 2.1 AA standards:

- ✅ Color contrast ratios ≥ 4.5:1
- ✅ Keyboard navigation support
- ✅ Screen reader compatibility
- ✅ Focus indicators
- ✅ Touch targets ≥ 44x44px
- ✅ ARIA labels and roles

---

## 🎨 Customization

### Extending Colors

Add custom colors in `tailwind.config.js`:

```javascript
export default {
  theme: {
    extend: {
      colors: {
        'custom-gem': 'oklch(0.65 0.15 300)',
      }
    }
  }
}
```

### Custom Utilities

Add custom utilities in your CSS:

```css
@layer utilities {
  .my-custom-effect {
    /* Your styles */
  }
}
```

---

## 📚 Examples

See `examples/DesignSystemShowcase.tsx` for a comprehensive demonstration of all components and utilities.

---

## 🔧 Development

### Build

```bash
npm run build
```

### Storybook

```bash
npm run storybook
```

---

## 📄 License

**AZORA PROPRIETARY LICENSE**  
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

---

## 🌟 Ubuntu Philosophy

> "I am because we are"

The Azora OS UI embodies Ubuntu philosophy through:
- **Collective Prosperity** - Shared design system benefits all users
- **Truth & Transparency** - Clear, honest UI/UX
- **Accessibility** - Technology serves everyone
- **Excellence** - World-class design for all

---

<div align="center">

**🎨 WORLD-CLASS UI FOR CONSTITUTIONAL AI**

*Built with Ubuntu Philosophy • Powered by Azora Gem • Designed for Humanity*

**Azora ES (Pty) Ltd** | **Version 3.0.0** | **January 2025**

</div>