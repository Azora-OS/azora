class UbuntuPermissionEngine {
  constructor() {
    this.ubuntu = 'I authorize because we secure together';
    this.permissions = new Map();
    this.roles = new Map();
  }

  defineUbuntuRole(roleName, permissions) {
    this.roles.set(roleName, {
      permissions,
      ubuntu: `Ubuntu role: ${roleName}`,
      created: new Date()
    });
  }

  checkUbuntuPermission(userId, resource, action) {
    const userRoles = this.getUserRoles(userId);
    
    for (const role of userRoles) {
      const roleData = this.roles.get(role);
      if (roleData && roleData.permissions.includes(`${resource}:${action}`)) {
        return {
          allowed: true,
          ubuntu: 'Ubuntu permission granted',
          role
        };
      }
    }

    return {
      allowed: false,
      ubuntu: 'Ubuntu permission denied - security maintained'
    };
  }

  getUserRoles(userId) {
    return ['ubuntu_user'];
  }
}

module.exports = UbuntuPermissionEngine;