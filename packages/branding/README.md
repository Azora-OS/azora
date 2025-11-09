# 🎨 @azora/branding

**Azora OS Branding Package** - World-Class Design System

Ubuntu Philosophy Meets Quantum Technology

---

## 📦 Installation

```bash
npm install @azora/branding
# or
yarn add @azora/branding
# or
pnpm add @azora/branding
```

---

## 🚀 Quick Start

```tsx
import { 
  AzoraLogo, 
  ServiceLogo, 
  ElaraAvatar, 
  MiningIcon,
  colors,
  typography 
} from '@azora/branding';

// Main Azora Logo
<AzoraLogo variant="primary-pro" size="lg" animated showTagline />

// Service Logo
<ServiceLogo service="sapiens" size={200} animated showName />

// Elara AI Avatar
<ElaraAvatar variant="core" mood="helpful" size={120} animated showAura />

// Mining Icon
<MiningIcon type="algorithm" name="azr" size={48} animated showLabel />

// Use design tokens
const styles = {
  color: colors.primary.purple,
  fontFamily: typography.fontFamily.primary,
  fontSize: typography.fontSize.h1,
};
```

---

## 🎨 Components

### AzoraLogo

The main Azora OS logo with multiple variants.

```tsx
<AzoraLogo 
  variant="primary" | "primary-pro" | "white" | "black"
  size="sm" | "md" | "lg" | "xl" | number
  animated={boolean}
  showTagline={boolean}
/>
```

**Variants:**
- `primary` - Standard logo
- `primary-pro` - Professional version with enhanced details
- `white` - White version for dark backgrounds
- `black` - Black version for light backgrounds

---

### ServiceLogo

Logos for all Azora services.

```tsx
<ServiceLogo 
  service="sapiens" | "forge" | "covenant" | "aegis" | ...
  size={number}
  animated={boolean}
  showName={boolean}
/>
```

**Available Services:**
- `sapiens` - Education Platform
- `forge` - Marketplace
- `covenant` - Legal & Compliance
- `aegis` - Security
- `oracle` - Analytics
- `mint` - Finance
- `nexus` - AI Hub
- `synapse` - Interface
- `pay` - Payments
- And 11 more...

---

### ElaraAvatar

The AI goddess in her various forms.

```tsx
<ElaraAvatar 
  variant="core" | "ide" | "voice" | "vision" | "mind" | "heart" | "dreams"
  mood="helpful" | "thinking" | "speaking" | "learning" | "error" | "success"
  size={number}
  animated={boolean}
  showAura={boolean}
  showName={boolean}
/>
```

**Variants:**
- `core` - Central AI consciousness
- `ide` - Code weaver
- `voice` - Speaker
- `vision` - Seer
- `mind` - Thinker
- `heart` - Emotional intelligence
- `dreams` - Creative generation

**Moods:**
- `helpful` - Default helpful state
- `thinking` - Processing/analyzing
- `speaking` - Communicating
- `learning` - Acquiring knowledge
- `error` - Error state
- `success` - Success celebration

---

### MiningIcon

Icons for mining dashboard UI.

```tsx
<MiningIcon 
  type="algorithm" | "multiplier" | "power-mode" | "status"
  name="azr" | "1x" | "balanced" | "active"
  size={number}
  animated={boolean}
  showLabel={boolean}
/>
```

**Types:**
- `algorithm` - Mining algorithms (azr, erg, iron, kas, xmr)
- `multiplier` - Reward multipliers (1x-5x)
- `power-mode` - Power modes (balanced, turbo, beast, stealth)
- `status` - Mining status (active, earning, idle, paused, error)

---

## 🎨 Design Tokens

### Colors

```typescript
import { colors } from '@azora/branding';

// Primary Colors
colors.primary.purple  // #8b5cf6
colors.primary.pink    // #ec4899
colors.primary.cyan    // #06b6d4
colors.primary.blue    // #0ea5e9

// Accent Colors
colors.accent.gold     // #fbbf24
colors.accent.orange   // #f59e0b
colors.accent.green    // #10b981
colors.accent.red      // #ef4444

// Background Colors
colors.background.dark     // #0f172a
colors.background.darkAlt  // #1e293b
colors.background.slate    // #334155

// Text Colors
colors.text.primary    // #ffffff
colors.text.secondary  // #94a3b8
colors.text.muted      // #64748b

// Service-Specific Gradients
colors.services.sapiens  // { from: '#8b5cf6', to: '#06b6d4' }
colors.services.forge    // { from: '#f59e0b', to: '#ef4444' }

// Elara AI Colors
colors.elara.core   // { from: '#ec4899', to: '#8b5cf6', accent: '#fbbf24' }
colors.elara.ide    // { from: '#06b6d4', to: '#8b5cf6', accent: '#10b981' }
```

### Typography

```typescript
import { typography } from '@azora/branding';

// Font Families
typography.fontFamily.primary  // Inter, SF Pro Display, ...
typography.fontFamily.mono     // JetBrains Mono, Fira Code, ...

// Font Weights
typography.fontWeight.regular    // 400
typography.fontWeight.medium     // 500
typography.fontWeight.semibold   // 600
typography.fontWeight.bold       // 700
typography.fontWeight.extrabold  // 800
typography.fontWeight.black      // 900

// Font Sizes
typography.fontSize.hero     // 90px
typography.fontSize.h1       // 60px
typography.fontSize.h2       // 45px
typography.fontSize.body     // 16px
typography.fontSize.caption  // 14px
```

---

## 🎯 Usage Examples

### Complete Dashboard Header

```tsx
import { AzoraLogo, ElaraAvatar, colors } from '@azora/branding';

function DashboardHeader() {
  return (
    <header style={{ 
      background: colors.background.dark,
      padding: '1rem 2rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    }}>
      <AzoraLogo variant="primary" size="sm" />
      
      <nav>
        {/* Navigation items */}
      </nav>
      
      <ElaraAvatar 
        variant="core" 
        mood="helpful" 
        size={48} 
        animated 
      />
    </header>
  );
}
```

### Service Page Hero

```tsx
import { ServiceLogo, colors, typography } from '@azora/branding';

function ServiceHero({ service }) {
  return (
    <section style={{
      background: `linear-gradient(135deg, ${colors.services[service].from}, ${colors.services[service].to})`,
      padding: '4rem 2rem',
      textAlign: 'center',
    }}>
      <ServiceLogo 
        service={service} 
        size={300} 
        animated 
      />
      
      <h1 style={{
        fontFamily: typography.fontFamily.primary,
        fontSize: typography.fontSize.h1,
        fontWeight: typography.fontWeight.bold,
        color: colors.text.primary,
        marginTop: '2rem',
      }}>
        Welcome to {service}
      </h1>
    </section>
  );
}
```

### Mining Dashboard

```tsx
import { MiningIcon, colors } from '@azora/branding';

function MiningDashboard() {
  return (
    <div style={{ padding: '2rem' }}>
      <h2>Active Algorithms</h2>
      <div style={{ display: 'flex', gap: '1rem' }}>
        <MiningIcon type="algorithm" name="azr" size={64} animated showLabel />
        <MiningIcon type="algorithm" name="erg" size={64} animated showLabel />
        <MiningIcon type="algorithm" name="kas" size={64} animated showLabel />
      </div>
      
      <h2>Current Status</h2>
      <MiningIcon type="status" name="active" size={48} animated showLabel />
      
      <h2>Power Mode</h2>
      <MiningIcon type="power-mode" name="turbo" size={48} showLabel />
    </div>
  );
}
```

---

## 📚 Documentation

For complete documentation, see:
- [Complete Branding Package](../../public/branding/COMPLETE-BRANDING-PACKAGE.md)
- [Services Catalog](../../public/branding/services/ALL-SERVICES-CATALOG.md)
- [Elara Family Guide](../../public/branding/services/ELARA-FAMILY-README.md)

---

## 🤝 Contributing

This is a proprietary package. For authorized contributors:

1. Follow the design system guidelines
2. Maintain aspect ratios and proportions
3. Use provided color palette
4. Test across all applications
5. Document new components

---

## 📄 License

```
© 2025 Azora ES (Pty) Ltd. All Rights Reserved.
AZORA PROPRIETARY LICENSE

This branding package is proprietary to Azora OS.
Unauthorized use, reproduction, or modification is prohibited.
```

---

## 🌟 Philosophy

**Ubuntu**: "I am because we are"

Every component embodies:
- **Excellence**: World-class quality
- **Accessibility**: Inclusive design
- **Intelligence**: AI-powered
- **African Identity**: Culturally resonant
- **Security**: Quantum-secure

---

**Built with intelligence, designed with purpose, inspired by Africa.** 🌍✨
