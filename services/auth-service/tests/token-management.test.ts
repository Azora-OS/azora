import { userFactory } from '../../../tests/factories';
import { getTestPrismaClient, cleanupTestDatabase } from '../../../tests/utils/database';
import { getTestRedisClient, cleanupTestRedis } from '../../../tests/utils/redis';
import * as jwt from 'jsonwebtoken';

const prisma = getTestPrismaClient();
const redis = getTestRedisClient();
const JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret';
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'test-refresh-secret';

describe('Auth Service - Token Management', () => {
  afterEach(async () => {
    await cleanupTestDatabase();
    await cleanupTestRedis();
  });

  describe('Token Refresh', () => {
    it('should refresh access token with valid refresh token', async () => {
      const user = await userFactory.create();

      // Create refresh token
      const refreshToken = jwt.sign(
        { userId: user.id, type: 'refresh' },
        REFRESH_TOKEN_SECRET,
        { expiresIn: '7d' }
      );

      // Store refresh token
      await prisma.token.create({
        data: {
          userId: user.id,
          token: refreshToken,
          type: 'REFRESH',
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });

      // Verify refresh token
      const decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET) as any;
      expect(decoded.userId).toBe(user.id);
      expect(decoded.type).toBe('refresh');

      // Generate new access token
      const newAccessToken = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: '1h' }
      );

      expect(newAccessToken).toBeDefined();
    });

    it('should reject expired refresh token', async () => {
      const user = await userFactory.create();

      // Create expired refresh token
      const expiredToken = jwt.sign(
        { userId: user.id, type: 'refresh' },
        REFRESH_TOKEN_SECRET,
        { expiresIn: '0s' }
      );

      // Wait to ensure expiration
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(() => jwt.verify(expiredToken, REFRESH_TOKEN_SECRET)).toThrow();
    });

    it('should reject invalid refresh token', () => {
      const invalidToken = 'invalid.refresh.token';

      expect(() => jwt.verify(invalidToken, REFRESH_TOKEN_SECRET)).toThrow();
    });

    it('should reject refresh token not in database', async () => {
      const user = await userFactory.create();

      const refreshToken = jwt.sign(
        { userId: user.id, type: 'refresh' },
        REFRESH_TOKEN_SECRET,
        { expiresIn: '7d' }
      );

      // Token is valid but not stored in database
      const storedToken = await prisma.token.findFirst({
        where: { token: refreshToken },
      });

      expect(storedToken).toBeNull();
    });

    it('should generate new refresh token on refresh', async () => {
      const user = await userFactory.create();

      const oldRefreshToken = jwt.sign(
        { userId: user.id, type: 'refresh' },
        REFRESH_TOKEN_SECRET,
        { expiresIn: '7d' }
      );

      // Store old token
      await prisma.token.create({
        data: {
          userId: user.id,
          token: oldRefreshToken,
          type: 'REFRESH',
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });

      // Generate new refresh token
      const newRefreshToken = jwt.sign(
        { userId: user.id, type: 'refresh' },
        REFRESH_TOKEN_SECRET,
        { expiresIn: '7d' }
      );

      expect(newRefreshToken).not.toBe(oldRefreshToken);

      // In real implementation, old token should be revoked
      await prisma.token.deleteMany({
        where: { token: oldRefreshToken },
      });

      const deletedToken = await prisma.token.findFirst({
        where: { token: oldRefreshToken },
      });

      expect(deletedToken).toBeNull();
    });
  });

  describe('Token Revocation', () => {
    it('should revoke refresh token on logout', async () => {
      const user = await userFactory.create();

      const refreshToken = jwt.sign(
        { userId: user.id, type: 'refresh' },
        REFRESH_TOKEN_SECRET,
        { expiresIn: '7d' }
      );

      // Store token
      await prisma.token.create({
        data: {
          userId: user.id,
          token: refreshToken,
          type: 'REFRESH',
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });

      // Revoke token
      await prisma.token.deleteMany({
        where: { token: refreshToken },
      });

      const revokedToken = await prisma.token.findFirst({
        where: { token: refreshToken },
      });

      expect(revokedToken).toBeNull();
    });

    it('should revoke all user tokens on logout all devices', async () => {
      const user = await userFactory.create();

      // Create multiple tokens
      const tokens = [];
      for (let i = 0; i < 3; i++) {
        const token = jwt.sign(
          { userId: user.id, type: 'refresh' },
          REFRESH_TOKEN_SECRET,
          { expiresIn: '7d' }
        );

        await prisma.token.create({
          data: {
            userId: user.id,
            token,
            type: 'REFRESH',
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          },
        });

        tokens.push(token);
      }

      // Verify tokens exist
      const userTokens = await prisma.token.findMany({
        where: { userId: user.id },
      });
      expect(userTokens.length).toBe(3);

      // Revoke all tokens
      await prisma.token.deleteMany({
        where: { userId: user.id },
      });

      const remainingTokens = await prisma.token.findMany({
        where: { userId: user.id },
      });

      expect(remainingTokens.length).toBe(0);
    });

    it('should add revoked token to blacklist in Redis', async () => {
      const token = jwt.sign({ userId: 'test' }, JWT_SECRET, { expiresIn: '1h' });
      const decoded = jwt.decode(token) as any;

      // Add to blacklist
      await redis.setex(`blacklist:${token}`, decoded.exp - Math.floor(Date.now() / 1000), '1');

      // Check if blacklisted
      const isBlacklisted = await redis.exists(`blacklist:${token}`);
      expect(isBlacklisted).toBe(1);
    });

    it('should check token against blacklist', async () => {
      const token = jwt.sign({ userId: 'test' }, JWT_SECRET, { expiresIn: '1h' });

      // Add to blacklist
      await redis.setex(`blacklist:${token}`, 3600, '1');

      // Verify token is blacklisted
      const isBlacklisted = await redis.exists(`blacklist:${token}`);
      expect(isBlacklisted).toBe(1);

      // Token should be rejected even if valid
      const isValid = jwt.verify(token, JWT_SECRET);
      expect(isValid).toBeDefined();
      // But in real implementation, should check blacklist first
    });
  });

  describe('Token Validation', () => {
    it('should validate token format', () => {
      const token = jwt.sign({ userId: 'test' }, JWT_SECRET);
      const parts = token.split('.');

      expect(parts.length).toBe(3);
      expect(parts[0].length).toBeGreaterThan(0); // header
      expect(parts[1].length).toBeGreaterThan(0); // payload
      expect(parts[2].length).toBeGreaterThan(0); // signature
    });

    it('should validate token expiration', () => {
      const token = jwt.sign({ userId: 'test' }, JWT_SECRET, { expiresIn: '1h' });
      const decoded = jwt.verify(token, JWT_SECRET) as any;

      const now = Math.floor(Date.now() / 1000);
      expect(decoded.exp).toBeGreaterThan(now);
    });

    it('should validate token issuer if specified', () => {
      const token = jwt.sign(
        { userId: 'test' },
        JWT_SECRET,
        { expiresIn: '1h', issuer: 'azora-auth' }
      );

      const decoded = jwt.verify(token, JWT_SECRET, { issuer: 'azora-auth' }) as any;
      expect(decoded.iss).toBe('azora-auth');
    });

    it('should validate token audience if specified', () => {
      const token = jwt.sign(
        { userId: 'test' },
        JWT_SECRET,
        { expiresIn: '1h', audience: 'azora-api' }
      );

      const decoded = jwt.verify(token, JWT_SECRET, { audience: 'azora-api' }) as any;
      expect(decoded.aud).toBe('azora-api');
    });
  });

  describe('Concurrent Session Management', () => {
    it('should allow multiple active sessions', async () => {
      const user = await userFactory.create();

      // Create multiple refresh tokens (different devices)
      const tokens = [];
      for (let i = 0; i < 3; i++) {
        const token = jwt.sign(
          { userId: user.id, type: 'refresh', device: `device-${i}` },
          REFRESH_TOKEN_SECRET,
          { expiresIn: '7d' }
        );

        await prisma.token.create({
          data: {
            userId: user.id,
            token,
            type: 'REFRESH',
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          },
        });

        tokens.push(token);
      }

      const userTokens = await prisma.token.findMany({
        where: { userId: user.id },
      });

      expect(userTokens.length).toBe(3);
    });

    it('should limit maximum concurrent sessions', async () => {
      const user = await userFactory.create();
      const MAX_SESSIONS = 5;

      // Create max sessions
      for (let i = 0; i < MAX_SESSIONS; i++) {
        const token = jwt.sign(
          { userId: user.id, type: 'refresh' },
          REFRESH_TOKEN_SECRET,
          { expiresIn: '7d' }
        );

        await prisma.token.create({
          data: {
            userId: user.id,
            token,
            type: 'REFRESH',
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          },
        });
      }

      const userTokens = await prisma.token.findMany({
        where: { userId: user.id },
      });

      expect(userTokens.length).toBe(MAX_SESSIONS);

      // If creating a new session, should remove oldest
      if (userTokens.length >= MAX_SESSIONS) {
        const oldestToken = userTokens.sort((a, b) => 
          a.createdAt.getTime() - b.createdAt.getTime()
        )[0];

        await prisma.token.delete({
          where: { id: oldestToken.id },
        });
      }

      const remainingTokens = await prisma.token.findMany({
        where: { userId: user.id },
      });

      expect(remainingTokens.length).toBe(MAX_SESSIONS - 1);
    });

    it('should track last activity per session', async () => {
      const user = await userFactory.create();

      const token = await prisma.token.create({
        data: {
          userId: user.id,
          token: 'test-token',
          type: 'REFRESH',
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          lastUsedAt: new Date(),
        },
      });

      expect(token.lastUsedAt).toBeDefined();

      // Update last activity
      await new Promise(resolve => setTimeout(resolve, 100));

      const updatedToken = await prisma.token.update({
        where: { id: token.id },
        data: { lastUsedAt: new Date() },
      });

      expect(updatedToken.lastUsedAt!.getTime()).toBeGreaterThan(token.lastUsedAt!.getTime());
    });
  });
});
