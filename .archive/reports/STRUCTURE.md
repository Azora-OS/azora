# 📁 Azora OS Production Structure

## Overview

This document defines the production-grade structure for Azora OS.

## Directory Structure

```
azora/
├── .github/                    # GitHub Actions & CI/CD
│   ├── workflows/             # Automated workflows
│   ├── ISSUE_TEMPLATE/        # Issue templates
│   └── CODEOWNERS             # Code ownership
│
├── .archive/                   # Archived/deprecated code
│   ├── reports/               # Old status reports
│   ├── services/              # Deprecated services
│   ├── apps/                  # Old applications
│   ├── scripts/               # Old scripts
│   └── configs/               # Old configurations
│
├── apps/                       # Frontend Applications
│   ├── student-portal/        # Student learning interface
│   ├── enterprise-ui/         # Business management
│   ├── marketplace-ui/        # Job marketplace
│   └── pay-ui/                # Financial dashboard
│
├── services/                   # Backend Microservices
│   ├── api-gateway/           # API routing & orchestration
│   ├── auth-service/          # Authentication & authorization
│   ├── azora-education/       # Education platform
│   ├── azora-mint/            # Financial engine
│   ├── azora-forge/           # Job marketplace
│   ├── azora-sapiens/         # AI tutor
│   ├── ai-family-service/     # AI family system
│   └── health-monitor/        # System monitoring
│
├── packages/                   # Shared Libraries
│   ├── @azora/
│   │   ├── ui/               # Design system components
│   │   ├── types/            # TypeScript definitions
│   │   ├── utils/            # Utility functions
│   │   ├── constants/        # Shared constants
│   │   └── hooks/            # React hooks
│   └── shared/
│       ├── auth/             # Auth utilities
│       ├── database/         # Database utilities
│       └── api/              # API client
│
├── infrastructure/             # DevOps & Deployment
│   ├── docker/               # Docker configurations
│   ├── kubernetes/           # K8s manifests
│   ├── terraform/            # Infrastructure as Code
│   ├── monitoring/           # Prometheus, Grafana
│   └── scripts/              # Deployment scripts
│
├── docs/                       # Documentation
│   ├── api/                  # API documentation
│   ├── architecture/         # System architecture
│   ├── deployment/           # Deployment guides
│   ├── guides/               # User guides
│   └── examples/             # Code examples
│
├── scripts/                    # Build & Utility Scripts
│   ├── cleanup-production.js # Production cleanup
│   ├── verify-structure.js   # Structure verification
│   ├── db-setup.js           # Database setup
│   └── deploy-production.sh  # Production deployment
│
├── tests/                      # Test Suites
│   ├── unit/                 # Unit tests
│   ├── integration/          # Integration tests
│   ├── e2e/                  # End-to-end tests
│   └── performance/          # Performance tests
│
├── prisma/                     # Database
│   ├── migrations/           # Database migrations
│   ├── schema.prisma         # Database schema
│   └── seed.ts               # Seed data
│
├── .env.example               # Environment template
├── .gitignore                 # Git ignore rules
├── docker-compose.yml         # Development compose
├── docker-compose.prod.yml    # Production compose
├── package.json               # Root package config
├── tsconfig.json              # TypeScript config
├── jest.config.js             # Jest config
├── README.md                  # Main documentation
├── LICENSE                    # License
└── CONTRIBUTING.md            # Contribution guide
```

## Core Services (8)

### 1. API Gateway (Port 4000)
**Purpose:** Central entry point for all API requests
**Tech:** Node.js, Express, Rate limiting, Circuit breakers
**Endpoints:** `/api/*`

### 2. Auth Service (Port 4001)
**Purpose:** Authentication & authorization
**Tech:** JWT, OAuth, MFA, Passport.js
**Endpoints:** `/auth/*`

### 3. Azora Education (Port 4002)
**Purpose:** Learning management system
**Tech:** Node.js, PostgreSQL, Redis
**Endpoints:** `/education/*`

### 4. Azora Mint (Port 4003)
**Purpose:** Financial engine & wallet
**Tech:** Node.js, Blockchain, Stripe
**Endpoints:** `/mint/*`, `/wallet/*`

### 5. Azora Forge (Port 4004)
**Purpose:** Job marketplace & matching
**Tech:** Node.js, AI matching, PostgreSQL
**Endpoints:** `/forge/*`, `/jobs/*`

### 6. Azora Sapiens (Port 4005)
**Purpose:** AI tutor & learning assistant
**Tech:** OpenAI, Node.js, Vector DB
**Endpoints:** `/sapiens/*`, `/tutor/*`

### 7. AI Family Service (Port 4006)
**Purpose:** AI family personalities
**Tech:** OpenAI, Character AI, Node.js
**Endpoints:** `/family/*`, `/chat/*`

### 8. Health Monitor (Port 4007)
**Purpose:** System health & monitoring
**Tech:** Prometheus, Grafana, Node.js
**Endpoints:** `/health/*`, `/metrics/*`

## Core Apps (4)

### 1. Student Portal (Port 3000)
**Purpose:** Student learning interface
**Tech:** Next.js, React, Tailwind CSS
**Routes:** `/`, `/courses`, `/progress`, `/wallet`

### 2. Enterprise UI (Port 3001)
**Purpose:** Business management interface
**Tech:** Next.js, React, Tailwind CSS
**Routes:** `/dashboard`, `/analytics`, `/team`, `/billing`

### 3. Marketplace UI (Port 3002)
**Purpose:** Job marketplace interface
**Tech:** Next.js, React, Tailwind CSS
**Routes:** `/jobs`, `/freelancers`, `/projects`, `/skills`

### 4. Pay UI (Port 3003)
**Purpose:** Financial dashboard
**Tech:** Next.js, React, Tailwind CSS
**Routes:** `/wallet`, `/transactions`, `/mining`, `/exchange`

## Shared Packages

### @azora/ui
Design system components following Ubuntu philosophy
- Buttons, Forms, Cards, Modals
- Glassmorphism effects
- Responsive layouts

### @azora/types
TypeScript type definitions
- API types
- Database models
- Shared interfaces

### @azora/utils
Utility functions
- Date formatting
- Validation
- Encryption

### @azora/constants
Shared constants
- API endpoints
- Error codes
- Configuration

## File Naming Conventions

### Services
```
services/
└── service-name/
    ├── src/
    │   ├── controllers/
    │   ├── services/
    │   ├── models/
    │   ├── routes/
    │   └── index.ts
    ├── tests/
    ├── package.json
    ├── tsconfig.json
    └── README.md
```

### Apps
```
apps/
└── app-name/
    ├── src/
    │   ├── app/
    │   ├── components/
    │   ├── lib/
    │   └── styles/
    ├── public/
    ├── package.json
    ├── next.config.js
    └── README.md
```

### Packages
```
packages/
└── @azora/
    └── package-name/
        ├── src/
        ├── dist/
        ├── package.json
        ├── tsconfig.json
        └── README.md
```

## Environment Files

- `.env.example` - Template (committed)
- `.env` - Local development (ignored)
- `.env.production` - Production (ignored)
- `.env.staging` - Staging (ignored)

## Configuration Files

### Root Level Only
- `package.json` - Workspace configuration
- `tsconfig.json` - Base TypeScript config
- `jest.config.js` - Test configuration
- `docker-compose.yml` - Development
- `docker-compose.prod.yml` - Production

### Service/App Level
- `package.json` - Service dependencies
- `tsconfig.json` - Extends root config
- `README.md` - Service documentation

## Documentation Structure

```
docs/
├── api/
│   ├── openapi.yaml
│   ├── authentication.md
│   └── endpoints/
├── architecture/
│   ├── overview.md
│   ├── services.md
│   └── database.md
├── deployment/
│   ├── docker.md
│   ├── kubernetes.md
│   └── production.md
└── guides/
    ├── getting-started.md
    ├── development.md
    └── contributing.md
```

## Archive Policy

### What Goes in Archive
- Old status reports
- Deprecated services
- Experimental code
- Old deployment scripts
- Duplicate configurations

### What Never Gets Archived
- Core services
- Core apps
- Active documentation
- Production configurations
- Test suites

## Maintenance

### Weekly
- Run `npm run verify:structure`
- Check for new files in root
- Review service health

### Monthly
- Run `npm run cleanup:production`
- Update dependencies
- Review archived code

### Quarterly
- Full structure audit
- Remove truly obsolete code
- Update documentation

## Best Practices

1. **Keep Root Clean** - Max 20 files
2. **One Service, One Purpose** - Single responsibility
3. **Shared Code in Packages** - DRY principle
4. **Document Everything** - README in every directory
5. **Test Everything** - 80%+ coverage
6. **Archive, Don't Delete** - Preserve history

## Quick Commands

```bash
# Verify structure
npm run verify:structure

# Clean up
npm run cleanup:production

# Start all services
npm run dev

# Build for production
npm run build

# Run tests
npm test

# Deploy
npm run deploy:production
```

---

**Last Updated:** 2025-01-10
**Version:** 3.0.0
**Status:** Production Ready
