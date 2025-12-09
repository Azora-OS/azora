# Marketplace & Forge – Domain Implementation Task List

> Status: Draft v0.1 (deep dive)  
> Linked master task list: `citadel-dev/MASTER-IMPLEMENTATION-TASKLIST.md` (MP-*, PAY-*, CAI-*, DATA-*)

This document expands MP-* tasks into fine‑grained work for JobSpaces and Forge.

---

## 1. Marketplace Core – Jobs, Tasks, Contracts

- [ ] **MP-1.1: Marketplace Core Schema Extensions**  
  **Objective**: Extend Prisma marketplace models to support JobSpaces contracts, milestones, and ratings.  
  **Parent**: MP-1 (master).  
  **Dependencies**: `Job`, `JobApplication`, `Skill`, `UserSkill` models; Mint & Pay; Sapiens credentials.  
  **Steps**:  
  - Add `Contract`, `Milestone`, `ContractEvent`, and `Review` models.  
  - Define enums for job types, engagement models, and statuses.  
  - Add indexes for filtering and matching (skills, price, location, remote, tier).  
  **Acceptance criteria**:  
  - Can represent jobs, tasks, milestones, reviews end‑to‑end.  
  - No ambiguous or overloaded model fields; migrations pass.  
  **Verification**:  
  - Schema tests; seed data and query tests.  
  **Artifacts**: Prisma migrations, model docs.  
  **Ownership**: Marketplace + Data squads.  
  **Effort**: M  
  **Priority**: P1  
  **Repo paths**: `prisma/schema.prisma`, `services/marketplace-core/`.

- [ ] **MP-1.2: JobSpaces API & Flows**  
  **Objective**: Implement core JobSpaces flows: post job, browse, apply, hire, manage contract.  
  **Parent**: MP-1.  
  **Dependencies**: MP-1.1; Auth Core; Mint & Pay; Sapiens credentials & PoV.  
  **Steps**:  
  - Implement REST/gRPC APIs for Jobs, Applications, Contracts, and Reviews.  
  - Integrate role checks (client vs contributor).  
  - Wire in Sapiens credential and reputation summaries on profiles.  
  **Acceptance criteria**:  
  - Client can post a job, receive applications, select contributor, and create a contract.  
  - Contributor can manage applications and contracts from a unified dashboard.  
  **Verification**:  
  - Integration/E2E tests for post→apply→hire→complete flows.  
  **Artifacts**: API specs, Postman/insomnia collections, E2E tests.  
  **Ownership**: Marketplace squad.  
  **Effort**: L  
  **Priority**: P1  
  **Repo paths**: `services/marketplace-core/`, `apps/azora-buildspaces/`.

---

## 2. Forge – Artifact Marketplace

- [ ] **FORGE-2.1: Forge Artifact Schema & Registry**  
  **Objective**: Define `ForgeArtifact`, `ForgeVersion`, and related models to register agents, templates, and other digital assets.  
  **Dependencies**: AzStudio skills registry; Library models; Sapiens course models; Mint & Pay.  
  **Steps**:  
  - Design Forge schemas and add Prisma models or dedicated DB.  
  - Implement a simple registry API: list/publish/update/deprecate artifacts.  
  - Support multiple artifact types (agent, extension, dataset, course pack, blueprint).  
  **Acceptance criteria**:  
  - At least 3 artifact types can be registered and resolved by ID/version.  
  - Artifacts are linkable from Sapiens, Ascend, and BuildSpaces UIs.  
  **Verification**:  
  - Schema tests; API tests; sample clients (e.g., Ascend extension browser).  
  **Artifacts**: Schema docs, registry service.  
  **Ownership**: Marketplace + AzStudio squads.  
  **Effort**: M  
  **Priority**: P1  
  **Repo paths**: `services/forge-marketplace/`, `prisma/schema.prisma`.

- [ ] **FORGE-2.2: Forge Frontend & Install Flows**  
  **Objective**: Build Forge UI for browsing/installing artifacts and managing ownership/usage.  
  **Dependencies**: FORGE-2.1; Ascend & AzStudio integration; Library.  
  **Steps**:  
  - Create Forge section in BuildSpaces (catalog, detail pages, publisher console).  
  - Implement “install/use” flows for at least: agents/skills, Ascend extensions, Sapiens course packs.  
  - Track installs/usage for reputation and PoV.  
  **Acceptance criteria**:  
  - Users can install and use Forge artifacts in their environments (Sapiens class, Ascend project, BuildSpace).  
  - Usage properly logged and viewable to publishers.  
  **Verification**:  
  - E2E tests for artifact discovery→install→use.  
  **Artifacts**: UI components, integration glue, docs.  
  **Ownership**: Marketplace + Ascend + Sapiens squads.  
  **Effort**: L  
  **Priority**: P2  
  **Repo paths**: `apps/azora-buildspaces/`, `apps/ascend/`, `services/forge-marketplace/`.

---

## 3. Escrow & Dispute Resolution

- [ ] **MP-2.1: Escrow Account & Milestone Flows**  
  **Objective**: Implement escrow accounts and milestone‑based payouts, integrated with Mint & Pay.  
  **Parent**: MP-2, PAY-1.  
  **Dependencies**: Mint & Pay ledger; contracts/milestones schema; compliance requirements.  
  **Steps**:  
  - Implement `EscrowAccount` entity and APIs (fund, update, release, refund).  
  - Integrate with Mint & Pay for ledger entries and real payouts.  
  - Tie escrow lifecycle tightly to contract milestones and statuses.  
  **Acceptance criteria**:  
  - Clients can fund contracts; funds locked until conditions met.  
  - Reconciliation jobs show no mismatch between escrow and ledger balances.  
  **Verification**:  
  - Integration tests for escrow flows; reconciliation test suite.  
  **Artifacts**: Service code, ledger integration, runbooks.  
  **Ownership**: Marketplace + Mint squads.  
  **Effort**: L  
  **Priority**: P1  
  **Repo paths**: `services/escrow-dispute/`, `services/mint-pay/`, `prisma/schema.prisma`.

- [ ] **MP-2.2: Dispute Workflow & Governance Hooks**  
  **Objective**: Provide structured dispute workflows and hooks for governance/escalation.  
  **Parent**: MP-2.  
  **Dependencies**: Escrow; UbuntuGovernance; AI Ethics Monitor (for AI‑mediated judgments).  
  **Steps**:  
  - Model disputes, evidence, and resolution outcomes.  
  - Implement workflows (negotiation, mediator decision, escalation).  
  - Provide optional hooks for on‑chain governance involvement for high‑impact disputes.  
  **Acceptance criteria**:  
  - Disputes can be opened, argued, and resolved; outcomes visible and logged.  
  - No escrow funds released without valid resolution state.  
  **Verification**:  
  - Simulated dispute scenarios; audit of dispute logs.  
  **Artifacts**: Dispute models, APIs, UI flows, governance docs.  
  **Ownership**: Marketplace + Governance squads.  
  **Effort**: M  
  **Priority**: P1  
  **Repo paths**: `services/escrow-dispute/`, `blockchain/UbuntuGovernance.sol`.

---

## 4. Matching, Reputation, and AI Assistance

- [ ] **MP-4.1: Matching Engine v1**  
  **Objective**: Implement a matching engine that recommends candidates for jobs/tasks and jobs for candidates.  
  **Dependencies**: Skill and Job models; Sapiens credentials; Reputation service; AI Family.  
  **Steps**:  
  - Define scoring features (skills overlap, history, reputation, timezone, price).  
  - Implement batch and on‑demand matching endpoints.  
  - Integrate with AI Family for explanation and suggestion UX, with No Mock enforcement.  
  **Acceptance criteria**:  
  - Relevance validated against pilot user feedback.  
  - Matching latency within acceptable bounds for interactive UX.  
  **Verification**:  
  - Offline evaluation using historical data or synthetic scenarios.  
  **Artifacts**: Matching service, tests, dashboards.  
  **Ownership**: Marketplace + AI Platform squads.  
  **Effort**: L  
  **Priority**: P2  
  **Repo paths**: `services/marketplace-core/`, `services/reputation/`, `services/ai-family-api/`.

- [ ] **MP-4.2: Reputation Profile & Anti‑Abuse Signals**  
  **Objective**: Aggregate signals into a unified reputation profile and detect abuse/gaming.  
  **Dependencies**: Reputation data from Sapiens, Library, Marketplace; PoV.  
  **Steps**:  
  - Design a `ReputationProfile` view combining jobs, artifacts, credentials, and PoV.  
  - Implement anomaly detection for suspicious behavior (e.g., circular reviews, low‑effort jobs).  
  - Surface reputation in JobSpaces, Forge, and Sapiens with correct context.  
  **Acceptance criteria**:  
  - Profiles are meaningful and understandable to users.  
  - Abuse detection catches common manipulation patterns.  
  **Verification**:  
  - Tests on simulated abuse scenarios; manual audits.  
  **Artifacts**: Reputation service logic, UX, docs.  
  **Ownership**: Marketplace + Governance + Sapiens squads.  
  **Effort**: L  
  **Priority**: P2  
  **Repo paths**: `services/reputation/`, `services/marketplace-core/`.

---

## 5. Observability & Compliance

- [ ] **MP-5.1: Marketplace Observability Pack**  
  **Objective**: Provide dashboards and alerts for core marketplace health and fairness.  
  **Dependencies**: OBS-1, OBS-2; marketplace metrics.  
  **Steps**:  
  - Instrument all marketplace services with Otel metrics and traces.  
  - Build dashboards for job volume, application rate, success rate, dispute rate.  
  - Add fairness metrics where possible (distribution across regions, demographics if/when available with privacy constraints).  
  **Acceptance criteria**:  
  - On‑call teams can see health and fairness at a glance.  
  - Alerts for spikes in disputes, fraud indicators, or severe imbalances.  
  **Verification**:  
  - Fire‑drill tests; review metrics with governance team.  
  **Artifacts**: Dashboards, alerts, runbooks.  
  **Ownership**: Marketplace + SRE + Governance squads.  
  **Effort**: M  
  **Priority**: P2  
  **Repo paths**: `monitoring/`, `services/marketplace-core/`, `services/escrow-dispute/`.

---

## 6. Incubator & Investor Flows

- [ ] **INC-6.1: BuildSpaces → Incubator pipeline**  
  **Objective**: Enable founders to submit BuildSpaces/Ascend projects into Incubator with captured context and metrics.  
  **Dependencies**: Marketplace Core; BuildSpaces; Incubator blueprint.  
  **Steps**:  
  - Add "Submit to Incubator" flows in BuildSpaces/Ascend UI for eligible projects.  
  - Capture project metadata (repos, blueprints, tests, metrics, PoV, team) into Incubator entities.  
  - Implement Incubator API endpoints for applications, cohorts, and venture records.  
  **Acceptance criteria**:  
  - A founder can submit a project from BuildSpaces and see it appear as an Incubator application.  
  - Captured data is sufficient for review by mentors and internal teams.  
  **Verification**:  
  - E2E tests; manual review by Incubator operators using sample projects.  
  **Artifacts**: Incubator service endpoints, UI components, docs.  
  **Ownership**: Marketplace + BuildSpaces squads.  
  **Effort**: M  
  **Priority**: P1  
  **Repo paths**: `apps/azora-buildspaces/`, `apps/azora-incubator/`, `services/marketplace-core/`.

- [ ] **INC-6.2: Incubator → JobSpaces & Forge publishing**  
  **Objective**: Allow incubated ventures to publish jobs/tasks and Forge artifacts directly from Incubator.  
  **Dependencies**: INC-6.1; MP-1.*, FORGE-2.1/2.2.  
  **Steps**:  
  - Add publishing flows from Incubator ventures to JobSpaces (jobs/tasks) and Forge (artifacts/agents/templates).  
  - Map venture metadata (stage, sector, traction) into listings and reputation signals.  
  - Ensure PoV and economic flows are correctly attributed to ventures and contributors.  
  **Acceptance criteria**:  
  - A venture can create JobSpaces listings and Forge artifacts from Incubator without duplicating data.  
  - Published listings reference the originating venture and BuildSpace.  
  **Verification**:  
  - E2E tests from venture → listing → contract/artifact usage.  
  **Artifacts**: Publishing APIs, UI flows, mapping docs.  
  **Ownership**: Marketplace + Incubator squads.  
  **Effort**: M  
  **Priority**: P2  
  **Repo paths**: `apps/azora-incubator/`, `apps/azora-jobspaces/`, `services/marketplace-core/`, `services/forge-marketplace/`.

- [ ] **INC-6.3: Investor portal integration**  
  **Objective**: Surface vetted ventures and metrics to external investors via an investor portal.  
  **Dependencies**: INC-6.1; Enterprise & CSI blueprint; investor portal app.  
  **Steps**:  
  - Define venture data and KPIs exposed to investors (with privacy and consent controls).  
  - Implement investor views, filters, and basic deal-flow management in `apps/azora-investor-portal/`.  
  - Integrate optional notifications and communication channels between investors and founders.  
  **Acceptance criteria**:  
  - Investors can browse vetted ventures, review metrics, and express interest through the portal.  
  - Sensitive internal data is not leaked; access is governed by roles and agreements.  
  **Verification**:  
  - Security review; pilot with internal or friendly investors.  
  **Artifacts**: Investor portal UI, API contracts, governance docs.  
  **Ownership**: Marketplace + Enterprise squads.  
  **Effort**: M  
  **Priority**: P2  
  **Repo paths**: `apps/azora-investor-portal/`, `apps/azora-incubator/`, `services/marketplace-core/`.

---

## 7. Activation Roadmap – Marketplace & Forge

- **Phase 1**: Marketplace core – MP-1.1, MP-1.2, baseline jobs/tasks without escrow.  
- **Phase 2**: Escrow & disputes – MP-2.1, MP-2.2, PAY-1 integration.  
- **Phase 3**: Forge registry & UX – FORGE-2.1, FORGE-2.2.  
- **Phase 4**: Matching & reputation – MP-4.1, MP-4.2.  
- **Phase 5**: Observability & fairness – MP-5.1, CAI/SEC policy integration.
