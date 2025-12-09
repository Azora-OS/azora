# AzStudio Specifications — Agent & Chat Integration

## Overview

This specification defines requirements and designs for integrating Azora's AI-family agents (Elara, Sankofa, etc.) into a VS Code fork (AzStudio). The goal is to run Azora agents as native Chat Agents (`IChatAgentService`) with inline chat, agent sessions, and orchestration using Azora's AI router and external services.

## Goals & Non-Goals

- Goals
  - Provide first-class Chat Agent experience: panel chat, inline editor chat, and agent sessions.
  - Enforce Constitutional validation (DIVINE_LAW_PRINCIPLES) for AI-generated edits and answers.
  - Use Knowledge Ocean (RAG) as the first layer of answers with fallbacks to LLM providers.
  - Allow third-party extension authors to register agents via standard VS Code extension API.
  - Implement agent lifecycle, task persistence, auditing, and resource constraints.

- Non-goals (for initial phases)
  - Full upstream sync with VS Code changes in real-time (we'll pin to a stable branch and merge periodically).
  - Support for advanced 3rd-party LLM providers beyond planned OpenAI/Anthropic in initial rollout.

## Key Concepts & Definitions

- Agent: A specialized AI persona (Elara, Sankofa, etc.) with an ID and configured capabilities.
- Session: A chat session between the user and an agent, includes context, history, attachments, and lifecycle state.
- Agent Task: A unit of work created by a user or agent (e.g., a code generation request).
- Constitutional Validation: A validation step that checks generated content against Divine Law principles before applying changes.
- RAG (Retrieval-Augmented Generation): Using the Knowledge Ocean to supply context and cached answers before invoking external LLMs.
- Extension Host: The environment to run third-party extensions and agent providers.

---

## System Architecture (Summary)

- UI: VS Code workbench forked; includes Activity Bar, Editor (Monaco), Panels (Chat, Task Board, Version History), and Webviews (Visual Canvas, DB Designer).
- Services: `IAzoraAIRouter`, `IChatAgentService` (works with `IChatSessionsService`), `IKnowledgeOceanService`, `IConstitutionalValidator`, `IAgentExecutionService` (agent-execution runtime). All are registered as singletons in the VS Code DI.
- Routing: Multi-tiered routing: LOCAL_LLM → RAP_SYSTEM (RAG) → EXTERNAL_LLM. Each response is subjected to constitutional validation.
- Persistence: Prisma-backed models for agents, sessions, tasks, knowledge nodes; Redis for ephemeral EventBus; pgvector for vector storage.

---

## Agent Model (Data & Capabilities)

- Agent Metadata
  - id: `azora.elara`
  - name: `elara`
  - fullName
  - description
  - extensionId
  - locations: `[ChatPanel, InlineEditor, Terminal, Notebook]`
  - modes: `[Ask, Agent]`
  - slashCommands: `[{name, description}]`
  - default: boolean
  - personaPrompts: the agent prompt template (AGENT_PROMPTS)

- Agent Interface (TypeScript)

```ts
export interface IAzoraAgent {
  id: string;
  invoke(request: AgentRequest, onProgress: StreamProgress, token: CancellationToken): Promise<AgentResponse>;
  provideFollowups?(result: AgentResponse): Promise<Followup[]>;
}
```

---

## Session Model

- Models
  - ChatSession { id, agentId, userId, createdAt, updatedAt, status, history[] }
  - SessionMessage { id, sessionId, sender: User | Agent | System, content, attachments, timestamp }
  - AgentTask { id, sessionId, name, status, result, createdAt, tries }

- Session lifecycle
  - New → Active → Paused → Completed → Archived
  - Each state change audited

---

## APIs & Contracts

### 1) IAzoraAIRouter
- Methods
  - chat(message: string, agentId: string, sessionId?: string, options?: ChatOptions): Promise<AIResponse>
  - generateCode(request: CodeGenerationRequest): Promise<AIResponse>
  - createEmbeddings(contents: string[]): Promise<EmbeddingResult[]>
  - searchKnowledge(query: string): Promise<KnowledgeResult[]>

Behavior:
- Try Knowledge Ocean (RAG) first; if no answer, call selected provider (LOCAL_LLM, EXTERNAL_LLM)
- Incorporate constitutional validation hook
- Provide streaming responses
- Track token usage and cost

### 2) IChatAgentService
- Methods
  - registerAgent(agentData: AgentData, implementation: IAzoraAgent): void
  - getAgents(location?: ChatAgentLocation): AgentData[]
  - getAgent(id: string): AgentData
  - setDefaultAgent(location, agentId)

### 3) IChatSessionsService
- Methods
  - createSession(agentId: string, userId: string, context?: SessionContext): ChatSession
  - getSession(sessionId)
  - addMessage(sessionId, message: SessionMessage)
  - applyEdit(sessionId, edit): boolean  // after constitutional validation
  - closeSession(sessionId)

### 4) IConstitutionalValidator
- Methods
  - validateResponse(response: string, context?: any): Promise<ValidationResult>
  - validateEdits(changes: ChangeSet): Promise<ValidationResult>

### 5) IAgentExecutionService
- Methods
  - scheduleTask(task: AgentTask, executionOptions): Promise<ExecutionResult>
  - pauseTask(taskId)
  - resumeTask(taskId)
  - cancelTask(taskId)

---

## Cockpit Connection Pattern (Integrating AzStudio with Azora cloud)

- Authentication & Secrets
  - Use `SecretsVault` for storing secrets locally; use system OS keychain
  - OAuth for user cloud authentication (GitHub, Azure, Azora cloud)

- Service Connectors (run locally in the workbench, or via a securely proxied backend)
  - `AzoraCloud API` connector: authenticates, queries user profile, and forwards abac/restrictions
  - `AI Router Proxy`: run either local (if using local provider) or as a secure backend proxy to external LLM providers
  - `Knowledge Ocean Connector`: calls the knowledge graph / index server to retrieve RAG results

- Event Bus
  - Use Redis for message bus across agent-execution & background services
  - Use EventBus for task lifecycle updates, agent notifications, and audit messages

---

## Security & Privacy

- All external network calls require user consent through `PermissionManager`
- Secrets stored in `SecretsVault`
- Immutable audit log for session interactions and applied changes
- Optional telemetry tracing (opt-in) with per-user basis
- Data minimization: no workspace files leave the user machine without explicit consent

---

## Performance & Cost Controls

- Rate limiting and concurrency limits per-agent and per-user
- Token usage limit and budget per organization/user
- Local cache responses from Knowledge Ocean to avoid repeated LLM calls
- Use cheap endpoints or local LLMs for small prompt calls

---

## Metrics & Observability

- Track: response latency, token usage, session durations, number of applied edits, Constitutional validation failure rate
- Expose dashboard in `MetricsDashboard` and ship telemetry if user consents

---

## Auth & Consent

- Browser-based OAuth for cloud services; token persisted in `SecretsVault`
- `PermissionManager` prompts for any external API or remote operations (e.g., network access to OpenAI)
- Session-level consent for agent tasks that involve potentially harmful operations

---

## Data Models (Prisma snippets)

```prisma
model ChatSession {
  id       String @id @default(cuid())
  agentId  String
  userId   String
  status   String
  messages Json  // store as array of messages for simplicity
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model AgentTask {
  id        String @id @default(cuid())
  sessionId String
  name      String
  status    String
  result    Json
  createdAt DateTime @default(now())
}
```

---

## Acceptance Criteria

- Agents register and respond in chat panel and inline editor
- Sessions can be audited and resume after close
- Constitutional validation is applied to edits and flagged responses
- Knowledge Ocean info is used for RAG and reduces LLM calls
- Policies enforced (rate limiting, cost, permission) and telemetry available

---

## Appendix: Example Invocation Flow (ELARA)

1. User opens inline chat in a file and invokes `@elara teach explain 'what does X do?'`
2. `IChatAgentService` forwards request to `ElaraAgent` implementation
3. `ElaraAgent` calls `IAzoraAIRouter.chat()` with the session context
4. `IAzoraAIRouter` attempts `KnowledgeOcean.search()`; if no result, call provider
5. Response streamed back to `ElaraAgent` implementation
6. `IConstitutionalValidator.validateResponse()` validates content
7. If `Approved`: apply inline changes; otherwise flag for user review
8. All events persisted in DB


---

*Document Version*: 1.0  
*Author*: Azora AI Architecture Team  
*Date*: Dec 5, 2025
