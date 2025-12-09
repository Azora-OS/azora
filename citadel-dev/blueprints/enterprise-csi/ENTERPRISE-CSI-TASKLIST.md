# Azora Enterprise & Citadel State Intelligence (CSI) – Task List v0.1

## 0. Scope & Conventions

This tasklist covers **Enterprise Suite** and **Citadel State Intelligence (CSI)**, aligned to the corresponding blueprint.

Each task block includes:

- **Objective**
- **Dependencies**
- **Steps**
- **Acceptance Criteria**
- **Verification**
- **Artifacts**
- **Ownership** (room/agent)
- **Effort** (S/M/L)
- **Priority** (P1–P4)
- **Repo paths**

---

## 1. Domain Definition & Data Contracts

### ENT-01 – Enterprise & CSI domain charter and boundaries

- **Objective**: Formalize Enterprise & CSI domain scope, modules, and cross-domain dependencies.
- **Dependencies**: Master Architecture Blueprint; existing docs under `docs/architecture/`.
- **Steps**:
  - Draft Enterprise & CSI domain charter doc.
  - Map bounded contexts (Enterprise Ops, Risk & Compliance, CSI Governance, CSI StateAudit).
  - Enumerate cross-domain data contracts (Mint-Pay, Knowledge Ocean, AI Family).
- **Acceptance Criteria**:
  - Charter approved by product, architecture, and constitutional stakeholders.
- **Verification**:
  - Review checklist; cross-link in master blueprint.
- **Artifacts**:
  - `citadel-dev/blueprints/enterprise-csi/ENTERPRISE-CSI-BLUEPRINT.md` (updated sections).
- **Ownership**: BuildSpaces – **Innovation Theater** (strategy), **Code Chamber** (architecture).
- **Effort**: S
- **Priority**: P1
- **Repo paths**: `citadel-dev/blueprints/enterprise-csi/`, `docs/architecture/`.

### ENT-02 – Enterprise & CSI canonical data contract catalog

- **Objective**: Catalog and version all data contracts across Enterprise & CSI.
- **Dependencies**: ENT-01.
- **Steps**:
  - Inventory existing schemas (Prisma, SQL, external APIs).
  - Design canonical schemas for shipments, sensors, budgets, spend, KPIs, cases.
  - Define versioning and change management.
- **Acceptance Criteria**:
  - Contract catalog published; referenced by at least one service.
- **Verification**:
  - Linting/CI check for contract references.
- **Artifacts**:
  - `docs/api/enterprise-contracts.md`.
- **Ownership**: BuildSpaces – **Maker Lab** (schema design).
- **Effort**: M
- **Priority**: P1
- **Repo paths**: `docs/api/`, `prisma/`.

---

## 2. Enterprise Integration Hub

### ENT-INTEG-01 – Integration Hub service skeleton

- **Objective**: Create the base Integration Hub service for enterprise and government connectors.
- **Dependencies**: ENT-01, ENT-02.
- **Steps**:
  - Scaffold `services/enterprise-integration-hub/` with Node/TypeScript microservice template.
  - Implement tenant-aware routing and basic health endpoints.
  - Integrate with Identity & Access for authN/authZ.
- **Acceptance Criteria**:
  - Service deployed to dev; health checks pass; can authenticate tenants.
- **Verification**:
  - Unit tests; integration tests via CI pipeline.
- **Artifacts**:
  - Service code, helm chart or infra scripts; runbook.
- **Ownership**: BuildSpaces – **Code Chamber**.
- **Effort**: M
- **Priority**: P1
- **Repo paths**: `services/enterprise-integration-hub/`, `infra/`.

### ENT-INTEG-02 – ERP & logistics connector

- **Objective**: Implement connector for core ERP/logistics systems.
- **Dependencies**: ENT-INTEG-01.
- **Steps**:
  - Define connector abstraction (polling, webhooks, file drops).
  - Implement initial ERP/logistics connector with mapping to canonical schemas.
  - Handle retries, backoff, and error handling.
- **Acceptance Criteria**:
  - End-to-end ingestion from sample ERP instance into lakehouse.
- **Verification**:
  - E2E tests with synthetic data.
- **Artifacts**:
  - Connector code; mapping docs.
- **Ownership**: BuildSpaces – **Maker Lab**.
- **Effort**: M
- **Priority**: P1
- **Repo paths**: `services/enterprise-integration-hub/`, `docs/api/`.

---

## 3. Logistics & Cold-chain Guardian

### ENT-LOG-01 – Cold-chain data model & ingestion

- **Objective**: Model shipments, sensors, and events for cold-chain scenarios.
- **Dependencies**: ENT-02, ENT-INTEG-02.
- **Steps**:
  - Define schemas for `Shipment`, `Stop`, `Sensor`, `TemperatureEvent`.
  - Implement ingestion pipeline from IoT sensors into time-series DB.
- **Acceptance Criteria**:
  - Real-time ingestion for sample routes; events queryable by shipment.
- **Verification**:
  - Load tests with realistic sensor volumes; data quality checks.
- **Artifacts**:
  - Prisma models, SQL migrations, ingestion jobs.
- **Ownership**: BuildSpaces – **Maker Lab**, **Deep Focus**.
- **Effort**: M
- **Priority**: P1
- **Repo paths**: `services/enterprise-logistics/`, `prisma/`.

### ENT-LOG-02 – Cold-chain rules engine & alerting

- **Objective**: Implement cold-chain rules engine and alert workflows.
- **Dependencies**: ENT-LOG-01.
- **Steps**:
  - Implement configurable rules for temperature and duration thresholds.
  - Integrate with alerting (email, SMS, in-app) via notifications service.
  - Expose console views in `azora-enterprise-suite`.
- **Acceptance Criteria**:
  - Alerts triggered in dev for threshold breaches; operators can acknowledge.
- **Verification**:
  - Unit tests for rules; end-to-end alert flow tests.
- **Artifacts**:
  - Rules engine, UI components, runbook.
- **Ownership**: BuildSpaces – **Code Chamber**, **Collaboration Pod**.
- **Effort**: M
- **Priority**: P1
- **Repo paths**: `services/enterprise-logistics/`, `apps/azora-enterprise-suite/`.

---

## 4. Farm Guardian

### ENT-FARM-01 – Farm telemetry & neighbourhood intelligence

- **Objective**: Build early Farm Guardian capabilities for farms and communities.
- **Dependencies**: ENT-INTEG-01, AI Family.
- **Steps**:
  - Define schemas for `Farm`, `Field`, `LivestockHerd`, `FarmEvent`.
  - Ingest farm telemetry, weather, and basic health indicators.
  - Implement neighbourhood view to detect clustering of issues.
- **Acceptance Criteria**:
  - Dashboards showing farm clusters and alerts.
- **Verification**:
  - Synthetic scenario tests for disease spread and contamination events.
- **Artifacts**:
  - Farm models, ingestion jobs, UI dashboards.
- **Ownership**: BuildSpaces – **Innovation Theater**, **Maker Lab**.
- **Effort**: M
- **Priority**: P2
- **Repo paths**: `services/enterprise-farm-guardian/`, `apps/azora-enterprise-suite/`.

---

## 5. Document Intelligence

### ENT-DOC-01 – Document ingestion & OCR pipeline

- **Objective**: Create a unified document ingestion and OCR pipeline for Enterprise & CSI.
- **Dependencies**: ENT-INTEG-01, Knowledge Ocean, AI Family.
- **Steps**:
  - Implement ingestion endpoints for documents (upload, SFTP, APIs).
  - Integrate OCR engine and text extraction.
  - Store documents and metadata in a secure document store.
- **Acceptance Criteria**:
  - Sample documents process successfully; text is searchable.
- **Verification**:
  - Unit tests; performance tests on large documents.
- **Artifacts**:
  - Ingestion jobs, storage config, runbook.
- **Ownership**: BuildSpaces – **Code Chamber**, **AI Studio**.
- **Effort**: M
- **Priority**: P1
- **Repo paths**: `services/enterprise-doc-intel/`.

### ENT-DOC-02 – Document classification, extraction & workflows

- **Objective**: Build document classification and extraction capabilities with workflows.
- **Dependencies**: ENT-DOC-01.
- **Steps**:
  - Train models for document type classification.
  - Implement extraction templates for core document types.
  - Wire to workflows and approvals in Enterprise console.
- **Acceptance Criteria**:
  - Accuracy targets met on sample document sets.
- **Verification**:
  - Evaluation harness; CI gates for model updates.
- **Artifacts**:
  - Model registry entries, workflow configurations.
- **Ownership**: BuildSpaces – **AI Studio**.
- **Effort**: L
- **Priority**: P2
- **Repo paths**: `services/enterprise-doc-intel/`, `apps/azora-enterprise-suite/`.

---

## 6. CSI Data Platform

### CSI-DATA-01 – CSI sovereign data environment design

- **Objective**: Design CSI sovereign deployments and data boundaries.
- **Dependencies**: ENT-01, security architecture.
- **Steps**:
  - Define sovereign deployment patterns (cloud, air-gapped).
  - Specify network, key management, and access requirements.
  - Document data residency and categorization for government data types.
- **Acceptance Criteria**:
  - Architecture reviewed with security and compliance stakeholders.
- **Verification**:
  - Threat model; STRIDE review; security design sign-off.
- **Artifacts**:
  - `docs/architecture/csi-sovereign-topology.md`.
- **Ownership**: BuildSpaces – **Deep Focus**.
- **Effort**: M
- **Priority**: P1
- **Repo paths**: `docs/architecture/`.

### CSI-DATA-02 – Government data connectors (treasury, procurement)

- **Objective**: Implement core CSI connectors for treasury and procurement data.
- **Dependencies**: CSI-DATA-01, ENT-INTEG-01.
- **Steps**:
  - Map treasury and procurement schemas to canonical budgets and spend.
  - Implement ingestion pipeline and quality checks.
- **Acceptance Criteria**:
  - Sample treasury and procurement data ingested and queryable.
- **Verification**:
  - Data quality reports; E2E tests.
- **Artifacts**:
  - Connector code, mapping specs.
- **Ownership**: BuildSpaces – **Maker Lab**.
- **Effort**: M
- **Priority**: P1
- **Repo paths**: `services/enterprise-integration-hub/`, `docs/api/`.

---

## 7. CSI StateAudit Module

### CSI-AUD-01 – Budget & spend analytics MVP

- **Objective**: Provide basic budget vs spend analytics with anomaly detection.
- **Dependencies**: CSI-DATA-02.
- **Steps**:
  - Build models for budgets, spend transactions, and GL accounts.
  - Implement baseline anomaly detection (e.g., unusual amounts, vendors, timings).
  - Expose dashboards for treasury and oversight.
- **Acceptance Criteria**:
  - Sample anomalies detected on synthetic data; dashboards usable.
- **Verification**:
  - Scenario-based tests; manual review of flagged cases.
- **Artifacts**:
  - Service code, dashboards, documentation.
- **Ownership**: BuildSpaces – **Innovation Theater**, **AI Studio**.
- **Effort**: L
- **Priority**: P1
- **Repo paths**: `services/csi-stateaudit/`, `apps/azora-enterprise-suite/`.

### CSI-AUD-02 – Case management & evidence workflow

- **Objective**: Implement case management for audit findings and investigations.
- **Dependencies**: CSI-AUD-01.
- **Steps**:
  - Define entities for `AuditCase`, `EvidenceItem`, `Finding`.
  - Build case management UI inside CSI console.
  - Integrate with document intelligence for evidence handling.
- **Acceptance Criteria**:
  - Investigators can open, update, and close cases; evidence is tracked.
- **Verification**:
  - UX tests; data integrity tests.
- **Artifacts**:
  - Case management UI, schemas, runbook.
- **Ownership**: BuildSpaces – **Collaboration Pod**.
- **Effort**: M
- **Priority**: P2
- **Repo paths**: `services/csi-stateaudit/`, `apps/azora-enterprise-suite/`.

---

## 8. CSI Decision Advisor

### CSI-DEC-01 – Policy scenario modeling framework

- **Objective**: Provide a framework for modeling policy scenarios.
- **Dependencies**: CSI-DATA-01, Knowledge Ocean, AI Family.
- **Steps**:
  - Define model interfaces for macro and sectoral simulations.
  - Implement an initial scenario model (e.g., budget allocation in one sector).
  - Expose API and simple UI in CSI console.
- **Acceptance Criteria**:
  - At least one scenario type can be defined and simulated via UI.
- **Verification**:
  - Compare outputs against historical data and expert expectations.
- **Artifacts**:
  - Scenario engine, API docs, UI components.
- **Ownership**: BuildSpaces – **Innovation Theater**, **AI Studio**.
- **Effort**: L
- **Priority**: P2
- **Repo paths**: `services/csi-decision-intel/`, `apps/azora-enterprise-suite/`.

### CSI-DEC-02 – Executive co-pilot interface

- **Objective**: Build a safe, explainable interface for executive decision support.
- **Dependencies**: CSI-DEC-01, AI Ethics Monitor.
- **Steps**:
  - Implement conversational interface constrained to policy-relevant actions.
  - Integrate with AI Ethics Monitor and UbuntuGovernance for guardrails.
  - Provide explanation views for recommendations.
- **Acceptance Criteria**:
  - Prototype demo for executive stakeholders; ethics checks pass.
- **Verification**:
  - Red-team exercises; constitutional alignment tests.
- **Artifacts**:
  - Co-pilot UI, policies, evaluation harness.
- **Ownership**: BuildSpaces – **AI Studio**, **Innovation Theater**.
- **Effort**: L
- **Priority**: P2
- **Repo paths**: `apps/azora-enterprise-suite/`, `services/csi-decision-intel/`.

---

## 9. CSI Service Delivery Optimizer

### CSI-SERV-01 – Sector KPI framework

- **Objective**: Define KPI frameworks for key public services.
- **Dependencies**: CSI-DATA-01.
- **Steps**:
  - Identify core KPIs per sector (health, education, agriculture, transport, utilities).
  - Define data sources and computation methods.
  - Implement KPI storage and time-series calculations.
- **Acceptance Criteria**:
  - KPIs for at least two sectors visible in CSI console.
- **Verification**:
  - Validate KPI values with sample data and experts.
- **Artifacts**:
  - KPI model definitions, dashboards.
- **Ownership**: BuildSpaces – **Innovation Theater**.
- **Effort**: M
- **Priority**: P2
- **Repo paths**: `services/csi-service-optimizer/`, `apps/azora-enterprise-suite/`.

---

## 10. CSI Crisis & Resilience

### CSI-CRI-01 – Early warning and event ingestion

- **Objective**: Ingest external signals for crises (weather, epidemics, infrastructure failures).
- **Dependencies**: CSI-DATA-01, external APIs.
- **Steps**:
  - Identify and integrate with key external data sources.
  - Normalize and store events in time-series and document stores.
- **Acceptance Criteria**:
  - External events visible and filterable in CSI console.
- **Verification**:
  - Backfill tests using historical crises.
- **Artifacts**:
  - Ingestion services, event schemas.
- **Ownership**: BuildSpaces – **Maker Lab**.
- **Effort**: M
- **Priority**: P3
- **Repo paths**: `services/csi-crisis-intel/`.

---

## 11. Risk, Compliance & Mint/Fort Knox Integration

### ENT-MINT-01 – Enterprise & CSI billing and PoV hooks

- **Objective**: Integrate Enterprise & CSI usage with Mint & Fort Knox for billing and PoV.
- **Dependencies**: Mint-Pay blueprint; ledger service.
- **Steps**:
  - Define billable events and PoV-worthy contributions.
  - Implement event emissions to ledger and rewards router.
  - Build reporting views in `azora-finance` / `azora-mint`.
- **Acceptance Criteria**:
  - Usage events correctly reflected in PoV and billing reports.
- **Verification**:
  - Reconciliation tests between usage logs and ledger entries.
- **Artifacts**:
  - Event schemas, billing rules, dashboards.
- **Ownership**: BuildSpaces – **Code Chamber**, **Innovation Theater**.
- **Effort**: M
- **Priority**: P2
- **Repo paths**: `services/enterprise-*`, `services/mint-ledger/`, `apps/azora-mint/`, `apps/azora-finance/`.

### ENT-RISK-01 – Risk & compliance console integration

- **Objective**: Wire risk & compliance metrics into `azora-compliance` and Enterprise console.
- **Dependencies**: ENT-LOG-02, CSI-AUD-01.
- **Steps**:
  - Define shared risk vocabulary and severity levels.
  - Implement risk views and filters by tenant, sector, and government.
- **Acceptance Criteria**:
  - Unified risk view across Enterprise & CSI in consoles.
- **Verification**:
  - UI tests; audit of risk aggregation logic.
- **Artifacts**:
  - UI components, risk aggregation jobs.
- **Ownership**: BuildSpaces – **Collaboration Pod**.
- **Effort**: M
- **Priority**: P2
- **Repo paths**: `apps/azora-compliance/`, `apps/azora-enterprise-suite/`.

---

## 12. Observability & SRE

### ENT-OBS-01 – Enterprise & CSI observability baselines

- **Objective**: Define and implement baseline observability for Enterprise & CSI.
- **Dependencies**: observability stack.
- **Steps**:
  - Define log, metric, and trace standards.
  - Implement service-level dashboards for key services.
  - Define SLOs and error budgets per critical endpoint.
- **Acceptance Criteria**:
  - Dashboards in Grafana; alerts configured for P1 services.
- **Verification**:
  - Chaos tests; alert review.
- **Artifacts**:
  - Dashboard configs, alert rules, runbooks.
- **Ownership**: BuildSpaces – **Deep Focus**.
- **Effort**: M
- **Priority**: P1
- **Repo paths**: `monitoring/`, `services/enterprise-*`, `services/csi-*`.

---

## 13. DevX & Templates

### ENT-DEVX-01 – BuildSpaces templates for Enterprise & CSI modules

- **Objective**: Provide BuildSpaces templates for new Enterprise/CSI automations.
- **Dependencies**: Enterprise & CSI architecture.
- **Steps**:
  - Design templates including service scaffolds, connectors, AI Orchestrator wiring, and observability.
  - Publish templates in BuildSpaces UI.
- **Acceptance Criteria**:
  - At least one new module built using templates; feedback collected.
- **Verification**:
  - Template usage analytics; user feedback sessions.
- **Artifacts**:
  - Templates, docs, sample modules.
- **Ownership**: BuildSpaces – **Code Chamber**, **Maker Lab**.
- **Effort**: M
- **Priority**: P2
- **Repo paths**: `apps/azora-buildspaces/`, `scripts/`, `citadel-dev/blueprints/enterprise-csi/`.

---

## 14. Activation Roadmap (30/60/90)

### ENT-ACT-30 – First 30 days

- Focus on **architecture, data contracts, and initial pipelines**:
  - ENT-01, ENT-02, ENT-INTEG-01, ENT-DOC-01, CSI-DATA-01.

### ENT-ACT-60 – 30–60 days

- Deliver **logistics, cold-chain, and StateAudit MVPs**:
  - ENT-LOG-01, ENT-LOG-02, CSI-DATA-02, CSI-AUD-01.

### ENT-ACT-90 – 60–90 days

- Expand into **Farm Guardian, policy scenarios, and observability**:
  - ENT-FARM-01, CSI-DEC-01, ENT-OBS-01, ENT-DEVX-01.

Each activation phase must meet security, observability, and constitutional checks before advancing.
