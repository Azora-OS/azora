const ROLES = {
  ADMIN: 'admin',
  INSTRUCTOR: 'instructor',
  STUDENT: 'student',
  GUEST: 'guest'
};

const PERMISSIONS = {
  // User management
  'users:read': [ROLES.ADMIN, ROLES.INSTRUCTOR],
  'users:write': [ROLES.ADMIN],
  'users:delete': [ROLES.ADMIN],
  
  // Course management
  'courses:read': [ROLES.ADMIN, ROLES.INSTRUCTOR, ROLES.STUDENT],
  'courses:write': [ROLES.ADMIN, ROLES.INSTRUCTOR],
  'courses:delete': [ROLES.ADMIN],
  
  // Content management
  'content:read': [ROLES.ADMIN, ROLES.INSTRUCTOR, ROLES.STUDENT],
  'content:write': [ROLES.ADMIN, ROLES.INSTRUCTOR],
  'content:delete': [ROLES.ADMIN, ROLES.INSTRUCTOR],
  
  // Assessment management
  'assessments:read': [ROLES.ADMIN, ROLES.INSTRUCTOR, ROLES.STUDENT],
  'assessments:write': [ROLES.ADMIN, ROLES.INSTRUCTOR],
  'assessments:grade': [ROLES.ADMIN, ROLES.INSTRUCTOR],
  
  // Financial operations
  'payments:read': [ROLES.ADMIN, ROLES.STUDENT],
  'payments:write': [ROLES.ADMIN],
  'payments:refund': [ROLES.ADMIN],
  
  // System administration
  'system:read': [ROLES.ADMIN],
  'system:write': [ROLES.ADMIN],
  'system:configure': [ROLES.ADMIN]
};

function hasPermission(role, permission) {
  const allowedRoles = PERMISSIONS[permission];
  return allowedRoles && allowedRoles.includes(role);
}

function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'Insufficient permissions',
        required: allowedRoles,
        current: req.user.role
      });
    }

    next();
  };
}

function requirePermission(permission) {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!hasPermission(req.user.role, permission)) {
      return res.status(403).json({ 
        error: 'Insufficient permissions',
        required: permission,
        role: req.user.role
      });
    }

    next();
  };
}

module.exports = {
  ROLES,
  PERMISSIONS,
  hasPermission,
  requireRole,
  requirePermission
};
