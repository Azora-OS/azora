class JobMatcher {
  matchJobs(candidate, jobs) {
    return jobs.map(job => ({
      job,
      score: this.calculateMatchScore(candidate, job),
      reasons: this.getMatchReasons(candidate, job)
    })).filter(m => m.score >= 60).sort((a, b) => b.score - a.score);
  }

  calculateMatchScore(candidate, job) {
    const skillMatch = this.skillMatchScore(candidate.skills, job.requiredSkills);
    const experienceMatch = this.experienceMatchScore(candidate.experience, job.requiredExperience);
    const locationMatch = this.locationMatchScore(candidate.location, job.location);
    const salaryMatch = this.salaryMatchScore(candidate.expectedSalary, job.salary);

    return Math.floor(
      skillMatch * 0.4 +
      experienceMatch * 0.3 +
      locationMatch * 0.15 +
      salaryMatch * 0.15
    );
  }

  skillMatchScore(candidateSkills, requiredSkills) {
    const matches = requiredSkills.filter(rs => 
      candidateSkills.some(cs => cs.name === rs.name && cs.level >= rs.level)
    );
    return (matches.length / requiredSkills.length) * 100;
  }

  experienceMatchScore(candidateExp, requiredExp) {
    if (candidateExp >= requiredExp) return 100;
    return (candidateExp / requiredExp) * 100;
  }

  locationMatchScore(candidateLoc, jobLoc) {
    if (jobLoc === 'remote') return 100;
    return candidateLoc === jobLoc ? 100 : 50;
  }

  salaryMatchScore(expected, offered) {
    if (offered >= expected) return 100;
    return (offered / expected) * 100;
  }

  getMatchReasons(candidate, job) {
    const reasons = [];
    const skillScore = this.skillMatchScore(candidate.skills, job.requiredSkills);
    
    if (skillScore >= 80) reasons.push('Strong skill match');
    if (candidate.experience >= job.requiredExperience) reasons.push('Experience requirement met');
    if (job.location === 'remote') reasons.push('Remote opportunity');
    
    return reasons;
  }
}

module.exports = new JobMatcher();
