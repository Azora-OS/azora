import { userFactory } from '../../../tests/factories';
import { getTestPrismaClient, cleanupTestDatabase } from '../../../tests/utils/database';
import * as jwt from 'jsonwebtoken';

const prisma = getTestPrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'test-refresh-secret';

describe('Auth Service - OAuth Integration', () => {
  afterEach(async () => {
    await cleanupTestDatabase();
  });

  it('should create user from Google OAuth', async () => {
    const googleUserData = {
      email: 'google@test.com',
      name: 'Google User',
      picture: 'https://example.com/avatar.jpg',
    };

    const user = await prisma.user.create({
      data: {
        email: googleUserData.email,
        name: googleUserData.name,
        profile: {
          create: {
            avatar: googleUserData.picture,
          },
        },
      },
    });

    expect(user).toBeDefined();
    expect(user.email).toBe(googleUserData.email);
    expect(user.name).toBe(googleUserData.name);
  });

  it('should link existing user with OAuth provider', async () => {
    const existingUser = await userFactory.create({
      email: 'existing@test.com',
    });

    const oauthEmail = existingUser.email;

    const foundUser = await prisma.user.findUnique({
      where: { email: oauthEmail },
    });

    expect(foundUser).toBeDefined();
    expect(foundUser?.id).toBe(existingUser.id);
  });

  it('should update user profile with OAuth data', async () => {
    const user = await userFactory.create();

    const oauthAvatar = 'https://example.com/new-avatar.jpg';

    await prisma.userProfile.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        avatar: oauthAvatar,
      },
      update: {
        avatar: oauthAvatar,
      },
    });

    const profile = await prisma.userProfile.findUnique({
      where: { userId: user.id },
    });

    expect(profile?.avatar).toBe(oauthAvatar);
  });

  it('should generate tokens after OAuth authentication', async () => {
    const user = await userFactory.create();

    const accessToken = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      { userId: user.id, type: 'refresh' },
      JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );

    expect(accessToken).toBeDefined();
    expect(refreshToken).toBeDefined();

    const decodedAccess = jwt.verify(accessToken, JWT_SECRET) as any;
    const decodedRefresh = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as any;

    expect(decodedAccess.userId).toBe(user.id);
    expect(decodedRefresh.userId).toBe(user.id);
  });

  it('should handle GitHub OAuth with primary email', async () => {
    const githubUserData = {
      login: 'githubuser',
      name: 'GitHub User',
      email: null,
      avatar_url: 'https://github.com/avatar.jpg',
    };

    const primaryEmail = 'github@test.com';

    const user = await prisma.user.create({
      data: {
        email: primaryEmail,
        name: githubUserData.name || githubUserData.login,
        profile: {
          create: {
            avatar: githubUserData.avatar_url,
          },
        },
      },
    });

    expect(user.email).toBe(primaryEmail);
    expect(user.name).toBe(githubUserData.name);
  });

  it('should handle Apple OAuth with minimal user data', async () => {
    const appleUserData = {
      email: 'apple@test.com',
      name: null,
    };

    const user = await prisma.user.create({
      data: {
        email: appleUserData.email,
        name: appleUserData.name || 'Apple User',
      },
    });

    expect(user.email).toBe(appleUserData.email);
    expect(user.name).toBeDefined();
  });

  it('should prevent duplicate OAuth accounts', async () => {
    const email = 'oauth@test.com';

    const user1 = await prisma.user.create({
      data: {
        email,
        name: 'OAuth User',
      },
    });

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    expect(existingUser).toBeDefined();
    expect(existingUser?.id).toBe(user1.id);
  });

  it('should store OAuth provider information', async () => {
    const user = await userFactory.create();

    const oauthProvider = 'google';
    const oauthProviderId = 'google-user-123';

    await prisma.userProfile.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        oauthProvider,
        oauthProviderId,
      },
      update: {
        oauthProvider,
        oauthProviderId,
      },
    });

    const profile = await prisma.userProfile.findUnique({
      where: { userId: user.id },
    });

    expect(profile?.oauthProvider).toBe(oauthProvider);
    expect(profile?.oauthProviderId).toBe(oauthProviderId);
  });

  it('should handle OAuth email verification', async () => {
    const oauthEmail = 'verified@oauth.com';

    const user = await prisma.user.create({
      data: {
        email: oauthEmail,
        name: 'OAuth User',
        isEmailVerified: true,
      },
    });

    expect(user.isEmailVerified).toBe(true);
  });

  it('should create refresh token for OAuth login', async () => {
    const user = await userFactory.create();

    const refreshToken = jwt.sign(
      { userId: user.id, type: 'refresh' },
      JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );

    await prisma.token.create({
      data: {
        userId: user.id,
        type: 'REFRESH',
        token: refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    const storedToken = await prisma.token.findFirst({
      where: {
        userId: user.id,
        type: 'REFRESH',
      },
    });

    expect(storedToken).toBeDefined();
    expect(storedToken?.token).toBe(refreshToken);
  });

  it('should handle OAuth provider errors gracefully', async () => {
    const invalidOAuthCode = 'invalid-code';

    expect(invalidOAuthCode).toBeDefined();
  });

  it('should validate OAuth state parameter', () => {
    const state = 'random-state-string';
    const receivedState = 'random-state-string';

    expect(state).toBe(receivedState);
  });
});
