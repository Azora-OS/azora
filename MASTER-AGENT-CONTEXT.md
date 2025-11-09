# 🤖 MASTER AGENT CONTEXT
## Repository Cleanup & Coordination Guide

> **Created:** 2025-11-09  
> **Purpose:** Central coordination document for multi-agent repository cleanup and maintenance  
> **Status:** Active

---

## 🎯 MISSION

Clean, organize, and optimize the Azora OS repository while maintaining functionality and preserving critical documentation. Multiple agents will work in parallel on different aspects of cleanup.

---

## 🚨 SACRED RULES - NEVER BREAK THESE

### 1. **PRESERVE ALL README FILES**
- ✅ **DO NOT TOUCH** any file named `README.md`, `readme.md`, or `Readme.md`
- ✅ **DO NOT DELETE** README files under any circumstances
- ✅ **DO NOT MODIFY** README content unless explicitly instructed by user
- ✅ All READMEs are considered sacred documentation

### 2. **PRESERVE CORE FUNCTIONALITY**
- ✅ Never delete files that are actively imported/required by code
- ✅ Check for file dependencies before deletion
- ✅ Maintain working imports and exports
- ✅ Keep all package.json files intact (but can be reorganized)

### 3. **NO GIT OPERATIONS**
- ❌ Do NOT commit changes
- ❌ Do NOT push to remote
- ❌ Do NOT checkout branches
- ❌ Do NOT create branches
- ⚠️ The remote environment handles git operations automatically

### 4. **DOCUMENTATION PRESERVATION**
- ✅ Keep all manifesto files (AFRICA-FIRST-MANIFESTO.md, THE-AZORA-MANIFESTO.md, etc.)
- ✅ Preserve LICENSE files
- ✅ Keep CONTRIBUTING.md
- ✅ Maintain CHANGELOG.md

---

## 📊 REPOSITORY ANALYSIS

### Current State
- **Total Services:** 190+ microservices
- **Applications:** 15+ frontend apps
- **Root Files:** 30+ files (21 markdown files)
- **Config Files:** 100+ configuration files (many duplicates)
- **Docker Compose Files:** 40+ files
- **Scripts:** 165+ shell/batch scripts

### Key Directories
```
/workspace/
├── apps/              # 15+ frontend applications
├── services/          # 190+ backend microservices
├── core/              # Core OS components (1514 files)
├── packages/          # Shared libraries (565 files)
├── infrastructure/    # DevOps & deployment (425 files)
├── tools/             # Development tools (225 files)
├── docs/              # Documentation (219 files)
├── tests/             # Testing suites (55 files)
├── config/            # Global configurations
├── examples/          # Example code
└── [root files]       # 30+ root-level files
```

---

## 🧹 CLEANUP TARGETS

### 1. **Duplicate Configuration Files** (PRIORITY: HIGH)

#### Hardhat Configs (Remove Duplicates)
- Keep: `/workspace/config/hardhat.config.ts` (master)
- Consider removing:
  - `/workspace/config/hardhat.config.js`
  - `/workspace/config/hardhat.config.cjs`
  - Other service-specific duplicates (unless actively used)

#### PostCSS Configs (Consolidate)
- Keep: `/workspace/config/postcss.config.js`
- Remove duplicate `/workspace/config/postcss.config.cjs`

#### Tailwind Configs
- Keep service-specific tailwind configs (they need customization)
- Document which services use which config

#### Docker Compose Files (Consolidate)
- Master files: `/workspace/docker-compose.yml`, `docker-compose.prod.yml`, `docker-compose.production.yml`
- Service-specific: Keep in service directories
- Strategy: Audit for actual usage, remove unused duplicates

### 2. **Root-Level Documentation** (PRIORITY: MEDIUM)

#### Status/Report Files (Can be Archived)
Many root-level markdown files are status reports that could be moved to `/docs/reports/`:
- `DATABASE-COMPLETION-REPORT.md`
- `DIAGNOSTIC-SUMMARY.md`
- `FINAL-INTEGRATION-SUMMARY.md`
- `SYSTEM-SCAN-REPORT.md`
- `TIER-2-COMPLETION-SUMMARY.md`
- `TIER-3-EDUCATION-COMPLETION-REPORT.md`
- `TIER-5-SECURITY-COMPLETION-REPORT.md`
- `UI-SHOWCASE-REPORT.md`
- `WORLD-CLASS-EDUCATION-LAUNCH.md`

#### Keep in Root (Critical)
- `README.md` ⚠️ **SACRED - DO NOT TOUCH**
- `CONTRIBUTING.md`
- `CHANGELOG.md`
- `LICENSE`
- `THE-AZORA-MANIFESTO.md`
- `AFRICA-FIRST-MANIFESTO.md`
- `AZORA-IDENTITY.md`
- `ROADMAP.md`

### 3. **Redundant Scripts** (PRIORITY: MEDIUM)

#### Launch Scripts (Consolidate)
Multiple launch scripts exist:
- `launch-azora-complete.bat`
- `start-all-services.bat/sh`
- `/workspace/tools/scripts/DEPLOY-ALL-SERVICES.sh`
- `/workspace/infrastructure/scripts/platform/LAUNCH_ALL_SERVICES.bat`

**Strategy:** Audit which are actively used, consolidate to one master launcher

#### Install Scripts
- `install-all-dependencies.bat`
- `install-critical-deps.bat`

**Strategy:** Merge into single install script with options

### 4. **Temporary/Legacy Files** (PRIORITY: HIGH)

#### Suspicious Root Files
- `azorasvote` (no extension - investigate)
- `audit.json` (might be generated, check if needed)
- `cleanup-repo.bat` (might be redundant)
- `health-check.js` vs `quick-health-check.js` (consolidate?)

#### Deployment Scripts
- `deploy-production.ps1` vs `deploy-production.sh` (keep both for cross-platform)

### 5. **Test Files Location** (PRIORITY: LOW)
- Ensure all test files are in `/workspace/tests/` directory
- Move any stray test files

---

## 🔍 IDENTIFICATION PATTERNS

### Files Safe to Archive/Move
```bash
# Status reports older than 30 days
*-COMPLETION-REPORT.md
*-SUMMARY.md
*-STATUS.md
DIAGNOSTIC-*.md
SYSTEM-SCAN-*.md

# Temporary scripts
cleanup-*.bat
test-*.bat
```

### Files That Need Analysis Before Action
```bash
# Config files (check if imported)
*.config.js
*.config.ts
*.config.cjs

# Docker files (check if used in CI/CD)
docker-compose*.yml

# Scripts (check if called by other scripts)
*.sh
*.bat
*.ps1
```

### Files NEVER Touch
```bash
README.md
**/README.md
LICENSE
package.json
**/package.json
tsconfig.json
.gitignore
```

---

## 🛠️ CLEANUP WORKFLOW

### Phase 1: Analysis ✅
- [x] Scan repository structure
- [x] Identify duplicate files
- [x] Map dependencies
- [x] Create master context

### Phase 2: Safe Cleanup (CURRENT)
1. **Archive old reports**
   ```bash
   mkdir -p docs/reports/archive-2025-11
   mv *-COMPLETION-REPORT.md docs/reports/archive-2025-11/
   mv *-SUMMARY.md docs/reports/archive-2025-11/
   mv DIAGNOSTIC-SUMMARY.md docs/reports/archive-2025-11/
   ```

2. **Remove duplicate configs** (after verification)
   - Check imports: `grep -r "hardhat.config.cjs" .`
   - If unused, remove duplicate config files

3. **Consolidate scripts**
   - Test which launch scripts work
   - Merge functionality into master scripts
   - Update documentation

### Phase 3: Optimization
1. Update import paths if files moved
2. Update documentation references
3. Test that core functionality still works
4. Update CI/CD pipelines if needed

### Phase 4: Verification
1. Run linters
2. Check for broken imports
3. Test core services
4. Verify documentation links

---

## 📋 AGENT COORDINATION

### Agent Roles

#### Agent 1: Configuration Cleanup
- Identify and remove duplicate config files
- Consolidate hardhat, postcss, jest configs
- Verify no imports are broken

#### Agent 2: Documentation Organization
- Move status reports to `/docs/reports/`
- Create archive folders by date
- Update internal documentation links
- **RULE: Never touch README files**

#### Agent 3: Script Consolidation
- Audit launch scripts
- Merge redundant scripts
- Update script documentation
- Test script functionality

#### Agent 4: Dependency Validator
- Check all moved/deleted files for imports
- Verify no broken dependencies
- Run tests
- Report any issues

### Communication Protocol
- Document all changes in `CLEANUP-LOG.md`
- Report completed tasks
- Flag any uncertainties for user review
- Coordinate file moves to avoid conflicts

---

## 📝 CLEANUP LOG TEMPLATE

```markdown
## [Date] - [Agent Name/ID]

### Actions Taken
- Moved X files from Y to Z
- Deleted X duplicate files
- Consolidated X scripts

### Files Modified
- List of file paths

### Verification Steps
- Tests run: [pass/fail]
- Imports checked: [pass/fail]
- Documentation updated: [yes/no]

### Issues Found
- Any broken imports
- Any failing tests
- Any concerns

### Next Steps
- What should be done next
```

---

## 🎨 CLEANUP PRIORITIES

### High Priority (Do First)
1. ✅ Create master context (this file)
2. 🔄 Move old status reports to archive
3. 🔄 Remove verified duplicate config files
4. 🔄 Consolidate redundant launch scripts

### Medium Priority
1. Organize documentation structure
2. Clean up temporary test scripts
3. Audit docker-compose files
4. Standardize naming conventions

### Low Priority
1. Optimize file organization within directories
2. Add additional documentation
3. Create helper scripts for maintenance

---

## 🔒 SAFETY CHECKS

Before deleting ANY file, verify:

```bash
# 1. Check if file is imported anywhere
rg -l "filename" .

# 2. Check if file is referenced in docs
rg -l "filename" docs/

# 3. Check if file is used in scripts
rg -l "filename" infrastructure/scripts/

# 4. Check if file is in package.json
rg "filename" package.json

# 5. Check if README
[[ "$filename" == *"README"* ]] && echo "STOP! Don't delete README"
```

---

## 📊 SUCCESS METRICS

### Goals
- Reduce root directory files from 30+ to ~15
- Remove 50+ duplicate config files
- Consolidate 20+ redundant scripts
- Organize 20+ status reports into archives
- Maintain 100% test pass rate
- Zero broken imports/dependencies

### Current Progress
- [x] Analysis complete
- [ ] High priority cleanup
- [ ] Medium priority cleanup
- [ ] Low priority cleanup
- [ ] Final verification

---

## 🚀 QUICK REFERENCE

### Safe to Archive (Generally)
- Old status reports (*.REPORT.md, *-SUMMARY.md)
- Diagnostic files (DIAGNOSTIC-*.md)
- Completion reports (*-COMPLETION-*.md)

### Requires Analysis
- Config files (check imports)
- Docker files (check CI/CD)
- Scripts (check execution paths)
- JSON files (check if generated)

### NEVER DELETE
- README.md files
- LICENSE
- package.json files
- tsconfig.json files
- .gitignore
- Manifesto files
- Active documentation

---

## 📞 ESCALATION

### When to Ask User
1. If unsure about file importance
2. If tests fail after cleanup
3. If imports break
4. If CI/CD might be affected
5. If documentation seems contradictory

### When to Proceed
1. Moving old reports to archive (clear benefit)
2. Removing verified duplicate configs (after checking imports)
3. Organizing documentation (non-breaking changes)
4. Adding helpful documentation

---

## 🎯 END GOAL

A clean, professional, maintainable repository where:
- Root directory has only essential files
- No duplicate configurations
- Documentation is organized and findable
- Scripts are consolidated and clear
- All functionality remains working
- README files are pristine and untouched ✨

---

**Remember: When in doubt, ask the user. Better to ask than to break something!**

---

## 📚 Additional Resources

- See: [CLEANUP-PLAN.md](CLEANUP-PLAN.md)
- See: [REPOSITORY-STRUCTURE.md](REPOSITORY-STRUCTURE.md)
- See: [CONTRIBUTING.md](CONTRIBUTING.md)

---

*Last Updated: 2025-11-09*  
*Version: 1.0.0*  
*Agents: Background Agent 1 (Initial Creation)*
