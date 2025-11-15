# 🔄 Azora OS UI Migration Guide

**Version**: 3.0.0  
**Target**: Migrate existing apps to new Azora Gem design system

---

## 📋 Overview

This guide helps you migrate existing Azora OS applications to the new unified design system featuring Azora Gem Tri-Unity Crystal branding.

---

## 🚀 Quick Migration Steps

### Step 1: Update Imports

**Before:**
```typescript
import './old-styles.css'
```

**After:**
```typescript
import '@azora/ui/globals.css'
import '@azora/ui/azora-gem.css'
import '@azora/ui/app-themes.css'
```

### Step 2: Replace Layout Structure

**Before:**
```typescript
function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header>...</header>
      <div className="flex">
        <aside>...</aside>
        <main>...</main>
      </div>
    </div>
  )
}
```

**After:**
```typescript
import { AppShell, Header, Sidebar } from '@azora/ui'

function App() {
  return (
    <AppShell
      gemTheme="emerald" // or sapphire, ruby, ubuntu
      header={<Header title="My App" />}
      sidebar={<Sidebar>...</Sidebar>}
    >
      {/* Your content */}
    </AppShell>
  )
}
```

### Step 3: Update Components

#### Buttons

**Before:**
```typescript
<button className="bg-blue-600 text-white px-4 py-2 rounded">
  Click me
</button>
```

**After:**
```typescript
import { Button } from '@azora/ui'

<Button variant="sapphire">Click me</Button>
<Button variant="emerald">Education</Button>
<Button variant="ruby">Finance</Button>
```

#### Cards

**Before:**
```typescript
<div className="bg-white rounded-lg shadow p-6">
  <h3>Title</h3>
  <p>Content</p>
</div>
```

**After:**
```typescript
import { Card, CardHeader, CardTitle, CardContent } from '@azora/ui'

<Card effect="glass-emerald">
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>
    <p>Content</p>
  </CardContent>
</Card>
```

#### Badges

**Before:**
```typescript
<span className="bg-green-100 text-green-800 px-2 py-1 rounded">
  Active
</span>
```

**After:**
```typescript
import { Badge } from '@azora/ui'

<Badge variant="emerald">Active</Badge>
<Badge variant="sapphire">Tech</Badge>
<Badge variant="ruby">Premium</Badge>
```

---

## 🎨 Color Migration

### Old Colors → New Gem Colors

| Old Color | New Gem Color | Use Case |
|-----------|---------------|----------|
| `bg-blue-600` | `bg-sapphire` | Technology/AI |
| `bg-green-600` | `bg-emerald` | Education/Growth |
| `bg-red-600` | `bg-ruby` | Finance/Value |
| `text-blue-600` | `text-sapphire` | Tech text |
| `border-blue-600` | `border-sapphire` | Tech borders |

### Utility Class Updates

**Before:**
```html
<div className="bg-blue-100 border-blue-500">
```

**After:**
```html
<div className="bg-gradient-sapphire border-sapphire">
```

---

## 🎭 Theme Application

### App-Specific Themes

Wrap your entire app with the appropriate theme:

```typescript
// Education App
function EducationApp() {
  return (
    <div className="theme-education">
      <div className="app-themed">
        <AppShell gemTheme="emerald">
          {/* Your app */}
        </AppShell>
      </div>
    </div>
  )
}

// Finance App
function FinanceApp() {
  return (
    <div className="theme-finance">
      <div className="app-themed">
        <AppShell gemTheme="ruby">
          {/* Your app */}
        </AppShell>
      </div>
    </div>
  )
}
```

---

## 📦 Component Replacements

### Stats/Metrics Cards

**Before:**
```typescript
<div className="bg-white p-6 rounded-lg shadow">
  <div className="text-sm text-gray-500">Active Users</div>
  <div className="text-2xl font-bold">1,250</div>
  <div className="text-xs text-green-600">+12%</div>
</div>
```

**After:**
```typescript
import { StatsCard } from '@azora/ui'

<StatsCard
  title="Active Users"
  value="1,250"
  trend="up"
  trendValue="+12%"
  gem="emerald"
/>
```

### Feature Cards

**Before:**
```typescript
<div className="bg-white p-6 rounded-lg shadow">
  <div className="flex items-center gap-3">
    <Icon />
    <h3>Feature Title</h3>
  </div>
  <p>Description</p>
</div>
```

**After:**
```typescript
import { FeatureCard } from '@azora/ui'

<FeatureCard
  title="Feature Title"
  description="Description"
  gem="sapphire"
/>
```

### Gradient Text

**Before:**
```typescript
<h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
  Title
</h1>
```

**After:**
```typescript
import { GradientText } from '@azora/ui'

<GradientText variant="ubuntu" as="h1" className="text-4xl font-bold">
  Title
</GradientText>
```

---

## 🎨 Special Effects Migration

### Glassmorphism

**Before:**
```typescript
<div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg">
```

**After:**
```typescript
<div className="glass-card">
// or
<div className="glass-sapphire">
// or
import { GlassCard } from '@azora/ui'
<GlassCard gem="emerald">
```

### Glow Effects

**Before:**
```typescript
<div className="shadow-lg shadow-blue-500/50">
```

**After:**
```typescript
<div className="glow-sapphire">
// or for text
<h1 className="text-glow-emerald">
```

### Premium Borders

**Before:**
```typescript
<div className="border-2 border-yellow-500">
```

**After:**
```typescript
<div className="premium-trim">
// or gem-specific
<div className="premium-trim-sapphire">
```

---

## 🔧 Dark Mode Migration

### Enable Dark Mode

**Before:**
```typescript
// Manual dark mode classes
<div className="bg-gray-900 dark:bg-gray-800">
```

**After:**
```typescript
// Automatic dark mode support
<html className="dark">
  <body>
    {/* All components automatically adapt */}
  </body>
</html>
```

The new system automatically handles dark mode with:
- Deep sapphire-tinted backgrounds
- Enhanced gem glows
- Optimized contrast ratios

---

## 📱 Responsive Updates

### Old Responsive Patterns

**Before:**
```typescript
<div className="px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
```

**After:**
```typescript
<div className="section-padding">
// or
<div className="container-max">
```

---

## ✅ Migration Checklist

### Per-App Migration

- [ ] Update CSS imports (globals, azora-gem, app-themes)
- [ ] Wrap app with theme class (`theme-education`, etc.)
- [ ] Replace layout with AppShell
- [ ] Update header with Header component
- [ ] Update sidebar with Sidebar component
- [ ] Replace buttons with Button component
- [ ] Replace cards with Card component
- [ ] Update badges with Badge component
- [ ] Replace stats cards with StatsCard
- [ ] Update colors to gem colors
- [ ] Add Azora logo to header
- [ ] Test light/dark modes
- [ ] Verify responsive design
- [ ] Check accessibility

---

## 🎯 App-Specific Guidance

### Education Apps
- Primary gem: **Emerald**
- Theme class: `theme-education`
- Button variant: `emerald`
- Focus: Learning, growth, progress

### Finance Apps
- Primary gem: **Ruby**
- Theme class: `theme-finance`
- Button variant: `ruby`
- Focus: Value, transactions, wealth

### Marketplace Apps
- Primary gem: **Sapphire**
- Theme class: `theme-marketplace`
- Button variant: `sapphire`
- Focus: Technology, skills, jobs

### Enterprise Apps
- Primary gem: **Orange** (custom)
- Theme class: `theme-enterprise`
- Button variant: `default` or custom
- Focus: Business, analytics, tools

---

## 🐛 Common Issues

### Issue: Colors not showing

**Solution:**
```typescript
// Ensure CSS files are imported in correct order
import '@azora/ui/globals.css'      // First
import '@azora/ui/azora-gem.css'    // Second
import '@azora/ui/app-themes.css'   // Third
```

### Issue: Dark mode not working

**Solution:**
```html
<!-- Add dark class to html element -->
<html className="dark">
```

### Issue: Gem glows not visible

**Solution:**
```typescript
// Ensure you're using the glow classes
<div className="glow-sapphire">
// Not just the color
<div className="bg-sapphire">
```

---

## 📚 Additional Resources

- [README.md](./README.md) - Full component documentation
- [DesignSystemShowcase.tsx](./examples/DesignSystemShowcase.tsx) - Visual examples
- [LayoutExample.tsx](./examples/LayoutExample.tsx) - Layout patterns

---

## 🌟 Best Practices

1. **Use Gem Variants** - Always use gem-specific variants for brand consistency
2. **Theme Appropriately** - Match gem colors to app purpose (Education=Emerald, etc.)
3. **Leverage Effects** - Use glassmorphism and glows for premium feel
4. **Stay Accessible** - All components are WCAG 2.1 AA compliant by default
5. **Test Both Modes** - Always verify light and dark mode appearance

---

<div align="center">

**🔄 SEAMLESS MIGRATION TO CONSTITUTIONAL AI DESIGN**

*Ubuntu Philosophy • Azora Gem • World-Class UI*

**Azora ES (Pty) Ltd** | **Version 3.0.0**

</div>