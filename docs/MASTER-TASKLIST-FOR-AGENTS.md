<!--
  MASTER TASKLIST FOR CODING AGENT
  This file consolidates high-priority launch tasks across the repository. Use this as the agent's seed job list.
  Generated: December 3, 2025
-->

# Azora - Master Tasklist for Coding Agents (Launch Priorities)

This master tasklist is derived from `MASTER-IMPLEMENTATION-PLAN.md`, `.kiro/LAUNCH-READY-FINAL.md`, and an automatic repository scan (Dec 3, 2025). It is prioritized, actionable, and ready for assignment to coding agents.

---

## How to use this file

- Tasks are grouped by priority: CRITICAL / HIGH / MEDIUM / LOW.
- Each task has: Summary, Files/Dirs to update, Acceptance Criteria, Estimated Effort (points), and Suggested Owner (optional).
- Agents should update the `docs/MASTER-TASKLIST-FOR-AGENTS.md` file with progress and create PRs targeting `main` with small, testable increments.

---

## Implementation Status Snapshot (as of 2025-12-03)

This snapshot lists critical components and their current implementation status. Use this to quickly see where focus is needed.

| Component | Status | Notes |
|---|---|---|
| azora-blockchain | Implemented (Core) | Blockchain service exists with mint/transfer/event listening. Needs production config, gas optimizations, and hardened retries.
| azora-mint / nft | Partially implemented | Minting endpoints exist; access control and IPFS/S3 metadata + stricter rate limiting required.
| azora-pay (Payments) | Partially implemented | Wallet & transaction endpoints implemented; funding/withdrawal still mocked/simulated. Requires Stripe + blockchain bridging.
| citadel-fund | Partially implemented | Collections and allocations exist; governance is in-memory and must be migrated to DB with audit trail.
| proof-of-value | Implemented (Core) | Mining engine exists; anti-gaming protections and mint integration require work.
| constitutional-ai | Partially implemented | Basic rules/keyword filtering exists; upgrade to bias detection/self-critique required.
| azora-api-gateway | Implemented | Gateway exists with proxy routing & circuit breaker; needs automated route tests and resilience checks.
| Observability & Mesh | Partially implemented | Some observability exists; missing service mesh deployment & full tracing across all services.
| Frontend (web) | Partially implemented | Several apps exist and run; many UX flows need completion & mobile parity.
| Mobile apps | Incomplete | Mobile apps are shells; production builds & CI required.
| Security Tests (Pen/CI) | Partially implemented | Pen test placeholders exist; CI security integration needs completion.
| Documentation | Mixed | Many docs updated; some stale docs remain (`.kiro/LAUNCH-READY-FINAL.md`) — archived; use `docs/LAUNCH-CHECKLIST.md`/`docs/MASTER-TASKLIST-FOR-AGENTS.md`.

---

## CRITICAL (Complete before any production deployment)

1) Replace wallet & payment mocks with production-grade flows (Azora Pay / Billing)
   - Summary: Replace simulated blockchain & funding flows with a robust invocation to the blockchain service and a Stripe hosted flows integration; implement idempotency & retries.
   - Files/Paths: `services/azora-pay/*`, `services/billing-service/*`, `services/citadel-fund/*`, `services/azora-blockchain/*`
   - Acceptance Criteria:
     - End-to-end test covering a paid invoice → citadel-fund revenue collection → 10% allocation flows.
     - Pull request with tests that use Stripe test keys & a local ganache/Hardhat chain in CI.
   - Est. Effort: 8 points
   - Status: In Progress (`services/azora-pay` & `services/billing-service` have endpoints, but funding & withdrawal are simulated; Stripe integration & reconciliation required)

2) Harden CitadelFund + Governance to use DB & on-chain records
   - Summary: Migrate in-memory governance in `citadel-fund` to DB-backed flows, add transaction records in blockchain when required, and ensure transparency report endpoints exist and return audit-ready data.
   - Files/Paths: `services/citadel-fund/src/*`, `services/azora-treasury/*`, `prisma/*`
   - Acceptance Criteria:
     - Governance proposals persisted, vote transactions recorded, and `getTransparencyReport` returns full audit logs.
     - Tests for DB migration and workflow.
   - Est. Effort: 5 points
   - Status: In Progress (DB-backed components exist; governance still in-memory; audit logs need validation)

3) Upgrade Constitutional AI engine for production reasoning & auditability
   - Summary: Replace shallow keyword filters with the Constitutional AI upgrade (self-critique + fairness scoring), integrate logging and an audit trail for AI decisions.
   - Files/Paths: `services/constitutional-ai/*`, `services/ai-ethics-monitor/*`.
   - Acceptance Criteria:
     - Unit tests for fairness and bias detection.
     - Audit logs for AI decisions present in DB and accessible via API.
   - Est. Effort: 8 points
   - Status: Partially Implemented (Keyword-based filtering present; self-critique and fairness scoring incomplete)

4) Service Mesh & Observability (mTLS, tracing, SLOs)
   - Summary: Implement consistent service-to-service mTLS, add Jaeger tracing, Prometheus instrumentation and configure SLOs and alerting rules.
   - Files/Paths: `infrastructure/service-mesh/*`, `services/*/observability` packages, `docker-compose.*` manifests.
   - Acceptance Criteria:
     - mTLS enabled between core services.
     - Traces visible on Jaeger for a simple user journey (login → course enroll → payment).
     - Alerts for critical SLO breaches in webhook tests.
   - Est. Effort: 10 points
   - Status: Partially Implemented (Monitoring & metrics partly implemented; full Jaeger/mTLS/alerting remaining)

---

## HIGH (Target before launch; important for reliability and trust)

1) API Gateway validation & automated routing tests
   - Files/Paths: `services/azora-api-gateway/*`
   - Acceptance Criteria:
     - Automated tests for routing to the critical set of services with circuit breaker simulation in CI.
     - Health aggregation endpoint returns all monitored services correctly.
   - Est. Effort: 3 points
   - Status: Implemented with coverage gaps (gateway present and routing; automated tests & resilience checks incomplete)

2) Payment provider & subscriptions: Stripe webhook handling and reconciliations
   - Files/Paths: `services/billing-service/*`, `services/subscription-service/*`, `services/azora-pay/*`
   - Acceptance Criteria:
     - Webhook endpoints implemented & verified with Stripe test events.
     - Reconciliation job maps Stripe data to DB invoices & updates balances.
   - Est. Effort: 5 points
   - Status: Partially implemented (webhook handler and reconciliation jobs need finalization; Stripe live integration not implemented)

3) Proof-of-Value → AZR minting integration with anti-gaming protections
   - Files/Paths: `services/proof-of-value/*`, `services/azora-mint/*`, `packages/shared/*`
   - Acceptance Criteria:
     - Minting flow uses `azora-mint` and validates uniqueness; anti-gaming heuristics prevent automated abuse.
     - Unit tests and integration tests covering attack vectors.
   - Est. Effort: 6 points
   - Status: Partially implemented (mining engine implemented; anti-gaming & complete mint path are incomplete)

4) Finalize mobile apps and release pipelines
   - Files/Paths: `apps/azora-sapiens-mobile/*`, `apps/azora-enterprise-suite-mobile/*`, `playwright.config.ts`, `github/workflows/e2e.yml`
   - Acceptance Criteria:
     - Mobile builds generate working IPA/APK artifacts and a staging distribution.
     - E2E tests run on the staging builds.
   - Est. Effort: 5 points
   - Status: Not Implemented (mobile apps are still at shell phase)

  5) Replace penetration test placeholders and complete security automation
     - Summary: Convert placeholder returns in `tests/penetration/authorized-pentest-framework.ts` and related tests into real checks that scan for missing headers, rate limiting, and verify policies are applied across services.
     - Files/Paths: `tests/penetration/*`, `services/*/security`, `.github/workflows/security-tests.yml`
     - Acceptance Criteria:
       - Penetration tests run in CI and fail when security headers or rate limiting are missing.
       - All placeholder returns are replaced with actual logic.
       - Security scan reports are attached to PRs and issues for remediation.
     - Est. Effort: 3 points
     - Status: Partially implemented (placeholder tests present; CI integration needed)

6) Consolidate minting services & centralize minting (azora-mint canonical)
   - Summary: Remove duplicate mint implementations and centralize all minting calls through `services/azora-mint` HTTP API. Ensure `proof-of-value`, `azora-pay`, and `citadel-fund` call `MINT_SERVICE_URL` rather than instantiating their own wallets and contracts. Add CI lint rule to fail builds if new direct ethers providers/wallets (e.g., new ethers.Wallet / new ethers.Contract) are added to non-approved directories.
   - Files/Paths: `services/azora-mint/*`, `services/azora-cloud/azora-mint/*`, `services/azora-nft-minting/*`, `services/proof-of-value/*`, `services/citadel-fund/*`, `services/azora-pay/*`
   - Acceptance Criteria:
     - `services/azora-mint` is the canonical mint service handling token minting and batch allocations.
     - `proof-of-value` uses `MINT_SERVICE_URL` (or a shared `packages/blockchain-client`) instead of direct `ethers` wallet instantiations.
     - Duplicate mint services (`azora-cloud/azora-mint`, `azora-nft-minting`) are archived/merged.
     - CI rule in `.github/workflows` added to fail on direct `ethers.Wallet` or `ethers.Contract` usage in non-authorized modules.
   - Est. Effort: 6 points
   - Status: In Progress (draft consolidation started — check `proof-of-value` and `azora-mint` for integration points)

---

## MEDIUM (Important for UX, visibility, and analytics)

1) Document & test runbooks for incident response and rollback
   - Files/Paths: `docs/OPERATIONS-MANUAL.md`, `docs/DEPLOYMENT-PRODUCTION.md`, `.github/workflows/*`
   - Acceptance Criteria:
     - Runbooks include clear T-0, T+1 steps and a table mapping alerts to actions.
   - Est. Effort: 2 points

2) Full API docs (OpenAPI), generate automation and SDKs for main clients
   - Files/Paths: `docs/API-REFERENCE.md`, `services/*/openapi.yaml` or generation scripts
   - Acceptance Criteria:
     - OpenAPI specs exist for major services; SDKs generated & smoke-tested.
   - Est. Effort: 4 points

3) Backend job scheduling & disaster recovery validation
   - Files/Paths: `services/*/cron` , `scripts`, `k8s/*` manifests
   - Acceptance Criteria:
     - Backup/restore runbooks validated; DR tests run successfully.
   - Est. Effort: 3 points

---

## LOW (Nice-to-have, or post-launch)

1) Feature flags & A/B test framework
   - Files/Paths: `packages/feature-flags`, `services/*`
   - Acceptance Criteria:
     - Feature flagging infrastructure in place that supports toggling features per user.
   - Est. Effort: 2 points

2) Static file CDN and image optimizations across frontends
   - Files/Paths: `apps/*/public`, `infrastructure/cdn` edge config
   - Acceptance Criteria: Bandwidth & LCP improvements validated vs baseline.
   - Est. Effort: 1 point

---

## Quick Access: Checklist for a Coding Agent

- Prioritize items marked CRITICAL → HIGH → MEDIUM → LOW.
- Create small PRs per task; name PRs using the pattern: `[phase/who] Short description`.
- Add a short 'Testing' section to each PR: `How to verify` and `CI checks required`.
- Sign off by attaching automated test evidence: CI build, lint, unit/integration tests.

---

## Agent Task Files (Local assignments)
The per-agent task files are available under `docs/agents/agent-xx.tasks.md`. These are for local assignment and tracking; do not create PRs for local status updates. Use `docs/AGENT-INSTRUCTIONS.md` for the process.

- Agent 01: `docs/agents/agent-01.tasks.md` — Blockchain service
- Agent 02: `docs/agents/agent-02.tasks.md` — Mint/NFT service
- Agent 03: `docs/agents/agent-03.tasks.md` — CitadelFund
- Agent 04: `docs/agents/agent-04.tasks.md` — Constitutional AI
- Agent 05: `docs/agents/agent-05.tasks.md` — API Gateway
- Agent 06: `docs/agents/agent-06.tasks.md` — Proof-of-Value
- Agent 07: `docs/agents/agent-07.tasks.md` — Frontend UIs & E2E
- Agent 08: `docs/agents/agent-08.tasks.md` — DB / Prisma
- Agent 09: `docs/agents/agent-09.tasks.md` — Infra & Mesh
- Agent 10: `docs/agents/agent-10.tasks.md` — Security & PenTests



---

## Contact & Handoff

- Support: `support@azora.world`
- Engineering Manager: [Assign in PR when ready]
- Security Lead: [Assign in PR when ready]

---

## Changelog

- 2025-12-03: Created master tasklist from MASTER-IMPLEMENTATION-PLAN, README, Quick-Start & a repo scan. Prioritized CRITICAL tasks and included acceptance criteria.

