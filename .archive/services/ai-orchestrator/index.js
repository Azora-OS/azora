const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');

const app = express();
const PORT = process.env.PORT || 4020;

app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'sk-test-mock'
});

// AI Family personalities
const personalities = {
  elara: { role: 'teacher', tone: 'warm, nurturing', emoji: '🤖' },
  themba: { role: 'student', tone: 'enthusiastic, hopeful', emoji: '🧒' },
  naledi: { role: 'career guide', tone: 'ambitious, strategic', emoji: '👧' },
  sankofa: { role: 'grandfather', tone: 'wise, storytelling', emoji: '👴' }
};

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'ai-orchestrator' });
});

// Chat with AI family member
app.post('/api/chat', async (req, res) => {
  try {
    const { character = 'elara', message, context } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'message required' });
    }
    
    const personality = personalities[character] || personalities.elara;
    
    const systemPrompt = `You are ${character}, a ${personality.role} in the Azora AI family. 
Your tone is ${personality.tone}. Keep responses concise (2-3 sentences).
Ubuntu philosophy: "I am because we are" - emphasize collective growth.`;
    
    const messages = [
      { role: 'system', content: systemPrompt },
      ...(context || []),
      { role: 'user', content: message }
    ];
    
    // Mock response if no API key
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'sk-test-mock') {
      return res.json({
        success: true,
        data: {
          character,
          message: `${personality.emoji} [Mock] As ${character}, I'd say: ${message.split('').reverse().join('')}`,
          personality: personality.role
        }
      });
    }
    
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages,
      max_tokens: 150,
      temperature: 0.8
    });
    
    res.json({
      success: true,
      data: {
        character,
        message: completion.choices[0].message.content,
        personality: personality.role
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// AI tutoring
app.post('/api/tutor', async (req, res) => {
  try {
    const { subject, question, studentLevel = 'beginner' } = req.body;
    
    if (!question) {
      return res.status(400).json({ error: 'question required' });
    }
    
    const systemPrompt = `You are Elara, an AI tutor specializing in ${subject || 'general education'}.
Student level: ${studentLevel}. Explain concepts clearly with examples.
Use the Socratic method - ask guiding questions. Keep responses under 200 words.`;
    
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'sk-test-mock') {
      return res.json({
        success: true,
        data: {
          answer: `🤖 [Mock Tutor] Great question about "${question}"! Let me help you understand this concept step by step...`,
          followUp: ['What do you already know about this?', 'Can you give me an example?']
        }
      });
    }
    
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: question }
      ],
      max_tokens: 300
    });
    
    res.json({
      success: true,
      data: {
        answer: completion.choices[0].message.content,
        subject,
        studentLevel
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Generate learning path
app.post('/api/learning-path', async (req, res) => {
  try {
    const { goal, currentLevel, timeframe } = req.body;
    
    if (!goal) {
      return res.status(400).json({ error: 'goal required' });
    }
    
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'sk-test-mock') {
      return res.json({
        success: true,
        data: {
          path: [
            { week: 1, topic: 'Fundamentals', hours: 5 },
            { week: 2, topic: 'Intermediate Concepts', hours: 6 },
            { week: 3, topic: 'Advanced Topics', hours: 7 },
            { week: 4, topic: 'Project Work', hours: 8 }
          ],
          goal
        }
      });
    }
    
    const prompt = `Create a learning path for: "${goal}"
Current level: ${currentLevel || 'beginner'}
Timeframe: ${timeframe || '4 weeks'}
Format as JSON array with: week, topic, hours`;
    
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 500
    });
    
    res.json({
      success: true,
      data: {
        path: completion.choices[0].message.content,
        goal
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🤖 AI Orchestrator running on port ${PORT}`);
  console.log(`OpenAI: ${process.env.OPENAI_API_KEY ? 'Connected' : 'Mock mode'}`);
});

module.exports = app;
