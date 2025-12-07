# AZSTUDIO CI/CD & Testing Plan

## Goals
- Ensure `azstudio/` builds for all platforms with a single command
- Validate functionality with unit/integration/E2E tests
- Provide reproducible packaging for installer generation

## CI Pipeline Stages

1. Lint -> Unit tests -> Build
2. Integration tests -> E2E tests (Chrome) -> Packaging
3. Release candidate -> Signed packages -> Release

## Basic CI Flow (GitHub Actions)
- On PR:
  - Checkout
  - Cache npm/pnpm
  - Install dependencies
  - Run lint & unit tests
  - Build
  - Run smoke tests (headless)
- On merge to `develop`:
  - Build & run integration tests
  - Run E2E tests on a single runner
- On release to `main`:
  - Build for all platforms
  - Package & sign Windows installers
  - Publish releases to GitHub & optionally Azora downloads

## Test Matrix
- Unit + Integration: Node 20, TypeScript 5
- E2E: Playwright (Chromium) in Docker or official runner
- Browser compatibility: Chromium only to focus effort (expand later)

## Key E2E tests
- Agent chat: agent registers and responds
- Inline edit: agent suggests change, Constitutional validation applied, change applied
- Task scheduling: task created, executed, result displayed
- RAG: knowledge search returns result and reduces external calls
- Permission prompts: secure prompts when attempting to access network

## Test Coverage Targets
- Unit coverage 80%
- Integration 70% (services & DB adapters)
- E2E: Full coverage for core user flows (chat, inline, taskboard)

## Secret Handling
- All keys: GitHub Secrets or organization-level secure storage
- Access pod/runner to secrets only during required steps (deployments)

## CI Tools & Runners
- GitHub Actions
- Self-hosted runners for Windows for signed packages
- Docker-based runners for Linux E2E tests

## Release Gates
- Must pass all unit and selected E2E tests
- Performance smoke tests must pass (< 3s for LLM no context responses)
- Security & audit checks must pass (no secret leaks)

---

*Author:* Azora DevOps Team  
*Date:* Dec 5, 2025
