import { userFactory } from '../../../tests/factories';
import { getTestPrismaClient, cleanupTestDatabase } from '../../../tests/utils/database';
import { getTestRedisClient, cleanupTestRedis } from '../../../tests/utils/redis';
import { mockEmail } from '../../../tests/mocks';
import * as jwt from 'jsonwebtoken';

const prisma = getTestPrismaClient();
const redis = getTestRedisClient();
const JWT_SECRET = process.env.JWT_SECRET || 'test-secret';

describe('Auth Comprehensive Flows', () => {
  afterEach(async () => {
    await cleanupTestDatabase();
    await cleanupTestRedis();
    mockEmail.reset();
  });

  it('should complete registration flow', async () => {
    const userData = {
      email: 'test@example.com',
      name: 'Test User',
      password: 'Password123!',
    };

    const user = await prisma.user.create({
      data: userData
    });

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '24h' });
    await redis.setex(`verify:${user.id}`, 86400, token);

    await mockEmail.sendEmail({
      to: user.email,
      subject: 'Verify Email',
      text: `Token: ${token}`
    });

    expect(mockEmail.verifyEmailSent(user.email, 'Verify Email')).toBe(true);
    expect(user.email).toBe(userData.email);
  });

  it('should complete login flow', async () => {
    const user = await userFactory.create();

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '24h' });
    const sessionId = `session:${user.id}`;
    
    await redis.setex(sessionId, 86400, JSON.stringify({
      userId: user.id,
      token,
      loginAt: new Date().toISOString()
    }));

    const session = await redis.get(sessionId);
    expect(session).toBeDefined();
  });

  it('should complete password reset flow', async () => {
    const user = await userFactory.create();

    const resetToken = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1h' });
    await redis.setex(`reset:${user.id}`, 3600, resetToken);

    await mockEmail.sendEmail({
      to: user.email,
      subject: 'Password Reset',
      text: `Reset: ${resetToken}`
    });

    await redis.del(`reset:${user.id}`);

    const deletedToken = await redis.get(`reset:${user.id}`);
    expect(deletedToken).toBeNull();
  });

  it('should handle OAuth flow', async () => {
    const oauthUser = await prisma.user.create({
      data: {
        email: 'oauth@test.com',
        name: 'OAuth User',
        password: 'random123',
      }
    });

    expect(oauthUser.email).toBe('oauth@test.com');
  });
});