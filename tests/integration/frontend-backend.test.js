const AzoraAPIClient = require('../../packages/shared-api/client');

const client = new AzoraAPIClient('http://localhost:4000/api');

describe('Frontend-Backend Integration', () => {
  let testUserId;
  let testCourseId;

  beforeAll(() => {
    testUserId = 'test-user-' + Date.now();
    testCourseId = 'course-101';
  });

  describe('Student Portal Integration', () => {
    test('Can fetch courses', async () => {
      const courses = await client.education.getCourses();
      expect(Array.isArray(courses)).toBe(true);
    });

    test('Can enroll in course', async () => {
      const result = await client.education.enroll(testCourseId, testUserId);
      expect(result.success).toBe(true);
    });

    test('Can track progress', async () => {
      const progress = await client.education.getProgress(testUserId);
      expect(progress).toBeDefined();
    });

    test('Can create wallet', async () => {
      const wallet = await client.mint.createWallet(testUserId);
      expect(wallet.address).toBeDefined();
      expect(wallet.balance).toBeGreaterThanOrEqual(0);
    });

    test('Can chat with AI', async () => {
      const response = await client.ai.chat('themba', 'Hello!');
      expect(response.character).toBe('themba');
      expect(response.message).toBeTruthy();
    });
  });

  describe('Marketplace Integration', () => {
    test('Can fetch jobs', async () => {
      const jobs = await client.forge.getJobs();
      expect(Array.isArray(jobs)).toBe(true);
    });

    test('Can apply to job', async () => {
      const jobs = await client.forge.getJobs();
      if (jobs.length > 0) {
        const result = await client.forge.apply(jobs[0].id, testUserId, {
          coverLetter: 'Test application'
        });
        expect(result).toBeDefined();
      }
    });
  });

  describe('Payment Integration', () => {
    test('Can create payment intent', async () => {
      const intent = await client.payment.createIntent(100, 'usd', testUserId);
      expect(intent.clientSecret).toBeDefined();
    });
  });

  describe('Analytics Integration', () => {
    test('Can track events', async () => {
      const response = await fetch('http://localhost:3012/api/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'frontend_test',
          userId: testUserId,
          data: { test: true }
        })
      });
      
      const result = await response.json();
      expect(result.tracked).toBe(true);
    });

    test('Can fetch dashboard', async () => {
      const response = await fetch('http://localhost:3012/api/analytics/dashboard');
      const dashboard = await response.json();
      expect(dashboard.totalEvents).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Monitoring Integration', () => {
    test('Can check service status', async () => {
      const response = await fetch('http://localhost:3013/api/services/status');
      const services = await response.json();
      expect(Array.isArray(services)).toBe(true);
      expect(services.length).toBeGreaterThan(0);
    });
  });
});
