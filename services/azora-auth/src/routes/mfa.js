const express = require('express');
const router = express.Router();
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('../middleware/jwt');
const crypto = require('crypto');

const prisma = new PrismaClient();

// Helper to hash backup codes
const hashCode = (code) => crypto.createHash('sha256').update(code).digest('hex');

/**
 * @route POST /api/auth/mfa/setup
 * @desc Generate MFA secret and QR code
 * @access Private
 */
router.post('/setup', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Generate secret
    const secret = speakeasy.generateSecret({
      name: `Azora Sapiens (${req.user.email})`
    });

    // Store secret (temporarily disabled until verified)
    await prisma.mfaSecret.upsert({
      where: { userId },
      update: {
        secret: secret.base32,
        enabled: false
      },
      create: {
        userId,
        secret: secret.base32,
        enabled: false
      }
    });

    // Generate QR code
    const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url);

    res.json({
      secret: secret.base32,
      qrCode: qrCodeUrl,
      ubuntu: 'Secure access protects our community'
    });
  } catch (error) {
    console.error('MFA Setup Error:', error);
    res.status(500).json({ error: 'Failed to setup MFA' });
  }
});

/**
 * @route POST /api/auth/mfa/verify
 * @desc Verify token and enable MFA
 * @access Private
 */
router.post('/verify', authenticateToken, async (req, res) => {
  try {
    const { token } = req.body;
    const userId = req.user.id;

    const mfaSecret = await prisma.mfaSecret.findUnique({
      where: { userId }
    });

    if (!mfaSecret) {
      return res.status(400).json({ error: 'MFA not setup' });
    }

    const verified = speakeasy.totp.verify({
      secret: mfaSecret.secret,
      encoding: 'base32',
      token
    });

    if (verified) {
      // Enable MFA
      await prisma.mfaSecret.update({
        where: { userId },
        data: { enabled: true }
      });

      // Generate backup codes
      const codes = Array(10).fill(0).map(() => crypto.randomBytes(4).toString('hex'));

      // Store hashed codes
      await prisma.backupCode.deleteMany({ where: { userId } }); // Clear old codes
      await prisma.backupCode.createMany({
        data: codes.map(code => ({
          userId,
          code: hashCode(code),
          used: false
        }))
      });

      res.json({
        success: true,
        backupCodes: codes,
        ubuntu: 'Verification successful, community secured'
      });
    } else {
      res.status(400).json({ error: 'Invalid token' });
    }
  } catch (error) {
    console.error('MFA Verify Error:', error);
    res.status(500).json({ error: 'Failed to verify MFA' });
  }
});

/**
 * @route POST /api/auth/mfa/validate
 * @desc Validate token during login (Public endpoint, requires userId/email)
 * @access Public
 */
router.post('/validate', async (req, res) => {
  try {
    const { userId, token } = req.body;

    const mfaSecret = await prisma.mfaSecret.findUnique({
      where: { userId }
    });

    if (!mfaSecret || !mfaSecret.enabled) {
      return res.status(400).json({ error: 'MFA not enabled for this user' });
    }

    const verified = speakeasy.totp.verify({
      secret: mfaSecret.secret,
      encoding: 'base32',
      token
    });

    if (verified) {
      res.json({
        valid: true,
        ubuntu: 'Access granted with Ubuntu trust'
      });
    } else {
      res.status(401).json({ valid: false, error: 'Invalid token' });
    }
  } catch (error) {
    console.error('MFA Validate Error:', error);
    res.status(500).json({ error: 'Failed to validate MFA' });
  }
});

/**
 * @route POST /api/auth/mfa/backup
 * @desc Use backup code
 * @access Public
 */
router.post('/backup', async (req, res) => {
  try {
    const { userId, code } = req.body;
    const hashed = hashCode(code);

    const backupCode = await prisma.backupCode.findFirst({
      where: {
        userId,
        code: hashed,
        used: false
      }
    });

    if (backupCode) {
      // Mark as used
      await prisma.backupCode.update({
        where: { id: backupCode.id },
        data: { used: true }
      });

      res.json({
        valid: true,
        ubuntu: 'Backup access granted'
      });
    } else {
      res.status(401).json({ valid: false, error: 'Invalid or used backup code' });
    }
  } catch (error) {
    console.error('Backup Code Error:', error);
    res.status(500).json({ error: 'Failed to validate backup code' });
  }
});

module.exports = router;
