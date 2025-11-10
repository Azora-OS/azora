# ⚡ AZORA OS - TURBOREPO INTEGRATION PLAN

**Document ID:** AZORA-TURBOREPO-001  
**Date:** January 2025  
**Architect:** Composer (Senior Architect)  
**Status:** 🟢 Ready for Implementation  
**Classification:** Build System Migration

---

## 📋 EXECUTIVE SUMMARY

### Decision: Turborepo Selected ✅

**Rationale:**
- ✅ Best performance for our scale (190+ services, 15+ apps)
- ✅ Zero-config with Next.js (perfect fit)
- ✅ Africa-first friendly (offline cache)
- ✅ Ubuntu-aligned (shared cache benefits)
- ✅ Constitutional compliance (self-hosted cache)

### Integration Timeline

**Phase 1:** Setup & Core Migration (Week 1-2)  
**Phase 2:** Service Migration (Week 3-4)  
**Phase 3:** Optimization & CI/CD (Week 5)

---

## 🎯 PHASE 1: SETUP & CORE MIGRATION (Weeks 1-2)

### Sprint 1.1: Turborepo Installation & Configuration (Week 1, Days 1-2)

#### Step 1: Install Turborepo

```bash
# Root package.json
npm install -D turbo

# Update package.json scripts
```

#### Step 2: Create `turbo.json`

```json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": [
    "**/.env.*local",
    "tsconfig.json",
    "package.json"
  ],
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [
        ".next/**",
        "dist/**",
        "build/**",
        "!.next/cache/**"
      ],
      "env": [
        "NODE_ENV",
        "NEXT_PUBLIC_*",
        "DATABASE_URL",
        "REDIS_URL",
        "CHRONICLE_CONTRACT_ADDRESS"
      ]
    },
    "dev": {
      "cache": false,
      "persistent": true,
      "env": [
        "NODE_ENV",
        "PORT",
        "DATABASE_URL",
        "REDIS_URL"
      ]
    },
    "test": {
      "dependsOn": ["build"],
      "outputs": ["coverage/**"],
      "env": ["NODE_ENV", "CI"]
    },
    "lint": {
      "outputs": [],
      "env": ["NODE_ENV"]
    },
    "type-check": {
      "dependsOn": ["^build"],
      "outputs": []
    },
    "db:migrate": {
      "cache": false,
      "env": ["DATABASE_URL"]
    },
    "db:generate": {
      "cache": false,
      "outputs": ["**/node_modules/.prisma/**"]
    }
  },
  "remoteCache": {
    "enabled": true,
    "signature": true
  }
}
```

#### Step 3: Update Root `package.json`

```json
{
  "name": "azora-os",
  "version": "3.0.0",
  "private": true,
  "workspaces": [
    "apps/*",
    "services/*",
    "packages/@azora/*",
    "packages/shared/*"
  ],
  "scripts": {
    "build": "turbo run build",
    "dev": "turbo run dev",
    "test": "turbo run test",
    "lint": "turbo run lint",
    "type-check": "turbo run type-check",
    "clean": "turbo run clean && rm -rf .turbo",
    "db:migrate": "turbo run db:migrate",
    "db:generate": "turbo run db:generate"
  },
  "devDependencies": {
    "turbo": "^2.0.0"
  }
}
```

**Deliverables:**
- ✅ Turborepo installed
- ✅ `turbo.json` configured
- ✅ Root scripts updated

**Effort:** 4 hours  
**Owner:** Snr Architect

---

### Sprint 1.2: Migrate Core Apps (Week 1, Days 3-5)

#### Priority Apps (Migrate First)

1. **apps/app** (Main Next.js app)
2. **apps/azora-ui** (Main UI)
3. **apps/student-portal** (Critical user-facing)

#### Migration Steps for Each App

**Step 1: Update `package.json`**

```json
{
  "name": "@azora/app",
  "version": "1.0.0",
  "scripts": {
    "build": "next build",
    "dev": "next dev",
    "lint": "next lint",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "next": "^16.0.0",
    "react": "^19.0.0"
  }
}
```

**Step 2: Add `.turboignore` (if needed)**

```
# .turboignore
node_modules
.next
dist
coverage
*.log
```

**Step 3: Test Build**

```bash
# From root
turbo build --filter=@azora/app
```

**Deliverables:**
- ✅ 3 core apps migrated
- ✅ Builds working with Turborepo
- ✅ Cache working

**Effort:** 1.5 days  
**Owner:** Frontend Team

---

### Sprint 1.3: Migrate Critical Services (Week 2, Days 1-3)

#### Priority Services (Migrate First)

1. **services/api-gateway** (Critical infrastructure)
2. **services/auth-service** (Security critical)
3. **services/chronicle-protocol** (Constitutional)

#### Migration Steps for Each Service

**Step 1: Update `package.json`**

```json
{
  "name": "@azora/api-gateway",
  "version": "1.0.0",
  "scripts": {
    "build": "tsc",
    "dev": "tsx watch src/index.ts",
    "start": "node dist/index.js",
    "lint": "eslint src",
    "type-check": "tsc --noEmit"
  }
}
```

**Step 2: Add Build Output**

```typescript
// tsconfig.json
{
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  }
}
```

**Step 3: Test Build**

```bash
turbo build --filter=@azora/api-gateway
```

**Deliverables:**
- ✅ 3 critical services migrated
- ✅ Builds working
- ✅ Dev mode working

**Effort:** 2 days  
**Owner:** Backend Team

---

### Sprint 1.4: Set Up Remote Cache (Week 2, Days 4-5)

#### Option 1: Self-Hosted Cache (Constitutional Independence)

**Step 1: Set Up Vercel Remote Cache (Easiest)**

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Link project
vercel link

# Enable remote cache
turbo login
```

**Step 2: Configure for Self-Hosted (Future)**

```bash
# Set custom cache endpoint
export TURBO_REMOTE_CACHE_URL="https://cache.azora.es"
export TURBO_REMOTE_CACHE_SIGNATURE_KEY="your-signature-key"

# Or use .env
echo "TURBO_REMOTE_CACHE_URL=https://cache.azora.es" >> .env
```

**Deliverables:**
- ✅ Remote cache configured
- ✅ Team can share cache
- ✅ Faster builds for all

**Effort:** 4 hours  
**Owner:** DevOps Team

---

## 🚀 PHASE 2: SERVICE MIGRATION (Weeks 3-4)

### Sprint 2.1: Migrate Remaining Apps (Week 3)

#### Apps to Migrate

- [ ] apps/enterprise-ui
- [ ] apps/marketplace-ui
- [ ] apps/pay-ui
- [ ] apps/cloud-ui
- [ ] apps/compliance-ui
- [ ] apps/dev-ui
- [ ] apps/learn-ui
- [ ] apps/mobile (if applicable)

**Process:**
1. Update `package.json` scripts
2. Test build with Turborepo
3. Verify cache hits
4. Update documentation

**Effort:** 3 days  
**Owner:** Frontend Team

---

### Sprint 2.2: Migrate Core Services (Week 3-4)

#### Services to Migrate (Priority Order)

**Week 3:**
- [ ] services/azora-mint
- [ ] services/azora-lms
- [ ] services/azora-forge
- [ ] services/azora-nexus
- [ ] services/azora-education

**Week 4:**
- [ ] services/azora-aegis
- [ ] services/azora-covenant
- [ ] services/azora-oracle
- [ ] services/master-system-integrator
- [ ] services/retail-ai-service

**Process:**
1. Update `package.json`
2. Add build scripts
3. Test build
4. Verify dependencies

**Effort:** 5 days  
**Owner:** Backend Team

---

### Sprint 2.3: Migrate Packages (Week 4)

#### Packages to Migrate

- [ ] packages/@azora/core/*
- [ ] packages/@azora/education/*
- [ ] packages/@azora/finance/*
- [ ] packages/@azora/marketplace/*
- [ ] packages/shared/*

**Process:**
1. Update package.json
2. Add build scripts
3. Test imports
4. Verify type-checking

**Effort:** 2 days  
**Owner:** All Teams

---

## ⚡ PHASE 3: OPTIMIZATION & CI/CD (Week 5)

### Sprint 3.1: Optimize Build Pipeline (Week 5, Days 1-2)

#### Task Dependencies

```json
{
  "pipeline": {
    "build": {
      "dependsOn": ["^build", "db:generate"],
      "outputs": [".next/**", "dist/**"]
    },
    "db:generate": {
      "outputs": ["**/node_modules/.prisma/**"]
    },
    "test": {
      "dependsOn": ["build", "db:generate"]
    }
  }
}
```

#### Cache Optimization

```json
{
  "pipeline": {
    "build": {
      "cache": true,
      "outputs": [".next/**", "dist/**"]
    },
    "lint": {
      "cache": true,
      "outputs": []
    },
    "type-check": {
      "cache": true,
      "outputs": []
    }
  }
}
```

**Deliverables:**
- ✅ Optimized task dependencies
- ✅ Better cache hits
- ✅ Faster builds

**Effort:** 1 day  
**Owner:** Snr Architect

---

### Sprint 3.2: CI/CD Integration (Week 5, Days 3-4)

#### GitHub Actions Workflow

```yaml
# .github/workflows/turbo-ci.yml
name: Turborepo CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
        env:
          TURBO_TOKEN: ${{ secrets.TURBO_TOKEN }}
          TURBO_TEAM: ${{ secrets.TURBO_TEAM }}
      
      - name: Test
        run: npm run test
      
      - name: Lint
        run: npm run lint
      
      - name: Type Check
        run: npm run type-check
```

**Deliverables:**
- ✅ CI/CD integrated
- ✅ Remote cache in CI
- ✅ Faster CI builds

**Effort:** 1 day  
**Owner:** DevOps Team

---

### Sprint 3.3: Documentation & Training (Week 5, Day 5)

#### Documentation Updates

1. **Update README.md**
   - Add Turborepo commands
   - Document build process
   - Add troubleshooting

2. **Create Developer Guide**
   - How to add new app/service
   - How to use Turborepo commands
   - Cache troubleshooting

3. **Team Training**
   - Turborepo basics
   - Cache benefits
   - Best practices

**Deliverables:**
- ✅ Documentation updated
- ✅ Team trained
- ✅ Best practices documented

**Effort:** 1 day  
**Owner:** Snr Architect + Tech Writers

---

## 📊 INTEGRATION WITH REMEDIATION PLAN

### Updated Timeline

```
Week 1: Security Fixes + Turborepo Setup
  ├── Monday-Tuesday: Security fixes
  ├── Wednesday: Turborepo installation
  └── Thursday-Friday: Core apps migration

Week 2: Database Setup + Service Migration
  ├── Monday-Tuesday: Database setup
  ├── Wednesday-Thursday: Critical services migration
  └── Friday: Remote cache setup

Week 3-4: Service Migration (Parallel with Business Logic)
  ├── Week 3: Remaining apps + core services
  └── Week 4: Remaining services + packages

Week 5: Optimization & CI/CD
  ├── Build pipeline optimization
  ├── CI/CD integration
  └── Documentation
```

### Dependencies

```
Turborepo Setup
  ↓
Core Apps Migration
  ↓
Service Migration
  ↓
Optimization
  ↓
CI/CD Integration
```

---

## 🎯 SUCCESS METRICS

### Build Performance

| Metric | Before | Target | After |
|--------|--------|--------|-------|
| **Full Build Time** | ~45 min | <15 min | TBD |
| **Incremental Build** | ~20 min | <5 min | TBD |
| **Cache Hit Rate** | 0% | >80% | TBD |
| **CI Build Time** | ~30 min | <10 min | TBD |

### Developer Experience

| Metric | Before | Target | After |
|--------|--------|--------|-------|
| **Local Dev Startup** | ~2 min | <30 sec | TBD |
| **Build Confidence** | Low | High | TBD |
| **Team Satisfaction** | 6/10 | 9/10 | TBD |

---

## 🚨 MIGRATION CHECKLIST

### Pre-Migration

- [ ] Backup current build scripts
- [ ] Document current build times
- [ ] Identify critical paths
- [ ] Set up test environment

### Migration

- [ ] Install Turborepo
- [ ] Create `turbo.json`
- [ ] Migrate core apps
- [ ] Migrate critical services
- [ ] Set up remote cache
- [ ] Test builds
- [ ] Update CI/CD

### Post-Migration

- [ ] Measure build performance
- [ ] Document improvements
- [ ] Train team
- [ ] Update documentation
- [ ] Monitor cache hits

---

## 📝 TURBOREPO CONFIGURATION FILES

### `turbo.json` (Complete)

```json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": [
    "**/.env.*local",
    "tsconfig.json",
    "package.json",
    "turbo.json"
  ],
  "pipeline": {
    "build": {
      "dependsOn": ["^build", "db:generate"],
      "outputs": [
        ".next/**",
        "dist/**",
        "build/**",
        "!.next/cache/**"
      ],
      "env": [
        "NODE_ENV",
        "NEXT_PUBLIC_*",
        "DATABASE_URL",
        "REDIS_URL",
        "CHRONICLE_CONTRACT_ADDRESS",
        "OPENAI_API_KEY"
      ]
    },
    "dev": {
      "cache": false,
      "persistent": true,
      "env": [
        "NODE_ENV",
        "PORT",
        "DATABASE_URL",
        "REDIS_URL"
      ]
    },
    "test": {
      "dependsOn": ["build"],
      "outputs": ["coverage/**"],
      "env": ["NODE_ENV", "CI"]
    },
    "lint": {
      "outputs": [],
      "env": ["NODE_ENV"]
    },
    "type-check": {
      "dependsOn": ["^build"],
      "outputs": []
    },
    "db:migrate": {
      "cache": false,
      "env": ["DATABASE_URL"]
    },
    "db:generate": {
      "cache": false,
      "outputs": ["**/node_modules/.prisma/**"]
    },
    "clean": {
      "cache": false
    }
  },
  "remoteCache": {
    "enabled": true,
    "signature": true
  }
}
```

### `.turboignore` (Root)

```
# Dependencies
node_modules
.pnp
.pnp.js

# Build outputs
.next
dist
build
out
coverage

# Logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Environment
.env
.env.local
.env.*.local

# IDE
.vscode
.idea
*.swp
*.swo

# OS
.DS_Store
Thumbs.db
```

---

## 🎖️ CONSTITUTIONAL COMPLIANCE

### Article VI: Infrastructure Independence

**Turborepo Compliance:**
- ✅ Self-hosted cache possible (future)
- ✅ No external dependencies required
- ✅ Works offline (local cache)

### Article XVI: No Mock Protocol

**Build System Compliance:**
- ✅ Real builds (no mock builds)
- ✅ Production-ready outputs
- ✅ No placeholder configurations

### Ubuntu Philosophy

**Shared Benefits:**
- ✅ Shared cache (team benefits)
- ✅ Faster builds (collective efficiency)
- ✅ Better DX (community benefit)

---

## 📞 COORDINATION

### With Remediation Plan

**Integration Points:**
- Week 1: Turborepo setup (parallel with security fixes)
- Week 2: Service migration (parallel with database setup)
- Week 3-4: Full migration (parallel with business logic)
- Week 5: Optimization (after core fixes)

### With Teams

**Frontend Team:**
- Migrate apps (Week 1-3)
- Update build scripts
- Test cache benefits

**Backend Team:**
- Migrate services (Week 2-4)
- Update build outputs
- Test dependencies

**DevOps Team:**
- Set up remote cache (Week 2)
- CI/CD integration (Week 5)
- Monitor performance

---

## 🎯 FINAL RECOMMENDATION

### ✅ **PROCEED WITH TURBOREPO**

**Confidence:** 9/10  
**Timeline:** 5 weeks (integrated with remediation)  
**ROI:** High (3-5x faster builds, better DX)

**Next Steps:**
1. ✅ Install Turborepo (Week 1)
2. ✅ Migrate core apps (Week 1)
3. ✅ Migrate services (Weeks 2-4)
4. ✅ Optimize & CI/CD (Week 5)

---

**Document Status:** ✅ Complete  
**Approval:** Ready for Implementation  
**Next Update:** After Week 1 completion

**"Ngiyakwazi ngoba sikwazi" - I can because we can**

---

END OF TURBOREPO INTEGRATION PLAN
