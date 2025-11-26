const { ROLES, PERMISSIONS, hasPermission, requireRole, requirePermission } = require('../src/middleware/rbac');

describe('RBAC Implementation', () => {
  describe('Roles', () => {
    test('should define all required roles', () => {
      expect(ROLES.ADMIN).toBe('admin');
      expect(ROLES.INSTRUCTOR).toBe('instructor');
      expect(ROLES.STUDENT).toBe('student');
      expect(ROLES.GUEST).toBe('guest');
    });
  });

  describe('Permissions', () => {
    test('admin should have all permissions', () => {
      expect(hasPermission(ROLES.ADMIN, 'users:write')).toBe(true);
      expect(hasPermission(ROLES.ADMIN, 'courses:delete')).toBe(true);
      expect(hasPermission(ROLES.ADMIN, 'system:configure')).toBe(true);
    });

    test('instructor should have course permissions', () => {
      expect(hasPermission(ROLES.INSTRUCTOR, 'courses:read')).toBe(true);
      expect(hasPermission(ROLES.INSTRUCTOR, 'courses:write')).toBe(true);
      expect(hasPermission(ROLES.INSTRUCTOR, 'courses:delete')).toBe(false);
    });

    test('student should have limited permissions', () => {
      expect(hasPermission(ROLES.STUDENT, 'courses:read')).toBe(true);
      expect(hasPermission(ROLES.STUDENT, 'courses:write')).toBe(false);
      expect(hasPermission(ROLES.STUDENT, 'payments:read')).toBe(true);
    });

    test('guest should have no permissions', () => {
      expect(hasPermission(ROLES.GUEST, 'courses:read')).toBe(false);
      expect(hasPermission(ROLES.GUEST, 'users:read')).toBe(false);
    });
  });

  describe('Middleware', () => {
    test('requireRole should allow authorized role', () => {
      const req = { user: { role: ROLES.ADMIN } };
      const res = {};
      const next = jest.fn();
      
      const middleware = requireRole(ROLES.ADMIN);
      middleware(req, res, next);
      
      expect(next).toHaveBeenCalled();
    });

    test('requireRole should block unauthorized role', () => {
      const req = { user: { role: ROLES.STUDENT } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();
      
      const middleware = requireRole(ROLES.ADMIN);
      middleware(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(403);
      expect(next).not.toHaveBeenCalled();
    });

    test('requirePermission should allow authorized permission', () => {
      const req = { user: { role: ROLES.INSTRUCTOR } };
      const res = {};
      const next = jest.fn();
      
      const middleware = requirePermission('courses:write');
      middleware(req, res, next);
      
      expect(next).toHaveBeenCalled();
    });

    test('requirePermission should block unauthorized permission', () => {
      const req = { user: { role: ROLES.STUDENT } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();
      
      const middleware = requirePermission('courses:write');
      middleware(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(403);
      expect(next).not.toHaveBeenCalled();
    });
  });
});
