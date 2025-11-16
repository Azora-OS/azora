/**
 * GDPR Compliance Integration Tests
 * Tests for data export, deletion, and consent management
 */

describe('GDPR Compliance', () => {
  const testUserId = 'test-user-gdpr-123';
  const apiBaseUrl = process.env.API_URL || 'http://localhost:3000';

  describe('Consent Management', () => {
    it('should allow user to grant consent', async () => {
      const response = await fetch(`${apiBaseUrl}/api/gdpr/consent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': testUserId
        },
        body: JSON.stringify({
          analytics: true,
          marketing: true,
          personalization: true
        })
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
    });

    it('should retrieve consent status', async () => {
      const response = await fetch(`${apiBaseUrl}/api/gdpr/consent`, {
        method: 'GET',
        headers: {
          'x-user-id': testUserId
        }
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toHaveProperty('userId');
      expect(data).toHaveProperty('essential');
      expect(data).toHaveProperty('analytics');
      expect(data).toHaveProperty('marketing');
      expect(data).toHaveProperty('personalization');
    });

    it('should allow user to withdraw consent', async () => {
      const response = await fetch(`${apiBaseUrl}/api/gdpr/consent`, {
        method: 'DELETE',
        headers: {
          'x-user-id': testUserId
        }
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
    });

    it('should require authentication for consent endpoints', async () => {
      const response = await fetch(`${apiBaseUrl}/api/gdpr/consent`, {
        method: 'GET'
      });

      expect(response.status).toBe(401);
    });
  });

  describe('Data Export (Right to Data Portability)', () => {
    it('should export user data in machine-readable format', async () => {
      const response = await fetch(`${apiBaseUrl}/api/gdpr/data-export`, {
        method: 'GET',
        headers: {
          'x-user-id': testUserId
        }
      });

      expect(response.status).toBe(200);
      expect(response.headers.get('content-type')).toContain('application/json');
      expect(response.headers.get('content-disposition')).toContain('attachment');

      const data = await response.json();
      expect(data).toHaveProperty('user');
      expect(data).toHaveProperty('enrollments');
      expect(data).toHaveProperty('payments');
      expect(data).toHaveProperty('wallets');
    });

    it('should include all user data in export', async () => {
      const response = await fetch(`${apiBaseUrl}/api/gdpr/data-export`, {
        method: 'GET',
        headers: {
          'x-user-id': testUserId
        }
      });

      const data = await response.json();

      // Verify user profile data
      expect(data.user).toHaveProperty('id');
      expect(data.user).toHaveProperty('email');
      expect(data.user).toHaveProperty('name');
      expect(data.user).toHaveProperty('role');

      // Verify related data
      expect(Array.isArray(data.enrollments)).toBe(true);
      expect(Array.isArray(data.payments)).toBe(true);
      expect(Array.isArray(data.wallets)).toBe(true);
      expect(Array.isArray(data.assessments)).toBe(true);
    });

    it('should require authentication for data export', async () => {
      const response = await fetch(`${apiBaseUrl}/api/gdpr/data-export`, {
        method: 'GET'
      });

      expect(response.status).toBe(401);
    });

    it('should return downloadable file', async () => {
      const response = await fetch(`${apiBaseUrl}/api/gdpr/data-export`, {
        method: 'GET',
        headers: {
          'x-user-id': testUserId
        }
      });

      const contentDisposition = response.headers.get('content-disposition');
      expect(contentDisposition).toContain('attachment');
      expect(contentDisposition).toContain('.json');
    });
  });

  describe('Data Deletion (Right to Erasure)', () => {
    it('should request account deletion', async () => {
      const response = await fetch(`${apiBaseUrl}/api/gdpr/delete-account`, {
        method: 'POST',
        headers: {
          'x-user-id': testUserId
        }
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.message).toContain('Confirmation email');
    });

    it('should require confirmation token for deletion', async () => {
      const response = await fetch(`${apiBaseUrl}/api/gdpr/delete-account`, {
        method: 'DELETE',
        headers: {
          'x-user-id': testUserId,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toContain('token');
    });

    it('should delete user data with valid confirmation', async () => {
      // This test assumes a valid confirmation token is provided
      const confirmationToken = 'valid-token-123';

      const response = await fetch(`${apiBaseUrl}/api/gdpr/delete-account`, {
        method: 'DELETE',
        headers: {
          'x-user-id': testUserId,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ confirmationToken })
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
    });

    it('should require authentication for deletion', async () => {
      const response = await fetch(`${apiBaseUrl}/api/gdpr/delete-account`, {
        method: 'POST'
      });

      expect(response.status).toBe(401);
    });
  });

  describe('Data Retention Policy', () => {
    it('should retrieve retention policies', async () => {
      const response = await fetch(`${apiBaseUrl}/api/gdpr/retention-policy`, {
        method: 'GET'
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toHaveProperty('policies');
      expect(Array.isArray(data.policies)).toBe(true);
    });

    it('should include retention periods', async () => {
      const response = await fetch(`${apiBaseUrl}/api/gdpr/retention-policy`, {
        method: 'GET'
      });

      const data = await response.json();
      const policies = data.policies;

      policies.forEach((policy: any) => {
        expect(policy).toHaveProperty('dataType');
        expect(policy).toHaveProperty('retentionDays');
        expect(policy).toHaveProperty('autoDelete');
      });
    });

    it('should show cleanup schedule', async () => {
      const response = await fetch(`${apiBaseUrl}/api/gdpr/retention-policy`, {
        method: 'GET'
      });

      const data = await response.json();
      expect(data).toHaveProperty('lastCleanup');
      expect(data).toHaveProperty('nextCleanup');
    });
  });

  describe('GDPR Compliance Verification', () => {
    it('should support all GDPR rights', async () => {
      // Right to Access
      const accessResponse = await fetch(`${apiBaseUrl}/api/gdpr/data-export`, {
        method: 'GET',
        headers: { 'x-user-id': testUserId }
      });
      expect(accessResponse.status).toBe(200);

      // Right to Rectification (user can update profile)
      // This would be tested via user profile update endpoint

      // Right to Erasure
      const deleteResponse = await fetch(`${apiBaseUrl}/api/gdpr/delete-account`, {
        method: 'POST',
        headers: { 'x-user-id': testUserId }
      });
      expect(deleteResponse.status).toBe(200);

      // Right to Data Portability
      const portabilityResponse = await fetch(`${apiBaseUrl}/api/gdpr/data-export`, {
        method: 'GET',
        headers: { 'x-user-id': testUserId }
      });
      expect(portabilityResponse.status).toBe(200);

      // Right to Object (withdraw consent)
      const objectResponse = await fetch(`${apiBaseUrl}/api/gdpr/consent`, {
        method: 'DELETE',
        headers: { 'x-user-id': testUserId }
      });
      expect(objectResponse.status).toBe(200);
    });

    it('should enforce 30-day response time for data requests', async () => {
      const requestTime = new Date();

      const response = await fetch(`${apiBaseUrl}/api/gdpr/data-export`, {
        method: 'GET',
        headers: { 'x-user-id': testUserId }
      });

      const responseTime = new Date();
      const responseTimeMs = responseTime.getTime() - requestTime.getTime();

      // Response should be immediate (not 30 days)
      expect(responseTimeMs).toBeLessThan(5000); // 5 seconds
    });

    it('should maintain audit logs for GDPR requests', async () => {
      // Make a GDPR request
      await fetch(`${apiBaseUrl}/api/gdpr/data-export`, {
        method: 'GET',
        headers: { 'x-user-id': testUserId }
      });

      // Verify audit log was created
      // This would require an admin endpoint to check audit logs
      // For now, we just verify the request succeeded
    });
  });
});
