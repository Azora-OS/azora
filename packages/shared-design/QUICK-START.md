# ⚡ Quick Start Guide - Azora Master UI

**Get started in 5 minutes!**

---

## 1️⃣ Install (30 seconds)

```bash
# Add to package.json
npm install ../../packages/shared-design
```

---

## 2️⃣ Import Theme (1 minute)

In your `src/index.css` or `app/globals.css`:

```css
@import "@azora/shared-design/theme/azora-theme.css";
```

---

## 3️⃣ Use Components (2 minutes)

```tsx
import {
  AzoraLogo,
  HeroSection,
  StatsCard,
  GradientText,
  ResponsiveGrid
} from '@azora/shared-design'

function MyApp() {
  return (
    <div>
      {/* Logo */}
      <AzoraLogo className="h-12 w-12" />
      
      {/* Hero */}
      <HeroSection
        title="Your App"
        subtitle="Powered by Azora"
        description="Constitutional AI at your service"
        primaryAction={{ label: "Start", href: "/start" }}
      />
      
      {/* Stats */}
      <ResponsiveGrid cols={{ default: 1, sm: 2, lg: 4 }}>
        <StatsCard
          label="Users"
          value="1,250+"
          trend="up"
          trendValue="+12%"
          className="glass-card"
        />
      </ResponsiveGrid>
      
      {/* Gradient Text */}
      <h1 className="heading-1">
        Welcome to <GradientText>Azora OS</GradientText>
      </h1>
    </div>
  )
}
```

---

## 4️⃣ Apply Styles (1 minute)

### Glassmorphism
```tsx
<div className="glass">Frosted glass</div>
<div className="glass-card">Glass card</div>
```

### Gradients
```tsx
<div className="gradient-sapphire">Sapphire</div>
<div className="gradient-emerald">Emerald</div>
<div className="gradient-ruby">Ruby</div>
```

### Typography
```tsx
<h1 className="heading-1">Large Heading</h1>
<p className="body-large">Large text</p>
```

---

## 5️⃣ Common Patterns

### Dashboard Layout
```tsx
import { AppLayout } from '@azora/shared-design/layouts/AppLayout'

<AppLayout
  showMobileNav
  mobileNavItems={<YourNavItems />}
  headerActions={<YourActions />}
>
  <YourContent />
</AppLayout>
```

### Feature Grid
```tsx
import { FeatureCard, ResponsiveGrid } from '@azora/shared-design'

<ResponsiveGrid cols={{ default: 1, md: 2, lg: 3 }}>
  <FeatureCard
    title="Feature 1"
    description="Description"
    icon={<Icon />}
    href="/feature-1"
  />
</ResponsiveGrid>
```

### Stats Dashboard
```tsx
import { StatsCard, ResponsiveGrid } from '@azora/shared-design'

<ResponsiveGrid cols={{ default: 1, sm: 2, lg: 4 }}>
  <StatsCard
    label="Metric"
    value="123"
    trend="up"
    trendValue="+10%"
  />
</ResponsiveGrid>
```

---

## 🎨 Color Reference

```tsx
// Azora Gem Colors
Sapphire: #667eea → #764ba2 (Technology)
Emerald:  #10b981 → #059669  (Education)
Ruby:     #ef4444 → #dc2626  (Finance)
Ubuntu:   #ffffff            (Unity)

// Usage
<div className="bg-sapphire">Technology</div>
<div className="bg-emerald">Education</div>
<div className="bg-ruby">Finance</div>
```

---

## ♿ Accessibility Checklist

```tsx
// ✅ Always add aria-labels
<button aria-label="Close">×</button>

// ✅ Use semantic HTML
<nav role="navigation">...</nav>

// ✅ Ensure contrast
<p className="text-foreground">High contrast</p>

// ✅ Add accessibility toolbar
<AccessibilityToolbar
  onFontSizeChange={setSize}
  onContrastChange={setContrast}
  onReduceMotion={setMotion}
/>
```

---

## 📱 Responsive Breakpoints

```tsx
default: 0px      // Mobile
sm: 640px         // Tablet
md: 768px         // Tablet landscape
lg: 1024px        // Laptop
xl: 1280px        // Desktop
2xl: 1536px       // Large screen

// Usage
<div className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
```

---

## 🚀 That's It!

You're ready to build world-class UIs with Azora Master Template.

**Need more?** Check the [full README](./README.md)

---

**Ubuntu Philosophy**: "I can because we can" 🌍