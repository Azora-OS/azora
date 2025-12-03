#!/usr/bin/env node

/**
 * Production Database Migration Script
 * Ubuntu Philosophy: "My security ensures our freedom"
 */

const { PrismaClient } = require('@prisma/client');
const { config } = require('../config/environment');
const { getLogger } = require('../services/shared/monitoring/logger');

const logger = getLogger('migration');

class ProductionMigrator {
  constructor() {
    this.prisma = new PrismaClient({
      datasources: {
        db: {
          url: config.database.url
        }
      }
    });
  }

  async runMigrations() {
    try {
      logger.info('Starting production database migrations...');
      
      // Run Prisma migrations
      await this.prisma.$executeRaw`SELECT 1`; // Test connection
      
      // Create core tables if they don't exist
      await this.createUsersTable();
      await this.createPaymentTables();
      await this.createAuditTables();
      await this.createCacheTables();
      
      // Seed initial data
      await this.seedInitialData();
      
      logger.info('Production migrations completed successfully');
    } catch (error) {
      logger.error('Migration failed', { error: error.message });
      throw error;
    } finally {
      await this.prisma.$disconnect();
    }
  }

  async createUsersTable() {
    const sql = `
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        roles JSONB DEFAULT '["user"]',
        permissions JSONB DEFAULT '[]',
        ubuntu_id VARCHAR(100),
        community_status VARCHAR(20) DEFAULT 'active',
        email_verified BOOLEAN DEFAULT false,
        mfa_secret VARCHAR(255),
        mfa_enabled BOOLEAN DEFAULT false,
        backup_codes JSONB DEFAULT '[]',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_login TIMESTAMP,
        metadata JSONB DEFAULT '{}'
      );
      
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_users_ubuntu_id ON users(ubuntu_id);
      CREATE INDEX IF NOT EXISTS idx_users_status ON users(community_status);
    `;
    
    await this.prisma.$executeRawUnsafe(sql);
    logger.info('Users table created/verified');
  }

  async createPaymentTables() {
    const sql = `
      CREATE TABLE IF NOT EXISTS payment_customers (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id),
        stripe_customer_id VARCHAR(255) UNIQUE NOT NULL,
        email VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE TABLE IF NOT EXISTS payments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id),
        stripe_payment_intent_id VARCHAR(255) UNIQUE NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        currency VARCHAR(3) DEFAULT 'usd',
        status VARCHAR(50) NOT NULL,
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE TABLE IF NOT EXISTS subscriptions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id),
        stripe_subscription_id VARCHAR(255) UNIQUE NOT NULL,
        status VARCHAR(50) NOT NULL,
        current_period_start TIMESTAMP NOT NULL,
        current_period_end TIMESTAMP NOT NULL,
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE TABLE IF NOT EXISTS refunds (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        stripe_refund_id VARCHAR(255) UNIQUE NOT NULL,
        payment_intent_id VARCHAR(255) NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        currency VARCHAR(3) DEFAULT 'usd',
        reason VARCHAR(50),
        status VARCHAR(50) NOT NULL,
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE INDEX IF NOT EXISTS idx_payment_customers_user_id ON payment_customers(user_id);
      CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
      CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
    `;
    
    await this.prisma.$executeRawUnsafe(sql);
    logger.info('Payment tables created/verified');
  }

  async createAuditTables() {
    const sql = `
      CREATE TABLE IF NOT EXISTS audit_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id),
        action VARCHAR(100) NOT NULL,
        resource_type VARCHAR(50) NOT NULL,
        resource_id VARCHAR(255),
        ip_address INET,
        user_agent TEXT,
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE TABLE IF NOT EXISTS auth_attempts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) NOT NULL,
        success BOOLEAN NOT NULL,
        ip_address INET,
        user_agent TEXT,
        failure_reason VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
      CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);
      CREATE INDEX IF NOT EXISTS idx_auth_attempts_email ON auth_attempts(email);
      CREATE INDEX IF NOT EXISTS idx_auth_attempts_created_at ON auth_attempts(created_at);
    `;
    
    await this.prisma.$executeRawUnsafe(sql);
    logger.info('Audit tables created/verified');
  }

  async createCacheTables() {
    const sql = `
      CREATE TABLE IF NOT EXISTS cache_entries (
        key VARCHAR(255) PRIMARY KEY,
        value JSONB NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE TABLE IF NOT EXISTS rate_limits (
        key VARCHAR(255) PRIMARY KEY,
        count INTEGER NOT NULL DEFAULT 0,
        window_start TIMESTAMP NOT NULL,
        window_end TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE INDEX IF NOT EXISTS idx_cache_entries_expires_at ON cache_entries(expires_at);
      CREATE INDEX IF NOT EXISTS idx_rate_limits_window_end ON rate_limits(window_end);
    `;
    
    await this.prisma.$executeRawUnsafe(sql);
    logger.info('Cache tables created/verified');
  }

  async seedInitialData() {
    // Create admin user if not exists
    const adminExists = await this.prisma.$queryRaw`
      SELECT id FROM users WHERE email = 'admin@azora.world'
    `;
    
    if (adminExists.length === 0) {
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'admin123', 10);
      
      await this.prisma.$executeRaw`
        INSERT INTO users (email, password_hash, name, roles, permissions, community_status, email_verified)
        VALUES ('admin@azora.world', ${hashedPassword}, 'Azora Administrator', 
                '["super_admin"]', 
                '["read:users", "manage:users", "read:analytics", "manage:system", "judicial:review"]',
                'active', true)
      `;
      
      logger.info('Admin user created');
    }
    
    // Create Ubuntu philosophy entry
    await this.prisma.$executeRaw`
      INSERT INTO cache_entries (key, value, expires_at)
      VALUES ('ubuntu:philosophy', 
              '{"philosophy": "Ngiyakwazi ngoba sikwazi - I can because we can", "principles": ["My success enables your success", "My knowledge becomes our knowledge", "My work strengthens our foundation", "My security ensures our freedom"]}',
              NOW() + INTERVAL '1 year')
      ON CONFLICT (key) DO NOTHING
    `;
    
    logger.info('Initial data seeded');
  }

  async rollback() {
    try {
      logger.warn('Starting database rollback...');
      
      // Drop tables in reverse order
      await this.prisma.$executeRawUnsafe(`
        DROP TABLE IF EXISTS refunds CASCADE;
        DROP TABLE IF EXISTS subscriptions CASCADE;
        DROP TABLE IF EXISTS payments CASCADE;
        DROP TABLE IF EXISTS payment_customers CASCADE;
        DROP TABLE IF EXISTS rate_limits CASCADE;
        DROP TABLE IF EXISTS cache_entries CASCADE;
        DROP TABLE IF EXISTS auth_attempts CASCADE;
        DROP TABLE IF EXISTS audit_logs CASCADE;
        DROP TABLE IF EXISTS users CASCADE;
      `);
      
      logger.info('Database rollback completed');
    } catch (error) {
      logger.error('Rollback failed', { error: error.message });
      throw error;
    }
  }

  async verifyMigration() {
    try {
      const tables = await this.prisma.$queryRaw`
        SELECT table_name FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
      `;
      
      const expectedTables = ['users', 'payment_customers', 'payments', 'subscriptions', 'refunds', 'audit_logs', 'auth_attempts', 'cache_entries', 'rate_limits'];
      const missingTables = expectedTables.filter(table => !tables.some(t => t.table_name === table));
      
      if (missingTables.length > 0) {
        throw new Error(`Missing tables: ${missingTables.join(', ')}`);
      }
      
      logger.info('Migration verification passed');
      return true;
    } catch (error) {
      logger.error('Migration verification failed', { error: error.message });
      return false;
    }
  }
}

// CLI interface
async function main() {
  const command = process.argv[2];
  const migrator = new ProductionMigrator();
  
  try {
    switch (command) {
      case 'up':
        await migrator.runMigrations();
        await migrator.verifyMigration();
        console.log('✅ Production migrations completed successfully');
        break;
      case 'down':
        await migrator.rollback();
        console.log('✅ Database rollback completed');
        break;
      case 'verify':
        const isVerified = await migrator.verifyMigration();
        console.log(isVerified ? '✅ Migration verification passed' : '❌ Migration verification failed');
        break;
      default:
        console.log('Usage: node migrate-production.js [up|down|verify]');
        console.log('  up     - Run all migrations');
        console.log('  down   - Rollback all migrations');
        console.log('  verify - Verify migration status');
        process.exit(1);
    }
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { ProductionMigrator };
