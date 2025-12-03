export interface LearningPath {
  id: string;
  studentId: string;
  title: string;
  subject: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  steps: PathStep[];
  progress: number;
  createdAt: Date;
}

export interface PathStep {
  id: string;
  title: string;
  description: string;
  order: number;
  completed: boolean;
  resources: string[];
}

export class LearningPathEngine {
  private paths: Map<string, LearningPath> = new Map();

  createPath(studentId: string, subject: string, difficulty: 'beginner' | 'intermediate' | 'advanced'): LearningPath {
    const path: LearningPath = {
      id: `path_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      studentId,
      title: `${subject} - ${difficulty} Path`,
      subject,
      difficulty,
      steps: this.generateSteps(subject, difficulty),
      progress: 0,
      createdAt: new Date()
    };
    this.paths.set(path.id, path);
    return path;
  }

  private generateSteps(subject: string, difficulty: string): PathStep[] {
    const baseSteps: Record<string, string[]> = {
      math: ['Numbers & Operations', 'Algebra Basics', 'Geometry', 'Problem Solving'],
      science: ['Scientific Method', 'Matter & Energy', 'Life Science', 'Earth Science'],
      english: ['Grammar Basics', 'Reading Comprehension', 'Writing Skills', 'Literature'],
      history: ['Ancient Civilizations', 'Medieval Period', 'Modern Era', 'Contemporary History'],
      default: ['Fundamentals', 'Core Concepts', 'Advanced Topics', 'Mastery']
    };

    const titles = baseSteps[subject.toLowerCase()] || baseSteps.default;
    return titles.map((title, index) => ({
      id: `step_${index + 1}`,
      title,
      description: `Master ${title.toLowerCase()} concepts`,
      order: index + 1,
      completed: false,
      resources: [`${title} Guide`, `${title} Exercises`, `${title} Quiz`]
    }));
  }

  completeStep(pathId: string, stepId: string): void {
    const path = this.paths.get(pathId);
    if (!path) {throw new Error('Path not found');}

    const step = path.steps.find(s => s.id === stepId);
    if (step) {
      step.completed = true;
      path.progress = (path.steps.filter(s => s.completed).length / path.steps.length) * 100;
    }
  }

  getPath(pathId: string): LearningPath | undefined {
    return this.paths.get(pathId);
  }

  getStudentPaths(studentId: string): LearningPath[] {
    return Array.from(this.paths.values()).filter(p => p.studentId === studentId);
  }

  getNextStep(pathId: string): PathStep | null {
    const path = this.paths.get(pathId);
    if (!path) {return null;}
    return path.steps.find(s => !s.completed) || null;
  }
}
