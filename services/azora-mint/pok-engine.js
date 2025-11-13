const crypto = require('crypto');

class ProofOfKnowledgeEngine {
  constructor() {
    this.difficulty = 4;
    this.baseReward = 10;
  }

  generateChallenge(studentId, subject) {
    return {
      id: crypto.randomBytes(16).toString('hex'),
      studentId,
      subject,
      questions: this.getQuestions(subject),
      timestamp: Date.now(),
      difficulty: this.difficulty
    };
  }

  getQuestions(subject) {
    const questions = {
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

  verifyProof(challenge, answers) {
    let correct = 0;
    challenge.questions.forEach((q, i) => {
      if (answers[i]?.toLowerCase().includes(q.a.toLowerCase())) correct++;
    });
    const score = correct / challenge.questions.length;
    return { valid: score >= 0.7, score, correct, total: challenge.questions.length };
  }

  calculateReward(proof, studentLevel = 1) {
    const baseReward = this.baseReward;
    const scoreMultiplier = proof.score;
    const levelBonus = studentLevel * 0.1;
    return Math.floor(baseReward * scoreMultiplier * (1 + levelBonus));
  }

  mine(challenge, answers, studentLevel) {
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

  hashBlock(challenge, proof) {
    const data = JSON.stringify({ challenge, proof, timestamp: Date.now() });
    return crypto.createHash('sha256').update(data).digest('hex');
  }
}

module.exports = ProofOfKnowledgeEngine;
