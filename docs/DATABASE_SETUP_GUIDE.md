# Azora OS Database Setup Guide

**Date:** October 26, 2025
**Purpose:** Establish and maintain Azora OS's sovereign PostgreSQL database infrastructure
**Status:** Ready for immediate implementation

## 🗄️ Database Architecture Overview

Azora OS uses PostgreSQL with Prisma ORM for complete data sovereignty and advanced features like vector embeddings for AI memory.

### 🏗️ Current Schema Features
- **User Management**: Multi-role user system with jurisdiction support
- **Wallet System**: AZR token balances and staking functionality
- **Transaction Ledger**: Complete audit trail for all economic activities
- **Staking Engine**: Lock periods, APY calculations, reward distribution
- **Compliance & Audit**: Regulatory compliance tracking and audit logs
- **Business Analytics**: Company metrics, revenue tracking, expense management
- **AI Genome**: Constitutional AI decision logging and context storage

## 🚀 Database Setup Process

### Prerequisites
- PostgreSQL 15+ installed
- Node.js 22+ for Prisma CLI
- Database admin credentials

### Step 1: Install PostgreSQL
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib

# macOS with Homebrew
brew install postgresql
brew services start postgresql

# Or use Docker
docker run --name azora-postgres -e POSTGRES_DB=azora -e POSTGRES_USER=azora -e POSTGRES_PASSWORD=your_password -p 5432:5432 -d postgres:15
```

### Step 2: Create Database and User
```sql
-- Connect as postgres superuser
sudo -u postgres psql

-- Create database and user
CREATE DATABASE azora;
CREATE USER azora WITH ENCRYPTED PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE azora TO azora;
ALTER USER azora CREATEDB;

-- Exit
\q
```

### Step 3: Configure Environment Variables
Create/update `.env` file:
```env
DATABASE_URL="postgresql://azora:your_secure_password@localhost:5432/azora?schema=public"
```

### Step 4: Initialize Prisma
```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Run initial migration
npx prisma db push

# Seed database (if seed script exists)
npx prisma db seed
```

### Step 5: Enable Extensions
```sql
-- Connect to azora database
psql -U azora -d azora

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pgvector"; -- For AI embeddings

-- Exit
\q
```

## 🔧 Database Maintenance

### Daily Operations
```bash
# Backup database
pg_dump -U azora -h localhost azora > backup_$(date +%Y%m%d_%H%M%S).sql

# Monitor connections
psql -U azora -d azora -c "SELECT * FROM pg_stat_activity;"

# Check database size
psql -U azora -d azora -c "SELECT pg_size_pretty(pg_database_size('azora'));"
```

### Schema Migrations
```bash
# Create new migration
npx prisma migrate dev --name add_new_feature

# Apply migrations to production
npx prisma migrate deploy

# Reset database (development only)
npx prisma migrate reset
```

### Performance Monitoring
```bash
# Check slow queries
psql -U azora -d azora -c "SELECT * FROM pg_stat_statements ORDER BY total_time DESC LIMIT 10;"

# Monitor table sizes
psql -U azora -d azora -c "SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size FROM pg_tables ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;"

# Check index usage
psql -U azora -d azora -c "SELECT * FROM pg_stat_user_indexes ORDER BY idx_scan DESC;"
```

## 🔒 Security Configuration

### Database Security
```sql
-- Create read-only user for analytics
CREATE USER azora_readonly WITH PASSWORD 'readonly_password';
GRANT CONNECT ON DATABASE azora TO azora_readonly;
GRANT USAGE ON SCHEMA public TO azora_readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO azora_readonly;

-- Enable row-level security where needed
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY user_own_data ON users FOR ALL USING (id = current_user_id);
```

### Connection Security
```bash
# Configure pg_hba.conf for secure connections
# Allow local connections with password
# host    azora           azora           127.0.0.1/32            md5

# Enable SSL
# ssl = on
# ssl_cert_file = '/path/to/server.crt'
# ssl_key_file = '/path/to/server.key'
```

### Backup Security
```bash
# Encrypt backups
pg_dump -U azora azora | gpg -c > encrypted_backup.gpg

# Store backups securely
# Use Azure Blob Storage, AWS S3, or local encrypted storage
```

## 📊 Database Scaling

### Read Replicas (for high traffic)
```bash
# Create replica
pg_basebackup -h primary_host -U replicator -D /var/lib/postgresql/data -P --wal-method=stream

# Configure streaming replication
# Add to postgresql.conf:
# wal_level = replica
# max_wal_senders = 3
# wal_keep_size = 64
```

### Partitioning (for large tables)
```sql
-- Partition transactions table by month
CREATE TABLE transactions_y2025m10 PARTITION OF transactions
    FOR VALUES FROM ('2025-10-01') TO ('2025-11-01');

-- Create future partitions
CREATE TABLE transactions_y2025m11 PARTITION OF transactions
    FOR VALUES FROM ('2025-11-01') TO ('2025-12-01');
```

### Connection Pooling
```bash
# Install PgBouncer
sudo apt install pgbouncer

# Configure connection pooling
# [databases]
# azora = host=127.0.0.1 port=5432 dbname=azora
#
# [pgbouncer]
# listen_port = 6432
# auth_type = md5
```

## 🔄 Data Migration & Backup

### Automated Backup Script
```bash
#!/bin/bash
# backup.sh
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/azora"
BACKUP_FILE="$BACKUP_DIR/azora_$DATE.sql"

# Create backup
pg_dump -U azora -h localhost azora > $BACKUP_FILE

# Compress
gzip $BACKUP_FILE

# Keep only last 7 days
find $BACKUP_DIR -name "*.sql.gz" -mtime +7 -delete

# Upload to cloud storage (optional)
# aws s3 cp $BACKUP_FILE.gz s3://azora-backups/
```

### Restore Procedure
```bash
# Stop application
# docker-compose down

# Restore from backup
gunzip backup_file.sql.gz
psql -U azora -d azora < backup_file.sql

# Restart application
# docker-compose up -d
```

## 📈 Monitoring & Alerts

### Key Metrics to Monitor
- Connection count
- Query performance
- Disk usage
- Replication lag
- Error rates

### Monitoring Tools
```bash
# Install monitoring
sudo apt install prometheus postgresql-contrib

# Configure PostgreSQL exporter
# Add to prometheus.yml:
# - job_name: 'postgres'
#   static_configs:
#     - targets: ['localhost:9187']
```

## 🚀 Integration with Azora OS

### Application Connection
```typescript
// lib/db.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

### Health Checks
```typescript
// Health check endpoint
app.get('/api/health/db', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`
    res.json({ status: 'healthy', database: 'connected' })
  } catch (error) {
    res.status(500).json({ status: 'unhealthy', database: 'disconnected' })
  }
})
```

## 📞 Support & Contact

### Database Administration
- **Primary DBA**: Sizwe (Executive Director)
- **Phone**: +27 73 234 7232
- **Email**: admin@azora.world (after Microsoft 365 setup)

### Emergency Procedures
1. Assess situation severity
2. Contact DBA immediately
3. Follow backup restoration procedures
4. Notify development team
5. Update stakeholders

## ✅ Database Health Checklist

- [ ] PostgreSQL service running
- [ ] Database connections working
- [ ] Prisma client generated
- [ ] Migrations applied
- [ ] Extensions enabled (uuid-ossp, pgcrypto, pgvector)
- [ ] Backup schedule active
- [ ] Monitoring configured
- [ ] Security policies applied

## 📋 Implementation Timeline

### Week 1 (October 27 - November 2, 2025)
- Install PostgreSQL and create database
- Set up user accounts and permissions
- Configure environment variables
- Initialize Prisma and run migrations

### Week 2 (November 3 - November 9, 2025)
- Enable required extensions
- Set up automated backups
- Configure security policies
- Test application integration

### Week 3 (November 10 - November 16, 2025)
- Implement monitoring and alerts
- Set up connection pooling
- Configure read replicas if needed
- Performance optimization

### Week 4 (November 17 - November 23, 2025)
- Final security hardening
- Documentation updates
- Team training on maintenance procedures
- Go-live readiness check

## 🔮 Future Enhancements

### Planned Improvements
- **Vector Database**: Enhanced pgvector for AI memory
- **Time-Series Data**: TimescaleDB for metrics
- **Multi-Region**: Global database replication
- **Automated Scaling**: Connection pooling and load balancing
- **Advanced Analytics**: Real-time business intelligence

---

**Azora OS Database Setup Guide**  
*Maintaining sovereign data infrastructure*  
*October 26, 2025*</content>
<parameter name="filePath">/workspaces/azora-os/DATABASE_SETUP_GUIDE.md