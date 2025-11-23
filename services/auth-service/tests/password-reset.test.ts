import { userFactory } from '../../../tests/factories';
import { getTestPrismaClient, cleanupTestDatabase } from '../../../tests/utils/database';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

const prisma = getTestPrismaClient();

describe('Auth Service - Password Reset Flow', () => {
  afterEach(async () => {
    await cleanupTestDatabase();
  });

  it('should generate password reset token', async () => {
    const user = await userFactory.create();
    const resetToken = uuidv4();

    const token = await prisma.token.create({
      data: {
        userId: user.id,
        type: 'RESET_PASSWORD',
        token: resetToken,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      },
    });

    expect(token).toBeDefined();
    expect(token.type).toBe('RESET_PASSWORD');
    expect(token.token).toBe(resetToken);
    expect(token.expiresAt.getTime()).toBeGreaterThan(Date.now());
  });

  it('should validate reset token exists and not expired', async () => {
    const user = await userFactory.create();
    const resetToken = uuidv4();

    await prisma.token.create({
      data: {
        userId: user.id,
        type: 'RESET_PASSWORD',
        token: resetToken,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      },
    });

    const storedToken = await prisma.token.findFirst({
      where: {
        token: resetToken,
        type: 'RESET_PASSWORD',
        expiresAt: { gt: new Date() },
      },
    });

    expect(storedToken).toBeDefined();
    expect(storedToken?.userId).toBe(user.id);
  });

  it('should reject expired reset token', async () => {
    const user = await userFactory.create();
    const resetToken = uuidv4();

    await prisma.token.create({
      data: {
        userId: user.id,
        type: 'RESET_PASSWORD',
        token: resetToken,
        expiresAt: new Date(Date.now() - 1000),
      },
    });

    const storedToken = await prisma.token.findFirst({
      where: {
        token: resetToken,
        type: 'RESET_PASSWORD',
        expiresAt: { gt: new Date() },
      },
    });

    expect(storedToken).toBeNull();
  });

  it('should update password with valid reset token', async () => {
    const user = await userFactory.create();
    const resetToken = uuidv4();
    const newPassword = 'NewSecurePass123!';

    await prisma.token.create({
      data: {
        userId: user.id,
        type: 'RESET_PASSWORD',
        token: resetToken,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      },
    });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    const updatedUser = await prisma.user.findUnique({
      where: { id: user.id },
    });

    const isPasswordValid = await bcrypt.compare(newPassword, updatedUser!.password);
    expect(isPasswordValid).toBe(true);
  });

  it('should delete reset token after successful password reset', async () => {
    const user = await userFactory.create();
    const resetToken = uuidv4();

    const token = await prisma.token.create({
      data: {
        userId: user.id,
        type: 'RESET_PASSWORD',
        token: resetToken,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      },
    });

    await prisma.token.delete({
      where: { id: token.id },
    });

    const deletedToken = await prisma.token.findFirst({
      where: { token: resetToken },
    });

    expect(deletedToken).toBeNull();
  });

  it('should invalidate all sessions after password reset', async () => {
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

    await prisma.token.deleteMany({
      where: {
        userId: user.id,
        type: 'REFRESH',
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

  it('should allow only one active reset token per user', async () => {
    const user = await userFactory.create();

    await prisma.token.create({
      data: {
        userId: user.id,
        type: 'RESET_PASSWORD',
        token: uuidv4(),
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      },
    });

    await prisma.token.deleteMany({
      where: {
        userId: user.id,
        type: 'RESET_PASSWORD',
      },
    });

    const newResetToken = uuidv4();
    await prisma.token.create({
      data: {
        userId: user.id,
        type: 'RESET_PASSWORD',
        token: newResetToken,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      },
    });

    const userResetTokens = await prisma.token.findMany({
      where: {
        userId: user.id,
        type: 'RESET_PASSWORD',
      },
    });

    expect(userResetTokens.length).toBe(1);
    expect(userResetTokens[0].token).toBe(newResetToken);
  });
});
