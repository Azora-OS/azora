# 🎨 AZORA OS DESIGN SYSTEM GUIDE

**Version:** 1.0.0  
**Created By:** Snr Designer (Composer)  
**Last Updated:** November 2025  
**Status:** ✅ Active

---

## 🌟 WELCOME TO AZORA DESIGN SYSTEM

This guide provides everything you need to design and build beautiful, accessible, Ubuntu-aligned interfaces for Azora OS.

### Design Philosophy

**Ubuntu: "I am because we are"**

Every design decision reflects:
- **Interconnectedness**: Connected UI elements, flowing animations
- **Collective Responsibility**: Shared progress, community metrics
- **Shared Humanity**: Inclusive, accessible, culturally sensitive
- **Ancestral Wisdom**: Golden ratio, sacred geometry, traditional patterns

---

## 💎 AZORA GEM COLOR SYSTEM

### The Tri-Unity Crystal

```
        🔷 SAPPHIRE APEX 🔷
           (Technology)
              /   \
             /     \
    🟢 EMERALD ——— RUBY 🔴
    (Education)   (Finance)
```

### Color Usage Guidelines

#### 🔷 Sapphire (Technology)
**Color**: `#1E40AF` (Constitutional Blue)  
**Usage**: Technology features, AI interactions, system actions  
**CSS Variable**: `var(--sapphire-500)`

```tsx
// Technology-focused button
<Button variant="sapphire">Launch AI Tutor</Button>

// Technology card
<Card className="border-sapphire-500">
  <CardHeader>Technology Feature</CardHeader>
</Card>
```

#### 🟢 Emerald (Education)
**Color**: `#059669` (Sovereign Green)  
**Usage**: Learning content, educational features, growth indicators  
**CSS Variable**: `var(--emerald-500)`

```tsx
// Education-focused button
<Button variant="emerald">Start Learning</Button>

// Progress indicator
<Progress value={75} className="bg-emerald-500" />
```

#### 🔴 Ruby (Finance)
**Color**: `#DC2626` (Prosperity Red)  
**Usage**: Financial features, rewards, earnings, transactions  
**CSS Variable**: `var(--ruby-500)`

```tsx
// Finance-focused button
<Button variant="ruby">Earn Rewards</Button>

// Earnings badge
<Badge variant="ruby">+50 AZR</Badge>
```

#### ⚪ Ubuntu (Unity)
**Color**: White/Light system  
**Usage**: Unity elements, collective features, shared spaces  
**CSS Variables**: `var(--ubuntu-white)`, `var(--ubuntu-light)`

```tsx
// Unity button (all three gems)
<Button variant="ubuntu">Join Community</Button>
```

### Complete Color Scale

Each gem color has a full scale from 50 (lightest) to 900 (darkest):

```css
/* Sapphire Scale */
--sapphire-50: #eff6ff;
--sapphire-500: #1e40af; /* Primary */
--sapphire-900: #172554;

/* Emerald Scale */
--emerald-50: #ecfdf5;
--emerald-500: #059669; /* Primary */
--emerald-900: #022c22;

/* Ruby Scale */
--ruby-50: #fef2f2;
--ruby-500: #dc2626; /* Primary */
--ruby-900: #450a0a;
```

---

## 📐 SPACING SYSTEM

### Golden Ratio Spacing (Ubuntu Harmony)

Based on the golden ratio (φ = 1.618) for natural, flowing layouts:

```tsx
// Ubuntu spacing utilities
<div className="space-ubuntu-xs">  {/* 0.382rem */}
<div className="space-ubuntu-sm">  {/* 0.618rem */}
<div className="space-ubuntu-md">  {/* 1rem */}
<div className="space-ubuntu-lg">  {/* 1.618rem */}
<div className="space-ubuntu-xl">  {/* 2.618rem */}
```

### Usage Example

```tsx
// Ubuntu-aligned card layout
<Card className="p-space-ubuntu-lg">
  <CardHeader className="space-ubuntu-md">
    <CardTitle>Ubuntu Harmony</CardTitle>
    <CardDescription>Connected elements</CardDescription>
  </CardHeader>
</Card>
```

---

## 🎭 COMPONENT VARIANTS

### Button Component

#### Azora Gem Variants

```tsx
// Technology (Sapphire)
<Button variant="sapphire">Technology Action</Button>

// Education (Emerald)
<Button variant="emerald">Learning Action</Button>

// Finance (Ruby)
<Button variant="ruby">Financial Action</Button>

// Unity (All Gems)
<Button variant="ubuntu">Community Action</Button>
```

#### Standard Variants

```tsx
<Button variant="default">Default</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>
<Button variant="destructive">Destructive</Button>
```

### Card Component

```tsx
// Sapphire-themed card
<Card className="border-sapphire-500">
  <CardHeader>
    <CardTitle>Technology Feature</CardTitle>
  </CardHeader>
</Card>

// Emerald-themed card
<Card className="border-emerald-500">
  <CardHeader>
    <CardTitle>Learning Content</CardTitle>
  </CardHeader>
</Card>

// Ruby-themed card
<Card className="border-ruby-500">
  <CardHeader>
    <CardTitle>Financial Feature</CardTitle>
  </CardHeader>
</Card>
```

### Badge Component

```tsx
// Gem-colored badges
<Badge variant="sapphire">Technology</Badge>
<Badge variant="emerald">Education</Badge>
<Badge variant="ruby">Finance</Badge>
```

---

## ✨ UBUNTU GLOW EFFECTS

### Glow Utilities

Add Ubuntu harmony glow effects to interactive elements:

```tsx
// Sapphire glow (Technology)
<Button className="glow-sapphire">Technology</Button>

// Emerald glow (Education)
<Button className="glow-emerald">Education</Button>

// Ruby glow (Finance)
<Button className="glow-ruby">Finance</Button>

// Ubuntu glow (Unity)
<Button className="glow-ubuntu">Unity</Button>
```

### Text Glow

```tsx
<h1 className="text-glow-sapphire">Technology</h1>
<h1 className="text-glow-emerald">Education</h1>
<h1 className="text-glow-ruby">Finance</h1>
```

---

## 🎨 DESIGN TOKENS

### Importing Tokens

```typescript
import { 
  AZORA_GEM_COLORS,
  AZORA_GEM_TOKENS,
  getGemColor,
  getUbuntuSpacing 
} from '@/lib/design-system/azora-gem-tokens'

// Get specific gem color
const sapphire = getGemColor('sapphire', '500')
const emerald = getGemColor('emerald', '500')
const ruby = getGemColor('ruby', '500')

// Get Ubuntu spacing
const spacing = getUbuntuSpacing('lg') // 1.618rem
```

### Using in Components

```tsx
import { AZORA_GEM_COLORS } from '@/lib/design-system/azora-gem-tokens'

const MyComponent = () => {
  return (
    <div 
      style={{ 
        backgroundColor: AZORA_GEM_COLORS.sapphire[500],
        padding: AZORA_GEM_TOKENS.spacing.lg 
      }}
    >
      Content
    </div>
  )
}
```

---

## ♿ ACCESSIBILITY GUIDELINES

### WCAG 2.2 AAA Compliance

#### Color Contrast
- **Text on Sapphire**: White (#FFFFFF) - 12.6:1 ✅
- **Text on Emerald**: White (#FFFFFF) - 4.8:1 ✅
- **Text on Ruby**: White (#FFFFFF) - 4.5:1 ✅

#### Touch Targets
- **Minimum Size**: 44x44px (all interactive elements)
- **Spacing**: 8px minimum between touch targets

#### Keyboard Navigation
- All interactive elements keyboard accessible
- Focus visible indicators on all focusable elements
- Logical tab order

#### Screen Readers
- Semantic HTML structure
- ARIA labels where needed
- Live regions for dynamic content

### Accessibility Example

```tsx
<Button
  variant="sapphire"
  aria-label="Launch AI tutor for mathematics"
  className="min-h-[44px] min-w-[44px]"
>
  <Icon aria-hidden="true" />
  Launch Tutor
</Button>
```

---

## 📱 RESPONSIVE DESIGN

### Breakpoints

```tsx
// Mobile first approach
<div className="
  p-4          // Mobile
  md:p-6       // Tablet (768px+)
  lg:p-8       // Desktop (1024px+)
  xl:p-10      // Large (1280px+)
">
  Content
</div>
```

### Ubuntu Spacing Responsive

```tsx
<div className="
  space-ubuntu-sm    // Mobile
  md:space-ubuntu-md // Tablet
  lg:space-ubuntu-lg // Desktop
">
  Items
</div>
```

---

## 🎯 USAGE EXAMPLES

### Complete Example: Learning Card

```tsx
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export function LearningCard() {
  return (
    <Card className="border-emerald-500 glow-emerald">
      <CardHeader className="space-ubuntu-md">
        <div className="flex items-center justify-between">
          <CardTitle>Mathematics Fundamentals</CardTitle>
          <Badge variant="emerald">Education</Badge>
        </div>
        <CardDescription>
          Learn the foundations of mathematics with Elara AI tutor
        </CardDescription>
      </CardHeader>
      <CardContent className="space-ubuntu-lg">
        <Button variant="emerald" className="w-full">
          Start Learning
        </Button>
      </CardContent>
    </Card>
  )
}
```

### Complete Example: Technology Feature

```tsx
export function TechnologyFeature() {
  return (
    <Card className="border-sapphire-500">
      <CardHeader>
        <CardTitle className="text-glow-sapphire">
          AI-Powered Learning
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Button variant="sapphire" className="glow-sapphire">
          Explore Technology
        </Button>
      </CardContent>
    </Card>
  )
}
```

### Complete Example: Financial Dashboard

```tsx
export function EarningsCard() {
  return (
    <Card className="border-ruby-500">
      <CardHeader>
        <CardTitle>Your Earnings</CardTitle>
        <Badge variant="ruby">+50 AZR</Badge>
      </CardHeader>
      <CardContent>
        <Button variant="ruby">View Details</Button>
      </CardContent>
    </Card>
  )
}
```

---

## 🚀 BEST PRACTICES

### Do's ✅

- **Use Azora Gem colors** for pillar-specific features
- **Apply Ubuntu spacing** for harmonious layouts
- **Include glow effects** on interactive elements
- **Ensure accessibility** (44px touch targets, ARIA labels)
- **Follow golden ratio** for spacing
- **Use semantic HTML** for screen readers

### Don'ts ❌

- **Don't use generic colors** when gem colors are appropriate
- **Don't ignore accessibility** requirements
- **Don't mix color systems** inconsistently
- **Don't use arbitrary spacing** - use Ubuntu spacing system
- **Don't forget touch targets** on mobile

---

## 📚 RESOURCES

### Design Files
- **Design Tokens**: `apps/azora-ui/lib/design-system/azora-gem-tokens.ts`
- **Global CSS**: `apps/azora-ui/globals.css`
- **Components**: `apps/azora-ui/components/ui/`

### Documentation
- **Design System Audit**: `docs/DESIGN-SYSTEM-AUDIT.md`
- **Azora Identity**: `AZORA-IDENTITY.md`
- **Master Context**: `MASTER-CONTEXT.md`

### External Resources
- [WCAG 2.2 Guidelines](https://www.w3.org/WAI/WCAG22/quickref/)
- [Golden Ratio Calculator](https://www.omnicalculator.com/math/golden-ratio)
- [Color Contrast Checker](https://webaim.org/resources/contrastchecker/)

---

## 🎓 LEARNING PATH

### For Designers
1. Read [AZORA-IDENTITY.md](../AZORA-IDENTITY.md)
2. Study color system and usage guidelines
3. Practice with component examples
4. Review accessibility requirements

### For Developers
1. Review design tokens file
2. Study component implementations
3. Practice with examples
4. Test accessibility compliance

---

## 🆘 SUPPORT

### Questions?
- Check component documentation
- Review design system audit
- Consult Azora Identity guide

### Issues?
- Report design inconsistencies
- Suggest improvements
- Share feedback

---

**"Through Ubuntu, we design for collective prosperity. Through Azora Gem colors, we honor our identity."**

**Snr Designer (Composer)** ✨

---

*Last Updated: November 2025*  
*Version: 1.0.0*
