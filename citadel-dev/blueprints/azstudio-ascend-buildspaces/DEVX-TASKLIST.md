# AzStudio, Ascend & BuildSpaces – Domain Implementation Task List

> Status: Draft v0.1 (deep dive)  
> Linked master task list: `citadel-dev/MASTER-IMPLEMENTATION-TASKLIST.md` (ASC-*, AZST-*, BS-*, OBS-*, INF-*)

This expands ASC-*, AZST-*, and BS-* tasks into DevX- and orchestration-focused work.

---

## 1. AzStudio Orchestrator & Skills

- [ ] **AZST-DX-1: AzStudio Orchestrator Service Skeleton**  
  **Objective**: Scaffold `services/azstudio-orchestrator/` as a dedicated orchestrator backend.  
  **Parent**: AZST-1, AZST-2.  
  **Dependencies**: Existing AIOrchestrator code; AI Family; Ethics Monitor.  
  **Steps**:  
  - Create service structure, connect to config, logging, and auth.  
  - Host `AIOrchestrator` as a set of composable modules (model routing, planning, execution).  
  - Wire to AI Family, Knowledge Ocean, Agent Execution, and Ethics Monitor.  
  **Acceptance criteria**:  
  - Orchestrator exposes stable internal APIs for plan execution and tool calls.  
  - Existing agent integrations (e.g., VS Code extension) can target this service.  
  **Verification**:  
  - Unit/integration tests; smoke tests via sample workflows.  
  **Ownership**: AzStudio/Agent squad.  
  **Effort**: L  
  **Priority**: P1  
  **Repo paths**: `services/azstudio-orchestrator/`, `azstudio-archive/`.

- [ ] **AZST-DX-2: Skill Registry & Tool Contracts**  
  **Objective**: Implement Skill registry backing AzStudio orchestration.  
  **Parent**: AZST-2.  
  **Dependencies**: Service templates; domain tools.  
  **Steps**:  
  - Design skill metadata schema (id, description, IO schema, safety level, owner, domains).  
  - Implement registry CRUD and discovery APIs.  
  - Register initial core skills (run tests, run lint, scaffold service, query LMS, search Library).  
  **Acceptance criteria**:  
  - Skills discoverable and callable from orchestrator and clients.  
  - Skill usage tracked for observability.  
  **Verification**:  
  - Registry tests and example skill flows.  
  **Artifacts**: Registry code, schemas, docs.  
  **Ownership**: AzStudio squad.  
  **Effort**: M  
  **Priority**: P1  
  **Repo paths**: `services/azstudio-orchestrator/`.

---

## 2. Ascend IDE Hardening & Features

- [ ] **ASC-DX-1: VFS & Workspace Reliability**  
  **Objective**: Make Ascend’s virtual filesystem robust for large, multi‑file projects and BuildSpaces sessions.  
  **Parent**: ASC-1.  
  **Dependencies**: Current Ascend code; Agent Execution; Git integration.  
  **Steps**:  
  - Audit current VFS and refactor for clear separation of local vs remote operations.  
  - Add queueing and debouncing for file operations under high load.  
  - Support workspace restore across sessions and BuildSpace room re‑entry.  
  **Acceptance criteria**:  
  - No data loss or inconsistent states in stress tests.  
  - Workspace switches and reconnects behave predictably.  
  **Verification**:  
  - Stress tests; E2E flows with multiple users and files.  
  **Artifacts**: Refactored VFS module, tests.  
  **Ownership**: Ascend squad.  
  **Effort**: L  
  **Priority**: P1  
  **Repo paths**: `apps/ascend/`.

- [ ] **ASC-DX-2: Debugger & Live Preview Integration**  
  **Objective**: Deliver first‑class debugging and live preview for core stacks (Node/TS, Next.js).  
  **Parent**: ASC-3.  
  **Dependencies**: Dev servers; Agent Execution; BuildSpaces integration.  
  **Steps**:  
  - Integrate debug adapters; map breakpoints and stack traces into Ascend UI.  
  - Implement preview frames for web apps, with quick linkage to Code Chamber views.  
  - Ensure debugging flows work in local and BuildSpaces contexts.  
  **Acceptance criteria**:  
  - Set/step/break flows verified on exemplar apps.  
  - Preview reload under 1s P95 for local dev scenarios.  
  **Verification**:  
  - E2E debug tests; performance tests.  
  **Artifacts**: Debugger integration, preview runner docs.  
  **Ownership**: Ascend squad.  
  **Effort**: L  
  **Priority**: P2  
  **Repo paths**: `apps/ascend/`, `apps/ascend-demo/`.

---

## 3. BuildSpaces – Dev Rooms

- [ ] **BS-DX-1: Code Chamber Room Type**  
  **Objective**: Implement Code Chamber as a BuildSpace room type fully integrated with Ascend.  
  **Parent**: BS-3.  
  **Dependencies**: BuildSpaces Orchestrator; Ascend; AI Family.  
  **Steps**:  
  - Define Code Chamber room schema and capabilities (coding, tests, previews, AI suggestions).  
  - Embed Ascend in Code Chamber UI with shared workspace state.  
  - Integrate Elara sidebar for context‑aware help.  
  **Acceptance criteria**:  
  - Users can enter Code Chamber from Lobby and use Ascend seamlessly.  
  - Session state consistent across re‑joins.  
  **Verification**:  
  - E2E flows: create project, edit, run tests, commit.  
  **Artifacts**: Room components, orchestrator logic, tests.  
  **Ownership**: BuildSpaces + Ascend squads.  
  **Effort**: M  
  **Priority**: P1  
  **Repo paths**: `apps/azora-buildspaces/`, `services/buildspaces-orchestrator/`, `apps/ascend/`.

- [ ] **BS-DX-2: AI Studio & Maker Lab Rooms**  
  **Objective**: Implement AI Studio and Maker Lab rooms for notebook‑style and hardware/IoT‑style work.  
  **Parent**: BS-4.  
  **Dependencies**: Agent Execution sandboxes; Research Center plan; monitoring.  
  **Steps**:  
  - Define AI Studio room UX with notebook cells, dataset browser, and AI tools.  
  - Define Maker Lab room UX with device simulators and integration points.  
  - Connect both to Sapiens/Research Center where applicable.  
  **Acceptance criteria**:  
  - AI Studio supports basic ML/data experiments with quotas and safety.  
  - Maker Lab can run sample IoT/embedded simulations.  
  **Verification**:  
  - E2E room tests; resource usage metrics.  
  **Artifacts**: Room definitions, integrations, docs.  
  **Ownership**: BuildSpaces + Research/Infra squads.  
  **Effort**: L  
  **Priority**: P2  
  **Repo paths**: `apps/azora-buildspaces/`, `services/buildspaces-orchestrator/`, `services/agent-execution/`.

---

## 4. Observability & Infra for DevX

- [ ] **OBS-DX-4.1: DevX Observability Pack**  
  **Objective**: Instrument Ascend, AzStudio, Agent Execution, and BuildSpaces rooms with traces and metrics.  
  **Parent**: OBS-1, OBS-2.  
  **Dependencies**: Otel, monitoring stack.  
  **Steps**:  
  - Add Otel instrumentation for key dev flows (open project, run tests, deploy).  
  - Build dashboards for IDE latency, agent orchestration failures, sandbox errors.  
  - Set SLOs for DevX responsiveness and failure rates.  
  **Acceptance criteria**:  
  - DevX teams can quickly identify performance or reliability issues.  
  - Alerts tuned to meaningful signal (not noisy).  
  **Verification**:  
  - Synthetic load tests; incident drills.  
  **Artifacts**: Dashboards, alerts, runbooks.  
  **Ownership**: DevX + SRE squads.  
  **Effort**: M  
  **Priority**: P2  
  **Repo paths**: `monitoring/`, `apps/ascend/`, `services/azstudio-orchestrator/`, `services/agent-execution/`, `services/buildspaces-orchestrator/`.

---

## 5. Activation Roadmap – DevX & Orchestration

- **Phase 1**: AzStudio skeleton + core skills – AZST-DX-1, AZST-DX-2.  
- **Phase 2**: Ascend stability – ASC-DX-1, ASC-DX-2.  
- **Phase 3**: Code Chamber & rooms – BS-DX-1, BS-DX-2.  
- **Phase 4**: Observability – OBS-DX-4.1 + INF-1/INF-2 for DevX services.
