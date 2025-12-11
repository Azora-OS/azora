import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export function authenticateToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    // In dev, allow optional user
    (req as any).user = { email: process.env.DEV_DEFAULT_USER || 'guest@example.com' };
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret');
    (req as any).user = decoded;
    return next();
  } catch (err) {
    console.warn('[Auth] Invalid token, falling back to guest', err);
    (req as any).user = { email: 'guest@example.com' };
    return next();
  }
}

export default authenticateToken;
