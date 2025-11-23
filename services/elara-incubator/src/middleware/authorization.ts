import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.js';

export type UserRole = 'admin' | 'manager' | 'incubatee' | 'viewer';

export interface AuthorizedRequest extends AuthRequest {
  role?: UserRole;
}

export const requireRole = (allowedRoles: UserRole[]) => {
  return (req: AuthorizedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }

    const userRole = req.user.role as UserRole;
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ success: false, error: 'Insufficient permissions' });
    }

    req.role = userRole;
    next();
  };
};

export const requireBusinessOwnership = (req: AuthorizedRequest, res: Response, businessId: string) => {
  if (!req.userId) {
    return false;
  }
  // This will be validated in the service layer with database query
  return true;
};
