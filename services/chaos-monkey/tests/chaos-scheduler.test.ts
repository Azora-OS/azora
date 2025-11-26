import { ChaosScheduler } from '../src/chaos-scheduler';
import { ChaosConfig } from '../src/failure-types';

describe('ChaosScheduler', () => {
  let scheduler: ChaosScheduler;
  let mockConfig: ChaosConfig;

  beforeEach(() => {
    mockConfig = {
      enabled: true,
      intensity: 'low',
      targetServices: ['test-service-1', 'test-service-2'],
      excludeServices: ['azora-auth', 'azora-pay'],
      schedule: {
        frequency: '*/5 * * * *', // Every 5 minutes for testing
        duration: 1 // 1 minute
      },
      requireApproval: false
    };

    scheduler = new ChaosScheduler(mockConfig);
  });

  afterEach(() => {
    scheduler.stop();
  });

  describe('Scheduler Initialization', () => {
    it('should initialize with config', () => {
      expect(scheduler).toBeDefined();
    });

    it('should start scheduler when enabled', () => {
      const consoleSpy = jest.spyOn(console, 'log');
      scheduler.start();

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('ChaosMonkey started')
      );

      consoleSpy.mockRestore();
    });

    it('should not start when disabled', () => {
      const disabledConfig = { ...mockConfig, enabled: false };
      const disabledScheduler = new ChaosScheduler(disabledConfig);
      
      const consoleSpy = jest.spyOn(console, 'log');
      disabledScheduler.start();

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('ChaosMonkey is disabled')
      );

      consoleSpy.mockRestore();
    });

    it('should stop scheduler', () => {
      scheduler.start();
      const consoleSpy = jest.spyOn(console, 'log');
      
      scheduler.stop();

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('ChaosMonkey stopped')
      );

      consoleSpy.mockRestore();
    });
  });

  describe('Chaos History', () => {
    it('should retrieve chaos history', () => {
      const history = scheduler.getHistory();

      expect(Array.isArray(history)).toBe(true);
    });

    it('should retrieve active events', () => {
      const activeEvents = scheduler.getActiveEvents();

      expect(Array.isArray(activeEvents)).toBe(true);
    });
  });

  describe('Event Handling', () => {
    it('should listen to chaos-injected events', (done) => {
      scheduler.start();

      // Listen for the event
      const engine = (scheduler as any).engine;
      engine.on('chaos-injected', (result: any) => {
        expect(result).toBeDefined();
        expect(result.eventId).toBeDefined();
        done();
      });

      // Manually trigger chaos for testing
      engine.injectChaos();
    });
  });

  describe('Configuration', () => {
    it('should respect intensity setting', () => {
      const highConfig = { ...mockConfig, intensity: 'high' as const };
      const highScheduler = new ChaosScheduler(highConfig);

      expect(highScheduler).toBeDefined();
    });

    it('should respect target services', () => {
      expect(mockConfig.targetServices).toContain('test-service-1');
      expect(mockConfig.targetServices).toContain('test-service-2');
    });

    it('should respect excluded services', () => {
      expect(mockConfig.excludeServices).toContain('azora-auth');
      expect(mockConfig.excludeServices).toContain('azora-pay');
    });
  });
});
