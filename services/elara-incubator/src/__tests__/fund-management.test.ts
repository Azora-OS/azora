import { fundService } from '../services/fund.service.js';
import { AppError } from '../middleware/errorHandler.js';

describe('Citadel Fund Management - Task 15', () => {
  const userId = '550e8400-e29b-41d4-a716-446655440003';
  const ipAddress = '192.168.1.1';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Fund Balance Tracking', () => {
    it('should get initial fund status', async () => {
      const fund = await fundService.getFundStatus();

      expect(fund).toBeDefined();
      expect(fund.id).toBeDefined();
      expect(fund.balance).toBeGreaterThanOrEqual(0);
      expect(fund.totalContributions).toBeGreaterThanOrEqual(0);
      expect(fund.totalDistributions).toBeGreaterThanOrEqual(0);
      expect(fund.updatedAt).toBeDefined();
    });

    it('should get fund balance', async () => {
      const balance = await fundService.getBalance();

      expect(typeof balance).toBe('number');
      expect(balance).toBeGreaterThanOrEqual(0);
    });

    it('should add contribution to fund', async () => {
      const initialBalance = await fundService.getBalance();
      const contributionAmount = 1000;

      const updatedFund = await fundService.addContribution(contributionAmount, 'business_revenue');

      expect(updatedFund.balance).toBe(initialBalance + contributionAmount);
      expect(updatedFund.totalContributions).toBeGreaterThanOrEqual(contributionAmount);
    });

    it('should reject negative contributions', async () => {
      await expect(fundService.addContribution(-100, 'test')).rejects.toThrow(AppError);
    });

    it('should reject zero contributions', async () => {
      await expect(fundService.addContribution(0, 'test')).rejects.toThrow(AppError);
    });

    it('should track multiple contributions', async () => {
      const amounts = [500, 1000, 250];
      const expectedTotal = amounts.reduce((a, b) => a + b, 0);

      for (const amount of amounts) {
        await fundService.addContribution(amount, 'business_revenue');
      }

      const fund = await fundService.getFundStatus();
      expect(fund.totalContributions).toBeGreaterThanOrEqual(expectedTotal);
    });
  });

  describe('Contribution Recording', () => {
    it('should create distribution record', async () => {
      const distribution = await fundService.createDistribution({
        amount: 500,
        type: 'scholarship',
        description: 'Scholarship for student',
      });

      expect(distribution).toBeDefined();
      expect(distribution.id).toBeDefined();
      expect(distribution.amount).toBe(500);
      expect(distribution.type).toBe('scholarship');
      expect(distribution.status).toBe('pending');
      expect(distribution.distributedAt).toBeDefined();
    });

    it('should validate distribution amount', async () => {
      await expect(
        fundService.createDistribution({
          amount: -100,
          type: 'scholarship',
          description: 'Invalid',
        })
      ).rejects.toThrow(AppError);
    });

    it('should check sufficient fund balance', async () => {
      const balance = await fundService.getBalance();
      const excessiveAmount = balance + 10000;

      await expect(
        fundService.createDistribution({
          amount: excessiveAmount,
          type: 'scholarship',
          description: 'Too much',
        })
      ).rejects.toThrow(AppError);
    });

    it('should retrieve distribution by ID', async () => {
      const created = await fundService.createDistribution({
        amount: 300,
        type: 'project',
        description: 'Community project',
      });

      const retrieved = await fundService.getDistributionById(created.id);

      expect(retrieved).toBeDefined();
      expect(retrieved.id).toBe(created.id);
      expect(retrieved.amount).toBe(300);
      expect(retrieved.type).toBe('project');
    });

    it('should throw error for non-existent distribution', async () => {
      await expect(fundService.getDistributionById('non-existent-id')).rejects.toThrow(AppError);
    });
  });

  describe('Distribution Logic', () => {
    it('should update distribution status to completed', async () => {
      const distribution = await fundService.createDistribution({
        amount: 200,
        type: 'scholarship',
        description: 'Test scholarship',
      });

      const updated = await fundService.updateDistributionStatus(distribution.id, 'completed');

      expect(updated.status).toBe('completed');
    });

    it('should deduct from fund balance when distribution completed', async () => {
      const initialBalance = await fundService.getBalance();

      const distribution = await fundService.createDistribution({
        amount: 100,
        type: 'community',
        description: 'Community fund',
      });

      await fundService.updateDistributionStatus(distribution.id, 'completed');

      const finalBalance = await fundService.getBalance();
      expect(finalBalance).toBe(initialBalance - 100);
    });

    it('should get all distributions with pagination', async () => {
      const result = await fundService.getDistributions(1, 10);

      expect(result).toBeDefined();
      expect(result.distributions).toBeDefined();
      expect(Array.isArray(result.distributions)).toBe(true);
      expect(result.total).toBeGreaterThanOrEqual(0);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(10);
      expect(result.totalPages).toBeGreaterThanOrEqual(0);
    });

    it('should filter distributions by type', async () => {
      await fundService.createDistribution({
        amount: 100,
        type: 'scholarship',
        description: 'Scholarship 1',
      });

      await fundService.createDistribution({
        amount: 200,
        type: 'project',
        description: 'Project 1',
      });

      const scholarships = await fundService.getDistributions(1, 10, 'scholarship');

      expect(scholarships.distributions.length).toBeGreaterThanOrEqual(1);
      scholarships.distributions.forEach((d) => {
        expect(d.type).toBe('scholarship');
      });
    });

    it('should get distribution statistics', async () => {
      const stats = await fundService.getDistributionStats();

      expect(stats).toBeDefined();
      expect(stats.totalDistributions).toBeGreaterThanOrEqual(0);
      expect(stats.totalDistributedAmount).toBeGreaterThanOrEqual(0);
      expect(stats.averageDistribution).toBeGreaterThanOrEqual(0);
      expect(stats.byType).toBeDefined();
      expect(stats.byStatus).toBeDefined();
    });

    it('should get impact metrics', async () => {
      const metrics = await fundService.getImpactMetrics();

      expect(metrics).toBeDefined();
      expect(metrics.scholarshipsAwarded).toBeGreaterThanOrEqual(0);
      expect(metrics.projectsFunded).toBeGreaterThanOrEqual(0);
      expect(metrics.communityBeneficiaries).toBeGreaterThanOrEqual(0);
      expect(metrics.totalImpactAmount).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Fund Audit Trail', () => {
    it('should get audit trail with pagination', async () => {
      const auditTrail = await fundService.getAuditTrail(1, 10);

      expect(auditTrail).toBeDefined();
      expect(auditTrail.entries).toBeDefined();
      expect(Array.isArray(auditTrail.entries)).toBe(true);
      expect(auditTrail.total).toBeGreaterThanOrEqual(0);
      expect(auditTrail.page).toBe(1);
      expect(auditTrail.pageSize).toBe(10);
      expect(auditTrail.totalPages).toBeGreaterThanOrEqual(0);
    });

    it('should log contribution action', async () => {
      await fundService.addContribution(500, 'test_source');

      const auditTrail = await fundService.getAuditTrail(1, 100);

      expect(auditTrail.entries.length).toBeGreaterThan(0);
      const contributionEntry = auditTrail.entries.find((e) => e.action === 'contribution_added');
      expect(contributionEntry).toBeDefined();
    });

    it('should log distribution creation', async () => {
      await fundService.createDistribution({
        amount: 300,
        type: 'scholarship',
        description: 'Test',
      });

      const auditTrail = await fundService.getAuditTrail(1, 100);

      expect(auditTrail.entries.length).toBeGreaterThan(0);
      const distributionEntry = auditTrail.entries.find((e) => e.action === 'distribution_created');
      expect(distributionEntry).toBeDefined();
    });

    it('should log distribution status updates', async () => {
      const distribution = await fundService.createDistribution({
        amount: 200,
        type: 'project',
        description: 'Test project',
      });

      await fundService.updateDistributionStatus(distribution.id, 'completed');

      const auditTrail = await fundService.getAuditTrail(1, 100);

      expect(auditTrail.entries.length).toBeGreaterThan(0);
      const statusEntry = auditTrail.entries.find((e) => e.action === 'distribution_completed');
      expect(statusEntry).toBeDefined();
    });

    it('should include timestamp in audit entries', async () => {
      const before = new Date();
      await fundService.addContribution(100, 'test');
      const after = new Date();

      const auditTrail = await fundService.getAuditTrail(1, 100);

      expect(auditTrail.entries.length).toBeGreaterThan(0);
      const entry = auditTrail.entries[0];
      expect(entry.timestamp).toBeDefined();
      expect(entry.timestamp.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(entry.timestamp.getTime()).toBeLessThanOrEqual(after.getTime());
    });
  });

  describe('Fund Analytics', () => {
    it('should get fund analytics', async () => {
      const analytics = await fundService.getAnalytics();

      expect(analytics).toBeDefined();
      expect(analytics.currentBalance).toBeGreaterThanOrEqual(0);
      expect(analytics.totalContributions).toBeGreaterThanOrEqual(0);
      expect(analytics.totalDistributions).toBeGreaterThanOrEqual(0);
      expect(analytics.contributionTrend).toBeDefined();
      expect(analytics.distributionTrend).toBeDefined();
      expect(analytics.topDistributionTypes).toBeDefined();
    });

    it('should get analytics with date range', async () => {
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const endDate = new Date();

      const analytics = await fundService.getAnalytics(startDate, endDate);

      expect(analytics).toBeDefined();
      expect(analytics.currentBalance).toBeGreaterThanOrEqual(0);
    });

    it('should track distribution trends', async () => {
      await fundService.createDistribution({
        amount: 150,
        type: 'scholarship',
        description: 'Trend test',
      });

      const analytics = await fundService.getAnalytics();

      expect(analytics.distributionTrend).toBeDefined();
      expect(Array.isArray(analytics.distributionTrend)).toBe(true);
    });

    it('should track top distribution types', async () => {
      const analytics = await fundService.getAnalytics();

      expect(analytics.topDistributionTypes).toBeDefined();
      expect(Array.isArray(analytics.topDistributionTypes)).toBe(true);
    });
  });

  describe('Distribution Validation', () => {
    it('should validate distribution data', async () => {
      const validation = fundService.validateDistribution({
        amount: 500,
        type: 'scholarship',
        description: 'Valid distribution',
      });

      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should reject invalid distribution type', async () => {
      const validation = fundService.validateDistribution({
        amount: 500,
        type: 'invalid_type' as any,
        description: 'Invalid',
      });

      expect(validation.valid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
    });

    it('should reject missing description', async () => {
      const validation = fundService.validateDistribution({
        amount: 500,
        type: 'scholarship',
        description: '',
      });

      expect(validation.valid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
    });

    it('should reject negative amount', async () => {
      const validation = fundService.validateDistribution({
        amount: -100,
        type: 'scholarship',
        description: 'Negative',
      });

      expect(validation.valid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
    });
  });
});
