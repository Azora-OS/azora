# Agent 07 - Frontend - Azora Sapiens, Jobspaces, Pay UI

Primary Focus: Finish core frontend UIs (web & mobile) for Azora Sapiens, Jobspaces, and Azora Pay, and ensure test coverage and CI builds are in place.

Priority: HIGH

Tasks:
1. Azora Sapiens - Complete enrollment and course progress flows.
   - Files: `apps/azora-sapiens/src/pages/*`, `services/azora-education` interactions.
   - Acceptance: Enroll, progress, and completion flows function on the staging environment with local data.

2. Jobspaces - Implement job listing & application flows and UI pages.
   - Files: `apps/azora-jobspaces/*`.
   - Acceptance: Create job listing, apply to job and store the application in the DB (staging).

3. Azora Pay - Wallet UI & Transaction history.
   - Files: `apps/azora-pay/*` (frontend), `services/azora-pay` (backend API hooks).
   - Acceptance: Wallet display, transaction list, and de/credit simulation for a user in staging.

4. Add E2E tests for critical flows (registration, login, enroll, payment) using Playwright.
   - Files: `tests/e2e/*`, `playwright.config.ts`.
   - Acceptance: CI E2E job passes for the flows above.

Verification steps:
- Local `npm run dev` for each app and verify flows.
- Run Playwright E2E tests locally and in CI.

