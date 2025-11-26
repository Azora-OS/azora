import { HealthMonitor, ServiceHealth } from '../src/health-monitor';

// Mock fetch globally
global.fetch = jest.fn();

describe('HealthMonitor', () => {
  let healthMonitor: HealthMonitor;

  beforeEach(() => {
    healthMonitor = new HealthMonitor(1000); // 1 second for testing
    jest.clearAllMocks();
  });

  afterEach(() => {
    healthMonitor.stop();
  });

  describe('Service Registration', () => {
    it('should register a service for monitoring', () => {
      healthMonitor.registerService('test-service', 'http://localhost:3000');

      const health = healthMonitor.getServiceHealth('test-service');
      expect(health).toBeDefined();
      expect(health?.name).toBe('test-service');
      expect(health?.url).toBe('http://localhost:3000');
    });

    it('should initialize service with healthy status', () => {
      healthMonitor.registerService('test-service', 'http://localhost:3000');

      const health = healthMonitor.getServiceHealth('test-service');
      expect(health?.status).toBe('healthy');
      expect(health?.uptime).toBe(100);
    });

    it('should register multiple services', () => {
      healthMonitor.registerService('service-1', 'http://localhost:3001');
      healthMonitor.registerService('service-2', 'http://localhost:3002');

      const allHealth = healthMonitor.getAllHealth();
      expect(allHealth).toHaveLength(2);
    });
  });

  describe('Health Checks', () => {
    beforeEach(() => {
      healthMonitor.registerService('test-service', 'http://localhost:3000');
    });

    it('should check service health successfully', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200
      });

      const result = await healthMonitor.checkService('test-service');

      expect(result.healthy).toBe(true);
      expect(result.service).toBe('test-service');
      expect(result.responseTime).toBeGreaterThanOrEqual(0);
    });

    it('should detect unhealthy service', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500
      });

      const result = await healthMonitor.checkService('test-service');

      expect(result.healthy).toBe(false);
      const health = healthMonitor.getServiceHealth('test-service');
      expect(health?.status).toBe('degraded');
    });

    it('should detect service down on fetch error', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Connection refused'));

      const result = await healthMonitor.checkService('test-service');

      expect(result.healthy).toBe(false);
      expect(result.error).toBeDefined();
      const health = healthMonitor.getServiceHealth('test-service');
      expect(health?.status).toBe('down');
    });

    it('should track response time', async () => {
      (global.fetch as jest.Mock).mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({ ok: true }), 100))
      );

      const result = await healthMonitor.checkService('test-service');

      expect(result.responseTime).toBeGreaterThanOrEqual(100);
    });

    it('should update uptime on successful checks', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({ ok: true });

      await healthMonitor.checkService('test-service');
      const health = healthMonitor.getServiceHealth('test-service');

      expect(health?.uptime).toBeGreaterThanOrEqual(100);
    });

    it('should decrease uptime on failed checks', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Failed'));

      await healthMonitor.checkService('test-service');
      const health = healthMonitor.getServiceHealth('test-service');

      expect(health?.uptime).toBeLessThan(100);
    });
  });

  describe('Health Restoration', () => {
    beforeEach(() => {
      healthMonitor.registerService('test-service', 'http://localhost:3000');
    });

    it('should restore health after recovery', async () => {
      // First fail
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Failed'));
      await healthMonitor.checkService('test-service');
      
      let health = healthMonitor.getServiceHealth('test-service');
      expect(health?.status).toBe('down');

      // Then succeed
      (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: true });
      await healthMonitor.checkService('test-service');

      health = healthMonitor.getServiceHealth('test-service');
      expect(health?.status).toBe('healthy');
    });

    it('should gradually restore uptime', async () => {
      // Fail multiple times
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Failed'));
      await healthMonitor.checkService('test-service');
      await healthMonitor.checkService('test-service');

      const downtimeUptime = healthMonitor.getServiceHealth('test-service')?.uptime || 0;

      // Succeed multiple times
      (global.fetch as jest.Mock).mockResolvedValue({ ok: true });
      await healthMonitor.checkService('test-service');
      await healthMonitor.checkService('test-service');

      const recoveredUptime = healthMonitor.getServiceHealth('test-service')?.uptime || 0;
      expect(recoveredUptime).toBeGreaterThan(downtimeUptime);
    });
  });

  describe('Monitoring Control', () => {
    it('should start monitoring', () => {
      const consoleSpy = jest.spyOn(console, 'log');
      healthMonitor.start();

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Health monitoring started')
      );

      consoleSpy.mockRestore();
    });

    it('should stop monitoring', () => {
      healthMonitor.start();
      const consoleSpy = jest.spyOn(console, 'log');
      
      healthMonitor.stop();

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Health monitoring stopped')
      );

      consoleSpy.mockRestore();
    });

    it('should not start monitoring twice', () => {
      healthMonitor.start();
      const consoleSpy = jest.spyOn(console, 'log');
      
      healthMonitor.start();

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('already active')
      );

      consoleSpy.mockRestore();
    });
  });

  describe('Unhealthy Services', () => {
    it('should identify unhealthy services', async () => {
      healthMonitor.registerService('healthy-service', 'http://localhost:3001');
      healthMonitor.registerService('unhealthy-service', 'http://localhost:3002');

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({ ok: true })
        .mockRejectedValueOnce(new Error('Failed'));

      await healthMonitor.checkService('healthy-service');
      await healthMonitor.checkService('unhealthy-service');

      const unhealthy = healthMonitor.getUnhealthyServices();
      expect(unhealthy).toHaveLength(1);
      expect(unhealthy[0].name).toBe('unhealthy-service');
    });

    it('should return empty array when all services healthy', async () => {
      healthMonitor.registerService('service-1', 'http://localhost:3001');
      healthMonitor.registerService('service-2', 'http://localhost:3002');

      (global.fetch as jest.Mock).mockResolvedValue({ ok: true });

      await healthMonitor.checkService('service-1');
      await healthMonitor.checkService('service-2');

      const unhealthy = healthMonitor.getUnhealthyServices();
      expect(unhealthy).toHaveLength(0);
    });
  });
});
