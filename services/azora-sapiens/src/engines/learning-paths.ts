interface StudentProfile {
  currentLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  interests: string[];
  learningStyle: 'visual' | 'auditory' | 'reading' | 'kinesthetic';
}

interface Milestone {
  level: string;
  order: number;
  skills: string[];
  completed: boolean;
}

interface LearningPath {
  goal: string;
  currentLevel: string;
  milestones: Milestone[];
  estimatedDuration: number; // in months
  resources: Record<string, number>;
  assessments: { type: string; frequency: string }[];
}

class LearningPathEngine {
  generatePath(studentProfile: StudentProfile, goal: string): LearningPath {
    const { currentLevel, interests, learningStyle } = studentProfile;

    const path: LearningPath = {
      goal,
      currentLevel,
      milestones: this.createMilestones(currentLevel, goal),
      estimatedDuration: this.calculateDuration(currentLevel, goal),
      resources: this.recommendResources(goal, learningStyle),
      assessments: this.scheduleAssessments(goal),
    };

    return path;
  }

  private createMilestones(current: string, goal: string): Milestone[] {
    const levels = ['beginner', 'intermediate', 'advanced', 'expert'];
    const startIndex = levels.indexOf(current);
    const goalIndex = levels.indexOf(goal);

    return levels.slice(startIndex + 1, goalIndex + 1).map((level, i) => ({
      level,
      order: i + 1,
      skills: this.getSkillsForLevel(level),
      completed: false,
    }));
  }

  private getSkillsForLevel(level: string): string[] {
    const skillMap: Record<string, string[]> = {
      beginner: ['fundamentals', 'basic_concepts', 'simple_exercises'],
      intermediate: ['applied_knowledge', 'problem_solving', 'projects'],
      advanced: ['complex_systems', 'optimization', 'real_world_apps'],
      expert: ['research', 'innovation', 'teaching_others'],
    };
    return skillMap[level] || [];
  }

  private calculateDuration(current: string, goal: string): number {
    const durations: Record<string, number> = { beginner: 0, intermediate: 3, advanced: 6, expert: 12 };
    return durations[goal] - durations[current];
  }

  private recommendResources(goal: string, style: string): Record<string, number> {
    return {
      videos: style === 'visual' ? 10 : 5,
      readings: style === 'reading' ? 15 : 8,
      exercises: 20,
      projects: 5,
    };
  }

  private scheduleAssessments(goal: string): { type: string; frequency: string }[] {
    return [
      { type: 'quiz', frequency: 'weekly' },
      { type: 'project', frequency: 'monthly' },
      { type: 'final', frequency: 'end' },
    ];
  }
}

export default new LearningPathEngine();
