class ProofOfKnowledge {
  validateProof(activity) {
    const validTypes = ['lesson_complete', 'quiz_passed', 'project_submitted', 'peer_help', 'content_created'];
    
    if (!validTypes.includes(activity.type)) {
      return { valid: false, reason: 'Invalid activity type' };
    }

    const proof = {
      activityId: activity.id,
      studentId: activity.studentId,
      type: activity.type,
      timestamp: new Date(),
      hash: this.generateHash(activity),
      verified: true
    };

    return { valid: true, proof };
  }

  generateHash(activity) {
    const data = `${activity.id}${activity.studentId}${activity.type}${Date.now()}`;
    return Buffer.from(data).toString('base64');
  }

  calculateReward(proof) {
    const baseRewards = {
      lesson_complete: 10,
      quiz_passed: 25,
      project_submitted: 50,
      peer_help: 15,
      content_created: 100
    };

    const multipliers = {
      streak: 1.0,
      quality: 1.0,
      difficulty: 1.0
    };

    const baseReward = baseRewards[proof.type] || 0;
    const totalMultiplier = Object.values(multipliers).reduce((a, b) => a * b, 1);
    
    return Math.floor(baseReward * totalMultiplier);
  }

  verifyChain(proofs) {
    for (let i = 1; i < proofs.length; i++) {
      if (proofs[i].timestamp < proofs[i - 1].timestamp) {
        return false;
      }
    }
    return true;
  }
}

module.exports = new ProofOfKnowledge();
