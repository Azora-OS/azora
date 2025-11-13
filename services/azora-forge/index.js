const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const crypto = require('crypto');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3200;

app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json());

// In-memory storage
const jobs = new Map();
const applications = new Map();
const users = new Map();

// Job Matching Algorithm
class JobMatcher {
  calculateMatch(userSkills, jobRequirements) {
    if (!userSkills?.length || !jobRequirements?.length) return 0;
    
    const matches = userSkills.filter(skill => 
      jobRequirements.some(req => 
        req.toLowerCase().includes(skill.toLowerCase()) || 
        skill.toLowerCase().includes(req.toLowerCase())
      )
    );
    
    return Math.round((matches.length / jobRequirements.length) * 100);
  }

  findMatches(userId, maxResults = 10) {
    const user = users.get(userId);
    if (!user?.skills) return [];

    const matches = [];
    for (const [jobId, job] of jobs.entries()) {
      if (job.status !== 'active') continue;
      
      const score = this.calculateMatch(user.skills, job.requirements);
      if (score > 0) {
        matches.push({ jobId, job, score });
      }
    }

    return matches.sort((a, b) => b.score - a.score).slice(0, maxResults);
  }
}

// Skills Assessment Engine
class SkillsAssessor {
  assessSkill(skill, level, experience) {
    const levelScore = { beginner: 1, intermediate: 2, advanced: 3, expert: 4 }[level] || 1;
    const expScore = Math.min(experience || 0, 10) / 10;
    return Math.round((levelScore * 25 + expScore * 75));
  }

  assessProfile(skills) {
    if (!skills?.length) return { overall: 0, breakdown: [] };
    
    const breakdown = skills.map(s => ({
      skill: s.name,
      score: this.assessSkill(s.name, s.level, s.experience),
      level: s.level
    }));
    
    const overall = Math.round(
      breakdown.reduce((sum, s) => sum + s.score, 0) / breakdown.length
    );
    
    return { overall, breakdown, totalSkills: skills.length };
  }
}

const matcher = new JobMatcher();
const assessor = new SkillsAssessor();

app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'azora-forge',
    timestamp: new Date().toISOString(),
    stats: { jobs: jobs.size, applications: applications.size, users: users.size }
  });
});

// Jobs
app.post('/api/jobs', (req, res) => {
  const { title, company, requirements, salary, location } = req.body;
  const jobId = crypto.randomUUID();
  
  jobs.set(jobId, {
    jobId, title, company, requirements: requirements || [],
    salary, location, status: 'active',
    createdAt: new Date()
  });
  
  res.json({ jobId, job: jobs.get(jobId) });
});

app.get('/api/jobs', (req, res) => {
  const { status = 'active' } = req.query;
  const jobList = Array.from(jobs.values())
    .filter(j => !status || j.status === status);
  res.json({ jobs: jobList, total: jobList.length });
});

app.get('/api/jobs/:jobId', (req, res) => {
  const job = jobs.get(req.params.jobId);
  if (!job) return res.status(404).json({ error: 'Job not found' });
  res.json({ job });
});

// Applications
app.post('/api/jobs/:jobId/apply', (req, res) => {
  const { userId, coverLetter } = req.body;
  const job = jobs.get(req.params.jobId);
  
  if (!job) return res.status(404).json({ error: 'Job not found' });
  
  const applicationId = crypto.randomUUID();
  const user = users.get(userId);
  const matchScore = user ? matcher.calculateMatch(user.skills, job.requirements) : 0;
  
  applications.set(applicationId, {
    applicationId, jobId: req.params.jobId, userId,
    coverLetter, matchScore, status: 'pending',
    appliedAt: new Date()
  });
  
  res.json({ applicationId, application: applications.get(applicationId) });
});

app.get('/api/applications/:userId', (req, res) => {
  const userApps = Array.from(applications.values())
    .filter(a => a.userId === req.params.userId);
  res.json({ applications: userApps, total: userApps.length });
});

// Skills Assessment
app.post('/api/skills/assess', (req, res) => {
  const { userId, skills } = req.body;
  const assessment = assessor.assessProfile(skills);
  
  if (userId) {
    users.set(userId, { userId, skills, assessment, updatedAt: new Date() });
  }
  
  res.json({ assessment });
});

app.get('/api/skills/profile/:userId', (req, res) => {
  const user = users.get(req.params.userId);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ profile: user });
});

// Job Matching
app.post('/api/match', (req, res) => {
  const { userId, maxResults = 10 } = req.body;
  const matches = matcher.findMatches(userId, maxResults);
  res.json({ matches, total: matches.length });
});

app.post('/api/match/calculate', (req, res) => {
  const { userSkills, jobRequirements } = req.body;
  const score = matcher.calculateMatch(userSkills, jobRequirements);
  res.json({ score, match: score > 50 ? 'good' : score > 30 ? 'fair' : 'poor' });
});

app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: err.message });
});

app.listen(PORT, () => {
  console.log(`🔨 Azora Forge running on port ${PORT}`);
  console.log(`📊 Job Matching & Skills Assessment Ready`);
});

module.exports = app;
