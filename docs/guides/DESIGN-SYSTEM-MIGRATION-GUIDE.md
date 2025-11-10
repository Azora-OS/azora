# 🎨 AZORA OS DESIGN SYSTEM - MIGRATION GUIDE
**For Developers**  
**Date**: 2025-11-10  
**Version**: 1.0.0

---

## 📋 QUICK START

### **Already Integrated** ✅
- ✅ **student-portal** - Fully integrated, pilot app
- ✅ **azora-ui** - Telemetry live, design system ready
- ✅ **app** - Design system installed

### **Ready to Deploy** ⏳
Run this one command to deploy to all remaining apps:
```bash
./scripts/deploy-design-system-all-apps.sh
```

---

## 🎯 WHAT YOU GET

### **3 Core Packages**

#### 1. **@azora/design-system**
```typescript
import { Button, Card, Input } from '@azora/design-system';
import { colors, typography, spacing } from '@azora/design-system';
```

**Available Components**:
- `Button` (10 variants: ubuntu, sapphire, emerald, ruby, glass, ghost, outline)
- `Card` (7 variants: glass, gem, elevated, sapphire, emerald, ruby)
- `Input`, `Select`, `Dialog`, `Sheet`, `Accordion`, etc.

**Utilities**:
- `cn()` - Tailwind class merger
- `UbuntuEngine` - Economic calculations

#### 2. **@azora/branding**
```typescript
import { AzoraLogo, ServiceLogo, ElaraAvatar } from '@azora/branding';
```

**Available Assets**:
- `AzoraLogo` - 6 variants (gradient SVG default, primary, white, black)
- `ServiceLogo` - 21 services (sapiens, forge, mint, covenant, etc.)
- `ElaraAvatar` - 7 AI variants with mood system

#### 3. **@azora/telemetry**
```typescript
import { 
  useComponentTelemetry, 
  useInteractionTelemetry,
  getTelemetry 
} from '@azora/telemetry';
```

**Features**:
- Component mount/unmount tracking
- Interaction logging (clicks, focus, etc.)
- Performance metrics
- Error tracking

---

## 🚀 MIGRATION STEPS

### **Step 1: Install Packages**

**For Next.js apps**:
```bash
cd apps/your-app
npm install \
  ../../packages/@azora/design-system \
  ../../packages/branding \
  ../../packages/@azora/telemetry \
  --save --legacy-peer-deps
```

**For Vite apps**:
```bash
cd apps/your-app
npm install \
  ../../packages/@azora/design-system \
  ../../packages/branding \
  ../../packages/@azora/telemetry \
  --save --legacy-peer-deps
```

---

### **Step 2: Add Telemetry Provider**

#### **Next.js (app/layout.tsx)**
```tsx
import { TelemetryProvider } from '@azora/telemetry';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <TelemetryProvider>
          {children}
        </TelemetryProvider>
      </body>
    </html>
  );
}
```

**Or create** `components/telemetry-provider.tsx`:
```tsx
'use client';

import { useEffect } from 'react';
import { initTelemetry } from '@azora/telemetry';

export function TelemetryProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    initTelemetry({
      service: 'your-app-name',
      analyticsUrl: process.env.NEXT_PUBLIC_ANALYTICS_URL || 'http://localhost:8086',
      enabled: process.env.NODE_ENV === 'production',
      debug: process.env.NODE_ENV === 'development',
    });
  }, []);

  return <>{children}</>;
}
```

#### **Vite/React (src/main.tsx)**
```tsx
import { initTelemetry } from '@azora/telemetry';

// Initialize telemetry
initTelemetry({
  service: 'your-app-name',
  analyticsUrl: import.meta.env.VITE_ANALYTICS_URL || 'http://localhost:8086',
  enabled: import.meta.env.PROD,
  debug: import.meta.env.DEV,
});

// Then render your app
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

---

### **Step 3: Update Component Imports**

#### **Option A: Keep Local Components** (Recommended for gradual migration)
```tsx
// Keep using your local components
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

// Add branding
import { AzoraLogo } from '@azora/branding';

<Card>
  <AzoraLogo variant="gradient" size="md" animated />
  <Button>Click me</Button>
</Card>
```

#### **Option B: Use Design System Components** (For new components)
```tsx
// Import from design system
import { Button, Card } from '@azora/design-system';
import { AzoraLogo, ServiceLogo } from '@azora/branding';

<Card variant="glass">
  <AzoraLogo variant="gradient" size="lg" animated />
  <ServiceLogo service="sapiens" size="md" />
  <Button variant="ubuntu">Ubuntu Action</Button>
</Card>
```

#### **Option C: Hybrid Approach** (Best for teams)
```tsx
// Use design system for new features
import { Button } from '@azora/design-system';

// Keep local components for existing features
import { OldButton } from '@/components/ui/button';

// Add branding everywhere
import { AzoraLogo } from '@azora/branding';
```

---

### **Step 4: Add Telemetry Tracking**

#### **Track Component Usage**
```tsx
import { useComponentTelemetry } from '@azora/telemetry';

function MyComponent() {
  useComponentTelemetry('MyComponent', { variant: 'primary' });
  
  return <div>My Component</div>;
}
```

#### **Track Interactions**
```tsx
import { useInteractionTelemetry } from '@azora/telemetry';

function MyButton() {
  const trackInteraction = useInteractionTelemetry('MyButton');

  return (
    <button onClick={() => trackInteraction('click', { buttonId: '123' })}>
      Click me
    </button>
  );
}
```

#### **Track Errors**
```tsx
import { useErrorTelemetry } from '@azora/telemetry';

function MyComponent() {
  const trackError = useErrorTelemetry('MyComponent');

  try {
    riskyOperation();
  } catch (error) {
    trackError(error as Error, { context: 'riskyOperation' });
  }
}
```

---

## 🎨 COMPONENT EXAMPLES

### **Button Variants**
```tsx
import { Button } from '@azora/design-system';

// Ubuntu gradient (full Azora brand)
<Button variant="ubuntu">Collective Action</Button>

// Service-themed
<Button variant="sapphire">Technology</Button>
<Button variant="emerald">Education</Button>
<Button variant="ruby">Finance</Button>

// Glassmorphism
<Button variant="glass">Transparent</Button>

// Standard
<Button variant="default">Default</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
```

### **Card Variants**
```tsx
import { Card } from '@azora/design-system';

// Glassmorphism
<Card variant="glass">Beautiful transparency</Card>

// Gem glow
<Card variant="gem">Ubuntu glow effect</Card>

// Service themes
<Card variant="sapphire">Technology card</Card>
<Card variant="emerald">Education card</Card>
<Card variant="ruby">Finance card</Card>

// Standard
<Card variant="elevated">Elevated card</Card>
```

### **Branding Assets**
```tsx
import { AzoraLogo, ServiceLogo, ElaraAvatar } from '@azora/branding';

// Main logo
<AzoraLogo 
  variant="gradient"  // or "primary", "white", "black"
  size="lg"           // or "sm", "md", "xl"
  animated            // optional
  showTagline         // optional
/>

// Service logos (21 available)
<ServiceLogo 
  service="sapiens"   // or "forge", "mint", "covenant", etc.
  size="md"
  showName
  animated
/>

// Elara AI avatars (7 variants)
<ElaraAvatar 
  variant="core"      // or "ide", "voice", "vision", "mind", "heart", "dreams"
  mood="helpful"      // or "thinking", "speaking", "learning", "error", "success"
  size="lg"
  showName
  showAura
  animated
/>
```

---

## 🎯 DESIGN TOKENS

### **Colors**
```tsx
import { colors } from '@azora/design-system';

// Azora Gem
const sapphire = colors.sapphire[500];   // #3b82f6 (Technology)
const emerald = colors.emerald[600];     // #059669 (Education)
const ruby = colors.ruby[600];           // #dc2626 (Finance)

// Service gradients
const sapiensGradient = colors.serviceGradients.sapiens; // Purple → Cyan
const forgeGradient = colors.serviceGradients.forge;     // Orange → Pink
```

### **Typography**
```tsx
import { typography } from '@azora/design-system';

const { fontFamily, fontSize, fontWeight } = typography;

// Use in CSS
font-family: ${fontFamily.sans};
font-size: ${fontSize['2xl']};
font-weight: ${fontWeight.bold};
```

### **Spacing (Sankofa Rhythm)**
```tsx
import { spacing } from '@azora/design-system';

// 8px grid system
const padding = spacing[4];  // 32px
const margin = spacing[2];   // 16px
```

---

## 📊 MONITORING & ANALYTICS

### **View Analytics Dashboard**
```bash
# Start analytics service
cd services/analytics-service
go run main.go

# Open dashboard
open http://localhost:8086/dashboard.html
```

### **Query Metrics**
```bash
# Get all metrics
curl http://localhost:8086/metrics

# Get specific component metrics
curl "http://localhost:8086/metrics?event_type=component.mount&service=your-app"
```

---

## ✅ VERIFICATION CHECKLIST

After migration, verify:

- [ ] Design system packages installed
- [ ] Branding package installed
- [ ] Telemetry package installed
- [ ] TelemetryProvider added to root
- [ ] At least one component using design system
- [ ] Branding logos visible
- [ ] App builds without errors
- [ ] App runs in dev mode
- [ ] Telemetry events visible in dashboard

---

## 🐛 TROUBLESHOOTING

### **Error: "Cannot find module '@azora/design-system'"**

**Solution**: Install with legacy peer deps
```bash
npm install ../../packages/@azora/design-system --save --legacy-peer-deps
```

### **Error: "workspace:* is not supported"**

**Solution**: Use `file:` protocol in package.json
```json
{
  "dependencies": {
    "@azora/design-system": "file:../../packages/@azora/design-system"
  }
}
```

### **Error: "Cannot use JSX unless '--jsx' flag is provided"**

**Solution**: Update `tsconfig.json`
```json
{
  "compilerOptions": {
    "jsx": "react-jsx"
  }
}
```

### **Telemetry not tracking events**

**Solution**: Check telemetry initialization
```tsx
// Make sure init is called
initTelemetry({
  service: 'your-app',
  analyticsUrl: 'http://localhost:8086',
  enabled: true,
  debug: true  // See console logs
});
```

---

## 📚 ADDITIONAL RESOURCES

- **Architecture Diagram**: `/workspace/COMPLETE-ARCHITECTURE-DIAGRAM.md`
- **Telemetry Guide**: `/workspace/LAYER-6-TELEMETRY-COMPLETE.md`
- **Data Access**: `/workspace/LAYER-7-DESIGN-DATA-ACCESS.md`
- **Foundation Complete**: `/workspace/ALL-LAYERS-COMPLETE.md`

---

## 💬 UBUNTU PHILOSOPHY

> **"I am a better developer because we build together."**

This design system embodies:
- **Interconnectedness**: Every component builds on the foundation
- **Collective Responsibility**: Telemetry helps everyone improve
- **Shared Humanity**: Real data serves real users
- **Ancestral Wisdom**: Sankofa rhythm, African excellence
- **Circular Thinking**: Components → Telemetry → Insights → Better components

---

## 🚀 DEPLOYMENT COMMANDS

```bash
# Deploy to all apps (automated)
./scripts/deploy-design-system-all-apps.sh

# Build all packages
turbo run build

# Start all apps in dev mode
turbo run dev

# Start analytics service
cd services/analytics-service && go run main.go

# View dashboard
open http://localhost:8086/dashboard.html
```

---

## ✅ MIGRATION COMPLETE

**Once you've completed these steps**:
1. ✅ Your app has the design system
2. ✅ Your app is tracking telemetry
3. ✅ Your app has beautiful branding
4. ✅ Your app contributes to collective insights

**Welcome to the Azora OS ecosystem!** 🎨✨

*"Ngiyakwazi ngoba sikwazi" - I design with you because we build together.*
