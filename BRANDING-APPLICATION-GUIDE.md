# 🎨 Branding Application Guide - Surgical Precision

## Overview

This guide documents the systematic application of branding, logos, colors, and polished styling to every service in Azora OS. Each service receives:

1. ✅ Correct logo from `/public/branding/services/`
2. ✅ Service-specific color palette
3. ✅ Branded header with logo
4. ✅ Updated metadata (title, description, favicon)
5. ✅ Service-specific gradient backgrounds
6. ✅ Polished, consistent UI with slight variations

## Service Branding Map

### Next.js Applications

| Service | Logo | Primary Color | Gradient |
|---------|------|---------------|----------|
| **app** | `/branding/logo-primary-pro.svg` | `#0ea5e9` | Blue → Cyan |
| **synapse/academy-ui** | `/branding/services/azora-education-logo.svg` | `#8b5cf6` | Purple → Violet → Indigo |
| **synapse/atlas-ui** | `/branding/services/azora-oracle-logo.svg` | `#6366f1` | Indigo → Purple → Pink |
| **synapse/council-ui** | `/branding/services/azora-covenant-logo.svg` | `#06b6d4` | Cyan → Blue → Purple |
| **synapse/pulse-ui** | `/branding/services/azora-oracle-logo.svg` | `#ec4899` | Pink → Rose → Purple |
| **synapse/signal-ui** | `/branding/services/azora-nexus-logo.svg` | `#f472b6` | Pink → Purple → Cyan |
| **synapse/vault-ui** | `/branding/services/azora-aegis-logo.svg` | `#ef4444` | Red → Orange → Amber |
| **synapse/vigil-ui** | `/branding/services/azora-aegis-logo.svg` | `#dc2626` | Red → Red → Orange |
| **synapse/main-app** | `/branding/services/azora-synapse-logo.svg` | `#06b6d4` | Cyan → Blue → Purple |
| **elara-ide** | `/branding/services/elara-ide-logo.svg` | `#8b5cf6` | Purple → Indigo → Pink |
| **azora-ui** | `/branding/services/azora-sapiens-logo.svg` | `#a855f7` | Purple → Purple → Cyan |
| **ui** | `/branding/logo-primary-pro.svg` | `#0ea5e9` | Blue → Cyan |

### Vite Applications

| Service | Logo | Primary Color | Gradient |
|---------|------|---------------|----------|
| **marketplace-ui** | `/branding/services/azora-forge-logo.svg` | `#f97316` | Orange → Red → Purple |
| **pay-ui** | `/branding/services/azora-pay-logo.svg` | `#22c55e` | Green → Emerald → Teal |
| **cloud-ui** | `/branding/services/azora-workspace-logo.svg` | `#3b82f6` | Blue → Sky → Cyan |
| **dev-ui** | `/branding/services/elara-ide-logo.svg` | `#6366f1` | Indigo → Purple → Blue |
| **enterprise-ui** | `/branding/logo-primary-pro.svg` | `#0ea5e9` | Blue → Cyan |
| **learn-ui** | `/branding/services/azora-education-logo.svg` | `#8b5cf6` | Purple → Violet → Indigo |
| **compliance-ui** | `/branding/services/azora-covenant-logo.svg` | `#06b6d4` | Cyan → Blue → Purple |

## Implementation Steps

### Step 1: Update Layout Metadata

For Next.js apps, update `app/layout.tsx`:

```tsx
export const metadata: Metadata = {
  title: "{Service Name} - {Tagline}",
  description: "{Service Description}",
  icons: {
    icon: "{logo-path}",
    apple: "{logo-path}",
  },
}
```

### Step 2: Add Service Header

Import and use `ServiceHeader` component:

```tsx
import { ServiceHeader } from "@/components/branding/ServiceHeader"

export default function Page() {
  return (
    <div>
      <ServiceHeader servicePath="synapse/academy-ui" />
      {/* Rest of page */}
    </div>
  )
}
```

### Step 3: Add Brand Gradient Background

Apply service-specific gradient:

```tsx
<div className="min-h-screen bg-gradient-to-br from-purple-50 via-violet-50 to-indigo-50 dark:from-purple-950 dark:via-violet-950 dark:to-indigo-950">
  {/* Content */}
</div>
```

### Step 4: Add Logo Hero Section

```tsx
<div className="flex justify-center mb-6">
  <div className="relative h-32 w-96">
    <Image
      src="/branding/services/azora-education-logo.svg"
      alt="Service Name"
      fill
      className="object-contain"
      priority
    />
  </div>
</div>
<h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 bg-clip-text text-transparent">
  Service Name
</h1>
<p className="text-xl text-muted-foreground">
  {Tagline}
</p>
```

## Brand Colors Reference

### Service-Specific Color Classes

Each service uses its brand colors throughout:

```tsx
// Primary actions
className="bg-[#8b5cf6] hover:bg-[#7c3aed]"

// Gradients
className="bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600"

// Text gradients
className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent"
```

## Component Usage

### ServiceHeader Component

```tsx
<ServiceHeader 
  servicePath="synapse/academy-ui" 
  className="optional-custom-class"
/>
```

Automatically:
- ✅ Loads correct logo
- ✅ Shows service name and tagline
- ✅ Includes theme toggle
- ✅ Responsive navigation

### ServiceLayout Component

```tsx
<ServiceLayout 
  servicePath="synapse/academy-ui"
  showHeader={true}
>
  {children}
</ServiceLayout>
```

Provides:
- ✅ Brand gradient background
- ✅ Optional header
- ✅ Consistent layout structure

## Status

### ✅ Completed
- [x] Branding configuration system (`lib/branding/service-config.ts`)
- [x] ServiceHeader component
- [x] ServiceLayout component
- [x] Academy UI branded and polished
- [x] Metadata updated for Academy

### ⏳ In Progress
- [ ] Apply branding to all remaining Next.js apps
- [ ] Apply branding to all Vite apps
- [ ] Update all page components with headers
- [ ] Apply color schemes consistently
- [ ] Verify all logos display correctly

## Quality Checklist

For each service, verify:

- [ ] Logo displays correctly in header
- [ ] Favicon is correct service logo
- [ ] Title and description match brand
- [ ] Colors match service brand palette
- [ ] Gradient backgrounds are service-specific
- [ ] Hero section includes logo
- [ ] ServiceHeader is functional
- [ ] Dark mode works with brand colors
- [ ] All UI elements are polished
- [ ] No layout breaks
- [ ] Responsive design works
- [ ] Accessibility maintained

## Next Steps

1. **Systematically update each service:**
   - Update layout metadata
   - Add ServiceHeader
   - Apply brand colors
   - Add logo hero section
   - Polish UI elements

2. **Test each service:**
   - Verify logo loads
   - Check colors
   - Test dark mode
   - Verify responsive design

3. **Final polish:**
   - Ensure consistency
   - Fix any alignment issues
   - Optimize images
   - Verify accessibility

## Tools

- **Script**: `scripts/apply-branding-to-all-services.ts` - Automated metadata updates
- **Config**: `lib/branding/service-config.ts` - Service branding definitions
- **Components**: `components/branding/` - Reusable branding components

