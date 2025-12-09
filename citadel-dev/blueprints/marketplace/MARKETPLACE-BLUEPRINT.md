# Marketplace & Forge – Domain Blueprint (Deep Dive)

> Status: Draft v0.1  
> Linked master docs:  
> - `citadel-dev/MASTER-ARCHITECTURE-BLUEPRINT.md` (Marketplace & Forge, Mint & Pay)  
> - `citadel-dev/MASTER-IMPLEMENTATION-TASKLIST.md` (MP-*, PAY-*, CAI-*, DATA-*)

This blueprint covers **JobSpaces** (job & task marketplace) and **Forge** (artifact/agent/template marketplace) as one coherent economic layer.

---

## 1. Mission & Benchmarks

**Mission**: Build the economic engine of Azora – a marketplace where:

- Learners, educators, builders, and researchers turn skills and artifacts into value.  
- Organizations and the Citadel find verified talent, agents, and solutions.  
- All activity is tracked via **PoV** and **AZR** under Azora’s constitutional AI and Ubuntu governance.

**World‑class benchmarks**:

- Job/task marketplace capabilities similar to or exceeding **Upwork, Toptal, Fiverr, GH bounty platforms**.
- Artifact marketplace comparable to **VS Code marketplace, GitHub Marketplace, AWS Marketplace, app stores**, but for:
  - Agents, skills, workflows, templates, courseware, datasets, research tools, BuildSpaces layouts.
- Strong **reputation, escrow, dispute resolution, and compliance** (KYC/AML‑aware, where needed).

> Assumption M‑A1: v1 focuses on remote/online work and digital artifacts; physical goods are out of scope initially.

---

## 2. C4 Views

### 2.1 System Context

**Actors**:

- **Client** (org, startup, research group, Citadel team) – posts jobs/tasks, buys artifacts.
- **Contributor** (learner, educator, builder, researcher) – applies to jobs, delivers work, publishes Forge assets.
- **Reviewer / Curator** – moderates jobs and Forge submissions, resolves disputes.
- **Enterprise Admin** – manages org‑level policies, budgets, and integration to internal systems.
- **External Systems** – payment providers, identity/KYC services, regulatory data sources.

**Systems**:

- **JobSpaces Marketplace** – job/task board, matching, application and contract flows.
- **Forge Marketplace** – digital goods market (agents, services, templates, courses, datasets, blueprints).
- **Incubator** – pipeline that takes BuildSpaces/Ascend builds and founders into real-world ventures, funding, and market readiness.
- **Mint & Pay** – wallets, escrow, payouts, PoV/AZR.
- **Constitutional AI Core & Governance** – No Mock and ethics checks on AI agents; PoV/gov hooks.
- **Sapiens & Library & Research Center** – supply of skilled contributors, credentials, and artifacts.

### 2.2 Container View

Key containers:

- **Marketplace Core Service** (`services/marketplace-core/` – planned)
  - Manages **Job**, **Task**, **Application**, **Contract**, **Review**, **Rating**.  
  - Uses existing Prisma models: `Job`, `JobApplication`, `Skill`, `UserSkill`; extends with contracts and milestones.

- **Forge Marketplace Service** (`services/forge-marketplace/` – planned)
  - Lists and manages **ForgeArtifact** entries: agents, templates, services, datasets, blueprints, BuildSpaces layouts.  
  - Handles versioning, licensing, pricing, and dependency metadata.

- **Incubator Service** (`services/incubator/` – planned)
  - Manages **IncubatorCohort**, **Venture**, **FounderProfile**, **MentorProfile**.  
  - Handles **Milestone** (incubator-specific), **FundingRound**, **RiskProfile**.

- **Escrow & Dispute Service** (`services/escrow-dispute/` – planned)
  - Manages escrow accounts, milestones, dispute cases, and outcomes.  
  - Coordinates with Mint & Pay to lock/release funds.

- **Reputation & PoV Service** (`services/reputation/` – planned)
  - Aggregates ratings, completion history, PoV, and Sapiens/Library achievements into a unified reputation profile.

- **Frontends**:
  - **JobSpaces UI** – job feed, search, proposals, contract dashboards (canonical in `apps/azora-jobspaces/`, with integrated views in `apps/azora-buildspaces/`).  
  - **Incubator UI** – founder and venture pipeline management in `apps/azora-incubator/`, bridging BuildSpaces projects into real ventures.  
  - **Investor Portal** – external investor-facing views in `apps/azora-investor-portal/` for vetted ventures and cohorts.  
  - **Forge UI** – browse/search artifacts, install/use flows, publisher consoles (in `apps/azora-buildspaces/` and/or a dedicated Forge surface).  
  - **Enterprise Console** – budgets, roles, policy management (integrated with Enterprise Suite).

- **Integration with Mint & Pay**:
  - Payouts, escrow, invoices, and compliance reporting handled by `services/mint-pay/`.

---

## 3. Domain Model

### 3.1 JobSpaces (Job & Task Marketplace)

Builds on existing Prisma models:

- `Job` – extended with fields for **type** (JOB, TASK, BOUNTY), **engagement** (hourly, fixed, bounty), **visibility** (public, invite‑only), and **requirements** (skills, credentials, PoV/leaderboard thresholds).
- `JobApplication` – proposals with cover letter, expected rate, timeline, solution approach.
- **New**:
  - `Contract` – binding agreement between client and contributor; references one or more Jobs/Tasks.
  - `Milestone` – deliverables, amounts, deadlines under a contract.
  - `ContractEvent` – events such as `MILESTONE_SUBMITTED`, `MILESTONE_ACCEPTED`, `DISPUTE_OPENED`.

### 3.2 Forge (Artifact Marketplace)

New entities:

- `ForgeArtifact` – core listing (e.g., Elara agent, Ascend extension, Sapiens course pack, dataset bundle, Blueprint).  
  - Fields: id, type, owner, version, price model, license, dependencies, supported domains.
- `ForgeVersion` – versioned releases with changelogs, compatibility data.
- `ForgeInstall` – usage records (who installed/used an artifact and where).
- `ForgeReview` – ratings and feedback.

Artifacts relate to other domains:

- Agents & skills: integrate with AzStudio and AI Family.  
- Courses & Sapiens content: integrate with Sapiens LMS.  
- Datasets & research tools: integrate with Library + Research Center.

### 3.3 Reputation & PoV

- `ReputationProfile` (logical aggregate) constructed from:
  - Job/contract history, ratings, completion and dispute rate.  
  - Sapiens credentials and PoV events.  
  - Library contributions and Forge artifact adoption.

Events:

- `JobPosted`, `ApplicationSubmitted`, `ContractCreated`, `MilestonePaid`, `DisputeResolved`.  
- `ArtifactPublished`, `ArtifactInstalled`, `ArtifactDeprecated`.  
- `ReputationUpdated`, `PoVAwarded`.

These emit to Kafka and feed Mint & Pay, Reputation, and Governance systems.

### 3.4 Incubator (BuildSpaces → Market & Funding)

Incubator sits at the boundary between **BuildSpaces**, **Marketplace**, **Forge**, and **Enterprise/Investors**:

- Takes founders and builds originating in BuildSpaces/Ascend and formalizes them into **ventures**.  
- Helps founders with registration, compliance, business modeling, and go-to-market.  
- Connects ventures to internal and external capital and customers.

Core entities (conceptual):  

- `IncubatorCohort`, `Venture`, `FounderProfile`, `MentorProfile`.  
- `Milestone` (incubator-specific), `FundingRound`, `RiskProfile`.  
- `InvestorProfile`, `InvestorInterest`, `TermSheetStub`.  

Key flows:  

- **BuildSpaces → Incubator**: a founder submits a BuildSpace or project; Azora captures blueprint, repos, metrics, and PoV as an incubator application.  
- **Incubator → JobSpaces**: mature ventures publish jobs/tasks and engagements into JobSpaces.  
- **Incubator → Forge**: ventures publish their agents, extensions, and templates as Forge artifacts.  
- **Incubator → Investor Portal**: vetted ventures, metrics, and decks are surfaced to investors via investor-facing views.  
- **Incubator ↔ Mint & Pay**: contributions and traction events contribute to PoV and potential access to internal Citadel funding programs.

---

## 4. Runtime Topology & Scaling

- API layer:  
  - Stateless REST/gRPC services for JobSpaces, Forge, Escrow, Reputation.  
  - Behind API Gateway with auth, rate limiting, and per‑tier quotas.
- Data:  
  - Prisma Postgres for marketplace data; Redis for hot feeds and rate limits.  
  - Search index (ES/OpenSearch) for jobs and artifacts.
- Background processing:  
  - Workers for matching, notifications, reputation aggregation, and PoV event emission.
- Scaling:  
  - Job & artifact feeds use caching and pagination.  
  - Escrow and payout flows carefully rate‑limited and audited.

---

## 5. Security, Compliance, and Ethics

- **Identity & KYC** (as needed):  
  - Optionally require verified identity for certain job types (e.g., regulated sectors).  
  - Integrate with external KYC providers for enterprise clients.
- **Fraud & abuse prevention**:  
  - Detect fake jobs, spam, and collusion (e.g., self‑dealing for PoV or AZR).  
  - Monitor dispute rates, chargebacks, and suspicious transaction patterns.
- **No Mock & Truth over Comfort**:  
  - AI agents used for matching, profile summarization, or proposal help must not fabricate credentials or misrepresent capabilities.  
  - Ethics Monitor tracks misalignment and potential exploitation.
- **Legal & tax**:  
  - Mint & Pay handles jurisdiction‑specific considerations; Marketplace must expose correct metadata (residency, contract type, classification where needed).

---

## 6. PoV, AZR, and Governance Hooks

- Value flows:
  - Successful contracts, milestones, and happy clients increase contributor PoV and reputation.  
  - High‑impact Forge artifacts that see wide use earn PoV and royalties.  
  - Community moderation (flagging bad jobs/artifacts, honest reviews) also rewarded.
- Governance:
  - UbuntuGovernance may be used for high‑impact policy changes (e.g., fee structures, reward formulas, reputation weighting).  
  - Transparent metrics and dashboards for fairness, dispute outcomes, and distribution of PoV.

Bolt items and detailed tasks are captured in `MARKETPLACE-TASKLIST.md` and the master task list.
