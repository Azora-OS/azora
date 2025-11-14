import * as crypto from 'crypto';

interface Question {
  q: string;
  a: string;
}

interface Challenge {
  id: string;
  studentId: string;
  subject: string;
  questions: Question[];
  timestamp: number;
  difficulty: number;
}

interface Proof {
  valid: boolean;
  score: number;
  correct: number;
  total: number;
}

export class ProofOfKnowledgeEngine {
  difficulty: number;
  baseReward: number;

  constructor() {
    this.difficulty = 4;
    this.baseReward = 10;
  }

  generateChallenge(studentId: string, subject: string): Challenge {
    return {
      id: crypto.randomBytes(16).toString('hex'),
      studentId,
      subject,
      questions: this.getQuestions(subject),
      timestamp: Date.now(),
      difficulty: this.difficulty
    };
  }

  getQuestions(subject: string): Question[] {
    const questions: { [key: string]: Question[] } = {
      javascript: [
        { q: 'What is a closure?', a: 'function that accesses outer scope' },
        { q: 'Explain async/await', a: 'promise handling syntax' }
      ],
      python: [
        { q: 'What is a decorator?', a: 'function wrapper' },
        { q: 'Explain list comprehension', a: 'concise list creation' }
      ]
    };
    return questions[subject] || questions.javascript;
  }

  verifyProof(challenge: Challenge, answers: string[]): Proof {
    let correct = 0;
    challenge.questions.forEach((q: Question, i: number) => {
      if (answers[i]?.toLowerCase().includes(q.a.toLowerCase())) correct++;
    });
    const score = correct / challenge.questions.length;
    return { valid: score >= 0.7, score, correct, total: challenge.questions.length };
  }

  calculateReward(proof: Proof, studentLevel = 1): number {
    const baseReward = this.baseReward;
    const scoreMultiplier = proof.score;
    const levelBonus = studentLevel * 0.1;
    return Math.floor(baseReward * scoreMultiplier * (1 + levelBonus));
  }

  mine(challenge: Challenge, answers: string[], studentLevel: number): { success: boolean; block?: any; reward?: number; message?: string } {
    const proof = this.verifyProof(challenge, answers);
    if (!proof.valid) return { success: false, message: 'Insufficient knowledge proof' };

    const reward = this.calculateReward(proof, studentLevel);
    const block = {
      id: crypto.randomBytes(16).toString('hex'),
      challengeId: challenge.id,
      studentId: challenge.studentId,
      proof,
      reward,
      timestamp: Date.now(),
      hash: this.hashBlock(challenge, proof)
    };

    return { success: true, block, reward };
  }

  hashBlock(challenge: Challenge, proof: Proof): string {
    const data = JSON.stringify({ challenge, proof, timestamp: Date.now() });
    return crypto.createHash('sha256').update(data).digest('hex');
  }
}
