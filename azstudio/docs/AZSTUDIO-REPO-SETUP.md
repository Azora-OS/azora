# AZSTUDIO Repo Setup & Fork Plan

This document outlines the recommended steps to create the `azstudio/` VS Code fork, maintain the code, and integrate with the Azora monorepo.

## Initial Forking Steps

1. Fork the VS Code repo into the Azora-OS GitHub org:
   - `git clone https://github.com/microsoft/vscode.git --depth=1` into a temporary dir
   - Create a new repo `Azora-OS/azstudio` and push the initial fork

2. Pin to a stable tag (e.g., `v1.100.0`) for baselining:
   - `git fetch --tags upstream` 
   - `git checkout -b azstudio-base v1.100.0`
   - Push to `Azora-OS/azstudio`

3. Add required configuration for Azora:
   - `product.json` with `azora` branding and update server
   - `README` and contribution guidelines
   - `CODE_OF_CONDUCT`, `CONTRIBUTING`, `LICENSE` (maintain MIT compatibility)

4. Add `azstudio/` initial modules and injection points:
   - `src/vs/workbench/contrib/azora/` 
   - `src/vs/workbench/services/azora/`

5. Add `extensions/azora-agents/` as built-in extension

## Upstream Sync & Merge Process

- `upstream` remote points to `https://github.com/microsoft/vscode.git`
- Weekly correction script for upstream merges:
  1. `git fetch upstream --tags`
  2. Create temporary branch to integrate upstream tag
  3. Run full build & smoke tests on CI
  4. If tests pass, cherry-pick/merge (manual conflict resolution)
- Provide a breaking changes guide for tracking API shifts in upstream

## Branching Strategy

- `main` -> Production-ready stable branch
- `develop` -> Working integration branch
- `feature/*` -> Developer branches
- `release/*` -> Release branches for RC
- `hotfix/*` -> Emergency patches

## Scripts & Automation

- `./scripts/merge-upstream.ps1` — Powershell script to fetch and attempt merges
- `./scripts/init-dev.ps1` — Setup developer environment (install deps, recommended Node version)
- `./scripts/build-and-test.ps1` — Runs `npm ci`, `npm run build`, and `npm test`
- `./scripts/package.ps1` — Build installer

## Product & Branding

- `product.json` should include:
  - `nameShort`: AzStudio
  - `nameLong`: AzStudio - Azora's Editor
  - `applicationName`: AzStudio
  - `urlProtocol`: azstudio
  - `extensionsGallery`: point to an Azora-hosted gallery or mirror

## CI/CD & Build Matrix (Initial)

- Windows (x64), Linux, macOS builds
- Windows packaging & signing steps
- Integration tests & E2E on Linux (cheap runner)
- Run Playwright E2E on Chromium only (as default)

## Contributors, Security, and Releases

- Approval flow: PRs require two reviewers, at least one from the core maintainers group
- Security: all secrets stored in Azure Key Vault/ GitHub Secrets
- Releases: new versions published to GitHub Releases and optionally store listing

## Developer Onboarding

- Provide `SETUP.md` covering:
  - Node & pnpm setup
  - Build & dev commands
  - Debugging the fork in Visual Studio Code
  - How to run tests and E2E

---

*Author*: Azora Infrastructure Team  
*Version*: 1.0  
*Date*: Dec 5, 2025
