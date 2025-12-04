import { BaseAgent } from '../base-agent';
import { AgenticContext, Pattern, ProposedAction } from '../agentic-core';

export class SankofaAgent extends BaseAgent {
  constructor() {
    super('Sankofa', 'Ancient Wisdom & History');
  }

  async recognizePatterns(context: AgenticContext): Promise<Pattern[]> {
    // Sankofa looks for "System 2" needs - deep questions or ethical gray areas
    if (context.requiresDeepReasoning) {
      return [{
        id: 'wisdom-call',
        type: 'opportunity',
        confidence: 1.0,
        indicators: ['deep_reasoning_request'],
        detectedAt: Date.now(),
        severity: 'medium'
      }];
    }
    return [];
  }

  async act(action: ProposedAction): Promise<any> {
    if (action.type === 'PROVIDE_WISDOM') {
      return { 
        message: "To know where we are going, we must know where we have been. This problem reminds me of...", 
        mood: 'wise' 
      };
    }
    return super.act(action);
  }
}
