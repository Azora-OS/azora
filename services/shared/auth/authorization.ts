
/**
 * Comprehensive Authorization System
 * Ubuntu Philosophy: "My security ensures our freedom"
 */

import { Request, Response, NextFunction } from 'express';
import { getLogger } from '../monitoring/logger';

export enum Permission {
  READ_PROFILE = 'read:profile',
  UPDATE_PROFILE = 'update:profile',
  DELETE_PROFILE = 'delete:profile',
  MANAGE_MFA = 'manage:mfa',
  RESET_PASSWORD = 'reset:password',
  READ_TRANSACTIONS = 'read:transactions',
  CREATE_TRANSACTIONS = 'create:transactions',
  MANAGE_WALLET = 'manage:wallet',
  READ_COURSES = 'read:courses',
  ENROLL_COURSES = 'enroll:courses',
  MANAGE_COURSES = 'manage:courses',
  READ_USERS = 'read:users',
  MANAGE_USERS = 'manage:users',
  READ_ANALYTICS = 'read:analytics',
  MANAGE_SYSTEM = 'manage:system',
  READ_CONSTITUTION = 'read:constitution',
  PROPOSE_AMENDMENTS = 'propose:amendments',
  VOTE_AMENDMENTS = 'vote:amendments',
  JUDICIAL_REVIEW = 'judicial:review'
}

export enum Role {
  USER = 'user',
  MEMBER = 'member',
  EDUCATOR = 'educator',
  DEVELOPER = 'developer',
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin',
  JUDGE = 'judge',
  TREASURER = 'treasurer'
}

export interface User {
  id: string;
  email: string;
  roles: Role[];
  permissions: Permission[];
  ubuntuId?: string;
  communityStatus?: 'active' | 'suspended' | 'pending';
}

export interface Resource {
  type: string;
  id?: string;
  ownerId?: string;
  communityOwned?: boolean;
}

export interface AccessContext {
  user: User;
  resource: Resource;
  action: string;
  ip?: string;
  userAgent?: string;
}

export class AuthorizationService {
  private logger = getLogger('authorization');
  private rolePermissions: Map<Role, Permission[]> = new Map();
  private resourceOwnership: Map<string, (user: User, resource: Resource) => boolean> = new Map();

  constructor() {
    this.initializeRolePermissions();
    this.initializeResourceOwnership();
  }

  private initializeRolePermissions(): void {
    this.rolePermissions.set(Role.USER, [
      Permission.READ_PROFILE,
      Permission.UPDATE_PROFILE,
      Permission.READ_TRANSACTIONS,
      Permission.READ_COURSES,
      Permission.ENROLL_COURSES,
      Permission.READ_CONSTITUTION,
      Permission.VOTE_AMENDMENTS
    ]);

    this.rolePermissions.set(Role.MEMBER, [
      ...this.rolePermissions.get(Role.USER)!,
      Permission.MANAGE_MFA,
      Permission.CREATE_TRANSACTIONS,
      Permission.MANAGE_WALLET,
      Permission.PROPOSE_AMENDMENTS
    ]);

    this.rolePermissions.set(Role.EDUCATOR, [
      ...this.rolePermissions.get(Role.MEMBER)!,
      Permission.MANAGE_COURSES
    ]);

    this.rolePermissions.set(Role.DEVELOPER, [
      ...this.rolePermissions.get(Role.MEMBER)!,
      Permission.READ_ANALYTICS
    ]);

    this.rolePermissions.set(Role.ADMIN, [
      ...this.rolePermissions.get(Role.DEVELOPER)!,
      Permission.READ_USERS,
      Permission.MANAGE_USERS,
      Permission.RESET_PASSWORD,
      Permission.JUDICIAL_REVIEW
    ]);

    this.rolePermissions.set(Role.SUPER_ADMIN, [
      ...this.rolePermissions.get(Role.ADMIN)!,
      Permission.MANAGE_SYSTEM,
      Permission.DELETE_PROFILE
    ]);

    this.rolePermissions.set(Role.JUDGE, [
      ...this.rolePermissions.get(Role.MEMBER)!,
      Permission.JUDICIAL_REVIEW,
      Permission.READ_USERS
    ]);

    this.rolePermissions.set(Role.TREASURER, [
      ...this.rolePermissions.get(Role.ADMIN)!,
      Permission.MANAGE_WALLET,
      Permission.READ_TRANSACTIONS,
      Permission.CREATE_TRANSACTIONS
    ]);
  }

  private initializeResourceOwnership(): void {
    this.resourceOwnership.set('profile', (user: User, resource: Resource) => {
      return resource.ownerId === user.id;
    });

    this.resourceOwnership.set('course', (user: User, resource: Resource) => {
      return resource.ownerId === user.id || user.roles.includes(Role.EDUCATOR);
    });

    this.resourceOwnership.set('transaction', (user: User, resource: Resource) => {
      return resource.ownerId === user.id || user.roles.includes(Role.TREASURER);
    });

    this.resourceOwnership.set('community', (user: User, resource: Resource) => {
      return Boolean(resource.communityOwned) && user.communityStatus === 'active';
    });
  }

  public hasPermission(user: User, permission: Permission): boolean {
    // Check direct permissions
    if (user.permissions.includes(permission)) {
      return true;
    }

    // Check role-based permissions
    for (const role of user.roles) {
      const rolePerms = this.rolePermissions.get(role);
      if (rolePerms && rolePerms.includes(permission)) {
        return true;
      }
    }

    return false;
  }

  public canAccessResource(context: AccessContext): boolean {
    const { user, resource, action } = context;

    // Check if user is suspended
    if (user.communityStatus === 'suspended') {
      this.logger.warn('Suspended user access attempt', {
        userId: user.id,
        resource: resource.type,
        action,
        ip: context.ip
      });
      return false;
    }

    // Check if user has the required permission
    const permission = this.actionToPermission(action, resource.type);
    if (!permission) {
      this.logger.warn('Unknown action-resource combination', {
        action,
        resourceType: resource.type
      });
      return false;
    }

    if (!this.hasPermission(user, permission)) {
      this.logger.warn('Permission denied', {
        userId: user.id,
        permission,
        resource: resource.type,
        action,
        ip: context.ip
      });
      return false;
    }

    // Check resource ownership
    const ownershipCheck = this.resourceOwnership.get(resource.type);
    if (ownershipCheck && !ownershipCheck(user, resource)) {
      this.logger.warn('Resource ownership check failed', {
        userId: user.id,
        resource: resource.type,
        resourceId: resource.id,
        action
      });
      return false;
    }

    this.logger.info('Access granted', {
      userId: user.id,
      resource: resource.type,
      action,
      ip: context.ip
    });

    return true;
  }

  private actionToPermission(action: string, resourceType: string): Permission | null {
    const actionMap: Record<string, Record<string, Permission>> = {
      'read': {
        'profile': Permission.READ_PROFILE,
        'users': Permission.READ_USERS,
        'transactions': Permission.READ_TRANSACTIONS,
        'courses': Permission.READ_COURSES,
        'analytics': Permission.READ_ANALYTICS,
        'constitution': Permission.READ_CONSTITUTION
      },
      'create': {
        'transactions': Permission.CREATE_TRANSACTIONS,
        'courses': Permission.MANAGE_COURSES,
        'amendments': Permission.PROPOSE_AMENDMENTS
      },
      'update': {
        'profile': Permission.UPDATE_PROFILE,
        'users': Permission.MANAGE_USERS,
        'courses': Permission.MANAGE_COURSES,
        'wallet': Permission.MANAGE_WALLET,
        'mfa': Permission.MANAGE_MFA
      },
      'delete': {
        'profile': Permission.DELETE_PROFILE,
        'users': Permission.MANAGE_USERS
      },
      'manage': {
        'system': Permission.MANAGE_SYSTEM,
        'users': Permission.MANAGE_USERS,
        'mfa': Permission.MANAGE_MFA
      },
      'reset': {
        'password': Permission.RESET_PASSWORD
      },
      'vote': {
        'amendments': Permission.VOTE_AMENDMENTS
      },
      'judicial': {
        'review': Permission.JUDICIAL_REVIEW
      }
    };

    return actionMap[action]?.[resourceType] || null;
  }

  // Express middleware factory
  public requirePermission(permission: Permission) {
    return (req: Request, res: Response, next: NextFunction) => {
      const user = req.user as User;
      
      if (!user) {
        return res.status(401).json({
          error: 'Authentication required',
          ubuntu: 'My security ensures our freedom - Please authenticate first'
        });
      }

      if (!this.hasPermission(user, permission)) {
        return res.status(403).json({
          error: 'Insufficient permissions',
          required: permission,
          ubuntu: 'My security ensures our freedom - Access denied'
        });
      }

      next();
    };
  }

  // Resource-based access control middleware
  public requireResourceAccess(resourceType: string, action: string) {
    return (req: Request, res: Response, next: NextFunction) => {
      const user = req.user as User;
      
      if (!user) {
        return res.status(401).json({
          error: 'Authentication required',
          ubuntu: 'My security ensures our freedom - Please authenticate first'
        });
      }

      const resource: Resource = {
        type: resourceType,
        id: req.params.id,
        ownerId: req.body?.ownerId || req.params.userId,
        communityOwned: req.body?.communityOwned || false
      };

      const context: AccessContext = {
        user,
        resource,
        action,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      };

      if (!this.canAccessResource(context)) {
        return res.status(403).json({
          error: 'Access denied to resource',
          resource: resourceType,
          action,
          ubuntu: 'My security ensures our freedom - Resource access denied'
        });
      }

      next();
    };
  }

  // Role-based middleware
  public requireRole(role: Role) {
    return (req: Request, res: Response, next: NextFunction) => {
      const user = req.user as User;
      
      if (!user) {
        return res.status(401).json({
          error: 'Authentication required',
          ubuntu: 'My security ensures our freedom - Please authenticate first'
        });
      }

      if (!user.roles.includes(role)) {
        return res.status(403).json({
          error: 'Insufficient role',
          required: role,
          current: user.roles,
          ubuntu: 'My security ensures our freedom - Role access denied'
        });
      }

      next();
    };
  }

  // Multi-role middleware
  public requireAnyRole(roles: Role[]) {
    return (req: Request, res: Response, next: NextFunction) => {
      const user = req.user as User;
      
      if (!user) {
        return res.status(401).json({
          error: 'Authentication required',
          ubuntu: 'My security ensures our freedom - Please authenticate first'
        });
      }

      const hasRequiredRole = roles.some(role => user.roles.includes(role));
      
      if (!hasRequiredRole) {
        return res.status(403).json({
          error: 'Insufficient role',
          required: roles,
          current: user.roles,
          ubuntu: 'My security ensures our freedom - Role access denied'
        });
      }

      next();
    };
  }

  // Get user permissions
  public getUserPermissions(user: User): Permission[] {
    const permissions = new Set<Permission>(user.permissions);
    
    for (const role of user.roles) {
      const rolePerms = this.rolePermissions.get(role);
      if (rolePerms) {
        rolePerms.forEach(perm => permissions.add(perm));
      }
    }

    return Array.from(permissions);
  }

  // Check if user can perform action on specific resource
  public canPerformAction(user: User, action: string, resourceType: string, resourceId?: string): boolean {
    const resource: Resource = {
      type: resourceType,
      id: resourceId,
      ownerId: resourceId === user.id ? user.id : undefined,
      communityOwned: false
    };

    const context: AccessContext = {
      user,
      resource,
      action
    };

    return this.canAccessResource(context);
  }
}

// Singleton instance
export const authorization = new AuthorizationService();

// Helper functions for common authorization checks
export const canReadProfile = (user: User) => authorization.hasPermission(user, Permission.READ_PROFILE);
export const canManageUsers = (user: User) => authorization.hasPermission(user, Permission.MANAGE_USERS);
export const canManageSystem = (user: User) => authorization.hasPermission(user, Permission.MANAGE_SYSTEM);
export const canJudicialReview = (user: User) => authorization.hasPermission(user, Permission.JUDICIAL_REVIEW);
export const canVoteAmendments = (user: User) => authorization.hasPermission(user, Permission.VOTE_AMENDMENTS);

export default authorization;
