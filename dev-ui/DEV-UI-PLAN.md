# Dev-UI Development Plan

## 🎯 Purpose of Dev-UI

The **dev-ui** is the **Azora OS Development Portal** - a unified services management dashboard that provides:
- **Service Management**: Monitor and manage 24+ AI-powered services
- **Compliance Dashboard**: Track regulatory compliance across frameworks
- **System Health**: Monitor service status, performance, and metrics
- **Service Configuration**: Configure and deploy new services

---

## 📊 Current Architecture

### Two Entry Points (Need Consolidation)

1. **`App.jsx`** (main.jsx) - **Main Services Dashboard**
   - Full routing with React Router
   - Authentication & authorization
   - 24 service panels
   - Dashboard, onboarding, subscription pages

2. **`App.tsx`** (main.tsx) - **Compliance Dashboard**
   - Standalone compliance monitoring
   - 4 views: Dashboard, Alerts, Reports, Metrics
   - Uses React Query for data fetching
   - Connects to `localhost:4000/api/compliance/dashboard`

### Issue: Two separate apps, need to merge or choose one

---

## 🛠️ 24 Service Panels Inventory

### ✅ Fully Implemented Services (8)
These have custom implementations with ServicePanel:

1. **Retail Partner** - Retail management & partner integration
2. **EV Leader** - Electric vehicle fleet management
3. **Neural Context** - AI context management
4. **Safety Orchestrator** - Safety system orchestration
5. **Tracking Engine** - Asset/vehicle tracking
6. **Deep Mind** - Deep learning AI service
7. **Analytics** - Analytics & reporting
8. **Crypto Ledger** - Cryptocurrency ledger management
9. **TMS** - Transportation Management System
10. **Klipp** - Payment processing
11. **AI Evolution** - AI evolution tracking

### 🔨 Generic Placeholders (13)
These use GenericServicePanel (need implementation):

12. **Compliance** - ⚠️ Has duplicate implementation (needs cleanup)
13. **Document Vault** - Document storage & management
14. **Maintenance** - System maintenance
15. **Onboarding** - Employee onboarding
16. **Traffic Routing** - Traffic optimization
17. **Trip Planning** - Route planning
18. **Admin** - System administration
19. **Driver Behavior** - Driver analytics
20. **Document Verification** - Document verification
21. **Accessibility** - Accessibility services
22. **HR Deputy** - HR management
23. **AI Assistant** - AI assistant service
24. **Cold Chain** - Cold chain logistics

---

## 🎨 Current UI Components

### Layout Components
- ✅ `MainLayout` - Main app layout with sidebar
- ✅ `AuthLayout` - Authentication layout
- ✅ `Header` - Updated with theme toggle
- ✅ `Sidebar` - Updated with theme-aware components

### Service Components
- ✅ `ServicePanel` - Base service panel component
- ✅ `GenericServicePanel` - Placeholder for unimplemented services
- ⚠️ `CompliancePanel` - Has duplicate/corrupted code (needs cleanup)

### Shared Components
- ✅ `FrameworkStatusGrid` - Compliance framework grid
- ✅ `RecentActivity` - Activity feed
- ✅ Full shadcn/ui component library

---

## 📋 Development Plan

### Phase 1: Architecture Consolidation (Priority: HIGH)

#### 1.1 Merge or Choose Entry Point
- [ ] **Decision**: Merge App.tsx compliance into App.jsx OR keep separate?
- [ ] If merge: Add compliance routes to App.jsx
- [ ] If separate: Document which entry point to use when
- [ ] Update routing to include compliance dashboard

#### 1.2 Standardize Entry Points
- [ ] Choose one `main.jsx` or `main.tsx`
- [ ] Consolidate ThemeProvider implementations
- [ ] Ensure React Query is available in main app
- [ ] Test both entry points work correctly

**Recommendation**: Merge App.tsx into App.jsx as `/dashboard/compliance` route

---

### Phase 2: Service Panel Enhancement (Priority: HIGH)

#### 2.1 Service Panel Standardization
- [ ] Create unified ServicePanel component interface
- [ ] Standardize props and data structure
- [ ] Add service health indicators
- [ ] Implement service status badges

#### 2.2 Service Status Dashboard
- [ ] Create service registry/status page
- [ ] Show all 24 services with status
- [ ] Add filtering (Active, Inactive, Needs Attention)
- [ ] Add quick actions (Configure, Monitor, Deploy)

#### 2.3 Backend Integration
- [ ] Map each service to backend API endpoints
- [ ] Create service client utilities
- [ ] Implement error handling
- [ ] Add retry logic for failed services

---

### Phase 3: Generic Service Implementation (Priority: MEDIUM)

#### 3.1 Prioritize Services by Business Value
**High Priority:**
- [ ] Compliance Panel (needs cleanup)
- [ ] Admin Panel (system management)
- [ ] Analytics Panel (enhance existing)
- [ ] Document Vault (document management)

**Medium Priority:**
- [ ] HR Deputy (HR workflows)
- [ ] Maintenance (system maintenance)
- [ ] AI Assistant (chat interface)

**Low Priority:**
- [ ] Traffic Routing
- [ ] Trip Planning
- [ ] Accessibility
- [ ] Driver Behavior
- [ ] Document Verification
- [ ] Onboarding
- [ ] Cold Chain

#### 3.2 Implementation Template
For each service:
1. Create service-specific API client
2. Design data structure/types
3. Build UI components
4. Add charts/metrics if needed
5. Implement actions (configure, monitor, etc.)
6. Add error handling
7. Test with mock/real backend

---

### Phase 4: UI/UX Improvements (Priority: MEDIUM)

#### 4.1 Dashboard Enhancements
- [ ] Service overview cards with metrics
- [ ] Quick access to most-used services
- [ ] Recent activity feed
- [ ] System health indicators
- [ ] Service deployment wizard

#### 4.2 Navigation Improvements
- [ ] Service search/filter in sidebar
- [ ] Favorites/pinned services
- [ ] Service categories/grouping
- [ ] Breadcrumb navigation
- [ ] Service shortcuts

#### 4.3 Theme & Styling
- [ ] ✅ Already done: Theme toggle
- [ ] ✅ Already done: Theme-aware components
- [ ] Add service-specific color themes
- [ ] Improve loading states
- [ ] Add skeleton loaders

---

### Phase 5: Backend Integration (Priority: HIGH)

#### 5.1 API Service Discovery
- [ ] Document all backend service endpoints
- [ ] Create API client factory
- [ ] Add service health checks
- [ ] Implement service discovery

#### 5.2 Data Fetching
- [ ] Use React Query for all data fetching
- [ ] Implement caching strategies
- [ ] Add optimistic updates
- [ ] Handle offline mode

#### 5.3 Error Handling
- [ ] Global error boundary
- [ ] Service-specific error handling
- [ ] Retry mechanisms
- [ ] User-friendly error messages

---

### Phase 6: Advanced Features (Priority: LOW)

#### 6.1 Service Management
- [ ] Service deployment wizard
- [ ] Service configuration UI
- [ ] Service monitoring dashboard
- [ ] Service logs viewer

#### 6.2 Analytics & Reporting
- [ ] Service usage analytics
- [ ] Performance metrics
- [ ] Cost tracking
- [ ] Custom reports

#### 6.3 Notifications & Alerts
- [ ] Service status alerts
- [ ] Performance warnings
- [ ] Maintenance notifications
- [ ] Compliance alerts

---

## 🔧 Technical Decisions Needed

### 1. Entry Point Strategy
**Option A**: Merge App.tsx into App.jsx
- Pros: Single entry point, unified routing
- Cons: Need to refactor compliance dashboard

**Option B**: Keep separate, add route to App.jsx
- Pros: Minimal changes
- Cons: Two codebases to maintain

**Recommendation**: Option A - Merge and consolidate

### 2. Service Panel Architecture
**Option A**: All services use same ServicePanel component
- Pros: Consistent UI, easier maintenance
- Cons: Less flexibility

**Option B**: Each service has custom implementation
- Pros: Service-specific features
- Cons: More code, harder to maintain

**Recommendation**: Hybrid - Base ServicePanel with service-specific extensions

### 3. Backend Integration
**Option A**: Direct API calls from each panel
- Pros: Simple, direct
- Cons: Duplicated code, harder to manage

**Option B**: Centralized service client
- Pros: Consistent, easier to maintain
- Cons: More abstraction

**Recommendation**: Option B - Centralized service client

---

## 📝 Next Steps (Immediate Action Items)

1. **Decide on entry point strategy** (App.jsx vs App.tsx)
2. **Create service registry** - List all 24 services with status
3. **Map backend APIs** - Document endpoints for each service
4. **Standardize ServicePanel** - Create unified interface
5. **Implement service health checks** - Show status indicators
6. **Clean up CompliancePanel** - Fix duplicate/corrupted code
7. **Add service navigation** - Improve sidebar/routing

---

## 🎯 Success Metrics

- [ ] All 24 services accessible via UI
- [ ] Service health indicators working
- [ ] Backend integration complete
- [ ] Theme toggle working across all pages
- [ ] Consistent UI/UX across all panels
- [ ] Error handling implemented
- [ ] Performance optimized
- [ ] Documentation complete

---

## 📚 Service Categories

### Business Services
- Retail Partner
- HR Deputy
- Analytics
- Crypto Ledger
- Klipp

### Transportation & Logistics
- EV Leader
- TMS
- Traffic Routing
- Trip Planning
- Tracking Engine
- Driver Behavior
- Cold Chain

### AI & Intelligence
- Neural Context
- Deep Mind
- AI Evolution
- AI Assistant
- Safety Orchestrator

### Infrastructure
- Admin
- Maintenance
- Compliance
- Document Vault
- Document Verification
- Accessibility
- Onboarding

---

**Last Updated**: 2025-01-27
**Status**: Planning Phase

