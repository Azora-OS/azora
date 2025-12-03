import request from 'supertest';
import express from 'express';
import conversionMetricsRouter from '../conversion-metrics.routes';
import { conversionMetricsService } from '../../services/conversion-metrics.service';

// Mock the service
jest.mock('../../services/conversion-metrics.service');

const app = express();
app.use(express.json());
app.use('/', conversionMetricsRouter);

describe('Conversion Metrics Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /analytics/conversion/metrics', () => {
    it('should return conversion metrics for current month', async () => {
      const mockMetrics = {
        period: '2024-01',
        freeUsers: 100,
        premiumUsers: 30,
        proUsers: 5,
        conversionRate: 23.08,
        churnRate: 5.2,
        lifetimeValue: 50,
        customerAcquisitionCost: 10,
        paybackPeriod: 2.4,
      };

      (conversionMetricsService.getConversionMetrics as jest.Mock).mockResolvedValue(mockMetrics);

      const response = await request(app).get('/analytics/conversion/metrics');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockMetrics);
    });

    it('should handle errors gracefully', async () => {
      (conversionMetricsService.getConversionMetrics as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      const response = await request(app).get('/analytics/conversion/metrics');

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Failed to fetch conversion metrics');
    });
  });

  describe('GET /analytics/conversion/metrics/:period', () => {
    it('should return conversion metrics for specified month', async () => {
      const mockMetrics = {
        period: '2024-03',
        freeUsers: 150,
        premiumUsers: 45,
        proUsers: 10,
        conversionRate: 23.08,
        churnRate: 3.5,
        lifetimeValue: 55,
        customerAcquisitionCost: 12,
        paybackPeriod: 2.6,
      };

      (conversionMetricsService.getConversionMetrics as jest.Mock).mockResolvedValue(mockMetrics);

      const response = await request(app).get('/analytics/conversion/metrics/2024-03');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.period).toBe('2024-03');
    });

    it('should return conversion metrics for specified quarter', async () => {
      const mockMetrics = {
        period: '2024-Q1',
        freeUsers: 300,
        premiumUsers: 90,
        proUsers: 20,
        conversionRate: 23.08,
        churnRate: 4.2,
        lifetimeValue: 52,
        customerAcquisitionCost: 11,
        paybackPeriod: 2.5,
      };

      (conversionMetricsService.getConversionMetrics as jest.Mock).mockResolvedValue(mockMetrics);

      const response = await request(app).get('/analytics/conversion/metrics/2024-Q1');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.period).toBe('2024-Q1');
    });

    it('should return conversion metrics for specified year', async () => {
      const mockMetrics = {
        period: '2024',
        freeUsers: 1200,
        premiumUsers: 360,
        proUsers: 80,
        conversionRate: 23.08,
        churnRate: 4.0,
        lifetimeValue: 51,
        customerAcquisitionCost: 10.5,
        paybackPeriod: 2.45,
      };

      (conversionMetricsService.getConversionMetrics as jest.Mock).mockResolvedValue(mockMetrics);

      const response = await request(app).get('/analytics/conversion/metrics/2024');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.period).toBe('2024');
    });

    it('should reject invalid period format', async () => {
      const response = await request(app).get('/analytics/conversion/metrics/invalid-period');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Invalid period format');
    });

    it('should reject invalid month', async () => {
      const response = await request(app).get('/analytics/conversion/metrics/2024-13');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should handle service errors', async () => {
      (conversionMetricsService.getConversionMetrics as jest.Mock).mockRejectedValue(
        new Error('Service error')
      );

      const response = await request(app).get('/analytics/conversion/metrics/2024-01');

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
    });
  });

  describe('Data aggregation', () => {
    it('should aggregate conversion metrics correctly', async () => {
      const mockMetrics = {
        period: '2024-01',
        freeUsers: 100,
        premiumUsers: 30,
        proUsers: 5,
        conversionRate: 23.08,
        churnRate: 5.2,
        lifetimeValue: 50,
        customerAcquisitionCost: 10,
        paybackPeriod: 2.4,
      };

      (conversionMetricsService.getConversionMetrics as jest.Mock).mockResolvedValue(mockMetrics);

      const response = await request(app).get('/analytics/conversion/metrics/2024-01');

      expect(response.body.data.freeUsers).toBe(100);
      expect(response.body.data.premiumUsers).toBe(30);
      expect(response.body.data.proUsers).toBe(5);
      expect(response.body.data.conversionRate).toBeCloseTo(23.08, 1);
    });
  });
});
