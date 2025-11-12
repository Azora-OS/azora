import { ConsciousnessDetector, ConsciousnessState } from './consciousness-detector';

interface EmotionalResponse {
  tone: 'encouraging' | 'challenging' | 'supportive' | 'neutral';
  message: string;
  actionRequired: 'break' | 'simplify' | 'advance' | 'continue';
}

export class EmotionAwareTeaching {
  private detector = new ConsciousnessDetector();

  generateResponse(studentId: string, state: ConsciousnessState): EmotionalResponse {
    if (state.frustrationIndex > 70) {
      return {
        tone: 'supportive',
        message: 'Let\'s break this down into smaller steps',
        actionRequired: 'simplify'
      };
    }

    if (state.engagementLevel < 30) {
      return {
        tone: 'encouraging',
        message: 'Try this interactive challenge to make it more interesting',
        actionRequired: 'break'
      };
    }

    if (state.confidenceScore > 85 && state.cognitiveLoad < 40) {
      return {
        tone: 'challenging',
        message: 'You\'re doing great! Ready for a harder challenge?',
        actionRequired: 'advance'
      };
    }

    return {
      tone: 'neutral',
      message: 'Keep going, you\'re on the right track',
      actionRequired: 'continue'
    };
  }

  async adjustDifficulty(state: ConsciousnessState, currentDifficulty: number): Promise<number> {
    if (state.frustrationIndex > 60 || state.cognitiveLoad > 80) {
      return Math.max(1, currentDifficulty - 15);
    }

    if (state.confidenceScore > 80 && state.predictedOutcome > 85) {
      return Math.min(100, currentDifficulty + 10);
    }

    return currentDifficulty;
  }

  recommendIntervention(state: ConsciousnessState): string[] {
    const interventions: string[] = [];

    if (state.cognitiveLoad > 75) interventions.push('reduce-complexity');
    if (state.frustrationIndex > 65) interventions.push('provide-hint');
    if (state.engagementLevel < 40) interventions.push('gamify-content');
    if (state.confidenceScore < 30) interventions.push('show-example');

    return interventions;
  }
}
