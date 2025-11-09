/*
AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.
*/

import express from 'express';
import cors from 'cors';
import CareerServicesSystem from '../career-services';
import FreelanceMarketplaceSystem from '../freelance-marketplace';

const app = express();
app.use(cors());
app.use(express.json());

const careers = new CareerServicesSystem();
const freelance = new FreelanceMarketplaceSystem();

// Jobs
app.get('/api/v1/careers/jobs', async (req, res) => {
  const result = await careers.searchJobs({}, 1, 20);
  res.json(result);
});

app.post('/api/v1/careers/jobs', async (req, res) => {
  const job = await careers.postJob(req.body);
  res.json(job);
});

// Applications
app.post('/api/v1/careers/applications', async (req, res) => {
  const app = await careers.submitApplication(req.body);
  res.json(app);
});

// Freelance Gigs
app.get('/api/v1/freelance/gigs', async (req, res) => {
  const result = await freelance.searchGigs({}, 1, 20);
  res.json(result);
});

app.post('/api/v1/freelance/gigs', async (req, res) => {
  const gig = await freelance.postGig(req.body);
  res.json(gig);
});

// Proposals
app.post('/api/v1/freelance/proposals', async (req, res) => {
  const proposal = await freelance.submitProposal(req.body);
  res.json(proposal);
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'azora-careers' });
});

const PORT = process.env.PORT || 4800;
app.listen(PORT, () => console.log(`💼 Azora Careers on port ${PORT}`));
