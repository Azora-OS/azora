import { DataRetentionManager } from '../data-retention';

describe('DataRetentionManager', () => {
  let manager: DataRetentionManager;

  beforeEach(() => {
    manager = new DataRetentionManager();
  });

  describe('getRetentionPolicy', () => {
    it('should return retention policy for known data type', () => {
      const policy = manager.getRetentionPolicy('user_activity_logs');

      expect(policy).toBeDefined();
      expect(policy?.dataType).toBe('user_activity_logs');
      expect(policy?.retentionDays).toBe(90);
      expect(policy?.autoDelete).toBe(true);
    });

    it('should return undefined for unknown data type', () => {
      const policy = manager.getRetentionPolicy('unknown_type');
      expect(policy).toBeUndefined();
    });

    it('should return correct retention for transaction records', () => {
      const policy = manager.getRetentionPolicy('transaction_records');

      expect(policy?.retentionDays).toBe(2555); // 7 years
      expect(policy?.autoDelete).toBe(false);
    });

    it('should return correct retention for course progress', () => {
      const policy = manager.getRetentionPolicy('course_progress');

      expect(policy?.retentionDays).toBe(1825); // 5 years
      expect(policy?.autoDelete).toBe(false);
    });
  });

  describe('getAllRetentionPolicies', () => {
    it('should return all retention policies', () => {
      const policies = manager.getAllRetentionPolicies();

      expect(Array.isArray(policies)).toBe(true);
      expect(policies.length).toBeGreaterThan(0);
    });

    it('should include essential policies', () => {
      const policies = manager.getAllRetentionPolicies();
      const dataTypes = policies.map(p => p.dataType);

      expect(dataTypes).toContain('user_activity_logs');
      expect(dataTypes).toContain('transaction_records');
      expect(dataTypes).toContain('course_progress');
      expect(dataTypes).toContain('session_data');
      expect(dataTypes).toContain('audit_logs');
    });

    it('should have valid retention days', () => {
      const policies = manager.getAllRetentionPolicies();

      policies.forEach(policy => {
        expect(policy.retentionDays).toBeGreaterThan(0);
        expect(typeof policy.autoDelete).toBe('boolean');
      });
    });
  });

  describe('cleanupExpiredData', () => {
    it('should run cleanup without errors', async () => {
      await expect(manager.cleanupExpiredData()).resolves.not.toThrow();
    });

    it('should handle cleanup for auto-delete policies', async () => {
      const policies = manager.getAllRetentionPolicies();
      const autoDeletePolicies = policies.filter(p => p.autoDelete);

      expect(autoDeletePolicies.length).toBeGreaterThan(0);
      await expect(manager.cleanupExpiredData()).resolves.not.toThrow();
    });
  });

  describe('scheduleCleanup', () => {
    it('should schedule cleanup with default cron', async () => {
      await expect(manager.scheduleCleanup()).resolves.not.toThrow();
    });

    it('should schedule cleanup with custom cron', async () => {
      const customCron = '0 3 * * *'; // 3 AM daily
      await expect(manager.scheduleCleanup(customCron)).resolves.not.toThrow();
    });
  });

  describe('GDPR Compliance', () => {
    it('should comply with GDPR retention requirements', () => {
      const policies = manager.getAllRetentionPolicies();

      // Verify transaction records are retained for 7 years (legal requirement)
      const transactionPolicy = policies.find(p => p.dataType === 'transaction_records');
      expect(transactionPolicy?.retentionDays).toBe(2555); // 7 years

      // Verify audit logs are retained for 7 years
      const auditPolicy = policies.find(p => p.dataType === 'audit_logs');
      expect(auditPolicy?.retentionDays).toBe(2555); // 7 years

      // Verify session data is auto-deleted
      const sessionPolicy = policies.find(p => p.dataType === 'session_data');
      expect(sessionPolicy?.autoDelete).toBe(true);
    });

    it('should have auto-delete enabled for temporary data', () => {
      const policies = manager.getAllRetentionPolicies();

      const temporaryDataTypes = ['user_activity_logs', 'session_data', 'error_logs', 'performance_metrics'];
      temporaryDataTypes.forEach(dataType => {
        const policy = policies.find(p => p.dataType === dataType);
        expect(policy?.autoDelete).toBe(true);
      });
    });
  });
});
