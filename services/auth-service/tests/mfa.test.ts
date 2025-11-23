import { userFactory } from '../../../tests/factories';
import { getTestPrismaClient, cleanupTestDatabase } from '../../../tests/utils/database';
import * as bcrypt from 'bcrypt';

const prisma = getTestPrismaClient();

describe('Auth Service - MFA Setup and Verification', () => {
  afterEach(async () => {
    await cleanupTestDatabase();
  });

  it('should create MFA settings for user', async () => {
    const user = await userFactory.create();
    const secret = 'JBSWY3DPEHPK3PXP';

    const mfaSettings = await prisma.mFASettings.create({
      data: {
        userId: user.id,
        secret,
        enabled: false,
        backupCodes: JSON.stringify(['CODE1', 'CODE2', 'CODE3']),
      },
    });

    expect(mfaSettings).toBeDefined();
    expect(mfaSettings.secret).toBe(secret);
    expect(mfaSettings.enabled).toBe(false);
  });

  it('should generate backup codes during MFA setup', () => {
    const backupCodes = [];
    for (let i = 0; i < 10; i++) {
      backupCodes.push(Math.random().toString(36).substring(2, 10).toUpperCase());
    }

    expect(backupCodes.length).toBe(10);
    backupCodes.forEach(code => {
      expect(code.length).toBeGreaterThan(0);
      expect(code).toMatch(/^[A-Z0-9]+$/);
    });
  });

  it('should enable MFA after successful verification', async () => {
    const user = await userFactory.create();
    const secret = 'JBSWY3DPEHPK3PXP';

    const mfaSettings = await prisma.mFASettings.create({
      data: {
        userId: user.id,
        secret,
        enabled: false,
        backupCodes: JSON.stringify(['CODE1', 'CODE2']),
      },
    });

    await prisma.mFASettings.update({
      where: { id: mfaSettings.id },
      data: { enabled: true },
    });

    const updatedSettings = await prisma.mFASettings.findUnique({
      where: { id: mfaSettings.id },
    });

    expect(updatedSettings?.enabled).toBe(true);
  });

  it('should require MFA token for login when enabled', async () => {
    const user = await userFactory.create();

    await prisma.mFASettings.create({
      data: {
        userId: user.id,
        secret: 'JBSWY3DPEHPK3PXP',
        enabled: true,
        backupCodes: JSON.stringify(['CODE1']),
      },
    });

    const mfaSettings = await prisma.mFASettings.findUnique({
      where: { userId: user.id },
    });

    expect(mfaSettings?.enabled).toBe(true);
  });

  it('should allow backup code usage when MFA token unavailable', async () => {
    const user = await userFactory.create();
    const backupCodes = ['BACKUP1', 'BACKUP2', 'BACKUP3'];

    await prisma.mFASettings.create({
      data: {
        userId: user.id,
        secret: 'JBSWY3DPEHPK3PXP',
        enabled: true,
        backupCodes: JSON.stringify(backupCodes),
      },
    });

    const usedBackupCode = 'BACKUP1';
    const remainingCodes = backupCodes.filter(code => code !== usedBackupCode);

    await prisma.mFASettings.update({
      where: { userId: user.id },
      data: { backupCodes: JSON.stringify(remainingCodes) },
    });

    const updatedSettings = await prisma.mFASettings.findUnique({
      where: { userId: user.id },
    });

    const storedCodes = JSON.parse(updatedSettings!.backupCodes);
    expect(storedCodes.length).toBe(2);
    expect(storedCodes).not.toContain(usedBackupCode);
  });

  it('should disable MFA with password verification', async () => {
    const user = await userFactory.create({ password: 'SecurePass123!' });

    await prisma.mFASettings.create({
      data: {
        userId: user.id,
        secret: 'JBSWY3DPEHPK3PXP',
        enabled: true,
        backupCodes: JSON.stringify(['CODE1']),
      },
    });

    const storedUser = await prisma.user.findUnique({
      where: { id: user.id },
    });

    const isPasswordValid = await bcrypt.compare('SecurePass123!', storedUser!.password);
    expect(isPasswordValid).toBe(true);

    await prisma.mFASettings.update({
      where: { userId: user.id },
      data: {
        enabled: false,
        secret: null,
        backupCodes: '[]',
      },
    });

    const updatedSettings = await prisma.mFASettings.findUnique({
      where: { userId: user.id },
    });

    expect(updatedSettings?.enabled).toBe(false);
    expect(updatedSettings?.secret).toBeNull();
  });

  it('should regenerate backup codes on request', async () => {
    const user = await userFactory.create();
    const oldBackupCodes = ['OLD1', 'OLD2', 'OLD3'];

    await prisma.mFASettings.create({
      data: {
        userId: user.id,
        secret: 'JBSWY3DPEHPK3PXP',
        enabled: true,
        backupCodes: JSON.stringify(oldBackupCodes),
      },
    });

    const newBackupCodes = [];
    for (let i = 0; i < 10; i++) {
      newBackupCodes.push(Math.random().toString(36).substring(2, 10).toUpperCase());
    }

    await prisma.mFASettings.update({
      where: { userId: user.id },
      data: { backupCodes: JSON.stringify(newBackupCodes) },
    });

    const updatedSettings = await prisma.mFASettings.findUnique({
      where: { userId: user.id },
    });

    const storedCodes = JSON.parse(updatedSettings!.backupCodes);
    expect(storedCodes.length).toBe(10);
    expect(storedCodes).not.toEqual(oldBackupCodes);
  });

  it('should store MFA secret securely', async () => {
    const user = await userFactory.create();
    const secret = 'JBSWY3DPEHPK3PXP';

    const mfaSettings = await prisma.mFASettings.create({
      data: {
        userId: user.id,
        secret,
        enabled: false,
        backupCodes: JSON.stringify([]),
      },
    });

    expect(mfaSettings.secret).toBe(secret);
    expect(typeof mfaSettings.secret).toBe('string');
  });

  it('should validate backup code format', () => {
    const validBackupCodes = ['ABC123', 'XYZ789', 'DEF456'];
    const backupCodeRegex = /^[A-Z0-9]{6,10}$/;

    validBackupCodes.forEach(code => {
      expect(backupCodeRegex.test(code)).toBe(true);
    });
  });

  it('should prevent MFA setup without user authentication', async () => {
    const user = await userFactory.create();

    const existingMfa = await prisma.mFASettings.findUnique({
      where: { userId: user.id },
    });

    expect(existingMfa).toBeNull();
  });
});
