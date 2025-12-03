import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

const router = express.Router();
const prisma = new PrismaClient();

// Encryption helper
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex');
const IV_LENGTH = 16;

function encrypt(text: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY.slice(0, 32)), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decrypt(text: string): string {
  const parts = text.split(':');
  const iv = Buffer.from(parts.shift()!, 'hex');
  const encryptedText = Buffer.from(parts.join(':'), 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY.slice(0, 32)), iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}

// Authentication middleware
async function requireAdmin(req: Request, res: Response, next: Function) {
  const masterKey = req.headers['x-admin-key'] || req.query.adminKey;
  
  if (!masterKey) {
    return res.status(401).json({ error: 'Admin authentication required' });
  }

  const expectedKey = process.env.ADMIN_MASTER_KEY;
  if (!expectedKey || masterKey !== expectedKey) {
    console.warn(`⚠️  Failed admin authentication attempt from ${req.ip}`);
    return res.status(403).json({ error: 'Invalid admin credentials' });
  }

  next();
}

/**
 * GET /admin/secrets/health
 * Health check
 */
router.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    service: 'secrets-management',
    timestamp: new Date().toISOString(),
  });
});

/**
 * GET /admin/secrets
 * List all secrets (values encrypted)
 */
router.get('/', requireAdmin, async (req: Request, res: Response) => {
  try {
    const secrets = await prisma.secret.findMany({
      select: {
        id: true,
        key: true,
        category: true,
        description: true,
        lastUpdated: true,
        updatedBy: true,
        // Don't include encrypted value
      },
      orderBy: {
        category: 'asc',
      },
    });

    res.json({
      success: true,
      count: secrets.length,
      secrets,
    });
  } catch (error: any) {
    console.error('Error listing secrets:', error);
    res.status(500).json({ error: 'Failed to list secrets' });
  }
});

/**
 * GET /admin/secrets/:key
 * Get a specific secret (decrypted)
 */
router.get('/:key', requireAdmin, async (req: Request, res: Response) => {
  try {
    const secret = await prisma.secret.findUnique({
      where: { key: req.params.key },
    });

    if (!secret) {
      return res.status(404).json({ error: 'Secret not found' });
    }

    const decryptedValue = decrypt(secret.encryptedValue);

    res.json({
      success: true,
      secret: {
        key: secret.key,
        value: decryptedValue,
        category: secret.category,
        description: secret.description,
        lastUpdated: secret.lastUpdated,
        updatedBy: secret.updatedBy,
      },
    });
  } catch (error: any) {
    console.error('Error getting secret:', error);
    res.status(500).json({ error: 'Failed to get secret' });
  }
});

/**
 * POST /admin/secrets
 * Create or update a secret
 */
router.post('/', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { key, value, category, description, updatedBy } = req.body;

    if (!key || !value) {
      return res.status(400).json({ error: 'Key and value are required' });
    }

    const encryptedValue = encrypt(value);

    const secret = await prisma.secret.upsert({
      where: { key },
      update: {
        encryptedValue,
        category,
        description,
        updatedBy,
        lastUpdated: new Date(),
      },
      create: {
        key,
        encryptedValue,
        category: category || 'general',
        description,
        updatedBy: updatedBy || 'admin',
      },
    });

    console.log(`✅ Secret ${key} updated by ${updatedBy || 'admin'}`);

    res.json({
      success: true,
      message: 'Secret saved successfully',
      secret: {
        key: secret.key,
        category: secret.category,
        description: secret.description,
      },
    });
  } catch (error: any) {
    console.error('Error saving secret:', error);
    res.status(500).json({ error: 'Failed to save secret' });
  }
});

/**
 * PUT /admin/secrets/:key
 * Update an existing secret
 */
router.put('/:key', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { value, category, description, updatedBy } = req.body;

    if (!value) {
      return res.status(400).json({ error: 'Value is required' });
    }

    const encryptedValue = encrypt(value);

    const secret = await prisma.secret.update({
      where: { key: req.params.key },
      data: {
        encryptedValue,
        category,
        description,
        updatedBy,
        lastUpdated: new Date(),
      },
    });

    console.log(`✅ Secret ${req.params.key} updated by ${updatedBy || 'admin'}`);

    res.json({
      success: true,
      message: 'Secret updated successfully',
      secret: {
        key: secret.key,
        category: secret.category,
        description: secret.description,
      },
    });
  } catch (error: any) {
    console.error('Error updating secret:', error);
    res.status(500).json({ error: 'Failed to update secret' });
  }
});

/**
 * DELETE /admin/secrets/:key
 * Delete a secret
 */
router.delete('/:key', requireAdmin, async (req: Request, res: Response) => {
  try {
    await prisma.secret.delete({
      where: { key: req.params.key },
    });

    console.log(`🗑️  Secret ${req.params.key} deleted`);

    res.json({
      success: true,
      message: 'Secret deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting secret:', error);
    res.status(500).json({ error: 'Failed to delete secret' });
  }
});

/**
 * POST /admin/secrets/bulk
 * Bulk import secrets from .env format
 */
router.post('/bulk', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { secrets, updatedBy } = req.body;

    if (!secrets || typeof secrets !== 'object') {
      return res.status(400).json({ error: 'Secrets object required' });
    }

    const results = [];

    for (const [key, value] of Object.entries(secrets)) {
      if (typeof value === 'string') {
        try {
          const encryptedValue = encrypt(value);
          
          await prisma.secret.upsert({
            where: { key },
            update: {
              encryptedValue,
              updatedBy: updatedBy || 'bulk-import',
              lastUpdated: new Date(),
            },
            create: {
              key,
              encryptedValue,
              category: 'imported',
              updatedBy: updatedBy || 'bulk-import',
            },
          });

          results.push({ key, status: 'success' });
        } catch (error: any) {
          results.push({ key, status: 'failed', error: error.message });
        }
      }
    }

    console.log(`📦 Bulk import completed: ${results.filter(r => r.status === 'success').length} successful`);

    res.json({
      success: true,
      message: 'Bulk import completed',
      results,
    });
  } catch (error: any) {
    console.error('Error in bulk import:', error);
    res.status(500).json({ error: 'Bulk import failed' });
  }
});

/**
 * GET /admin/secrets/export/env
 * Export all secrets as .env format
 */
router.get('/export/env', requireAdmin, async (req: Request, res: Response) => {
  try {
    const secrets = await prisma.secret.findMany({
      orderBy: {
        category: 'asc',
      },
    });

    let envContent = '# Azora OS - Production Environment Variables\n';
    envContent += `# Exported: ${new Date().toISOString()}\n\n`;

    let currentCategory = '';

    for (const secret of secrets) {
      if (secret.category !== currentCategory) {
        currentCategory = secret.category;
        envContent += `\n# ${currentCategory.toUpperCase()}\n`;
      }

      if (secret.description) {
        envContent += `# ${secret.description}\n`;
      }

      const decryptedValue = decrypt(secret.encryptedValue);
      envContent += `${secret.key}=${decryptedValue}\n`;
    }

    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Content-Disposition', 'attachment; filename=".env.production"');
    res.send(envContent);

    console.log(`📥 Secrets exported as .env file`);
  } catch (error: any) {
    console.error('Error exporting secrets:', error);
    res.status(500).json({ error: 'Export failed' });
  }
});

/**
 * POST /admin/secrets/validate
 * Validate required secrets are configured
 */
router.post('/validate', requireAdmin, async (req: Request, res: Response) => {
  try {
    const requiredSecrets = [
      'STRIPE_SECRET_KEY',
      'DATABASE_URL',
      'JWT_SECRET',
      'OPENAI_API_KEY',
      'BLOCKCHAIN_RPC_URL',
      'AZR_TOKEN_CONTRACT',
      'MINTER_PRIVATE_KEY',
    ];

    const secrets = await prisma.secret.findMany({
      where: {
        key: {
          in: requiredSecrets,
        },
      },
    });

    const foundKeys = secrets.map(s => s.key);
    const missingKeys = requiredSecrets.filter(k => !foundKeys.includes(k));

    const valid = missingKeys.length === 0;

    res.json({
      valid,
      message: valid ? 'All required secrets configured' : 'Missing required secrets',
      missing: missingKeys,
      configured: foundKeys,
    });
  } catch (error: any) {
    console.error('Error validating secrets:', error);
    res.status(500).json({ error: 'Validation failed' });
  }
});

/**
 * GET /admin/secrets/categories
 * Get all secret categories
 */
router.get('/meta/categories', requireAdmin, async (req: Request, res: Response) => {
  try {
    const categories = await prisma.secret.findMany({
      select: {
        category: true,
      },
      distinct: ['category'],
    });

    res.json({
      success: true,
      categories: categories.map(c => c.category),
    });
  } catch (error: any) {
    console.error('Error getting categories:', error);
    res.status(500).json({ error: 'Failed to get categories' });
  }
});

export default router;
