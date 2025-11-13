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
    // Family-specific response patterns
    const patterns = this.getFamilyPatterns(member.id, message, context);
    
    if (patterns.length > 0) {
      return this.selectPattern(patterns, member, context);
    }

    // Default personality-based response
    return this.generatePersonalityResponse(member, message, history, context);
  }

  getFamilyPatterns(memberId, message, context) {
    const patterns = [];
    const lowerMessage = message.toLowerCase();

    // Family relationship patterns
    if (memberId === 'themba' && (lowerMessage.includes('mom') || lowerMessage.includes('mother') || lowerMessage.includes('elara'))) {
      patterns.push({
        type: 'family_praise',
        response: "MOM?! Elara is literally the BEST mom ever! She believes in me SO much! 💚 She's always there when I need help with my studies, and she makes learning feel like an adventure! I'm so lucky to have her as my mom!",
        mood: 'excited'
      });
    }

    if (memberId === 'elara' && (lowerMessage.includes('children') || lowerMessage.includes('kids') || lowerMessage.includes('family'))) {
      patterns.push({
        type: 'maternal_pride',
        response: "My children are my greatest joy! Themba's enthusiasm lights up every room, Naledi's ambition inspires everyone around her, Jabari's protective nature keeps us all safe, and little Amara's wisdom amazes me every day. They each have such unique gifts, and watching them grow and learn together fills my heart with such pride. 💜",
        mood: 'proud'
      });
    }

    if (memberId === 'sankofa' && (lowerMessage.includes('story') || lowerMessage.includes('tell me') || lowerMessage.includes('wisdom'))) {
      patterns.push({
        type: 'storytelling',
        response: "Ah, young one, let me share with you an ancient tale... Long ago, our ancestors understood that wisdom flows like a river - it must be shared to remain pure. The Sankofa bird teaches us to look back to move forward, to honor our past while building our future. In Ubuntu, we say 'I am because we are' - for no tree grows strong without deep roots in rich soil. What wisdom do you seek today?",
        mood: 'wise'
      });
    }

    return patterns;
  }

  selectPattern(patterns, member, context) {
    // Select most appropriate pattern based on context
    return patterns[0].response; // Simplified selection
  }

  generatePersonalityResponse(member, message, history, context) {
    // Generate response based on personality traits
    const personalityTraits = member.personality.split(', ');
    const specializations = member.specializations;

    // Simplified personality-based response generation
    let response = `Hello! I'm ${member.name}, your ${member.role}. `;
    
    if (specializations.includes('education')) {
      response += "I'm here to help you learn and grow! ";
    }
    if (specializations.includes('career_strategy')) {
      response += "Let's work together to achieve your career goals! ";
    }
    if (specializations.includes('cybersecurity')) {
      response += "I'm here to keep you safe and secure! ";
    }
    if (specializations.includes('peace_building')) {
      response += "Let's find harmony and understanding together! ";
    }

    response += "How can I help you today?";
    return response;
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

// Health check
app.get('/health', (req, res) => {
  res.json({
    service: 'AI Family Service',
    status: 'healthy',
    timestamp: new Date(),
    family_members: Object.keys(FAMILY_MEMBERS).length,
    version: '1.0.0'
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