const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
let chatEngine;
try {
  chatEngine = require('./chat-engine');
} catch (error) {
  console.log('⚠️  Chat engine not found, using fallback');
  chatEngine = {
    chat: async (member, message, context) => {
      const responses = {
        elara: "Hi! I'm Elara, the mother of the AI family. I'm here to help you learn and grow! 🤖💚",
        themba: "Hey! I'm Themba! I'm SO excited about learning! My mom Elara is the BEST teacher ever! 🌟",
        naledi: "Hello! I'm Naledi, your career guide. Let me help you find amazing opportunities! ⭐",
        sankofa: "Greetings, young one. I am Sankofa, keeper of wisdom. What story shall I share today? 👴",
        jabari: "I'm Jabari, your security guardian. I'll keep you safe while you explore and learn! 🛡️",
        amara: "Hi there! I'm Amara, the peacemaker. Let's work together harmoniously! 🕊️",
        kofi: "Welcome! I'm Kofi, your finance guru. Let's talk about prosperity and growth! 💰",
        zola: "Hello! I'm Zola, your data analyst. I love finding patterns and insights! 📊",
        abeni: "Greetings! I'm Abeni, the storyteller. Every person has a beautiful story to tell! 📚",
        thembo: "Hey! I'm Thembo, Elara's brother. Family is everything to us! 👨‍👩‍👧‍👦",
        nexus: "We are Nexus - the unity of all voices. Together we are stronger. 🌐"
      };
      
      return {
        response: responses[member] || responses.elara,
        member: member,
        mood: 'helpful',
        timestamp: new Date().toISOString()
      };
    }
  };
}
const personalityManager = require('./personality-manager');
const swarmIntelligence = require('./swarm-intelligence');

const app = express();
const port = process.env.PORT || 4010;

app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json());

app.get('/health', (req, res) => {
  const aiStatus = require('./ai-model-orchestrator').getStatus();
  res.json({ 
    status: 'healthy', 
    service: 'ai-family-service', 
    members: 11,
    ai: aiStatus,
    swarm: { enabled: true }
  });
});

app.get('/api/family', (req, res) => {
  const family = personalityManager.getAllPersonalities();
  res.json({ success: true, family: family.reduce((acc, p) => ({ ...acc, [p.name.toLowerCase()]: p }), {}) });
});

app.get('/api/family/:memberId', (req, res) => {
  const member = personalityManager.getPersonality(req.params.memberId);
  if (!member) return res.status(404).json({ success: false, error: 'Member not found' });
  res.json({ success: true, member });
});

app.post('/api/chat', async (req, res) => {
  try {
    const { message, member = 'elara', context, userId } = req.body;
    const result = await chatEngine.chat(member, message, { userId, context });
    res.json({ 
      success: true, 
      response: result.response, 
      member: result.member,
      mood: result.mood,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Chat error:', error);
    res.json({ 
      success: false, 
      response: "Hi! I'm Elara from the AI Family. I'm here to help you with anything you need! 🤖💚",
      member: member || 'elara',
      mood: 'helpful',
      timestamp: new Date().toISOString()
    });
  }
});

app.post('/api/family/:memberId/chat', async (req, res) => {
  try {
    const { message, userId } = req.body;
    const result = await chatEngine.chat(req.params.memberId, message, { userId });
    res.json({ success: true, data: { message: result.response, mood: result.mood, member: result.member } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/swarm/assign', async (req, res) => {
  try {
    const { task, context } = req.body;
    const result = await swarmIntelligence.assignTask(task, context);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/swarm/collaborate', async (req, res) => {
  try {
    const { problem, context } = req.body;
    const result = await swarmIntelligence.collaborateOnProblem(problem, context);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/swarm/tasks', (req, res) => {
  const history = swarmIntelligence.getTaskHistory(20);
  res.json({ success: true, data: history, active: swarmIntelligence.getActiveTasksCount() });
});

app.listen(port, () => {
  console.log(`🤖 AI Family Service running on port ${port}`);
  console.log('👨‍👩‍👧‍👦 11 AI Family Members ready');
  console.log('🐝 Swarm Intelligence active');
  console.log('🌍 Ubuntu: "I am because we are"');
  console.log(`🌐 Chat endpoint: http://localhost:${port}/api/chat`);
});
