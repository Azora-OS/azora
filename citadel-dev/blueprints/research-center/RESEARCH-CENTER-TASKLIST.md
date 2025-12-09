# Azora Research Center – Domain Implementation Task List

> Status: Draft v0.1 (deep dive)  
> Linked master task list: `citadel-dev/MASTER-IMPLEMENTATION-TASKLIST.md` (AI-*, LIB-*, SAP-6.*, MP-*, PAY-*, CAI-*, DATA-*, OBS-*)

This breaks the ARC domain into concrete tasks for projects, experiments, research agents, and tech transfer.

---

## 1. Research Center Core Service

- [ ] **ARC-1.1: Research Center Service Skeleton & Schema**  
  **Objective**: Scaffold `services/research-center/` and define core Prisma models (`ResearchProgram`, `ResearchProject`, `Experiment`, `ExperimentRun`, `DatasetRef`, `ResultArtifact`).  
  **Dependencies**: Library `Work`/`Dataset` models; Sapiens research tooling (SAP-6.1); data catalog.  
  **Steps**:  
  - Design schema as per ARC blueprint §3.1.  
  - Add Prisma models and migrations; link to Library datasets and Sapiens entities where needed.  
  - Set up service skeleton with auth, logging, and metrics.  
  **Acceptance criteria**:  
  - Can create and manage basic programs, projects, and experiments.  
  - DB schema stable and documented.  
  **Verification**:  
  - Unit tests; migration tests; seed data tests.  
  **Artifacts**: Models, API docs, runbooks.  
  **Ownership**: Research Platform + Data squads.  
  **Effort**: M  
  **Priority**: P1  
  **Repo paths**: `services/research-center/`, `prisma/schema.prisma`.

- [ ] **ARC-1.2: Basic ARC UI in BuildSpaces**  
  **Objective**: Provide initial ARC views in BuildSpaces (programs, projects, experiments).  
  **Dependencies**: ARC-1.1; BuildSpaces frontend; design system.  
  **Steps**:  
  - Build pages for listing programs/projects and viewing experiment status.  
  - Integrate with Research Lab rooms as entry points.  
  - Surface key metrics per project (runs, status, last activity).  
  **Acceptance criteria**:  
  - Researchers can see and navigate their ARC work from BuildSpaces.  
  - Permissions align with auth roles.  
  **Verification**:  
  - UI tests; manual UX review with pilot users.  
  **Artifacts**: UI components, routes, docs.  
  **Ownership**: Research Platform + BuildSpaces squads.  
  **Effort**: M  
  **Priority**: P2  
  **Repo paths**: `apps/azora-buildspaces/`, `services/research-center/`.

---

## 2. Research Agents & Orchestration

- [ ] **ARC-2.1: Research Agent Skill Pack**  
  **Objective**: Define and implement a set of core research skills (literature review, hypothesis generation, experiment design, result summarization) in AzStudio.  
  **Dependencies**: AzStudio skill registry (AZST-DX-2); AI Family; Library; Knowledge Ocean.  
  **Steps**:  
  - Specify research skills and their required inputs/outputs.  
  - Implement skill handlers that call Library search, Knowledge Ocean retriever, and experiment templates.  
  - Register skills in AzStudio and tag them as research‑only where needed.  
  **Acceptance criteria**:  
  - Researcher can ask Elara/agents to execute coherent research workflows.  
  - All skill usage logged and reviewable.  
  **Verification**:  
  - Scenario tests for literature review → hypothesis → experiment scaffold.  
  **Artifacts**: Skill definitions, handlers, docs.  
  **Ownership**: Research Platform + AzStudio squads.  
  **Effort**: M  
  **Priority**: P1  
  **Repo paths**: `services/azstudio-orchestrator/`, `services/ai-family-api/`, `services/knowledge-ocean/`.

- [ ] **ARC-2.2: Research Agent Safety Policies**  
  **Objective**: Add ARC‑specific safety/policy constraints for research agents.  
  **Dependencies**: CAI-2.1; Ethics Monitor; Security team.  
  **Steps**:  
  - Define policy set for research agents (forbidden domains, escalation rules, disclosure requirements).  
  - Integrate with AI Ethics Monitor and policy engine.  
  - Ensure research agents cannot unilaterally deploy changes or access restricted data.  
  **Acceptance criteria**:  
  - Research agent actions that touch production or sensitive assets must go through human review.  
  - Violations and near‑misses logged and alerting.  
  **Verification**:  
  - Red‑team research agent flows; policy tests.  
  **Artifacts**: Policy files, test cases, dashboards.  
  **Ownership**: Research Platform + Constitutional AI + Security squads.  
  **Effort**: L  
  **Priority**: P1  
  **Repo paths**: `services/ai-ethics-monitor/`, `services/azstudio-orchestrator/`, `SECURITY/`.

---

## 3. Experiment Tracking & Metrics

- [ ] **ARC-3.1: ExperimentRun Store & Metrics**  
  **Objective**: Implement ExperimentRun persistence and metrics tracking for ARC experiments.  
  **Dependencies**: ARC-1.1; AI Evolution Engine; DevX infra.  
  **Steps**:  
  - Add ExperimentRun model and API to store config, metrics, and references to artifacts.  
  - Integrate with AI Evolution Engine where relevant.  
  - Expose APIs for dashboards and downstream analysis.  
  **Acceptance criteria**:  
  - All experiments and runs track configuration and results; reproducible.  
  - Key metrics queryable per project and per domain.  
  **Verification**:  
  - Tests for reproducibility with given configs; data completeness checks.  
  **Artifacts**: Schema, APIs, dashboards.  
  **Ownership**: Research Platform + AI Platform squads.  
  **Effort**: M  
  **Priority**: P2  
  **Repo paths**: `services/research-center/`, `services/ai-evolution-engine/`.

---

## 4. Lab Environments & Sandboxes

- [ ] **ARC-4.1: Research Lab Rooms in BuildSpaces**  
  **Objective**: Configure specialized BuildSpaces rooms for research (AI Lab, Governance Lab, Security Lab).  
  **Dependencies**: BS-DX-2; Agent Execution; Security policies.  
  **Steps**:  
  - Define room types and default tools/agents for each lab.  
  - Integrate with Research Center projects; one‑click open from ARC UI.  
  - Apply stricter resource and safety policies than general rooms.  
  **Acceptance criteria**:  
  - Researchers can work in lab rooms with correct tools and guardrails.  
  - High‑risk labs isolated and monitored.  
  **Verification**:  
  - E2E tests; security reviews.  
  **Artifacts**: Room configs, docs, runbooks.  
  **Ownership**: BuildSpaces + Research Platform + Security squads.  
  **Effort**: L  
  **Priority**: P2  
  **Repo paths**: `apps/azora-buildspaces/`, `services/buildspaces-orchestrator/`, `services/agent-execution/`.

---

## 5. Tech Transfer Gateways

- [ ] **ARC-5.1: Sapiens & Library Tech Transfer Flow**  
  **Objective**: Formalize how research improvements to tutoring, curricula, RAG, and retrieval are proposed, evaluated, and rolled into Sapiens & Library.  
  **Dependencies**: Sapiens & Library teams; AI Evolution Engine; Governance.  
  **Steps**:  
  - Define a `FindingPromoted` event and associated metadata (domain, effect size, risks).  
  - Implement review pipelines for Sapiens and Library (experiments → PRs → policy decisions).  
  - Track adopted vs rejected findings and reasons.  
  **Acceptance criteria**:  
  - No research change reaches production without traceable review and validation.  
  - Time‑to‑adoption and effect size metrics measured.  
  **Verification**:  
  - Scenario tests; governance review of sample promotions.  
  **Artifacts**: Workflow definitions, dashboards, docs.  
  **Ownership**: Research Platform + Sapiens + Library + Governance squads.  
  **Effort**: M  
  **Priority**: P2  
  **Repo paths**: `services/research-center/`, `services/ai-evolution-engine/`, `services/ai-ethics-monitor/`.

- [ ] **ARC-5.2: Security & Governance Tech Transfer Flow**  
  **Objective**: Formalize how security and governance research results become policies, detectors, and tools.  
  **Dependencies**: Security stack; Governance; Mint & Pay; Marketplace.  
  **Steps**:  
  - Extend `FindingPromoted` for security/governance domains.  
  - Connect to policy repos and Security tools (DLP, threat detection, fraud engines).  
  - Ensure high‑risk changes require multi‑party approval (e.g., via UbuntuGovernance).  
  **Acceptance criteria**:  
  - Clear pipeline from finding to production security/gov changes.  
  - Audit logs for all policy changes and tool rollouts.  
  **Verification**:  
  - Simulation of security findings; change management reviews.  
  **Artifacts**: Workflows, policies, dashboards.  
  **Ownership**: Research Platform + Security + Governance squads.  
  **Effort**: L  
  **Priority**: P2  
  **Repo paths**: `services/research-center/`, `SECURITY/`, `blockchain/UbuntuGovernance.sol`.

---

## 6. PoV & Recognition

- [ ] **ARC-6.1: Research PoV & Rewards**  
  **Objective**: Map research contributions (projects, experiments, findings, reviews) into PoV and AZR rewards.  
  **Dependencies**: PoV processor; Mint & Pay; governance; Sapiens/Library/Marketplace linkages.  
  **Steps**:  
  - Define contribution types and scoring for research work.  
  - Emit PoV events from ARC and ensure they are processed safely by PoV processor.  
  - Expose contributor dashboards with their research impact and rewards.  
  **Acceptance criteria**:  
  - Meaningful, non‑gameable PoV and rewards for research contributions.  
  - Research impact visible and valued by the ecosystem.  
  **Verification**:  
  - Simulated contribution flows; gaming and collusion tests.  
  **Artifacts**: PoV mappings, dashboards, docs.  
  **Ownership**: Research Platform + Mint + Governance squads.  
  **Effort**: M  
  **Priority**: P2  
  **Repo paths**: `services/research-center/`, `services/pov-processor/`, `services/mint-pay/`.

---

## 7. Observability

- [ ] **ARC-7.1: ARC Observability Pack**  
  **Objective**: Build dashboards and alerts to track ARC throughput, safety, and impact.  
  **Dependencies**: OBS-1, OBS-2; ARC metrics.  
  **Steps**:  
  - Instrument Research Center service and labs with metrics/traces.  
  - Build dashboards for program/project/experiment counts, run success rates, time‑to‑impact.  
  - Add alerts for policy violations, unusual experiment patterns, and lagging tech transfer.  
  **Acceptance criteria**:  
  - Leadership and research leads can see ARC health and value at a glance.  
  - SLOs and error budgets clearly defined for critical research processes.  
  **Verification**:  
  - Synthetic incidents; runbook tests.  
  **Artifacts**: Dashboards, alert rules, runbooks.  
  **Ownership**: Research Platform + SRE + Governance squads.  
  **Effort**: M  
  **Priority**: P2  
  **Repo paths**: `monitoring/`, `services/research-center/`.

---

## 8. Activation Roadmap – Azora Research Center

- **Phase 1**: Core service & basic UI – ARC-1.1, ARC-1.2.  
- **Phase 2**: Research agents & skills – ARC-2.1, ARC-2.2 + AzStudio integration.  
- **Phase 3**: Experiment tracking – ARC-3.1 and AI Evolution integration.  
- **Phase 4**: Labs – ARC-4.1.  
- **Phase 5**: Tech transfer & PoV – ARC-5.1, ARC-5.2, ARC-6.1.  
- **Phase 6**: Observability & governance – ARC-7.1 + CAI/SEC/OBS policies.
