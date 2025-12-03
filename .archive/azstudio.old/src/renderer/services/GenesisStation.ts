// Genesis Station Integration for AzStudio
// Living source of truth for project vision and requirements

import { KnowledgeOcean } from './KnowledgeOcean';

interface ProjectVision {
  title: string;
  description: string;
  goals: string[];
  successCriteria: string[];
  lastUpdated: Date;
  constraints: string[];
}

interface Requirement {
  id: string;
  description: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  status: 'pending' | 'in_progress' | 'completed' | 'deferred';
  assignedTo?: string;
  implementationNotes?: string;
  createdAt: Date;
  updatedAt: Date;
  dependencies: string[];
  tags: string[];
  acceptanceCriteria: string[];
}

interface DesignChoice {
  category: 'architecture' | 'tech_stack' | 'pattern' | 'library' | 'approach';
  decision: string;
  reasoning: string;
  alternatives: Array<{
    option: string;
    pros: string[];
    cons: string[];
    rejectedReason: string;
  }>;
  impact: string;
  confidence: number; // 0-100
  lastReviewed: Date;
  reviewedBy: string; // agent name or 'user'
}

interface ImplementationLog {
  id: string;
  timestamp: Date;
  agent: string;
  task?: string;
  decision: string;
  impact: string;
  projectId?: string;
  filesChanged: string[];
  requirementsUpdated: string[];
  designChoicesUpdated: string[];
  qualityMetrics: {
    codeQuality?: number;
    testCoverage?: number;
    performanceScore?: number;
    securityScore?: number;
  };
}

interface AgentBehaviorProfile {
  agentName: string;
  projectId: string;
  
  codeStyle: {
    language: string;
    conventions: string[];
    formatting: string;
    linting: string[];
  };
  
  priorities: {
    performance: number;
    readability: number;
    security: number;
    testCoverage: number;
    maintainability: number;
  };
  
  constraints: string[];
  libraries: {
    preferred: string[];
    forbidden: string[];
  };
  
  customInstructions: string;
  lastUpdated: Date;
  updatedBy: string;
}

interface Blocker {
  id: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  blockedTasks: string[];
  blockedAgents: string[];
  resolutionPlan?: string;
  estimatedResolution?: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface ProjectContext {
  projectId: string;
  vision: ProjectVision;
  requirements: {
    functional: Requirement[];
    nonFunctional: Requirement[];
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
    detailedChoices: DesignChoice[];
  };
  implementationLog: ImplementationLog[];
  agentProfiles: Record<string, AgentBehaviorProfile>;
  activeContext: {
    currentPhase: string;
    activeTasks: Array<{
      id: string;
      title: string;
      assignedTo: string;
      status: string;
      progress: number;
    }>;
    blockers: Blocker[];
    lastSync: Date;
  };
  metadata: {
    createdAt: Date;
    lastUpdated: Date;
    version: number;
    collaborators: string[];
    tags: string[];
  };
}

class GenesisStation {
  private projects: Map<string, ProjectContext> = new Map();
  private eventListeners: Map<string, Function[]> = new Map();
  private syncIntervals: Map<string, any> = new Map();
  private buildspacesAPI: string = 'http://localhost:8080/api/buildspaces';
  private knowledgeOcean: KnowledgeOcean;

  constructor() {
    this.knowledgeOcean = KnowledgeOcean.getInstance();
  }

  // Core Context Management
  async getProjectContext(projectId: string): Promise<ProjectContext | null> {
    console.log(`📖 Genesis Station: Getting context for project ${projectId}`);
    
    // Try to get from local cache first
    let context = this.projects.get(projectId);
    
    if (!context) {
      // Try to fetch from BuildSpaces API
      try {
        context = await this.fetchFromBuildSpaces(projectId);
        if (context) {
          this.projects.set(projectId, context);
        }
      } catch (error) {
        console.error(`Failed to fetch project ${projectId} from BuildSpaces:`, error);
      }
    }
    
    return context || null;
  }

  async updateProjectContext(projectId: string, updates: Partial<ProjectContext>): Promise<void> {
    console.log(`📝 Genesis Station: Updating context for project ${projectId}`);
    
    const existing = this.projects.get(projectId);
    if (!existing) {
      throw new Error(`Project ${projectId} not found`);
    }
    
    const updated: ProjectContext = {
      ...existing,
      ...updates,
      metadata: {
        ...existing.metadata,
        lastUpdated: new Date(),
        version: existing.metadata.version + 1
      }
    };
    
    this.projects.set(projectId, updated);
    
    // Sync to BuildSpaces
    await this.syncToBuildSpaces(projectId, updated);
    
    // Emit update event
    this.emit('context_updated', { projectId, context: updated });
    
    console.log(`✅ Project ${projectId} context updated to version ${updated.metadata.version}`);
  }

  // Vision Management
  async updateVision(projectId: string, vision: Partial<ProjectVision>): Promise<void> {
    const context = await this.getProjectContext(projectId);
    if (!context) {
      throw new Error(`Project ${projectId} not found`);
    }
    
    const updatedVision = {
      ...context.vision,
      ...vision,
      lastUpdated: new Date()
    };
    
    await this.updateProjectContext(projectId, { vision: updatedVision });
    
    console.log(`🎯 Vision updated for project ${projectId}: "${updatedVision.title}"`);
  }

  // Requirements Management
  async addRequirement(projectId: string, requirement: Omit<Requirement, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const context = await this.getProjectContext(projectId);
    if (!context) {
      throw new Error(`Project ${projectId} not found`);
    }
    
    const newRequirement: Requirement = {
      ...requirement,
      id: `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const requirements = requirement.description.toLowerCase().includes('performance') ||
                        requirement.description.toLowerCase().includes('security') ||
                        requirement.description.toLowerCase().includes('scalability')
      ? { ...context.requirements, nonFunctional: [...context.requirements.nonFunctional, newRequirement] }
      : { ...context.requirements, functional: [...context.requirements.functional, newRequirement] };
    
    await this.updateProjectContext(projectId, { requirements });
    
    console.log(`📋 Requirement added: ${newRequirement.id} - ${newRequirement.description}`);
    
    return newRequirement.id;
  }

  async updateRequirement(projectId: string, requirementId: string, updates: Partial<Requirement>): Promise<void> {
    const context = await this.getProjectContext(projectId);
    if (!context) {
      throw new Error(`Project ${projectId} not found`);
    }
    
    // Find and update the requirement
    const allRequirements = [...context.requirements.functional, ...context.requirements.nonFunctional];
    const requirementIndex = allRequirements.findIndex(r => r.id === requirementId);
    
    if (requirementIndex === -1) {
      throw new Error(`Requirement ${requirementId} not found`);
    }
    
    const updatedRequirement = {
      ...allRequirements[requirementIndex],
      ...updates,
      updatedAt: new Date()
    };
    
    // Update the appropriate requirements array
    const isFunctional = context.requirements.functional.some(r => r.id === requirementId);
    const requirements = {
      functional: isFunctional 
        ? context.requirements.functional.map(r => r.id === requirementId ? updatedRequirement : r)
        : context.requirements.functional,
      nonFunctional: !isFunctional
        ? context.requirements.nonFunctional.map(r => r.id === requirementId ? updatedRequirement : r)
        : context.requirements.nonFunctional
    };
    
    await this.updateProjectContext(projectId, { requirements });
    
    console.log(`📋 Requirement updated: ${requirementId}`);
  }

  // Design Choices Management
  async addDesignChoice(projectId: string, choice: Omit<DesignChoice, 'lastReviewed'>): Promise<void> {
    const context = await this.getProjectContext(projectId);
    if (!context) {
      throw new Error(`Project ${projectId} not found`);
    }
    
    const newChoice: DesignChoice = {
      ...choice,
      lastReviewed: new Date()
    };
    
    const updatedChoices = [...context.designChoices.detailedChoices, newChoice];
    
    await this.updateProjectContext(projectId, {
      designChoices: {
        ...context.designChoices,
        detailedChoices: updatedChoices
      }
    });
    
    console.log(`🎨 Design choice added: ${choice.category} - ${choice.decision}`);
  }

  // Implementation Logging
  async logImplementation(log: Omit<ImplementationLog, 'id' | 'timestamp'> & { projectId: string }): Promise<void> {
    const context = await this.getProjectContext(log.projectId || 'default');
    if (!context) {
      throw new Error(`Project not found for implementation log`);
    }
    
    const newLog: ImplementationLog = {
      ...log,
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      projectId: log.projectId
    };
    
    const updatedLog = [...context.implementationLog, newLog];
    
    await this.updateProjectContext(log.projectId, { implementationLog: updatedLog });
    
    console.log(`📝 Implementation logged: ${log.agent} - ${log.decision}`);
  }

  // Agent Behavior Management
  async updateAgentBehavior(agentName: string, instruction: string, projectId: string): Promise<void> {
    const context = await this.getProjectContext(projectId);
    if (!context) {
      throw new Error(`Project ${projectId} not found`);
    }
    
    let profile = context.agentProfiles[agentName];
    
    if (!profile) {
      // Create new profile
      profile = {
        agentName,
        projectId,
        codeStyle: {
          language: 'typescript',
          conventions: [],
          formatting: 'prettier',
          linting: ['eslint']
        },
        priorities: {
          performance: 7,
          readability: 8,
          security: 9,
          testCoverage: 7,
          maintainability: 8
        },
        constraints: [],
        libraries: {
          preferred: [],
          forbidden: []
        },
        customInstructions: instruction,
        lastUpdated: new Date(),
        updatedBy: 'user'
      };
    } else {
      // Update existing profile
      profile = {
        ...profile,
        customInstructions: instruction,
        lastUpdated: new Date(),
        updatedBy: 'user'
      };
    }
    
    const updatedProfiles = {
      ...context.agentProfiles,
      [agentName]: profile
    };
    
    await this.updateProjectContext(projectId, { agentProfiles: updatedProfiles });
    
    console.log(`🤖 Agent behavior updated for ${agentName}`);
  }

  async getAgentBehavior(agentName: string, projectId: string): Promise<AgentBehaviorProfile | null> {
    const context = await this.getProjectContext(projectId);
    if (!context) {
      return null;
    }
    
    return context.agentProfiles[agentName] || null;
  }

  // Blocker Management
  async addBlocker(projectId: string, blocker: Omit<Blocker, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const context = await this.getProjectContext(projectId);
    if (!context) {
      throw new Error(`Project ${projectId} not found`);
    }
    
    const newBlocker: Blocker = {
      ...blocker,
      id: `blocker-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const updatedBlockers = [...context.activeContext.blockers, newBlocker];
    
    await this.updateProjectContext(projectId, {
      activeContext: {
        ...context.activeContext,
        blockers: updatedBlockers
      }
    });
    
    console.log(`🚫 Blocker added: ${newBlocker.id} - ${newBlocker.description}`);
    
    return newBlocker.id;
  }

  async resolveBlocker(projectId: string, blockerId: string, resolution: string): Promise<void> {
    const context = await this.getProjectContext(projectId);
    if (!context) {
      throw new Error(`Project ${projectId} not found`);
    }
    
    const updatedBlockers = context.activeContext.blockers
      .filter(b => b.id !== blockerId)
      .map(b => b.id === blockerId ? { ...b, resolutionPlan: resolution, updatedAt: new Date() } : b);
    
    await this.updateProjectContext(projectId, {
      activeContext: {
        ...context.activeContext,
        blockers: updatedBlockers
      }
    });
    
    console.log(`✅ Blocker resolved: ${blockerId}`);
  }

  // Logging
  async logDecision(data: any): Promise<void> {
    // Log orchestrator decisions
    console.log(`🧠 Decision logged: ${data.decision} by ${data.agent}`);
    
    const log: ImplementationLog = {
      id: `decision-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      agent: data.agent,
      decision: data.decision,
      impact: data.impact,
      filesChanged: [],
      requirementsUpdated: [],
      designChoicesUpdated: [],
      qualityMetrics: {},
      projectId: data.projectId
    };
    
    const logForImpl: Omit<ImplementationLog, 'id' | 'timestamp'> & { projectId: string } = {
        ...log,
        projectId: data.projectId || 'default'
    };

    await this.logImplementation(logForImpl);
  }

  async logUserInstruction(data: any): Promise<void> {
    console.log(`👤 User instruction logged: ${data.instruction.type}`);
    // Store user instructions for future reference
    const context = await this.getProjectContext(data.projectId);
    if (context) {
      // In a real app, we'd have a dedicated instruction log
      // For now, we'll update the metadata lastUpdated
      await this.updateProjectContext(data.projectId, {
        metadata: { ...context.metadata, lastUpdated: new Date() }
      });
    }
  }

  // Conflict Resolution Helpers
  async resolveRequirementConflict(requirementIds: string[]): Promise<void> {
    console.log(`🔧 Genesis Station: Resolving requirement conflict for ${requirementIds.join(', ')}`);
    // In a real implementation, this would intelligently merge requirements
    // For now, we'll just mark them as updated
    const context = await this.getProjectContext(requirementIds[0].split('-')[0] || 'default'); // Hack to get projectId
    if (context) {
      await this.updateProjectContext(context.projectId, {
        metadata: { ...context.metadata, lastUpdated: new Date() }
      });
    }
  }

  async updateConflictStatus(conflictId: string, status: string, resolution?: any): Promise<void> {
    console.log(`🔧 Genesis Station: Updating conflict ${conflictId} to ${status}`);
    // This would update the conflict log
  }

  async getDesignGuidance(designIssue: any): Promise<{ recommendation: string; authoritative: boolean }> {
    console.log(`🎨 Genesis Station: Getting design guidance for issue`);
    return {
      recommendation: 'Follow the established architecture pattern',
      authoritative: true
    };
  }

  async updateDesignChoices(projectId: string, instruction: string): Promise<void> {
    console.log(`🎨 Genesis Station: Updating design choices for ${projectId}: ${instruction}`);
    // This would process the instruction and update design choices
    await this.updateProjectContext(projectId, {
       metadata: { ... (await this.getProjectContext(projectId))!.metadata, lastUpdated: new Date() }
    });
  }

  // Sync and Event Management
  async startPeriodicSync(projectId: string, intervalMinutes: number = 5): Promise<void> {
    console.log(`🔄 Starting periodic sync for project ${projectId} every ${intervalMinutes} minutes`);
    
    // Clear existing interval if any
    const existingInterval = this.syncIntervals.get(projectId) as NodeJS.Timeout;
    if (existingInterval) {
      clearInterval(existingInterval);
    }
    
    // Set up new interval
    const interval = setInterval(async () => {
      try {
        await this.syncWithBuildSpaces(projectId);
        console.log(`🔄 Sync completed for project ${projectId}`);
      } catch (error) {
        console.error(`❌ Sync failed for project ${projectId}:`, error);
      }
    }, intervalMinutes * 60 * 1000);
    
    this.syncIntervals.set(projectId, interval);
  }

  async stopPeriodicSync(projectId: string): Promise<void> {
    const interval = this.syncIntervals.get(projectId);
    if (interval) {
      clearInterval(interval);
      this.syncIntervals.delete(projectId);
      console.log(`⏹️ Stopped periodic sync for project ${projectId}`);
    }
  }

  // Event System
  on(event: string, callback: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
  }

  emit(event: string, data: any): void {
    const listeners = this.eventListeners.get(event) || [];
    listeners.forEach(callback => callback(data));
  }

  // BuildSpaces Integration
  private async fetchFromBuildSpaces(projectId: string): Promise<ProjectContext | null> {
    try {
      const response = await fetch(`${this.buildspacesAPI}/projects/${projectId}/genesis`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch from BuildSpaces: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Convert BuildSpaces format to our format
      return this.convertFromBuildSpacesFormat(data);
      
    } catch (error) {
      console.error('Error fetching from BuildSpaces:', error);
      return null;
    }
  }

  private async syncToBuildSpaces(projectId: string, context: ProjectContext): Promise<void> {
    try {
      const response = await fetch(`${this.buildspacesAPI}/projects/${projectId}/genesis/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(this.convertToBuildSpacesFormat(context))
      });
      
      if (!response.ok) {
        throw new Error(`Failed to sync to BuildSpaces: ${response.statusText}`);
      }
      
      console.log(`📤 Synced project ${projectId} to BuildSpaces`);
      
    } catch (error) {
      console.error('Error syncing to BuildSpaces:', error);
      throw error;
    }
  }

  private async syncWithBuildSpaces(projectId: string): Promise<void> {
    const remoteContext = await this.fetchFromBuildSpaces(projectId);
    
    if (remoteContext) {
      const localContext = this.projects.get(projectId);
      
      if (!localContext || remoteContext.metadata.version > localContext.metadata.version) {
        // Remote is newer, update local
        this.projects.set(projectId, remoteContext);
        this.emit('sync_from_remote', { projectId, context: remoteContext });
      } else if (localContext && localContext.metadata.version > remoteContext.metadata.version) {
        // Local is newer, push to remote
        await this.syncToBuildSpaces(projectId, localContext);
        this.emit('sync_to_remote', { projectId, context: localContext });
      }
    }
  }

  private convertFromBuildSpacesFormat(data: any): ProjectContext {
    // Convert BuildSpaces API format to our internal format
    return {
      projectId: data.projectId,
      vision: data.vision || {
        title: '',
        description: '',
        goals: [],
        successCriteria: [],
        lastUpdated: new Date(),
        constraints: []
      },
      requirements: data.requirements || { functional: [], nonFunctional: [] },
      designChoices: data.designChoices || {
        architecture: '',
        techStack: { frontend: [], backend: [], database: [], infrastructure: [] },
        patterns: [],
        reasoning: {},
        detailedChoices: []
      },
      implementationLog: data.implementationLog || [],
      agentProfiles: data.agentProfiles || {},
      activeContext: data.activeContext || {
        currentPhase: 'planning',
        activeTasks: [],
        blockers: [],
        lastSync: new Date()
      },
      metadata: data.metadata || {
        createdAt: new Date(),
        lastUpdated: new Date(),
        version: 1,
        collaborators: [],
        tags: []
      }
    };
  }

  private convertToBuildSpacesFormat(context: ProjectContext): any {
    // Convert our internal format to BuildSpaces API format
    return {
      projectId: context.projectId,
      vision: context.vision,
      requirements: context.requirements,
      designChoices: context.designChoices,
      implementationLog: context.implementationLog,
      agentProfiles: context.agentProfiles,
      activeContext: context.activeContext,
      metadata: context.metadata
    };
  }

  // Utility Methods
  async getProjectSummary(projectId: string): Promise<any> {
    const context = await this.getProjectContext(projectId);
    if (!context) {
      return null;
    }
    
    const totalRequirements = context.requirements.functional.length + context.requirements.nonFunctional.length;
    const completedRequirements = [...context.requirements.functional, ...context.requirements.nonFunctional]
      .filter(r => r.status === 'completed').length;
    
    const progress = totalRequirements > 0 ? (completedRequirements / totalRequirements) * 100 : 0;
    
    return {
      projectId: context.projectId,
      title: context.vision.title,
      progress: Math.round(progress),
      totalRequirements,
      completedRequirements,
      activeBlockers: context.activeContext.blockers.length,
      activeAgents: Object.keys(context.agentProfiles).length,
      lastUpdated: context.metadata.lastUpdated,
      currentPhase: context.activeContext.currentPhase
    };
  }

  async searchProjectContext(projectId: string, query: string): Promise<any[]> {
    const context = await this.getProjectContext(projectId);
    if (!context) {
      return [];
    }
    
    const results = [];
    const queryLower = query.toLowerCase();
    
    // Search in vision
    if (context.vision.title.toLowerCase().includes(queryLower) ||
        context.vision.description.toLowerCase().includes(queryLower)) {
      results.push({
        type: 'vision',
        title: context.vision.title,
        description: context.vision.description,
        relevance: 'high'
      });
    }
    
    // Search in requirements
    [...context.requirements.functional, ...context.requirements.nonFunctional].forEach(req => {
      if (req.description.toLowerCase().includes(queryLower)) {
        results.push({
          type: 'requirement',
          id: req.id,
          title: req.description,
          priority: req.priority,
          status: req.status,
          relevance: 'high'
        });
      }
    });
    
    // Search in implementation log
    context.implementationLog.forEach(log => {
      if (log.decision.toLowerCase().includes(queryLower) ||
          log.impact.toLowerCase().includes(queryLower)) {
        results.push({
          type: 'implementation_log',
          id: log.id,
          agent: log.agent,
          decision: log.decision,
          timestamp: log.timestamp,
          relevance: 'medium'
        });
      }
    });
    
    return results;
  }

  async deepKnowledgeSearch(query: string): Promise<any[]> {
    // Advanced AI Search via Knowledge Ocean
    console.log(`🧠 Genesis Station: Performing deep knowledge search for "${query}"`);
    const oceanResults = await this.knowledgeOcean.search(query);
    
    return oceanResults.map(res => ({
      type: 'knowledge_ocean',
      id: res.node.id,
      title: res.node.content.title || 'Knowledge Node',
      description: res.node.content.pattern || 'Deep AI Knowledge',
      relevance: res.relevance > 10 ? 'high' : 'medium',
      source: this.knowledgeOcean.modelName
    }));
  }
}

export { GenesisStation };
export type { 
  ProjectContext, 
  ProjectVision, 
  Requirement, 
  DesignChoice, 
  ImplementationLog, 
  AgentBehaviorProfile, 
  Blocker 
};
