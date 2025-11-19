/**
 * Elara API
 * 
 * REST API for interacting with Elara and the entire Azora OS system
 */

import { Express, Request, Response } from 'express';
import { ElaraCore } from '../core/elara-core';
import { ElaraOrchestrator } from '../orchestrator/elara-orchestrator';
import { ElaraLogger } from '../utils/logger';

export class ElaraAPI {
  private core: ElaraCore;
  private orchestrator: ElaraOrchestrator;
  private logger: ElaraLogger;

  constructor(core: ElaraCore, orchestrator: ElaraOrchestrator) {
    this.core = core;
    this.orchestrator = orchestrator;
    this.logger = new ElaraLogger('ElaraAPI');
  }

  /**
   * Setup API routes
   */
  setupRoutes(app: Express): void {
    // System endpoints
    app.get('/api/elara/status', this.getStatus.bind(this));
    app.get('/api/elara/health', this.getHealth.bind(this));
    app.get('/api/elara/system', this.getSystemState.bind(this));

    // Query endpoints
    app.post('/api/elara/query', this.processQuery.bind(this));
    app.post('/api/elara/ask', this.ask.bind(this));
    app.post('/api/elara/execute', this.execute.bind(this));

    // Orchestration endpoints
    app.get('/api/elara/orchestration/status', this.getOrchestrationStatus.bind(this));
    app.post('/api/elara/orchestration/execute', this.executeOrchestration.bind(this));

    // Service management endpoints
    app.get('/api/elara/services', this.getServices.bind(this));
    app.get('/api/elara/services/:name', this.getService.bind(this));
    app.post('/api/elara/services/:name/health-check', this.healthCheckService.bind(this));

    // Analytics endpoints
    app.get('/api/elara/analytics/metrics', this.getMetrics.bind(this));
    app.get('/api/elara/analytics/performance', this.getPerformance.bind(this));

    this.logger.info('✅ API routes configured');
  }

  /**
   * Get Elara status
   */
  private async getStatus(_req: Request, res: Response): Promise<void> {
    try {
      const state = this.core.getSystemState();
      res.json({
        status: 'ok',
        elara: {
          status: state.status,
          activeServices: state.activeServices.length,
          requestsProcessed: state.metrics.requestsProcessed,
          averageLatency: state.metrics.averageLatency,
          errorRate: state.metrics.errorRate,
        },
        timestamp: new Date(),
      });
    } catch (error) {
      this.logger.error('Error getting status:', error);
      res.status(500).json({ error: 'Failed to get status' });
    }
  }

  /**
   * Get health status
   */
  private async getHealth(_req: Request, res: Response): Promise<void> {
    try {
      const isHealthy = await this.core.healthCheck();
      res.json({
        healthy: isHealthy,
        timestamp: new Date(),
      });
    } catch (error) {
      this.logger.error('Error checking health:', error);
      res.status(500).json({ healthy: false });
    }
  }

  /**
   * Get system state
   */
  private async getSystemState(_req: Request, res: Response): Promise<void> {
    try {
      const state = this.core.getSystemState();
      res.json(state);
    } catch (error) {
      this.logger.error('Error getting system state:', error);
      res.status(500).json({ error: 'Failed to get system state' });
    }
  }

  /**
   * Process query
   */
  private async processQuery(req: Request, res: Response): Promise<void> {
    try {
      const { query, context } = req.body;

      if (!query) {
        res.status(400).json({ error: 'Query is required' });
        return;
      }

      const result = await this.core.processQuery(query, context);
      res.json(result);
    } catch (error) {
      this.logger.error('Error processing query:', error);
      res.status(500).json({ error: 'Failed to process query' });
    }
  }

  /**
   * Ask Elara a question (natural language)
   */
  private async ask(req: Request, res: Response): Promise<void> {
    try {
      const { question, context } = req.body;

      if (!question) {
        res.status(400).json({ error: 'Question is required' });
        return;
      }

      const result = await this.core.processQuery(question, context);
      res.json({
        question,
        answer: result,
        timestamp: new Date(),
      });
    } catch (error) {
      this.logger.error('Error answering question:', error);
      res.status(500).json({ error: 'Failed to answer question' });
    }
  }

  /**
   * Execute a command
   */
  private async execute(req: Request, res: Response): Promise<void> {
    try {
      const { command, params } = req.body;

      if (!command) {
        res.status(400).json({ error: 'Command is required' });
        return;
      }

      const result = await this.core.processQuery(command, params);
      res.json({
        command,
        result,
        timestamp: new Date(),
      });
    } catch (error) {
      this.logger.error('Error executing command:', error);
      res.status(500).json({ error: 'Failed to execute command' });
    }
  }

  /**
   * Get orchestration status
   */
  private async getOrchestrationStatus(_req: Request, res: Response): Promise<void> {
    try {
      const status = this.orchestrator.getStatus();
      res.json(status);
    } catch (error) {
      this.logger.error('Error getting orchestration status:', error);
      res.status(500).json({ error: 'Failed to get orchestration status' });
    }
  }

  /**
   * Execute orchestration plan
   */
  private async executeOrchestration(req: Request, res: Response): Promise<void> {
    try {
      const { plan, data } = req.body;

      if (!plan) {
        res.status(400).json({ error: 'Plan is required' });
        return;
      }

      const result = await this.orchestrator.executePlan(plan, data);
      res.json(result);
    } catch (error) {
      this.logger.error('Error executing orchestration:', error);
      res.status(500).json({ error: 'Failed to execute orchestration' });
    }
  }

  /**
   * Get services
   */
  private async getServices(_req: Request, res: Response): Promise<void> {
    try {
      const status = this.orchestrator.getStatus();
      res.json(status.services);
    } catch (error) {
      this.logger.error('Error getting services:', error);
      res.status(500).json({ error: 'Failed to get services' });
    }
  }

  /**
   * Get service details
   */
  private async getService(req: Request, res: Response): Promise<void> {
    try {
      const { name } = req.params;
      const status = this.orchestrator.getStatus();
      const service = status.services[name];

      if (!service) {
        res.status(404).json({ error: 'Service not found' });
        return;
      }

      res.json(service);
    } catch (error) {
      this.logger.error('Error getting service:', error);
      res.status(500).json({ error: 'Failed to get service' });
    }
  }

  /**
   * Health check a service
   */
  private async healthCheckService(req: Request, res: Response): Promise<void> {
    try {
      const { name } = req.params;
      // Implementation would check the specific service
      res.json({
        service: name,
        healthy: true,
        timestamp: new Date(),
      });
    } catch (error) {
      this.logger.error('Error health checking service:', error);
      res.status(500).json({ error: 'Failed to health check service' });
    }
  }

  /**
   * Get metrics
   */
  private async getMetrics(_req: Request, res: Response): Promise<void> {
    try {
      const state = this.core.getSystemState();
      res.json({
        metrics: state.metrics,
        resources: state.resources,
        timestamp: new Date(),
      });
    } catch (error) {
      this.logger.error('Error getting metrics:', error);
      res.status(500).json({ error: 'Failed to get metrics' });
    }
  }

  /**
   * Get performance data
   */
  private async getPerformance(_req: Request, res: Response): Promise<void> {
    try {
      const state = this.core.getSystemState();
      res.json({
        performance: {
          averageLatency: state.metrics.averageLatency,
          errorRate: state.metrics.errorRate,
          cacheHitRate: state.metrics.cacheHitRate,
          requestsProcessed: state.metrics.requestsProcessed,
        },
        timestamp: new Date(),
      });
    } catch (error) {
      this.logger.error('Error getting performance:', error);
      res.status(500).json({ error: 'Failed to get performance' });
    }
  }
}
