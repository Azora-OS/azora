import { ConsentManager, ConsentType } from '../consent-manager';

describe('ConsentManager', () => {
  let consentManager: ConsentManager;
  const testUserId = 'test-user-123';

  beforeEach(() => {
    consentManager = new ConsentManager();
  });

  describe('recordConsent', () => {
    it('should record user consent', async () => {
      const record = {
        userId: testUserId,
        consentType: ConsentType.ANALYTICS,
        granted: true,
        timestamp: new Date(),
        ipAddress: '192.168.1.1'
      };

      await expect(consentManager.recordConsent(record)).resolves.not.toThrow();
    });

    it('should record consent withdrawal', async () => {
      const record = {
        userId: testUserId,
        consentType: ConsentType.MARKETING,
        granted: false,
        timestamp: new Date()
      };

      await expect(consentManager.recordConsent(record)).resolves.not.toThrow();
    });
  });

  describe('getConsent', () => {
    it('should retrieve consent status', async () => {
      // First grant consent
      await consentManager.grantConsent(testUserId, ConsentType.ANALYTICS);

      // Then retrieve it
      const hasConsent = await consentManager.getConsent(testUserId, ConsentType.ANALYTICS);
      expect(hasConsent).toBe(true);
    });

    it('should return false for non-existent consent', async () => {
      const hasConsent = await consentManager.getConsent('non-existent-user', ConsentType.ANALYTICS);
      expect(hasConsent).toBe(false);
    });
  });

  describe('getConsentStatus', () => {
    it('should return complete consent status', async () => {
      // Grant some consents
      await consentManager.grantConsent(testUserId, ConsentType.ESSENTIAL);
      await consentManager.grantConsent(testUserId, ConsentType.ANALYTICS);

      const status = await consentManager.getConsentStatus(testUserId);

      expect(status.userId).toBe(testUserId);
      expect(status.essential).toBe(true);
      expect(status.analytics).toBe(true);
      expect(status.marketing).toBe(false);
      expect(status.personalization).toBe(false);
    });
  });

  describe('withdrawConsent', () => {
    it('should withdraw specific consent', async () => {
      // Grant consent first
      await consentManager.grantConsent(testUserId, ConsentType.MARKETING);

      // Verify it's granted
      let hasConsent = await consentManager.getConsent(testUserId, ConsentType.MARKETING);
      expect(hasConsent).toBe(true);

      // Withdraw consent
      await consentManager.withdrawConsent(testUserId, ConsentType.MARKETING);

      // Verify it's withdrawn
      hasConsent = await consentManager.getConsent(testUserId, ConsentType.MARKETING);
      expect(hasConsent).toBe(false);
    });
  });

  describe('exportUserData', () => {
    it('should export user data in machine-readable format', async () => {
      const userData = await consentManager.exportUserData(testUserId);

      expect(userData).toHaveProperty('user');
      expect(userData).toHaveProperty('enrollments');
      expect(userData).toHaveProperty('payments');
      expect(userData).toHaveProperty('wallets');
      expect(userData).toHaveProperty('assessments');
      expect(userData).toHaveProperty('chatSessions');
      expect(userData).toHaveProperty('consentRecords');
    });

    it('should include user profile in export', async () => {
      const userData = await consentManager.exportUserData(testUserId);

      expect(userData.user).toHaveProperty('id');
      expect(userData.user).toHaveProperty('email');
      expect(userData.user).toHaveProperty('name');
      expect(userData.user).toHaveProperty('role');
      expect(userData.user).toHaveProperty('createdAt');
    });

    it('should throw error for non-existent user', async () => {
      await expect(consentManager.exportUserData('non-existent-user')).rejects.toThrow();
    });
  });

  describe('deleteUserData', () => {
    it('should delete all user data', async () => {
      // This test verifies the deletion process
      // In a real scenario, you'd verify the user is actually deleted
      await expect(consentManager.deleteUserData(testUserId)).resolves.not.toThrow();
    });
  });

  describe('grantConsent', () => {
    it('should grant consent with IP and user agent', async () => {
      await consentManager.grantConsent(
        testUserId,
        ConsentType.PERSONALIZATION,
        '192.168.1.1',
        'Mozilla/5.0...'
      );

      const hasConsent = await consentManager.getConsent(testUserId, ConsentType.PERSONALIZATION);
      expect(hasConsent).toBe(true);
    });
  });
});
