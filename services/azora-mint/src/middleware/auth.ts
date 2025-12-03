import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

export interface TokenPayload {
  sub: string;
  roles?: string[];
}

export function requireMintRole(req: Request, res: Response, next: NextFunction) {
  const auth = req.headers['authorization'] || req.headers['Authorization'];
  if (!auth || typeof auth !== 'string') return res.status(401).json({ success: false, error: 'Missing authorization header' });
  const token = auth.split(' ')[1];
  if (!token) return res.status(401).json({ success: false, error: 'Missing token' });

  try {
    const secret = process.env.JWT_SECRET || 'dev-secret';
    const payload = jwt.verify(token, secret) as TokenPayload;
    const roles = payload.roles || [];
    if (!roles.includes('mint:tokens')) return res.status(403).json({ success: false, error: 'Insufficient role to mint' });

    // attach payload to request
    (req as any).user = payload;
    next();
  } catch (err: any) {
    return res.status(401).json({ success: false, error: 'Invalid token' });
  }
}

export default requireMintRole;
