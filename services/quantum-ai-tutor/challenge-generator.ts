interface StudentProfile {
  skillLevel: number;
  completedChallenges: string[];
  strengths: string[];
  weaknesses: string[];
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  difficulty: number;
  skills: string[];
  testCases: TestCase[];
  starterCode: string;
}

interface TestCase {
  input: any;
  expected: any;
  hidden: boolean;
}

export class ChallengeGenerator {
  private realProjectPatterns = [
    { type: 'api-integration', complexity: 60, skills: ['fetch', 'async', 'error-handling'] },
    { type: 'data-transformation', complexity: 50, skills: ['arrays', 'objects', 'algorithms'] },
    { type: 'ui-component', complexity: 55, skills: ['react', 'state', 'props'] },
    { type: 'authentication', complexity: 75, skills: ['security', 'jwt', 'validation'] },
    { type: 'database-query', complexity: 70, skills: ['sql', 'optimization', 'joins'] }
  ];

  generatePersonalizedChallenge(profile: StudentProfile, targetSkill: string): Challenge {
    const pattern = this.selectPattern(profile.skillLevel, targetSkill);
    const difficulty = this.calculateDifficulty(profile);
    
    return {
      id: `challenge-${Date.now()}`,
      title: this.generateTitle(pattern.type, targetSkill),
      description: this.generateDescription(pattern.type, difficulty),
      difficulty,
      skills: pattern.skills,
      testCases: this.generateTestCases(pattern.type),
      starterCode: this.generateStarterCode(pattern.type, targetSkill)
    };
  }

  private selectPattern(skillLevel: number, targetSkill: string) {
    return this.realProjectPatterns.find(p => 
      p.skills.includes(targetSkill) && Math.abs(p.complexity - skillLevel) < 20
    ) || this.realProjectPatterns[0];
  }

  private calculateDifficulty(profile: StudentProfile): number {
    const base = profile.skillLevel;
    const adjustment = profile.weaknesses.length * 5 - profile.strengths.length * 3;
    return Math.max(1, Math.min(100, base + adjustment));
  }

  private generateTitle(type: string, skill: string): string {
    const titles: Record<string, string> = {
      'api-integration': `Build ${skill} API Client`,
      'data-transformation': `Transform Data with ${skill}`,
      'ui-component': `Create ${skill} Component`,
      'authentication': `Implement ${skill} Auth`,
      'database-query': `Optimize ${skill} Queries`
    };
    return titles[type] || `Master ${skill}`;
  }

  private generateDescription(type: string, difficulty: number): string {
    return `Real-world ${type} challenge (difficulty: ${difficulty}/100). Build production-ready code that solves actual business problems.`;
  }

  private generateTestCases(type: string): TestCase[] {
    const cases: Record<string, TestCase[]> = {
      'api-integration': [
        { input: { url: '/api/users' }, expected: { status: 200 }, hidden: false },
        { input: { url: '/api/error' }, expected: { error: true }, hidden: true }
      ],
      'data-transformation': [
        { input: [1, 2, 3], expected: [2, 4, 6], hidden: false },
        { input: [], expected: [], hidden: true }
      ]
    };
    return cases[type] || [];
  }

  private generateStarterCode(type: string, skill: string): string {
    const templates: Record<string, string> = {
      'api-integration': `async function fetchData(url) {\n  // Your code here\n}`,
      'data-transformation': `function transform(data) {\n  // Your code here\n}`,
      'ui-component': `function Component(props) {\n  // Your code here\n}`
    };
    return templates[type] || `// Implement ${skill} solution`;
  }
}
