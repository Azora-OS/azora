# AzStudio, Ascend & BuildSpaces – DevX & Orchestration Blueprint (Deep Dive)

> Status: Draft v0.1  
> Linked master docs:  
> - `citadel-dev/MASTER-ARCHITECTURE-BLUEPRINT.md` (BuildSpaces, Ascend, AzStudio)  
> - `citadel-dev/MASTER-IMPLEMENTATION-TASKLIST.md` (ASC-*, AZST-*, BS-*, OBS-*, INF-*)

This blueprint covers the **developer & maker surface** of Azora:

- **AzStudio** – orchestration brain and skill registry.  
- **Ascend Workbench** – IDE/workbench for code, data, and deployment.  
- **BuildSpaces** – spatial/room UX (Code Chamber, AI Studio, Maker Lab, etc.) where Sapiens, Marketplace, Library, Research, and DevX meet.

---

## 1. Mission & Benchmarks

**Mission**: Provide a DevX environment where:

- Azora’s agents (Elara + family) and tools make builders radically more productive.  
- Every serious change can be **planned, executed, verified, and shipped** from within Azora.  
- BuildSpaces provide shared context for individuals, teams, cohorts, and research groups.

**Benchmarks**:

- Coding & DevX at least as smooth as **VS Code + GitHub Copilot + Codespaces + modern CI/CD**.  
- Multi‑user experience comparable to or better than collab tools (e.g., Live Share, Replit, Figma for dev).  
- Orchestration similar to high‑end agent platforms, but deeply embedded in Azora domains and Constitution.

---

## 2. C4 Views

### 2.1 System Context

**Actors**:

- **Developer / Builder** – builds code, data pipelines, agents, blueprints, courses.  
- **Educator / Mentor** – runs workshops, code reviews, live debugging sessions.  
- **Researcher** – prototypes algorithms, analysis pipelines, models.  
- **Azora Agents** – Elara XO, code agents, infra agents, reviewers.  
- **Enterprise Admins** – configure policies, sandboxes, resource limits.

**Systems**:

- **Ascend IDE & tools**.  
- **AzStudio Orchestrator** (agents, skills, plans).  
- **Agent Execution Service** & sandboxes.  
- **BuildSpaces rooms** hosting DevX experiences.

### 2.2 Container View

Key containers:

- **Ascend Web/Desktop** (`apps/ascend/`, `apps/ascend-demo/`)
  - Editor (Monaco), file explorer, terminals, preview frames, Git integration.  
  - Talks to Agent Execution Service for commands and tests.

- **Ascend VS Code Extension** (`apps/ascend-vscode/`)
  - Surfaces Azora agents and AzStudio orchestration inside VS Code for external devs.

- **AzStudio Orchestrator Service** (`services/azstudio-orchestrator/` – planned)
  - Hosts `AIOrchestrator` (to be refactored), skill registry, task graphs, planning & execution policies.  
  - Integrates with AI Family & Knowledge Ocean, Ethics Monitor, and Dev tools.

- **Agent Execution Service** (`services/agent-execution/` – existing)
  - Runs shell commands, tests, scripts, scaffolding tasks, in locked‑down sandboxes.

- **BuildSpaces Orchestrator** (`services/buildspaces-orchestrator/` – planned)
  - Manages rooms & sessions (including Code Chamber, AI Studio, Maker Lab).  
  - Controls presence, capabilities, and integration with Ascend and AzStudio.

---

## 3. Domain Model

### 3.1 Orchestration & Skills

Core concepts (logical):

- `Skill` – an atomic agent capability; describes inputs/outputs, side‑effects, policies.  
- `Plan` – a DAG or sequence of steps involving Skills, tools, and external services.  
- `TaskRun` – concrete execution of Plan with inputs, context, and logs.

AzStudio Orchestrator maintains:

- Skill Registry: metadata for skills across services (e.g., "run tests", "deploy service", "refactor module", "query LMS").  
- Plan Manager: uses AI and heuristics to break user goals into plans.  
- Execution Manager: dispatches to Agent Execution, services, and external APIs.

### 3.2 DevX Artifacts

- `Workspace` – logical project within Ascend or Code Chamber room.  
- `DevSession` – session binding user(s), workspace, branch, and tools.  
- `Run` – test, build, or deployment run with status and artifacts.

BuildSpaces overlays:

- `Room` – environment type (Code Chamber, AI Studio, Maker Lab, Innovation Theater, etc.).  
- `RoomSession` – binding of participants, workspaces, and current tools/agents.

---

## 4. Runtime Topology & Scaling

- Ascend runs as a web app served per user with server components and backend for:  
  - File VFS, repo operations, diagnostics, AI suggestions.  
- Agent Execution Service and sandboxes:  
  - Containers, VMs, or Firecracker microVMs; per‑user/project isolation.  
  - Resource limits and auto‑teardown.
- BuildSpaces orchestrator:  
  - WebSockets and presence service; optional media service for audio/video.  
  - Integrates with room‑type‑specific services.

---

## 5. Safety, Policy & Governance

- **Execution safety**:  
  - Constrained sandboxes; whitelisted capabilities; secrets via secure channels.  
  - Guardrails preventing destructive operations in production by default.

- **Agent safety**:  
  - AzStudio enforces policies on what agents can do in different environments (e.g., no infra changes in classroom rooms).  
  - Ethics Monitor integrated into flows involving code changes that impact user data or critical services.

- **Governance & observability**:  
  - Traces and logs for agent‑initiated actions, especially those touching infra and production data.  
  - Dashboards for DevX productivity, failure rates, and incident‑causing changes.

Details of tasks and bolts are expanded in `DEVX-TASKLIST.md`.
