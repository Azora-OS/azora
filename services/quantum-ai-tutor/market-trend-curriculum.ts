interface JobMarketData {
  skill: string;
  demand: number;
  avgSalary: number;
  growthRate: number;
  companies: number;
}

interface CurriculumModule {
  topic: string;
  priority: number;
  estimatedROI: number;
  prerequisites: string[];
}

export class MarketTrendCurriculum {
  private marketData: JobMarketData[] = [];
  private lastUpdate = 0;

  async updateFromMarket(): Promise<void> {
    this.marketData = [
      { skill: 'react', demand: 95, avgSalary: 120000, growthRate: 15, companies: 5000 },
      { skill: 'typescript', demand: 90, avgSalary: 115000, growthRate: 25, companies: 4500 },
      { skill: 'python', demand: 92, avgSalary: 110000, growthRate: 20, companies: 6000 },
      { skill: 'aws', demand: 88, avgSalary: 130000, growthRate: 30, companies: 3500 },
      { skill: 'docker', demand: 85, avgSalary: 118000, growthRate: 22, companies: 4000 },
      { skill: 'graphql', demand: 75, avgSalary: 125000, growthRate: 35, companies: 2000 },
      { skill: 'nextjs', demand: 80, avgSalary: 122000, growthRate: 40, companies: 2500 }
    ];
    this.lastUpdate = Date.now();
  }

  generateCurriculum(studentGoal: string): CurriculumModule[] {
    const relevantSkills = this.marketData
      .sort((a, b) => this.calculatePriority(b) - this.calculatePriority(a))
      .slice(0, 10);

    return relevantSkills.map(skill => ({
      topic: skill.skill,
      priority: this.calculatePriority(skill),
      estimatedROI: this.calculateROI(skill),
      prerequisites: this.getPrerequisites(skill.skill)
    }));
  }

  private calculatePriority(skill: JobMarketData): number {
    return (skill.demand * 0.3 + skill.growthRate * 0.4 + (skill.avgSalary / 1000) * 0.3);
  }

  private calculateROI(skill: JobMarketData): number {
    const learningTime = 120;
    const hourlyRate = skill.avgSalary / 2000;
    return (hourlyRate * 2000) / learningTime;
  }

  private getPrerequisites(skill: string): string[] {
    const prereqMap: Record<string, string[]> = {
      'react': ['javascript', 'html', 'css'],
      'typescript': ['javascript'],
      'nextjs': ['react', 'javascript'],
      'graphql': ['javascript', 'apis'],
      'docker': ['linux', 'cli'],
      'aws': ['cloud-basics', 'networking']
    };
    return prereqMap[skill] || ['programming-basics'];
  }

  getEmergingSkills(): string[] {
    return this.marketData
      .filter(s => s.growthRate > 30)
      .sort((a, b) => b.growthRate - a.growthRate)
      .map(s => s.skill);
  }
}
