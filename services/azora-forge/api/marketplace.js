const express = require('express');
const router = express.Router();

const jobs = new Map();
const applications = new Map();
const profiles = new Map();

// Jobs
router.get('/jobs', (req, res) => {
  const { type, location, remote, skills } = req.query;
  let list = Array.from(jobs.values());
  
  if (type) list = list.filter(j => j.type === type);
  if (location) list = list.filter(j => j.location.toLowerCase().includes(location.toLowerCase()));
  if (remote === 'true') list = list.filter(j => j.remote === true);
  if (skills) {
    const skillList = skills.split(',');
    list = list.filter(j => skillList.some(s => j.skills.includes(s)));
  }
  
  res.json({ success: true, data: list, count: list.length });
});

router.post('/jobs', (req, res) => {
  const job = {
    id: `job_${Date.now()}`,
    ...req.body,
    status: 'active',
    postedAt: new Date()
  };
  jobs.set(job.id, job);
  res.status(201).json({ success: true, data: job });
});

router.get('/jobs/:id', (req, res) => {
  const job = jobs.get(req.params.id);
  if (!job) return res.status(404).json({ success: false, error: 'Job not found' });
  res.json({ success: true, data: job });
});

router.put('/jobs/:id', (req, res) => {
  const job = jobs.get(req.params.id);
  if (!job) return res.status(404).json({ success: false, error: 'Job not found' });
  Object.assign(job, req.body);
  res.json({ success: true, data: job });
});

router.delete('/jobs/:id', (req, res) => {
  const deleted = jobs.delete(req.params.id);
  res.json({ success: deleted });
});

// Applications
router.post('/jobs/:jobId/apply', (req, res) => {
  const { userId, coverLetter, resume } = req.body;
  const job = jobs.get(req.params.jobId);
  if (!job) return res.status(404).json({ success: false, error: 'Job not found' });
  
  const application = {
    id: `app_${Date.now()}`,
    jobId: req.params.jobId,
    userId,
    coverLetter,
    resume,
    status: 'pending',
    appliedAt: new Date()
  };
  applications.set(application.id, application);
  res.status(201).json({ success: true, data: application });
});

router.get('/applications/:userId', (req, res) => {
  const userApps = Array.from(applications.values())
    .filter(a => a.userId === req.params.userId)
    .map(a => ({ ...a, job: jobs.get(a.jobId) }));
  res.json({ success: true, data: userApps });
});

router.put('/applications/:id', (req, res) => {
  const app = applications.get(req.params.id);
  if (!app) return res.status(404).json({ success: false, error: 'Application not found' });
  Object.assign(app, req.body);
  res.json({ success: true, data: app });
});

// Profiles
router.post('/profiles', (req, res) => {
  const profile = {
    id: `profile_${Date.now()}`,
    ...req.body,
    rating: 0,
    verified: false,
    createdAt: new Date()
  };
  profiles.set(profile.userId, profile);
  res.status(201).json({ success: true, data: profile });
});

router.get('/profiles/:userId', (req, res) => {
  const profile = profiles.get(req.params.userId);
  if (!profile) return res.status(404).json({ success: false, error: 'Profile not found' });
  res.json({ success: true, data: profile });
});

router.put('/profiles/:userId', (req, res) => {
  const profile = profiles.get(req.params.userId);
  if (!profile) return res.status(404).json({ success: false, error: 'Profile not found' });
  Object.assign(profile, req.body, { updatedAt: new Date() });
  res.json({ success: true, data: profile });
});

// AI Matching
router.post('/match', (req, res) => {
  const { userId, skills, experience, location } = req.body;
  const matches = Array.from(jobs.values())
    .filter(j => j.status === 'active')
    .map(j => {
      let score = 0;
      const skillMatch = skills.filter(s => j.skills.includes(s)).length / j.skills.length;
      const expMatch = Math.abs(j.experience - experience) <= 2 ? 1 : 0.5;
      const locMatch = j.remote || j.location === location ? 1 : 0.5;
      
      score = (skillMatch * 0.5) + (expMatch * 0.3) + (locMatch * 0.2);
      return { job: j, score: Math.round(score * 100) };
    })
    .filter(m => m.score >= 50)
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);
  
  res.json({ success: true, data: matches });
});

module.exports = router;
