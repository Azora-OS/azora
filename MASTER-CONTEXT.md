# 🌟 AZORA OS - MASTER CONTEXT DOCUMENT

**Document Version:** 1.0.0  
**Last Updated:** November 2025  
**Purpose:** Comprehensive repository context for development teams  
**Status:** ✅ Active Development

---

## 📋 TABLE OF CONTENTS

1. [Executive Summary](#executive-summary)
2. [Project Identity & Philosophy](#project-identity--philosophy)
3. [System Architecture](#system-architecture)
4. [Repository Structure](#repository-structure)
5. [Core Services & Applications](#core-services--applications)
6. [Technology Stack](#technology-stack)
7. [Development Workflow](#development-workflow)
8. [Key Concepts & Terminology](#key-concepts--terminology)
9. [Integration Points](#integration-points)
10. [Deployment & Infrastructure](#deployment--infrastructure)
11. [Documentation Index](#documentation-index)
12. [Quick Reference](#quick-reference)

---

## 🎯 EXECUTIVE SUMMARY

### What is Azora OS?

**Azora OS** is the world's first **Constitutional AI Operating System** - a comprehensive platform that combines education, finance, and technology under the Ubuntu philosophy of *"I am because we are"* (Ngiyakwazi ngoba sikwazi).

### Core Mission

Transform education, finance, and technology through:
- **🧠 Education**: AI-powered personalized learning with Proof-of-Knowledge rewards
- **💰 Finance**: Multi-currency wallet, mining engine, and prosperity circulation
- **🔷 Technology**: Constitutional AI governance and decentralized infrastructure

### Key Statistics

- **Version**: 3.0.0
- **Services**: 190+ microservices
- **Applications**: 15+ frontend applications
- **Architecture**: Microservices with Supreme Organism pattern
- **Philosophy**: Ubuntu (African collectivist worldview)
- **Status**: 75% Production Infrastructure Ready

---

## 💎 PROJECT IDENTITY & PHILOSOPHY

### The Azora Gem - Tri-Unity Crystal

The project identity is built around three sacred elements:

```
        🔷 SAPPHIRE APEX 🔷
           (Technology)
              /   \
             /     \
    🟢 EMERALD ——— RUBY 🔴
    (Education)   (Finance)
         \         /
          \       /
           \     /
        UNITY CORE
    (Constitutional AI)
```

#### 🔷 **SAPPHIRE APEX** - Technology Pillar
- **Color**: Deep Constitutional Blue (#1E40AF)
- **Represents**: AI consciousness, digital sovereignty, innovation
- **Energy**: Transformation, quantum possibilities

#### 🟢 **EMERALD FOUNDATION** - Education Pillar
- **Color**: Sovereign Green (#059669)
- **Represents**: Knowledge cultivation, wisdom, human development
- **Energy**: Learning, teaching, enlightenment

#### 🔴 **RUBY CORE** - Finance Pillar
- **Color**: Prosperity Red (#DC2626)
- **Represents**: Value creation, wealth generation, economic freedom
- **Energy**: Abundance, circulation, prosperity

### Ubuntu Philosophy

**Core Principle**: *"I am because we are"* (Ngiyakwazi ngoba sikwazi)

The system operates on Ubuntu principles:
- **Individual Excellence** → **Collective Prosperity**
- **Personal Learning** → **Community Wisdom**
- **Individual Success** → **Shared Abundance**
- **Personal Security** → **Universal Freedom**

### The Sankofa Engine

**Engine Name**: **SANKOFA**  
*Akan wisdom: "Go back and get it" - Learning from the past to build the future*

**Full Name**: Sovereignty Amplification Network for Knowledge, Opportunity, Finance & Abundance

#### Core Components:
1. **🧠 Neural Cortex** - Collective Intelligence ("My knowledge becomes our knowledge")
2. **🫀 Circulatory Heart** - Value Distribution ("My success enables your success")
3. **💪 Muscular System** - Collective Action ("My work strengthens our foundation")
4. **🛡️ Immune Defense** - Constitutional Protection ("My security ensures our freedom")

---

## 🏗️ SYSTEM ARCHITECTURE

### Supreme Organism Architecture

Azora OS follows a **Supreme Organism** pattern, treating the system as a living entity:

```mermaid
graph TB
    subgraph "🌍 Ubuntu Ecosystem"
        subgraph "🧠 BRAIN - Education"
            EDU[Azora Education<br/>🎓 Learning Management]
            LMS[Azora LMS<br/>📚 Course System]
            SAP[Azora Sapiens<br/>🤖 AI Tutoring]
        end
        
        subgraph "🫀 HEART - Finance"
            MINT[Azora Mint<br/>💰 Financial Engine]
            PAY[Azora Pay<br/>💳 Payment System]
            MINE[Mining Engine<br/>⛏️ Proof-of-Knowledge]
        end
        
        subgraph "💪 MUSCLES - Marketplace"
            FORGE[Azora Forge<br/>🔨 Skills Marketplace]
            CAREER[Career Services<br/>💼 Job Matching]
            WORK[Workspace<br/>🏢 Collaboration]
        end
        
        subgraph "🔗 NERVOUS SYSTEM"
            NEXUS[Azora Nexus<br/>🌐 Event Bus]
            API[API Gateway<br/>🚪 Unified Access]
        end
        
        subgraph "🛡️ IMMUNE SYSTEM"
            AEGIS[Azora Aegis<br/>🛡️ Security Framework]
            AUTH[Auth Service<br/>🔐 Identity Management]
        end
    end
```

### Architecture Layers

1. **Frontend Layer**: React 18 + Next.js 16, TypeScript, Tailwind CSS
2. **Backend Layer**: Node.js 20 + Express 5, Prisma ORM, PostgreSQL 15
3. **AI Layer**: OpenAI GPT-4, Constitutional AI, Brain.js
4. **Infrastructure Layer**: Docker + Kubernetes, Prometheus + Grafana

### Service Communication

- **Event-Driven**: Azora Nexus (Event Bus)
- **REST APIs**: Standard HTTP/REST endpoints
- **GraphQL**: For complex queries
- **WebSockets**: Real-time communication
- **Message Queues**: Bull Queue with Redis

---

## 📁 REPOSITORY STRUCTURE

### Top-Level Organization

```
azora-os/
├── apps/                    # 15+ Frontend Applications
├── services/                # 190+ Backend Microservices
├── packages/                # Shared Libraries & Components
├── infrastructure/          # DevOps, Deployment & Operations
├── core/                    # Core System Files (kernel, organs, vessels)
├── tools/                   # Development Tools & Utilities
├── config/                  # Global Configuration Files
├── docs/                    # Documentation (219+ files)
├── tests/                   # Testing Suites
└── examples/                # Example Code & Templates
```

### Key Directories

#### `/apps/` - Frontend Applications (15 apps)
- `app/` - Main Next.js application
- `azora-ui/` - Main UI application
- `student-portal/` - Learning dashboard
- `enterprise-ui/` - Business management
- `marketplace-ui/` - Job & skills platform
- `pay-ui/` - Financial dashboard
- `cloud-ui/`, `compliance-ui/`, `dev-ui/`, `learn-ui/` - Specialized UIs
- `mobile/` - Mobile applications (Android/iOS)
- `electron/` - Desktop application

#### `/services/` - Backend Microservices (190+ services)

**Core Services:**
- `api-gateway/` - Unified API Gateway (Port 4000)
- `auth-service/` - Authentication & Authorization (Port 4001)
- `azora-mint/` - Financial Engine (Port 4002)
- `azora-lms/` - Learning Management System (Port 4007)
- `azora-nexus/` - Event Bus & Marketplace (Port 4004)
- `azora-forge/` - Skills Marketplace (Port 4003)
- `azora-aegis/` - Security Framework (Port 4008)
- `azora-covenant/` - Record-keeping & Billing (Port 4009)
- `azora-oracle/` - Truth Engine (Port 3005)
- `azora-education/` - Education Services (Port 4006)

**B2B Services:**
- `retail-ai-service/` - Retail AI & Inventory (Port 4001)
- `cold-chain-service/` - Cold Chain Management (Port 4002)
- `community-safety-service/` - Community Safety (Port 4003)
- `billing-service/` - Billing & Invoicing (Port 4004)

**Supporting Services:**
- `azora-sapiens/` - AI Tutoring System
- `azora-synapse/` - Neural Network Backend
- `mining-engine/` - Proof-of-Knowledge Mining
- `analytics-service/` - Analytics & Reporting
- `notification-service/` - Notifications
- `payment-gateway/` - Payment Processing
- `master-orchestrator/` - Service Orchestration (Port 5000)
- ... and 170+ more services

#### `/packages/` - Shared Libraries
- `components/` - Reusable UI components
- `ui-framework/` - Shared UI framework
- `types/` - Shared TypeScript types
- `lib/` - Shared utilities & helpers
- `contracts/` - Blockchain smart contracts
- `assets/` - Shared assets (images, fonts)

#### `/infrastructure/` - DevOps & Deployment
- `kubernetes/` - Kubernetes manifests
- `scripts/` - Deployment scripts
- `deploy/` - Deployment configurations
- `ops/` - Operations tools

#### `/core/` - Core System Files
- `kernel/` - OS kernel
- `organs/` - System organs (115 components)
- `vessels/` - Data flow vessels
- `synapse/` - Neural network components

#### `/docs/` - Documentation (219+ files)
- `architecture/` - Architecture documentation
- `api/` - API documentation
- `guides/` - User & developer guides
- `compliance-reports/` - Compliance & audit reports

---

## 🔧 CORE SERVICES & APPLICATIONS

### Frontend Applications

| Application | Port | Purpose | Status |
|------------|------|---------|--------|
| **Main App** | 3000 | Primary Next.js application | ✅ Active |
| **Enterprise UI** | 3001 | Business management dashboard | ✅ Active |
| **Marketplace UI** | 3002 | Job & skills platform | ✅ Active |
| **Pay UI** | 3003 | Financial dashboard | ✅ Active |
| **Student Portal** | 3004 | Learning dashboard | ✅ Active |
| **Cloud UI** | - | Cloud management | ✅ Active |
| **Compliance UI** | - | Compliance monitoring | ✅ Active |
| **Dev UI** | - | Developer tools | ✅ Active |
| **Learn UI** | - | Learning platform | ✅ Active |
| **Mobile** | - | iOS & Android apps | 🚧 In Progress |

### Core Backend Services

| Service | Port | Purpose | Status |
|---------|------|---------|--------|
| **API Gateway** | 4000 | Unified API access | ⚠️ 30% Complete |
| **Auth Service** | 4001 | Authentication | ⚠️ 40% Complete |
| **Azora Mint** | 4002 | Financial engine | ✅ Active |
| **Azora Forge** | 4003 | Skills marketplace | ✅ Active |
| **Azora Nexus** | 4004 | Event bus & marketplace | ✅ Active |
| **Chamber of Ghosts** | 3005 | Oracle service | ✅ Active |
| **Azora Education** | 4006 | Education services | ✅ Active |
| **Azora LMS** | 4007 | Learning management | 🚧 Enhancements Required |
| **Azora Aegis** | 4008 | Security framework | ✅ Active |
| **Azora Covenant** | 4009 | Record-keeping | ✅ Active |
| **Master Orchestrator** | 5000 | Service orchestration | ✅ Active |

### Service Status Breakdown

- **Production Ready**: 15 services (8%)
- **Partially Complete**: 45 services (24%)
- **Framework Only**: 130 services (68%)

---

## 💻 TECHNOLOGY STACK

### Frontend Technologies

- **Framework**: Next.js 16, React 19
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4, Glassmorphism effects
- **State Management**: Zustand, React Query
- **UI Components**: Radix UI, shadcn/ui
- **Animations**: Framer Motion
- **Forms**: React Hook Form, Zod validation

### Backend Technologies

- **Runtime**: Node.js 20 LTS
- **Framework**: Express 5
- **Database**: PostgreSQL 15, Prisma ORM
- **Caching**: Redis 7
- **Message Queue**: Bull Queue
- **Authentication**: JWT, OAuth 2.0
- **API Documentation**: Swagger/OpenAPI

### AI & Machine Learning

- **AI Models**: OpenAI GPT-4, Constitutional AI
- **ML Libraries**: TensorFlow.js, PyTorch
- **NLP**: Natural, LangChain
- **AI Framework**: Brain.js

### Blockchain & Web3

- **Blockchain**: Ethereum, Solidity
- **Web3**: Web3.js, Ethers.js
- **Smart Contracts**: Hardhat, Foundry
- **Wallets**: Multi-wallet support

### Infrastructure & DevOps

- **Containers**: Docker, Docker Compose
- **Orchestration**: Kubernetes
- **CI/CD**: GitHub Actions
- **Monitoring**: Prometheus, Grafana
- **Logging**: Winston
- **Deployment**: Vercel, Terraform

### Development Tools

- **Package Manager**: npm 10+
- **Build Tools**: Vite, Webpack
- **Testing**: Jest, Vitest, Playwright
- **Linting**: ESLint, Biome
- **Formatting**: Prettier
- **Type Checking**: TypeScript

---

## 🔄 DEVELOPMENT WORKFLOW

### Quick Start Commands

```bash
# Full system launch with dependencies
npm run supreme:full

# Launch everything (services + frontends)
npm run supreme:launch

# Services only
npm run supreme:services

# Frontends only
npm run supreme:frontends

# Install all dependencies
npm run supreme:install

# System scan and analysis
npm run scan:system
```

### Development Setup

```bash
# 1. Clone repository
git clone https://github.com/azora-os/azora-os.git
cd azora-os

# 2. Install dependencies
npm install

# 3. Setup environment
cp .env.example .env
# Edit .env with your values

# 4. Start development
npm run dev:all

# Or start specific components:
npm run dev:services    # Backend services only
npm run dev:frontend    # Frontend only
```

### Key Scripts

```bash
# Development
npm run dev:all              # Start all services and frontends
npm run dev:services        # Start backend services
npm run dev:frontend         # Start frontend apps

# Building
npm run build:all            # Build everything
npm run build:frontend      # Build frontend
npm run build:services      # Build services

# Testing
npm run test:all             # Run all tests
npm run test:services       # Test services
npm run test:frontend       # Test frontend

# Database
npm run db:migrate           # Run migrations
npm run db:generate          # Generate Prisma client
npm run db:reset             # Reset database

# Health & Monitoring
npm run health:check         # Check system health
npm run scan:system          # System scan
```

### Branch Strategy

```bash
# Feature branches
ubuntu/feature/description
ubuntu/education/ai-tutor-enhancement
ubuntu/finance/mining-optimization

# Bug fix branches
ubuntu/fix/description
ubuntu/fix/auth-token-validation

# Documentation branches
ubuntu/docs/description
ubuntu/docs/api-reference-update
```

---

## 📚 KEY CONCEPTS & TERMINOLOGY

### Constitutional AI

**Definition**: AI systems governed by immutable constitutional principles that ensure ethical behavior, transparency, and alignment with human values.

**Key Principles**:
1. **Truth Supremacy**: All decisions based on verified truth
2. **Ubuntu Solidarity**: Individual success contributes to collective prosperity
3. **Sankofa Wisdom**: Learning from the past to build the future
4. **Transparent Accountability**: All activities publicly auditable
5. **Evolutionary Adaptation**: Continuous evolution within constitutional bounds

### Proof-of-Contribution System

Four ways citizens earn by contributing value:

1. **Proof of Knowledge** (PoK): Earning through learning and teaching
2. **Proof of Governance**: Earning by participating in system integrity
3. **Proof of Creation**: Earning by creating goods, services, and art
4. **Proof of Data**: Earning by providing high-quality, verifiable data

### Two-Token Economy

- **Global AZR**: Deflationary, asset-backed store of value (investment token)
- **Local a-Tokens**: Stable, 1:1 pegged transactional currencies (aZAR, aBRL, etc.)

### 10% PIVC (Protocol-Integrated Value Capture)

Transparent transaction fee replacing traditional taxes:
- **8% → Growth Fund**: Fuels expansion and AZR buy-and-burn
- **2% → UBO Fund**: Powers Universal Basic Assets and Proof-of-Contribution

### The Ngwenya True Market Protocol (NTMP)

Four Pillars of Truth:
1. **Informational Truth** (Oracle): Perfect information symmetry
2. **Transactional Truth** (Nexus): Frictionless exchange
3. **Value Truth** (Causal Engine): Utility-based pricing
4. **Generative Truth** (Forge & Mint): Autonomous economic response

### Governance Structure

1. **THE LAW** (The Covenant): Immutable smart contract constitution
2. **THE LEGISLATURE** (Assembly of Stewards): Human deliberative body
3. **THE JUDICIARY** (Guardian Oracles): AI Constitutional Court
   - Kaelus (the Logician)
   - Lyra (the Ethicist)
   - Solon (the Consequentialist)
4. **THE EXECUTIVE** (Architect-Guardian Symbiosis): Founder's Council + Elara

---

## 🔗 INTEGRATION POINTS

### Service Dependencies

```mermaid
graph TD
    A[API Gateway] --> B[Azora Aegis]
    C[All Services] --> B
    D[Retail AI] --> B
    D --> E[Azora Nexus]
    D --> F[Azora Covenant]
    G[Cold Chain] --> B
    G --> E
    G --> F
    H[Community Safety] --> B
    H --> E
    H --> F
    I[Azora LMS] --> B
    I --> J[Azora Mint]
```

### Key Integration Patterns

1. **Authentication Flow**: All services → Auth Service → Aegis
2. **Event Flow**: Services → Nexus Event Bus → Subscribers
3. **Payment Flow**: Services → Mint → Payment Gateway
4. **Data Flow**: Services → Covenant → Database
5. **AI Flow**: Services → Oracle → Elara → AI Models

### External Integrations

- **OpenAI**: GPT-4 for AI tutoring and content generation
- **Stripe**: Payment processing
- **Blockchain**: Ethereum for smart contracts
- **Email**: MailerSend, Nodemailer
- **Storage**: Various cloud storage providers
- **Monitoring**: Prometheus, Grafana, Sentry

---

## 🚀 DEPLOYMENT & INFRASTRUCTURE

### Deployment Options

#### Docker Deployment (Recommended)
```bash
docker-compose -f docker-compose.prod.yml up -d
```

#### Cloud Deployment
```bash
./deploy-production.sh --ubuntu-mode
```

#### Manual Deployment
```bash
npm run build && npm run start:prod
```

### Environment Configuration

```bash
# Core Services
AEGIS_ENDPOINT=http://localhost:3001
NEXUS_ENDPOINT=http://localhost:3002
MINT_ENDPOINT=http://localhost:3003
COVENANT_ENDPOINT=http://localhost:3004
LMS_ENDPOINT=http://localhost:3005
SYNAPSE_ENDPOINT=http://localhost:3006
API_GATEWAY_ENDPOINT=http://localhost:3000

# B2B Services
RETAIL_AI_ENDPOINT=http://localhost:4001
COLD_CHAIN_ENDPOINT=http://localhost:4002
COMMUNITY_SAFETY_ENDPOINT=http://localhost:4003

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/azora
REDIS_URL=redis://localhost:6379

# AI Services
OPENAI_API_KEY=your_key_here
```

### Infrastructure Components

- **Container Orchestration**: Kubernetes
- **Service Discovery**: Master Orchestrator
- **Load Balancing**: Round-robin, least-connections, weighted
- **Health Monitoring**: Prometheus metrics, health checks
- **Logging**: Centralized logging with Winston
- **Monitoring**: Grafana dashboards
- **CI/CD**: GitHub Actions pipelines

---

## 📖 DOCUMENTATION INDEX

### Core Documentation

- **[README.md](./README.md)** - Main project overview
- **[THE-AZORA-MANIFESTO.md](./THE-AZORA-MANIFESTO.md)** - Complete philosophical foundation
- **[AZORA-IDENTITY.md](./AZORA-IDENTITY.md)** - Brand identity and Ubuntu philosophy
- **[REPOSITORY-STRUCTURE.md](./REPOSITORY-STRUCTURE.md)** - Detailed repository organization
- **[LAUNCH-MASTER.md](./LAUNCH-MASTER.md)** - Launch system documentation
- **[ROADMAP.md](./ROADMAP.md)** - Product roadmap and vision
- **[CONTRIBUTING.md](./CONTRIBUTING.md)** - Contribution guidelines

### Architecture Documentation

- `docs/architecture/` - System design and patterns
- `docs/api/` - API documentation
- `docs/guides/` - User and developer guides

### Specialized Documentation

- `docs/compliance-reports/` - Compliance and audit reports
- `docs/branding/` - Brand guidelines
- `docs/marketing/` - Marketing materials
- `docs/research/` - Research documents

---

## ⚡ QUICK REFERENCE

### Access Points

- **🌐 API Gateway**: http://localhost:4000
- **🎓 Student Portal**: http://localhost:3000
- **💼 Enterprise UI**: http://localhost:3001
- **🛒 Marketplace**: http://localhost:3002
- **💰 Financial Center**: http://localhost:3003
- **🔮 Chamber of Ghosts**: http://localhost:3005

### Key Ports

| Service | Port | Protocol |
|---------|------|----------|
| API Gateway | 4000 | HTTP |
| Auth Service | 4001 | HTTP |
| Azora Mint | 4002 | HTTP |
| Azora Forge | 4003 | HTTP |
| Azora Nexus | 4004 | HTTP |
| Oracle/Chamber | 3005 | HTTP |
| Azora Education | 4006 | HTTP |
| Azora LMS | 4007 | HTTP |
| Azora Aegis | 4008 | HTTP |
| Azora Covenant | 4009 | HTTP |
| Master Orchestrator | 5000 | HTTP |

### Common Commands

```bash
# System Management
npm run supreme:full          # Full system launch
npm run scan:system          # System analysis
npm run health:check         # Health check

# Development
npm run dev:all              # Start all
npm run dev:services         # Services only
npm run dev:frontend         # Frontend only

# Database
npm run db:migrate           # Run migrations
npm run db:generate          # Generate Prisma
npm run db:reset             # Reset database

# Testing
npm run test:all             # All tests
npm run test:services        # Service tests
npm run test:frontend        # Frontend tests
```

### Key Files

- `package.json` - Root package configuration
- `docker-compose.yml` - Docker configuration
- `docker-compose.prod.yml` - Production Docker config
- `.env.example` - Environment variables template
- `tsconfig.json` - TypeScript configuration
- `next.config.js` - Next.js configuration
- `tailwind.config.js` - Tailwind CSS configuration

### Support & Community

- **Discord**: Ubuntu community discussions
- **GitHub Discussions**: Feature requests and Q&A
- **Documentation**: `docs/` directory
- **Issues**: GitHub Issues for bug reports

---

## 🎯 PROJECT STATUS SUMMARY

### Current Status (Q4 2025)

**✅ Completed:**
- Core platform infrastructure (v1.0)
- Education platform with AI tutoring
- Financial engine with multi-currency support
- Marketplace and skills platform
- Security framework (Aegis)
- Service orchestration system
- 15+ frontend applications
- 190+ backend services (framework)

**🚧 In Progress:**
- API Gateway enhancements (30% complete)
- Authentication service (40% complete)
- LMS feature implementations
- Mobile applications
- B2B vertical solutions

**📋 Planned:**
- Global expansion (100+ languages)
- Advanced AI features
- Quantum computing integration
- Healthcare integration
- DAO governance structure

### Success Metrics

| Metric | Target | Current |
|--------|--------|---------|
| **Active Users** | 10 million | Growing |
| **Services** | 190+ | 190+ (8% production-ready) |
| **Applications** | 15+ | 15+ |
| **Test Coverage** | 80%+ | 87% |
| **System Uptime** | 99.9% | 99.9% |

---

## 🌟 UBUNTU MANIFESTO

**"Ngiyakwazi ngoba sikwazi" - "I can because we can"**

*Through Ubuntu, we multiply sovereignty.  
Through learning, we generate abundance.  
Through sharing, we amplify freedom.  
We are Azora. Azora is us.*

---

## 📞 QUICK CONTACTS

- **Project**: Azora OS - Constitutional AI Operating System
- **Repository**: https://github.com/azora-os/azora-os
- **Website**: https://azora.es
- **License**: Proprietary (Azora ES (Pty) Ltd)
- **Version**: 3.0.0

---

**Document Maintained By**: Azora OS Development Team  
**Last Review**: November 2025  
**Next Review**: December 2025

---

*"Building the Future of Constitutional AI" 🚀*  
*Ubuntu Philosophy • Quantum Technology • Global Prosperity*
