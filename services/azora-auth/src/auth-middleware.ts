import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from './auth-service';

export interface AuthRequest extends Request {
    user?: {
        userId: string;
        email: string;
        role: string;
    };
}

/**
 * Middleware to verify JWT and attach user to request
 */
export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                error: 'Missing or invalid authorization header',
                message: 'Please provide a valid Bearer token'
            });
        }

        const token = authHeader.substring(7); // Remove 'Bearer ' prefix
        const payload = verifyAccessToken(token);

        // Attach user info to request
        req.user = payload;
        next();
    } catch (error) {
        return res.status(401).json({
            error: 'Invalid or expired token',
            message: 'Please login again'
        });
    }
}

/**
 * Middleware to check user role
 */
export function requireRole(...allowedRoles: string[]) {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.user) {
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

/**
 * Optional auth - doesn't fail if no token, but attaches user if valid
 */
export function optionalAuth(req: AuthRequest, res: Response, next: NextFunction) {
    try {
        const authHeader = req.headers.authorization;

        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7);
            const payload = verifyAccessToken(token);
            req.user = payload;
        }
    } catch (error) {
        // Silently ignore invalid tokens for optional auth
    }

    next();
}
