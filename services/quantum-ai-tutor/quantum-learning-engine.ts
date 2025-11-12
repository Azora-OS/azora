import { EventEmitter } from 'events';

interface LearningProfile {
  studentId: string;
  skillLevel: number;
  learningSpeed: number;
  preferredStyle: 'visual' | 'kinesthetic' | 'auditory' | 'reading';
  weaknesses: string[];
  strengths: string[];
}

interface AdaptiveContent {
  difficulty: number;
  format: string;
  estimatedTime: number;
  nextConcepts: string[];
}

export class QuantumLearningEngine extends EventEmitter {
  private profiles = new Map<string, LearningProfile>();
  private performanceHistory = new Map<string, number[]>();

  async adaptContent(studentId: string, currentTopic: string): Promise<AdaptiveContent> {
    const profile = this.profiles.get(studentId) || this.initProfile(studentId);
    const history = this.performanceHistory.get(studentId) || [];
    
    const difficulty = this.calculateOptimalDifficulty(profile, history);
    const format = this.selectContentFormat(profile);
    const nextConcepts = this.predictNextConcepts(currentTopic, profile);
    
    return {
      difficulty,
      format,
      estimatedTime: Math.round(30 / profile.learningSpeed),
      nextConcepts
    };
  }

  async updatePerformance(studentId: string, score: number, timeSpent: number): Promise<void> {
    const history = this.performanceHistory.get(studentId) || [];
    history.push(score);
    if (history.length > 50) history.shift();
    this.performanceHistory.set(studentId, history);
    
    const profile = this.profiles.get(studentId)!;
    profile.learningSpeed = this.recalculateLearningSpeed(history, timeSpent);
    profile.skillLevel = history.slice(-10).reduce((a, b) => a + b, 0) / 10;
    
    this.emit('profile-updated', { studentId, profile });
  }

  private initProfile(studentId: string): LearningProfile {
    const profile: LearningProfile = {
      studentId,
      skillLevel: 50,
      learningSpeed: 1.0,
      preferredStyle: 'visual',
      weaknesses: [],
      strengths: []
    };
    this.profiles.set(studentId, profile);
    return profile;
  }

  private calculateOptimalDifficulty(profile: LearningProfile, history: number[]): number {
    const avgScore = history.slice(-5).reduce((a, b) => a + b, 250) / 5;
    return avgScore > 80 ? profile.skillLevel + 10 : profile.skillLevel - 5;
  }

  private selectContentFormat(profile: LearningProfile): string {
    const formats = {
      visual: 'interactive-diagram',
      kinesthetic: 'hands-on-exercise',
      auditory: 'video-explanation',
      reading: 'text-tutorial'
    };
    return formats[profile.preferredStyle];
  }

  private predictNextConcepts(current: string, profile: LearningProfile): string[] {
    const conceptGraph: Record<string, string[]> = {
      'variables': ['data-types', 'operators'],
      'functions': ['parameters', 'return-values', 'scope'],
      'loops': ['arrays', 'iteration-patterns'],
      'arrays': ['objects', 'data-structures'],
      'objects': ['classes', 'prototypes']
    };
    return conceptGraph[current] || [];
  }

  private recalculateLearningSpeed(history: number[], timeSpent: number): number {
    const recentAvg = history.slice(-5).reduce((a, b) => a + b, 0) / 5;
    const expectedTime = 30;
    return (recentAvg / 100) * (expectedTime / timeSpent);
  }
}
