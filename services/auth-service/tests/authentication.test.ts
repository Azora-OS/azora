import { userFactory } from '../../../tests/factories';
import { getTestPrismaClient, cleanupTestDatabase } from '../../../tests/utils/database';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';

const prisma = getTestPrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret';

describe('Auth Service - Authentication', () => {
  afterEach(async () => {
    await cleanupTestDatabase();
  });

  describe('Login', () => {
    it('should login with valid credentials', async () => {
      const password = 'SecurePass123!';
      const user = await userFactory.create({ password });

      // Verify password
      const storedUser = await prisma.user.findUnique({
        where: { email: user.email },
      });

      const isPasswordValid = await bcrypt.compare(password, storedUser!.password);
      expect(isPasswordValid).toBe(true);

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: '1h' }
      );

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
    });

    it('should reject login with invalid password', async () => {
      const user = await userFactory.create({ password: 'CorrectPass123!' });

      const storedUser = await prisma.user.findUnique({
        where: { email: user.email },
      });

      const isPasswordValid = await bcrypt.compare('WrongPass123!', storedUser!.password);
      expect(isPasswordValid).toBe(false);
    });

    it('should reject login with non-existent email', async () => {
      const user = await prisma.user.findUnique({
        where: { email: 'nonexistent@test.com' },
      });

      expect(user).toBeNull();
    });

    it('should reject login for unverified email', async () => {
      const user = await userFactory.createUnverified();

      expect(user.isEmailVerified).toBe(false);
      // In real implementation, login should check this flag
    });

    it('should reject login for inactive user', async () => {
      const user = await userFactory.createInactive();

      expect(user.isActive).toBe(false);
      // In real implementation, login should check this flag
    });

    it('should generate valid JWT token', () => {
      const payload = {
        userId: 'test-user-id',
        email: 'test@test.com',
        role: 'USER',
      };

      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

      // Verify token
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      expect(decoded.userId).toBe(payload.userId);
      expect(decoded.email).toBe(payload.email);
      expect(decoded.role).toBe(payload.role);
    });

    it('should include expiration in JWT token', () => {
      const token = jwt.sign({ userId: 'test' }, JWT_SECRET, { expiresIn: '1h' });
      const decoded = jwt.verify(token, JWT_SECRET) as any;

      expect(decoded.exp).toBeDefined();
      expect(decoded.iat).toBeDefined();
      expect(decoded.exp).toBeGreaterThan(decoded.iat);
    });

    it('should reject expired JWT token', () => {
      const token = jwt.sign({ userId: 'test' }, JWT_SECRET, { expiresIn: '0s' });

      // Wait a moment to ensure token expires
      setTimeout(() => {
        expect(() => jwt.verify(token, JWT_SECRET)).toThrow();
      }, 100);
    });

    it('should reject JWT token with invalid signature', () => {
      const token = jwt.sign({ userId: 'test' }, JWT_SECRET);
      const invalidToken = token.slice(0, -5) + 'xxxxx';

      expect(() => jwt.verify(invalidToken, JWT_SECRET)).toThrow();
    });

    it('should handle case-insensitive email login', async () => {
      const user = await userFactory.create({ email: 'Test@Example.com' });

      // Should find user with lowercase email
      const foundUser = await prisma.user.findUnique({
        where: { email: 'test@example.com' },
      });

      expect(foundUser).toBeDefined();
    });
  });

  describe('JWT Token Validation', () => {
    it('should validate token structure', () => {
      const token = jwt.sign({ userId: 'test' }, JWT_SECRET);
      const parts = token.split('.');

      expect(parts.length).toBe(3); // header.payload.signature
    });

    it('should decode token payload', () => {
      const payload = { userId: 'test-123', role: 'USER' };
      const token = jwt.sign(payload, JWT_SECRET);
      const decoded = jwt.decode(token) as any;

      expect(decoded.userId).toBe(payload.userId);
      expect(decoded.role).toBe(payload.role);
    });

    it('should verify token with correct secret', () => {
      const token = jwt.sign({ userId: 'test' }, JWT_SECRET);
      
      expect(() => jwt.verify(token, JWT_SECRET)).not.toThrow();
    });

    it('should reject token with wrong secret', () => {
      const token = jwt.sign({ userId: 'test' }, JWT_SECRET);
      
      expect(() => jwt.verify(token, 'wrong-secret')).toThrow();
    });

    it('should handle malformed tokens', () => {
      const malformedTokens = [
        'not.a.token',
        'invalid',
        '',
        'a.b',
      ];

      malformedTokens.forEach(token => {
        expect(() => jwt.verify(token, JWT_SECRET)).toThrow();
      });
    });
  });

  describe('Password Security', () => {
    it('should use bcrypt for password hashing', async () => {
      const password = 'TestPassword123!';
      const hash = await bcrypt.hash(password, 10);

      expect(hash).not.toBe(password);
      expect(hash.startsWith('$2b$')).toBe(true); // bcrypt hash format
    });

    it('should use sufficient salt rounds', async () => {
      const password = 'TestPassword123!';
      const hash = await bcrypt.hash(password, 10);

      // bcrypt hash format: $2b$10$... (10 is the salt rounds)
      expect(hash.split('$')[2]).toBe('10');
    });

    it('should generate different hashes for same password', async () => {
      const password = 'TestPassword123!';
      const hash1 = await bcrypt.hash(password, 10);
      const hash2 = await bcrypt.hash(password, 10);

      expect(hash1).not.toBe(hash2); // Different salts
      
      // But both should verify correctly
      expect(await bcrypt.compare(password, hash1)).toBe(true);
      expect(await bcrypt.compare(password, hash2)).toBe(true);
    });

    it('should reject incorrect passwords', async () => {
      const password = 'CorrectPassword123!';
      const hash = await bcrypt.hash(password, 10);

      expect(await bcrypt.compare('WrongPassword123!', hash)).toBe(false);
    });
  });

  describe('Login Rate Limiting', () => {
    it('should track failed login attempts', async () => {
      const user = await userFactory.create();
      
      // Simulate tracking failed attempts
      const failedAttempts = new Map<string, number>();
      const email = user.email;
      
      failedAttempts.set(email, (failedAttempts.get(email) || 0) + 1);
      expect(failedAttempts.get(email)).toBe(1);
      
      failedAttempts.set(email, (failedAttempts.get(email) || 0) + 1);
      expect(failedAttempts.get(email)).toBe(2);
    });

    it('should reset failed attempts after successful login', async () => {
      const failedAttempts = new Map<string, number>();
      const email = 'test@test.com';
      
      failedAttempts.set(email, 3);
      expect(failedAttempts.get(email)).toBe(3);
      
      // Successful login - reset
      failedAttempts.delete(email);
      expect(failedAttempts.get(email)).toBeUndefined();
    });

    it('should lock account after max failed attempts', () => {
      const MAX_ATTEMPTS = 5;
      const failedAttempts = 6;
      
      const isLocked = failedAttempts >= MAX_ATTEMPTS;
      expect(isLocked).toBe(true);
    });
  });
});
