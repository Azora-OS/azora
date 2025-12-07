# AzStudio Sample Code & Examples

This document contains code snippets that show how to integrate the Azora AI agents with VS Code contributions and how to integrate the Constitutional validator in the inline editor flow.

---

## 1) Agent Registration Example (Built-in Agent - ELARA)
```ts
// src/vs/workbench/contrib/azora/browser/elaraAgentRegistration.ts
import { IChatAgentService } from 'vs/workbench/contrib/chat/common/chatAgents';
import { ChatAgentLocation, ChatModeKind } from 'vs/workbench/contrib/chat/common/constants';

export function registerElara(chatAgentService: IChatAgentService, aiRouter: IAzoraAIRouter) {
  const agentData = {
    id: 'azora.elara',
    name: 'elara',
    fullName: 'ELARA — Master Orchestrator',
    description: 'General-purpose AI tutor, coordinates with specialists',
    locations: [ChatAgentLocation.Chat, ChatAgentLocation.EditorInline],
    modes: [ChatModeKind.Ask, ChatModeKind.Agent],
    isDefault: true,
  };

  chatAgentService.registerAgent(agentData.id, agentData);

  const implementation: IAzoraAgent = {
    invoke: async (request, progress, token) => {
      const response = await aiRouter.chat(request.prompt, 'azora.elara', request.sessionId);
      return { content: response.content, metadata: response.metadata };
    },
  };
  
  chatAgentService.registerAgentImplementation(agentData.id, implementation);
}
```

---

## 2) Inline Chat Controller Hook (Constitutional Validation)
```ts
// src/vs/workbench/contrib/inlineChat/browser/azoraInlineChatController.ts
import { InlineChatController2 } from 'vs/workbench/contrib/inlineChat/browser/inlineChatController2';

export class AzoraInlineChatController extends InlineChatController2 {
  constructor(@IConstitutionalValidator private validator: IConstitutionalValidator, ...rest) {
    super(...rest);
  }

  // Override to call validator before applying changes
  async acceptSession() {
    const session = this._currentSession.get();
    if (!session) return;

    const changes = session.editingSession.getChanges();
    const validation = await this.validator.validateEdits(changes);
    if (!validation.approved) {
      // show a dialog to the user with concerns
      this.showConstitutionalWarning(validation.issues);
      return;
    }
    return super.acceptSession();
  }
}
```

---

## 3) Agent Task Scheduling (Backend API)
```ts
// POST /api/tasks
app.post('/api/tasks', async (req, res) => {
  const { name, sessionId, agentId, payload } = req.body;
  const task = await TaskService.create({ name, sessionId, agentId, payload, status: 'scheduled' });
  EventBus.publish('TASK_SCHEDULED', { resourceId: task.id, task });
  res.json(task);
});
```

---

## 4) Simple `IAzoraAIRouter` Example
```ts
export class AzoraAIRouter implements IAzoraAIRouter {
  constructor(private knowledgeOcean: IKnowledgeOceanService, private providerAdapter: AIProviderAdapter, private validator: IConstitutionalValidator) {}

  async chat(prompt: string, agentId: string, sessionId?: string) {
    // RAG attempt
    const knowledge = await this.knowledgeOcean.search(prompt);
    if (knowledge.length) {
      return { content: knowledge[0].text, model: 'knowledge-ocean', cost: 0 };
    }

    // Call provider
    const response = await this.providerAdapter.chat({ prompt, sessionId, agentId });

    // Validate
    const validation = await this.validator.validateResponse(response.content);
    return { content: response.content, metadata: { model: response.model, validation}};
  }
}
```

---

## 5) Sample `vscode` extension API (for third-party agents)
```ts
// in a typical extension
import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
  const agent = {
    id: 'com.example.helper',
    name: 'Example Helper',
    locations: ['chat'],
    modes: ['ask']
  };
  
  vscode.azora.registerAgent(agent, {
    invoke: async (request, onProgress) => {
      onProgress({ kind: 'content', content: 'Thinking...' });
      const res = await callMyBackend(request);
      onProgress({ kind: 'content', content: res.content });
      return { content: res.content };
    }
  });
}
```

---

*Document Version: 1.0*  
*Author: Azora Engineering*  
*Date: Dec 5, 2025
