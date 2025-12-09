# Azora Research Center – Domain Blueprint (Deep Dive)

> Status: Draft v0.1  
> Linked master docs:  
> - `citadel-dev/MASTER-ARCHITECTURE-BLUEPRINT.md` (Library, AI Family, DevX, Constitutional Core)  
> - `citadel-dev/MASTER-IMPLEMENTATION-TASKLIST.md` (AI-*, LIB-*, SAP-6.*, MP-*, PAY-*, CAI-*, DATA-*, OBS-*)

The **Azora Research Center (ARC)** is *not* just part of the Library. It is a first‑class domain:

- A **research hub** where human researchers work with **research agents** to make new discoveries.  
- A **feeder** of technology and insights into Sapiens, Ascend, Marketplace, Infra, and the Citadel.  
- Closely tied to **intelligence, security, and advancement** functions of Azora.

---

## 1. Mission & Benchmarks

**Mission**: Provide a safe, powerful environment where:

- Researchers can explore ideas, run experiments, and iterate quickly with AI agents.  
- New algorithms, models, tools, and policies for Azora are developed, tested, and hardened.  
- Discoveries and improvements flow back into the Azora stack (Sapiens, Library, DevX, Mint & Pay, Security, Governance).

**Benchmarks**:

- Experience comparable to or exceeding modern ML/DS platforms and research IDEs (notebooks, experiment tracking, MLOps platforms), but:
  - Deeply integrated with Azora domains and PoV.  
  - Tightly governed by Constitutional AI, security, and governance rules.

> Assumption ARC‑A1: ARC focuses initially on *Azora‑relevant* research (AI alignment, tutoring, DevX, governance, infra) rather than arbitrary unrelated science.

---

## 2. C4 Views

### 2.1 System Context

**Actors**:

- **Researcher** (individual or team) – runs projects and experiments, writes papers, prototypes agents and tools.  
- **Azora Teams** (Sapiens, DevX, Security, Marketplace, Mint, Governance) – consume ARC outputs and experiments.  
- **Citadel Intelligence & Security** – uses ARC insights for threat intel, risk models, and policy updates.  
- **External Partners** – universities, labs, companies collaborating on selected projects.

**Systems**:

- **ARC Project & Experiment Platform** – project/workspace management, experiments, datasets.  
- **Research Agents & Orchestration** – specialized agents (research assistant, experiment designer, evaluator) built on AzStudio + AI Family.  
- **Research Lab Environments** – BuildSpaces AI Studio, Maker Lab, and dedicated research rooms.  
- **Tech Transfer Gateways** – pipelines that convert promising research into production features and policies across Azora.

### 2.2 Container View

Key containers (planned unless otherwise existing):

- **Research Center Service** (`services/research-center/`)
  - Manages `ResearchProgram`, `ResearchProject`, `Experiment`, `DatasetRef`, `ResultArtifact`.  
  - Integrates with Sapiens, Library, AI Family, DevX, Mint & Pay, and Governance.

- **Research Agent Orchestrator** (extension of AzStudio)
  - Defines research‑specific skills and plans (literature review, hypothesis generation, experiment design, analysis, robustness checks).  
  - Uses AI Family & Knowledge Ocean as substrate; enforces stricter research policies.

- **Experiment Tracking & Metrics Store**  
  - Records experiment configs, runs, metrics, artifacts (similar to MLflow/W&B but Azora‑native).  
  - Connects to DevX sandboxes and infra.

- **Research Lab Rooms** in BuildSpaces
  - AI Research Lab, Governance Lab, Security Lab, DevX Lab, etc.  
  - Provide tailored environment + tools per research domain.

---

## 3. Domain Model

### 3.1 Core Entities

- `ResearchProgram` – long‑running theme (e.g., AI tutoring quality, PoV fairness, governance UX).  
- `ResearchProject` – scoped piece of work with hypotheses, milestones, and outputs.  
- `Experiment` – specific run configuration (model, dataset, prompt, hyperparameters, environment).  
- `ExperimentRun` – actual execution instance with metrics and logs.  
- `DatasetRef` – reference to Library/Storage datasets + policies.  
- `ResultArtifact` – outputs (models, notebooks, code branches, policies, dashboards, papers).

Relationships:

- Program → many Projects; Project → many Experiments; Experiment → many ExperimentRuns.  
- Projects link to upstream and downstream domains (Sapiens module, Library component, DevX feature, policy set).

### 3.2 Events

- `ResearchProjectCreated`, `ResearchProjectUpdated`, `ResearchProjectCompleted`.  
- `ExperimentDefined`, `ExperimentRunStarted`, `ExperimentRunCompleted`, `ExperimentRunFailed`.  
- `FindingPromoted`, `AgentDeployedAsSkill`, `PolicyUpdatedFromResearch`.

Events feed: PoV Processor, DevX pipelines, Governance & Security dashboards.

---

## 4. Runtime Topology & Scaling

- **Control plane (Research Center Service)**:  
  - API for programs, projects, experiments, datasets, and results.  
  - Relational DB for metadata; object storage for artifacts.

- **Execution plane (Labs & Sandboxes)**:  
  - BuildSpaces rooms tied to Ascend + Agent Execution + GPU/CPU resources.  
  - Queues for experiment runs; scaling via Kubernetes; quotas per project/org.

- **AI substrate connection**:  
  - Direct integration with AI Family & Knowledge Ocean for research tasks.  
  - Strong separation between *research* models/experiments and *production* models, with explicit promotion gates.

---

## 5. Flows & Tech Transfer

- **Research workflow** example:
  1. Researcher creates `ResearchProject` in ARC UI or API.  
  2. Research agents propose related literature and datasets (through Library + Knowledge Ocean).  
  3. Researcher and agents co‑design experiments; Experiments and ExperimentRuns recorded.  
  4. Results analyzed, robustness checked; Research agent drafts findings and candidate code/policy patches.  
  5. Findings submitted to **Tech Transfer Gateway**:  
     - For Sapiens: improved tutoring prompts, curricula, assessment models.  
     - For Library: new ingestion or RAG strategies.  
     - For DevX: new scaffolds, analyzers, optimization passes.  
     - For Security/Governance: new rules, detectors, policies.

- **Tech transfer**:  
  - Uses AzStudio/Ascend for code changes and pipeline updates.  
  - Uses Governance (UbuntuGovernance + policy‑as‑code) for policy changes.  
  - Tracks which research outputs have been adopted into production and with what impact.

---

## 6. Safety, Ethics & Security in ARC

- **Experiment permissions & risk levels**:  
  - Classified experiments (e.g., security/adversarial AI) require additional approvals.  
  - High‑risk research may run in isolated infra with extra monitoring.

- **Data governance**:  
  - `DatasetRef` carries licensing, PII classification, allowed uses.  
  - Policy engine enforces data access per project and experiment.

- **Research agent constraints**:  
  - Stricter No Mock and truth requirements for research assistants.  
  - No unapproved autonomous deployments; research agents must go through AzStudio and Governance to affect production.

- **Security tie‑in**:  
  - Security research results (e.g., attack paths, vulnerabilities) integrated into Security tools and policies after review.  
  - Sensitive findings handled via need‑to‑know controls and dedicated runbooks.

---

## 7. Observability & Metrics

ARC‑specific metrics:

- Research throughput: number of projects, experiments, runs, and their success rates.  
- Time‑to‑impact: time from project start to production adoption.  
- Safety incidents: experimental runs that violated or nearly violated policies.  
- Tech transfer success: number and impact of adopted findings across domains.

Dashboards combine ARC metrics with domain metrics (Sapiens performance, DevX improvements, PoV changes) to show ecosystem advancement.

---

## 8. Bolt Register & Unknowns (ARC)

- **ARC‑B1**: Exact boundaries between research infra and production infra still fuzzy; must prevent research workloads from impacting production SLOs.  
- **ARC‑B2**: Policy & approval process for high‑risk experiments (security, governance, social impact) not yet codified.  
- **ARC‑B3**: How to measure and attribute research impact (PoV, AZR rewards, recognition) across multi‑team work requires design.  
- **ARC‑B4**: Degree of external collaboration (universities/partners) and associated legal/compliance surface unknown.  
- **ARC‑B5**: Balance between autonomy of research agents and human oversight under Constitutional AI.

These are addressed via ARC-* tasks in `RESEARCH-CENTER-TASKLIST.md` and cross‑referenced master tasks.
