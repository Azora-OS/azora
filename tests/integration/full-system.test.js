const AzoraAPIClient = require('../../packages/shared-api/client');

const client = new AzoraAPIClient('http://localhost:4000/api');

describe('Azora OS Integration Tests', () => {
  let testUserId;
  let testWalletAddress;
  let testCourseId;

  test('Health checks pass for all services', async () => {
    const response = await fetch('http://localhost:3013/api/services/status');
    const services = await response.json();
    
    services.forEach(service => {
      expect(service.status).toBe('healthy');
    });
  });

  test('User can enroll in course', async () => {
    testUserId = 'test-user-' + Date.now();
    testCourseId = 'course-101';
    
    const result = await client.education.enroll(testCourseId, testUserId);
    expect(result.success).toBe(true);
  });

  test('User receives AZR tokens for enrollment', async () => {
    const wallet = await client.mint.createWallet(testUserId);
    testWalletAddress = wallet.address;
    
    expect(wallet.balance).toBeGreaterThan(0);
  });

  test('AI Family responds to chat', async () => {
    const response = await client.ai.chat('themba', 'Hello!');
    
    expect(response.character).toBe('themba');
    expect(response.message).toBeTruthy();
  });

  test('Analytics tracks events', async () => {
    const response = await fetch('http://localhost:3012/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'test_event',
        userId: testUserId,
        data: { test: true }
      })
    });
    
    const result = await response.json();
    expect(result.tracked).toBe(true);
  });

  test('Monitoring service reports metrics', async () => {
    const response = await fetch('http://localhost:3013/metrics');
    const metrics = await response.text();
    
    expect(metrics).toContain('service_health_status');
  });
});
