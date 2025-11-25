# 🧹 Production-Grade Repository Cleanup Plan

## 🎯 Objective
Transform the Azora OS repository from development chaos to production-grade organization.

## 📊 Current Issues Identified

### 1. **Root Directory Clutter** (100+ files)
- 50+ status/report markdown files
- Multiple duplicate config files
- Scattered deployment scripts
- Mixed documentation levels

### 2. **Duplicate Configurations**
- Multiple `.env` files in root
- Duplicate `package.json` files
- Multiple `docker-compose` variants
- Redundant config files

### 3. **Unclear Service Structure**
- 150+ service directories (many duplicates/incomplete)
- Mixed naming conventions
- Unclear service boundaries
- No clear production vs development separation

### 4. **Documentation Sprawl**
- Reports scattered in root
- Duplicate documentation
- No clear documentation hierarchy
- Mixed status reports with actual docs

## 🏗️ Target Production Structure

```
azora/
├── .github/                    # CI/CD & GitHub configs
├── apps/                       # Frontend applications (production-ready only)
│   ├── student-portal/
│   ├── enterprise-ui/
│   ├── marketplace-ui/
│   └── pay-ui/
├── services/                   # Backend microservices (core only)
│   ├── api-gateway/
│   ├── auth-service/
│   ├── azora-education/
│   ├── azora-mint/
│   ├── azora-forge/
│   ├── azora-sapiens/
│   ├── ai-family-service/
│   └── health-monitor/
├── packages/                   # Shared libraries
│   ├── @azora/
│   │   ├── ui/                # Design system
│   │   ├── types/             # TypeScript types
│   │   ├── utils/             # Utilities
│   │   └── constants/         # Constants
│   └── shared/
├── infrastructure/             # DevOps & deployment
│   ├── docker/
│   ├── kubernetes/
│   ├── terraform/
│   └── monitoring/
├── docs/                       # Documentation only
│   ├── api/
│   ├── architecture/
│   ├── deployment/
│   └── guides/
├── scripts/                    # Build & deployment scripts
├── tests/                      # Test suites
├── prisma/                     # Database schemas
├── .archive/                   # Archived/deprecated code
│   ├── old-services/
│   ├── experiments/
│   └── reports/
├── .env.example               # Single env template
├── docker-compose.yml         # Development
├── docker-compose.prod.yml    # Production
├── package.json               # Root package
├── README.md                  # Main readme
└── LICENSE
```

## 🚀 Cleanup Actions

### Phase 1: Archive Non-Essential Files (Immediate)
**Move to `.archive/`:**
- All `AGENT-*` status reports (50+ files)
- All `*-STATUS.md`, `*-REPORT.md` files
- Duplicate implementation plans
- Old deployment scripts
- Experimental code

### Phase 2: Consolidate Configurations
**Keep only:**
- `.env.example` (single source of truth)
- `package.json` (root workspace)
- `docker-compose.yml` (dev)
- `docker-compose.prod.yml` (production)
- `tsconfig.json` (root)
- `.gitignore` (consolidated)

**Remove:**
- Duplicate env files
- Old config variants
- Scattered tsconfig files

### Phase 3: Service Consolidation
**Keep Core Services (8):**
1. `api-gateway` - Entry point
2. `auth-service` - Authentication
3. `azora-education` - Education platform
4. `azora-mint` - Financial engine
5. `azora-forge` - Marketplace
6. `azora-sapiens` - AI tutor
7. `ai-family-service` - AI family
8. `health-monitor` - System health

**Archive/Remove:**
- Duplicate services (e.g., multiple auth services)
- Incomplete implementations
- Experimental services
- Old versions

### Phase 4: Documentation Cleanup
**Keep in `docs/`:**
- API documentation
- Architecture guides
- Deployment guides
- Developer guides

**Move to `.archive/reports/`:**
- Status reports
- Implementation reports
- Agent reports
- Sprint reports

### Phase 5: Frontend Consolidation
**Keep Core Apps (4):**
1. `student-portal` - Student interface
2. `enterprise-ui` - Business interface
3. `marketplace-ui` - Job marketplace
4. `pay-ui` - Financial dashboard

**Archive:**
- Duplicate UIs
- Experimental apps
- Old versions

## 📋 Cleanup Checklist

### Immediate Actions
- [ ] Create `.archive/` directory structure
- [ ] Move all status reports to `.archive/reports/`
- [ ] Consolidate environment files
- [ ] Remove duplicate docker-compose files
- [ ] Clean root directory (target: <20 files)

### Service Cleanup
- [ ] Audit all 150+ services
- [ ] Identify 8 core production services
- [ ] Archive incomplete/duplicate services
- [ ] Standardize service structure
- [ ] Update service documentation

### Configuration Cleanup
- [ ] Single `.env.example` with all variables
- [ ] Consolidated `.gitignore`
- [ ] Single root `package.json` with workspaces
- [ ] Remove duplicate configs

### Documentation Cleanup
- [ ] Move reports to archive
- [ ] Organize docs by category
- [ ] Update README with new structure
- [ ] Create ARCHITECTURE.md
- [ ] Create CONTRIBUTING.md

### Testing Cleanup
- [ ] Consolidate test files
- [ ] Remove duplicate test configs
- [ ] Organize by test type (unit/integration/e2e)

## 🎯 Success Metrics

### Before
- Root files: 100+
- Services: 150+
- Config files: 20+
- Documentation files in root: 50+

### After (Target)
- Root files: <20
- Services: 8 core + archived
- Config files: 5 essential
- Documentation: Organized in `docs/`

## 🚨 Safety Measures

1. **No Deletion** - Move to `.archive/` instead
2. **Git Branch** - Create `cleanup/production-grade` branch
3. **Backup** - Create backup before cleanup
4. **Testing** - Verify core services work after cleanup
5. **Documentation** - Document all moves in CHANGELOG

## 📝 Implementation Order

1. **Create archive structure** (5 min)
2. **Move reports** (10 min)
3. **Consolidate configs** (15 min)
4. **Service audit** (30 min)
5. **Archive services** (20 min)
6. **Documentation cleanup** (15 min)
7. **Update README** (10 min)
8. **Test core services** (20 min)

**Total Time: ~2 hours**

## 🔄 Next Steps After Cleanup

1. Update CI/CD pipelines
2. Update deployment scripts
3. Create production deployment guide
4. Update developer onboarding docs
5. Create service dependency map
6. Implement monitoring for core services
7. Create backup/restore procedures
8. Document rollback procedures

---

**Ready to execute? Run: `npm run cleanup:production`**
