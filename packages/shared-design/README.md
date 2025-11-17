# 🎨 Azora Master UI Template

**Version**: 3.0.0  
**Status**: Production Ready  
**Philosophy**: Ubuntu - "I am because we are"

World-class design system for Constitutional AI Operating System. Built with modern 2025 standards, accessibility-first approach, and glassmorphism aesthetics.

---

## 🌟 Features

### Design Excellence
- ✨ **Glassmorphism** - Modern frosted glass effects with backdrop blur
- 🎨 **Azora Gem Palette** - Tri-Unity Crystal colors (Sapphire/Emerald/Ruby)
- 🌈 **Gradient System** - Beautiful gradients for text and backgrounds
- 🎭 **Dark/Light Themes** - Automatic theme switching with smooth transitions
- 📱 **Mobile-First** - Responsive design that works on all devices
- ♿ **WCAG 2.1 AA** - Full accessibility compliance

### Technical Features
- ⚡ **Performance Optimized** - Tree-shakeable components
- 🔧 **TypeScript** - Full type safety
- 🎯 **Tailwind v4** - Modern utility-first CSS
- 📦 **Zero Dependencies** - Minimal external dependencies
- 🧩 **Composable** - Mix and match components easily

---

## 📦 Installation

```bash
# In your app directory
npm install ../../packages/shared-design
```

Add to your `package.json`:
```json
{
  "dependencies": {
    "@azora/shared-design": "file:../../packages/shared-design"
  }
}
```

---

## 🚀 Quick Start

### 1. Import Theme

In your global CSS file (e.g., `globals.css`):

```css
@import "@azora/shared-design/theme/azora-theme.css";
```

### 2. Use Components

```tsx
import { 
  AzoraLogo, 
  HeroSection, 
  StatsCard,
  FeatureCard,
  GradientText 
} from '@azora/shared-design'

function App() {
  return (
    <div>
      <AzoraLogo className="h-12 w-12" />
      
      <HeroSection
        title="Welcome to"
        subtitle="Constitutional AI"
        description="Experience the world's first Constitutional AI OS"
        primaryAction={{ label: "Get Started", href: "/start" }}
      />
      
      <GradientText>Beautiful Gradient Text</GradientText>
    </div>
  )
}
```

---

## 🎨 Components

### Core Components

#### AzoraLogo
The Tri-Unity Crystal logo representing Technology, Education, and Finance.

```tsx
<AzoraLogo className="h-10 w-10" />
```

#### HeroSection
Modern hero section with glassmorphism and stats.

```tsx
<HeroSection
  title="Your Title"
  subtitle="Gradient Subtitle"
  description="Your description"
  primaryAction={{ label: "CTA", href: "/action" }}
  stats={[
    { label: "Users", value: "1,250+", icon: <Icon /> }
  ]}
/>
```

#### StatsCard
Display metrics with trends and icons.

```tsx
<StatsCard
  label="Revenue"
  value="R 1.2M"
  trend="up"
  trendValue="+12.5%"
  className="glass-card"
/>
```

#### FeatureCard
Showcase features with icons and descriptions.

```tsx
<FeatureCard
  title="AI Learning"
  description="Personalized education paths"
  icon={<BrainIcon />}
  href="/features/learning"
/>
```

### Layout Components

#### AppLayout
Complete application layout with header, sidebar, and mobile nav.

```tsx
import { AppLayout } from '@azora/shared-design/layouts/AppLayout'

<AppLayout
  showMobileNav
  mobileNavItems={<MobileNavItems />}
  headerActions={<HeaderActions />}
  sidebarContent={<Sidebar />}
>
  <YourContent />
</AppLayout>
```

#### ResponsiveGrid
Adaptive grid system.

```tsx
<ResponsiveGrid 
  cols={{ default: 1, sm: 2, md: 3, lg: 4 }} 
  gap={6}
>
  <Card />
  <Card />
  <Card />
</ResponsiveGrid>
```

### Utility Components

#### GradientText
Apply Azora Gem gradients to text.

```tsx
<GradientText gradient="primary">Sapphire Text</GradientText>
<GradientText gradient="success">Emerald Text</GradientText>
<GradientText gradient="danger">Ruby Text</GradientText>
```

#### MobileNav
Mobile-optimized bottom navigation.

```tsx
<MobileNav>
  <NavItem icon={<HomeIcon />} label="Home" />
  <NavItem icon={<SearchIcon />} label="Search" />
</MobileNav>
```

#### AccessibilityToolbar
User-controlled accessibility options.

```tsx
<AccessibilityToolbar
  onFontSizeChange={(size) => setFontSize(size)}
  onContrastChange={(high) => setHighContrast(high)}
  onReduceMotion={(reduce) => setReduceMotion(reduce)}
/>
```

---

## 🎨 Theme System

### Azora Gem Colors

```css
/* Primary - Sapphire (Technology) */
--azora-sapphire: #667eea
--azora-sapphire-dark: #764ba2

/* Secondary - Emerald (Education) */
--azora-emerald: #10b981
--azora-emerald-dark: #059669

/* Accent - Ruby (Finance) */
--azora-ruby: #ef4444
--azora-ruby-dark: #dc2626

/* Unity - Ubuntu */
--azora-ubuntu: #ffffff
```

### Utility Classes

#### Typography
```tsx
<h1 className="heading-1">Large Heading</h1>
<h2 className="heading-2">Medium Heading</h2>
<p className="body-large">Large body text</p>
<p className="body-small">Small body text</p>
```

#### Glassmorphism
```tsx
<div className="glass">Frosted glass effect</div>
<div className="glass-card">Glass card with border</div>
<div className="glass-strong">Strong glass effect</div>
```

#### Gradients
```tsx
<div className="gradient-sapphire">Sapphire gradient</div>
<div className="gradient-emerald">Emerald gradient</div>
<div className="gradient-ruby">Ruby gradient</div>
<div className="gradient-ubuntu">Ubuntu gradient</div>
```

#### Layout
```tsx
<section className="section-padding">Section with padding</section>
<div className="container-max">Max-width container</div>
<div className="card-padding">Card padding</div>
```

---

## ♿ Accessibility

### WCAG 2.1 AA Compliance

- ✅ Color contrast ratios meet standards (4.5:1 for normal text, 3:1 for large)
- ✅ Keyboard navigation support
- ✅ Screen reader compatibility with ARIA labels
- ✅ Focus indicators on all interactive elements
- ✅ Reduced motion support via `prefers-reduced-motion`
- ✅ High contrast mode support

### Best Practices

```tsx
// Always provide aria-labels
<button aria-label="Close menu">
  <CloseIcon />
</button>

// Use semantic HTML
<nav role="navigation" aria-label="Main navigation">
  {/* Navigation items */}
</nav>

// Ensure sufficient color contrast
<p className="text-foreground">High contrast text</p>
```

---

## 📱 Responsive Design

### Breakpoints

```css
/* Mobile First */
default: 0px      /* Mobile */
sm: 640px         /* Small tablets */
md: 768px         /* Tablets */
lg: 1024px        /* Laptops */
xl: 1280px        /* Desktops */
2xl: 1536px       /* Large screens */
```

### Example

```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
  {/* Responsive grid */}
</div>
```

---

## 🌍 Internationalization

### Language Switcher

```tsx
<LanguageSwitcher
  currentLanguage="en"
  onLanguageChange={(lang) => setLanguage(lang)}
  languages={[
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'zu', name: 'isiZulu', flag: '🇿🇦' },
    { code: 'xh', name: 'isiXhosa', flag: '🇿🇦' },
    // ... more languages
  ]}
/>
```

---

## 🎯 Examples

See `/examples` directory for:
- `DashboardExample.tsx` - Complete dashboard layout
- `AppLayout.tsx` - Full application layout
- More examples coming soon...

---

## 🔧 Development

```bash
# Type check
npm run type-check

# Build
npm run build

# Test
npm run test
```

---

## 📚 Resources

- [Design System Guide](../../docs/design/DESIGN-SYSTEM.md)
- [Master UI Deployment Guide](../../docs/MASTER-UI-DEPLOYMENT-GUIDE.md)
- [Accessibility Guidelines](../../docs/design/ACCESSIBILITY.md)
- [Brand Guidelines](../../docs/design/BRAND-GUIDELINES.md)

---

## 🤝 Ubuntu Philosophy

> "I am because we are" - Ubuntu

This design system embodies Ubuntu philosophy:
- **Collective Prosperity** - Shared components benefit all
- **Truth & Transparency** - Clear, honest UI/UX
- **Accessibility** - Technology serves everyone
- **Excellence** - World-class design for all

---

## 📄 License

**AZORA PROPRIETARY LICENSE**  
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

---

<div align="center">

**🎨 World-Class UI for Constitutional AI**

*Built with Ubuntu Philosophy • Designed for 2025 • Deployed with Love*

**Azora ES (Pty) Ltd** | **Version 3.0.0** | **January 2025**

</div>