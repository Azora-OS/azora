# Azora Service Architecture

**Generated:** November 25, 2025  
**Total Services:** 58  
**Status:** Production-Ready

---

## 🏗️ System Overview

The Azora ecosystem is built on a **Constitutional, Auditable, Antifragile, Ubuntu-driven** architecture with 58 microservices organized into 10 categories.

### The Four Pillars

1. **Constitutional AI** (Superego) - Ethical guardrails for all AI actions
2. **Auditable Ledger** (Memory) - Immutable blockchain recording
3. **Antifragile Infrastructure** (Body) - Grows stronger from failures
4. **Ubuntu Tokenomics** (Incentive) - "I can because we can" economics

---

## 📊 Service Inventory by Category

### AI Services (13)
| Service | Port | Purpose | Status |
|---------|------|---------|--------|
| ai-orchestrator | 3014 | AI coordination + Constitutional AI | ✅ Active |
| constitutional-ai | 3015 | Constitutional framework | ✅ Active |
| ai-family-service | 3016 | AI Family agents | ✅ Active |
| ai-routing | 3017 | AI request routing | ✅ Active |
| ai-ethics-monitor | 3010 | Ethics monitoring | ✅ Active |
| ai-evolution-engine | 3018 | Adaptive learning | ✅ Active |
| azora-ai | 3019 | Ubuntu AI service | ✅ Active |
| elara-content-generator | 3020 | Content generation | ✅ Active |
| elara-onboarding | 3021 | Universal onboarding | ✅ Active |
| quantum-deep-mind | 3022 | Quantum AI | ✅ Active |
| quantum-tracking | 3023 | Quantum tracking | ✅ Active |
| elara-incubator | - | Business incubation | ⚠️ Scaffold |
| azora-blockchain | 4009 | Blockchain service | ✅ Active |

### Authentication (1)
| Service | Port | Purpose | Status |
|---------|------|---------|--------|
| azora-auth | 4001 | Ubuntu Constitutional auth | ✅ Active |

### Payment/Finance (3)
| Service | Port | Purpose | Status |
|---------|------|---------|--------|
| azora-pay | 3010 | Payment processing + CitadelFund | ✅ Active |
| azora-treasury | 3024 | Treasury management | ✅ Active |
| billing-service | 3025 | Invoicing | ✅ Active |

### Education (5)
| Service | Port | Purpose | Status |
|---------|------|---------|--------|
| azora-education | 3002 | Education platform | ✅ Active |
| azora-sapiens | 3003 | AI tutoring | ✅ Active |
| azora-classroom | 3026 | Live lectures | ✅ Active |
| azora-corporate-learning | 3027 | Enterprise training | ✅ Active |
| education-revenue-engine | 3028 | Revenue optimization | ✅ Active |

### Blockchain/Tokens (2)
| Service | Port | Purpose | Status |
|---------|------|---------|--------|
| azora-mint | 3011 | Proof-of-Value blockchain | ✅ Active |
| azora-ledger | 3012 | Financial accounting | ✅ Active |

### Marketplace (2)
| Service | Port | Purpose | Status |
|---------|------|---------|--------|
| azora-marketplace | 3004 | Course marketplace | ✅ Active |
| project-marketplace | 3029 | Project collaboration | ✅ Active |

### Infrastructure (4)
| Service | Port | Purpose | Status |
|---------|------|---------|--------|
| azora-api-gateway | 4000 | API gateway | ✅ Active |
| health-monitor | 3030 | Service monitoring | ✅ Active |
| monitoring-service | 3031 | System monitoring | ✅ Active |
| chaos-monkey | 3050 | Failure injection | ✅ Active |
| phoenix-server | 3051 | Auto-recovery | ✅ Active |

### Governance (3)
| Service | Port | Purpose | Status |
|---------|------|---------|--------|
| azora-judiciary-service | 3032 | Legal framework | ✅ Active |
| constitutional-court-service | 3033 | Constitutional compliance | ✅ Active |
| governance-service | 3034 | Decentralized governance | ✅ Active |

### Analytics (2)
| Service | Port | Purpose | Status |
|---------|------|---------|--------|
| analytics-dashboard | 3035 | Data visualization | ✅ Active |
| azora-analytics | 3036 | Analytics service | ✅ Active |

### Other Services (23)
| Service | Port | Purpose | Status |
|---------|------|---------|--------|
| arbiter-system | 3037 | Conflict resolution | ✅ Active |
| audit-logging-service | 3038 | Audit logging | ✅ Active |
| azora-aegis | 3039 | Security monitoring | ✅ Active |
| azora-assessment | 3005 | Quiz/grading | ✅ Active |
| azora-careers | 3040 | Job listings | ✅ Active |
| azora-erp | 3041 | ERP platform | ✅ Active |
| azora-forge | 3042 | Job matching | ✅ Active |
| azora-library | 3043 | Digital library | ✅ Active |
| azora-pricing | 3044 | Dynamic pricing | ✅ Active |
| azora-research-center | 3045 | Research management | ✅ Active |
| azora-studyspaces | 3046 | Virtual study rooms | ✅ Active |
| defi-lending | 3047 | DeFi lending | ✅ Active |
| enrollment-service | 3048 | Student enrollment | ✅ Active |
| enterprise | 3049 | Enterprise solutions | ✅ Active |
| exchange-rate-service | 3052 | Currency exchange | ✅ Active |
| frontend | 3053 | Frontend service | ✅ Active |
| kyc-aml-service | 3054 | KYC/AML compliance | ✅ Active |
| lending-service | 3055 | Loan management | ✅ Active |
| personalization-engine | 3056 | Personalization | ✅ Active |
| shared | 3057 | Shared utilities | ✅ Active |
| shield_service | 3058 | Security shield | ✅ Active |
| subscription | 3059 | Subscription management | ✅ Active |
| tamper-proof-data-service | 3060 | Data integrity | ✅ Active |

---

## 🔗 Key Integration Points

### Constitutional AI Integration
- **ai-orchestrator** → All AI services
- **azora-education** → Lesson generation critique
- **azora-sapiens** → Content critique
- **azora-mint** → Transaction validation

### Blockchain Integration
- **azora-mint** → All financial transactions
- **azora-pay** → Payment recording + CitadelFund
- **chaos-monkey** → Chaos event logging
- **phoenix-server** → Recovery incident logging

### Antifragile Infrastructure
- **chaos-monkey** → Injects failures into target services
- **phoenix-server** → Monitors all 58 services
- **azora-education** → Offline-first resilience

### Ubuntu Tokenomics
- **azora-mint** → Proof-of-Value mining
- **azora-pay** → 10% to CitadelFund
- **azora-marketplace** → Attribution enforcement

---

## 📈 Data Flow

```
User Request
    ↓
azora-api-gateway (4000)
    ↓
┌─────────────────────────────────────┐
│  Constitutional AI Critique         │
│  (ai-orchestrator:3014)            │
└─────────────────────────────────────┘
    ↓
Service Processing
    ↓
┌─────────────────────────────────────┐
│  Blockchain Recording               │
│  (azora-mint:3011)                 │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│  CitadelFund Contribution (10%)     │
│  (azora-mint/citadel)              │
└─────────────────────────────────────┘
    ↓
Response to User
```

---

## 🛡️ Protected Services

These services are **never** targeted by ChaosMonkey:

- `azora-auth` - Authentication
- `azora-pay` - Payments
- `azora-mint` - Blockchain
- `constitutional-ai` - Ethics
- `phoenix-server` - Recovery

---

## 🚀 Deployment

All services are containerized with Docker and can be orchestrated via:
- `docker-compose.all.yml` - All services
- `docker-compose.education.yml` - Education services
- `docker-compose.financial.yml` - Financial services
- `docker-compose.infrastructure.yml` - Infrastructure services

---

## 📝 Standards

All services implement:
- ✅ `/health` endpoint
- ✅ Winston logging
- ✅ Consistent error handling
- ✅ Environment variable configuration

---

**Last Updated:** November 25, 2025  
**Maintained By:** Azora Engineering Team
