interface Question {
  id: string;
  question: string;
  type: 'multiple_choice' | 'short_answer' | 'code';
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
}

interface Assessment {
  id: string;
  subject: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  questions: Question[];
  timeLimit: number; // in minutes
  passingScore: number; // percentage
}

interface Answer {
  questionId: string;
  correct: boolean;
  points: number;
}
interface GradedAssessment {
  score: number;
  passed: boolean;
  earnedPoints: number;
  totalPoints: number;
  feedback: string;
}

class AssessmentEngine {
  createAssessment(subject: string, level: 'beginner' | 'intermediate' | 'advanced', questionCount = 10): Assessment {
    return {
      id: `assess_${Date.now()}`,
      subject,
      level,
      questions: this.generateQuestions(subject, level, questionCount),
      timeLimit: questionCount * 2,
      passingScore: 70,
    };
  }

  generateQuestions(subject: string, level: 'beginner' | 'intermediate' | 'advanced', count: number): Question[] {
    const difficulties = { beginner: 'easy', intermediate: 'medium', advanced: 'hard' } as const;

    return Array.from({ length: count }, (_, i) => ({
      id: `q_${i + 1}`,
      question: `${subject} question ${i + 1} at ${level} level`,
      type: i % 3 === 0 ? 'multiple_choice' : i % 3 === 1 ? 'short_answer' : 'code',
      difficulty: difficulties[level],
      points: difficulties[level] === 'hard' ? 15 : difficulties[level] === 'medium' ? 10 : 5,
    }));
  }

  gradeAssessment(answers: Answer[], assessment: Assessment): GradedAssessment {
    const totalPoints = assessment.questions.reduce((sum, q) => sum + q.points, 0);
    const earnedPoints = answers.reduce((sum, a) => sum + (a.correct ? a.points : 0), 0);
    const percentage = (earnedPoints / totalPoints) * 100;

    return {
      score: percentage,
      passed: percentage >= assessment.passingScore,
      earnedPoints,
      totalPoints,
      feedback: this.generateFeedback(percentage, answers),
    };
  }

  generateFeedback(score: number, answers: Answer[]): string {
    if (score >= 90) return 'Excellent work! You have mastered this material.';
    if (score >= 70) return 'Good job! Review the areas you missed.';
    return 'Keep practicing. Focus on the fundamentals.';
  }

  adaptiveDifficulty(studentHistory: { score: number }[]): 'increase' | 'decrease' | 'maintain' {
    if (studentHistory.length < 5) {
      return 'maintain';
    }
    const recentScores = studentHistory.slice(-5).map(h => h.score);
    const avgScore = recentScores.reduce((a, b) => a + b, 0) / recentScores.length;

    if (avgScore >= 85) return 'increase';
    if (avgScore < 60) return 'decrease';
    return 'maintain';
  }
}

export default new AssessmentEngine();
