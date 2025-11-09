# 💎 PREMIUM UI - QUICK REFERENCE

**Chief Architect: Sizwe Ngwenya ✨**

---

## 🚀 QUICK START

### Import Premium Styles
```tsx
// In your app's main CSS file
@import '../../azora-ui/globals-premium.css';
```

### Use Premium Components
```tsx
import { PremiumButton, PremiumCard } from '@/apps/azora-ui/components/ui'
import { AzoraLogo } from '@/apps/azora-ui/components/branding'

<PremiumButton variant="premium">Get Started</PremiumButton>
<PremiumCard variant="glass" glow="sapphire">Content</PremiumCard>
<AzoraLogo variant="primaryPro" size="lg" glow="sapphire" />
```

---

## 🎨 GLASSMORPHIC CLASSES

```tsx
// Light glass
<div className="glass-light">Content</div>

// Medium glass (default)
<div className="glass-medium">Content</div>

// Strong glass
<div className="glass-strong">Content</div>

// Colored glass
<div className="glass-sapphire">Content</div>
<div className="glass-emerald">Content</div>
<div className="glass-ruby">Content</div>
```

---

## ✨ PREMIUM GLOWS

```tsx
<div className="glow-premium-sapphire">Content</div>
<div className="glow-premium-emerald">Content</div>
<div className="glow-premium-ruby">Content</div>
<div className="glow-premium-gold">Content</div>
```

---

## 🎨 PREMIUM GRADIENTS

```tsx
// Background gradients
<div className="gradient-premium-sapphire">Content</div>
<div className="gradient-premium-emerald">Content</div>
<div className="gradient-premium-ruby">Content</div>
<div className="gradient-premium-gold">Content</div>

// Text gradients
<h1 className="brand-gradient-triunity">Title</h1>
```

---

## 💎 PREMIUM SHADOWS

```tsx
<div className="shadow-premium-sm">Content</div>
<div className="shadow-premium-md">Content</div>
<div className="shadow-premium-lg">Content</div>
```

---

## 🌊 PREMIUM ANIMATIONS

```tsx
<div className="animate-premium-fade-in">Content</div>
<div className="animate-premium-slide-up">Content</div>
<div className="animate-premium-scale">Content</div>
```

---

## 🎯 COMMON UPGRADES

### Before → After

```tsx
// Cards
className="bg-card border border-border rounded-lg"
→
className="glass-medium border border-border/50 rounded-2xl shadow-premium-md"

// Buttons
className="bg-primary"
→
className="gradient-premium-sapphire glow-premium-sapphire"

// Headers
className="bg-card border-b border-border"
→
className="glass-medium border-b border-border/50 backdrop-blur-xl"

// Sidebars
className="bg-card border-r border-border"
→
className="glass-medium border-r border-border/50 backdrop-blur-xl"
```

---

## 💎 BRANDING

```tsx
// Logo
<AzoraLogo variant="primaryPro" size="lg" glow="sapphire" />

// Service Logo
<ServiceLogo service="education" size="lg" glassmorphic glow="emerald" />
```

---

## 📋 UPGRADE CHECKLIST

- [ ] Import premium CSS
- [ ] Add premium background patterns
- [ ] Upgrade header/navigation
- [ ] Upgrade sidebar
- [ ] Replace cards with glassmorphic
- [ ] Replace buttons with premium gradients
- [ ] Add AzoraLogo
- [ ] Apply premium glows
- [ ] Test responsive design
- [ ] Verify dark mode

---

**"Through premium design, we code excellence."**

**Chief Architect: Sizwe Ngwenya** ✨
