# BuildSpaces Phase 1: Foundation Setup Guide

**Timeline**: December 10-17, 2025  
**Status**: 🚀 **IN PROGRESS**  
**Goal**: Stabilize monorepo, integrate 25 critical repos, prepare for room implementation

---

## Quick Start (5 minutes)

### 1. Verify Node & pnpm
```bash
node --version        # Should be >= 20
pnpm --version       # Should be >= 9.0.0

# Enable pnpm via corepack
corepack enable
```

### 2. Install Dependencies
```bash
cd /workspaces/azora

# Clean install (respects pnpm-workspace.yaml)
pnpm install

# Install BuildSpaces app dependencies
cd apps/azora-buildspaces
pnpm install
```

### 3. Configure Environment
```bash
cp apps/azora-buildspaces/.env.example apps/azora-buildspaces/.env.local

# Edit .env.local with placeholder values (or real API keys when ready)
nano apps/azora-buildspaces/.env.local
```

### 4. Start Dev Server
```bash
cd /workspaces/azora/apps/azora-buildspaces
pnpm run dev

# Should see: "▲ Next.js 14.2.3"
# Available at: http://localhost:3002
```

---

## Phase 1 Checklist

### ✅ Week 1: Foundation (Dec 10-17)

#### Monday: Repository Structure
- [x] Clean BuildSpaces directory (remove orphaned files)
- [x] Create service packages (elara-orchestrator, constitutional-validator, github-automation, community-engine)
- [ ] Clone/integrate 25 critical repos (submodules or selective copy)
- [ ] Document all repo integration points
- [ ] Create `BUILDSPACES_CRITICAL_REPOS.md` ✅ **DONE**

#### Tuesday: Dependencies & Configuration
- [ ] Verify all npm/pnpm dependencies resolve
- [ ] Configure root `package.json` workspaces
- [ ] Set up TypeScript paths (`tsconfig.json`)
- [ ] Create `.env.example` ✅ **DONE**
- [ ] Wire up build configuration

#### Wednesday: Monorepo Coordination
- [ ] Create root `tsconfig.json` with paths to all services
- [ ] Set up Turborepo build pipeline
- [ ] Configure GitHub Actions workflow (basic CI)
- [ ] Test full monorepo build (`pnpm build`)

#### Thursday: API Integration Stubs
- [ ] Add API client stubs for OpenAI, Claude, Stripe
- [ ] Wire GitHub token configuration
- [ ] Set up environment variable validation
- [ ] Create `dotenv` loader for all services

#### Friday: Validation & Cleanup
- [ ] Run full test suite
- [ ] Verify dev server starts without errors
- [ ] Document all setup steps
- [ ] Create PR with Phase 1 complete
- [ ] Tag `phase/1-complete` commit

---

## Detailed Setup Instructions

### Step 1: Install Core Dependencies

From monorepo root:
```bash
cd /workspaces/azora

# Install everything
pnpm install

# Check workspace setup
pnpm ls --depth=0   # Show top-level packages
```

Expected output:
```
buildspaces 1.0.0
├── apps/azora-buildspaces
├── services/elara-orchestrator
├── services/constitutional-validator
├── services/github-automation
├── services/community-engine
└── ... (other services/packages)
```

### Step 2: Wire TypeScript & Build

Update root `tsconfig.json`:
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@azora/shared-api/*": ["packages/shared-api/*"],
      "@azora/shared-ai/*": ["packages/shared-ai/*"],
      "@azora/shared-auth/*": ["packages/shared-auth/*"],
      "@azora/shared-database/*": ["packages/shared-database/*"],
      "@elara/*": ["services/elara-orchestrator/*"],
      "@constitutional/*": ["services/constitutional-validator/*"],
      "@community/*": ["services/community-engine/*"],
      "@github-automation/*": ["services/github-automation/*"]
    }
  }
}
```

### Step 3: Create Environment Variables

```bash
# In BuildSpaces app
cd apps/azora-buildspaces
cp .env.example .env.local

# Add minimal placeholders (real keys come later)
cat >> .env.local << 'EOF'

# Placeholder API Keys (add real keys before launch)
OPENAI_API_KEY=sk-placeholder
ANTHROPIC_API_KEY=claude-placeholder
GITHUB_TOKEN=ghp-placeholder
STRIPE_SECRET_KEY=sk-placeholder

# Database (local development)
DATABASE_URL=postgresql://user:password@localhost:5432/azora_test
REDIS_URL=redis://localhost:6379

# Auth
NEXTAUTH_SECRET=dev-secret-change-in-production
NEXTAUTH_URL=http://localhost:3002

# Feature Flags
ENABLE_CODE_CHAMBER=true
ENABLE_SPEC_CHAMBER=true
ENABLE_DESIGN_STUDIO=true
ENABLE_AI_STUDIO=true
ENABLE_COMMAND_DESK=true
ENABLE_MAKER_LAB=true
ENABLE_COLLABORATION_POD=true
ENABLE_COLLECTIBLE_SHOWCASE=true

# Debug
NEXT_PUBLIC_DEBUG=true
EOF
```

### Step 4: Verify Build

```bash
# From monorepo root
pnpm run build

# Should compile without errors
# If errors, check:
# 1. Node version (>= 20)
# 2. pnpm version (>= 9.0.0)
# 3. All dependencies installed (pnpm install)
```

### Step 5: Start Dev Server

```bash
cd apps/azora-buildspaces
pnpm run dev

# Opens dev server on http://localhost:3002
# Press Ctrl+C to stop
```

---

## Integrating the 25 Critical Repos

### Strategy: Selective Copy (Fastest)

For each of the 25 repos, copy only **essential source files** (no node_modules):

```bash
# Create reference directory
mkdir -p /workspaces/azora/tools/external-references

# Clone each repo (shallow, to save bandwidth)
for repo in codespaces-nextjs spark-template spec-kit annotation-toolkit issue-parser \
            ... (25 total)
do
  git clone --depth=1 https://github.com/github/$repo tools/external-references/$repo
done
```

Then **extract critical files** from each:
- `spec-kit` → Copy `/src` to `services/elara-orchestrator/specs/`
- `annotation-toolkit` → Copy `/src` to `apps/azora-buildspaces/lib/design/`
- `copilot-cli` → Reference `/src` for CLI patterns
- etc.

**This avoids bloat** while preserving access to patterns & code.

---

## Troubleshooting

### ❌ "pnpm: command not found"
```bash
# Enable pnpm via corepack
corepack enable pnpm

# Or install globally
npm install -g pnpm@9.0.0
```

### ❌ "Tailwind CSS not found"
```bash
# Make sure installed in BuildSpaces app
cd apps/azora-buildspaces
pnpm install

# Rebuild node_modules if needed
pnpm install --force
```

### ❌ "Cannot find module '@tailwindcss/postcss'"
```bash
# Only needed for Tailwind v4, we're using v3
# Remove from devDependencies if present
pnpm remove @tailwindcss/postcss

# Keep these:
pnpm ls tailwindcss autoprefixer
```

### ❌ "Next dev server fails to start"
```bash
# 1. Kill any existing process
pkill -f "next dev"

# 2. Clear cache
rm -rf .next

# 3. Restart
pnpm run dev
```

---

## Success Criteria for Phase 1

- [x] Repository cleaned (no orphaned files)
- [x] Service packages created (elara, constitutional, github, community)
- [ ] All 25 critical repos documented
- [ ] pnpm monorepo working (`pnpm install` succeeds)
- [ ] TypeScript compilation passes
- [ ] Dev server starts on http://localhost:3002
- [ ] Environment variables documented
- [ ] No build errors or warnings
- [ ] Git commit tagged as `phase/1-complete`

---

## Next: Phase 2 Preparation

While waiting for real API keys, we can:

1. **Implement room skeleton components** (Code Chamber → Spec Chamber → Design Studio)
2. **Wire mock integrations** for testing without real APIs
3. **Build CLI command parsing** (slash commands for Command Desk)
4. **Design database schema** (Prisma migrations)

Phase 2 begins: **December 17, 2025**

---

## Getting Help

If stuck:
- Check `/workspaces/azora/BUILDSPACES_RECOVERY_PLAN.md` for full context
- Review `/workspaces/azora/BUILDSPACES_CRITICAL_REPOS.md` for repo details
- Check `.github/copilot-instructions.md` for monorepo conventions

---

**Status**: 🟡 **Phase 1 In Progress**  
**Last Updated**: December 10, 2025  
**Next Milestone**: Phase 1 Complete by December 17  
**Architect**: GitHub Copilot Agent
