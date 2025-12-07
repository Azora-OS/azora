import { ElaraAgenticService as MainElara } from '../../../main/services/ElaraAgenticService';
import { IElaraAgentService, IAIOrchestrator } from './common';
import { registerSingleton, InstantiationType } from '../../../platform/instantiation/common/simpleExtensions.js';
import { IAIOrchestrator as IAIOrchestratorToken } from './common';

export class ElaraService implements IElaraAgentService {
  private elara: MainElara | null = null;
  private orchestrator: IAIOrchestrator | null = null;

  constructor() {
    // Attempt to instantiate Elara with a stub if environment variables are not present
    try {
      const apiKey = process.env.OPENAI_API_KEY || '';
      if (apiKey) {
        this.elara = new MainElara(apiKey);
      } else {
        // Keep null to indicate stub mode
        this.elara = null;
      }
    } catch (err) {
      this.elara = null;
    }
  }

  async invoke(prompt: string): Promise<{ content: string; agentId?: string; metadata?: any }> {
    if (this.elara) {
      // For now, forward to elara but keep it safe; if it fails, fallback
      try {
        const result = await this.elara.generateLessonScript({ topic: prompt, level: 'beginner' });
        return { content: `Elara lesson title: ${result.title}`, agentId: 'azora.elara', metadata: { type: 'elara.lesson' } };
      } catch (err) {
        return { content: 'Hello from Elara (fallback).', agentId: 'azora.elara', metadata: {} };
      }
    }

    // Stub Mode: Return canned response
    return { content: 'Hello from Elara', agentId: 'azora.elara', metadata: { stub: true } };
  }

  getMetadata() {
    return { id: 'azora.elara', name: 'elara', fullName: 'ELARA — Master Orchestrator' };
  }
}

registerSingleton(IElaraAgentService as any, ElaraService as any, InstantiationType.Delayed);
