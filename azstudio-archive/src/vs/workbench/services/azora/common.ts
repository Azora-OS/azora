/*====================================================
 Common tokens and interfaces for Azora agent services
 ====================================================*/

export const IAIOrchestrator = Symbol('IAIOrchestrator');
export const IElaraAgentService = Symbol('IElaraAgentService');
export const IAzoraAgentRegistry = Symbol('IAzoraAgentRegistry');

export interface IAIOrchestrator {
  generateCode(prompt: string, context: any, model?: any): Promise<{ content: string; model: string; tokensUsed: number; cost: number; ethicalAnalysis?: { approved: boolean; concerns: string[]; score?: number } }>;
  estimateCost(prompt: string, context: any): Promise<number>;
  getUsageStats(): { totalTokens: number; totalCost: number; cacheSize: number };
}

export interface IElaraAgentService {
  invoke(prompt: string): Promise<{ content: string; agentId?: string; metadata?: any }>;
  getMetadata(): { id: string; name: string; fullName: string };
}

export interface AzoraAgentMetadata {
  id: string;
  name: string;
  fullName?: string;
  description?: string;
  // Optional system prompt/persona for the agent
  systemPrompt?: string;
}

export type AzoraAgentImplementation = {
  invoke: (prompt: string, context?: any) => Promise<{ content: string; agentId?: string; metadata?: any }>;
  provideFollowups?: (result: any, context?: any) => Promise<any[]>;
  // Optional streaming generator: yield partial responses as they arrive
  invokeStreaming?: (prompt: string, context?: any) => AsyncIterable<{ chunk: string; metadata?: any }>;
};

export interface IAzoraAgentRegistry {
  registerAgent(metadata: AzoraAgentMetadata, implementation: AzoraAgentImplementation): void;
  listAgents(): AzoraAgentMetadata[];
  invokeAgent(id: string, prompt: string, context?: any): Promise<{ content: string; agentId?: string; metadata?: any }>;
  onDidRegisterAgent: (cb: (metadata: AzoraAgentMetadata) => void) => void;
}
