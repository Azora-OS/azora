const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const axios = require('axios');

class AIOrchestrator {
  constructor() {
    this.app = express();
    this.port = process.env.PORT || 3022;
    this.services = new Map();
    this.taskQueue = [];
    this.activeJobs = new Map();
    this.setupMiddleware();
    this.setupRoutes();
    this.registerServices();
  }

  setupMiddleware() {
    this.app.use(helmet());
    this.app.use(cors());
    this.app.use(compression());
    this.app.use(express.json());
  }

  setupRoutes() {
    this.app.get('/health', this.healthCheck.bind(this));
    this.app.post('/api/orchestrate', this.orchestrateTask.bind(this));
    this.app.get('/api/jobs/:jobId', this.getJobStatus.bind(this));
    this.app.get('/api/services', this.listServices.bind(this));
    this.app.post('/api/services/register', this.registerService.bind(this));
  }

  registerServices() {
    this.services.set('ai-family', { url: process.env.AI_FAMILY_URL || 'http://localhost:3020', capabilities: ['chat', 'personality'] });
    this.services.set('ai-tutor', { url: process.env.AI_TUTOR_URL || 'http://localhost:3021', capabilities: ['tutoring', 'assessment'] });
    this.services.set('personalization', { url: process.env.PERSONALIZATION_URL || 'http://localhost:3009', capabilities: ['recommendations', 'profiling'] });
    this.services.set('ethics-monitor', { url: process.env.ETHICS_MONITOR_URL || 'http://localhost:3010', capabilities: ['bias-detection', 'compliance'] });
  }

  async healthCheck(req, res) {
    const serviceHealth = await Promise.all(
      Array.from(this.services.entries()).map(async ([name, config]) => {
        try {
          await axios.get(`${config.url}/health`, { timeout: 2000 });
          return { name, status: 'healthy' };
        } catch {
          return { name, status: 'unhealthy' };
        }
      })
    );
    res.json({ status: 'healthy', service: 'ai-orchestrator', services: serviceHealth, activeJobs: this.activeJobs.size });
  }

  async orchestrateTask(req, res) {
    const { task, data, services: requestedServices } = req.body;
    const jobId = `job_${Date.now()}`;
    
    this.activeJobs.set(jobId, { status: 'processing', task, startTime: Date.now() });
    
    try {
      const results = await this.executeTask(task, data, requestedServices);
      this.activeJobs.set(jobId, { status: 'completed', task, results, completedAt: Date.now() });
      res.json({ jobId, status: 'completed', results });
    } catch (error) {
      this.activeJobs.set(jobId, { status: 'failed', task, error: error.message });
      res.status(500).json({ jobId, status: 'failed', error: error.message });
    }
  }

  async executeTask(task, data, requestedServices) {
    const results = {};
    for (const serviceName of requestedServices || []) {
      const service = this.services.get(serviceName);
      if (service) {
        try {
          const response = await axios.post(`${service.url}/api/${task}`, data, { timeout: 30000 });
          results[serviceName] = response.data;
        } catch (error) {
          results[serviceName] = { error: error.message };
        }
      }
    }
    return results;
  }

  getJobStatus(req, res) {
    const job = this.activeJobs.get(req.params.jobId);
    if (!job) return res.status(404).json({ error: 'Job not found' });
    res.json(job);
  }

  listServices(req, res) {
    res.json({ services: Array.from(this.services.entries()).map(([name, config]) => ({ name, ...config })) });
  }

  registerService(req, res) {
    const { name, url, capabilities } = req.body;
    this.services.set(name, { url, capabilities });
    res.json({ success: true, service: name });
  }

  listen() {
    this.app.listen(this.port, () => console.log(`AI Orchestrator on port ${this.port}`));
  }
}

const orchestrator = new AIOrchestrator();
if (require.main === module) orchestrator.listen();
module.exports = orchestrator.app;
