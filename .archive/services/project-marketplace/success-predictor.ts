interface ProjectData {
  budget: number;
  deadline: Date;
  skills: string[];
  complexity: number;
}

interface StudentData {
  experience: number;
  completedProjects: number;
  rating: number;
  skills: string[];
}

interface Prediction {
  successProbability: number;
  estimatedRevenue: number;
  riskFactors: string[];
  recommendations: string[];
}

export class SuccessPredictor {
  predictProjectSuccess(project: ProjectData, student: StudentData): Prediction {
    const factors = {
      skillMatch: this.calculateSkillAlignment(project.skills, student.skills),
      experienceLevel: this.assessExperience(student, project.complexity),
      timelineRealism: this.evaluateTimeline(project),
      budgetAdequacy: this.assessBudget(project.budget, project.complexity),
      studentReliability: student.rating / 5
    };

    const successProbability = (
      factors.skillMatch * 0.3 +
      factors.experienceLevel * 0.25 +
      factors.timelineRealism * 0.15 +
      factors.budgetAdequacy * 0.15 +
      factors.studentReliability * 0.15
    );

    const estimatedRevenue = project.budget * successProbability;
    const riskFactors = this.identifyRisks(factors);
    const recommendations = this.generateRecommendations(factors);

    return { successProbability, estimatedRevenue, riskFactors, recommendations };
  }

  private calculateSkillAlignment(required: string[], available: string[]): number {
    const matches = required.filter(skill => 
      available.some(s => s.toLowerCase() === skill.toLowerCase())
    );
    return required.length > 0 ? matches.length / required.length : 0;
  }

  private assessExperience(student: StudentData, complexity: number): number {
    const experienceScore = Math.min(student.experience / 5, 1);
    const projectScore = Math.min(student.completedProjects / 10, 1);
    const complexityPenalty = complexity > student.experience ? 0.5 : 1;
    
    return (experienceScore * 0.6 + projectScore * 0.4) * complexityPenalty;
  }

  private evaluateTimeline(project: ProjectData): number {
    const daysUntilDeadline = Math.ceil(
      (project.deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    const minDays = project.complexity * 7;
    
    if (daysUntilDeadline < minDays) return 0.3;
    if (daysUntilDeadline < minDays * 1.5) return 0.7;
    return 1.0;
  }

  private assessBudget(budget: number, complexity: number): number {
    const minBudget = complexity * 500;
    return Math.min(budget / minBudget, 1);
  }

  private identifyRisks(factors: Record<string, number>): string[] {
    const risks: string[] = [];
    if (factors.skillMatch < 0.7) risks.push('Skill gap detected');
    if (factors.experienceLevel < 0.5) risks.push('Insufficient experience');
    if (factors.timelineRealism < 0.5) risks.push('Tight deadline');
    if (factors.budgetAdequacy < 0.7) risks.push('Budget may be insufficient');
    if (factors.studentReliability < 0.6) risks.push('Low student rating');
    return risks;
  }

  private generateRecommendations(factors: Record<string, number>): string[] {
    const recommendations: string[] = [];
    if (factors.skillMatch < 0.7) recommendations.push('Consider additional training');
    if (factors.timelineRealism < 0.7) recommendations.push('Extend deadline');
    if (factors.budgetAdequacy < 0.8) recommendations.push('Increase budget by 20%');
    return recommendations;
  }
}
