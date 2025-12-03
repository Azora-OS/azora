interface StudentPerformance {
  studentId: string;
  subject: string;
  scores: number[];
  weakAreas: string[];
  strongAreas: string[];
}

interface CurriculumAdjustment {
  studentId: string;
  recommendations: string[];
  focusAreas: string[];
  difficulty: 'easier' | 'maintain' | 'harder';
  nextTopics: string[];
}

class AdaptiveCurriculum {
  adjustCurriculum(performance: StudentPerformance): CurriculumAdjustment {
    const avgScore = performance.scores.reduce((a, b) => a + b, 0) / performance.scores.length;
    const trend = this.analyzeTrend(performance.scores);
    
    return {
      studentId: performance.studentId,
      recommendations: this.generateRecommendations(avgScore, performance.weakAreas),
      focusAreas: performance.weakAreas.slice(0, 3),
      difficulty: this.determineDifficulty(avgScore, trend),
      nextTopics: this.suggestNextTopics(performance.strongAreas, performance.weakAreas),
    };
  }

  private analyzeTrend(scores: number[]): 'improving' | 'declining' | 'stable' {
    if (scores.length < 3) {return 'stable';}
    const recent = scores.slice(-3);
    const earlier = scores.slice(-6, -3);
    if (earlier.length === 0) {return 'stable';}
    
    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const earlierAvg = earlier.reduce((a, b) => a + b, 0) / earlier.length;
    
    if (recentAvg > earlierAvg + 5) {return 'improving';}
    if (recentAvg < earlierAvg - 5) {return 'declining';}
    return 'stable';
  }

  private generateRecommendations(avgScore: number, weakAreas: string[]): string[] {
    const recommendations: string[] = [];
    
    if (avgScore < 60) {
      recommendations.push('Review fundamental concepts');
      recommendations.push('Practice basic exercises daily');
    } else if (avgScore < 80) {
      recommendations.push('Focus on weak areas: ' + weakAreas.join(', '));
      recommendations.push('Attempt more challenging problems');
    } else {
      recommendations.push('Excellent progress! Try advanced topics');
      recommendations.push('Consider peer tutoring to reinforce knowledge');
    }
    
    return recommendations;
  }

  private determineDifficulty(avgScore: number, trend: string): 'easier' | 'maintain' | 'harder' {
    if (avgScore >= 85 && trend === 'improving') {return 'harder';}
    if (avgScore < 60 || trend === 'declining') {return 'easier';}
    return 'maintain';
  }

  private suggestNextTopics(strongAreas: string[], weakAreas: string[]): string[] {
    const topics: string[] = [];
    
    if (weakAreas.length > 0) {
      topics.push(`Remedial: ${weakAreas[0]}`);
    }
    
    if (strongAreas.length > 0) {
      topics.push(`Advanced: ${strongAreas[0]}`);
    }
    
    topics.push('Integration exercises combining multiple concepts');
    
    return topics;
  }
}

export default new AdaptiveCurriculum();
