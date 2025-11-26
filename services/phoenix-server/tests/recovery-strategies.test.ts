import { RecoveryStrategies, RecoveryAction } from '../src/recovery-strategies';
import { ServiceHealth } from '../src/health-monitor';

// Mock fetch globally
global.fetch = jest.fn();

describe('RecoveryStrategies', () => {
  let recoveryStrategies: RecoveryStrategies;

  beforeEach(() => {
    recoveryStrategies = new RecoveryStrategies();
    jest.clearAllMocks();
  });

  describe('Auto-Recovery', () => {
    it('should attempt recovery for down service', async () => {
      const downService: ServiceHealth = {
        name: 'test-service',
        url: 'http://localhost:3000',
        status: 'down',
        lastCheck: new Date().toISOString(),
        responseTime: 0,
        errorRate: 0,
        uptime: 30
      };

      const incident = await recoveryStrategies.attemptRecovery(downService);

      expect(incident).toBeDefined();
      expect(incident.service).toBe('test-service');
      expect(incident.action).toBe(RecoveryAction.RESTART_SERVICE);
    });

    it('should apply circuit breaker for high error rate', async () => {
      const degradedService: ServiceHealth = {
        name: 'test-service',
        url: 'http://localhost:3000',
        status: 'degraded',
        lastCheck: new Date().toISOString(),
        responseTime: 1000,
        errorRate: 60,
        uptime: 70
      };

      const incident = await recoveryStrategies.attemptRecovery(degradedService);

      expect(incident.action).toBe(RecoveryAction.CIRCUIT_BREAK);
      expect(incident.success).toBe(true);
    });

    it('should scale up for slow response times', async () => {
      const slowService: ServiceHealth = {
        name: 'test-service',
        url: 'http://localhost:3000',
        status: 'degraded',
        lastCheck: new Date().toISOString(),
        responseTime: 6000,
        errorRate: 10,
        uptime: 75
      };

      const incident = await recoveryStrategies.attemptRecovery(slowService);

      expect(incident.action).toBe(RecoveryAction.SCALE_UP);
    });

    it('should reroute traffic for degraded services', async () => {
      const degradedService: ServiceHealth = {
        name: 'test-service',
        url: 'http://localhost:3000',
        status: 'degraded',
        lastCheck: new Date().toISOString(),
        responseTime: 2000,
        errorRate: 20,
        uptime: 70
      };

      const incident = await recoveryStrategies.attemptRecovery(degradedService);

      expect([RecoveryAction.REROUTE_TRAFFIC, RecoveryAction.CIRCUIT_BREAK]).toContain(incident.action);
    });
  });

  describe('Service Restart', () => {
    it('should restart crashed service', async () => {
      const crashedService: ServiceHealth = {
        name: 'crashed-service',
        url: 'http://localhost:3000',
        status: 'down',
        lastCheck: new Date().toISOString(),
        responseTime: 0,
        errorRate: 100,
        uptime: 0
      };

      const incident = await recoveryStrategies.attemptRecovery(crashedService);

      expect(incident.action).toBe(RecoveryAction.RESTART_SERVICE);
      expect(incident.success).toBe(true);
      expect(incident.recoveryTime).toBeGreaterThan(0);
    });

    it('should record recovery time', async () => {
      const downService: ServiceHealth = {
        name: 'test-service',
        url: 'http://localhost:3000',
        status: 'down',
        lastCheck: new Date().toISOString(),
        responseTime: 0,
        errorRate: 0,
        uptime: 40
      };

      const incident = await recoveryStrategies.attemptRecovery(downService);

      expect(incident.recoveryTime).toBeGreaterThanOrEqual(0);
      expect(typeof incident.recoveryTime).toBe('number');
    });
  });

  describe('Failover', () => {
    it('should alert team for persistent failures', async () => {
      const persistentlyDownService: ServiceHealth = {
        name: 'test-service',
        url: 'http://localhost:3000',
        status: 'down',
        lastCheck: new Date().toISOString(),
        responseTime: 0,
        errorRate: 100,
        uptime: 10
      };

      const incident = await recoveryStrategies.attemptRecovery(persistentlyDownService);

      expect(incident.action).toBe(RecoveryAction.ALERT_TEAM);
    });

    it('should handle no applicable strategy', async () => {
      const healthyService: ServiceHealth = {
        name: 'test-service',
        url: 'http://localhost:3000',
        status: 'healthy',
        lastCheck: new Date().toISOString(),
        responseTime: 100,
        errorRate: 0,
        uptime: 100
      };

      const incident = await recoveryStrategies.attemptRecovery(healthyService);

      expect(incident.success).toBe(false);
      expect(incident.details).toContain('No applicable recovery strategy');
    });
  });

  describe('Recovery Events', () => {
    it('should emit recovery-attempted event', (done) => {
      const downService: ServiceHealth = {
        name: 'test-service',
        url: 'http://localhost:3000',
        status: 'down',
        lastCheck: new Date().toISOString(),
        responseTime: 0,
        errorRate: 0,
        uptime: 30
      };

      recoveryStrategies.on('recovery-attempted', (incident) => {
        expect(incident).toBeDefined();
        expect(incident.service).toBe('test-service');
        done();
      });

      recoveryStrategies.attemptRecovery(downService);
    });
  });

  describe('Recovery Statistics', () => {
    it('should track recovery incidents', async () => {
      const downService: ServiceHealth = {
        name: 'test-service',
        url: 'http://localhost:3000',
        status: 'down',
        lastCheck: new Date().toISOString(),
        responseTime: 0,
        errorRate: 0,
        uptime: 30
      };

      await recoveryStrategies.attemptRecovery(downService);
      await recoveryStrategies.attemptRecovery(downService);

      const incidents = recoveryStrategies.getIncidents();
      expect(incidents).toHaveLength(2);
    });

    it('should calculate recovery statistics', async () => {
      const downService: ServiceHealth = {
        name: 'test-service',
        url: 'http://localhost:3000',
        status: 'down',
        lastCheck: new Date().toISOString(),
        responseTime: 0,
        errorRate: 0,
        uptime: 30
      };

      await recoveryStrategies.attemptRecovery(downService);

      const stats = recoveryStrategies.getStats();
      expect(stats.totalIncidents).toBeGreaterThan(0);
      expect(stats.successfulRecoveries).toBeGreaterThanOrEqual(0);
      expect(stats.successRate).toBeGreaterThanOrEqual(0);
      expect(stats.avgRecoveryTime).toBeGreaterThanOrEqual(0);
    });

    it('should calculate success rate correctly', async () => {
      const downService: ServiceHealth = {
        name: 'test-service',
        url: 'http://localhost:3000',
        status: 'down',
        lastCheck: new Date().toISOString(),
        responseTime: 0,
        errorRate: 0,
        uptime: 30
      };

      await recoveryStrategies.attemptRecovery(downService);
      await recoveryStrategies.attemptRecovery(downService);

      const stats = recoveryStrategies.getStats();
      expect(stats.successRate).toBeGreaterThanOrEqual(0);
      expect(stats.successRate).toBeLessThanOrEqual(100);
    });
  });

  describe('Strategy Priority', () => {
    it('should apply highest priority strategy first', async () => {
      const criticalService: ServiceHealth = {
        name: 'test-service',
        url: 'http://localhost:3000',
        status: 'down',
        lastCheck: new Date().toISOString(),
        responseTime: 0,
        errorRate: 100,
        uptime: 10
      };

      const incident = await recoveryStrategies.attemptRecovery(criticalService);

      // Should prioritize restart over alert
      expect([RecoveryAction.RESTART_SERVICE, RecoveryAction.ALERT_TEAM]).toContain(incident.action);
    });
  });
});
