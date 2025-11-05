# Azora ES — Comprehensive System Architecture & File Structure

Azora ES is a next-generation enterprise platform built on constitutional AI, biological systems architecture, and modular enterprise services. The platform has been transformed into the **Azora Sapiens University** - a planetary economic intelligence education platform with real-time Aegis integrity monitoring.

**Current Status (October 24, 2025):**
- ✅ **Azora Sapiens University UI**: Active education platform with course catalog, enrollment, progress tracking, and Knowledge Points
- ✅ **Aegis Mobile Sentry**: Real-time integrity monitoring during assessments
- ✅ **Backend Services**: Azora Sapiens (port 4200), Azora Forge (port 12345), Azora Covenant (port 4099)
- ✅ **API Integration**: Full backend-frontend connectivity with dynamic data fetching
- 🔄 **Service Expansion**: Additional services being activated (Mint, Nexus, Aegis, etc.)

---

## 1. **System Architecture Overview**

### **A. Constitutional AI Engine**
- **LLM Reasoning Engine**: Natural language understanding, knowledge ingestion, intent analysis, and autonomous planning. Powers all agent intelligence and decision-making.
- **Constitutional Governor**: Enforces enterprise rules, ethical constraints, and compliance for every agent action. Ensures safe, auditable AI operation.
- **Autonomous Core**: Implements the Perceive-Plan-Act loop, enabling continuous, self-directed agent operation.
- **Memory System**: Redis for short-term memory (active sessions, conversations), PostgreSQL/pgvector for long-term semantic memory (knowledge, history).
- **Data Access Controls**: Permission-based security, audit logging, and compliance enforcement for all data and actions.
- **User State Tracker**: Manages user context, preferences, workflow state, and personalization.
- **Observation Loop**: Monitors system health, events, anomalies, and triggers automated diagnostics or healing.

### **B. Biological Systems Architecture**
- **Self-Healing Infrastructure**: Detects errors, recovers automatically, and adapts to changing conditions. Inspired by biological resilience.
- **Resilient Operations**: Fault-tolerant, scalable, and evolutionary enterprise systems for high availability.
- **Biological Patterns**: Modular, adaptive design for scalability and robustness.

### **C. Enterprise Services Layer**
- **Education & Intelligence**: Azora Sapiens University with CKQ programs, Proof-of-Knowledge rewards, and Ascension Protocol (Azora Sapiens service).
- **Analytics & Intelligence**: Business intelligence, performance monitoring, and reporting (Pulse UI, azora-nexus).
- **Compliance Automation**: Regulatory compliance, audit management, and automated reporting (Council UI, azora-aegis, Aegis Mobile Sentry).
- **Financial & Blockchain**: DeFi, staking, contracts, and monetary operations (azora-mint, azora-covenant, azora-monetary-system).
- **Marketplace & Merchant**: Marketplace, merchant tools, and integrations (azora-forge).
- **Training & Knowledge**: Learning, certification, and knowledge management (Azora Academy, Atlas UI).

### **D. Enterprise Applications & UIs**
- **Azora Sapiens University**: Primary education platform with course catalog, enrollment, progress tracking, and real-time Aegis monitoring.
- **Atlas UI**: Knowledge management and data visualization.
- **Council UI**: Governance, compliance, and decision support.
- **Pulse UI**: Business intelligence and analytics.
- **Vigil UI**: Security monitoring and threat detection.
- **Signal UI**: Communication and collaboration.
- **Academy UI**: Training and certification platform.
- **Vault UI**: Secure storage and access management.

### **E. Integration & Security**
- **API & SDK**: RESTful APIs, SDKs, and connectors for cloud, enterprise, and third-party systems.
- **Aegis Integrity Monitoring**: Real-time assessment integrity verification and anomaly detection.
- **Compliance & Security**: SOC 2, ISO 27001, GDPR, HIPAA, SOX compliance, audit trails, and zero-trust security.
- **Infrastructure**: Docker, Kubernetes, multi-cloud deployment, and monitoring.

---

## 2. **File & Directory Structure & Current Status**

```
/workspaces/azora-os
│
├── AZORA-ARCHITECTURE.md, AZORA-COMPREHENSIVE-ARCHITECTURE.md
├── AZORA-ES-COMPREHENSIVE-SYSTEM-OVERVIEW.md
├── README.md                     # Main documentation
├── ROADMAP.md, TRANSFORMATION_SUMMARY.md, FUNDING-VALUATION-AGENT.md
├── package.json, tsconfig.json, .env.production, Dockerfile.backend
├── ui/                           # 🎓 ACTIVE: Azora Sapiens University UI (Next.js 15)
│   ├── app/                      # Education platform with courses, enrollment, progress
│   ├── components/               # Shadcn/ui components, Aegis monitoring, Constitutional Governor
│   ├── globals.css, tailwind.config.js
│   ├── package.json, next.config.mjs
│   └── README.md
├── app/                          # Marketplace UI (secondary)
│   └── marketplace/
├── genome/
│   ├── agent-tools/              # Autonomous agent core & subsystems
│   ├── api-client/
│   ├── data/
│   ├── logger/
│   ├── logistics-primitives/
│   ├── permissions/
│   ├── ui-components/
│   ├── ui-core/
│   ├── ui-kit/
│   └── utils/
│
├── synapse/
│   ├── atlas-ui/                 # Knowledge management UI
│   ├── council-ui/               # Governance & compliance UI
│   ├── pulse-ui/                 # Analytics UI
│   ├── vigil-ui/                 # Security UI
│   ├── signal-ui/                # Communication UI
│   ├── academy-ui/               # Training & certification UI
│   ├── vault-ui/                 # Secure storage UI
│   ├── main-ui/, shared-ui/, ui-components/
│   └── DEPLOYMENT.md, Dockerfile, etc.
│
├── azora-sapiens/                # 🎓 ACTIVE: Education backend service (port 4200)
│   ├── sapiens-service.js        # CKQ programs, enrollment, progress tracking
│   ├── courses/                  # Course definitions and content
│   ├── assessments/              # Assessment engine with Aegis monitoring
│   ├── rewards/                  # Proof-of-Knowledge rewards system
│   ├── websocket/                # Real-time Aegis integrity monitoring
│   ├── package.json, tsconfig.json
│   └── README.md
│
├── azora-nexus/                  # AI recommendations & neural hub
│   ├── anomalyDetector.js, api.js, neuralIntent.js, etc.
│   ├── dist/, src/, services/, skills/
│   ├── docker-compose.yml, Dockerfile
│   ├── prisma/
│   └── package.json, tsconfig.json
│
├── azora-mint/                   # DeFi, staking, and financial services
│   ├── contracts/, docker/, prisma/, scripts/, src/, test/
│   ├── ai-reinvestment.js, defi.js, fees.js, liquidity.js, staking.js, etc.
│   ├── docker-compose.yml, Dockerfile
│   └── package.json, tsconfig.json
│
├── azora-covenant/               # Blockchain, contracts, founder API (port 4099)
│   ├── contracts/, proprietary/, public/, prisma/, scripts/, services/, src/
│   ├── azora-chain.js, blockchain.js, founder-api.js, etc.
│   └── package.json, tsconfig.json
│
├── azora-aegis/                  # Security, compliance, validation
│   ├── nudge-check/, prisma/, src/
│   ├── guardian.js, validate.js, etc.
│   └── package.json, tsconfig.json
│
├── azora-forge/                  # 🏪 ACTIVE: Marketplace service (port 12345)
│   ├── docker/, prisma/, src/
│   ├── healthcheck.js, merchant_tasks.json, etc.
│   ├── docker-compose.yml, Dockerfile
│   └── package.json, tsconfig.json
│
├── azora-monetary-system/        # Monetary, contracts, dashboard, docs
│   ├── config/, contracts/, dashboard/, docs/, scripts/, services/, tests/
│
├── backend/, biome/, caas/, cloud-ui/, compliance-reports/, compliance-ui/
├── database/, dev-ui/, enterprise-ui/, examples/, infra/, infrastructure/
├── learn-ui/, marketing/, marketplace-ui/, mqtt/, mutations/, onboarding-wizard/
├── organs/, pay-ui/, prisma/, public/, reflexes/, routes/, scripts/, sdk/
├── secrets/, shield_service/, synapse-backend/, templates/, tests/, ui/
├── utility-core/, vessels/, vite-project/
│
├── .github/, .vscode/, .husky/, node_modules/
├── Dockerfile, LICENSE, .gitignore, .npmrc, .prettierrc, .eslintrc.json, etc.
└── test-agent.js                 # Agent test script
```

---

## 3. **Subsystem Descriptions & Current Status**

### **ui/** - 🎓 **ACTIVE: Azora Sapiens University Platform**
- **Primary UI**: Next.js 15/React 19 education platform with course catalog, enrollment, and progress tracking
- **Aegis Integration**: Real-time integrity monitoring during assessments
- **Features**: CKQ programs, Proof-of-Knowledge rewards, Ascension Protocol, Constitutional Governor
- **Status**: Running on http://localhost:3000 with full backend integration

### **azora-sapiens/** - 🎓 **ACTIVE: Education Backend Service**
- **Core Service**: Comprehensive education backend with 4 CKQ programs, enrollment management, and progress tracking
- **Aegis Monitoring**: WebSocket-based real-time integrity verification during assessments
- **API Endpoints**: Courses, enrollment, user stats, rewards, progress tracking
- **Status**: Running on port 4200, fully integrated with UI

### **genome/agent-tools/**
- Autonomous agent logic, LLM reasoning, constitutional governance, memory, observation, user state, data access, and core capabilities.

### **synapse/**
- All enterprise UIs, each in its own folder (atlas-ui, council-ui, pulse-ui, vigil-ui, signal-ui, academy-ui, vault-ui, etc.).
- Shared UI components, design system, and deployment scripts.

### **azora-nexus/**
- AI recommendations, neural intent analysis, analytics, and event processing.
- Service endpoints, health checks, and integration logic.

### **azora-mint/**
- DeFi, staking, liquidity, fees, and financial operations.
- Smart contracts, financial scripts, and service APIs.
- **Status**: Requires MongoDB setup for full activation

### **azora-covenant/** - 🔄 **INSTALLED: Blockchain Security Service**
- Blockchain logic, contract management, founder APIs, and proprietary modules.
- **Status**: Installed, runs on port 4099, ready for activation

### **azora-aegis/**
- Security, compliance, validation, and audit modules.
- **Aegis Mobile Sentry**: Real-time integrity monitoring integrated into education platform

### **azora-forge/** - 🏪 **ACTIVE: Marketplace Service**
- Marketplace, merchant tools, integrations, and health monitoring.
- **Status**: Running on port 12345, P2P marketplace for digital goods

### **azora-monetary-system/**
- Monetary operations, contracts, dashboards, documentation, and tests.

### **Other Folders**
- **biome/**, **utility-core/**, **shield_service/**: Biological and infrastructure resilience modules.
- **compliance-reports/**, **compliance-ui/**: Compliance and audit reporting tools.
- **infra/**, **infrastructure/**: Deployment, monitoring, and cloud integration.
- **sdk/**, **api/**: SDKs and APIs for integration.
- **docs/**, **codex/**: Documentation and guides.
- **tests/**: Unit, integration, and E2E tests.

---

## 4. **How Everything Connects**
- **Education Platform** (ui/ + azora-sapiens/) delivers the complete Azora Sapiens University experience
- **Aegis Integrity** (azora-aegis integration) provides real-time monitoring during assessments
- **Agents** (genome/agent-tools) drive autonomous, compliant decision-making
- **Services** (azora-*) provide business logic, analytics, financial, and security functions
- **UIs** (synapse/*-ui) deliver specialized interfaces for enterprise users
- **Infrastructure** (infra/, utility-core/, shield_service/) ensures resilience, scalability, and security
- **Compliance** (azora-aegis, compliance-reports) guarantees regulatory alignment and auditability

## 5. **Key Architectural Highlights**
- **Azora Sapiens University**: Active education platform with CKQ programs, Proof-of-Knowledge rewards, and Ascension Protocol
- **Aegis Mobile Sentry**: Real-time integrity monitoring integrated into the learning experience
- **Modular Monorepo**: Each business domain and service is isolated for scalability and maintainability
- **Autonomous Agent Core**: All agent logic, reasoning, memory, and constitutional governance are in `genome/agent-tools`
- **Enterprise UIs**: All user interfaces are in `synapse/`, with each UI for a specific enterprise function
- **Service-Oriented**: Each service (nexus, mint, covenant, aegis, forge, monetary-system) is Dockerized and API-driven
- **Education-First**: Primary focus on planetary economic intelligence through structured learning programs
- **Compliance & Security**: Dedicated folders for compliance, audit, and security (azora-aegis, compliance-reports, shield_service)
- **Integration Ready**: SDKs, APIs, and connectors for cloud, enterprise, and third-party systems
- **Documentation & Guides**: Codex, docs, and guides for onboarding, deployment, and integration

---

## 6. **Current Service Status (October 24, 2025)**

### **Active Services:**
- ✅ **Azora Sapiens University UI**: http://localhost:3000 (Next.js 15/React 19)
- ✅ **Azora Sapiens Backend**: http://localhost:4200 (Education service with WebSocket)
- ✅ **Azora Forge Marketplace**: http://localhost:12345 (P2P marketplace)
- ✅ **Azora Covenant**: Ready on port 4099 (Blockchain security)

### **Services Requiring Setup:**
- 🔄 **Azora Mint**: Requires MongoDB/Redis setup (DeFi & staking)
- 🔄 **Azora Nexus**: AI recommendations engine
- 🔄 **Azora Aegis**: Security and compliance (partially integrated)

### **Infrastructure Requirements:**
- MongoDB (for Mint, Covenant services)
- Redis (for caching and sessions)
- PostgreSQL (for advanced features)

---

**Azora ES is now the Azora Sapiens University - a constitutional AI enterprise platform with modular architecture, autonomous agents, biological resilience, and enterprise-grade security and compliance, focused on planetary economic intelligence education.**
