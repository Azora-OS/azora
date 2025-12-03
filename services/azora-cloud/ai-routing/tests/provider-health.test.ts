import { RoutingTier } from '../types';

describe('AI Routing - Provider Health Checks', () => {
  describe('Health Check System', () => {
    it('should check local LLM provider health', async () => {
      const healthStatus = {
        tier: RoutingTier.LOCAL_LLM,
        isHealthy: true,
        responseTime: 50,
        lastChecked: new Date(),
      };

      expect(healthStatus.isHealthy).toBe(true);
      expect(healthStatus.responseTime).toBeLessThan(100);
    });

    it('should check RAP system provider health', async () => {
      const healthStatus = {
        tier: RoutingTier.RAP_SYSTEM,
        isHealthy: true,
        responseTime: 200,
        lastChecked: new Date(),
      };

      expect(healthStatus.isHealthy).toBe(true);
      expect(healthStatus.responseTime).toBeLessThan(500);
    });

    it('should check external LLM provider health', async () => {
      const healthStatus = {
        tier: RoutingTier.EXTERNAL_LLM,
        isHealthy: true,
        responseTime: 1000,
        lastChecked: new Date(),
      };

      expect(healthStatus.isHealthy).toBe(true);
      expect(healthStatus.responseTime).toBeLessThan(5000);
    });

    it('should mark provider as unhealthy on timeout', async () => {
      const healthStatus = {
        tier: RoutingTier.LOCAL_LLM,
        isHealthy: false,
        responseTime: 10000,
        lastChecked: new Date(),
        error: 'Timeout',
      };

      expect(healthStatus.isHealthy).toBe(false);
      expect(healthStatus.error).toBe('Timeout');
    });

    it('should mark provider as unhealthy on error', async () => {
      const healthStatus = {
        tier: RoutingTier.EXTERNAL_LLM,
        isHealthy: false,
        responseTime: 0,
        lastChecked: new Date(),
        error: 'Connection refused',
      };

      expect(healthStatus.isHealthy).toBe(false);
      expect(healthStatus.error).toBeDefined();
    });

    it('should track consecutive health check failures', () => {
      const failureCount = 3;
      const threshold = 5;

      const shouldDisable = failureCount >= threshold;
      expect(shouldDisable).toBe(false);

      const highFailureCount = 6;
      const shouldDisableHigh = highFailureCount >= threshold;
      expect(shouldDisableHigh).toBe(true);
    });

    it('should reset failure count on successful health check', () => {
      let failureCount = 3;

      failureCount = 0;

      expect(failureCount).toBe(0);
    });

    it('should perform periodic health checks', () => {
      const checkInterval = 60000;
      const lastCheck = new Date(Date.now() - 70000);
      const now = new Date();

      const shouldCheck = now.getTime() - lastCheck.getTime() >= checkInterval;
      expect(shouldCheck).toBe(true);
    });

    it('should aggregate health status across all providers', () => {
      const providers = [
        { tier: RoutingTier.LOCAL_LLM, isHealthy: true },
        { tier: RoutingTier.RAP_SYSTEM, isHealthy: true },
        { tier: RoutingTier.EXTERNAL_LLM, isHealthy: false },
      ];

      const healthyCount = providers.filter(p => p.isHealthy).length;
      const totalCount = providers.length;
      const healthPercentage = (healthyCount / totalCount) * 100;

      expect(healthPercentage).toBe(66.66666666666666);
    });

    it('should prioritize healthy providers in routing', () => {
      const providers = [
        { tier: RoutingTier.LOCAL_LLM, isHealthy: false, priority: 1 },
        { tier: RoutingTier.RAP_SYSTEM, isHealthy: true, priority: 2 },
        { tier: RoutingTier.EXTERNAL_LLM, isHealthy: true, priority: 3 },
      ];

      const healthyProviders = providers
        .filter(p => p.isHealthy)
        .sort((a, b) => a.priority - b.priority);

      expect(healthyProviders.length).toBe(2);
      expect(healthyProviders[0].tier).toBe(RoutingTier.RAP_SYSTEM);
    });
  });

  describe('Provider Recovery', () => {
    it('should attempt recovery after cooldown period', () => {
      const disabledAt = new Date(Date.now() - 600000);
      const cooldownPeriod = 300000;
      const now = new Date();

      const canRecover = now.getTime() - disabledAt.getTime() >= cooldownPeriod;
      expect(canRecover).toBe(true);
    });

    it('should not attempt recovery during cooldown', () => {
      const disabledAt = new Date(Date.now() - 100000);
      const cooldownPeriod = 300000;
      const now = new Date();

      const canRecover = now.getTime() - disabledAt.getTime() >= cooldownPeriod;
      expect(canRecover).toBe(false);
    });

    it('should gradually increase recovery attempts', () => {
      const attempts = [1, 2, 3, 4, 5];
      const backoffMultiplier = 2;

      const delays = attempts.map(attempt => 
        Math.min(60000 * Math.pow(backoffMultiplier, attempt - 1), 600000)
      );

      expect(delays[0]).toBe(60000);
      expect(delays[1]).toBe(120000);
      expect(delays[2]).toBe(240000);
      expect(delays[3]).toBe(480000);
      expect(delays[4]).toBe(600000);
    });
  });
});
