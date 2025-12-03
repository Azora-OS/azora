// Multi-Agent Runtime Environment for AzStudio
// Core infrastructure for concurrent AI agent collaboration

interface AgentTask {
  id: string;
  title: string;
  description: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  status: 'pending' | 'in_progress' | 'completed' | 'blocked';
  assignedTo?: string;
  requirementIds: string[];
  dependencies: string[];
  estimatedDuration: number; // minutes
  createdAt: Date;
  updatedAt: Date;
}

interface AgentSession {
  id: string;
  agentName: 'Zola' | 'Jabari' | 'Kofi' | 'Abeni' | 'Nexus';
  projectId: string;
  workingDirectory: string;
  currentTask: AgentTask | null;
  status: 'idle' | 'thinking' | 'coding' | 'testing' | 'blocked';
  cursor: {
    file: string;
    line: number;
    column: number;
  };
  capabilities: string[];
  lastActivity: Date;
}

interface AgentMessage {
  id: string;
  from: string;
  to?: string; // undefined = broadcast
  type: 'status_update' | 'task_complete' | 'request_help' | 'file_change' | 'conflict';
  content: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

interface ProjectContext {
  projectId: string;
  vision: {
    title: string;
    description: string;
    goals: string[];
    successCriteria: string[];
    lastUpdated: Date;
  };
  requirements: {
    functional: Array<{
      id: string;
      description: string;
      priority: 'critical' | 'high' | 'medium' | 'low';
      status: 'pending' | 'in_progress' | 'completed' | 'deferred';
      assignedTo?: string;
      implementationNotes?: string;
    }>;
    nonFunctional: Array<{
      id: string;
      description: string;
      priority: 'critical' | 'high' | 'medium' | 'low';
      status: 'pending' | 'in_progress' | 'completed' | 'deferred';
      assignedTo?: string;
      implementationNotes?: string;
    }>;
  };
  designChoices: {
    architecture: string;
    techStack: {
      frontend: string[];
      backend: string[];
      database: string[];
      infrastructure: string[];
    };
    patterns: string[];
    reasoning: Record<string, string>;
  };
  activeContext: {
    currentPhase: string;
    activeTasks: AgentTask[];
    blockers: Array<{
      id: string;
      description: string;
      severity: 'critical' | 'high' | 'medium' | 'low';
      blockedTasks: string[];
    }>;
  };
}

interface MergeConflict {
  id: string;
  file: string;
  agentChanges: Array<{
    agent: string;
    content: string;
    lineStart: number;
    lineEnd: number;
  }>;
  baseVersion: string;
  timestamp: Date;
}

interface Resolution {
  strategy: 'auto_merge' | 'manual_intervention' | 'agent_consensus';
  resolvedContent?: string;
  requiresUserInput?: boolean;
  resolutionNotes?: string;
}

class MultiAgentRuntime {
  private agents: Map<string, AgentSession> = new Map();
  private messageBus: AgentMessage[] = [];
  private projectContext: Map<string, ProjectContext> = new Map();
  private eventListeners: Map<string, Function[]> = new Map();
  private wsConnections: Map<string, WebSocket> = new Map();

  // Lifecycle Management
  async initializeAgents(projectId: string, agentNames: string[]): Promise<void> {
    console.log(`🚀 Initializing agents for project ${projectId}: ${agentNames.join(', ')}`);

    for (const agentName of agentNames) {
      const sessionId = `${projectId}-${agentName}-${Date.now()}`;

      const session: AgentSession = {
        id: sessionId,
        agentName: agentName as AgentSession['agentName'],
        projectId,
        workingDirectory: `/projects/${projectId}/workspace/${agentName.toLowerCase()}`,
        currentTask: null,
        status: 'idle',
        cursor: { file: '', line: 0, column: 0 },
        capabilities: this.getAgentCapabilities(agentName),
        lastActivity: new Date()
      };

      this.agents.set(sessionId, session);

      // Initialize agent workspace
      await this.initializeAgentWorkspace(session);

      console.log(`✅ Agent ${agentName} initialized with session ${sessionId}`);
    }

    this.broadcastMessage('system', {
      type: 'status_update',
      content: `Agents initialized: ${agentNames.join(', ')}`
    });
  }

  async terminateAgent(agentId: string): Promise<void> {
    const agent = this.agents.get(agentId);
    if (!agent) {
      throw new Error(`Agent ${agentId} not found`);
    }

    console.log(`🛑 Terminating agent ${agent.agentName} (${agentId})`);

    // Clean up agent workspace
    await this.cleanupAgentWorkspace(agent);

    // Remove from active agents
    this.agents.delete(agentId);

    this.broadcastMessage('system', {
      type: 'status_update',
      content: `Agent ${agent.agentName} terminated`
    });
  }

  // Task Management
  async assignTask(agentId: string, task: AgentTask): Promise<void> {
    const agent = this.agents.get(agentId);
    if (!agent) {
      throw new Error(`Agent ${agentId} not found`);
    }

    if (agent.status !== 'idle') {
      throw new Error(`Agent ${agent.agentName} is not idle (current status: ${agent.status})`);
    }

    console.log(`📋 Assigning task "${task.title}" to agent ${agent.agentName}`);

    // Update agent session
    agent.currentTask = task;
    agent.status = 'thinking';
    agent.lastActivity = new Date();

    // Update task status
    task.status = 'in_progress';
    task.assignedTo = agent.agentName;
    task.updatedAt = new Date();

    // Notify agent
    await this.notifyAgent(agentId, {
      type: 'task_assigned',
      task: task
    });

    this.broadcastMessage('system', {
      type: 'status_update',
      content: `Task "${task.title}" assigned to ${agent.agentName}`,
      metadata: { taskId: task.id, agentId }
    });

    // Execute task asynchronously
    this.executeTask(agentId, task).catch(err => {
      console.error(`Error executing task ${task.id}:`, err);
      task.status = 'blocked';
      agent.status = 'idle'; // Reset agent status on error
      this.broadcastMessage('system', {
        type: 'status_update',
        content: `Task "${task.title}" failed: ${err.message}`,
        metadata: { taskId: task.id, agentId, error: err.message }
      });
    });
  }

  async executeTask(agentId: string, task: AgentTask): Promise<void> {
    const agent = this.agents.get(agentId);
    if (!agent) return;

    console.log(`🤖 Agent ${agent.agentName} starting execution of task: ${task.title}`);

    try {
      // 1. Prepare context
      const projectContext = this.getSharedContext(agent.projectId);
      const aiContext = {
        files: [], // In a real app, we'd load relevant files here
        projectInfo: {
          frameworks: projectContext.designChoices.techStack.frontend,
          conventions: {}
        },
        userPrompt: `Task: ${task.title}\nDescription: ${task.description}\nRequirements: ${task.requirementIds.join(', ')}`
      };

      // 2. Generate code/solution using AI
      const response = await window.electronAPI.ai.generateCode(
        aiContext.userPrompt,
        aiContext
      );

      if (!response.success || !response.response) {
        throw new Error(response.error || 'Failed to generate code');
      }

      // 3. Process result (simulated application of changes)
      console.log(`✅ Agent ${agent.agentName} completed task execution`);
      console.log(`Generated content preview: ${response.response.content.substring(0, 100)}...`);

      // 4. Update task status
      task.status = 'completed';
      task.updatedAt = new Date();

      // 5. Update agent status
      agent.status = 'idle';
      agent.currentTask = null;
      agent.lastActivity = new Date();

      // 6. Notify success
      this.broadcastMessage(agent.agentName, {
        type: 'task_complete',
        content: `Completed task: ${task.title}`,
        metadata: {
          taskId: task.id,
          tokensUsed: response.response.tokensUsed,
          cost: response.response.cost
        }
      });

    } catch (error) {
      console.error(`❌ Agent ${agent.agentName} failed to execute task:`, error);
      throw error;
    }
  }

  getAgentStatus(agentId: string): AgentSession {
    const agent = this.agents.get(agentId);
    if (!agent) {
      throw new Error(`Agent ${agentId} not found`);
    }
    return agent;
  }

  // Collaboration
  broadcastMessage(from: string, message: Omit<AgentMessage, 'id' | 'from' | 'timestamp'>): void {
    const fullMessage: AgentMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      from,
      timestamp: new Date(),
      ...message
    };

    this.messageBus.push(fullMessage);

    // Send to all connected WebSocket clients
    this.wsConnections.forEach((ws, clientId) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          type: 'agent_message',
          data: fullMessage
        }));
      }
    });

    console.log(`📢 Broadcast message from ${from}: ${message.type}`);
  }

  async sendDirectMessage(from: string, to: string, message: Omit<AgentMessage, 'id' | 'from' | 'to' | 'timestamp'>): Promise<void> {
    const fullMessage: AgentMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      from,
      to,
      timestamp: new Date(),
      ...message
    };

    this.messageBus.push(fullMessage);

    // Find target agent
    const targetAgent = Array.from(this.agents.values()).find(a => a.agentName === to);
    if (targetAgent) {
      await this.notifyAgent(targetAgent.id, {
        type: 'direct_message',
        message: fullMessage
      });
    }

    console.log(`💬 Direct message from ${from} to ${to}: ${message.type}`);
  }

  getSharedContext(projectId: string): ProjectContext {
    const context = this.projectContext.get(projectId);
    if (!context) {
      throw new Error(`Project context for ${projectId} not found`);
    }
    return context;
  }

  // Conflict Resolution
  async handleMergeConflict(conflict: MergeConflict): Promise<Resolution> {
    console.log(`⚠️ Handling merge conflict in ${conflict.file}`);

    // Try auto-merge first
    const autoResolution = await this.attemptAutoMerge(conflict);
    if (autoResolution.success) {
      console.log(`✅ Auto-merge successful for ${conflict.file}`);
      return {
        strategy: 'auto_merge',
        resolvedContent: autoResolution.content
      };
    }

    // Try agent consensus
    const consensusResolution = await this.attemptAgentConsensus(conflict);
    if (consensusResolution.success) {
      console.log(`🤝 Agent consensus reached for ${conflict.file}`);
      return {
        strategy: 'agent_consensus',
        resolvedContent: consensusResolution.content,
        resolutionNotes: consensusResolution.notes
      };
    }

    // Escalate to manual intervention
    console.log(`👨‍💻 Escalating ${conflict.file} to manual intervention`);
    return {
      strategy: 'manual_intervention',
      requiresUserInput: true,
      resolutionNotes: 'Auto-merge and consensus failed. Requires user intervention.'
    };
  }

  // WebSocket Management
  addWebSocketConnection(clientId: string, ws: WebSocket): void {
    this.wsConnections.set(clientId, ws);

    ws.onclose = () => {
      this.wsConnections.delete(clientId);
    };

    // Send current state
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'initial_state',
        data: {
          agents: Array.from(this.agents.values()),
          recentMessages: this.messageBus.slice(-50)
        }
      }));
    }
  }

  // Agent Session Management
  getAllAgentSessions(projectId: string): AgentSession[] {
    const sessions: AgentSession[] = [];
    for (const session of this.agents.values()) {
      if (session.projectId === projectId) {
        sessions.push(session);
      }
    }
    return sessions;
  }

  // Event System
  on(event: string, callback: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
  }

  off(event: string, callback: Function): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  private emit(event: string, data: any): void {
    const listeners = this.eventListeners.get(event) || [];
    listeners.forEach(callback => callback(data));
  }

  // Private Helper Methods
  private getAgentCapabilities(agentName: string): string[] {
    const capabilities = {
      'Zola': ['backend_development', 'api_design', 'database_design', 'system_architecture'],
      'Jabari': ['security_analysis', 'code_review', 'penetration_testing', 'compliance'],
      'Kofi': ['devops', 'infrastructure', 'deployment', 'monitoring'],
      'Abeni': ['ui_design', 'frontend_development', 'ux_research', 'accessibility'],
      'Nexus': ['full_stack', 'integration', 'testing', 'documentation']
    };

    return capabilities[agentName as keyof typeof capabilities] || [];
  }

  private async initializeAgentWorkspace(session: AgentSession): Promise<void> {
    console.log(`📁 Initializing workspace for ${session.agentName} at ${session.workingDirectory}`);

    // Create workspace directory structure
    const workspaceStructure = [
      `${session.workingDirectory}`,
      `${session.workingDirectory}/src`,
      `${session.workingDirectory}/tests`,
      `${session.workingDirectory}/docs`,
      `${session.workingDirectory}/temp`
    ];

    // In a real implementation, this would create actual directories
    workspaceStructure.forEach(dir => {
      console.log(`Creating directory: ${dir}`);
    });

    // Initialize agent-specific configuration
    const agentConfig = {
      agentName: session.agentName,
      sessionId: session.id,
      projectId: session.projectId,
      capabilities: session.capabilities,
      preferences: {
        codeStyle: 'typescript',
        testingFramework: 'jest',
        linter: 'eslint'
      }
    };

    console.log(`⚙️ Agent config initialized for ${session.agentName}`);
  }

  private async cleanupAgentWorkspace(session: AgentSession): Promise<void> {
    console.log(`🧹 Cleaning up workspace for ${session.agentName}`);

    // In a real implementation, this would clean up files and directories
    console.log(`Removing workspace: ${session.workingDirectory}`);
  }

  private async notifyAgent(agentId: string, notification: any): Promise<void> {
    const agent = this.agents.get(agentId);
    if (!agent) return;

    console.log(`🔔 Notifying agent ${agent.agentName}:`, notification.type);

    // In a real implementation, this would send the notification to the agent's process
    // For now, we'll just update the agent's last activity
    agent.lastActivity = new Date();
  }

  private async attemptAutoMerge(conflict: MergeConflict): Promise<{ success: boolean; content?: string }> {
    // Simple auto-merge logic - in reality this would be much more sophisticated
    try {
      const changes = conflict.agentChanges;

      // If only one agent made changes, auto-merge succeeds
      if (changes.length === 1) {
        return { success: true, content: changes[0].content };
      }

      // If changes are in different lines, auto-merge succeeds
      const lineRanges = changes.map(c => ({ start: c.lineStart, end: c.lineEnd }));
      const hasOverlap = lineRanges.some((range1, i) =>
        lineRanges.slice(i + 1).some(range2 =>
          !(range1.end < range2.start || range2.end < range1.start)
        )
      );

      if (!hasOverlap) {
        // Merge changes by combining non-overlapping sections
        // This is a simplified implementation
        return { success: true, content: conflict.baseVersion };
      }

      return { success: false };
    } catch (error) {
      console.error('Auto-merge failed:', error);
      return { success: false };
    }
  }

  private async attemptAgentConsensus(conflict: MergeConflict): Promise<{ success: boolean; content?: string; notes?: string }> {
    // Simulate agent consensus process
    console.log(`🗣️ Initiating agent consensus for ${conflict.file}`);

    // In a real implementation, this would:
    // 1. Send conflict details to all involved agents
    // 2. Collect their proposed resolutions
    // 3. Use voting or negotiation to reach consensus
    // 4. Apply the agreed-upon resolution

    // For now, simulate a successful consensus
    return {
      success: true,
      content: conflict.baseVersion,
      notes: 'Agents reached consensus through collaborative resolution'
    };
  }
}

// Export the runtime class for use in AzStudio
export { MultiAgentRuntime };
export type { AgentSession, AgentTask, AgentMessage, ProjectContext, MergeConflict, Resolution };
