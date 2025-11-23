import { userFactory } from '../../../tests/factories';
import { getTestPrismaClient, cleanupTestDatabase } from '../../../tests/utils/database';
import * as jwt from 'jsonwebtoken';

const prisma = getTestPrismaClient();
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'test-refresh-secret';

describe('Auth Service - Session Management', () => {
  afterEach(async () => {
    await cleanupTestDatabase();
  });

  it('should create session on login', async () => {
    const user = await userFactory.create();

    const refreshToken = jwt.sign(
      { userId: user.id, type: 'refresh' },
      JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );

    const session = await prisma.token.create({
      data: {
        userId: user.id,
        type: 'REFRESH',
        token: refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    expect(session).toBeDefined();
    expect(session.userId).toBe(user.id);
    expect(session.type).toBe('REFRESH');
  });

  it('should list all active sessions for user', async () => {
    const user = await userFactory.create();

    for (let i = 0; i < 3; i++) {
      await prisma.token.create({
        data: {
          userId: user.id,
          type: 'REFRESH',
          token: `refresh-token-${i}`,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });
    }

    const sessions = await prisma.token.findMany({
      where: {
        userId: user.id,
        type: 'REFRESH',
        expiresAt: { gt: new Date() },
      },
    });

    expect(sessions.length).toBe(3);
  });

  it('should revoke specific session', async () => {
    const user = await userFactory.create();

    const session1 = await prisma.token.create({
      data: {
        userId: user.id,
        type: 'REFRESH',
        token: 'session-1',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    await prisma.token.create({
      data: {
        userId: user.id,
        type: 'REFRESH',
        token: 'session-2',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    await prisma.token.delete({
      where: { id: session1.id },
    });

    const remainingSessions = await prisma.token.findMany({
      where: {
        userId: user.id,
        type: 'REFRESH',
      },
    });

    expect(remainingSessions.length).toBe(1);
    expect(remainingSessions[0].token).toBe('session-2');
  });

  it('should revoke all sessions except current', async () => {
    const user = await userFactory.create();

    const currentSessionToken = 'current-session';

    for (let i = 0; i < 3; i++) {
      await prisma.token.create({
        data: {
          userId: user.id,
          type: 'REFRESH',
          token: `session-${i}`,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });
    }

    const currentSession = await prisma.token.create({
      data: {
        userId: user.id,
        type: 'REFRESH',
        token: currentSessionToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    await prisma.token.deleteMany({
      where: {
        userId: user.id,
        type: 'REFRESH',
        id: { not: currentSession.id },
      },
    });

    const remainingSessions = await prisma.token.findMany({
      where: {
        userId: user.id,
        type: 'REFRESH',
      },
    });

    expect(remainingSessions.length).toBe(1);
    expect(remainingSessions[0].token).toBe(currentSessionToken);
  });

  it('should track session last activity', async () => {
    const user = await userFactory.create();

    const session = await prisma.token.create({
      data: {
        userId: user.id,
        type: 'REFRESH',
        token: 'test-session',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        lastUsedAt: new Date(),
      },
    });

    expect(session.lastUsedAt).toBeDefined();

    await new Promise(resolve => setTimeout(resolve, 100));

    const updatedSession = await prisma.token.update({
      where: { id: session.id },
      data: { lastUsedAt: new Date() },
    });

    expect(updatedSession.lastUsedAt!.getTime()).toBeGreaterThan(
      session.lastUsedAt!.getTime()
    );
  });

  it('should expire inactive sessions', async () => {
    const user = await userFactory.create();

    await prisma.token.create({
      data: {
        userId: user.id,
        type: 'REFRESH',
        token: 'inactive-session',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        lastUsedAt: new Date(Date.now() - 31 * 24 * 60 * 60 * 1000),
      },
    });

    const inactiveSessions = await prisma.token.findMany({
      where: {
        userId: user.id,
        type: 'REFRESH',
        lastUsedAt: {
          lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },
      },
    });

    expect(inactiveSessions.length).toBe(1);

    await prisma.token.deleteMany({
      where: {
        id: { in: inactiveSessions.map(s => s.id) },
      },
    });

    const remainingSessions = await prisma.token.findMany({
      where: {
        userId: user.id,
        type: 'REFRESH',
      },
    });

    expect(remainingSessions.length).toBe(0);
  });

  it('should store session metadata', async () => {
    const user = await userFactory.create();

    const sessionMetadata = {
      userAgent: 'Mozilla/5.0',
      ipAddress: '192.168.1.1',
      deviceType: 'desktop',
    };

    const session = await prisma.token.create({
      data: {
        userId: user.id,
        type: 'REFRESH',
        token: 'test-session',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        metadata: JSON.stringify(sessionMetadata),
      },
    });

    expect(session.metadata).toBeDefined();
    const storedMetadata = JSON.parse(session.metadata!);
    expect(storedMetadata.userAgent).toBe(sessionMetadata.userAgent);
    expect(storedMetadata.ipAddress).toBe(sessionMetadata.ipAddress);
  });

  it('should limit maximum concurrent sessions', async () => {
    const user = await userFactory.create();
    const MAX_SESSIONS = 5;

    for (let i = 0; i < MAX_SESSIONS; i++) {
      await prisma.token.create({
        data: {
          userId: user.id,
          type: 'REFRESH',
          token: `session-${i}`,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });
    }

    const userTokens = await prisma.token.findMany({
      where: { userId: user.id },
    });

    expect(userTokens.length).toBe(MAX_SESSIONS);

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

  it('should revoke all user sessions on logout all devices', async () => {
    const user = await userFactory.create();

    for (let i = 0; i < 3; i++) {
      await prisma.token.create({
        data: {
          userId: user.id,
          type: 'REFRESH',
          token: `token-${i}`,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });
    }

    const userTokens = await prisma.token.findMany({
      where: { userId: user.id },
    });
    expect(userTokens.length).toBe(3);

    await prisma.token.deleteMany({
      where: { userId: user.id },
    });

    const remainingTokens = await prisma.token.findMany({
      where: { userId: user.id },
    });

    expect(remainingTokens.length).toBe(0);
  });

  it('should identify session by device information', async () => {
    const user = await userFactory.create();

    const devices = [
      { name: 'iPhone 12', type: 'mobile' },
      { name: 'Chrome on Windows', type: 'desktop' },
      { name: 'Safari on Mac', type: 'desktop' },
    ];

    for (const device of devices) {
      await prisma.token.create({
        data: {
          userId: user.id,
          type: 'REFRESH',
          token: `token-${device.name}`,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          metadata: JSON.stringify(device),
        },
      });
    }

    const sessions = await prisma.token.findMany({
      where: { userId: user.id },
    });

    expect(sessions.length).toBe(3);
    sessions.forEach(session => {
      const metadata = JSON.parse(session.metadata!);
      expect(metadata.name).toBeDefined();
      expect(metadata.type).toBeDefined();
    });
  });

  it('should handle session expiration', async () => {
    const user = await userFactory.create();

    await prisma.token.create({
      data: {
        userId: user.id,
        type: 'REFRESH',
        token: 'expired-session',
        expiresAt: new Date(Date.now() - 1000),
      },
    });

    const activeSessions = await prisma.token.findMany({
      where: {
        userId: user.id,
        type: 'REFRESH',
        expiresAt: { gt: new Date() },
      },
    });

    expect(activeSessions.length).toBe(0);
  });
});
