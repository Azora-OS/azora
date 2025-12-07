/*====================================================
 Common tokens and interfaces for Azora agent services
 ====================================================*/

export const IAIOrchestrator = Symbol('IAIOrchestrator');
export const IElaraAgentService = Symbol('IElaraAgentService');

export interface IAIOrchestrator {
  generateCode(prompt: string, context: any, model?: any): Promise<any>;
  estimateCost(prompt: string, context: any): Promise<number>;
  getUsageStats(): { totalTokens: number; totalCost: number; cacheSize: number };
}

export interface IElaraAgentService {
  invoke(prompt: string): Promise<{ content: string; agentId?: string; metadata?: any }>;
  getMetadata(): { id: string; name: string; fullName: string };
}
