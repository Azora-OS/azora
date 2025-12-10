# BuildSpaces Constitutional Recovery & Reconstruction Plan

**Status**: 🔧 **RECOVERY MODE** — Rebuilding from Blueprint  
**Architect**: GitHub Copilot Agent  
**Date**: December 10, 2025  
**Vision**: 8 Interconnected Rooms + Elara AI + Constitutional Governance + Token Economy

---

## Executive Summary

The original BuildSpaces vision encompasses **8 distinct rooms**, **5 AI agents**, **25 critical GitHub integrations**, and a **Constitutional AI governance layer**. The current repository contains only a minimal Next.js skeleton. This plan charts recovery by:

1. **Immediate** (Today): Stabilize baseline, assess existing codebase
2. **Phase 1** (Week 1): Repository foundation + infrastructure setup
3. **Phase 2** (Week 2): Core room implementation (Code Chamber → Spec Chamber → Design Studio)
4. **Phase 3** (Week 3): Intelligence layer (Elara + Constitutional AI + Agents)
5. **Phase 4** (Week 4): Community & deployment (Token economy + CI/CD + launch)

---

## Current State Assessment

### ✅ What's Working
- Next.js 14 app bootstrapped at `apps/azora-buildspaces`
- Basic dependencies installed (Monaco, xterm, Yjs, Tailwind)
- Package.json structure in place
- Dev server runs on `http://localhost:3002`

### ❌ What's Missing
- **No room implementations** (Code Chamber, Spec Chamber, Design Studio, AI Studio, Command Desk, Maker Lab, Collaboration Pod, Collectible Showcase)
- **No Elara AI integration** (agent orchestration, routing, session management)
- **No Constitutional AI gates** (pre/post-execution validation)
- **No agent implementations** (Sankofa, Themba, Jabari, Nia, Imani)
- **No token economy** (AZR minting, earning mechanics, Stripe integration)
- **No GitHub automation** (issue-parser, feedback loop, Probot)
- **No Figma/Design integration** (@github/annotation-toolkit)
- **No Spec-Kit integration** (spec validation, test generation)
- **No deployment pipeline** (GitHub Actions, Constitutional gates, Kubernetes)

### 🔴 Critical Blockers
1. **Missing GitHub repos** — 25 critical repos not cloned/integrated
2. **API keys not configured** — OpenAI, Claude, GitHub, Stripe missing
3. **Database not set up** — Prisma schema not configured for BuildSpaces
4. **No authentication** — NextAuth not integrated
5. **No agent server** — LangChain + agent execution runtime missing

---

## Phase 1: Immediate Recovery (Today)

### Goal
Get BuildSpaces to a **stable, testable state** with:
- ✅ Clean repository structure
- ✅ All critical GitHub repos identified (URLs + cloning strategy)
- ✅ Environment setup guide
- ✅ Monorepo root properly configured
- ✅ Dev dependencies verified

### Actions

#### 1.1 Clean Up Current Buildspaces App
```bash
cd /workspaces/azora/apps/azora-buildspaces

# Remove broken/orphaned code
rm -rf .next build_errors.txt build_output.txt

# Verify only essential files remain
ls -la
```

**Expected result**: Clean `app/`, `components/`, `public/`, `lib/`, `scripts/` directories

#### 1.2 Document All 25 Critical Repos

Create a `CRITICAL_REPOS.md` file listing:
- Repository owner/name
- License (MIT, Apache 2.0, etc.)
- Version to target
- Purpose in BuildSpaces
- Clone URL
- Integration point (which room/layer)

**Structure**:
```markdown
# Critical Repositories for BuildSpaces

## FOUNDATION (5)
1. github/codespaces-nextjs
2. github/spark-template
... (25 total)

## FRONTEND (5)
... 

etc.
```

#### 1.3 Verify Monorepo Root Setup

```bash
cd /workspaces/azora

# Check pnpm workspace setup
cat pnpm-workspace.yaml

# Verify turbo.json
cat turbo.json

# Check Node version
node --version  # Should be >= 20
```

#### 1.4 Set Up Environment Template

Create `apps/azora-buildspaces/.env.example`:
```env
# API Keys
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=claude-...
GITHUB_TOKEN=ghp_...
STRIPE_SECRET_KEY=sk_live_...
FIGMA_API_TOKEN=...

# Database
DATABASE_URL=postgresql://...
REDIS_URL=redis://localhost:6379

# Authentication
NEXTAUTH_SECRET=...
NEXTAUTH_URL=http://localhost:3002

# Feature Flags
SANDBOX_ENABLED=true
USE_REDIS=true
LOCAL_LLM_MODEL=llama2
EXTERNAL_LLM_PROVIDER=openai

# BuildSpaces Rooms
ENABLE_CODE_CHAMBER=true
ENABLE_SPEC_CHAMBER=true
ENABLE_DESIGN_STUDIO=true
ENABLE_AI_STUDIO=true
ENABLE_COMMAND_DESK=true
ENABLE_MAKER_LAB=true
ENABLE_COLLABORATION_POD=true
ENABLE_COLLECTIBLE_SHOWCASE=true
```

#### 1.5 Create Recovery Documentation

Generate `docs/BUILDSPACES-RECOVERY-ROADMAP.md` with:
- Phase breakdown
- Dependency chain (what must be done first)
- Git branching strategy
- Team coordination guide
- Risk mitigation

---

## Phase 2: Repository Foundation (Week 1)

### Goal: Clone & Integrate 25 Critical GitHub Repos

### 2.1 Foundation Repos (5)
```bash
cd /workspaces/azora

# Clone and integrate:
# 1. github/codespaces-nextjs → reference environment setup
# 2. github/spark-template → app scaffolding patterns
# 3. github/spec-kit → spec validation engine
# 4. github/annotation-toolkit → design system components
# 5. github/issue-parser → feedback automation

# Strategy: Use git submodules or copy essential components
```

### 2.2 Frontend Repos (5)
```bash
# Already have:
# ✅ microsoft/monaco-editor (npm)
# ✅ xtermjs/xterm.js (npm)
# ✅ yjs/yjs (npm)
# ✅ vercel/next.js (npm)
# ✅ tailwindlabs/tailwindcss (npm)

# Verify versions match target
npm ls monaco-editor xterm yjs next tailwindcss
```

### 2.3 Backend Repos (5)
```bash
# npm-based integrations:
# 1. prisma/prisma → Configure schema for BuildSpaces
# 2. vercel/vercel → API client setup
# 3. hashicorp/terraform → IaC templates
# 4. docker/docker-ce → Container setup
# 5. kubernetes/kubernetes → K8s YAML templates

# Each gets a separate service package
mkdir -p services/{terraform,docker,kubernetes}
```

### 2.4 AI & Agents Repos (5)
```bash
# Wire LLM integrations:
# 1. github/copilot-cli → CLI patterns for agents
# 2. openai/openai-node → GPT-4 integration
# 3. langchain/langchainjs → Agent orchestration
# 4. vercel-labs/ai → Streaming UI patterns
# 5. anthropic/sdk-python → Claude fallback

# Create: services/elara-orchestrator
```

### 2.5 Community Repos (5)
```bash
# Community & economy:
# 1. github/octocanvas → Card generation
# 2. stripe/stripe-node → Payment processing
# 3. probot/probot → GitHub automation
# 4. octokit/octokit.js → GitHub API
# 5. prometheus/prometheus → Monitoring

# Create: services/community-engine
```

---

## Phase 3: Core Room Implementation (Week 2)

### 3.1 Code Chamber
- **Files**: `apps/azora-buildspaces/components/rooms/CodeChamber/`
- **Dependencies**: Monaco, xterm, Yjs, isomorphic-git
- **Features**:
  - Multi-tab editor
  - Terminal panel
  - Real-time collaboration (Yjs awareness)
  - Git integration (commit, push, branch)
  - Live preview (Vite HMR)
  - Syntax highlighting + theme

### 3.2 Spec Chamber
- **Files**: `apps/azora-buildspaces/components/rooms/SpecChamber/`
- **Dependencies**: spec-kit, AJV, YAML parser, Prettier
- **Features**:
  - YAML/JSON spec editor
  - Real-time validation
  - Template library
  - Test generation UI
  - Requirement checklist

### 3.3 Design Studio
- **Files**: `apps/azora-buildspaces/components/rooms/DesignStudio/`
- **Dependencies**: Figma API, annotation-toolkit, Storybook
- **Features**:
  - Figma file import
  - Component extraction
  - JSX generation preview
  - Accessibility checker
  - Design-to-code pipeline

---

## Phase 4: Intelligence Layer (Week 3)

### 4.1 Elara Orchestrator
- **Location**: `services/elara-orchestrator/`
- **Core**: LangChain agent coordinator
- **Features**:
  - Multi-model routing (OpenAI → Claude fallback)
  - Token tracking & cost optimization
  - Context window management
  - Session persistence (Redis)
  - Streaming responses

### 4.2 Constitutional AI Validator
- **Location**: `packages/shared-ai/constitutional-validator.ts`
- **Core**: Rule engine + gate enforcement
- **Features**:
  - Pre-execution validation
  - Post-execution audit
  - Violation detection
  - Approval workflows

### 4.3 Agent Implementations
- **Sankofa** (Code Architect): React + Node.js generation
- **Themba** (Systems Engineer): Infrastructure design
- **Jabari** (Security Chief): Vulnerability scanning
- **Nia** (Data Scientist): SQL + analytics
- **Imani** (Creative Director): UI/UX suggestions

---

## Phase 5: Community & Token Economy (Week 4)

### 5.1 OctoCanvas Integration
- Card generation (canvas + sharp)
- Rarity tier calculation
- Power scoring logic
- NFT minting (optional)

### 5.2 AZR Token Economy
- Minting logic (Prisma)
- Earning mechanisms
- Leaderboard
- Stripe integration

### 5.3 GitHub Automation
- Issue-parser feedback loop
- Automated PR suggestions
- Community voting
- Reward distribution

---

## Success Criteria

### Phase 1 (Today)
- [x] Environment stabilized
- [ ] Critical repos documented (25 total)
- [ ] Monorepo verified functional
- [ ] `.env.example` created
- [ ] Recovery roadmap documented

### Phase 2 (Week 1)
- [ ] All 25 repos cloned/integrated
- [ ] npm/pnpm dependencies resolved
- [ ] Build passes without errors
- [ ] Services packages created
- [ ] API clients initialized

### Phase 3 (Week 2)
- [ ] 8 rooms have skeleton components
- [ ] Room routing works
- [ ] Inter-room APIs defined
- [ ] Dev server serves all rooms
- [ ] Accessibility checks pass

### Phase 4 (Week 3)
- [ ] Elara orchestrator running
- [ ] All 5 agents wired
- [ ] Constitutional validator gates working
- [ ] Slash commands parsed & routed
- [ ] Session persistence functional

### Phase 5 (Week 4)
- [ ] Token economy live
- [ ] Leaderboard populating
- [ ] GitHub automation running
- [ ] CI/CD pipeline deployed
- [ ] 🚀 Launch ready

---

## Git Strategy

### Branching
```
main (production)
├── staging (pre-release testing)
├── recovery/restore-buildspaces-20251204 (this branch)
│   ├── phase/1-foundation
│   ├── phase/2-rooms
│   ├── phase/3-intelligence
│   └── phase/4-deployment
```

### Commit Convention
```
[PHASE-X] [ROOM/SERVICE] description

Examples:
[PHASE-1] [FOUNDATION] Add 25 critical repos documentation
[PHASE-2] [CODE-CHAMBER] Implement Monaco editor integration
[PHASE-3] [ELARA] Wire agent orchestration
[PHASE-4] [TOKEN-ECONOMY] Implement AZR minting
```

---

## Questions for You (Architect)

Before I proceed to Phase 2, please clarify:

1. **GitHub API Access**: Do you have personal GitHub tokens for cloning private repos?
2. **API Keys**: Should I create `.env.example` only, or do you want secure storage configured?
3. **Database**: Should BuildSpaces use the monorepo's unified `prisma/` schema, or a separate local schema?
4. **Timeline**: Can we do 1-week sprints, or do you need a different pace?
5. **Token Economy**: Is AZR minting on Ethereum, Solana, or Polygon?
6. **Team**: Are you solo, or are there other engineers we coordinate with?

---

## Resources & References

- **Constitution**: `/workspaces/azora/CONSTITUTION.md`
- **AI Dev Laws**: `/workspaces/azora/AI_DEV_LAWS.md`
- **Citadel Dev**: `/workspaces/azora/citadel-dev/`
- **Copilot Instructions**: `.github/copilot-instructions.md`
- **Recovery Notebook**: (being generated now)

---

**Next Step**: Proceed to Phase 1 recovery actions, or discuss architectural clarifications above.

🔧 **Ready to rebuild BuildSpaces to full Constitutional standards.**

---

**Signed**: GitHub Copilot Architect  
**Commitment**: "I can because we can" — Ubuntu Philosophy
