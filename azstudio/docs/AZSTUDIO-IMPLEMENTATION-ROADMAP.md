# AzStudio Implementation Roadmap — VS Code Fork + Agent Sessions

This roadmap expands the specifications into an implementation plan with phases, milestones, engineering tasks, required artifacts, tests, and a branch/repo strategy for the official `azstudio/` fork.

---

## High-Level Milestones

1. Foundations (Phase 0) — Stable repo & infrastructure
2. Workbench Integration (Phase 1) — VS Code fork and service DI
3. Chat Agent Foundation (Phase 2) — Agents as participants, sessions
4. Agent Orchestration & Execution (Phase 3) — Execution framework + policy
5. Knowledge Graph & RAG (Phase 4) — Knowledge Ocean + embeddings
6. Extension API & Ecosystem (Phase 5) — Extension APIs & docs
7. Hardening & Release (Phase 6) — QA, performance, packaging

---

## Phase Details

### Phase 0 — Foundations (1-2 weeks)
- Goal: Prepare the `azstudio/` repo with a fork of a pinned VS Code commit and CI basics.
- Tasks:
  1. Create the `azstudio/` repository (fork or built repo) and add skeleton docs (done in `azstudio/` folder).
  2. Pin a stable VS Code branch (e.g., `v1.100.0`) and add instructions for upstream merges.
  3. Add product branding assets and `product.json` defaults (Azora product details).
  4. CI/CD pipeline creation with `actions/` or `azure-pipelines` to compile and run tests.
  5. Add initial `README` and developer onboarding steps.
- Owners: DevOps + Core Maintainers
- Deliverables: `azstudio/` repo with CI `build` and `test` tasks.

### Phase 1 — Workbench Integration (4-6 weeks) — P0
- Goal: Migrate AzStudio services to VS Code's service model, creating DI wrappers, and reusing current AzStudio UI as webviews.
- Tasks:
  1. Create `src/vs/workbench/contrib/azora/` and `src/vs/workbench/services/azora/` in the fork.
  2. Convert `src/main/services/*` to DI-based singletons (wrappers) to enable incremental migration.
     - Implement `azstudio/src/vs/workbench/services/azora/AIOrchestratorService.ts` etc.
  3. Wire `Monaco` components to VS Code `editor` area, set up `EditorInput` for Visual Canvas and DB Designer.
  4. Implement `azora` extension folder with `azora.agents` extension to register built-in agents.
  5. Add logging and telemetry scaffolding.
- Owners: Core engineers & front-end
- Deliverables: VS Code build that includes Azora services; Visual Canvas as custom editor.

### Phase 2 — Chat Agent Foundation (3-4 weeks) — P0
- Goal: Implement `IChatAgentService` and `IChatSessionsService`-style integration and built-in agents registration.
- Tasks:
  1. Implement `chatParticipants` contribution & UI integration for a Chat Panel.
  2. Create `IChatAgentService` interface and register Azora built-in agents (`Elara`, `Sankofa`, etc.).
  3. Implement simple `InlineChatController` and wire inline chat commands.
  4. Add a `Agent Sessions` view to show active sessions, status, and history.
  5. Add unit tests for basic chat flows and agent registration.
- Owners: Chat lead + front-end
- Deliverables: Chat panel, agents are registered and responding in panel & inline mode.

### Phase 3 — Agent Orchestration & Execution (4-6 weeks) — P0
- Goal: Implement the Agent Execution framework: tasks, scheduling, resource constraints, and background execution.
- Tasks:
  1. Implement `IAgentExecutionService` in `workbench/services/azora/agentExecution.ts`.
  2. Move in-memory executor to `services/agent-execution` code; add sandboxing and process controls.
  3. Use Redis message bus for task lifecycle, with event types `TASK_SCHEDULED`, `TASK_STARTED`, `TASK_COMPLETED`, `TASK_FAILED`, `TASK_CANCELLED`.
  4. Implement Prisma models for tasks and event logs.
  5. Implement `pause`, `resume`, `cancel` lifecycle operations.
  6. Add a TaskBoard `view` for user interactions with scheduled tasks.
- Owners: Back-end + infra
- Deliverables: Durable agent tasks with status, logging, and UI.

### Phase 4 — Knowledge Ocean & RAG (3-4 weeks) — P1
- Goal: Index, query, and integrate Knowledge Ocean to supply RAG context and pre-answer features.
- Tasks:
  1. Implement `IKnowledgeOceanService` as a VS Code Service (local or cloud endpoint)
  2. Implement offline embeddings generation during indexing; integrate pgvector or Pinecone (pluggable adapter)
  3. Add `Knowledge Ocean` view with search results, source links, and citations.
  4. Add RAG step in `IAzoraAIRouter`: first attempt Knowledge Ocean answers for quick wins.
  5. Add knowledge graph & versioning for long-term knowledge management.
- Owners: Back-end + search/DS
- Deliverables: RAG-based responses; caching & versioning for Knowledge nodes.

### Phase 5 — Extension API & Ecosystem (3-5 weeks) — P2
- Goal: Expose developer APIs to create agents and custom contributions; create a marketplace for agents.
- Tasks:
  1. Define `vscode.d.ts` extensions for `azora.registerAgent()`, `azora.knowledgeOcean()` etc.
  2. Create `azora-agents` sample extension and `azora-extension-scaffold` CLI.
  3. Expose `IAzoraAIRouter` and `IConstitutionalValidator` for third-party usage.
  4. Add extension host implementation that runs azora agents (respecting permission and sandboxing rules).
- Owners: Core + ecosystem
- Deliverables: Extension API docs, example agent extension, ecosystem samples.

### Phase 6 — Hardening & Release (2-4 weeks)
- Goal: Security, performance, QA, packaging, and release.
- Tasks:
  1. CI/CD release candidate pipeline with signed builds and packages.
  2. E2E Playwright test coverage for key UX flows (chat, inline edit, agent tasks, RAG, knowledge view).
  3. Performance and load testing on agent routes; stress test the event bus.
  4. Security review for network calls and secrets access.
  5. Final product packaging and store submission.
- Owners: QA, DevOps, Security
- Deliverables: Release candidate, signed installer, release notes and marketing.

---

## Repo & Branching Strategy

- Main / default branch: `main` (stable)
- Dev branch: `develop` (active PR merges)
- Feature branches: `feature/<area>/<short-name>`
- Hotfix branches: `hotfix/<issue>`
- Forking Strategy: Keep `azstudio/` pinned to a specific upstream VS Code tag commit. Schedule quarterly upstream merges with a documented process:
  1. `upstream` remote pointing to `microsoft/vscode` repo
  2. Rebase `azstudio/main` on top of the `upstream` tag after smoke tests pass
  3. Use script to auto-merge and produce merge reports

### Repo Structure

- `azstudio/` (root)
  - `src/` — forked VS Code sources with `workbench/contrib/azora/` and `workbench/services/azora/`
  - `extensions/azora-agents/` — built-in agents
  - `azstudio-extensions/` — local dev extensions
  - `scripts/` — developer scripts (sync, build, merge-upstream)
  - `docs/` — architecture and implementation docs
  - `ci/` — CI pipeline definitions

---

## Integration Pattern (Azora Services ⇄ AzStudio)

- Use service connectors and adapters with typed interfaces for each external system:
  - `AzoraCloudAPIClient` — REST client for user profiles, workspace-level permissions, and features
  - `AIProviderAdapter` — Abstract LLM provider adapter interface (OpenAI / Anthropic / Local LLM)
  - `KnowledgeOceanAdapter` — Vector store & search interface
  - `AgentExecutionAdapter` — For delegating long-running tasks to a separate `agent-execution` service

- Local vs Hosted Considerations
  - Local-first: For sensitive files/data, keep RAG and embeddings local if possible
  - Hosted-only: For heavy lifting or cross-user collaboration, rely on Azora Cloud services

---

## Implementation Checklists (Phase-level)

### Phase 1 Checklist
- [ ] Create `workbench/contrib/azora/` and `workbench/services/azora/` and add to build
- [ ] DI wrappers for `AIOrchestrator`, `ProjectIndexer` using `registerSingleton`
- [ ] Visual Canvas as custom editor webview
- [ ] Product.json updated for Azora branding
- [ ] CI build passing

### Phase 2 Checklist
- [ ] Chat Panel contribution and UI
- [ ] `IChatAgentService` and `IChatSessionsService` implementation
- [ ] Built-in agent registration + sample chat commands
- [ ] `InlineChatController` integration
- [ ] Tests for basic chat and session flows

### Phase 3 Checklist
- [ ] `IAgentExecutionService` & scheduler
- [ ] Redis EventBus integration & job drivers
- [ ] Task persistence and lifecycle
- [ ] TaskBoard UI in `contributes.views`
- [ ] Sandbox & resource limits

### Phase 4 Checklist
- [ ] `IKnowledgeOceanService` implementation & search API
- [ ] Embedding generation and storage (pgvector/Pinecone)
- [ ] Knowledge view and RAG integration
- [ ] Versioning for knowledge nodes

---

## Testing & Quality Assurance

- Unit tests for every service and adapter
- Integration tests for: chat flows, agent execution lifecycle, RAG fallback
- E2E tests: user chat → compute → constitutional validation → applied changes
- Performance tests: token latency, task scheduling under load
- Security tests: secrets access, permission prompts, data exfiltration protections

---

## Developer Tools & Scripts

- `./scripts/merge-upstream.sh` — Merge a new VS Code tag
- `./scripts/init-workspace.ps1` — Setup local dev env on Windows
- `./scripts/test-e2e.ps1` — Run E2E tests with Playwright
- `./scripts/sync-agents.ts` — Script to sync agent definitions with `ai-router` prompts

---

## Timeline Summary (Conservative)

- Phase 0: 1-2 weeks
- Phase 1: 4-6 weeks
- Phase 2: 3-4 weeks
- Phase 3: 4-6 weeks
- Phase 4: 3-4 weeks
- Phase 5: 3-5 weeks
- Phase 6: 2-4 weeks

Total Estimated: 20-31 weeks — depending on staffing and parallel workstreams.

---

## Estimated Resource Requirements (example staffing)

- 1 Program Manager
- 1-2 DevOps / Infra Engineers
- 3-4 Frontend Engineers
- 3 Backend Engineers (search, agent-exec, AI)
- 1 Security Engineer
- 2 QA Engineers
- 1 Product Designer & Technical Writer

---

## Success Criteria

- GitHub repo `azstudio/` exists and builds a functioning VS Code fork with Azora features
- Agents are first-class chat participants, with inline and panel chat flows
- Agent tasks are schedulable and trackable, and constitutional validation is enforced
- Knowledge Ocean reduces calls to external LLMs for RAG-based answers
- Extension API allows developer-contributed agents to be added safely

---

*Document Version:* 1.0
*Author:* Azora Engineering
*Date:* Dec 5, 2025
