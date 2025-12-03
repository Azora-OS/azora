# Database Migration Runbook

## Overview
Prisma migration workflow for Azora platform.

## Pre-Migration Checklist
- [ ] Backup database
- [ ] Review migration SQL
- [ ] Test in development
- [ ] Notify team
- [ ] Schedule maintenance window

## Development Workflow

```bash
# Create new migration
npx prisma migrate dev --name <migration_name>

# Review generated SQL
cat prisma/migrations/<timestamp>_<migration_name>/migration.sql

# Test migration
npm test
```

## Staging Deployment

```bash
# Set staging credentials
export STAGING_DATABASE_URL="postgresql://..."

# Run migration
./scripts/migrate-staging.sh

# Verify
npx prisma studio
```

## Production Deployment

```bash
# Backup first
./scripts/db-backup.sh

# Set production credentials
export PRODUCTION_DATABASE_URL="postgresql://..."

# Run migration
./scripts/migrate-production.sh

# Verify
psql $PRODUCTION_DATABASE_URL -c "\dt"
```

## Rollback Procedure

```bash
# Mark migration as rolled back
npx prisma migrate resolve --rolled-back <migration_name>

# Restore from backup
./scripts/db-restore.sh /backup/azora_<timestamp>.backup.gz

# Verify
npx prisma db pull
```

## Common Issues

### Migration Fails
1. Check database connectivity
2. Review migration SQL for errors
3. Check for conflicting data
4. Rollback and fix schema

### Data Loss Risk
1. Always backup before migration
2. Test with production data copy
3. Use transactions where possible
4. Have rollback plan ready

## Monitoring

After migration, monitor:
- Query performance
- Error rates
- Connection pool usage
- Slow query logs

## RPO/RTO Targets
- RPO: 1 hour (backup frequency)
- RTO: 4 hours (restore time)
