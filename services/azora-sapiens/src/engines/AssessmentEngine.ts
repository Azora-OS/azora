export interface Assessment {
  id: string;
  studentId: string;
  subject: string;
  questions: Question[];
  answers: Map<string, string>;
  score: number;
  completed: boolean;
  startedAt: Date;
  completedAt?: Date;
}

export interface Question {
  id: string;
  text: string;
  type: 'multiple_choice' | 'short_answer' | 'true_false';
  options?: string[];
  correctAnswer: string;
  points: number;
}

export class AssessmentEngine {
  private assessments: Map<string, Assessment> = new Map();

  createAssessment(studentId: string, subject: string, difficulty: string): Assessment {
    const assessment: Assessment = {
      id: `assess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      studentId,
      subject,
      questions: this.generateQuestions(subject, difficulty),
      answers: new Map(),
      score: 0,
      completed: false,
      startedAt: new Date()
    };
    this.assessments.set(assessment.id, assessment);
    return assessment;
  }

  private generateQuestions(subject: string, difficulty: string): Question[] {
    const questionSets: Record<string, Question[]> = {
      math: [
        { id: 'q1', text: 'What is 7 × 8?', type: 'multiple_choice', options: ['54', '56', '58', '60'], correctAnswer: '56', points: 10 },
        { id: 'q2', text: 'Solve: x + 5 = 12', type: 'short_answer', correctAnswer: '7', points: 15 },
        { id: 'q3', text: 'Is 15 a prime number?', type: 'true_false', correctAnswer: 'false', points: 10 }
      ],
      science: [
        { id: 'q1', text: 'What is H2O?', type: 'multiple_choice', options: ['Water', 'Oxygen', 'Hydrogen', 'Carbon'], correctAnswer: 'Water', points: 10 },
        { id: 'q2', text: 'Name the three states of matter', type: 'short_answer', correctAnswer: 'solid, liquid, gas', points: 15 },
        { id: 'q3', text: 'The sun is a star', type: 'true_false', correctAnswer: 'true', points: 10 }
      ],
      default: [
        { id: 'q1', text: 'Sample question 1', type: 'multiple_choice', options: ['A', 'B', 'C', 'D'], correctAnswer: 'A', points: 10 },
        { id: 'q2', text: 'Sample question 2', type: 'short_answer', correctAnswer: 'answer', points: 15 },
        { id: 'q3', text: 'Sample true/false', type: 'true_false', correctAnswer: 'true', points: 10 }
      ]
    };

    return questionSets[subject.toLowerCase()] || questionSets.default;
  }

  submitAnswer(assessmentId: string, questionId: string, answer: string): void {
    const assessment = this.assessments.get(assessmentId);
    if (!assessment) {throw new Error('Assessment not found');}
    if (assessment.completed) {throw new Error('Assessment already completed');}

    assessment.answers.set(questionId, answer);
  }

  completeAssessment(assessmentId: string): { score: number; total: number; percentage: number } {
    const assessment = this.assessments.get(assessmentId);
    if (!assessment) {throw new Error('Assessment not found');}

    let score = 0;
    let total = 0;

    assessment.questions.forEach(q => {
      total += q.points;
      const answer = assessment.answers.get(q.id);
      if (answer && this.checkAnswer(answer, q.correctAnswer, q.type)) {
        score += q.points;
      }
    });

    assessment.score = score;
    assessment.completed = true;
    assessment.completedAt = new Date();

    return { score, total, percentage: (score / total) * 100 };
  }

  private checkAnswer(answer: string, correct: string, type: string): boolean {
    const a = answer.toLowerCase().trim();
    const c = correct.toLowerCase().trim();
    
    if (type === 'short_answer') {
      return a.includes(c) || c.includes(a);
    }
    return a === c;
  }

  getAssessment(assessmentId: string): Assessment | undefined {
    return this.assessments.get(assessmentId);
  }

  getStudentAssessments(studentId: string): Assessment[] {
    return Array.from(this.assessments.values()).filter(a => a.studentId === studentId);
  }
}
