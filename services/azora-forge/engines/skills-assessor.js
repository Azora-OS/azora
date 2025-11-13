class SkillsAssessor {
  assessSkill(userId, skill, testResults) {
    const level = this.determineLevel(testResults.score);
    const certification = this.generateCertification(userId, skill, level);

    return {
      userId,
      skill,
      level,
      score: testResults.score,
      certification,
      assessedAt: new Date(),
      validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
    };
  }

  determineLevel(score) {
    if (score >= 90) return 'expert';
    if (score >= 75) return 'advanced';
    if (score >= 60) return 'intermediate';
    return 'beginner';
  }

  generateCertification(userId, skill, level) {
    return {
      id: `cert_${Date.now()}`,
      userId,
      skill,
      level,
      issuer: 'Azora OS',
      issuedAt: new Date(),
      blockchainHash: this.generateHash(userId, skill, level)
    };
  }

  generateHash(userId, skill, level) {
    return Buffer.from(`${userId}${skill}${level}${Date.now()}`).toString('base64');
  }

  createSkillProfile(userId, assessments) {
    const skills = assessments.map(a => ({
      name: a.skill,
      level: a.level,
      score: a.score,
      certified: true,
      certificationId: a.certification.id
    }));

    return {
      userId,
      skills,
      overallLevel: this.calculateOverallLevel(skills),
      strengths: this.identifyStrengths(skills),
      recommendations: this.getRecommendations(skills)
    };
  }

  calculateOverallLevel(skills) {
    const levelScores = { beginner: 1, intermediate: 2, advanced: 3, expert: 4 };
    const avgScore = skills.reduce((sum, s) => sum + levelScores[s.level], 0) / skills.length;
    
    if (avgScore >= 3.5) return 'expert';
    if (avgScore >= 2.5) return 'advanced';
    if (avgScore >= 1.5) return 'intermediate';
    return 'beginner';
  }

  identifyStrengths(skills) {
    return skills.filter(s => s.level === 'expert' || s.level === 'advanced')
      .map(s => s.name);
  }

  getRecommendations(skills) {
    const weakSkills = skills.filter(s => s.level === 'beginner' || s.level === 'intermediate');
    return weakSkills.map(s => `Improve ${s.name} to advance your career`);
  }
}

module.exports = new SkillsAssessor();
