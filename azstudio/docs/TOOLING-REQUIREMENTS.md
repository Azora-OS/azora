# AzStudio Tooling Requirements & Gaps

## Critical Gaps We've Discovered

Building AzStudio is a **multi-layer** undertaking, and our current tooling isn't enough to support autonomous, fast iteration at scale. Here are the gaps:

### 1) **VS Code Fork Infrastructure**
**Gap**: We don't have a stable `azstudio/` fork yet.
- No pinned VS Code version (`v1.100.0` or similar).
- No CI/CD for the fork (build, test, sign, package).
- No upstream merge strategy or automation.

**Better Tool Needed**: 
- Script to clone, pin, and setup the fork with proper product.json, CI templates, and branching strategy.
- Pre-built CI pipeline (`GitHub Actions` or `Azure Pipelines`) for Windows/Linux/macOS builds and signing.

### 2) **Service Scaffolding & DI Registration**
**Gap**: Our agent services need to integrate into VS Code's Dependency Injection (DI) system, but we don't have boilerplate generators.
- Manually writing `registerSingleton(IService, ServiceImpl)` for each service is tedious.
- No templates for DI wrappers that bridge `src/main/services/*` → `src/vs/workbench/services/azora/*`.

**Better Tool Needed**:
- Code generator: `azstudio-scaffold.ts` that produces:
  - DI service wrappers with proper TypeScript typing
  - Test stubs for each service
  - Extension registration boilerplate
  - Example `invoke` methods with mocked responses

### 3) **Test & E2E Infrastructure**
**Gap**: We have Jest and Playwright, but no pre-configured test templates for agent flows.
- No reusable test harness for chat agent invocation.
- No E2E fixtures for launching AzStudio dev build + agents.

**Better Tool Needed**:
- Jest templates for agent unit tests (mock `IAzoraAIRouter`, `IChatAgentService`, etc.).
- Playwright fixture helpers for agent chat flows (open chat, send prompt, assert response).
- Mock provider adapters for stubbing external LLMs.

### 4) **API Mocking & Stubbing**
**Gap**: Agents will call external services (OpenAI, Knowledge Ocean, etc.), but tests need stubs.
- No centralized stub factory for common agent dependencies.
- No Mock LLM provider to return canned responses in tests.

**Better Tool Needed**:
- `MockAIProvider` class that returns deterministic responses without calling real APIs.
- Stub Knowledge Ocean adapter that uses local data.
- Stub Constitutional validator (always approve in tests, configurable).

### 5) **Documentation & Runbooks**
**Gap**: New team members won't know how to work with the fork or contribute agents.
- No SETUP guide for local dev on Windows.
- No runbook for "add a new agent" workflow.
- No troubleshooting guide for common build/test failures.

**Better Tool Needed**:
- `SETUP.md` with step-by-step environment setup (Node, pnpm, VS Code, Playwright).
- `AGENT_DEVELOPER_GUIDE.md` with template agent extension + quickstart.
- Troubleshooting wiki (common issues + fixes).

### 6) **Continuous Integration & Release Pipeline**
**Gap**: We don't have a CI/CD pipeline to validate PRs, run tests, and package builds.
- No GitHub Actions or Azure Pipelines config.
- No automated code signing for Windows installers.
- No release automation (tag → build → publish).

**Better Tool Needed**:
- `.github/workflows/` with jobs for:
  - Lint + unit test (PR check)
  - E2E tests (on PR to develop/main)
  - Build matrix (Windows x64, Linux, macOS)
  - Signed Windows packaging
  - Release automation (tag → GitHub release)

### 7) **Dependency & Version Management**
**Gap**: AzStudio depends on VS Code (fork), Azora monorepo services, and external LLMs, but versions can drift.
- No version pinning strategy.
- No upstream merge automation.
- No dependency conflict detection.

**Better Tool Needed**:
- `scripts/sync-upstream.ps1` to safely merge new VS Code versions.
- Automated dependency audit (npm audit, outdated packages).
- Monorepo workspace linking (azstudio/ depends on packages/shared-ai, services/knowledge-ocean, etc.).

### 8) **Progress Tracking & Agent Status**
**Gap**: We can't track what the autonomous agent is doing or what's blocking it.
- No shared progress log.
- No issue/PR templates for agent work.
- No automated status reporting.

**Better Tool Needed**:
- `docs/AGENT_PROGRESS.md` auto-updated with:
  - Completed tasks + PR links
  - In-progress tasks + branch status
  - Blockers + escalation notes
- GitHub issue template for "agent task" (auto-labeled, auto-assigned).
- PR template with testing checklist + artifacts.

---

## Tools to Build Before Full Scale-Up

### Priority 1 (Must Have for Phase 1)
1. **Fork Setup Script** (`scripts/init-azstudio-fork.ps1`)
   - Clone VS Code pinned version
   - Configure product.json
   - Setup CI templates
   - Output a ready-to-use repo

2. **Service Scaffolder** (`scripts/scaffold-agent-service.ts`)
   - Input: agent name (e.g., `elara`)
   - Output: DI wrappers, test stubs, extension boilerplate

3. **Test Harness Template** (`__tests__/agent.harness.ts`)
   - Reusable Jest setup for agent tests
   - Mock LLM provider
   - Mock Knowledge Ocean

4. **E2E Fixture Helper** (`tests/e2e/agent.fixtures.ts`)
   - Playwright helpers for agent flows
   - Chat panel helpers
   - Inline chat helpers

### Priority 2 (Important for Team Onboarding)
5. **Dev Setup Script** (`scripts/dev-setup.ps1`)
   - Install Node, pnpm, VS Code
   - Clone repo and install deps
   - Run smoke tests

6. **Developer Guides**
   - `docs/SETUP.md` — environment setup
   - `docs/AGENT_DEVELOPER_GUIDE.md` — how to add an agent
   - `docs/TROUBLESHOOTING.md` — common issues

### Priority 3 (For Release & CI/CD)
7. **CI/CD Pipeline** (`.github/workflows/`)
   - Build & test matrix
   - E2E on PR
   - Signed Windows builds
   - Release automation

8. **Upstream Merge Tool** (`scripts/sync-upstream.ps1`)
   - Fetch latest VS Code tag
   - Merge with conflict detection
   - Run smoke tests

---

## Proposed Tooling Stack

| Tool | Purpose | Status |
|------|---------|--------|
| PowerShell 5.1 | Windows automation (setup, merge, build) | ✅ Ready |
| TypeScript/Node | Scaffolding & code generation | ✅ Ready |
| Jest + Playwright | Testing | ✅ Ready |
| GitHub Actions | CI/CD | ⏳ To create |
| Docker | E2E test isolation | ⏳ Optional but recommended |

---

## Implementation Order

1. **Fork Setup Script** → Creates `azstudio/` with CI templates ready
2. **Service Scaffolder** → Generates boilerplate for new agents
3. **Test Harness + Mocks** → Enables fast test iteration
4. **Dev Setup Script** → Onboarding for team
5. **E2E Fixtures** → Automate agent chat flows
6. **CI/CD Workflows** → Validate PRs automatically
7. **Upstream Merge Tool** → Keep fork in sync
8. **Developer Guides** → Documenting all of the above

---

## Impact on Agent Sprint

**Without these tools**: Agent must manually create each file, test scaffold, and document steps. Slow, error-prone, lots of back-and-forth.

**With these tools**: Agent scaffolds a new agent extension in ~5 minutes, runs tests in 2 minutes, commits to a PR. Human reviews in minutes. 10x faster iteration.

---

*Document Version:* 1.0  
*Author:* Azora Architecture Team  
*Date:* Dec 5, 2025
