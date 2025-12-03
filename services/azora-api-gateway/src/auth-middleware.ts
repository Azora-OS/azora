import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'azora-secret-key-change-in-production';

export interface AuthRequest extends Request {
    user?: {
        id: string;
        email: string;
        role: string;
    };
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const token = authHeader.substring(7);

        const decoded = jwt.verify(token, JWT_SECRET) as any;
        req.user = {
            id: decoded.id,
            email: decoded.email,
            role: decoded.role || 'user'
        };

        next();
    } catch (error) {
        return res.status(401).json({ error: 'Invalid token' });
    }
};

export const optionalAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;

        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7);
            const decoded = jwt.verify(token, JWT_SECRET) as any;
            req.user = {
                id: decoded.id,
                email: decoded.email,
                role: decoded.role || 'user'
            };
        }

        next();
    } catch (error) {
        next();
    }
};

export const generateToken = (userId: string, email: string, role: string = 'user'): string => {
    return jwt.sign({ id: userId, email, role }, JWT_SECRET, { expiresIn: '7d' });
};
