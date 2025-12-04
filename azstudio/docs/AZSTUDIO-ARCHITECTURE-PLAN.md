# AzStudio Architecture Plan — VS Code Fork with Azora AI Agents

> **Vision**: Transform AzStudio into a full VS Code fork that integrates Azora's multi-agent AI system directly into the editor experience, providing inline chat, agent sessions, and Constitutional AI validation as first-class features.

**Document Version**: 2.0  
**Last Updated**: December 5, 2025  
**Source**: Analysis of current `azstudio/`, `archive/azstudio-old/`, `TASKS-AGENT-ARCHITECTURE.md`, and VS Code repo

---

## 1. Current State Analysis

### What AzStudio Already Has ✅ (Tasks 1-10 Complete)

| Layer | Component | Status | Key Files | Notes |
|-------|-----------|--------|-----------|-------|
| **Shell** | Electron 28 + React 18 | ✅ Complete | `main.ts`, `preload.ts` | Custom window, IPC bridge, auto-updater |
| **Editor** | Monaco Editor | ✅ Complete | `MonacoEditor.tsx`, `EditorTabs.tsx` | Multi-file tabs, syntax highlighting, diff viewer |
| **Indexing** | ProjectIndexer | ✅ Complete | `ProjectIndexer.ts`, `FileWatcher.ts` | AST parsing, symbol search, real-time file watching |
| **Framework** | FrameworkDetector | ✅ Complete | `FrameworkDetector.ts` | Detects React, Next.js, Tailwind, Prisma, etc. |
| **Visual** | React Flow Canvas | ✅ Complete | `VisualCanvas.tsx`, `ComponentPalette.tsx` | Service nodes, DB nodes, API nodes, drag-and-drop |
| **AI** | AIOrchestrator | ✅ Complete | `AIOrchestrator.ts` | OpenAI GPT-4 + Anthropic Claude, caching, cost tracking |
| **AI** | ConstitutionalCore | ✅ Complete | `ConstitutionalCore.ts` | Divine Law principles, ethical validation |
| **AI** | ElaraAgenticService | ✅ Complete | `ElaraAgenticService.ts` | Content generation with constitutional checks |
| **AI** | PlannerAgent | ✅ Complete | `PlannerAgent.ts` | Task decomposition, DAG generation |
| **AI** | CodeGeneratorAgent | ✅ Complete | `CodeGeneratorAgent.ts` | Context-aware code generation |
| **Git** | GitService | ✅ Complete | `GitService.ts`, `GitPanel.tsx` | Isomorphic-git, staging, commits, branches, remotes |
| **History** | VersionHistory | ✅ Complete | `VersionHistory.ts`, `VersionHistoryViewer.tsx` | Change tracking, branching, merging, revert |
| **Security** | SecretsVault | ✅ Complete | `SecretsVault.ts` | AES-256-GCM encryption, OS keychain integration |
| **Security** | PermissionManager | ✅ Complete | `PermissionManager.ts`, `PermissionPanel.tsx` | File/network permissions, audit logging |
| **Security** | NetworkSandbox | ✅ Complete | `NetworkSandbox.ts` | Domain allowlisting, network request monitoring |
| **Code** | CodeExecutor | ✅ Complete | `CodeExecutor.ts` | AST transformations, Babel-based parsing |
| **Code** | ChangesetManager | ✅ Complete | `ChangesetManager.ts` | Atomic changesets, rollback, backup |
| **Code** | ServiceGenerator | ✅ Complete | `ServiceGenerator.ts` | Full Express service scaffolding |
| **Code** | APIGenerator | ✅ Complete | `APIGenerator.ts` | REST endpoint generation, Zod schemas |
| **Design** | DesignTokenManager | ✅ Complete | `DesignTokenManager.ts` | Tailwind config, CSS variables |
| **Design** | DesignFilterEngine | ✅ Complete | `DesignFilterEngine.ts` | Global style transformations |
| **UI** | UIBuilder | ✅ Complete | `UIBuilder.ts` | Page layout generation, React/Next.js code gen |
| **UI** | FormBuilder | ✅ Complete | `FormBuilder.ts` | Form component generation |
| **DB** | DatabaseDesigner | ✅ Complete | `DatabaseDesigner.ts`, `DatabaseCanvas.tsx` | Visual Prisma schema design, relationships |
| **Test** | VerificationPipeline | ✅ Complete | `VerificationPipeline.ts` | Jest integration, test result parsing |
| **Test** | VerificationGate | ✅ Complete | `VerificationGate.ts` | Pre-commit quality gates per change type |
| **Test** | PlaywrightRunner | ✅ Complete | `PlaywrightRunner.ts` | E2E test execution, screenshots, traces |
| **Perf** | AccessibilityChecker | ✅ Complete | `AccessibilityChecker.ts` | Accessibility validation |
| **Perf** | LighthouseRunner | ✅ Complete | `LighthouseRunner.ts` | Performance measurement |
| **Deploy** | DeploymentManager | ✅ Complete | `DeploymentManager.ts` | Multi-provider deployment |
| **Deploy** | RailwayDeployment | ✅ Complete | `RailwayDeployment.ts` | Railway-specific deployment |
| **Deploy** | VercelDeployment | ✅ Complete | `VercelDeployment.ts` | Vercel-specific deployment |
| **Deploy** | DockerDeployment | ✅ Complete | `DockerDeployment.ts` | Docker containerization |
| **Collab** | CollaborationServer | ✅ Complete | `CollaborationServer.ts` | Real-time collaboration |
| **Collab** | OperationalTransform | ✅ Complete | `OperationalTransform.ts` | OT for concurrent editing |
| **Collab** | CommentingSystem | ✅ Complete | `CommentingSystem.ts`, `CommentThread.tsx` | Inline comments, threads |
| **Media** | TextToSpeech | ✅ Complete | `TextToSpeech.ts` | TTS generation |
| **Media** | VideoGeneration | ✅ Complete | `VideoGeneration.ts` | Video content generation |
| **Courses** | CourseBuilder | ✅ Complete | `CourseBuilder.ts`, `CourseBuilder.tsx` | Educational content studio |
| **Monitor** | MetricsDashboard | ✅ Complete | `MetricsDashboard.tsx` | Analytics visualization |
| **Monitor** | ErrorTracking | ✅ Complete | `ErrorTracking.ts` | Error monitoring |
| **Extensions** | VS Code extensions folder | ⚠️ Partial | `extensions/` | Extensions exist but not wired into runtime |

### What's Missing / Needs Alignment 🔄

| Feature | VS Code Implementation | AzStudio Gap | Priority |
|---------|------------------------|--------------|----------|
| Chat Panel UI | `workbench/contrib/chat/` | Custom React, not VS Code workbench | P0 |
| Inline Chat | `inlineChatController.ts` | Not implemented | P0 |
| Agent Sessions | `chatSessions.contribution.ts` | Not implemented | P0 |
| Extension Host | Full extension API | No extension host; services hardcoded | P0 |
| Chat Participants | `chatParticipant.contribution.ts` | Not implemented | P0 |
| Agent Communication | Redis EventBus + MCP | EventBus done, task handoff not done | P1 |
| Knowledge Graph | Graph versioning | Vector search done, graph not done | P1 |
| Copilot Auth | OAuth + consent | Stub exists, real auth not done | P1 |

---

## 2. Architecture Vision

### High-Level System Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                                 AzStudio Desktop App                                     │
│  ┌───────────────────────────────────────────────────────────────────────────────────┐  │
│  │                          VS Code Workbench (Forked)                                │  │
│  │                                                                                    │  │
│  │  ┌─────────────┐  ┌──────────────────────────┐  ┌────────────────────────────┐   │  │
│  │  │ Activity Bar│  │      Editor Area          │  │     Auxiliary Bar          │   │  │
│  │  │             │  │ ┌──────────────────────┐  │  │  ┌────────────────────┐   │   │  │
│  │  │ 📁 Explorer │  │ │ Monaco Editor        │  │  │  │ @elara Chat        │   │   │  │
│  │  │ 🔍 Search   │  │ │ (IntelliSense, AST)  │  │  │  │ @sankofa Code      │   │   │  │
│  │  │ 🌿 Git      │  │ └──────────────────────┘  │  │  │ @imani Design      │   │   │  │
│  │  │ 🤖 Agents   │  │ ┌──────────────────────┐  │  │  │ @kofi Math         │   │   │  │
│  │  │ 🎨 Canvas   │  │ │ Visual Canvas        │  │  │  │ ...                │   │   │  │
│  │  │ 🗃️ Database │  │ │ (React Flow)         │  │  │  └────────────────────┘   │   │  │
│  │  │ 🔐 Secrets  │  │ └──────────────────────┘  │  │  ┌────────────────────┐   │   │  │
│  │  └─────────────┘  │ ┌──────────────────────┐  │  │  │ Agent Sessions     │   │   │  │
│  │                   │ │ Database Designer    │  │  │  │ - Active Tasks     │   │   │  │
│  │                   │ │ (Prisma Visual)      │  │  │  │ - Constitutional ✓ │   │   │  │
│  │                   │ └──────────────────────┘  │  │  └────────────────────┘   │   │  │
│  │                   └──────────────────────────┘  └────────────────────────────┘   │  │
│  │                                                                                    │  │
│  │  ┌─────────────────────────────────────────────────────────────────────────────┐  │  │
│  │  │                              Panel Area                                      │  │  │
│  │  │  ┌─────────┐ ┌─────────┐ ┌───────────┐ ┌──────────┐ ┌─────────────────────┐ │  │  │
│  │  │  │Terminal │ │Problems │ │Output     │ │Task Board│ │Inline Chat          │ │  │  │
│  │  │  └─────────┘ └─────────┘ └───────────┘ └──────────┘ └─────────────────────┘ │  │  │
│  │  └─────────────────────────────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                              Azora Services Layer                                       │
│  ┌────────────────┐ ┌────────────────┐ ┌────────────────┐ ┌────────────────────────┐   │
│  │  AI Router     │ │ Knowledge      │ │ Agent          │ │ Constitutional         │   │
│  │  ┌──────────┐  │ │ Ocean          │ │ Execution      │ │ Validator              │   │
│  │  │ LOCAL_LLM│  │ │ ┌────────────┐ │ │ ┌────────────┐ │ │ ┌──────────────────┐  │   │
│  │  │ RAP_SYS  │  │ │ │ In-Memory  │ │ │ │ Runtime    │ │ │ │ DIVINE_LAW       │  │   │
│  │  │ EXTERNAL │  │ │ │ pgvector   │ │ │ │ Sandbox    │ │ │ │ PRINCIPLES       │  │   │
│  │  └──────────┘  │ │ │ Pinecone   │ │ │ │ Redis Bus  │ │ │ └──────────────────┘  │   │
│  └────────────────┘ │ └────────────┘ │ │ └────────────┘ │ └────────────────────────┘   │
│                     └────────────────┘ └────────────────┘                              │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                              Extension Host                                             │
│  ┌────────────────────────────────────────────────────────────────────────────────────┐ │
│  │ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌────────────┐│ │
│  │ │Chat Extension│ │Language Model│ │  Tools API   │ │Custom Agents │ │   MCP      ││ │
│  │ │     API      │ │     API      │ │              │ │              │ │  Servers   ││ │
│  │ └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘ └────────────┘│ │
│  └────────────────────────────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                              Existing Services (Migrate)                                │
│  ┌────────────┐┌────────────┐┌────────────┐┌────────────┐┌────────────┐┌────────────┐  │
│  │AIOrchestrator││CodeExecutor││GitService  ││SecretsVault││VersionHist.││ChangesetMgr│  │
│  └────────────┘└────────────┘└────────────┘└────────────┘└────────────┘└────────────┘  │
│  ┌────────────┐┌────────────┐┌────────────┐┌────────────┐┌────────────┐┌────────────┐  │
│  │ServiceGen  ││APIGenerator││UIBuilder   ││DatabaseDes.││DesignFilter││Verification│  │
│  └────────────┘└────────────┘└────────────┘└────────────┘└────────────┘└────────────┘  │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

### Data Flow for AI Chat

```
┌─────────────┐    ┌─────────────┐    ┌─────────────────────┐    ┌─────────────────┐
│  User Input │───>│ Chat Panel  │───>│ AzoraAgentsContrib  │───>│  AI Router      │
│  (@elara    │    │ (VS Code)   │    │ (route to agent)    │    │  (tier routing) │
│   prompt)   │    └─────────────┘    └─────────────────────┘    └────────┬────────┘
└─────────────┘                                                           │
                                                                          ▼
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                              AI Routing Tiers                                        │
│  ┌──────────────────┐    ┌──────────────────┐    ┌──────────────────────────────┐   │
│  │ 1. LOCAL_LLM     │───>│ 2. RAP_SYSTEM    │───>│ 3. EXTERNAL_LLM              │   │
│  │    (if available)│    │    (Knowledge    │    │    (OpenAI, Anthropic, etc.) │   │
│  │                  │    │     Ocean RAG)   │    │                              │   │
│  └──────────────────┘    └──────────────────┘    └──────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┬──────────────────┘
                                                                   │
                                                                   ▼
┌───────────────────────────────────────────────────────────────────────────────────────┐
│                         Constitutional Validation (Before Response)                    │
│  ┌────────────────────────────────────────────────────────────────────────────────┐  │
│  │ DIVINE_LAW_PRINCIPLES: [truth, ubuntu, equity, dignity, sustainability, ...]  │  │
│  │ validate(response) → { approved: boolean, concerns: string[], score: number } │  │
│  └────────────────────────────────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────────────────────────────────┘
                                                                   │
                                                                   ▼
┌─────────────┐    ┌─────────────────────────────────────────────────────────────────┐
│ Chat Panel  │<───│ Response with Constitutional Badge (✓ Approved / ⚠ Warning)    │
│ (streamed)  │    └─────────────────────────────────────────────────────────────────┘
└─────────────┘
```
│  │  Chat Extension API  │  Language Models API  │  Tools API  │  Custom Agents│  │
│  └───────────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Implementation Phases

### Phase 1: VS Code Core Integration (P0 — Critical Path)

**Goal**: Replace custom Electron shell with actual VS Code workbench, preserving existing services.

#### Task 1.1: Clone VS Code and Create AzStudio Fork
```bash
# Clone latest VS Code
git clone --depth 1 https://github.com/microsoft/vscode.git azstudio-vscode-base

# Key directories to understand:
# src/vs/workbench/           — Main workbench UI
# src/vs/workbench/contrib/   — Feature contributions (chat, git, etc.)
# src/vs/platform/            — Platform services (IPC, storage, etc.)
# src/vs/editor/              — Monaco editor
# extensions/                 — Built-in extensions
```

#### Task 1.2: Integrate Azora Branding & Theme
- **Product JSON**: `product.json` → AzStudio branding, icons, update URLs
- **Theme**: Custom Azora dark theme in `extensions/theme-azora/`
- **Welcome Page**: Custom welcome with Azora features

#### Task 1.3: Migrate Existing Services to VS Code DI
Current AzStudio services need to become VS Code services:

| Current Service | Target Location | Registration |
|-----------------|-----------------|--------------|
| `AIOrchestrator` | `src/vs/workbench/services/azora/aiOrchestrator.ts` | `registerSingleton(IAIOrchestrator, AIOrchestrator)` |
| `ElaraAgenticService` | `src/vs/workbench/services/azora/elaraService.ts` | Integrate with `IChatAgentService` |
| `ProjectIndexer` | `src/vs/workbench/services/azora/projectIndexer.ts` | Use existing VS Code indexing where possible |
| `ConstitutionalValidator` | `src/vs/workbench/services/azora/constitutionalValidator.ts` | New service |
| `KnowledgeOcean` | `src/vs/workbench/services/azora/knowledgeOcean.ts` | New service |

---

### Phase 2: Chat Integration (P0 — Core Feature)

**Goal**: Implement Azora agents as VS Code Chat Participants with full inline chat support.

#### Task 2.1: Register Azora Agents as Chat Participants

Based on VS Code's `chatParticipant.contribution.ts`, create contribution point:

```typescript
// src/vs/workbench/contrib/azora/browser/azoraAgents.contribution.ts

import { IChatAgentData, IChatAgentService } from '../../chat/common/chatAgents';
import { ChatAgentLocation, ChatModeKind } from '../../chat/common/constants';

const AZORA_AGENTS: IChatAgentData[] = [
  {
    id: 'azora.elara',
    name: 'elara',
    fullName: 'ELARA — Master Orchestrator',
    description: 'General-purpose AI tutor, coordinates with specialists',
    extensionId: new ExtensionIdentifier('azora.agents'),
    locations: [ChatAgentLocation.Chat, ChatAgentLocation.EditorInline],
    modes: [ChatModeKind.Ask, ChatModeKind.Agent],
    isDefault: true,
    metadata: {
      themeIcon: Codicon.sparkle,
    },
    slashCommands: [
      { name: 'teach', description: 'Explain a concept' },
      { name: 'debug', description: 'Help debug code' },
      { name: 'review', description: 'Review code quality' },
    ],
  },
  {
    id: 'azora.sankofa',
    name: 'sankofa',
    fullName: 'SANKOFA — Code Architect',
    description: 'Senior software engineer for architecture and debugging',
    // ... similar structure
  },
  // KOFI, ZURI, NIA, IMANI, AMARA, JABARI, THABO
];

export class AzoraAgentsContribution implements IWorkbenchContribution {
  constructor(
    @IChatAgentService private chatAgentService: IChatAgentService,
    @IAzoraAIRouter private aiRouter: IAzoraAIRouter,
  ) {
    this.registerAgents();
  }
  
  private registerAgents() {
    for (const agentData of AZORA_AGENTS) {
      const implementation = this.createAgentImplementation(agentData.id);
      this.chatAgentService.registerAgent(agentData.id, agentData);
      this.chatAgentService.registerAgentImplementation(agentData.id, implementation);
    }
  }
  
  private createAgentImplementation(agentId: string): IChatAgentImplementation {
    return {
      invoke: async (request, progress, history, token) => {
        // 1. Build context from history and attachments
        const context = this.buildContext(request, history);
        
        // 2. Route through Azora AI Router (tries Knowledge Ocean first)
        const response = await this.aiRouter.chat(
          request.message,
          agentId.replace('azora.', '').toUpperCase(),
          request.sessionResource.toString()
        );
        
        // 3. Constitutional validation (already done in router)
        
        // 4. Stream response
        progress({ kind: 'content', content: response.content });
        
        return { metadata: { model: response.model } };
      },
      provideFollowups: async (result, context, token) => {
        // Generate contextual follow-ups
        return [];
      },
    };
  }
}
```

#### Task 2.2: Implement Inline Chat with Azora Agents

Extend VS Code's `InlineChatController` to use Azora routing:

```typescript
// src/vs/workbench/contrib/inlineChat/browser/azoraInlineChatController.ts

export class AzoraInlineChatController extends InlineChatController2 {
  constructor(
    editor: ICodeEditor,
    @IAzoraConstitutionalValidator private validator: IAzoraConstitutionalValidator,
    // ... other deps
  ) {
    super(editor, /* ... */);
  }
  
  // Override to add Constitutional validation before applying edits
  async acceptSession() {
    const session = this._currentSession.get();
    if (!session) return;
    
    // Get proposed changes
    const changes = session.editingSession.getChanges();
    
    // Validate against Divine Law
    const analysis = await this.validator.validateChanges(changes);
    if (!analysis.approved) {
      this.showConstitutionalWarning(analysis.concerns);
      return;
    }
    
    await super.acceptSession();
  }
}
```

#### Task 2.3: Agent Sessions View

Create dedicated view for Azora agent sessions (like VS Code's Agent Sessions):

```typescript
// src/vs/workbench/contrib/azora/browser/agentSessionsView.ts

import { ViewPane } from '../../../browser/parts/views/viewPane';

export class AzoraAgentSessionsView extends ViewPane {
  // List active agent sessions
  // Show agent status (thinking, generating, validating)
  // Display Constitutional validation status
  // Allow switching between agents mid-session
}
```

---

### Phase 3: Azora-Specific Features (P1)

#### Task 3.1: Constitutional AI Integration

Make Constitutional validation visible in the UI:

```typescript
// Show validation status in chat responses
interface ConstitutionalBadge {
  status: 'approved' | 'warning' | 'rejected';
  principles: string[];  // Which principles were checked
  score: number;
}

// Add to chat response rendering
class AzoraChatResponseRenderer {
  renderConstitutionalBadge(analysis: EthicalAnalysis): HTMLElement {
    // Visual indicator showing Divine Law compliance
  }
}
```

#### Task 3.2: Knowledge Ocean Integration

Wire Knowledge Ocean for RAG-enhanced responses:

```typescript
// src/vs/workbench/services/azora/knowledgeOceanService.ts

export interface IKnowledgeOceanService {
  search(query: string): Promise<KnowledgeResult[]>;
  index(workspace: URI): Promise<void>;
  getRelevantContext(prompt: string): Promise<string>;
}

// Use in AI routing
class AzoraAIRouter {
  async chat(message: string, agent: string, sessionId: string) {
    // 1. Try Knowledge Ocean first (free, fast, accurate)
    const knowledgeAnswer = await this.knowledgeOcean.tryAnswer(message, agent);
    if (knowledgeAnswer) {
      return { content: knowledgeAnswer, model: 'knowledge-ocean', cost: 0 };
    }
    
    // 2. Augment with Knowledge Ocean context
    const context = await this.knowledgeOcean.getRelevantContext(message);
    
    // 3. Call external LLM with enriched context
    return this.callExternalLLM(message, context, agent);
  }
}
```

#### Task 3.3: Visual Canvas Integration

Keep React Flow canvas as a VS Code webview panel:

```typescript
// src/vs/workbench/contrib/azora/browser/visualCanvas.contribution.ts

class VisualCanvasEditorInput extends EditorInput {
  // Custom editor for .azcanvas files
}

class VisualCanvasEditor extends EditorPane {
  private webview: IWebviewElement;
  
  protected createEditor(parent: HTMLElement): void {
    this.webview = this.webviewService.createWebview({
      // Load React Flow canvas in webview
      contentOptions: {
        allowScripts: true,
        localResourceRoots: [/* canvas assets */],
      },
    });
    
    // Bridge between webview and VS Code services
    this.webview.onMessage(msg => {
      if (msg.type === 'generateCode') {
        this.aiRouter.generateCode(msg.payload);
      }
    });
  }
}
```

---

### Phase 4: Extension API (P2)

#### Task 4.1: Expose Azora Extension API

Allow third-party extensions to register agents:

```typescript
// vscode.d.ts additions
declare module 'vscode' {
  export namespace azora {
    export interface AzoraAgent {
      id: string;
      name: string;
      invoke(request: ChatRequest): Promise<ChatResponse>;
    }
    
    export function registerAgent(agent: AzoraAgent): Disposable;
    export function getKnowledgeOcean(): KnowledgeOceanApi;
    export function validateConstitutionally(content: string): Promise<EthicalAnalysis>;
  }
}
```

#### Task 4.2: MCP Server Integration

Enable Model Context Protocol servers as tool providers:

```typescript
// Support .github/agents/ folder for custom agents (VS Code pattern)
// Support MCP servers for tool execution
```

---

## 4. File Structure (Target)

```
azstudio/
├── .vscode/
├── build/                          # Build scripts
├── extensions/
│   ├── azora-agents/               # Built-in Azora agents extension
│   │   ├── package.json
│   │   └── src/
│   │       ├── agents/
│   │       │   ├── elara.ts
│   │       │   ├── sankofa.ts
│   │       │   └── ...
│   │       └── extension.ts
│   ├── theme-azora/                # Azora theme
│   └── ... (VS Code built-in extensions)
├── src/
│   └── vs/
│       ├── workbench/
│       │   ├── contrib/
│       │   │   ├── azora/          # Azora-specific contributions
│       │   │   │   ├── browser/
│       │   │   │   │   ├── azoraAgents.contribution.ts
│       │   │   │   │   ├── agentSessionsView.ts
│       │   │   │   │   ├── constitutionalBadge.ts
│       │   │   │   │   └── visualCanvas.contribution.ts
│       │   │   │   └── common/
│       │   │   │       └── azoraTypes.ts
│       │   │   ├── chat/           # VS Code chat (modified)
│       │   │   └── inlineChat/     # VS Code inline chat (modified)
│       │   └── services/
│       │       └── azora/
│       │           ├── aiOrchestrator.ts
│       │           ├── constitutionalValidator.ts
│       │           ├── knowledgeOcean.ts
│       │           └── agentExecution.ts
│       └── platform/
│           └── azora/
│               └── common/
│                   └── azora.ts    # Azora service interfaces
├── product.json                    # AzStudio branding
├── package.json
└── README.md
```

---

## 5. Key Integration Points with Azora Monorepo

| AzStudio Component | Monorepo Service | Integration Method |
|-------------------|------------------|-------------------|
| `IAzoraAIRouter` | `packages/shared-api/ai-router.ts` | Import & wrap as VS Code service |
| `IConstitutionalValidator` | `packages/shared-ai/base-agent.ts` | Import `DIVINE_LAW_PRINCIPLES` |
| `IKnowledgeOceanService` | `services/knowledge-ocean/` | HTTP API or direct import |
| `IAgentExecutionService` | `services/agent-execution/` | HTTP API for complex tasks |
| Agent Personalities | `AGENT_PROMPTS` in `ai-router.ts` | Import directly |

---

## 6. Migration Path from Current AzStudio

### Step 1: Preserve Existing Functionality
- Keep `src/main/services/` as-is during migration
- Create VS Code service wrappers that delegate to existing code

### Step 2: Gradual Migration
```typescript
// Wrapper example
@registerSingleton(IAIOrchestrator)
class AIOrchestrator implements IAIOrchestrator {
  private legacy = new LegacyAIOrchestrator(); // From src/main/services/
  
  async generateCode(prompt: string, context: AIContext): Promise<AIResponse> {
    return this.legacy.generateCode(prompt, context);
  }
}
```

### Step 3: Full Integration
- Once wrappers are stable, refactor legacy code into VS Code patterns
- Remove `src/main/` and `src/renderer/` directories
- Use VS Code's workbench exclusively

---

## 7. Development Workflow

### Building AzStudio
```bash
# Install dependencies
npm install

# Build VS Code
npm run compile

# Watch mode
npm run watch

# Run Electron
./scripts/code.sh  # or code.bat on Windows
```

### Testing Azora Agents
```bash
# Unit tests for agent logic
npm test -- --grep "Azora"

# Integration tests with Knowledge Ocean
npm run test:integration

# E2E tests for chat UI
npm run test:e2e
```

---

## 8. Timeline Estimate

| Phase | Duration | Dependencies |
|-------|----------|--------------|
| Phase 1: VS Code Integration | 4-6 weeks | VS Code build expertise |
| Phase 2: Chat Integration | 3-4 weeks | Phase 1 complete |
| Phase 3: Azora Features | 2-3 weeks | Phase 2 complete |
| Phase 4: Extension API | 2-3 weeks | Phase 3 complete |
| **Total** | **11-16 weeks** | |

---

## 9. Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| VS Code upstream changes | Pin to specific VS Code version, merge upstream quarterly |
| Performance with Constitutional validation | Cache validation results, async validation |
| Complexity of VS Code codebase | Start with minimal changes, use service wrappers |
| Extension compatibility | Test with popular extensions early |

---

## 10. Success Criteria

- [ ] AzStudio builds and runs as VS Code fork
- [ ] All Azora agents available as chat participants (`@elara`, `@sankofa`, etc.)
- [ ] Inline chat works with Constitutional validation
- [ ] Knowledge Ocean provides instant answers for indexed content
- [ ] Visual canvas accessible as editor panel
- [ ] Existing VS Code extensions work in AzStudio
- [ ] Performance: < 500ms response for Knowledge Ocean, < 3s for LLM

---

## Appendix A: VS Code Chat Architecture Reference

Key files from VS Code repo:
- `src/vs/workbench/contrib/chat/common/chatAgents.ts` — Agent service & types
- `src/vs/workbench/contrib/chat/browser/chatParticipant.contribution.ts` — Participant registration
- `src/vs/workbench/contrib/chat/browser/chatSessions.contribution.ts` — Session management
- `src/vs/workbench/contrib/inlineChat/browser/inlineChatController.ts` — Inline chat controller
- `src/vs/workbench/api/common/extHostChatAgents2.ts` — Extension host API

---

## Appendix B: Azora Agent Prompts (from `ai-router.ts`)

```typescript
export const AGENT_PROMPTS: Record<string, string> = {
  ELARA: `You are ELARA, the Master Orchestrator AI of Azora Nation...`,
  KOFI: `You are KOFI, the Math Maestro of Azora Nation...`,
  ZURI: `You are ZURI, the Science Sage of Azora Nation...`,
  SANKOFA: `You are SANKOFA, the Code Architect of Azora Nation...`,
  IMANI: `You are IMANI, the Creative Director of Azora Nation...`,
  NIA: `You are NIA, the Data Scientist of Azora Nation...`,
  AMARA: `You are AMARA, the Simulation Specialist of Azora Nation...`,
  JABARI: `You are JABARI, the Business Strategist of Azora Nation...`,
  THABO: `You are THABO, the Systems Thinker of Azora Nation...`,
};
```

---

## Appendix C: Complete Azora AI Family Reference

### The Nine Specialized Agents

| Agent | Domain | Personality | Key Capabilities |
|-------|--------|-------------|------------------|
| **ELARA** | General AI & Coordination | Wise, nurturing, Ubuntu-focused | Routes requests, coordinates workflows, ensures constitutional compliance |
| **SANKOFA** | Software Development | Precise, methodical, detail-oriented | Full-stack dev, code review, architecture, debugging, pair programming |
| **IMANI** | Visual Arts & Design | Artistic, expressive, visionary | UI/UX design, graphic design, video editing, animation, brand identity |
| **ZURI** | Natural Sciences | Curious, analytical, evidence-based | Scientific method, experiment design, data analysis, literature review |
| **KOFI** | Mathematics | Logical, patient, problem-solving | Step-by-step solving, proofs, algorithm design, mathematical modeling |
| **AMARA** | Simulation & Modeling | Experimental, innovative, hands-on | Physics simulations, economic modeling, virtual labs, game theory |
| **JABARI** | Business Strategy | Strategic, pragmatic, growth-minded | Business plans, market analysis, financial modeling, fundraising |
| **NIA** | Data Science & ML | Insightful, pattern-seeking, technical | Data cleaning, ML model building, deep learning, model deployment |
| **THABO** | DevOps & Infrastructure | Systematic, reliable, scalability-focused | Cloud architecture, IaC, CI/CD, monitoring, security hardening |

### Agent Specializations

```typescript
const SANKOFA_SPECIALIZATIONS = {
  languages: ['TypeScript', 'Python', 'Rust', 'Go', 'Java', 'C++'],
  frameworks: ['React', 'Next.js', 'Node.js', 'Django', 'FastAPI'],
  tools: ['Git', 'Docker', 'Kubernetes', 'CI/CD'],
  patterns: ['Microservices', 'Event-driven', 'DDD'],
};

const NIA_SPECIALIZATIONS = {
  ml: ['Scikit-learn', 'TensorFlow', 'PyTorch'],
  data: ['Pandas', 'NumPy', 'SQL', 'NoSQL'],
  viz: ['Matplotlib', 'Seaborn', 'Plotly', 'D3.js'],
  mlops: ['Model serving', 'Monitoring', 'A/B testing'],
};

const THABO_SPECIALIZATIONS = {
  cloud: ['AWS', 'GCP', 'Azure', 'Railway', 'Vercel'],
  iac: ['Terraform', 'Pulumi', 'CloudFormation'],
  containers: ['Docker', 'Kubernetes', 'Docker Compose'],
  monitoring: ['Prometheus', 'Grafana', 'ELK stack'],
};
```

### Multi-Agent Workflow Example

```
User: "Build a fitness tracking app"
  ↓
ELARA: Coordinates the team
  ↓
IMANI: Designs UI/UX mockups
  ↓
SANKOFA: Builds React Native app
  ↓
NIA: Creates ML model for activity recognition
  ↓
THABO: Sets up backend infrastructure
  ↓
JABARI: Develops monetization strategy
```

---

## Appendix D: Existing AzStudio Features Inventory

### From Archive Analysis (Tasks 1-20 Specification)

#### ✅ Completed (Tasks 1-10)

1. **Task 1: Electron Desktop Shell**
   - Native Windows .exe with Electron 28
   - Secure IPC, context isolation
   - Auto-updater, custom title bar
   - File system operations

2. **Task 2: Monaco Editor Integration**
   - Full IntelliSense
   - Multi-file editing with tabs
   - Diff viewer, dirty state tracking
   - Keyboard shortcuts

3. **Task 3: Project Indexer & File Watcher**
   - Full AST parsing
   - Symbol extraction
   - Real-time file watching
   - Framework detection

4. **Task 4: Visual Canvas with React Flow**
   - Service, UI, Database, API nodes
   - Drag-and-drop placement
   - MiniMap and zoom controls
   - Component palette

5. **Task 5: AI Orchestration Layer**
   - OpenAI GPT-4 + Anthropic Claude
   - Context management
   - Task planning (DAG)
   - Response caching, cost tracking

6. **Task 6: Code Executor with AST Transformations**
   - Babel-based AST parsing
   - Changeset management with rollback
   - Service boilerplate generation
   - API endpoint generation

7. **Task 7: Design Filter Engine**
   - Design token management
   - Tailwind config generation
   - Global design transformations
   - Predefined filters (Modern SaaS, Enterprise, etc.)

8. **Task 8: Verification Pipeline**
   - Jest test runner integration
   - Test result parsing
   - Automated verification reports

9. **Task 9: Visual UI Builder**
   - Page layout generation
   - Component hierarchy
   - React/Next.js code generation
   - Form builder

10. **Task 10: Database Schema Designer**
    - Visual database modeling
    - Prisma schema generation
    - Relationship drawing (1:1, 1:N, N:M)
    - Migration preview

#### 🔲 Planned (Tasks 11-20)

11. **Platform Templates**
    - Pre-built project scaffolds
    - Industry-specific templates

12. **Service Component Library**
    - Auth Service (JWT, MFA, OAuth)
    - Payment Service (Stripe)
    - Email Service (SendGrid, SES, SMTP)
    - Storage Service

13. **Course Content Studio**
    - Educational content creation
    - Lesson builder
    - Assessment generation

14. **Git Integration** ✅ (Implemented)
    - Branch management
    - Remote management
    - Full commit history

15. **Security & Secrets Management** ✅ (Implemented)
    - Secrets Vault (AES-256-GCM)
    - Permission Manager
    - Network Sandbox
    - Audit logging

16. **Deployment System** ✅ (Partially)
    - Railway deployment
    - Vercel deployment
    - Docker deployment
    - Monitoring integration

17. **Monitoring & Analytics**
    - Metrics dashboard
    - Error tracking
    - Performance monitoring

18. **Real-time Collaboration** ✅ (Implemented)
    - Operational Transform
    - Remote cursors
    - Commenting system

19. **Windows Packaging**
    - Code signing
    - Auto-updater
    - Installer customization

20. **Testing & QA** ✅ (Implemented)
    - Playwright E2E
    - Accessibility checking
    - Performance measurement

---

## Appendix E: Agent Execution Framework Status

From `TASKS-AGENT-ARCHITECTURE.md`:

### Completed ✅
- Agent runtime skeleton
- Basic sandbox executor
- AI provider router
- Knowledge Ocean vector search (in-memory + db fallback)
- Redis-enabled EventBus
- Minimal TaskBoard UI

### In Progress 🔄
- Tests and fallback to other providers

### Not Started ❌
- Copilot extension bridge with real authentication
- Knowledge graph & versioning
- pgvector setup & migration
- Agent collaboration & handoff semantics
- Advanced UI features (drag/drop, code apply)
- End-to-end integration tests with real provider keys

---

## Appendix F: VS Code Contribution Points for AzStudio

### Required Contribution Points

```json
{
  "contributes": {
    "chatParticipants": [
      {
        "id": "azora.elara",
        "name": "elara",
        "description": "Master Orchestrator AI",
        "isDefault": true
      },
      {
        "id": "azora.sankofa",
        "name": "sankofa", 
        "description": "Code Architect"
      }
    ],
    "views": {
      "azora-agents": [
        {
          "id": "azora.agentSessions",
          "name": "Agent Sessions"
        },
        {
          "id": "azora.taskBoard",
          "name": "Task Board"
        },
        {
          "id": "azora.knowledgeOcean",
          "name": "Knowledge Ocean"
        }
      ]
    },
    "commands": [
      {
        "command": "azora.startChat",
        "title": "Start Chat with Agent"
      },
      {
        "command": "azora.inlineChat",
        "title": "Inline Chat"
      },
      {
        "command": "azora.validateConstitutional",
        "title": "Validate with Divine Law"
      }
    ],
    "customEditors": [
      {
        "viewType": "azora.visualCanvas",
        "displayName": "Visual Canvas",
        "selector": [{ "filenamePattern": "*.azcanvas" }]
      },
      {
        "viewType": "azora.databaseDesigner",
        "displayName": "Database Designer",
        "selector": [{ "filenamePattern": "*.azschema" }]
      }
    ]
  }
}
```

---

*Document Version: 2.0*
*Last Updated: December 5, 2025*
*Author: Azora AI Architecture Team*
*Sources: `azstudio/`, `archive/azstudio-old/`, `docs/AI-FAMILY-ARCHITECTURE.md`, `TASKS-AGENT-ARCHITECTURE.md`*
