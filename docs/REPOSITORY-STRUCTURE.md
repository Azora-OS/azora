# 🏗️ AZORA OS - REPOSITORY STRUCTURE

## Coherent Organization System

**Philosophy:** Every file has a logical home. Backends are organs, frontends are skins, everything makes sense.

---

## 📁 **New Structure**

```
azora-os/
├── 🧠 genome/              # Core DNA - AI agents, tools, intelligence
│   ├── agents/             # AI agents (research, implementation, etc.)
│   ├── tools/              # Agent tools and capabilities
│   └── prompts/            # AI prompts and templates
│
├── 🫀 organs/              # Backend Services - Internal systems
│   ├── nexus/              # Central coordination service
│   ├── aegis/              # Security & policy service
│   ├── mint/               # Token & economy service
│   ├── education/          # Education backend
│   ├── workspace/          # Workspace backend
│   └── [other services]/   # All backend microservices
│
├── 🎨 skins/               # Frontend Applications - User interfaces
│   ├── web/                # Main web application (Next.js)
│   ├── mobile/             # Mobile applications
│   ├── desktop/            # Desktop applications
│   ├── admin/              # Admin dashboards
│   └── marketplace/        # Marketplace UI
│
├── 🧬 azora-lms/           # Learning Management System
│   ├── core/               # LMS core logic
│   ├── components/         # LMS components
│   └── docs/               # LMS documentation
│
├── 🏛️ azora-campus/        # Campus Management (ERP/SIS)
│   ├── core/               # Campus core logic
│   ├── modules/            # Campus modules
│   └── docs/               # Campus documentation
│
├── 🔧 infrastructure/      # DevOps & Infrastructure
│   ├── docker/             # Docker configs
│   ├── kubernetes/         # K8s manifests
│   ├── terraform/          # Infrastructure as code
│   └── scripts/            # Deployment scripts
│
├── 📚 docs/                # Documentation
│   ├── api/                # API documentation
│   ├── architecture/       # Architecture docs
│   ├── guides/             # User guides
│   └── legal/              # Legal documents
│
├── 🧪 tests/               # Testing
│   ├── unit/               # Unit tests
│   ├── integration/        # Integration tests
│   └── e2e/                # End-to-end tests
│
├── 🎯 examples/            # Example code & demos
│
├── 🔐 .private/            # Private/Internal (not in git)
│
└── 📄 [Root configs]       # Package.json, tsconfig, etc.
```

---

## 🎯 **Organization Principles**

### **1. Organs (Backend Services)**
**Location:** `organs/`
**Purpose:** Internal systems, APIs, business logic
**Examples:**
- `organs/nexus/` - Central coordination
- `organs/aegis/` - Security & auth
- `organs/mint/` - Token economics
- `organs/education/` - Education backend

### **2. Skins (Frontend Applications)**
**Location:** `skins/`
**Purpose:** User-facing interfaces
**Examples:**
- `skins/web/` - Main web app
- `skins/mobile/` - Mobile apps
- `skins/admin/` - Admin dashboards
- `skins/marketplace/` - Marketplace UI

### **3. Genome (AI Core)**
**Location:** `genome/`
**Purpose:** AI agents, intelligence, core DNA
**Examples:**
- `genome/agents/` - AI agents
- `genome/tools/` - Agent capabilities
- `genome/prompts/` - AI templates

### **4. Specialized Systems**
- `azora-lms/` - Complete LMS
- `azora-campus/` - Complete ERP/SIS
- `infrastructure/` - DevOps tools

---

## 🔄 **Migration Plan**

### **Phase 1: Backend Services → Organs**
```bash
# Move all backend services to organs/
services/azora-nexus/ → organs/nexus/
services/azora-aegis/ → organs/aegis/
services/azora-mint/ → organs/mint/
services/azora-education/ → organs/education/
services/azora-workspace/ → organs/workspace/
```

### **Phase 2: Frontend Apps → Skins**
```bash
# Move all frontend apps to skins/
app/ → skins/web/app/
components/ → skins/web/components/
marketplace-ui/ → skins/marketplace/
pay-ui/ → skins/pay/
synapse/frontend/ → skins/synapse/
```

### **Phase 3: AI Systems → Genome**
```bash
# Consolidate AI systems
agents/ → genome/agents/
genome/agent-tools/ → genome/tools/
genome/ai-hierarchy/ → genome/hierarchy/
```

### **Phase 4: Infrastructure**
```bash
# Organize DevOps
deploy/ → infrastructure/deploy/
ci/ → infrastructure/ci/
scripts/ → infrastructure/scripts/
```

---

## 📋 **File Placement Rules**

### **Backend Service (Organ)**
```
If file contains:
- API routes
- Database models
- Business logic
- Microservice code
→ Place in: organs/[service-name]/
```

### **Frontend App (Skin)**
```
If file contains:
- React/Next.js components
- UI pages
- Client-side code
- User interface
→ Place in: skins/[app-name]/
```

### **AI/Agent Code (Genome)**
```
If file contains:
- AI agents
- ML models
- Agent tools
- Prompts
→ Place in: genome/[category]/
```

### **Infrastructure (DevOps)**
```
If file contains:
- Docker configs
- K8s manifests
- CI/CD pipelines
- Deploy scripts
→ Place in: infrastructure/[category]/
```

---

## 🎨 **Naming Conventions**

### **Organs (Backends)**
- Use lowercase with hyphens
- Descriptive names
- Examples: `nexus`, `aegis`, `mint`, `education`

### **Skins (Frontends)**
- Use lowercase with hyphens
- Platform-specific
- Examples: `web`, `mobile`, `admin`, `marketplace`

### **Genome (AI)**
- Use lowercase with hyphens
- Capability-focused
- Examples: `agents`, `tools`, `prompts`, `models`

---

## 🔗 **Import Path Updates**

### **Before:**
```typescript
import { service } from '../../../services/azora-nexus'
import { Component } from '../../components/ui'
import { agent } from '../agents/research'
```

### **After:**
```typescript
import { service } from '@organs/nexus'
import { Component } from '@skins/web/components'
import { agent } from '@genome/agents/research'
```

---

## ✅ **Benefits**

### **1. Clarity**
- ✅ Every file has a logical home
- ✅ No confusion about placement
- ✅ Easy to find anything

### **2. Scalability**
- ✅ Add new organs easily
- ✅ Add new skins easily
- ✅ Clear separation of concerns

### **3. Maintainability**
- ✅ Consistent structure
- ✅ Predictable locations
- ✅ Easy onboarding

### **4. Professional**
- ✅ Enterprise-grade organization
- ✅ Clear architecture
- ✅ Production-ready

---

## 🚀 **Implementation Status**

- [ ] Design new structure
- [ ] Create new directories
- [ ] Move backend services to organs/
- [ ] Move frontends to skins/
- [ ] Move AI systems to genome/
- [ ] Update all imports
- [ ] Update all configs
- [ ] Test everything
- [ ] Commit restructure

---

**"A place for everything, and everything in its place."** 🏗️✨

**Status:** DESIGNED - READY TO IMPLEMENT
