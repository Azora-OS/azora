# Dev-UI Structure & UI Plan
## Following Academy Pattern

---

## 🎯 What We're Building

**Dev-UI** = **Azora OS Services Management Dashboard**
- Central hub to monitor and manage all 24+ services
- Beautiful, modern UI following Academy's design patterns
- Service health monitoring
- Quick access to configure and deploy services

---

## 📐 Structure (Following Academy Pattern)

### Current Structure Problems
1. ❌ Two entry points (App.jsx + App.tsx) - confusing
2. ❌ No branding system like Academy has
3. ❌ Generic panels look placeholder-y
4. ❌ No service discovery/registry
5. ❌ Inconsistent component usage

### Proposed Structure (Clean & Simple)

```
dev-ui/
├── src/
│   ├── app/                    # Main app (like Academy's app/)
│   │   ├── layout.tsx          # Root layout with ThemeProvider
│   │   ├── page.tsx            # Main dashboard (service overview)
│   │   ├── services/           # Service routes
│   │   │   ├── [serviceId]/
│   │   │   │   └── page.tsx   # Individual service panel
│   │   ├── compliance/        # Compliance dashboard
│   │   │   ├── dashboard/      # Main compliance view
│   │   │   ├── alerts/        # Alerts view
│   │   │   ├── reports/        # Reports view
│   │   │   └── metrics/        # Metrics view
│   │   └── auth/               # Auth pages (if needed)
│   │
│   ├── components/
│   │   ├── branding/
│   │   │   ├── ServiceHeader.tsx    # Like Academy (header with logo, nav, theme)
│   │   │   ├── ServiceLayout.tsx    # Like Academy (layout wrapper)
│   │   │   └── service-config.ts    # Service branding config
│   │   │
│   │   ├── services/
│   │   │   ├── ServiceCard.tsx      # Service card for overview
│   │   │   ├── ServicePanel.tsx     # Unified service panel (base)
│   │   │   ├── ServiceStatus.tsx    # Status indicators
│   │   │   └── ServiceRegistry.tsx   # Service discovery/list
│   │   │
│   │   ├── compliance/              # Compliance components
│   │   │   ├── ComplianceDashboard.tsx
│   │   │   ├── FrameworkGrid.tsx
│   │   │   └── ComplianceCharts.tsx
│   │   │
│   │   ├── ui/                       # shadcn/ui components (already have)
│   │   │   └── ...
│   │   │
│   │   └── shared/
│   │       ├── Sidebar.tsx
│   │       └── Navigation.tsx
│   │
│   ├── lib/
│   │   ├── services/           # Service client utilities
│   │   │   ├── service-client.ts     # Base service client
│   │   │   ├── service-registry.ts   # Service registry/config
│   │   │   └── service-health.ts     # Health check utilities
│   │   │
│   │   ├── api/                 # API utilities
│   │   │   └── client.ts        # React Query setup
│   │   │
│   │   └── utils.ts             # Utilities
│   │
│   ├── hooks/                    # Custom hooks
│   │   ├── useService.ts         # Service data hook
│   │   └── useServiceHealth.ts   # Health monitoring hook
│   │
│   ├── types/                    # TypeScript types
│   │   ├── services.ts          # Service types
│   │   └── compliance.ts       # Compliance types (already have)
│   │
│   └── main.tsx                  # Single entry point
│
├── public/
│   └── branding/
│       └── services/
│           └── azora-dev-logo.svg    # Dev-UI logo
│
└── package.json
```

---

## 🎨 UI Design (Following Academy Style)

### 1. Main Dashboard (`/`)
**Purpose**: Service overview and quick access

```
┌─────────────────────────────────────────────────────────┐
│  ServiceHeader (Logo, Nav, Theme Toggle, User)          │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Welcome Section (Gradient Card)                        │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Welcome back, [User]! 👋                        │  │
│  │ System Health: 98% • 24 Active Services          │  │
│  └──────────────────────────────────────────────────┘  │
│                                                          │
│  Stats Grid (4 Cards)                                    │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐                  │
│  │Active│ │Health│ │Errors│ │Uptime│                  │
│  │  24  │ │ 98%  │ │   2  │ │99.9% │                  │
│  └──────┘ └──────┘ └──────┘ └──────┘                  │
│                                                          │
│  Service Grid (Cards)                                    │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐      │
│  │ Retail      │ │ EV Leader   │ │ Analytics   │      │
│  │ ✅ Active   │ │ ✅ Active   │ │ ⚠️ Warning   │      │
│  │ 98% Health  │ │ 99% Health  │ │ 85% Health  │      │
│  └─────────────┘ └─────────────┘ └─────────────┘      │
│  ... (all 24 services)                                  │
│                                                          │
│  Recent Activity (Side Panel)                            │
│  ┌──────────────────────┐                               │
│  │ Recent Events        │                               │
│  │ • Service deployed   │                               │
│  │ • Alert resolved     │                               │
│  │ • Health check       │                               │
│  └──────────────────────┘                               │
└─────────────────────────────────────────────────────────┘
```

### 2. Service Panel (`/services/[serviceId]`)
**Purpose**: Individual service management

```
┌─────────────────────────────────────────────────────────┐
│  ServiceHeader                                          │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Service Header (Gradient)                              │
│  ┌──────────────────────────────────────────────────┐  │
│  │ [Service Logo]  Service Name                     │  │
│  │ Status: ✅ Active | Health: 98% | Uptime: 99.9%  │  │
│  └──────────────────────────────────────────────────┘  │
│                                                          │
│  Quick Stats (4 Cards)                                  │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐                  │
│  │Requests│ │Latency│ │Errors│ │Users│                  │
│  │ 1,247 │ │ 45ms │ │   2  │ │ 156 │                  │
│  └──────┘ └──────┘ └──────┘ └──────┘                  │
│                                                          │
│  Service Content (Tabs or Sections)                     │
│  ┌──────────────────────────────────────────────────┐  │
│  │ [Overview] [Metrics] [Logs] [Config]            │  │
│  ├──────────────────────────────────────────────────┤  │
│  │                                                  │  │
│  │  Service-specific content here                  │  │
│  │  (charts, tables, forms, etc.)                  │  │
│  │                                                  │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### 3. Compliance Dashboard (`/compliance/dashboard`)
**Purpose**: Compliance monitoring (from App.tsx)

```
┌─────────────────────────────────────────────────────────┐
│  ServiceHeader                                          │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Compliance Overview                                    │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Overall Compliance: 85%                          │  │
│  │ ✅ Compliant: 12 | ⚠️ Needs Attention: 5         │  │
│  │ ❌ Non-Compliant: 2 | ⏸️ Unreachable: 1          │  │
│  └──────────────────────────────────────────────────┘  │
│                                                          │
│  Framework Grid (Cards)                                 │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐      │
│  │ GDPR        │ │ HIPAA       │ │ SOC 2       │      │
│  │ ✅ Compliant│ │ ⚠️ Warning  │ │ ✅ Compliant│      │
│  └─────────────┘ └─────────────┘ └─────────────┘      │
│                                                          │
│  Charts & Metrics                                        │
│  ┌──────────────────────────────────────────────────┐  │
│  │ [Compliance Score Chart]                          │  │
│  │ [Regional Compliance]                             │  │
│  │ [Recent Activity]                                │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

---

## 🛠️ Implementation Plan

### Phase 1: Foundation (Do This First)
1. **Single Entry Point**
   - ✅ Keep `main.tsx` (React Query + ThemeProvider)
   - ❌ Remove `main.jsx` or merge functionality
   - ✅ Use React Router for routing (like Academy uses Next.js routing)

2. **Branding System** (Like Academy)
   - Create `ServiceHeader` component (logo, nav, theme toggle)
   - Create `ServiceLayout` wrapper
   - Add service config for branding
   - Add dev-ui logo

3. **Service Registry**
   - Create service registry/config file
   - List all 24 services with metadata
   - Service health status system

### Phase 2: Main Dashboard
1. **Service Overview Page** (`/`)
   - Welcome card (gradient, like Academy)
   - Stats grid (4 cards)
   - Service grid (all 24 services as cards)
   - Recent activity sidebar

2. **Service Cards**
   - Status indicator (✅ Active, ⚠️ Warning, ❌ Error)
   - Health percentage
   - Quick actions (View, Configure, Monitor)

### Phase 3: Service Panels
1. **Unified Service Panel Component**
   - Base ServicePanel with standard layout
   - Service-specific content sections
   - Health indicators
   - Action buttons

2. **Migrate Existing Panels**
   - Keep fully implemented ones (Retail, EV Leader, etc.)
   - Upgrade generic ones gradually
   - Add real data connections

### Phase 4: Compliance Dashboard
1. **Migrate App.tsx to Route**
   - Move to `/compliance/dashboard`
   - Move alerts, reports, metrics to routes
   - Keep same functionality

---

## 🎨 Design System (Following Academy)

### Colors
- **Primary**: Blue/Indigo (like Academy uses Purple/Violet)
- **Gradients**: `bg-gradient-to-r from-blue-600 to-indigo-600`
- **Cards**: Clean white/dark with subtle borders
- **Status Colors**: 
  - ✅ Green (Active/Healthy)
  - ⚠️ Yellow (Warning)
  - ❌ Red (Error)
  - ⏸️ Gray (Inactive)

### Components
- **Cards**: shadcn/ui Card component
- **Buttons**: shadcn/ui Button with gradients
- **Badges**: shadcn/ui Badge for status
- **Icons**: Lucide React (consistent with Academy)
- **Animations**: Framer Motion (like Academy)

### Layout
- **Header**: Sticky, backdrop blur (like Academy)
- **Content**: Container with padding
- **Grid**: Responsive grid (1/2/4 columns)
- **Spacing**: Consistent spacing (gap-6, p-6, etc.)

---

## 📊 Service Registry Structure

```typescript
// lib/services/service-registry.ts

export interface Service {
  id: string
  name: string
  description: string
  category: 'business' | 'transport' | 'ai' | 'infrastructure'
  status: 'active' | 'warning' | 'error' | 'inactive'
  health: number // 0-100
  endpoint?: string
  port?: number
  icon?: string
  panel?: 'custom' | 'generic'
}

export const services: Service[] = [
  {
    id: 'retail-partner',
    name: 'Retail Partner',
    description: 'Retail management & partner integration',
    category: 'business',
    status: 'active',
    health: 98,
    endpoint: '/api/retail',
    panel: 'custom'
  },
  // ... all 24 services
]
```

---

## 🚀 Quick Wins (Start Here)

1. **Create ServiceHeader** (30 min)
   - Copy pattern from Academy
   - Add dev-ui branding
   - Theme toggle (already done)

2. **Create Service Registry** (30 min)
   - List all 24 services
   - Basic metadata
   - Status indicators

3. **Main Dashboard** (1-2 hours)
   - Service grid
   - Stats cards
   - Welcome section

4. **Unified ServicePanel** (1 hour)
   - Base component
   - Standard layout
   - Health indicators

---

## 🎯 Success Criteria

- ✅ Single entry point (no confusion)
- ✅ Beautiful UI matching Academy quality
- ✅ All 24 services visible and accessible
- ✅ Service health monitoring
- ✅ Consistent branding
- ✅ Theme toggle works everywhere
- ✅ Clean, maintainable structure

---

**Next Step**: Start with Phase 1 - Foundation. Build ServiceHeader and Service Registry first, then main dashboard.


