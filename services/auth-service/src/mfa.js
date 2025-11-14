const { PrismaClient } = require('@prisma/client');
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'azora-secret-key-2025';

const generateMFABackupCodes = () => {
  const codes = [];
  for (let i = 0; i < 10; i++) {
    codes.push(Math.random().toString(36).substring(2, 10).toUpperCase());
  }
  return codes;
};

const setupMfa = async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const secret = speakeasy.generateSecret({
      name: `Azora OS (${user.email})`,
      issuer: 'Azora OS'
    });

    const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url);
    const backupCodes = generateMFABackupCodes();

    await prisma.mFASettings.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        secret: secret.base32,
        backupCodes: JSON.stringify(backupCodes),
        enabled: false
      },
      update: {
        secret: secret.base32,
        backupCodes: JSON.stringify(backupCodes)
      }
    });

    res.json({
      success: true,
      secret: secret.base32,
      qrCode: qrCodeUrl,
      backupCodes
    });
  } catch (error) {
    console.error('MFA setup error:', error);
    res.status(500).json({ error: 'MFA setup failed' });
  }
};

const verifyMfa = async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    const { mfaToken } = req.body;

    if (!token || !mfaToken) {
      return res.status(400).json({ error: 'Access token and MFA token required' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { mfaSettings: true }
    });

    if (!user || !user.mfaSettings || !user.mfaSettings.secret) {
      return res.status(400).json({ error: 'MFA setup not initiated' });
    }

    const verified = speakeasy.totp.verify({
      secret: user.mfaSettings.secret,
      encoding: 'base32',
      token: mfaToken,
      window: 2
    });

    if (!verified) {
      return res.status(400).json({ error: 'Invalid MFA token' });
    }

    await prisma.mFASettings.update({
      where: { userId: user.id },
      data: { enabled: true }
    });

    res.json({
      success: true,
      message: 'MFA enabled successfully',
      backupCodes: JSON.parse(user.mfaSettings.backupCodes || '[]')
    });
  } catch (error) {
    console.error('MFA verify error:', error);
    res.status(500).json({ error: 'MFA verification failed' });
  }
};

const disableMfa = async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    const { password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ error: 'Access token and password required' });
    }

    const bcrypt = require('bcryptjs');
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    await prisma.mFASettings.update({
      where: { userId: user.id },
      data: {
        enabled: false,
        secret: null,
        backupCodes: '[]'
      }
    });

    res.json({ success: true, message: 'MFA disabled successfully' });
  } catch (error) {
    console.error('MFA disable error:', error);
    res.status(500).json({ error: 'MFA disable failed' });
  }
};

module.exports = { setupMfa, verifyMfa, disableMfa };
