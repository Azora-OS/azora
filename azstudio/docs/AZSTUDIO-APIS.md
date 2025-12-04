# AzStudio API & Data Model Specifications

This document contains detailed API definitions and data models for agent registration, session management, chat messages, and event bus topics.

## TypeScript Interfaces

### Agent Data
```ts
export interface AgentData {
  id: string; // e.g., azora.elara
  name: string;
  fullName?: string;
  description?: string;
  extensionId?: string;
  locations: ChatAgentLocation[]; // Chat, EditorInline, Notebook, Terminal
  modes: ChatModeKind[]; // Ask, Agent
  isDefault?: boolean;
  metadata?: Record<string, any>;
  slashCommands?: { name: string; description: string }[];
  personaPrompts?: string; // Agent prompt template
}
```

### AgentRequest & Response
```ts
export interface AgentRequest {
  sessionId?: string;
  userId?: string;
  prompt: string;
  context?: any; // Additional structured context, files, AST
  attachments?: Attachment[];
  mode?: ChatModeKind;
  options?: Record<string, any>;
}

export interface AgentResponse {
  content: string;
  choices?: any[];
  metadata?: object; // tokens, provider, cost
  citations?: KnowledgeCitation[]; // for RAG
}
```

### ChatSession & Messages
```ts
export interface SessionMessage {
  id: string;
  sessionId: string;
  sender: 'user'|'agent'|'system';
  content: string;
  attachments?: Attachment[];
  timestamp: string;
}

export interface ChatSession {
  id: string;
  agentId: string;
  userId: string;
  status: 'new'|'active'|'paused'|'completed'|'archived';
  messages: SessionMessage[];
  createdAt: string;
  updatedAt: string;
}
```

### Events & Task Lifecycle
```ts
// Event names
export type AgentEvent = 'TASK_SCHEDULED'|'TASK_STARTED'|'TASK_COMPLETED'|'TASK_FAILED'|'TASK_CANCELLED'|'SESSION_CREATED'|'SESSION_UPDATED';

// Event payload example
export interface EventPayload {
  event: AgentEvent;
  resourceId: string; // taskId or sessionId
  data: any; 
  timestamp: string;
}
```

## HTTP Endpoints (Internal & Public)

- `POST /api/agents/register` — Register an agent (extension-host only)
  - Body: `AgentData`
  - Auth: admin or extension host

- `GET /api/agents` — List available agents

- `POST /api/agent/chat` — Send a message to an agent
  - Body: `AgentRequest`
  - Response: `AgentResponse` with streaming support

- `POST /api/sessions` — Create a chat session for agent
  - Body: `{ agentId, userId, initialMessage }`

- `GET /api/sessions/:id` — Get session details
- `POST /api/sessions/:id/message` — Add a message
- `POST /api/tasks` — Schedule a background task
- `PATCH /api/tasks/:id/pause|resume|cancel` — Mutate task lifecycle

## WebSocket/Event bus

- Path: `/ws/events` — subscribe to event bus for task updates and session updates
- Topics:
  - `session:{sessionId}` — events for a session
  - `task:{taskId}` — events for a task
  - `agent:{agentId}` — general agent events

## Example Agent Registration (extension)
```ts
// extension.ts
import { Azora } from 'vscode-azora-api';

export function activate(context: any) {
  const myAgent = {
    id: 'myfancy.agent',
    name: 'MyFancy',
    locations: ['chat', 'editorInline'],
    modes: ['ask'],
    personaPrompts: 'You are MyFancy, helpful assistant...'
  };
  Azora.registerAgent(myAgent, {
    invoke: async (req, onProgress, token) => {
      const resp = await callMyBackend(req);
      onProgress({ kind: 'content', content: resp.content });
      return { content: resp.content };
    }
  });
}
```

## Knowledge Ocean Contract

- `POST /api/knowledge/search` — returns `KnowledgeResult[]` with relevant excerpts
- `POST /api/knowledge/embeddings` — accepts `[{id, text}]`, returns embedding arrays
- `POST /api/knowledge/index` — add or update nodes
- `GET /api/knowledge/node/:id` — fetch knowledge node

## Constitutional Validation API

- `POST /api/validate` — Request ValidationResult
  - Body: `{ text: string, context? }` returns `{ approved: boolean, issues: string[], score: number }`

Notes:
- Perform validation before applying edits
- If validation fails, the UI should prompt the user with options to `Edit Locally`, `Force Apply (with reason)`, or `Abort` (requires explicit consent)

---

*Document Version:* 1.0  
*Author:* Azora Engineering  
*Date:* Dec 5, 2025
