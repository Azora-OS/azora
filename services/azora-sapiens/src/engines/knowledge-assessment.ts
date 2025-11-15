interface KnowledgeGap {
  topic: string;
  severity: 'low' | 'medium' | 'high';
  recommendedActions: string[];
}

interface AssessmentResult {
  studentId: string;
  subject: string;
  overallScore: number;
  topicScores: Record<string, number>;
  knowledgeGaps: KnowledgeGap[];
  strengths: string[];
  nextSteps: string[];
}

interface DiagnosticTest {
  testId: string;
  subject: string;
  topics: string[];
  questions: number;
  adaptive: boolean;
}

class KnowledgeAssessment {
  createDiagnosticTest(subject: string, topics: string[]): DiagnosticTest {
    return {
      testId: `diag_${Date.now()}`,
      subject,
      topics,
      questions: topics.length * 5,
      adaptive: true,
    };
  }

  analyzeResults(studentId: string, subject: string, topicScores: Record<string, number>): AssessmentResult {
    const overallScore = Object.values(topicScores).reduce((a, b) => a + b, 0) / Object.keys(topicScores).length;
    
    return {
      studentId,
      subject,
      overallScore,
      topicScores,
      knowledgeGaps: this.identifyGaps(topicScores),
      strengths: this.identifyStrengths(topicScores),
      nextSteps: this.generateNextSteps(topicScores, overallScore),
    };
  }

  private identifyGaps(topicScores: Record<string, number>): KnowledgeGap[] {
    const gaps: KnowledgeGap[] = [];
    
    for (const [topic, score] of Object.entries(topicScores)) {
      if (score < 60) {
        gaps.push({
          topic,
          severity: score < 40 ? 'high' : score < 50 ? 'medium' : 'low',
          recommendedActions: this.getRecommendations(topic, score),
        });
      }
    }
    
    return gaps.sort((a, b) => {
      const severityOrder = { high: 3, medium: 2, low: 1 };
      return severityOrder[b.severity] - severityOrder[a.severity];
    });
  }

  private identifyStrengths(topicScores: Record<string, number>): string[] {
    return Object.entries(topicScores)
      .filter(([_, score]) => score >= 80)
      .map(([topic, _]) => topic)
      .slice(0, 5);
  }

  private getRecommendations(topic: string, score: number): string[] {
    if (score < 40) {
      return [
        `Start with ${topic} fundamentals`,
        'Watch introductory videos',
        'Complete basic exercises',
        'Schedule tutoring session',
      ];
    } else if (score < 60) {
      return [
        `Review ${topic} concepts`,
        'Practice intermediate problems',
        'Join study group',
      ];
    }
    return [`Continue practicing ${topic}`];
  }

  private generateNextSteps(topicScores: Record<string, number>, overallScore: number): string[] {
    const steps: string[] = [];
    
    if (overallScore < 60) {
      steps.push('Focus on foundational concepts');
      steps.push('Complete remedial exercises');
    } else if (overallScore < 80) {
      steps.push('Address specific knowledge gaps');
      steps.push('Practice application problems');
    } else {
      steps.push('Advance to next level');
      steps.push('Explore advanced topics');
    }
    
    steps.push('Track progress weekly');
    return steps;
  }

  adaptiveQuestionSelection(currentScore: number, previousAnswers: boolean[]): 'easier' | 'same' | 'harder' {
    if (previousAnswers.length < 3) return 'same';
    
    const recentCorrect = previousAnswers.slice(-3).filter(a => a).length;
    
    if (recentCorrect >= 2 && currentScore >= 70) return 'harder';
    if (recentCorrect <= 1 && currentScore < 50) return 'easier';
    return 'same';
  }
}

export default new KnowledgeAssessment();
