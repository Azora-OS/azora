# 🎯 AZORA MASTER PROMPT - Complete Implementation Guide

**For:** Junie (Coding Agent)  
**Mission:** Scan entire repository, identify gaps, implement all missing components  
**Execution:** Single comprehensive pass  
**Philosophy:** Ubuntu - "I am because we are"

---

## 📋 EXECUTION CHECKLIST

Junie, execute these tasks in order. Check each as complete:

### Phase 1: Repository Audit (15 min)
- [ ] Scan all directories: `apps/`, `services/`, `packages/`, `core/`, `tools/`, `infrastructure/`
- [ ] List all `package.json` files and verify dependencies
- [ ] Check all `tsconfig.json` files for consistency
- [ ] Verify `.github/workflows/` contents
- [ ] Audit environment files (`.env`, `.env.example`)
- [ ] Check test coverage configuration
- [ ] Review security configurations

### Phase 2: Critical Missing Files (30 min)
- [ ] Create `SECURITY.md` with vulnerability reporting
- [ ] Create `SUPPORT.md` with maintainer contacts
- [ ] Create `.github/CODEOWNERS` for review ownership
- [ ] Create `.nvmrc` with Node version (20.x)
- [ ] Create `.node-version` backup
- [ ] Create `.eslintignore` if missing
- [ ] Create `commitlint.config.js` for conventional commits
- [ ] Create `lint-staged.config.js` for pre-commit hooks
- [ ] Create `docs/ARCHITECTURE.md` with system diagrams
- [ ] Create `docs/ONBOARDING.md` for new developers
- [ ] Create `docs/ENVIRONMENTS.md` for env documentation
- [ ] Create `docs/SLO.md` for service level objectives
- [ ] Create `docs/adrs/` directory with initial ADRs

### Phase 3: CI/CD Workflows (45 min)
Create in `.github/workflows/`:
- [ ] `ci.yml` - Main CI pipeline (lint, typecheck, test, build)
- [ ] `test.yml` - Unit & integration tests
- [ ] `e2e.yml` - Playwright end-to-end tests
- [ ] `lint.yml` - ESLint, Prettier, markdownlint
- [ ] `typecheck.yml` - TypeScript type checking
- [ ] `security.yml` - Security scanning (npm audit, Snyk)
- [ ] `deploy-staging.yml` - Staging deployment
- [ ] `deploy-production.yml` - Production deployment with approvals
- [ ] `release.yml` - Automated releases with changesets
- [ ] `dependency-update.yml` - Dependabot automation

### Phase 4: Per-Package Consistency (60 min)
For each in `apps/`, `services/`, `packages/`:
- [ ] Verify `package.json` with standard scripts: `dev`, `build`, `test`, `lint`, `typecheck`
- [ ] Create/update `tsconfig.json` extending root config
- [ ] Create `README.md` with: purpose, setup, usage, API docs
- [ ] Add `jest.config.js` if tests exist
- [ ] Add `.env.example` for services
- [ ] Document ownership in README or OWNERS file

### Phase 5: TypeScript Configuration (30 min)
- [ ] Create `tsconfig.base.json` at root
- [ ] Update root `tsconfig.json` to extend base
- [ ] Configure `paths` for `@azora/*` package aliases
- [ ] Add `references` for project dependencies
- [ ] Ensure all packages have proper `tsconfig.json`
- [ ] Fix all TypeScript errors reported in IMPLEMENTATION-STATUS.md

### Phase 6: Testing Infrastructure (45 min)
- [ ] Update `jest.config.js` with coverage thresholds (80%+)
- [ ] Create `tests/unit/`, `tests/integration/`, `tests/e2e/` structure
- [ ] Add `packages/test-utils` for shared test helpers
- [ ] Configure Playwright for multi-environment testing
- [ ] Add contract/API tests for services
- [ ] Create test data factories
- [ ] Add performance/load tests setup

### Phase 7: Security & Compliance (30 min)
- [ ] Create secrets policy document
- [ ] Add environment variable validation (Zod schemas)
- [ ] Configure CORS properly in API Gateway
- [ ] Add CSRF protection middleware
- [ ] Implement rate limiting
- [ ] Add security headers (helmet.js)
- [ ] Create security audit checklist
- [ ] Document authentication flows

### Phase 8: Infrastructure & DevOps (45 min)
- [ ] Create unified `infrastructure/README.md` explaining all infra folders
- [ ] Add Terraform/IaC validation in CI
- [ ] Create runbooks in `docs/runbooks/` for common issues
- [ ] Document deployment process
- [ ] Add health check endpoints to all services
- [ ] Configure monitoring alerts
- [ ] Create disaster recovery plan
- [ ] Document rollback procedures

### Phase 9: Observability (30 min)
- [ ] Define SLOs for each service
- [ ] Create logging standards document
- [ ] Add structured logging to all services
- [ ] Implement correlation IDs
- [ ] Configure log aggregation
- [ ] Add performance monitoring
- [ ] Create dashboards for key metrics
- [ ] Link alerts to runbooks

### Phase 10: Documentation (45 min)
- [ ] Create `docs/ARCHITECTURE.md` with system diagrams
- [ ] Create `docs/ONBOARDING.md` for new developers
- [ ] Create `docs/API.md` consolidating all API docs
- [ ] Create `docs/DEPLOYMENT.md` with step-by-step guides
- [ ] Create `docs/TROUBLESHOOTING.md` for common issues
- [ ] Add ADRs for major decisions
- [ ] Document design system in `docs/DESIGN-SYSTEM.md`
- [ ] Create accessibility guidelines

### Phase 11: Dependency Management (30 min)
- [ ] Install missing dependencies from IMPLEMENTATION-STATUS.md:
  - `@types/node`
  - `@stripe/stripe-js`
  - Jest type definitions
- [ ] Audit all dependencies for vulnerabilities
- [ ] Update outdated packages
- [ ] Configure Renovate/Dependabot
- [ ] Document dependency update policy
- [ ] Add license compliance checking

### Phase 12: Quality Gates (30 min)
- [ ] Configure Husky pre-commit hooks
- [ ] Add lint-staged for staged files only
- [ ] Add commitlint for conventional commits
- [ ] Configure branch protection rules
- [ ] Add PR templates
- [ ] Add issue templates
- [ ] Configure required status checks
- [ ] Add code review guidelines

---

## 🎯 SPECIFIC FILE TEMPLATES

### 1. SECURITY.md
```markdown
# Security Policy

## Supported Versions
| Version | Supported          |
| ------- | ------------------ |
| 3.0.x   | :white_check_mark: |
| < 3.0   | :x:                |

## Reporting a Vulnerability
Email: security@azora.world
Response time: 48 hours
Disclosure: Coordinated after fix

## Security Measures
- MFA authentication
- OAuth 2.0 + JWT
- Rate limiting
- CORS protection
- Input validation
- SQL injection prevention
- XSS protection
```

### 2. .nvmrc
```
20.11.0
```

### 3. commitlint.config.js
```javascript
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [2, 'always', [
      'feat', 'fix', 'docs', 'style', 'refactor',
      'perf', 'test', 'build', 'ci', 'chore', 'revert'
    ]],
    'scope-enum': [2, 'always', [
      'education', 'finance', 'marketplace', 'auth',
      'ai-family', 'api', 'ui', 'infra', 'docs'
    ]]
  }
};
```

### 4. lint-staged.config.js
```javascript
module.exports = {
  '*.{js,jsx,ts,tsx}': ['eslint --fix', 'prettier --write'],
  '*.{json,md,yml,yaml}': ['prettier --write'],
  '*.{css,scss}': ['prettier --write']
};
```

### 5. .github/workflows/ci.yml
```yaml
name: CI Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version-file: '.nvmrc'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint

  typecheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version-file: '.nvmrc'
          cache: 'npm'
      - run: npm ci
      - run: npm run typecheck

  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version-file: '.nvmrc'
          cache: 'npm'
      - run: npm ci
      - run: npm run test:coverage
      - uses: codecov/codecov-action@v3

  build:
    runs-on: ubuntu-latest
    needs: [lint, typecheck, test]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version-file: '.nvmrc'
          cache: 'npm'
      - run: npm ci
      - run: npm run build
```

### 6. tsconfig.base.json
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "commonjs",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "allowJs": true,
    "checkJs": false,
    "jsx": "preserve",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "removeComments": true,
    "noEmit": false,
    "importHelpers": true,
    "isolatedModules": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "skipLibCheck": true,
    "baseUrl": ".",
    "paths": {
      "@azora/core/*": ["./core/*/src"],
      "@azora/packages/*": ["./packages/*/src"],
      "@azora/services/*": ["./services/*/src"],
      "@azora/apps/*": ["./apps/*/src"]
    }
  },
  "exclude": ["node_modules", "dist", ".next", "coverage", "playwright-report"]
}
```

### 7. Environment Validation (services/shared/env-schema.ts)
```typescript
import { z } from 'zod';

export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'staging', 'production']),
  PORT: z.string().transform(Number),
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
  OPENAI_API_KEY: z.string().min(20),
  STRIPE_SECRET_KEY: z.string().startsWith('sk_'),
  CORS_ORIGIN: z.string().url(),
});

export type Env = z.infer<typeof envSchema>;

export function validateEnv(): Env {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    console.error('❌ Invalid environment variables:', error);
    process.exit(1);
  }
}
```

---

## 🔍 AUDIT COMMANDS

Run these to verify completeness:

```bash
# Check all package.json files
find . -name "package.json" -not -path "*/node_modules/*" -exec echo {} \;

# Check all tsconfig.json files
find . -name "tsconfig.json" -not -path "*/node_modules/*" -exec echo {} \;

# Check for missing README files
find apps services packages -maxdepth 2 -type d -not -path "*/node_modules/*" -exec test ! -f {}/README.md \; -print

# Check TypeScript errors
npm run typecheck 2>&1 | tee typescript-errors.log

# Check test coverage
npm run test:coverage

# Check for security vulnerabilities
npm audit --audit-level=moderate

# Check for outdated dependencies
npm outdated

# Verify all services have health endpoints
for port in {4000..4007}; do curl -s http://localhost:$port/health || echo "Port $port not responding"; done
```

---

## 📊 SUCCESS CRITERIA

Mark complete when:
- [ ] All TypeScript errors resolved (0 errors)
- [ ] Test coverage ≥ 80% across all packages
- [ ] All CI workflows passing
- [ ] All services have README, tests, and health checks
- [ ] Security audit passes with 0 high/critical issues
- [ ] All documentation complete and accurate
- [ ] Environment validation implemented
- [ ] Monitoring and observability configured
- [ ] Deployment pipelines tested
- [ ] All 12 phases completed

---

## 🚨 PRIORITY ORDER

If time-constrained, implement in this order:

1. **Critical (Do First)**
   - Fix TypeScript errors
   - Install missing dependencies
   - Create CI workflows
   - Add security measures

2. **High Priority**
   - Per-package consistency
   - Testing infrastructure
   - Documentation
   - Environment validation

3. **Medium Priority**
   - Observability
   - Infrastructure docs
   - Quality gates
   - Dependency management

4. **Nice to Have**
   - ADRs
   - Advanced monitoring
   - Performance optimization
   - Design system docs

---

## 💡 IMPLEMENTATION NOTES

### For Junie:
1. **Read First**: Scan entire repo structure before making changes
2. **Batch Operations**: Group similar tasks (all READMEs, all tsconfigs, etc.)
3. **Verify Before Commit**: Test each phase before moving to next
4. **Document Changes**: Update IMPLEMENTATION-STATUS.md after each phase
5. **Ubuntu Philosophy**: Every change should benefit the collective

### Key Principles:
- **DRY**: Don't repeat yourself - use shared configs
- **Convention**: Follow established patterns in the repo
- **Testing**: Every feature needs tests
- **Documentation**: Code is read more than written
- **Security**: Validate all inputs, sanitize all outputs

---

## 📝 FINAL DELIVERABLES

Create these summary files:

1. **IMPLEMENTATION-COMPLETE.md** - What was implemented
2. **GAPS-RESOLVED.md** - What gaps were found and fixed
3. **NEXT-STEPS.md** - Remaining work (if any)
4. **TESTING-REPORT.md** - Test results and coverage
5. **SECURITY-AUDIT.md** - Security findings and fixes

---

## 🎯 EXECUTION COMMAND

Junie, execute this prompt with:

```bash
# 1. Start audit
npm run audit:full

# 2. Implement all phases
npm run implement:all

# 3. Verify completion
npm run verify:complete

# 4. Generate reports
npm run report:implementation
```

**Ubuntu Principle**: "Ngiyakwazi ngoba sikwazi" - I can because we can

**Status**: Ready for execution 🚀
