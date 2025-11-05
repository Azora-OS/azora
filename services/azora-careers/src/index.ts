/*
AZORA PROPRIETARY LICENSE

💼 AZORA CAREERS - LAND YOUR DREAM JOB!

Complete job-landing toolkit:
- CV/Resume Builder AI
- Cover Letter Generator
- Interview Prep AI
- Salary Negotiation AI
- Career Pathways
- Job Board

GET HIRED FASTER! 💼✨
*/

import express from 'express';
import cors from 'cors';
import { ResumeBuilderAI } from './resume-builder/resumeBuilderAI';
import { InterviewPrepAI } from './interview-prep/interviewPrepAI';
import { SalaryNegotiationAI } from './salary-negotiation/salaryNegotiationAI';
import { CareerPathwaysService } from './career-pathways/careerPathwaysService';

const app = express();
const PORT = process.env.PORT || 12348;

// Middleware
app.use(cors());
app.use(express.json());

// ========================
// RESUME BUILDER ROUTES
// ========================

app.post('/api/resume/create', async (req, res) => {
  try {
    const resume = await ResumeBuilderAI.createResume(req.body);
    res.json({ success: true, resume });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/resume/analyze', async (req, res) => {
  try {
    const { resumeId } = req.body;
    const analysis = await ResumeBuilderAI.analyzeResume(resumeId);
    res.json({ success: true, analysis });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/resume/hiring-tricks', (req, res) => {
  const tricks = ResumeBuilderAI.getHiringTricks();
  res.json({ success: true, tricks });
});

// ========================
// COVER LETTER ROUTES
// ========================

app.post('/api/cover-letter/generate', async (req, res) => {
  try {
    const coverLetter = await ResumeBuilderAI.generateCoverLetter(req.body);
    res.json({ success: true, coverLetter });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ========================
// INTERVIEW PREP ROUTES
// ========================

app.post('/api/interview/start', async (req, res) => {
  try {
    const { userId, targetRole, targetCompany } = req.body;
    const session = await InterviewPrepAI.startSession({ userId, targetRole, targetCompany });
    res.json({ success: true, session });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/interview/answer', async (req, res) => {
  try {
    const { sessionId, questionId, answer } = req.body;
    const feedback = await InterviewPrepAI.submitAnswer({ sessionId, questionId, answer });
    res.json({ success: true, feedback });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/interview/progress/:userId', async (req, res) => {
  try {
    const progress = await InterviewPrepAI.getUserProgress(req.params.userId);
    res.json({ success: true, progress });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ========================
// SALARY NEGOTIATION ROUTES
// ========================

app.post('/api/salary/market-rate', async (req, res) => {
  try {
    const marketRate = await SalaryNegotiationAI.getMarketRate(req.body);
    res.json({ success: true, marketRate });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/salary/strategy', async (req, res) => {
  try {
    const strategy = await SalaryNegotiationAI.generateStrategy(req.body);
    res.json({ success: true, strategy });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/salary/compare-offers', async (req, res) => {
  try {
    const { offers } = req.body;
    const comparison = await SalaryNegotiationAI.compareOffers(offers);
    res.json({ success: true, comparison });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/salary/negotiation-tips', (req, res) => {
  const tips = SalaryNegotiationAI.getNegotiationTips();
  res.json({ success: true, tips });
});

// ========================
// CAREER PATHWAYS ROUTES
// ========================

app.get('/api/pathways/all', (req, res) => {
  const paths = CareerPathwaysService.getCareerPaths();
  res.json({ success: true, paths });
});

app.post('/api/pathways/skill-gaps', async (req, res) => {
  try {
    const analysis = await CareerPathwaysService.analyzeSkillGaps(req.body);
    res.json({ success: true, analysis });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/pathways/transition', (req, res) => {
  try {
    const transition = CareerPathwaysService.getCareerTransition(req.body);
    res.json({ success: true, transition });
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
    service: 'azora-careers',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    features: {
      resumeBuilder: '✅',
      coverLetter: '✅',
      interviewPrep: '✅',
      salaryNegotiation: '✅',
      careerPathways: '✅',
      jobBoard: '🚧 Coming soon'
    }
  });
});

app.get('/', (req, res) => {
  res.json({
    service: 'Azora Careers',
    version: '1.0.0',
    description: 'Complete job-landing toolkit - CV builder, interview prep, salary negotiation, career pathways',
    endpoints: {
      resume: '/api/resume/*',
      coverLetter: '/api/cover-letter/*',
      interview: '/api/interview/*',
      salary: '/api/salary/*',
      pathways: '/api/pathways/*'
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log('╔════════════════════════════════════════════╗');
  console.log('║   💼 AZORA CAREERS - READY!               ║');
  console.log('╠════════════════════════════════════════════╣');
  console.log(`║   Port: ${PORT}                              ║`);
  console.log('║   Status: ✅ ACTIVE                        ║');
  console.log('╠════════════════════════════════════════════╣');
  console.log('║   📄 CV Builder: READY                    ║');
  console.log('║   📝 Cover Letters: READY                 ║');
  console.log('║   🎤 Interview Prep: READY                ║');
  console.log('║   💰 Salary Negotiation: READY            ║');
  console.log('║   🚀 Career Pathways: READY               ║');
  console.log('╚════════════════════════════════════════════╝');
  console.log('\n💼 LAND YOUR DREAM JOB! ✨\n');
});

export default app;
