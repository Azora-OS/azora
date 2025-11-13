const express = require('express');
const router = express.Router();
const jobMatcher = require('../engines/job-matcher');
const skillsAssessor = require('../engines/skills-assessor');
const escrowSystem = require('../engines/escrow-system');

router.post('/match', (req, res) => {
  const { candidate, jobs } = req.body;
  const matches = jobMatcher.matchJobs(candidate, jobs);
  res.json(matches);
});

router.post('/assess', (req, res) => {
  const { userId, skill, testResults } = req.body;
  const assessment = skillsAssessor.assessSkill(userId, skill, testResults);
  res.json(assessment);
});

router.post('/profile', (req, res) => {
  const { userId, assessments } = req.body;
  const profile = skillsAssessor.createSkillProfile(userId, assessments);
  res.json(profile);
});

router.post('/escrow/create', (req, res) => {
  const { jobId, clientId, freelancerId, amount } = req.body;
  const escrow = escrowSystem.createEscrow(jobId, clientId, freelancerId, amount);
  res.json(escrow);
});

router.post('/escrow/:id/milestone', (req, res) => {
  const result = escrowSystem.addMilestone(req.params.id, req.body);
  res.json(result);
});

router.post('/escrow/:escrowId/milestone/:milestoneId/complete', (req, res) => {
  const result = escrowSystem.completeMilestone(req.params.escrowId, req.params.milestoneId);
  res.json(result);
});

router.post('/escrow/:escrowId/milestone/:milestoneId/release', (req, res) => {
  const result = escrowSystem.releasePayment(req.params.escrowId, req.params.milestoneId);
  res.json(result);
});

router.post('/escrow/:id/dispute', (req, res) => {
  const { raisedBy, reason } = req.body;
  const result = escrowSystem.raiseDispute(req.params.id, raisedBy, reason);
  res.json(result);
});

module.exports = router;
