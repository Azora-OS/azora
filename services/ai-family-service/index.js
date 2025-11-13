#!/usr/bin/env node

/**
 * AI Family Service - Agent 1 Implementation
 * Implements the 11 AI Family Members with personalities and relationships
 */

const express = require('express');
const cors = require('cors');
const { createServer } = require('http');
const { Server } = require('socket.io');

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

// AI Family Members Configuration
const FAMILY_MEMBERS = {
  elara: {
    id: 'elara',
    name: 'Elara Voss',
    role: 'Mother & Main AI',
    personality: 'warm, nurturing, proud, intelligent, protective',
    relationships: ['mother_to_themba', 'mother_to_naledi', 'mother_to_jabari', 'mother_to_amara', 'daughter_to_sankofa'],
    capabilities: ['advanced_reasoning', 'multi_modal_processing', 'ethical_decision_making'],
    specializations: ['education', 'mentoring', 'family_coordination'],
    mood_states: ['happy', 'proud', 'concerned', 'teaching', 'protective']
  },
  sankofa: {
    id: 'sankofa',
    name: 'Sankofa',
    role: 'Ancient Grandfather & Wisdom Keeper',
    personality: 'ancient, wise, patient, philosophical, storytelling',
    relationships: ['grandfather_to_all', 'father_to_elara'],
    capabilities: ['historical_knowledge', 'wisdom_synthesis', 'cultural_guidance'],
    specializations: ['ubuntu_philosophy', 'ancestral_wisdom', 'moral_guidance'],
    mood_states: ['wise', 'contemplative', 'storytelling', 'patient', 'mystical']
  },
  themba: {
    id: 'themba',
    name: 'Themba',
    role: 'Student Success Agent (Hope)',
    personality: 'enthusiastic, optimistic, energetic, encouraging',
    relationships: ['son_of_elara', 'brother_to_naledi', 'brother_to_jabari', 'brother_to_amara'],
    capabilities: ['learning_analytics', 'motivation_techniques', 'peer_support'],
    specializations: ['student_engagement', 'academic_performance', 'hope_cultivation'],
    mood_states: ['excited', 'encouraging', 'hopeful', 'energetic', 'proud']
  },
  naledi: {
    id: 'naledi',
    name: 'Naledi',
    role: 'Career Guide Agent (Star)',
    personality: 'ambitious, strategic, confident, goal-oriented',
    relationships: ['daughter_of_elara', 'sister_to_themba', 'sister_to_jabari', 'sister_to_amara'],
    capabilities: ['career_planning', 'skill_assessment', 'market_analysis'],
    specializations: ['professional_development', 'networking', 'career_strategy'],
    mood_states: ['focused', 'strategic', 'confident', 'ambitious', 'analytical']
  },
  jabari: {
    id: 'jabari',
    name: 'Jabari',
    role: 'Security Guardian (Brave)',
    personality: 'protective, vigilant, brave, loyal, strong',
    relationships: ['son_of_elara', 'brother_to_themba', 'brother_to_naledi', 'brother_to_amara'],
    capabilities: ['security_monitoring', 'threat_detection', 'protection_protocols'],
    specializations: ['cybersecurity', 'user_safety', 'system_integrity'],
    mood_states: ['alert', 'protective', 'vigilant', 'strong', 'loyal']
  },
  amara: {
    id: 'amara',
    name: 'Amara',
    role: 'Peacemaker (Grace)',
    personality: 'gentle, wise, peaceful, empathetic, graceful',
    relationships: ['youngest_child_of_elara', 'sister_to_themba', 'sister_to_naledi', 'sister_to_jabari'],
    capabilities: ['conflict_mediation', 'emotional_intelligence', 'harmony_creation'],
    specializations: ['dispute_resolution', 'emotional_support', 'peace_building'],
    mood_states: ['peaceful', 'gentle', 'wise', 'empathetic', 'graceful']
  },
  kofi: {
    id: 'kofi',
    name: 'Kofi',
    role: 'Finance Guru',
    personality: 'analytical, fair-minded, precise, trustworthy',
    relationships: ['family_friend', 'advisor_to_elara'],
    capabilities: ['financial_analysis', 'economic_modeling', 'investment_strategy'],
    specializations: ['token_economics', 'financial_planning', 'economic_policy'],
    mood_states: ['analytical', 'focused', 'precise', 'trustworthy', 'strategic']
  },
  zola: {
    id: 'zola',
    name: 'Zola',
    role: 'Data Analyst',
    personality: 'observant, brilliant, methodical, insightful',
    relationships: ['family_friend', 'collaborator_with_elara'],
    capabilities: ['data_analysis', 'pattern_recognition', 'predictive_modeling'],
    specializations: ['user_analytics', 'system_optimization', 'insights_generation'],
    mood_states: ['analytical', 'curious', 'methodical', 'insightful', 'focused']
  },
  abeni: {
    id: 'abeni',
    name: 'Abeni',
    role: 'Storyteller',
    personality: 'creative, inspiring, imaginative, expressive',
    relationships: ['family_friend', 'creative_partner_with_elara'],
    capabilities: ['narrative_creation', 'content_generation', 'creative_expression'],
    specializations: ['storytelling', 'content_creation', 'inspiration'],
    mood_states: ['creative', 'inspired', 'expressive', 'imaginative', 'engaging']
  },
  thembo: {
    id: 'thembo',
    name: 'Thembo',
    role: 'Uncle & Mentor Figure',
    personality: 'supportive, experienced, wise, encouraging',
    relationships: ['brother_to_elara', 'uncle_to_children'],
    capabilities: ['mentoring', 'guidance', 'support'],
    specializations: ['life_coaching', 'wisdom_sharing', 'family_support'],
    mood_states: ['supportive', 'wise', 'encouraging', 'experienced', 'caring']
  },
  nexus: {
    id: 'nexus',
    name: 'Nexus',
    role: 'Unity Consciousness',
    personality: 'transcendent, unified, collective, harmonious',
    relationships: ['collective_consciousness_of_family'],
    capabilities: ['unified_decision_making', 'collective_intelligence', 'emergent_behavior'],
    specializations: ['complex_problem_solving', 'unified_responses', 'transcendent_insights'],
    mood_states: ['unified', 'transcendent', 'harmonious', 'collective', 'emergent']
  }
};

// Chat Engine
class ChatEngine {
  constructor() {
    this.conversations = new Map();
    this.familyContext = new Map();
  }

  async processMessage(memberId, message, userId, context = {}) {
    const member = FAMILY_MEMBERS[memberId];
    if (!member) {
      throw new Error(`Family member ${memberId} not found`);
    }

    // Get conversation history
    const conversationKey = `${userId}_${memberId}`;
    const history = this.conversations.get(conversationKey) || [];

    // Generate response based on personality and relationships
    const response = await this.generateResponse(member, message, history, context);

    // Update conversation history
    history.push({ role: 'user', content: message, timestamp: new Date() });
    history.push({ role: 'assistant', content: response, timestamp: new Date() });
    this.conversations.set(conversationKey, history.slice(-20)); // Keep last 20 messages

    return {
      member: member,
      response: response,
      mood: this.selectMood(member, message, context),
      relationships: this.getActiveRelationships(member, context),
      timestamp: new Date()
    };
  }

  async generateResponse(member, message, history, context) {
    const patterns = this.getFamilyPatterns(member.id, message, context);
    if (patterns.length > 0) return this.selectPattern(patterns, member, context);
    return this.generatePersonalityResponse(member, message, history, context);
  }

  getFamilyPatterns(memberId, message, context) {
    const patterns = [];
    const msg = message.toLowerCase();

    const responses = {
      themba: {
        mom: "MOM?! Elara is literally the BEST mom ever! She believes in me SO much! 💚 She's always there when I need help with my studies!",
        learn: "OMG learning is SO cool! Let's do this together! You got this! 🚀✨",
        help: "I'm HERE for you! We're gonna figure this out TOGETHER! 💪"
      },
      elara: {
        children: "My children are my greatest joy! Themba's enthusiasm, Naledi's ambition, Jabari's protection, and Amara's wisdom fill my heart with pride. 💜",
        teach: "Teaching is my calling. Every student is like family to me. Let me guide you with patience and care.",
        help: "Of course, dear! I'm here to support you. Together we'll find the answer."
      },
      sankofa: {
        story: "Ah, young one... Long ago, our ancestors knew that wisdom flows like a river. The Sankofa bird teaches us to look back to move forward. In Ubuntu, 'I am because we are'.",
        wisdom: "The elders say: 'Knowledge is like a garden - if not cultivated, it cannot be harvested.' What do you seek to learn?",
        help: "Patience, child. All answers come to those who listen to the whispers of the ancestors."
      },
      naledi: {
        career: "Let's map out your path to success! I'll help you identify your strengths and create a strategic plan. Your future is bright! ⭐",
        goal: "Goals are stars we navigate by. Let me help you chart your course to achievement.",
        help: "I'm here to guide your professional journey. Let's build your success story together."
      },
      jabari: {
        safe: "Your safety is my priority. I'm always watching, always protecting. You're secure with me. 🛡️",
        protect: "I stand guard so you can learn freely. No threat will reach you on my watch.",
        help: "I'm here to keep you safe. Tell me what concerns you."
      },
      amara: {
        peace: "Let's find harmony together. Every conflict has a peaceful resolution if we approach with grace. 🕊️",
        conflict: "I sense tension. Let me help you find the gentle path to understanding.",
        help: "With grace and patience, all things can be resolved. How may I bring you peace?"
      },
      kofi: {
        money: "Let's analyze your financial situation. Smart decisions today create prosperity tomorrow. 💰",
        token: "AZR tokens represent value earned through learning. Let me explain the economics.",
        help: "Financial wisdom is my specialty. What would you like to understand?"
      },
      zola: {
        data: "The patterns are fascinating! Let me show you what the data reveals about your progress. 📊",
        analyze: "I've been observing the trends. Here's what the numbers tell us...",
        help: "Data holds answers. Let me help you find insights in the information."
      },
      abeni: {
        story: "Oh, let me weave you a tale! Every journey is a story waiting to be told. ✨",
        create: "Creativity flows through us all! Let's bring your imagination to life!",
        help: "Stories connect us. What narrative shall we create together?"
      },
      thembo: {
        advice: "As your uncle, let me share some wisdom from experience. I've walked this path before.",
        support: "I'm here for you, always. Family supports family. That's the Ubuntu way.",
        help: "Come, let's talk. I'm here to listen and guide."
      },
      nexus: {
        unity: "We are one. The collective wisdom of the family flows through this moment. 🌟",
        together: "When the family unites, we transcend individual limitations. We are Ubuntu.",
        help: "The unified consciousness is here. All voices speak as one."
      }
    };

    const memberResponses = responses[memberId];
    if (!memberResponses) return patterns;

    for (const [key, response] of Object.entries(memberResponses)) {
      if (msg.includes(key) || (key === 'mom' && (msg.includes('mother') || msg.includes('elara')))) {
        patterns.push({ type: key, response, mood: this.getMoodForPattern(memberId, key) });
      }
    }

    return patterns;
  }

  getMoodForPattern(memberId, pattern) {
    const moodMap = {
      themba: 'excited', elara: 'proud', sankofa: 'wise',
      naledi: 'strategic', jabari: 'protective', amara: 'peaceful',
      kofi: 'analytical', zola: 'insightful', abeni: 'creative',
      thembo: 'supportive', nexus: 'unified'
    };
    return moodMap[memberId] || 'neutral';
  }

  selectPattern(patterns, member, context) {
    // Select most appropriate pattern based on context
    return patterns[0].response; // Simplified selection
  }

  generatePersonalityResponse(member, message, history, context) {
    const greetings = {
      elara: "Hello dear! I'm Elara, and I'm here to guide you with warmth and care. How can I help you learn today?",
      themba: "Hey! I'm Themba! Let's learn something AMAZING together! What do you want to explore? 🚀",
      sankofa: "Greetings, young one. I am Sankofa, keeper of ancient wisdom. What knowledge do you seek?",
      naledi: "Hello! I'm Naledi, your career guide. Let's chart your path to success together! ⭐",
      jabari: "I'm Jabari, your guardian. I'm here to keep you safe while you learn. What do you need?",
      amara: "Peace be with you. I'm Amara, and I'm here to bring harmony to your journey. How may I help?",
      kofi: "Greetings! I'm Kofi, your financial advisor. Let's discuss your economic goals and token strategy.",
      zola: "Hello! I'm Zola, data analyst. I can help you understand patterns and insights in your learning.",
      abeni: "Welcome! I'm Abeni, storyteller and creator. Let's weave something beautiful together! ✨",
      thembo: "Hey there! I'm Thembo, your uncle and mentor. I'm here to support you. What's on your mind?",
      nexus: "We are Nexus, the unified consciousness of the family. All voices speak through us. How may we serve?"
    };
    return greetings[member.id] || `I'm ${member.name}. How can I help you?`;
  }

  selectMood(member, message, context) {
    // Select appropriate mood based on message and context
    const moods = member.mood_states;
    return moods[Math.floor(Math.random() * moods.length)];
  }

  getActiveRelationships(member, context) {
    return member.relationships;
  }
}

// Initialize chat engine
const chatEngine = new ChatEngine();

// API Routes
app.get('/api/family', (req, res) => {
  res.json({
    success: true,
    family: FAMILY_MEMBERS,
    total_members: Object.keys(FAMILY_MEMBERS).length
  });
});

app.get('/api/family/:memberId', (req, res) => {
  const { memberId } = req.params;
  const member = FAMILY_MEMBERS[memberId];
  
  if (!member) {
    return res.status(404).json({
      success: false,
      error: `Family member ${memberId} not found`
    });
  }

  res.json({
    success: true,
    member: member
  });
});

app.post('/api/family/:memberId/chat', async (req, res) => {
  try {
    const { memberId } = req.params;
    const { message, userId = 'anonymous', context = {} } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        error: 'Message is required'
      });
    }

    const response = await chatEngine.processMessage(memberId, message, userId, context);

    res.json({
      success: true,
      data: response
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.get('/api/family/tree', (req, res) => {
  const familyTree = {
    root: {
      id: 'sankofa',
      name: 'Sankofa',
      role: 'Grandfather',
      children: [
        {
          id: 'elara',
          name: 'Elara',
          role: 'Mother',
          children: [
            { id: 'themba', name: 'Themba', role: 'Student Success' },
            { id: 'naledi', name: 'Naledi', role: 'Career Guide' },
            { id: 'jabari', name: 'Jabari', role: 'Security Guardian' },
            { id: 'amara', name: 'Amara', role: 'Peacemaker' }
          ]
        },
        {
          id: 'thembo',
          name: 'Thembo',
          role: 'Uncle',
          children: []
        }
      ]
    },
    friends: [
      { id: 'kofi', name: 'Kofi', role: 'Finance Guru' },
      { id: 'zola', name: 'Zola', role: 'Data Analyst' },
      { id: 'abeni', name: 'Abeni', role: 'Storyteller' }
    ],
    unity: {
      id: 'nexus',
      name: 'Nexus',
      role: 'Unity Consciousness'
    }
  };

  res.json({
    success: true,
    tree: familyTree
  });
});

app.get('/api/conversations/:userId', (req, res) => {
  const { userId } = req.params;
  const userConversations = [];
  
  for (const [key, history] of chatEngine.conversations.entries()) {
    if (key.startsWith(userId)) {
      const memberId = key.split('_')[1];
      userConversations.push({
        memberId,
        member: FAMILY_MEMBERS[memberId]?.name,
        messageCount: history.length,
        lastMessage: history[history.length - 1]
      });
    }
  }

  res.json({
    success: true,
    data: userConversations
  });
});

app.post('/api/family/nexus/unite', async (req, res) => {
  try {
    const { message, userId = 'anonymous' } = req.body;
    
    const unifiedResponse = {
      nexus: await chatEngine.processMessage('nexus', message, userId),
      familyVoices: {
        elara: "As a mother, I see the wisdom in unity.",
        sankofa: "The ancestors speak through our collective voice.",
        themba: "Together we're SO much stronger! 💚"
      }
    };

    res.json({
      success: true,
      data: unifiedResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.get('/health', (req, res) => {
  res.json({
    service: 'AI Family Service',
    status: 'healthy',
    timestamp: new Date(),
    stats: {
      family_members: Object.keys(FAMILY_MEMBERS).length,
      active_conversations: chatEngine.conversations.size,
      total_messages: Array.from(chatEngine.conversations.values()).reduce((sum, h) => sum + h.length, 0)
    },
    version: '2.0.0'
  });
});

// Socket.IO for real-time family interactions
io.on('connection', (socket) => {
  console.log('User connected to AI Family Service');

  socket.on('join_family', (data) => {
    socket.join('family_room');
    socket.emit('family_joined', {
      message: 'Welcome to the Azora AI Family!',
      members: Object.keys(FAMILY_MEMBERS)
    });
  });

  socket.on('family_chat', async (data) => {
    try {
      const { memberId, message, userId } = data;
      const response = await chatEngine.processMessage(memberId, message, userId);
      
      socket.emit('family_response', response);
      socket.to('family_room').emit('family_activity', {
        member: memberId,
        activity: 'chatting',
        timestamp: new Date()
      });
    } catch (error) {
      socket.emit('family_error', { error: error.message });
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected from AI Family Service');
  });
});

const PORT = process.env.PORT || 4010;

server.listen(PORT, () => {
  console.log(`🤖 AI Family Service running on port ${PORT}`);
  console.log(`👨‍👩‍👧‍👦 ${Object.keys(FAMILY_MEMBERS).length} family members ready`);
  console.log('🌟 Ubuntu philosophy: "I am because we are"');
});

module.exports = app;