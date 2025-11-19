/**
 * Health Check Service Tests
 */

import { HealthCheckService } from '../health-check.service';
import { PrismaClient } from '@prisma/client';

jest.mock('@prisma/client');

describe('HealthCheckService', () => {
  let healthCheckService: HealthCheckService;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      $queryRaw: jest.fn().mockResolvedValue([{ '1': 1 }]),
      user: {
        count: jest.fn().mockResolvedValue(100),
      },
      course: {
        count: jest.fn().mockResolvedValue(50),
      },
      enrollment: {
        count: jest.fn().mockResolvedValue(500),
      },
    };

    healthCheckService = new HealthCheckService(mockPrisma as PrismaClient);
  });

  describe('getHealthStatus', () => {
    it('should return healthy status when all checks pass', async () => {
      const health = await healthCheckService.getHealthStatus();

      expect(health.status).toBe('healthy');
      expect(health.timestamp).toBeDefined();
      expect(health.uptime).toBeGreaterThan(0);
      expect(health.checks).toBeDefined();
      expect(health.checks.database).toBeDefined();
    });

    it('should include database check', async () => {
      const health = await healthCheckService.getHealthStatus();

      expect(health.checks.database.status).toBe('healthy');
      expect(health.checks.database.responseTime).toBeGreaterThanOrEqual(0);
      expect(health.checks.database.message).toBeDefined();
      expect(health.checks.database.lastChecked).toBeDefined();
    });

    it('should include memory check', async () => {
      const health = await healthCheckService.getHealthStatus();

      expect(health.checks.memory).toBeDefined();
      expect(health.checks.memory.status).toMatch(/healthy|degraded|unhealthy/);
      expect(health.checks.memory.message).toBeDefined();
    });

    it('should include metrics', async () => {
      const health = await healthCheckService.getHealthStatus();

      expect(health.metrics).toBeDefined();
      expect(health.metrics?.requestsPerSecond).toBeGreaterThanOrEqual(0);
      expect(health.metrics?.errorRate).toBeGreaterThanOrEqual(0);
      expect(health.metrics?.averageResponseTime).toBeGreaterThanOrEqual(0);
      expect(health.metrics?.activeConnections).toBeGreaterThanOrEqual(0);
    });

    it('should return degraded status when database is slow', async () => {
      // Mock slow database response
      mockPrisma.$queryRaw = jest.fn().mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve([{ '1': 1 }]), 150))
      );

      const health = await healthCheckService.getHealthStatus();

      expect(health.checks.database.status).toBe('degraded');
    });

    it('should return unhealthy status when database fails', async () => {
      mockPrisma.$queryRaw = jest.fn().mockRejectedValue(new Error('Connection failed'));

      const health = await healthCheckService.getHealthStatus();

      expect(health.status).toBe('unhealthy');
      expect(health.checks.database.status).toBe('unhealthy');
      expect(health.checks.database.message).toContain('Connection failed');
    });
  });

  describe('recordRequest', () => {
    it('should record successful requests', () => {
      healthCheckService.recordRequest(100, false);
      healthCheckService.recordRequest(150, false);

      const health = healthCheckService['lastMetrics'];
      expect(health.requestCount).toBe(2);
      expect(health.errorCount).toBe(0);
      expect(health.totalResponseTime).toBe(250);
    });

    it('should record failed requests', () => {
      healthCheckService.recordRequest(100, false);
      healthCheckService.recordRequest(150, true);

      const health = healthCheckService['lastMetrics'];
      expect(health.requestCount).toBe(2);
      expect(health.errorCount).toBe(1);
    });
  });

  describe('getDiagnostics', () => {
    it('should return detailed diagnostics', async () => {
      const diagnostics = await healthCheckService.getDiagnostics();

      expect(diagnostics.health).toBeDefined();
      expect(diagnostics.system).toBeDefined();
      expect(diagnostics.system.uptime).toBeGreaterThan(0);
      expect(diagnostics.system.memory).toBeDefined();
      expect(diagnostics.system.nodeVersion).toBeDefined();
      expect(diagnostics.system.platform).toBeDefined();
      expect(diagnostics.timestamp).toBeDefined();
    });

    it('should include memory information', async () => {
      const diagnostics = await healthCheckService.getDiagnostics();

      expect(diagnostics.system.memory.heapUsed).toBeDefined();
      expect(diagnostics.system.memory.heapTotal).toBeDefined();
      expect(diagnostics.system.memory.external).toBeDefined();
      expect(diagnostics.system.memory.rss).toBeDefined();
    });
  });

  describe('checkMemory', () => {
    it('should return healthy status for normal memory usage', () => {
      const check = healthCheckService['checkMemory']();

      expect(check.status).toMatch(/healthy|degraded|unhealthy/);
      expect(check.message).toContain('Heap usage');
      expect(check.lastChecked).toBeDefined();
    });
  });
});
