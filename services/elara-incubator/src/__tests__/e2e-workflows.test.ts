import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { serviceOrchestrator } from '../integration/service-orchestrator.js';
import { businessService } from '../services/business.service.js';
import { revenueService } from '../services/revenue.service.js';
import { paymentService } from '../services/payment.service.js';
import { fundService } from '../services/fund.service.js';
import { legalService } from '../services/legal.service.js';

describe('E2E Workflows', () => {
  let businessId: string;
  let userId = 'test-user-123';
  let transactionId: string;
  let paymentId: string;

  describe('Complete Business Creation Flow', () => {
    it('should create business with legal documents', async () => {
      const result = await serviceOrchestrator.createBusinessWithLegalSetup(userId, {
        businessName: 'Test Business',
        businessType: 'e-commerce',
        templateId: 'template-1',
      });

      expect(result.business).toBeDefined();
      expect(result.business.businessName).toBe('Test Business');
      expect(result.legalDocuments).toBeDefined();
      expect(result.legalDocuments.length).toBeGreaterThan(0);
      expect(result.guidance).toBeDefined();

      businessId = result.business.id;
    });

    it('should have correct ownership split', async () => {
      const business = await businessService.getBusinessById(businessId);
      expect(business.userOwnership).toBe(90);
      expect(business.citadelFundShare).toBe(10);
    });
  });

  describe('Revenue Processing Flow', () => {
    it('should record revenue transaction', async () => {
      const transaction = await revenueService.recordTransaction(businessId, {
        amount: 1000,
        currency: 'USD',
        source: 'online_sales',
      });

      expect(transaction).toBeDefined();
      expect(transaction.amount).toBe(1000);
      expect(transaction.status).toBe('completed');

      transactionId = transaction.id;
    });

    it('should calculate correct allocation (90/10 split)', async () => {
      const breakdown = await revenueService.getBreakdown(businessId);

      expect(breakdown.totalRevenue).toBe(1000);
      expect(breakdown.businessOwnerShare).toBe(900);
      expect(breakdown.citadelFundShare).toBe(100);
    });

    it('should process revenue with automatic allocation', async () => {
      const result = await serviceOrchestrator.processRevenueWithAllocation(businessId, {
        amount: 500,
        currency: 'USD',
        source: 'subscription',
      });

      expect(result.transaction).toBeDefined();
      expect(result.allocation).toBeDefined();
      expect(result.allocation.businessOwnerAmount).toBe(450);
      expect(result.allocation.citadelFundAmount).toBe(50);
      expect(result.ownerPayment).toBeDefined();

      paymentId = result.ownerPayment.id;
    });
  });

  describe('Payment Processing Flow', () => {
    it('should create payment', async () => {
      const payment = await paymentService.createPayment(businessId, userId, {
        amount: 450,
        type: 'revenue',
        paymentMethod: 'stripe',
      });

      expect(payment).toBeDefined();
      expect(payment.amount).toBe(450);
      expect(payment.status).toBe('pending');
    });

    it('should confirm payment', async () => {
      const payment = await paymentService.confirmPayment(paymentId, userId);

      expect(payment).toBeDefined();
      expect(payment.status).toBe('completed');
      expect(payment.completedAt).toBeDefined();
    });

    it('should track payment history', async () => {
      const history = await paymentService.getPaymentHistory(businessId);

      expect(history).toBeDefined();
      expect(history.totalCount).toBeGreaterThan(0);
      expect(history.totalAmount).toBeGreaterThan(0);
      expect(history.statusBreakdown.completed).toBeGreaterThan(0);
    });
  });

  describe('Citadel Fund Allocation Flow', () => {
    it('should record fund contribution', async () => {
      const fundBefore = await fundService.getFundBalance();
      const initialBalance = fundBefore.balance;

      // Process revenue which contributes to fund
      await serviceOrchestrator.processRevenueWithAllocation(businessId, {
        amount: 200,
        currency: 'USD',
        source: 'test_source',
      });

      const fundAfter = await fundService.getFundBalance();
      expect(fundAfter.balance).toBeGreaterThan(initialBalance);
      expect(fundAfter.totalContributions).toBeGreaterThan(0);
    });

    it('should track fund statistics', async () => {
      const fund = await fundService.getFundBalance();

      expect(fund).toBeDefined();
      expect(fund.balance).toBeGreaterThanOrEqual(0);
      expect(fund.totalContributions).toBeGreaterThanOrEqual(0);
      expect(fund.totalDistributions).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Document Signing Flow', () => {
    it('should sign business documents', async () => {
      const documents = await legalService.getBusinessDocuments(businessId);
      const docIds = documents.slice(0, 1).map((d) => d.id);

      const signedDocs = await serviceOrchestrator.signBusinessDocuments(
        businessId,
        userId,
        docIds,
        {
          signatureHash: 'test-hash-123',
          ipAddress: '127.0.0.1',
          userAgent: 'test-agent',
        }
      );

      expect(signedDocs).toBeDefined();
      expect(signedDocs.length).toBeGreaterThan(0);
      expect(signedDocs[0].status).toBe('signed');
    });
  });

  describe('Dashboard Data Aggregation', () => {
    it('should aggregate complete dashboard data', async () => {
      const dashboardData = await serviceOrchestrator.getBusinessDashboardData(businessId);

      expect(dashboardData).toBeDefined();
      expect(dashboardData.business).toBeDefined();
      expect(dashboardData.revenue).toBeDefined();
      expect(dashboardData.payments).toBeDefined();
      expect(dashboardData.fund).toBeDefined();
      expect(dashboardData.mentorship).toBeDefined();
    });

    it('should have consistent revenue and payment data', async () => {
      const dashboardData = await serviceOrchestrator.getBusinessDashboardData(businessId);

      expect(dashboardData.revenue.totalRevenue).toBeGreaterThan(0);
      expect(dashboardData.payments.totalAmount).toBeGreaterThan(0);
      expect(dashboardData.payments.totalCount).toBeGreaterThan(0);
    });
  });

  describe('Revenue Statistics', () => {
    it('should calculate correct statistics', async () => {
      const stats = await revenueService.getStatistics(businessId);

      expect(stats).toBeDefined();
      expect(stats.totalRevenue).toBeGreaterThan(0);
      expect(stats.transactionCount).toBeGreaterThan(0);
      expect(stats.averageTransaction).toBeGreaterThan(0);
      expect(stats.businessOwnerTotal).toBe(stats.totalRevenue * 0.9);
      expect(stats.citadelFundTotal).toBe(stats.totalRevenue * 0.1);
    });

    it('should track revenue trend', async () => {
      const trend = await revenueService.getRevenueTrend(businessId, 30);

      expect(trend).toBeDefined();
      expect(Array.isArray(trend)).toBe(true);
      if (trend.length > 0) {
        expect(trend[0].revenue).toBeGreaterThan(0);
        expect(trend[0].businessOwnerShare).toBe(trend[0].revenue * 0.9);
        expect(trend[0].citadelFundShare).toBe(trend[0].revenue * 0.1);
      }
    });
  });

  describe('Payment Status Tracking', () => {
    it('should track payment status changes', async () => {
      const payment = await paymentService.createPayment(businessId, userId, {
        amount: 100,
        type: 'revenue',
        paymentMethod: 'stripe',
      });

      expect(payment.status).toBe('pending');

      const confirmedPayment = await paymentService.confirmPayment(payment.id, userId);
      expect(confirmedPayment.status).toBe('completed');
    });

    it('should handle payment retry', async () => {
      const payment = await paymentService.createPayment(businessId, userId, {
        amount: 50,
        type: 'revenue',
        paymentMethod: 'stripe',
      });

      // Simulate failure
      await paymentService.updatePaymentStatus(payment.id, 'failed');

      // Retry
      const retriedPayment = await paymentService.retryPayment(payment.id, userId);
      expect(retriedPayment.status).toBe('pending');
    });
  });

  describe('Data Consistency', () => {
    it('should maintain data consistency across services', async () => {
      const business = await businessService.getBusinessById(businessId);
      const revenue = await revenueService.getStatistics(businessId);
      const payments = await paymentService.getPaymentHistory(businessId);

      // Revenue should match payment totals
      expect(revenue.totalRevenue).toBeGreaterThanOrEqual(payments.totalAmount);

      // Ownership should be consistent
      expect(business.userOwnership).toBe(90);
      expect(business.citadelFundShare).toBe(10);
    });
  });
});
