# 🐳 Docker Compose Analysis

> **Date:** 2025-11-09  
> **Purpose:** Analysis of docker-compose files to determine consolidation strategy

---

## 📊 Root Docker Compose Files

### Current State

| File | Lines | Size | Purpose |
|------|-------|------|---------|
| `docker-compose.yml` | 417 | 11KB | **FULL STACK** - All services for development |
| `docker-compose.prod.yml` | 68 | 1.5KB | Minimal production (event-bus, chronicle, api-gateway) |
| `docker-compose.production.yml` | 71 | 1.6KB | Production with database (postgres, redis, auth, gateway) |

---

## 🔍 Analysis

### docker-compose.yml (MASTER FILE)
**Purpose:** Complete development environment  
**Services:** 15+ services including:
- API Gateway (port 4000)
- Auth Service (3001)
- Mint Service (3002)
- LMS Service (3003)
- Forge Service (3004)
- Nexus Service (3005)
- Education Service (3007)
- Payments Service (3008)
- Database (PostgreSQL)
- Redis
- Prometheus monitoring
- Grafana
- Plus more...

**Features:**
- Full health checks
- Resource limits
- Replicas configuration
- Comprehensive networking
- Production-ready configuration

**Verdict:** ✅ **KEEP - This is the master file**

---

### docker-compose.prod.yml
**Purpose:** Minimal production deployment  
**Services:** 3 services only:
- Event Bus (3005)
- Chronicle (4400)
- API Gateway (3000) - NOTE: Different port than main file!

**Issues:**
- ⚠️ Overlapping service names with main file
- ⚠️ Different port configurations (confusion risk)
- ⚠️ No database (incomplete for actual production)
- ⚠️ Rarely referenced in codebase (only 2 mentions in docs)

**Verdict:** 🔴 **CANDIDATE FOR REMOVAL** - Incomplete and confusing

---

### docker-compose.production.yml
**Purpose:** Production deployment with database  
**Services:** 5 services:
- PostgreSQL (5432)
- Redis (6379)
- API Gateway (4000)
- Auth Service (3001)
- Health Monitor (9090)

**Features:**
- Database initialization
- Health checks
- Proper dependencies
- Auto-migration (prisma db push)

**Issues:**
- ⚠️ Overlaps with main docker-compose.yml
- ⚠️ Having both .prod.yml and .production.yml is confusing
- ⚠️ Not referenced in scripts (uses default docker-compose.yml)

**Verdict:** 🟡 **EVALUATE** - Could be useful but naming is confusing

---

## 📋 Usage Analysis

### Script References

**docker-compose.yml usage:**
```bash
# Most scripts use default (docker-compose.yml)
docker-compose up -d database redis
docker-compose up -d
docker-compose build
```

**docker-compose.prod.yml usage:**
- ❌ NO direct script references found
- Only 1 documentation mention

**docker-compose.production.yml usage:**
- ❌ NO script references found
- Only 1 documentation mention

---

## 💡 Recommendations

### Option 1: Keep Main File Only (RECOMMENDED)
```bash
# KEEP
docker-compose.yml         # Master file with all services

# REMOVE
docker-compose.prod.yml    # Not used, incomplete
docker-compose.production.yml  # Not used, redundant
```

**Rationale:**
- Main file has ALL services
- Can be used for both dev and production (via profiles or env vars)
- Other files are confusing and not actively used
- Reduces maintenance burden

---

### Option 2: Rename for Clarity
If production files are needed:
```bash
# KEEP ALL but rename
docker-compose.yml              # Development (full stack)
docker-compose.minimal.yml      # Rename from .prod.yml
docker-compose.prod-simple.yml  # Rename from .production.yml
```

**Rationale:**
- Clearer naming convention
- No confusion between .prod and .production
- Explicit purpose in filename

---

### Option 3: Use Docker Compose Profiles (BEST PRACTICE)
Consolidate into ONE file with profiles:
```yaml
# docker-compose.yml
services:
  database:
    profiles: ["dev", "prod"]
  
  prometheus:
    profiles: ["dev", "monitoring"]
  
  # ... etc
```

**Usage:**
```bash
docker-compose --profile dev up      # Dev environment
docker-compose --profile prod up     # Production
docker-compose --profile monitoring up  # Add monitoring
```

**Rationale:**
- Industry best practice
- Single source of truth
- Easy to maintain
- Flexible deployment

---

## 🎯 Decision: OPTION 1 (Keep Main File Only)

**Action Plan:**
1. ✅ Keep `docker-compose.yml` as master
2. 🗑️ Remove `docker-compose.prod.yml` (not used, incomplete)
3. 🗑️ Remove `docker-compose.production.yml` (not used, redundant)
4. 📝 Document in main file how to use for production
5. 📝 Add docker-compose profiles for different environments (future enhancement)

**Justification:**
- Main file has complete service definitions
- Other files are not referenced in build scripts
- Reduces confusion and maintenance
- Can enhance main file with profiles later if needed

---

## ✅ Safe to Remove

Based on analysis, these files can be safely deleted:

1. **docker-compose.prod.yml**
   - Not referenced in any scripts
   - Incomplete service set
   - Conflicts with main file

2. **docker-compose.production.yml**
   - Not referenced in any scripts
   - Redundant with main file
   - Confusing naming

**Safety Check:**
```bash
# Verified no script dependencies
grep -r "docker-compose.prod.yml" . --include="*.sh" --include="*.bat"
# Result: NO MATCHES (safe to delete)

grep -r "docker-compose.production.yml" . --include="*.sh" --include="*.bat"
# Result: NO MATCHES (safe to delete)
```

---

*Analysis complete - ready for cleanup action*
