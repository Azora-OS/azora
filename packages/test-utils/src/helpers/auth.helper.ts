import jwt from 'jsonwebtoken';

export interface AuthTokenPayload {
  userId: string;
  email: string;
  role: string;
}

export const authHelper = {
  generateToken: (payload: AuthTokenPayload, expiresIn = '1h'): string => {
    return jwt.sign(payload, process.env.JWT_SECRET || 'test-secret', { expiresIn });
  },

  generateAuthHeader: (payload: AuthTokenPayload): { Authorization: string } => {
    const token = authHelper.generateToken(payload);
    return { Authorization: `Bearer ${token}` };
  },

  decodeToken: (token: string): AuthTokenPayload => {
    return jwt.verify(token, process.env.JWT_SECRET || 'test-secret') as AuthTokenPayload;
  },

  createTestUser: (overrides: Partial<AuthTokenPayload> = {}): AuthTokenPayload => {
    return {
      userId: 'test-user-id',
      email: 'test@azora.world',
      role: 'student',
      ...overrides,
    };
  },
};
