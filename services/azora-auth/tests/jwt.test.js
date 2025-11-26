const { generateAccessToken, generateRefreshToken, verifyToken, revokeToken } = require('../src/middleware/jwt');

describe('JWT Implementation', () => {
  describe('Token Generation', () => {
    test('should generate access token with RS256', () => {
      const payload = { userId: 1, email: 'test@azora.world', role: 'student' };
      const token = generateAccessToken(payload);
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.').length).toBe(3);
    });

    test('should generate refresh token', () => {
      const payload = { userId: 1 };
      const token = generateRefreshToken(payload);
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
    });
  });

  describe('Token Verification', () => {
    test('should verify valid token', () => {
      const payload = { userId: 1, email: 'test@azora.world', role: 'student' };
      const token = generateAccessToken(payload);
      const decoded = verifyToken(token);
      
      expect(decoded.userId).toBe(1);
      expect(decoded.email).toBe('test@azora.world');
      expect(decoded.role).toBe('student');
    });

    test('should reject revoked token', () => {
      const payload = { userId: 1, email: 'test@azora.world' };
      const token = generateAccessToken(payload);
      
      revokeToken(token);
      
      expect(() => verifyToken(token)).toThrow('Token has been revoked');
    });
  });

  describe('Token Expiry', () => {
    test('access token should expire in 1 hour', () => {
      const payload = { userId: 1 };
      const token = generateAccessToken(payload);
      const decoded = verifyToken(token);
      
      const expiryTime = decoded.exp - decoded.iat;
      expect(expiryTime).toBe(3600); // 1 hour in seconds
    });
  });
});
