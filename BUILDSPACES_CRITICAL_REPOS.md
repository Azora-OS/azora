# Critical Repositories for BuildSpaces Constitutional Architecture

**Total**: 25 repositories across 5 categories  
**Purpose**: Strategic integration map for full BuildSpaces implementation  
**Last Updated**: December 10, 2025  

---

## FOUNDATION TIER (5 repos) — Core Infrastructure

### 1. **github/codespaces-nextjs**
- **URL**: https://github.com/github/codespaces-nextjs
- **License**: MIT
- **Version Target**: Latest
- **Purpose**: Development environment template + setup patterns
- **Integration Point**: Dev environment config, Docker setup
- **Critical For**: Local dev + CodeSpaces compatibility
- **Key Files to Reference**:
  - `.devcontainer/` configuration
  - Environment setup scripts
  - Node.js version pinning

### 2. **github/spark-template**
- **URL**: https://github.com/github/spark-template
- **License**: MIT
- **Version Target**: Latest
- **Purpose**: React + TypeScript + Vite app scaffolding
- **Integration Point**: BuildSpaces room component templates
- **Critical For**: Room component boilerplate, TypeScript patterns
- **Key Learning**:
  - Component architecture patterns
  - State management setup
  - Testing infrastructure

### 3. **github/spec-kit**
- **URL**: https://github.com/github/spec-kit
- **License**: Apache 2.0
- **Version Target**: v1.0+
- **Purpose**: SPEC-driven development framework (validation + generation)
- **Integration Point**: Spec Chamber room
- **Critical For**: Spec validation, test generation, requirements checking
- **Key Features**:
  - SPEC.yaml parsing & validation
  - Test generation from specs
  - Requirement completeness checking
  - Spec → Code generation

### 4. **github/annotation-toolkit**
- **URL**: https://github.com/github/annotation-toolkit
- **License**: MIT
- **Version Target**: Latest
- **Purpose**: Design system annotations for Figma → React
- **Integration Point**: Design Studio room
- **Critical For**: Design-to-code pipeline, accessibility annotations
- **Key Components**:
  - Accessibility validators
  - Spacing/sizing annotations
  - Component extraction logic

### 5. **github/issue-parser**
- **URL**: https://github.com/github/issue-parser
- **License**: MIT
- **Version Target**: Latest
- **Purpose**: Parse GitHub issues into structured JSON
- **Integration Point**: Feedback & Automation Layer
- **Critical For**: Automated bug/feature routing, community feedback loop
- **Key Capability**: Issue metadata extraction → agent routing

---

## FRONTEND TIER (5 repos) — UI/Editor/Collaboration

### 6. **microsoft/monaco-editor**
- **URL**: https://github.com/microsoft/monaco-editor
- **Package**: `@monaco-editor/react`, `monaco-editor`
- **Version**: ^0.45.0 (currently installed)
- **License**: MIT
- **Integration Point**: Code Chamber (editor)
- **Status**: ✅ **ALREADY INTEGRATED**
- **Critical Features**:
  - Multi-language syntax highlighting
  - IntelliSense (code completion)
  - Keyboard shortcuts customization
  - Themes (Dark/Light/High Contrast)
- **Next Steps**: Bind with Yjs for real-time collab, add terminal integration

### 7. **xtermjs/xterm.js**
- **URL**: https://github.com/xtermjs/xterm.js
- **Package**: `xterm`, `xterm-addon-fit`, `xterm-addon-web-links`
- **Version**: ^5.3.0 (currently installed)
- **License**: MIT
- **Integration Point**: Code Chamber (terminal panel)
- **Status**: ✅ **ALREADY INTEGRATED**
- **Critical Features**:
  - Full terminal emulation
  - ANSI color support
  - Mouse event handling
  - Add-on system (fit, web-links, etc.)
- **Next Steps**: Wire WebSocket for remote terminal, add session recording

### 8. **yjs/yjs** + **y-monaco/y-monaco**
- **URL**: https://github.com/yjs/yjs
- **Package**: `yjs`, `y-monaco`, `y-websocket`, `y-indexeddb`
- **Version**: 13.6.27 (currently installed)
- **License**: MIT
- **Integration Point**: Code Chamber & Collaboration Pod (real-time sync)
- **Status**: ✅ **PARTIALLY INTEGRATED** (dependencies installed, not wired)
- **Critical Features**:
  - Real-time collaborative editing
  - Conflict-free replicated data type (CRDT)
  - Undo/redo (networked)
  - Awareness (cursor tracking)
- **Next Steps**: Wire y-websocket provider, implement awareness for cursor tracking, add comment threading

### 9. **vercel/next.js**
- **URL**: https://github.com/vercel/next.js
- **Package**: `next`
- **Version**: 14.2.3 (currently installed)
- **License**: MIT
- **Integration Point**: BuildSpaces app framework (entire application)
- **Status**: ✅ **ALREADY INTEGRATED**
- **Critical Features**:
  - App Router (file-based routing)
  - Server/Client components
  - API routes
  - Middleware
- **Upgrade Path**: Consider upgrading to Next.js 15 (React 19 compatible) for long-term stability

### 10. **tailwindlabs/tailwindcss**
- **URL**: https://github.com/tailwindlabs/tailwindcss
- **Package**: `tailwindcss`, `@tailwindcss/postcss` (v4 only)
- **Version**: ^3.4.1 (current), ^4 (target for v4 migration)
- **License**: MIT
- **Integration Point**: Styling system (all rooms)
- **Status**: ✅ **INTEGRATED** (v3; v4 migration pending)
- **Critical Features**:
  - Utility-first CSS
  - Theme customization (dark mode, colors, spacing)
  - Plugin system
  - Design tokens integration
- **Note**: Building with v3 currently; v4 migration requires PostCSS plugin update (@tailwindcss/postcss)

---

## BACKEND TIER (5 repos) — Database/Deployment/Infrastructure

### 11. **prisma/prisma**
- **URL**: https://github.com/prisma/prisma
- **Package**: `prisma`, `@prisma/client`
- **Version**: ^5.0.0 (currently installed)
- **License**: Apache 2.0
- **Integration Point**: Data persistence (all rooms that read/write data)
- **Status**: ✅ **INSTALLED**, ❌ **NOT CONFIGURED FOR BUILDSPACES**
- **Critical Setup**:
  - Unified schema at `/workspaces/azora/prisma/schema.prisma`
  - BuildSpaces-specific models needed:
    - User (authentication)
    - Project (code chamber projects)
    - Spec (spec chamber documents)
    - Design (design studio files)
    - Agent (agent execution logs)
    - Token (AZR ledger)
    - Achievement (collectible showcase)
  - Migrations: `npm run db:migrate`
- **Next Steps**: Add BuildSpaces schema extensions, run Prisma generate

### 12. **vercel/vercel**
- **URL**: https://github.com/vercel/vercel
- **Package**: `@vercel/node`, `@vercel/analytics`
- **Version**: Latest
- **License**: Apache 2.0 (CLI), Proprietary (platform)
- **Integration Point**: Frontend deployment (CI/CD)
- **Status**: ❌ **NOT INTEGRATED**
- **Critical Features**:
  - One-click Vercel deployment
  - Environment variables management
  - Automatic Git integration
  - Preview deployments
- **Setup**: Install CLI, configure GitHub integration, add deployment automation

### 13. **hashicorp/terraform**
- **URL**: https://github.com/hashicorp/terraform
- **Package**: `terraform` (CLI tool, not npm)
- **Version**: >= 1.0
- **License**: MPL 2.0
- **Integration Point**: Infrastructure-as-Code (Kubernetes, PostgreSQL, Redis, DNS)
- **Status**: ❌ **NOT INTEGRATED**
- **Critical Modules**:
  - Kubernetes cluster definition
  - PostgreSQL RDS provisioning
  - Redis ElastiCache
  - VPC + networking
  - SSL/TLS certificates
- **Location**: `infrastructure/terraform/` (to create)

### 14. **docker/docker-ce** (Docker Community Edition)
- **URL**: https://github.com/moby/moby
- **Tool**: `docker` CLI + Docker Desktop
- **Version**: >= 20.10
- **License**: Apache 2.0 / Community Edition
- **Integration Point**: Container orchestration (local dev + production)
- **Status**: ✅ **CLI AVAILABLE** (in devcontainer), ❌ **DOCKERFILES NOT CREATED**
- **Critical Dockerfiles**:
  - BuildSpaces frontend (Next.js)
  - Elara orchestrator service
  - Agent execution service
  - Knowledge Ocean service
- **Location**: `apps/azora-buildspaces/Dockerfile`, `services/*/Dockerfile`

### 15. **kubernetes/kubernetes**
- **URL**: https://github.com/kubernetes/kubernetes
- **Tool**: `kubectl` CLI
- **Version**: >= 1.24
- **License**: Apache 2.0
- **Integration Point**: Production orchestration (service mesh, auto-scaling, health checks)
- **Status**: ❌ **NOT INTEGRATED**
- **Critical K8s Resources**:
  - Deployments (services)
  - Services (networking)
  - ConfigMaps (configuration)
  - Secrets (API keys, credentials)
  - Ingress (load balancing)
  - PersistentVolumes (data)
- **Location**: `infrastructure/kubernetes/` (to create)

---

## AI & AGENTS TIER (5 repos) — Intelligence & Orchestration

### 16. **github/copilot-cli**
- **URL**: https://github.com/github/copilot-cli
- **Package**: `@github/copilot-cli`
- **Version**: Latest
- **License**: MIT
- **Integration Point**: CLI command patterns (Command Desk slash commands)
- **Status**: ❌ **NOT INTEGRATED**
- **Critical Learning**:
  - CLI architecture patterns
  - Streaming response UI
  - Error handling patterns
  - Agent interaction patterns
- **Use Case**: Reference for building `/generate`, `/test`, `/deploy` commands

### 17. **openai/openai-node**
- **URL**: https://github.com/openai/openai-node
- **Package**: `openai`
- **Version**: ^4.14.0
- **License**: Apache 2.0
- **Integration Point**: LLM routing (primary model)
- **Status**: ❌ **NOT INTEGRATED**
- **Critical Models**:
  - GPT-4 (code generation, reasoning)
  - GPT-4 Turbo (cost optimization)
  - text-embedding-3 (vector search)
- **Setup**:
  - API key in `.env.local`
  - Cost tracking middleware
  - Rate limiting (3,500 RPM)
  - Token counting

### 18. **langchain/langchainjs** + **langchain/langchain-core**
- **URL**: https://github.com/langchain-ai/langchainjs
- **Package**: `langchain`, `@langchain/core`, `@langchain/openai`, `@langchain/anthropic`
- **Version**: Latest (0.1.x+)
- **License**: MIT
- **Integration Point**: Agent orchestration framework
- **Status**: ❌ **NOT INTEGRATED**
- **Critical Components**:
  - Agent executor (multi-agent coordination)
  - Tool binding (agents ↔ BuildSpaces actions)
  - Memory management (session context)
  - Output parsing (structured responses)
- **Setup**: Create `services/elara-orchestrator/agents/`

### 19. **vercel-labs/ai**
- **URL**: https://github.com/vercel-labs/ai
- **Package**: `ai`
- **Version**: Latest
- **License**: Apache 2.0
- **Integration Point**: Streaming UI + React hooks
- **Status**: ❌ **NOT INTEGRATED**
- **Critical Features**:
  - `useChat()` hook for streaming responses
  - `useCompletion()` for code generation
  - Server-sent events (SSE) streaming
  - React integration patterns
- **Use Case**: Stream agent responses in real-time to UI

### 20. **anthropic/sdk-python** (or anthropic-js)
- **URL**: https://github.com/anthropic-ai/anthropic-sdk-python
- **Package**: `@anthropic-ai/sdk` (JavaScript) or `anthropic` (Python)
- **Version**: Latest
- **License**: MIT
- **Integration Point**: LLM fallback routing
- **Status**: ❌ **NOT INTEGRATED**
- **Critical Models**:
  - Claude 3 Opus (reasoning-heavy tasks)
  - Claude 3 Sonnet (balanced)
  - Claude 3 Haiku (fast responses)
- **Setup**: Fallback logic if OpenAI fails/rate-limited

---

## COMMUNITY TIER (5 repos) — Gamification/Payments/Monitoring

### 21. **github/octocanvas**
- **URL**: https://github.com/github/octocanvas
- **License**: MIT
- **Integration Point**: Collectible card generation (achievements)
- **Status**: ❌ **NOT INTEGRATED**
- **Critical Features**:
  - SVG/canvas card generation
  - Rarity tier calculation
  - Power scoring
  - Downloadable PNG/PDF
  - Social sharing (Twitter, LinkedIn)
- **Models Needed**:
  - Achievement → Card mapping
  - User power scoring algorithm
  - Leaderboard ranking

### 22. **stripe/stripe-node**
- **URL**: https://github.com/stripe/stripe-node
- **Package**: `stripe`
- **Version**: Latest
- **License**: MIT
- **Integration Point**: Payment processing (AZR cashout, premium features)
- **Status**: ❌ **NOT INTEGRATED**
- **Critical Flows**:
  - Wallet balance → Stripe payment setup
  - KYC/KYB verification
  - Withdrawal processing
  - Tax reporting (1099 forms)
- **Setup**:
  - Stripe account (live + test keys)
  - Connect integration (marketplace payouts)
  - Webhook handling

### 23. **probot/probot**
- **URL**: https://github.com/probot/probot
- **Package**: `probot`
- **Version**: Latest
- **License**: ISC
- **Integration Point**: GitHub app automation (feedback loop)
- **Status**: ❌ **NOT INTEGRATED**
- **Critical Automation**:
  - Parse issue forms (@github/issue-parser)
  - Route to agents (Sankofa, Themba, etc.)
  - Auto-generate PRs
  - Update issue status
  - Award tokens
- **Setup**: Create GitHub app, install on repo

### 24. **octokit/octokit.js**
- **URL**: https://github.com/octokit/octokit.js
- **Package**: `@octokit/rest`, `@octokit/graphql`
- **Version**: Latest
- **License**: MIT
- **Integration Point**: GitHub API interactions (deep integration)
- **Status**: ✅ **AVAILABLE** (as dependency), ❌ **NOT USED**
- **Critical Uses**:
  - Create PRs (agent output → PR)
  - Read repo structure
  - List issues/PRs
  - Post comments (agent feedback)
  - Manage labels + milestones

### 25. **prometheus/prometheus**
- **URL**: https://github.com/prometheus/prometheus
- **Package**: `prom-client` (Node.js library)
- **Version**: Latest
- **License**: Apache 2.0
- **Integration Point**: Metrics collection (observability)
- **Status**: ❌ **NOT INTEGRATED**
- **Critical Metrics**:
  - Agent execution time
  - Token usage (cost tracking)
  - Error rates
  - User activity (DAU, builds, commits)
  - System health (CPU, memory, DB)
- **Setup**:
  - Prometheus server (infrastructure)
  - Grafana dashboards
  - AlertManager rules

---

## Integration Priority Matrix

| Tier | Repos | Priority | Timeline | Blocker |
|------|-------|----------|----------|---------|
| **FOUNDATION** | 5 | 🔴 CRITICAL | Today | None |
| **FRONTEND** | 5 | 🔴 CRITICAL | Week 1 | Foundation |
| **BACKEND** | 5 | 🟠 HIGH | Week 1-2 | Foundation |
| **AI/AGENTS** | 5 | 🟠 HIGH | Week 2-3 | Backend + Foundation |
| **COMMUNITY** | 5 | 🟡 MEDIUM | Week 3-4 | Agents + Backend |

---

## Clone & Integration Strategy

### Option A: Git Submodules (Recommended)
```bash
cd /workspaces/azora

# Add as submodules (preserve full history)
git submodule add https://github.com/github/codespaces-nextjs tools/codespaces-nextjs
git submodule add https://github.com/github/spark-template tools/spark-template
... (25 total)

# Benefits: Full Git history, version control, easy updates
# Trade-offs: Slightly larger repo size
```

### Option B: Selective Copying (Pragmatic)
```bash
# Copy only critical source files (not node_modules)
# Store in dedicated directories:
services/
├── external-references/
│   ├── github-copilot-cli/
│   ├── github-spec-kit/
│   ├── github-annotation-toolkit/
│   ... (others)
```

### Option C: NPM Packages + References
```bash
# Install public npm packages:
npm install @github/copilot-cli spec-kit annotation-toolkit ...

# For GitHub internal repos without npm packages:
# Clone as reference + doc link
# Extract only needed code patterns
```

---

## Environment Setup Checklist

Before Phase 1 completion, verify:

- [ ] Node.js >= 20 installed
- [ ] pnpm >= 9.0.0 installed (via corepack)
- [ ] GitHub account with 2FA
- [ ] OpenAI API key (GPT-4 access)
- [ ] Anthropic API key (Claude 3 access)
- [ ] Stripe account (test mode)
- [ ] PostgreSQL available (local or cloud)
- [ ] Redis available (local or cloud)
- [ ] Figma account (design integration)
- [ ] Docker installed (container support)
- [ ] kubectl installed (K8s testing)
- [ ] Terraform installed (IaC)

---

## References & Documentation

- **BuildSpaces Blueprint**: Original vision document
- **Recovery Plan**: `BUILDSPACES_RECOVERY_PLAN.md` (this repo)
- **Constitutional Governance**: `/workspaces/azora/CONSTITUTION.md`
- **AI Dev Laws**: `/workspaces/azora/AI_DEV_LAWS.md`
- **Copilot Instructions**: `.github/copilot-instructions.md`

---

**Status**: 🚀 Ready for Phase 1 execution  
**Maintained By**: GitHub Copilot Architect  
**Last Updated**: December 10, 2025
