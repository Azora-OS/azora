const auditService = require('../index');

describe('Audit Logging Service', () => {
  beforeEach(() => {
    // Clear audit logs before each test
    auditService.auditLogs = [];
  });

  test('should log security events', () => {
    const userId = 'user123';
    const action = 'login_success';
    const resource = 'auth_service';
    const details = { ipAddress: '192.168.1.1' };

    const auditEntry = auditService.logSecurityEvent(userId, action, resource, details);

    expect(auditEntry).toBeDefined();
    expect(auditEntry.type).toBe('security');
    expect(auditEntry.userId).toBe(userId);
    expect(auditEntry.action).toBe(action);
    expect(auditEntry.resource).toBe(resource);
    expect(auditEntry.details).toEqual(details);
    expect(auditEntry.severity).toBe('medium');
  });

  test('should log user actions', () => {
    const userId = 'user123';
    const action = 'course_enrollment';
    const resource = 'course_algebra_101';
    const details = { enrollmentId: 'enroll789' };

    const auditEntry = auditService.logUserAction(userId, action, resource, details);

    expect(auditEntry).toBeDefined();
    expect(auditEntry.type).toBe('user_action');
    expect(auditEntry.userId).toBe(userId);
    expect(auditEntry.action).toBe(action);
    expect(auditEntry.resource).toBe(resource);
    expect(auditEntry.details).toEqual(details);
  });

  test('should log system events', () => {
    const service = 'payment_service';
    const action = 'startup';
    const details = { version: '1.2.3' };

    const auditEntry = auditService.logSystemEvent(service, action, details);

    expect(auditEntry).toBeDefined();
    expect(auditEntry.type).toBe('system');
    expect(auditEntry.service).toBe(service);
    expect(auditEntry.action).toBe(action);
    expect(auditEntry.details).toEqual(details);
  });

  test('should log data access events', () => {
    const userId = 'user123';
    const action = 'read';
    const resource = 'user_profile_456';
    const details = { fields: ['name', 'email'] };

    const auditEntry = auditService.logDataAccess(userId, action, resource, details);

    expect(auditEntry).toBeDefined();
    expect(auditEntry.type).toBe('data_access');
    expect(auditEntry.userId).toBe(userId);
    expect(auditEntry.action).toBe(action);
    expect(auditEntry.resource).toBe(resource);
    expect(auditEntry.details).toEqual(details);
  });

  test('should filter audit logs', () => {
    // Add some test logs
    auditService.logSecurityEvent('user1', 'login_success', 'auth_service');
    auditService.logUserAction('user1', 'course_enrollment', 'course_123');
    auditService.logUserAction('user2', 'profile_update', 'user_profile');

    // Filter by type
    const userActionLogs = auditService.getAuditLogs({ type: 'user_action' });
    expect(userActionLogs.logs.length).toBe(2);
    expect(userActionLogs.logs.every(log => log.type === 'user_action')).toBe(true);

    // Filter by user ID
    const user1Logs = auditService.getAuditLogs({ userId: 'user1' });
    expect(user1Logs.logs.length).toBe(2);
    expect(user1Logs.logs.every(log => log.userId === 'user1')).toBe(true);
  });

  test('should calculate security statistics', () => {
    // Add some security events
    auditService.logSecurityEvent('user1', 'login_success', 'auth_service');
    auditService.logSecurityEvent('user2', 'login_failed', 'auth_service');
    auditService.logSecurityEvent('user3', 'unauthorized_access', 'api_gateway');

    const stats = auditService.getSecurityStats();

    expect(stats.totalEvents).toBe(3);
    expect(stats.highSeverity).toBe(1);
    expect(stats.mediumSeverity).toBe(1);
    expect(stats.lowSeverity).toBe(1);
  });

  test('should clear old logs', () => {
    // Add some old logs
    const oldLog = auditService.logSecurityEvent('user1', 'login_success', 'auth_service');
    oldLog.timestamp = new Date(Date.now() - 100 * 24 * 60 * 60 * 1000); // 100 days old

    // Add a recent log
    auditService.logUserAction('user2', 'profile_update', 'user_profile');

    expect(auditService.auditLogs.length).toBe(2);

    // Clear logs older than 90 days
    const removedCount = auditService.clearOldLogs(90);

    expect(removedCount).toBe(1);
    expect(auditService.auditLogs.length).toBe(1);
    expect(auditService.auditLogs[0].action).toBe('profile_update');
  });
});
