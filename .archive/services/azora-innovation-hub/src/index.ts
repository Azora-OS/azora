/*
AZORA PROPRIETARY LICENSE

🚀 AZORA INNOVATION HUB
Where African startups are born!

Incubation + Funding + Mentorship = Success!
*/

import express from 'express';
import cors from 'cors';
import { IncubatorService } from './incubator/incubatorService';

const app = express();
const PORT = process.env.PORT || 12349;

// Middleware
app.use(cors());
app.use(express.json());

// ========================
// INCUBATOR ROUTES
// ========================

app.post('/api/incubator/apply', async (req, res) => {
  try {
    const application = await IncubatorService.submitApplication(req.body);
    res.json({ success: true, application });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/incubator/evaluate', async (req, res) => {
  try {
    const { applicationId, evaluatorId } = req.body;
    const evaluation = await IncubatorService.evaluateApplication(applicationId, evaluatorId);
    res.json({ success: true, evaluation });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/incubator/cohort/create', async (req, res) => {
  try {
    const cohort = await IncubatorService.createCohort(req.body);
    res.json({ success: true, cohort });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/incubator/milestone/complete', async (req, res) => {
  try {
    const { startupId, milestoneId } = req.body;
    await IncubatorService.completeMilestone(startupId, milestoneId);
    res.json({ success: true, message: 'Milestone completed!' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/incubator/startup/:id', async (req, res) => {
  try {
    const startup = await IncubatorService.getStartup(req.params.id);
    res.json({ success: true, startup });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/incubator/stats', async (req, res) => {
  try {
    const stats = await IncubatorService.getStats();
    res.json({ success: true, stats });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ========================
// HEALTH & STATUS
// ========================

app.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    service: 'azora-innovation-hub',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    features: {
      incubator: '✅',
      ventureFunding: '🚧 Coming soon',
      ipManagement: '🚧 Coming soon',
      cofounderMatching: '🚧 Coming soon'
    }
  });
});

app.get('/', (req, res) => {
  res.json({
    service: 'Azora Innovation Hub',
    version: '1.0.0',
    description: 'Where African startups are born - incubation, funding, mentorship',
    endpoints: {
      incubator: '/api/incubator/*',
      funding: '/api/funding/* (coming soon)',
      ip: '/api/ip/* (coming soon)'
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log('╔════════════════════════════════════════════╗');
  console.log('║   🚀 AZORA INNOVATION HUB - READY!        ║');
  console.log('╠════════════════════════════════════════════╣');
  console.log(`║   Port: ${PORT}                              ║`);
  console.log('║   Status: ✅ ACTIVE                        ║');
  console.log('╠════════════════════════════════════════════╣');
  console.log('║   🏢 Incubator: READY                     ║');
  console.log('║   💼 Funding: Coming soon                 ║');
  console.log('║   📜 IP Management: Coming soon           ║');
  console.log('║   🤝 Co-founder Matching: Coming soon     ║');
  console.log('╚════════════════════════════════════════════╝');
  console.log('\n🚀 BUILD THE FUTURE OF AFRICA! ✨\n');
});

export default app;
