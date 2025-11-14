const eventBus = require('./engines/event-bus');
const axios = require('axios');

class ServiceConnector {
  constructor() {
    this.services = new Map();
    this.setupEventHandlers();
  }

  registerService(name, url, health = '/health') {
    this.services.set(name, { name, url, health, status: 'unknown', lastCheck: null });
    console.log(`✅ Registered service: ${name} at ${url}`);
  }

  async checkHealth(serviceName) {
    const service = this.services.get(serviceName);
    if (!service) return { status: 'not_registered' };

    try {
      const response = await axios.get(`${service.url}${service.health}`, { timeout: 3000 });
      service.status = 'healthy';
      service.lastCheck = new Date();
      return { status: 'healthy', data: response.data };
    } catch (error) {
      service.status = 'unhealthy';
      service.lastCheck = new Date();
      return { status: 'unhealthy', error: error.message };
    }
  }

  async publishEvent(eventType, data, source) {
    return await eventBus.publish(eventType, { ...data, source, timestamp: new Date() });
  }

  setupEventHandlers() {
    // Student enrollment triggers wallet creation
    eventBus.subscribe('student.enrolled', async (event) => {
      const { studentId, courseId, userId } = event.data;
      console.log(`📚 Student enrolled: ${studentId} in course ${courseId}`);
      
      try {
        const mintService = this.services.get('azora-mint');
        if (mintService && mintService.status === 'healthy') {
          await axios.post(`${mintService.url}/api/wallet/create`, { userId });
          console.log(`💰 Wallet created for student ${studentId}`);
        }
      } catch (error) {
        console.error('Failed to create wallet:', error.message);
      }
    });

    // Course completion triggers mining reward
    eventBus.subscribe('course.completed', async (event) => {
      const { studentId, courseId, score } = event.data;
      console.log(`🎓 Course completed: ${studentId} scored ${score}%`);
      
      try {
        const mintService = this.services.get('azora-mint');
        if (mintService && mintService.status === 'healthy') {
          const reward = Math.floor(score * 10); // 10 AZR per percentage point
          await axios.post(`${mintService.url}/api/mining/submit`, {
            challenge: { id: courseId },
            answers: { score },
            address: `student_${studentId}`,
            studentLevel: 1
          });
          console.log(`⛏️ Mining reward issued: ${reward} AZR`);
        }
      } catch (error) {
        console.error('Failed to issue mining reward:', error.message);
      }
    });

    // Skills assessment triggers job matching
    eventBus.subscribe('skills.assessed', async (event) => {
      const { userId, skills, assessment } = event.data;
      console.log(`📊 Skills assessed for user ${userId}: ${assessment.overall}%`);
      
      try {
        const forgeService = this.services.get('azora-forge');
        if (forgeService && forgeService.status === 'healthy') {
          const response = await axios.post(`${forgeService.url}/api/match`, { userId, maxResults: 5 });
          console.log(`🔨 Found ${response.data.total} job matches`);
          
          await this.publishEvent('jobs.matched', {
            userId,
            matches: response.data.matches,
            count: response.data.total
          }, 'azora-forge');
        }
      } catch (error) {
        console.error('Failed to match jobs:', error.message);
      }
    });

    // Job application triggers notification
    eventBus.subscribe('job.applied', async (event) => {
      const { userId, jobId, applicationId } = event.data;
      console.log(`💼 Job application: ${userId} applied to ${jobId}`);
      
      await this.publishEvent('notification.send', {
        userId,
        type: 'job_application',
        message: `Your application ${applicationId} has been submitted successfully!`
      }, 'azora-nexus');
    });
  }

  getServiceStatus() {
    const status = {};
    for (const [name, service] of this.services.entries()) {
      status[name] = {
        url: service.url,
        status: service.status,
        lastCheck: service.lastCheck
      };
    }
    return status;
  }

  async healthCheckAll() {
    const results = {};
    for (const [name] of this.services.entries()) {
      results[name] = await this.checkHealth(name);
    }
    return results;
  }
}

const connector = new ServiceConnector();

// Register core services
connector.registerService('azora-education', process.env.EDUCATION_URL || 'http://localhost:3074');
connector.registerService('azora-mint', process.env.MINT_URL || 'http://localhost:3080');
connector.registerService('azora-forge', process.env.FORGE_URL || 'http://localhost:3200');
connector.registerService('ai-family', process.env.AI_FAMILY_URL || 'http://localhost:4010');

module.exports = connector;
