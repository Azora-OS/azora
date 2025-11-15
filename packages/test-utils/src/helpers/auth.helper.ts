import jwt from 'jsonwebtoken';

export const authHelper = {
  generateToken: (userId: string, role: string = 'STUDENT'): string => {
    return jwt.sign(
      { userId, role },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1h' }
    );
  },

  generateExpiredToken: (userId: string): string => {
    return jwt.sign(
      { userId },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '-1h' }
    );
  },

  createAuthHeader: (token: string): { Authorization: string } => {
    return { Authorization: `Bearer ${token}` };
  },

  createAuthHeaderForUser: (userId: string, role?: string): { Authorization: string } => {
    const token = authHelper.generateToken(userId, role);
    return authHelper.createAuthHeader(token);
  },
};
