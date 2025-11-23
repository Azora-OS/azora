import { allocationService } from '../services/allocation.service.js';
import { auditService } from '../services/audit.service.js';
import { AppError } from '../middleware/errorHandler.js';

describe('Allocation Service - Revenue Allocation Engine', () => {
  const businessId = '550e8400-e29b-41d4-a716-446655440001';
  const userId = '550e8400-e29b-41d4-a716-446655440003';
  const ipAddress = '192.168.1.1';
  let transactionId: string;

  beforeEach(() => {
    jest.clearAllMocks();
    // Generate unique transaction ID for each test
    transactionId = `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  });

  describe('90/10 Split Calculation', () => {
    it('should create allocation with default 90/10 split', async () => {
      const amount = 1000;
      const allocation = await allocationService.createAllocation(
        transactionId,
        amount,
        90,
        10,
        userId,
        ipAddress,
        businessId
      );

      expect(allocation).toBeDefined();
      expect(allocation.businessOwnerAmount).toBe(900);
      expect(allocation.citadelFundAmount).toBe(100);
      expect(allocation.businessOwnerAmount + allocation.citadelFundAmount).toBe(amount);
    });

    it('should calculate correct amounts for various transaction amounts', async () => {
      const testCases = [
        { amount: 100, expectedBusiness: 90, expectedFund: 10 },
        { amount: 1000, expectedBusiness: 900, expectedFund: 100 },
        { amount: 5000, expectedBusiness: 4500, expectedFund: 500 },
        { amount: 12345.67, expectedBusiness: 11111.103, expectedFund: 1234.567 },
      ];

      for (const testCase of testCases) {
        const allocation = await allocationService.createAllocation(
          `tx_${testCase.amount}`,
          testCase.amount,
          90,
          10,
          userId,
          ipAddress,
          businessId
        );

        expect(allocation.businessOwnerAmount).toBeCloseTo(testCase.expectedBusiness, 2);
        expect(allocation.citadelFundAmount).toBeCloseTo(testCase.expectedFund, 2);
      }
    });

    it('should support custom allocation splits', async () => {
      const amount = 1000;
      const allocation = await allocationService.createAllocation(
        transactionId,
        amount,
        80,
        20,
        userId,
        ipAddress,
        businessId
      );

      expect(allocation.businessOwnerAmount).toBe(800);
      expect(allocation.citadelFundAmount).toBe(200);
    });

    it('should maintain precision for decimal amounts', async () => {
      const amount = 123.45;
      const allocation = await allocationService.createAllocation(
        transactionId,
        amount,
        90,
        10,
        userId,
        ipAddress,
        businessId
      );

      const total = allocation.businessOwnerAmount + allocation.citadelFundAmount;
      expect(total).toBeCloseTo(amount, 2);
    });
  });

  describe('Allocation Transaction Records', () => {
    it('should create allocation transaction record', async () => {
      const amount = 1000;
      const allocation = await allocationService.createAllocation(
        transactionId,
        amount,
        90,
        10,
        userId,
        ipAddress,
        businessId
      );

      expect(allocation.id).toBeDefined();
      expect(allocation.transactionId).toBe(transactionId);
      expect(allocation.allocatedAt).toBeDefined();
      expect(allocation.allocatedAt instanceof Date).toBe(true);
    });

    it('should retrieve allocation by transaction ID', async () => {
      const amount = 1000;
      const uniqueTxId = `tx_retrieve_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const created = await allocationService.createAllocation(
        uniqueTxId,
        amount,
        90,
        10,
        userId,
        ipAddress,
        businessId
      );

      const retrieved = await allocationService.getAllocationByTransaction(uniqueTxId);

      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe(created.id);
      expect(retrieved?.businessOwnerAmount).toBe(900);
      expect(retrieved?.citadelFundAmount).toBe(100);
    });

    it('should return null for non-existent allocation', async () => {
      const fakeTransactionId = '550e8400-e29b-41d4-a716-446655440099';
      const allocation = await allocationService.getAllocationByTransaction(fakeTransactionId);

      expect(allocation).toBeNull();
    });

    it('should store allocation rule for transaction', async () => {
      const amount = 1000;
      await allocationService.createAllocation(
        transactionId,
        amount,
        85,
        15,
        userId,
        ipAddress,
        businessId
      );

      const rule = await allocationService.getAllocationRule(transactionId);

      expect(rule).toBeDefined();
      expect(rule?.businessShare).toBe(85);
      expect(rule?.fundShare).toBe(15);
    });
  });

  describe('Allocation Validation', () => {
    it('should validate that shares add up to 100%', async () => {
      const amount = 1000;

      await expect(
        allocationService.createAllocation(transactionId, amount, 80, 15, userId, ipAddress, businessId)
      ).rejects.toThrow(AppError);
    });

    it('should validate positive amount', async () => {
      await expect(
        allocationService.createAllocation(transactionId, -100, 90, 10, userId, ipAddress, businessId)
      ).rejects.toThrow(AppError);

      await expect(
        allocationService.createAllocation(transactionId, 0, 90, 10, userId, ipAddress, businessId)
      ).rejects.toThrow(AppError);
    });

    it('should validate allocation amounts match transaction', async () => {
      const amount = 1000;
      const businessOwnerAmount = 900;
      const citadelFundAmount = 100;

      const validation = allocationService.validateAllocation(
        amount,
        businessOwnerAmount,
        citadelFundAmount
      );

      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should detect mismatched allocation amounts', async () => {
      const amount = 1000;
      const businessOwnerAmount = 800;
      const citadelFundAmount = 100;

      const validation = allocationService.validateAllocation(
        amount,
        businessOwnerAmount,
        citadelFundAmount
      );

      expect(validation.valid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
    });

    it('should detect negative allocated amounts', async () => {
      const amount = 1000;
      const businessOwnerAmount = -900;
      const citadelFundAmount = 100;

      const validation = allocationService.validateAllocation(
        amount,
        businessOwnerAmount,
        citadelFundAmount
      );

      expect(validation.valid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
    });

    it('should validate allocation rule shares', async () => {
      await expect(
        allocationService.updateAllocationRule(businessId, 150, -50, userId, ipAddress)
      ).rejects.toThrow(AppError);

      await expect(
        allocationService.updateAllocationRule(businessId, 50, 60, userId, ipAddress)
      ).rejects.toThrow(AppError);
    });
  });

  describe('Allocation Audit Logging', () => {
    it('should log allocation creation', async () => {
      const amount = 1000;
      const allocation = await allocationService.createAllocation(
        transactionId,
        amount,
        90,
        10,
        userId,
        ipAddress,
        businessId
      );

      const auditTrail = await allocationService.getAllocationAuditTrail(allocation.id);

      expect(auditTrail).toBeDefined();
      expect(auditTrail.length).toBeGreaterThan(0);
      expect(auditTrail[0].action).toBe('allocation_created');
      expect(auditTrail[0].userId).toBe(userId);
      expect(auditTrail[0].ipAddress).toBe(ipAddress);
    });

    it('should log allocation rule updates', async () => {
      const ruleKey = `business_${businessId}`;
      await allocationService.updateAllocationRule(businessId, 85, 15, userId, ipAddress);

      const auditTrail = await allocationService.getAllocationAuditTrail(ruleKey);

      expect(auditTrail).toBeDefined();
      expect(auditTrail.length).toBeGreaterThan(0);
      expect(auditTrail[0].action).toBe('allocation_rule_updated');
      expect(auditTrail[0].details).toContain('85%');
      expect(auditTrail[0].details).toContain('15%');
    });

    it('should log allocation recalculation', async () => {
      const testBusinessId = `recalc_test_${Date.now()}`;
      const tx1 = `tx_recalc_1_${Date.now()}`;
      const tx2 = `tx_recalc_2_${Date.now()}`;
      
      // Create initial allocations
      await allocationService.createAllocation(
        tx1,
        1000,
        90,
        10,
        userId,
        ipAddress,
        testBusinessId
      );
      await allocationService.createAllocation(
        tx2,
        2000,
        90,
        10,
        userId,
        ipAddress,
        testBusinessId
      );

      // Recalculate with new shares
      const result = await allocationService.recalculateAllocations(
        testBusinessId,
        80,
        20,
        userId,
        ipAddress
      );

      const ruleKey = `recalc_${testBusinessId}`;
      const auditTrail = await allocationService.getAllocationAuditTrail(ruleKey);

      expect(auditTrail).toBeDefined();
      expect(auditTrail.length).toBeGreaterThan(0);
      expect(auditTrail[0].action).toBe('allocation_recalculated');
      expect(auditTrail[0].details).toContain('2 allocations');
    });

    it('should include timestamp in audit trail', async () => {
      const before = new Date();
      const allocation = await allocationService.createAllocation(
        transactionId,
        1000,
        90,
        10,
        userId,
        ipAddress,
        businessId
      );
      const after = new Date();

      const auditTrail = await allocationService.getAllocationAuditTrail(allocation.id);

      expect(auditTrail[0].timestamp.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(auditTrail[0].timestamp.getTime()).toBeLessThanOrEqual(after.getTime());
    });

    it('should track user and IP in audit trail', async () => {
      const testUserId = 'test-user-123';
      const testIpAddress = '10.0.0.1';

      const allocation = await allocationService.createAllocation(
        transactionId,
        1000,
        90,
        10,
        testUserId,
        testIpAddress,
        businessId
      );

      const auditTrail = await allocationService.getAllocationAuditTrail(allocation.id);

      expect(auditTrail[0].userId).toBe(testUserId);
      expect(auditTrail[0].ipAddress).toBe(testIpAddress);
    });

    it('should export allocation audit trail as CSV', async () => {
      const allocation = await allocationService.createAllocation(
        transactionId,
        1000,
        90,
        10,
        userId,
        ipAddress,
        businessId
      );

      const csv = await allocationService.exportAllocationAuditTrailAsCSV(allocation.id);

      expect(csv).toBeDefined();
      expect(csv).toContain('Timestamp');
      expect(csv).toContain('Action');
      expect(csv).toContain('allocation_created');
      expect(csv).toContain(userId);
      expect(csv).toContain(ipAddress);
    });

    it('should retrieve all allocation audit trails', async () => {
      const allocation1 = await allocationService.createAllocation(
        `tx_1`,
        1000,
        90,
        10,
        userId,
        ipAddress,
        businessId
      );
      const allocation2 = await allocationService.createAllocation(
        `tx_2`,
        2000,
        90,
        10,
        userId,
        ipAddress,
        businessId
      );

      const allTrails = await allocationService.getAllAllocationAuditTrails();

      expect(Object.keys(allTrails).length).toBeGreaterThanOrEqual(2);
      expect(allTrails[allocation1.id]).toBeDefined();
      expect(allTrails[allocation2.id]).toBeDefined();
    });
  });

  describe('Allocation Calculations', () => {
    it('should calculate total allocations correctly', async () => {
      const testBusinessId = '550e8400-e29b-41d4-a716-446655440010';
      await allocationService.createAllocation(`tx_1`, 1000, 90, 10, userId, ipAddress, testBusinessId);
      await allocationService.createAllocation(`tx_2`, 2000, 90, 10, userId, ipAddress, testBusinessId);
      await allocationService.createAllocation(`tx_3`, 500, 90, 10, userId, ipAddress, testBusinessId);

      const totals = await allocationService.calculateTotalAllocations(testBusinessId);

      expect(totals.totalRevenue).toBe(3500);
      expect(totals.businessOwnerTotal).toBe(3150);
      expect(totals.citadelFundTotal).toBe(350);
      expect(totals.allocationCount).toBe(3);
    });

    it('should get allocation breakdown by period', async () => {
      const testBusinessId = '550e8400-e29b-41d4-a716-446655440011';
      const now = new Date();
      const startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000); // yesterday
      const endDate = new Date(now.getTime() + 24 * 60 * 60 * 1000); // tomorrow

      await allocationService.createAllocation(`tx_1`, 1000, 90, 10, userId, ipAddress, testBusinessId);
      await allocationService.createAllocation(`tx_2`, 2000, 90, 10, userId, ipAddress, testBusinessId);

      const breakdown = await allocationService.getAllocationBreakdown(testBusinessId, startDate, endDate);

      expect(breakdown.totalRevenue).toBeGreaterThan(0);
      expect(breakdown.businessOwnerShare).toBeCloseTo(breakdown.totalRevenue * 0.9, 1);
      expect(breakdown.citadelFundShare).toBeCloseTo(breakdown.totalRevenue * 0.1, 1);
      expect(breakdown.businessOwnerPercentage).toBeCloseTo(90, 1);
      expect(breakdown.citadelFundPercentage).toBeCloseTo(10, 1);
    });

    it('should get allocation statistics', async () => {
      const testBusinessId = '550e8400-e29b-41d4-a716-446655440012';
      const tx1 = `tx_stats_1_${Date.now()}`;
      const tx2 = `tx_stats_2_${Date.now()}`;
      const tx3 = `tx_stats_3_${Date.now()}`;
      
      await allocationService.createAllocation(tx1, 1000, 90, 10, userId, ipAddress, testBusinessId);
      await allocationService.createAllocation(tx2, 2000, 90, 10, userId, ipAddress, testBusinessId);
      await allocationService.createAllocation(tx3, 500, 90, 10, userId, ipAddress, testBusinessId);

      const stats = await allocationService.getAllocationStats(testBusinessId);

      expect(stats.totalAllocations).toBe(3);
      expect(stats.largestAllocation).toBe(2000);
      expect(stats.smallestAllocation).toBe(500);
      expect(stats.averageAllocation).toBeCloseTo(1166.67, 1);
      // Total revenue is 3500, so business owner gets 3150 (90%) and fund gets 350 (10%)
      expect(stats.totalBusinessOwnerAmount).toBe(3150);
      expect(stats.totalCitadelFundAmount).toBe(350);
      expect(stats.averageBusinessShare).toBeCloseTo(90, 1);
      expect(stats.averageFundShare).toBeCloseTo(10, 1);
    });

    it('should return zero statistics for business with no allocations', async () => {
      const stats = await allocationService.getAllocationStats('non-existent-business');

      expect(stats.totalAllocations).toBe(0);
      expect(stats.averageAllocation).toBe(0);
      expect(stats.largestAllocation).toBe(0);
      expect(stats.smallestAllocation).toBe(0);
    });
  });

  describe('Allocation Recalculation', () => {
    it('should recalculate allocations with new shares', async () => {
      const testBusinessId = '550e8400-e29b-41d4-a716-446655440013';
      await allocationService.createAllocation(`tx_1`, 1000, 90, 10, userId, ipAddress, testBusinessId);
      await allocationService.createAllocation(`tx_2`, 2000, 90, 10, userId, ipAddress, testBusinessId);

      const result = await allocationService.recalculateAllocations(
        testBusinessId,
        80,
        20,
        userId,
        ipAddress
      );

      expect(result.recalculated).toBe(2);
      expect(result.totalNewBusinessOwnerAmount).toBe(2400); // (1000 + 2000) * 0.8
      expect(result.totalNewCitadelFundAmount).toBe(600); // (1000 + 2000) * 0.2
    });

    it('should validate new shares during recalculation', async () => {
      const testBusinessId = '550e8400-e29b-41d4-a716-446655440014';
      await expect(
        allocationService.recalculateAllocations(testBusinessId, 70, 40, userId, ipAddress)
      ).rejects.toThrow(AppError);
    });

    it('should maintain total amount during recalculation', async () => {
      const testBusinessId = '550e8400-e29b-41d4-a716-446655440015';
      const amount1 = 1000;
      const amount2 = 2000;

      await allocationService.createAllocation(`tx_1`, amount1, 90, 10, userId, ipAddress, testBusinessId);
      await allocationService.createAllocation(`tx_2`, amount2, 90, 10, userId, ipAddress, testBusinessId);

      const result = await allocationService.recalculateAllocations(
        testBusinessId,
        75,
        25,
        userId,
        ipAddress
      );

      const totalBefore = amount1 + amount2;
      const totalAfter = result.totalNewBusinessOwnerAmount + result.totalNewCitadelFundAmount;

      expect(totalAfter).toBeCloseTo(totalBefore, 2);
    });
  });

  describe('Allocation Rule Management', () => {
    it('should update allocation rule', async () => {
      const rule = await allocationService.updateAllocationRule(
        businessId,
        85,
        15,
        userId,
        ipAddress
      );

      expect(rule.businessShare).toBe(85);
      expect(rule.fundShare).toBe(15);
    });

    it('should retrieve allocation rule', async () => {
      await allocationService.updateAllocationRule(businessId, 80, 20, userId, ipAddress);

      const ruleKey = `business_${businessId}`;
      const rule = await allocationService.getAllocationRule(ruleKey);

      expect(rule).toBeDefined();
      expect(rule?.businessShare).toBe(80);
      expect(rule?.fundShare).toBe(20);
    });

    it('should validate rule shares add up to 100%', async () => {
      await expect(
        allocationService.updateAllocationRule(businessId, 80, 25, userId, ipAddress)
      ).rejects.toThrow(AppError);
    });

    it('should validate rule shares are within valid range', async () => {
      await expect(
        allocationService.updateAllocationRule(businessId, 150, -50, userId, ipAddress)
      ).rejects.toThrow(AppError);
    });
  });

  describe('Allocation Accuracy and Precision', () => {
    it('should maintain accuracy across multiple allocations', async () => {
      const testBusinessId = '550e8400-e29b-41d4-a716-446655440016';
      const amounts = [100, 250, 1000, 5000, 12345.67];

      for (let i = 0; i < amounts.length; i++) {
        await allocationService.createAllocation(
          `tx_${i}`,
          amounts[i],
          90,
          10,
          userId,
          ipAddress,
          testBusinessId
        );
      }

      const totals = await allocationService.calculateTotalAllocations(testBusinessId);
      const expectedTotal = amounts.reduce((a, b) => a + b, 0);

      expect(totals.totalRevenue).toBeCloseTo(expectedTotal, 2);
      expect(totals.businessOwnerTotal).toBeCloseTo(expectedTotal * 0.9, 2);
      expect(totals.citadelFundTotal).toBeCloseTo(expectedTotal * 0.1, 2);
    });

    it('should handle very small amounts', async () => {
      const amount = 0.01;
      const allocation = await allocationService.createAllocation(
        transactionId,
        amount,
        90,
        10,
        userId,
        ipAddress,
        businessId
      );

      expect(allocation.businessOwnerAmount).toBeCloseTo(0.009, 3);
      expect(allocation.citadelFundAmount).toBeCloseTo(0.001, 3);
    });

    it('should handle very large amounts', async () => {
      const amount = 999999999.99;
      const allocation = await allocationService.createAllocation(
        transactionId,
        amount,
        90,
        10,
        userId,
        ipAddress,
        businessId
      );

      expect(allocation.businessOwnerAmount).toBeCloseTo(amount * 0.9, 2);
      expect(allocation.citadelFundAmount).toBeCloseTo(amount * 0.1, 2);
    });
  });
});
