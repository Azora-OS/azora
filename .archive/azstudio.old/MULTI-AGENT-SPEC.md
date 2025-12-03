# 🛠️ AzStudio Multi-Agent Mode: Engineering Specification

**Version**: 1.0  
**Status**: Active Development  
**Target**: AzStudio Engineering Team  
**Integration**: Azora BuildSpaces Citadel

---

## 🎯 Executive Summary

AzStudio must support **Multi-Agent Collaborative Mode** where multiple AI agents work simultaneously on a project, orchestrated by Elara, with Genesis Station serving as the living source of truth for project vision and requirements.

**Key Principle**: Agents are not just code assistants—they are **autonomous developers** who understand context, collaborate with each other, and continuously sync with the project's evolving vision.

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    BUILDSPACES CITADEL                      │
│  ┌──────────────────┐         ┌─────────────────────────┐  │
│  │ Genesis Station  │◄────────┤  Elara (Orchestrator)   │  │
│  │ (Source of Truth)│         │  - Reads vision         │  │
│  │                  │         │  - Assigns tasks        │  │
│  │ - Requirements   │         │  - Monitors progress    │  │
│  │ - Design Choices │         └──────────┬──────────────┘  │
│  │ - Vision Updates │                    │                 │
│  └──────────────────┘                    │                 │
│                                           ▼                 │
│  ┌───────────────────────────────────────────────────────┐ │
│  │              CODE CHAMBER (AzStudio)                  │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐           │ │
│  │  │  Zola    │  │ Jabari   │  │  Kofi    │  ← Agents │ │
│  │  │ (Backend)│  │(Security)│  │ (DevOps) │           │ │
│  │  └────┬─────┘  └────┬─────┘  └────┬─────┘           │ │
│  │       │             │             │                  │ │
│  │       └─────────────┴─────────────┘                  │ │
│  │                     │                                │ │
│  │              ┌──────▼──────┐                         │ │
│  │              │  AzStudio   │                         │ │
│  │              │  Multi-Agent│                         │ │
│  │              │  Runtime    │                         │ │
│  │              └─────────────┘                         │ │
│  └───────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## 📋 Core Requirements

### 1. Multi-Agent Runtime Environment

AzStudio must support **concurrent agent sessions** where each agent:
- Has its own workspace/context
- Can read/write files independently
- Sees other agents' changes in real-time
- Communicates via a shared message bus

**Technical Requirements**:
```typescript
interface AgentSession {
  id: string;
  agentName: 'Zola' | 'Jabari' | 'Kofi' | 'Abeni' | 'Nexus';
  projectId: string;
  workingDirectory: string;
  currentTask: AgentTask;
  status: 'idle' | 'thinking' | 'coding' | 'testing' | 'blocked';
  cursor: {
    file: string;
    line: number;
    column: number;
  };
}

interface MultiAgentRuntime {
  // Lifecycle
  initializeAgents(projectId: string, agents: string[]): Promise<void>;
  terminateAgent(agentId: string): Promise<void>;
  
  // Task Management
  assignTask(agentId: string, task: AgentTask): Promise<void>;
  getAgentStatus(agentId: string): AgentSession;
  
  // Collaboration
  broadcastMessage(from: string, message: AgentMessage): void;
  getSharedContext(): ProjectContext;
  
  // Conflict Resolution
  handleMergeConflict(conflict: MergeConflict): Promise<Resolution>;
}
```

---

### 2. Elara Integration (Orchestrator)

Elara acts as the **XO (Executive Officer)** who:
- Reads the Genesis Station for project vision
- Breaks down high-level goals into agent tasks
- Monitors agent progress
- Resolves conflicts between agents
- Updates Genesis Station with implementation decisions

**API Contract**:
```typescript
interface ElaraOrchestrator {
  // Vision Sync
  syncWithGenesisStation(projectId: string): Promise<ProjectVision>;
  
  // Task Decomposition
  decomposeGoal(goal: string): Promise<AgentTask[]>;
  
  // Agent Assignment
  assignTaskToAgent(task: AgentTask): Promise<{
    agent: string;
    reasoning: string;
  }>;
  
  // Progress Monitoring
  monitorProgress(projectId: string): Promise<ProgressReport>;
  
  // Conflict Resolution
  resolveConflict(conflict: AgentConflict): Promise<Resolution>;
  
  // User Interaction
  receiveUserGuidance(instruction: UserInstruction): Promise<void>;
}

interface UserInstruction {
  type: 'task_guidance' | 'agent_behavior' | 'priority_change';
  target?: string; // specific agent or task
  instruction: string;
  // Example: "Zola, focus on performance over readability"
  // Example: "Jabari, use OAuth2 instead of JWT"
}
```

---

### 3. Genesis Station as Living Source of Truth

Genesis Station is **not static**—it evolves as the project progresses.

**Data Model**:
```typescript
interface GenesisStation {
  projectId: string;
  vision: {
    title: string;
    description: string;
    goals: string[];
    successCriteria: string[];
    lastUpdated: Date;
  };
  
  requirements: {
    functional: Requirement[];
    nonFunctional: Requirement[];
    constraints: string[];
  };
  
  designChoices: {
    architecture: string; // e.g., "Microservices", "Monolith"
    techStack: {
      frontend: string[];
      backend: string[];
      database: string[];
      infrastructure: string[];
    };
    patterns: string[]; // e.g., "Repository Pattern", "CQRS"
    reasoning: Record<string, string>; // Why each choice was made
  };
  
  implementationLog: {
    timestamp: Date;
    agent: string;
    decision: string;
    impact: string;
  }[];
  
  activeContext: {
    currentPhase: string; // e.g., "MVP", "Beta", "Production"
    activeTasks: AgentTask[];
    blockers: Blocker[];
  };
}

interface Requirement {
  id: string;
  description: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  status: 'pending' | 'in_progress' | 'completed' | 'deferred';
  assignedTo?: string; // agent name
  implementationNotes?: string;
}
```

**Agent Sync Protocol**:
```typescript
// Agents must check Genesis Station before starting work
async function agentWorkflow(agent: Agent, task: AgentTask) {
  // 1. Sync with Genesis Station
  const context = await genesisStation.getContext(task.projectId);
  
  // 2. Understand current vision
  const vision = context.vision;
  const relevantRequirements = context.requirements.filter(
    req => req.id in task.requirementIds
  );
  
  // 3. Check design choices
  const designGuidelines = context.designChoices;
  
  // 4. Execute task with context
  const implementation = await agent.implement(task, {
    vision,
    requirements: relevantRequirements,
    designGuidelines
  });
  
  // 5. Log decision back to Genesis Station
  await genesisStation.logImplementation({
    agent: agent.name,
    task: task.id,
    decision: implementation.approach,
    impact: implementation.filesChanged
  });
  
  // 6. Update requirement status
  await genesisStation.updateRequirement(task.requirementIds[0], {
    status: 'completed',
    implementationNotes: implementation.notes
  });
}
```

---

### 4. User Interaction Model

Users interact with the system at **two levels**:

#### Level 1: High-Level (via Elara)
User gives instructions to Elara, who translates them into agent tasks.

**Example**:
```
User: "Elara, we need to add user authentication. Use OAuth2 with Google."

Elara's Actions:
1. Updates Genesis Station with new requirement
2. Breaks down into tasks:
   - Zola: Implement OAuth2 backend routes
   - Jabari: Security audit of OAuth flow
   - Abeni: Design login UI
   - Kofi: Set up Google Cloud credentials
3. Assigns tasks to agents
4. Monitors progress
```

#### Level 2: Direct Agent Guidance
User can give specific instructions to individual agents.

**Example**:
```
User: "Jabari, use bcrypt with 12 rounds for password hashing, not 10."

Jabari's Actions:
1. Acknowledges instruction
2. Updates code
3. Logs decision to Genesis Station
4. Notifies Elara of change
```

**AzStudio UI Requirements**:
```typescript
interface AgentGuidancePanel {
  // Chat interface with Elara
  elaraChat: {
    messages: ChatMessage[];
    sendMessage(text: string): void;
  };
  
  // Direct agent communication
  agentChannels: {
    [agentName: string]: {
      status: AgentStatus;
      currentTask: string;
      sendInstruction(instruction: string): void;
    };
  };
  
  // Task override
  taskControls: {
    pauseTask(taskId: string): void;
    reprioritize(taskId: string, newPriority: number): void;
    reassign(taskId: string, newAgent: string): void;
  };
}
```

---

### 5. Agent Behavior Specification

Users can define **how agents should work**, similar to GitHub Copilot instructions.

**Implementation**:
```typescript
interface AgentBehaviorProfile {
  agentName: string;
  projectId: string;
  
  codeStyle: {
    language: string;
    conventions: string[]; // e.g., "Use functional components", "Prefer const over let"
    formatting: string; // e.g., "Prettier with 2-space indent"
  };
  
  priorities: {
    performance: number; // 1-10
    readability: number;
    security: number;
    testCoverage: number;
  };
  
  constraints: string[]; // e.g., "Never use 'any' type", "Always add JSDoc comments"
  
  libraries: {
    preferred: string[]; // e.g., ["lodash", "date-fns"]
    forbidden: string[]; // e.g., ["moment.js"]
  };
  
  customInstructions: string; // Free-form text
  // Example: "Always use Zod for validation. Prefer server actions over API routes."
}

// User can set this via UI
function setAgentBehavior(agent: string, profile: AgentBehaviorProfile) {
  // Stored in Genesis Station
  genesisStation.updateAgentProfile(agent, profile);
  
  // Agent reads this before every task
  const behavior = genesisStation.getAgentBehavior(agent);
  agent.configure(behavior);
}
```

**UI for Setting Behavior**:
```tsx
// In BuildSpaces Code Chamber
<AgentBehaviorEditor agent="Zola">
  <Section title="Code Style">
    <Select label="Language" options={['TypeScript', 'JavaScript']} />
    <TextArea label="Conventions" placeholder="Use functional components..." />
  </Section>
  
  <Section title="Priorities">
    <Slider label="Performance" min={1} max={10} />
    <Slider label="Readability" min={1} max={10} />
    <Slider label="Security" min={1} max={10} />
  </Section>
  
  <Section title="Custom Instructions">
    <TextArea 
      placeholder="Always use Zod for validation. Prefer server actions..."
      rows={10}
    />
  </Section>
</AgentBehaviorEditor>
```

---

### 6. Real-Time Collaboration Features

AzStudio must show **what agents are doing in real-time**.

**Required UI Elements**:

#### 6.1 Agent Cursors
Show where each agent is currently working.

```typescript
interface AgentCursor {
  agentName: string;
  color: string; // e.g., Zola = blue, Jabari = red
  file: string;
  line: number;
  column: number;
  label: string; // e.g., "Zola is optimizing..."
}

// Monaco Editor integration
editor.addCursor({
  position: { line: 42, column: 10 },
  color: '#3b82f6',
  label: 'Zola'
});
```

#### 6.2 Agent Activity Feed
Live feed of agent actions.

```typescript
interface AgentActivity {
  timestamp: Date;
  agent: string;
  action: 'file_created' | 'file_modified' | 'test_run' | 'commit' | 'comment';
  details: string;
  file?: string;
}

// Example feed items:
// "Zola created src/auth/oauth.ts"
// "Jabari ran security scan on auth module"
// "Kofi committed: 'Add OAuth2 configuration'"
```

#### 6.3 Task Progress Board
Kanban-style board showing agent tasks.

```
┌─────────────┬─────────────┬─────────────┬─────────────┐
│   TODO      │ IN PROGRESS │   REVIEW    │    DONE     │
├─────────────┼─────────────┼─────────────┼─────────────┤
│ Setup DB    │ OAuth Routes│             │ Project Init│
│ (Zola)      │ (Zola) 60%  │             │ (Elara)     │
│             │             │             │             │
│ Design Login│ Security    │             │             │
│ (Abeni)     │ Audit       │             │             │
│             │ (Jabari) 30%│             │             │
└─────────────┴─────────────┴─────────────┴─────────────┘
```

---

### 7. Genesis Station Sync Protocol

Agents must **continuously sync** with Genesis Station to stay aligned with evolving requirements.

**Sync Frequency**:
- **Before starting a task**: Read full context
- **Every 5 minutes during work**: Check for updates
- **After completing a task**: Log implementation decisions
- **On conflict**: Immediately sync and resolve

**Implementation**:
```typescript
class AgentWorker {
  private syncInterval: NodeJS.Timer;
  
  async startTask(task: AgentTask) {
    // Initial sync
    const context = await this.syncWithGenesis();
    
    // Start periodic sync
    this.syncInterval = setInterval(async () => {
      const updates = await this.checkForUpdates();
      
      if (updates.requirementsChanged) {
        // Re-evaluate current approach
        await this.adjustImplementation(updates);
      }
      
      if (updates.designChoicesChanged) {
        // Refactor if needed
        await this.refactorToMatchDesign(updates);
      }
    }, 5 * 60 * 1000); // Every 5 minutes
    
    // Execute task
    await this.executeTask(task, context);
    
    // Stop sync
    clearInterval(this.syncInterval);
    
    // Final sync
    await this.logCompletion(task);
  }
  
  private async syncWithGenesis(): Promise<ProjectContext> {
    const genesis = await genesisStation.getContext(this.projectId);
    
    // Update local context
    this.context = {
      vision: genesis.vision,
      requirements: genesis.requirements,
      designChoices: genesis.designChoices,
      agentBehavior: genesis.getAgentBehavior(this.name)
    };
    
    return this.context;
  }
}
```

---

### 8. Conflict Resolution

When agents make conflicting changes, Elara resolves them.

**Conflict Types**:
1. **File Conflicts**: Two agents edit the same file
2. **Design Conflicts**: Agent's implementation contradicts design choice
3. **Requirement Conflicts**: New requirement invalidates existing work

**Resolution Protocol**:
```typescript
async function resolveConflict(conflict: Conflict): Promise<Resolution> {
  // 1. Pause affected agents
  await pauseAgents(conflict.involvedAgents);
  
  // 2. Elara analyzes conflict
  const analysis = await elara.analyzeConflict(conflict);
  
  // 3. Check Genesis Station for guidance
  const guidance = await genesisStation.getGuidance(conflict.type);
  
  // 4. Attempt auto-resolution
  if (conflict.type === 'file_conflict') {
    // Use 3-way merge
    const resolution = await merge(conflict.baseVersion, conflict.changes);
    
    if (resolution.success) {
      return resolution;
    }
  }
  
  // 5. Escalate to user if auto-resolution fails
  const userDecision = await promptUser({
    title: 'Agent Conflict',
    description: analysis.summary,
    options: analysis.suggestedResolutions
  });
  
  // 6. Apply resolution
  await applyResolution(userDecision);
  
  // 7. Resume agents
  await resumeAgents(conflict.involvedAgents);
  
  return userDecision;
}
```

---

## 🔌 Integration Points

### AzStudio ↔ BuildSpaces API

```typescript
// BuildSpaces exposes these endpoints for AzStudio

POST   /api/buildspaces/projects/:id/agents/init
  // Initialize multi-agent session
  
GET    /api/buildspaces/projects/:id/genesis
  // Get Genesis Station context
  
POST   /api/buildspaces/projects/:id/genesis/update
  // Agent logs implementation decision
  
WS     /api/buildspaces/projects/:id/agents/stream
  // Real-time agent activity stream
  
POST   /api/buildspaces/agents/:name/instruct
  // User sends instruction to specific agent
  
POST   /api/buildspaces/elara/chat
  // User chats with Elara
```

### AzStudio ↔ AI Family Service

```typescript
// AzStudio calls AI Family Service for agent intelligence

POST   /api/ai-family/chat
  // Get agent response
  
POST   /api/ai-family/agents/:name/execute-task
  // Agent executes a coding task
  
GET    /api/ai-family/agents/:name/status
  // Get agent status
```

---

## 📊 Performance Requirements

- **Agent Response Time**: <2s for simple tasks, <30s for complex tasks
- **Genesis Station Sync**: <500ms
- **Real-time Updates**: <100ms latency via WebSocket
- **Concurrent Agents**: Support 5+ agents working simultaneously
- **File System**: Handle projects with 1000+ files

---

## 🧪 Testing Requirements

### Unit Tests
- Agent task execution
- Conflict resolution logic
- Genesis Station sync

### Integration Tests
- Multi-agent collaboration scenarios
- Elara orchestration flows
- User instruction handling

### E2E Tests
- Full project lifecycle (idea → deploy)
- Agent handoffs
- Real-time UI updates

---

## 📋 Acceptance Criteria

**Multi-Agent Mode is complete when**:

✅ User can open Code Chamber from BuildSpaces  
✅ Elara initializes 3+ agents for a project  
✅ Agents read Genesis Station before starting work  
✅ User can chat with Elara to give high-level instructions  
✅ User can send direct instructions to individual agents  
✅ Agents' cursors are visible in real-time in the editor  
✅ Agent activity feed shows live updates  
✅ Genesis Station updates when agents make decisions  
✅ Agents sync with Genesis Station every 5 minutes  
✅ Conflicts are detected and resolved (auto or manual)  
✅ User can define agent behavior profiles  
✅ Full project can be built by agents with minimal user intervention  

---

## 🚀 Implementation Phases

### Phase 1: Foundation (Week 1-2)
- Multi-agent runtime in AzStudio
- Genesis Station data model
- Basic Elara orchestration

### Phase 2: Collaboration (Week 3-4)
- Real-time agent cursors
- Activity feed
- Task progress board

### Phase 3: Intelligence (Week 5-6)
- Agent behavior profiles
- Genesis Station sync protocol
- Conflict resolution

### Phase 4: Polish (Week 7-8)
- User instruction UI
- Performance optimization
- Testing & documentation

---

## 📞 Contact

**Questions?** Reach out to:
- BuildSpaces Team: buildspaces@azora.dev
- AI Family Team: ai-family@azora.dev

---

*"Ngiyakwazi ngoba sikwazi" - "I can because we can"*

**Let's build the future of collaborative AI development!** 🚀
