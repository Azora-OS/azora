import { AIOrchestrator as MainAIOrchestrator, AIContext } from '../../../main/services/AIOrchestrator';
import { IAIOrchestrator, IElaraAgentService } from './common';
import { registerSingleton, InstantiationType } from '../../../platform/instantiation/common/simpleExtensions.js';

export class AIOrchestratorService implements IAIOrchestrator {
  private orchestrator: MainAIOrchestrator;

  constructor() {
    // Create orchestrator instance from main service
    this.orchestrator = new MainAIOrchestrator();
  }

  async generateCode(prompt: string, context: any, model?: any): Promise<any> {
    // Forward to main orchestrator, but allow for local stub when no API keys
    try {
      return await this.orchestrator.generateCode(prompt, context as AIContext, model);
    } catch (err) {
      // Provide a minimal fallback stub without invoking LLMs
      return {
        content: `Hello from AIOrchestrator (stub): responded to ${prompt}`,
        model: 'stub',
        tokensUsed: 0,
        cost: 0,
      };
    }
  }

  async estimateCost(prompt: string, context: any): Promise<number> {
    try {
      return await this.orchestrator.estimateCost(prompt, context as AIContext);
    } catch (err) {
      return 0;
    }
  }

  getUsageStats() {
    return this.orchestrator.getUsageStats ? this.orchestrator.getUsageStats() : { totalTokens: 0, totalCost: 0, cacheSize: 0 };
  }
}

registerSingleton(IAIOrchestrator as any, AIOrchestratorService as any, InstantiationType.Delayed);
