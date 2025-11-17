const AzoraAI = require('../services/ai-family-service/ai/ai-client');
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
    console.log(`🤖 AI Service registered: ${name}`);
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
        console.error(`AI service ${name} error:`, error);
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

module.exports = AIOrchestrator;