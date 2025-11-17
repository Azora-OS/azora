const shieldService = require('../index');

describe('Shield Service', () => {
  beforeEach(() => {
    // Clear data before each test
    shieldService.threats = [];
    shieldService.securityEvents = [];
    shieldService.blockedIPs.clear();
    shieldService.rateLimits.clear();
  });

  test('should detect SQL injection threats', () => {
    const req = {
      ip: '192.168.1.100',
      method: 'GET',
      url: '/api/users',
      query: { id: "1'; DROP TABLE users;" },
      body: {},
      headers: {},
      get: () => null
    };

    const analysis = shieldService.analyzeRequest(req);

    expect(analysis.threats.length).toBeGreaterThan(0);
    expect(analysis.threats.some(t => t.type === 'SQL_INJECTION')).toBe(true);
    expect(analysis.riskScore).toBeGreaterThan(0);
  });

  test('should detect XSS threats', () => {
    const req = {
      ip: '192.168.1.100',
      method: 'POST',
      url: '/api/comments',
      query: {},
      body: { comment: '<script>alert("xss")</script>' },
      headers: {},
      get: () => null
    };

    const analysis = shieldService.analyzeRequest(req);

    expect(analysis.threats.length).toBeGreaterThan(0);
    expect(analysis.threats.some(t => t.type === 'XSS')).toBe(true);
    expect(analysis.riskScore).toBeGreaterThan(0);
  });

  test('should detect path traversal threats', () => {
    const req = {
      ip: '192.168.1.100',
      method: 'GET',
      url: '/api/files/../../../etc/passwd',
      query: {},
      body: {},
      headers: {},
      get: () => null
    };

    const analysis = shieldService.analyzeRequest(req);

    expect(analysis.threats.length).toBeGreaterThan(0);
    expect(analysis.threats.some(t => t.type === 'PATH_TRAVERSAL')).toBe(true);
  });

  test('should enforce rate limiting', () => {
    const req = {
      ip: '192.168.1.200',
      method: 'GET',
      url: '/api/data',
      query: {},
      body: {},
      headers: {},
      get: () => null
    };

    // Make many requests to trigger rate limiting
    for (let i = 0; i < 150; i++) {
      shieldService.analyzeRequest(req);
    }

    // Check if IP is blocked
    const isBlocked = shieldService.isIPBlocked('192.168.1.200');
    expect(isBlocked).toBe(true);
  });

  test('should block and unblock IP addresses', () => {
    const ip = '192.168.1.150';

    // Initially not blocked
    expect(shieldService.isIPBlocked(ip)).toBe(false);

    // Block IP
    shieldService.blockIP(ip);
    expect(shieldService.isIPBlocked(ip)).toBe(true);

    // Unblock IP
    shieldService.unblockIP(ip);
    expect(shieldService.isIPBlocked(ip)).toBe(false);
  });

  test('should calculate risk scores correctly', () => {
    const lowRiskReq = {
      ip: '192.168.1.100',
      method: 'GET',
      url: '/api/users',
      query: { id: 'normal-user-id' },
      body: {},
      headers: {},
      get: () => null
    };

    const highRiskReq = {
      ip: '192.168.1.101',
      method: 'GET',
      url: '/api/users',
      query: { id: "1'; DROP TABLE users;" },
      body: {},
      headers: {},
      get: () => null
    };

    const lowRiskAnalysis = shieldService.analyzeRequest(lowRiskReq);
    const highRiskAnalysis = shieldService.analyzeRequest(highRiskReq);

    expect(lowRiskAnalysis.riskScore).toBeLessThan(highRiskAnalysis.riskScore);
  });

  test('should filter security events', () => {
    // Generate some test events
    const req1 = {
      ip: '192.168.1.100',
      method: 'GET',
      url: '/api/users',
      query: { id: "1'; DROP TABLE users;" },
      body: {},
      headers: {},
      get: () => null
    };

    const req2 = {
      ip: '192.168.1.101',
      method: 'POST',
      url: '/api/comments',
      query: {},
      body: { comment: '<script>alert("xss")</script>' },
      headers: {},
      get: () => null
    };

    shieldService.analyzeRequest(req1);
    shieldService.analyzeRequest(req2);

    // Filter by IP
    const eventsByIP = shieldService.getSecurityEvents({ ip: '192.168.1.100' });
    expect(eventsByIP.events.length).toBe(1);
    expect(eventsByIP.events[0].ip).toBe('192.168.1.100');

    // Filter by minimum risk score
    const highRiskEvents = shieldService.getSecurityEvents({ minRiskScore: 5 });
    expect(highRiskEvents.events.length).toBe(2);
  });

  test('should generate threat statistics', () => {
    // Generate some test events
    const req1 = {
      ip: '192.168.1.100',
      method: 'GET',
      url: '/api/users',
      query: { id: "1'; DROP TABLE users;" },
      body: {},
      headers: {},
      get: () => null
    };

    const req2 = {
      ip: '192.168.1.101',
      method: 'POST',
      url: '/api/comments',
      query: {},
      body: { comment: '<script>alert("xss")</script>' },
      headers: {},
      get: () => null
    };

    shieldService.analyzeRequest(req1);
    shieldService.analyzeRequest(req2);

    const stats = shieldService.getThreatStats();

    expect(stats.totalEvents).toBe(2);
    expect(stats.totalThreats).toBe(2);
    expect(Object.keys(stats.threatTypes).length).toBeGreaterThan(0);
  });

  test('should clear old events', () => {
    // Generate some test events
    const req = {
      ip: '192.168.1.100',
      method: 'GET',
      url: '/api/users',
      query: { id: 'normal-id' },
      body: {},
      headers: {},
      get: () => null
    };

    shieldService.analyzeRequest(req);

    expect(shieldService.securityEvents.length).toBe(1);

    // Clear old events
    const removedCount = shieldService.clearOldEvents(0); // Clear all events

    expect(removedCount).toBe(1);
    expect(shieldService.securityEvents.length).toBe(0);
  });
});
