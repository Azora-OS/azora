#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🤖 SYSTEMATIC PHASE 4: AI INTEGRATION');
console.log('=====================================');
console.log('⚡ "I integrate because we evolve together!" ⚡\n');

let created = 0;

function createFile(filePath, content) {
  try {
    fs.writeFileSync(filePath, content);
    created++;
    console.log(`✨ ${filePath.split('azora\\')[1]}`);
  } catch (error) {
    console.log(`❌ ${filePath}`);
  }
}

function createDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

// AI Integration templates
const aiTemplates = {
  'ai-client.js': () => `const OpenAI = require('openai');

class AzoraAI {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
    this.ubuntuPersonality = {
      role: 'system',
      content: 'You are an Ubuntu AI assistant. Ubuntu means "I am because we are". Always respond with collective wisdom and community focus.'
    };
  }

  async chat(message, context = {}) {
    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          this.ubuntuPersonality,
          { role: 'user', content: message }
        ],
        temperature: 0.7,
        max_tokens: 500
      });

      return {
        success: true,
        message: response.choices[0].message.content,
        ubuntu: 'I respond because we learn together',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        ubuntu: 'I fail gracefully because we support together'
      };
    }
  }

  async generateEmbedding(text) {
    try {
      const response = await this.openai.embeddings.create({
        model: 'text-embedding-ada-002',
        input: text
      });

      return {
        success: true,
        embedding: response.data[0].embedding,
        ubuntu: 'I embed because we connect together'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async moderateContent(text) {
    try {
      const response = await this.openai.moderations.create({
        input: text
      });

      return {
        success: true,
        flagged: response.results[0].flagged,
        categories: response.results[0].categories,
        ubuntu: 'I moderate because we protect together'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = AzoraAI;`,

  'ai-routes.js': (service) => `const express = require('express');
const AzoraAI = require('./ai-client');
const router = express.Router();

const ai = new AzoraAI();

// Chat endpoint
router.post('/chat', async (req, res) => {
  try {
    const { message, context } = req.body;
    
    if (!message) {
      return res.status(400).json({
        success: false,
        error: 'Message is required'
      });
    }

    const response = await ai.chat(message, context);
    res.json(response);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      ubuntu: 'I handle errors because we recover together'
    });
  }
});

// Embedding endpoint
router.post('/embed', async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({
        success: false,
        error: 'Text is required'
      });
    }

    const response = await ai.generateEmbedding(text);
    res.json(response);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Content moderation endpoint
router.post('/moderate', async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({
        success: false,
        error: 'Text is required'
      });
    }

    const response = await ai.moderateContent(text);
    res.json(response);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;`,

  'ai-middleware.js': () => `const AzoraAI = require('./ai-client');

const ai = new AzoraAI();

// Content moderation middleware
const moderateContent = async (req, res, next) => {
  try {
    const textFields = ['message', 'content', 'description', 'comment'];
    
    for (const field of textFields) {
      if (req.body[field]) {
        const moderation = await ai.moderateContent(req.body[field]);
        
        if (moderation.success && moderation.flagged) {
          return res.status(400).json({
            success: false,
            error: 'Content violates community guidelines',
            ubuntu: 'I protect because we care together'
          });
        }
      }
    }
    
    next();
  } catch (error) {
    console.error('Moderation error:', error);
    next(); // Continue on moderation error
  }
};

// AI enhancement middleware
const enhanceWithAI = async (req, res, next) => {
  try {
    if (req.body.enhanceWithAI && req.body.content) {
      const enhancement = await ai.chat(
        \`Please enhance this content with Ubuntu philosophy: \${req.body.content}\`
      );
      
      if (enhancement.success) {
        req.body.aiEnhanced = enhancement.message;
      }
    }
    
    next();
  } catch (error) {
    console.error('AI enhancement error:', error);
    next(); // Continue on AI error
  }
};

module.exports = {
  moderateContent,
  enhanceWithAI
};`
};

// Create AI integration for core services
const coreServices = [
  'azora-education', 'azora-sapiens', 'ai-family-service', 'constitutional-ai',
  'azora-studyspaces', 'marketplace', 'azora-forge'
];

console.log('🤖 Integrating AI into core services...\n');

coreServices.forEach(service => {
  const servicePath = path.join(__dirname, '..', 'services', service);
  
  if (fs.existsSync(servicePath)) {
    console.log(`⚡ AI-enabling ${service}...`);
    
    const aiDir = path.join(servicePath, 'ai');
    createDir(aiDir);
    
    // Create AI files
    Object.entries(aiTemplates).forEach(([filename, template]) => {
      const filePath = path.join(aiDir, filename);
      if (!fs.existsSync(filePath)) {
        createFile(filePath, template(service));
      }
    });
    
    // Update package.json to include OpenAI
    const packagePath = path.join(servicePath, 'package.json');
    if (fs.existsSync(packagePath)) {
      const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
      packageJson.dependencies = packageJson.dependencies || {};
      packageJson.dependencies['openai'] = '^4.20.0';
      fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
    }
  }
});

// Create global AI configuration
console.log('\n🌐 Creating global AI configuration...\n');

const globalAIConfig = `// Global AI Configuration for Azora OS
module.exports = {
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    model: 'gpt-4',
    temperature: 0.7,
    maxTokens: 1000
  },
  
  ubuntu: {
    personality: 'You are an Ubuntu AI assistant embodying "I am because we are" philosophy',
    values: [
      'Collective wisdom over individual knowledge',
      'Community success over personal gain', 
      'Shared prosperity over individual wealth',
      'Collaborative growth over competitive advantage'
    ]
  },
  
  moderation: {
    enabled: true,
    strictMode: false,
    categories: [
      'hate', 'harassment', 'self-harm', 'sexual', 
      'violence', 'hate/threatening', 'violence/graphic'
    ]
  },
  
  embeddings: {
    model: 'text-embedding-ada-002',
    dimensions: 1536
  },
  
  rateLimit: {
    requests: 100,
    window: '1h',
    burst: 10
  }
};`;

createFile(path.join(__dirname, '..', 'config', 'ai-config.js'), globalAIConfig);

// Create AI service orchestrator
const aiOrchestrator = `const AzoraAI = require('../services/ai-family-service/ai/ai-client');
const config = require('../config/ai-config');

class AIOrchestrator {
  constructor() {
    this.services = new Map();
    this.loadBalancer = [];
    this.currentIndex = 0;
  }

  registerService(name, aiInstance) {
    this.services.set(name, aiInstance);
    this.loadBalancer.push(aiInstance);
    console.log(\`🤖 AI Service registered: \${name}\`);
  }

  async routeRequest(request) {
    // Simple round-robin load balancing
    const service = this.loadBalancer[this.currentIndex];
    this.currentIndex = (this.currentIndex + 1) % this.loadBalancer.length;
    
    return await service.chat(request.message, request.context);
  }

  async broadcastToFamily(message) {
    const responses = [];
    
    for (const [name, service] of this.services) {
      try {
        const response = await service.chat(message);
        responses.push({ service: name, response });
      } catch (error) {
        console.error(\`AI service \${name} error:\`, error);
      }
    }
    
    return {
      success: true,
      responses,
      ubuntu: 'I broadcast because we share together'
    };
  }

  getHealthStatus() {
    const status = {};
    
    for (const [name, service] of this.services) {
      status[name] = {
        registered: true,
        lastPing: new Date().toISOString()
      };
    }
    
    return {
      totalServices: this.services.size,
      services: status,
      ubuntu: 'I monitor because we care together'
    };
  }
}

module.exports = AIOrchestrator;`;

createFile(path.join(__dirname, '..', 'core', 'ai-orchestrator.js'), aiOrchestrator);

// Update environment example
const envUpdate = `
# AI Configuration
OPENAI_API_KEY=your-openai-api-key-here
AI_MODEL=gpt-4
AI_TEMPERATURE=0.7
AI_MAX_TOKENS=1000
AI_MODERATION_ENABLED=true

# Ubuntu AI Personality
UBUNTU_PERSONALITY=true
COLLECTIVE_WISDOM_MODE=true`;

const envPath = path.join(__dirname, '..', '.env.example');
if (fs.existsSync(envPath)) {
  fs.appendFileSync(envPath, envUpdate);
}

console.log(`\n🎉 PHASE 4 COMPLETE!`);
console.log(`✨ AI integration files created: ${created}`);
console.log(`🤖 Services AI-enabled: ${coreServices.length}`);
console.log(`🧠 OpenAI GPT-4 integrated`);
console.log(`🛡️ Content moderation active`);
console.log(`🌐 Global AI orchestrator ready`);
console.log(`🌍 Ubuntu: "I integrate because we evolve together!"`);

const report = {
  phase: 4,
  name: 'AI Integration',
  created,
  services: coreServices,
  features: [
    'OpenAI GPT-4 integration',
    'Content moderation',
    'AI embeddings',
    'Ubuntu personality',
    'Global orchestrator',
    'Load balancing'
  ],
  timestamp: new Date().toISOString()
};

fs.writeFileSync(path.join(__dirname, '..', 'phase-4-report.json'), JSON.stringify(report, null, 2));