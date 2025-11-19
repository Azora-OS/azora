# Production Database Setup Guide

This guide covers setting up the production PostgreSQL database for the Education Revenue Engine with proper configuration, backups, and read replicas.

## Prerequisites

- PostgreSQL 15+ installed
- `pg_dump` and `psql` utilities available
- Kubernetes cluster (for Kubernetes deployment)
- kubectl configured with cluster access
- Sufficient disk space for backups (at least 2x database size)

## Environment Variables

Set these environment variables before running setup scripts:

```bash
export POSTGRES_HOST=postgres.example.com
export POSTGRES_PORT=5432
export POSTGRES_USER=azora_admin
export POSTGRES_PASSWORD=your_secure_password
export POSTGRES_DB=azora_production
export BACKUP_DIR=/var/lib/postgresql/backup
export REPLICA_HOST=postgres-replica.example.com
```

## Quick Start

### 1. Initialize Production Database

```bash
cd services/education-revenue-engine

# Make script executable
chmod +x scripts/init-production-db.sh

# Run initialization
./scripts/init-production-db.sh
```

This script will:
- Test database connectivity
- Create the production database
- Create replication user
- Enable WAL archiving
- Enable PostgreSQL extensions
- Create performance indexes
- Run Prisma migrations
- Create initial backup

### 2. Verify Database Setup

```bash
# Connect to database
psql -h $POSTGRES_HOST -U $POSTGRES_USER -d $POSTGRES_DB

# Check tables
\dt

# Check indexes
\di

# Check extensions
\dx

# Exit
\q
```

## Backup and Restore

### Create Backup

```bash
chmod +x scripts/backup-restore.sh

# Create backup
./scripts/backup-restore.sh backup

# List backups
./scripts/backup-restore.sh list

# Show backup statistics
./scripts/backup-restore.sh stats
```

### Restore from Backup

```bash
# List available backups
./scripts/backup-restore.sh list

# Restore from specific backup
./scripts/backup-restore.sh restore /var/lib/postgresql/backup/backup-20240101-120000.sql.gz

# Verify backup integrity
./scripts/backup-restore.sh verify /var/lib/postgresql/backup/backup-20240101-120000.sql.gz
```

### Automated Backup Schedule

Set up a cron job for daily backups:

```bash
# Edit crontab
crontab -e

# Add this line for daily backup at 2 AM
0 2 * * * cd /path/to/services/education-revenue-engine && ./scripts/backup-restore.sh backup

# Add this line for cleanup at 3 AM (keep 30 days)
0 3 * * * cd /path/to/services/education-revenue-engine && ./scripts/backup-restore.sh cleanup
```

## Read Replicas

### Kubernetes Deployment

```bash
# Deploy read replicas
kubectl apply -f infrastructure/kubernetes/education-revenue-engine-read-replica.yaml

# Verify deployment
kubectl get deployments -l app=postgres-read-replica
kubectl get pods -l app=postgres-read-replica
kubectl get svc postgres-read-replica

# Check replica status
kubectl logs -l app=postgres-read-replica -f
```

### Manual Read Replica Setup

```bash
# 1. Create base backup on primary
pg_basebackup -h $POSTGRES_HOST -U replication_user -D /var/lib/postgresql/replica_data -Fp -Xs -P -R

# 2. Start replica
pg_ctl -D /var/lib/postgresql/replica_data start

# 3. Verify replication
psql -h $POSTGRES_HOST -U $POSTGRES_USER -d $POSTGRES_DB -c "SELECT * FROM pg_stat_replication;"
```

## Performance Tuning

### Connection Pooling

Use PgBouncer for connection pooling:

```bash
# Install PgBouncer
apt-get install pgbouncer

# Configure /etc/pgbouncer/pgbouncer.ini
[databases]
azora_production = host=$POSTGRES_HOST port=$POSTGRES_PORT dbname=$POSTGRES_DB

[pgbouncer]
pool_mode = transaction
max_client_conn = 1000
default_pool_size = 25
min_pool_size = 10
reserve_pool_size = 5
reserve_pool_timeout = 3
max_db_connections = 100
max_user_connections = 50

# Start PgBouncer
systemctl start pgbouncer
```

### Query Optimization

Monitor slow queries:

```sql
-- Enable slow query logging
ALTER SYSTEM SET log_min_duration_statement = 1000;
SELECT pg_reload_conf();

-- View slow queries
SELECT query, calls, mean_time, max_time 
FROM pg_stat_statements 
ORDER BY mean_time DESC 
LIMIT 10;

-- Reset statistics
SELECT pg_stat_statements_reset();
```

### Index Maintenance

```sql
-- Analyze tables
ANALYZE;

-- Reindex if needed
REINDEX DATABASE azora_production;

-- Check index usage
SELECT schemaname, tablename, indexname, idx_scan 
FROM pg_stat_user_indexes 
ORDER BY idx_scan DESC;
```

## Monitoring

### PostgreSQL Metrics

Prometheus metrics are exposed on port 9187:

```bash
# Port forward to Prometheus exporter
kubectl port-forward -l app=postgres 9187:9187

# Access metrics
curl http://localhost:9187/metrics
```

### Key Metrics to Monitor

- `pg_up` - PostgreSQL availability
- `pg_connections_used` - Active connections
- `pg_database_size_bytes` - Database size
- `pg_stat_user_tables_seq_scan` - Sequential scans
- `pg_stat_user_tables_idx_scan` - Index scans
- `pg_replication_lag_bytes` - Replication lag

### Grafana Dashboards

Pre-built dashboards are available:

1. PostgreSQL Overview
2. PostgreSQL Replication
3. PostgreSQL Performance
4. PostgreSQL Connections

## Disaster Recovery

### RTO/RPO Targets

- **RTO (Recovery Time Objective)**: 1 hour
- **RPO (Recovery Point Objective)**: 15 minutes

### Recovery Procedures

#### Database Corruption

```bash
# 1. Stop application
kubectl scale deployment education-revenue-engine --replicas=0

# 2. Restore from backup
./scripts/backup-restore.sh restore /var/lib/postgresql/backup/backup-latest.sql.gz

# 3. Verify data integrity
psql -h $POSTGRES_HOST -U $POSTGRES_USER -d $POSTGRES_DB -c "SELECT COUNT(*) FROM \"User\";"

# 4. Restart application
kubectl scale deployment education-revenue-engine --replicas=3
```

#### Primary Database Failure

```bash
# 1. Promote read replica to primary
psql -h $REPLICA_HOST -U $POSTGRES_USER -d $POSTGRES_DB -c "SELECT pg_promote();"

# 2. Update connection strings to point to new primary
kubectl set env deployment/education-revenue-engine \
  DATABASE_URL=postgresql://$POSTGRES_USER:$POSTGRES_PASSWORD@$REPLICA_HOST:5432/$POSTGRES_DB

# 3. Verify connectivity
kubectl exec -it deployment/education-revenue-engine -- npm run test:db

# 4. Set up new replica from new primary
pg_basebackup -h $REPLICA_HOST -U replication_user -D /var/lib/postgresql/replica_data -Fp -Xs -P -R
```

#### Complete Data Loss

```bash
# 1. Restore from latest backup
./scripts/backup-restore.sh restore /var/lib/postgresql/backup/backup-latest.sql.gz

# 2. Verify backup integrity
./scripts/backup-restore.sh verify /var/lib/postgresql/backup/backup-latest.sql.gz

# 3. Run migrations to ensure schema is up-to-date
npm run migrate

# 4. Verify data
psql -h $POSTGRES_HOST -U $POSTGRES_USER -d $POSTGRES_DB -c "SELECT COUNT(*) FROM \"User\";"
```

## Security

### Access Control

```sql
-- Create read-only user for analytics
CREATE USER analytics_user WITH PASSWORD 'analytics_password';
GRANT CONNECT ON DATABASE azora_production TO analytics_user;
GRANT USAGE ON SCHEMA public TO analytics_user;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO analytics_user;

-- Create application user
CREATE USER app_user WITH PASSWORD 'app_password';
GRANT CONNECT ON DATABASE azora_production TO app_user;
GRANT USAGE ON SCHEMA public TO app_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO app_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO app_user;
```

### Encryption

```bash
# Enable SSL connections
# 1. Generate certificates
openssl req -new -x509 -days 365 -nodes -out server.crt -keyout server.key

# 2. Copy to PostgreSQL data directory
cp server.crt /var/lib/postgresql/data/
cp server.key /var/lib/postgresql/data/
chmod 600 /var/lib/postgresql/data/server.key

# 3. Update postgresql.conf
echo "ssl = on" >> /var/lib/postgresql/data/postgresql.conf

# 4. Restart PostgreSQL
systemctl restart postgresql
```

### Audit Logging

```sql
-- Enable audit logging
ALTER SYSTEM SET log_statement = 'all';
ALTER SYSTEM SET log_connections = on;
ALTER SYSTEM SET log_disconnections = on;
ALTER SYSTEM SET log_duration = on;
SELECT pg_reload_conf();

-- View audit logs
SELECT * FROM pg_log WHERE timestamp > now() - interval '1 hour';
```

## Maintenance

### Regular Tasks

- **Daily**: Verify backups completed successfully
- **Weekly**: Check replication lag
- **Monthly**: Analyze query performance
- **Quarterly**: Test disaster recovery procedures

### Upgrade Procedure

```bash
# 1. Create backup
./scripts/backup-restore.sh backup

# 2. Stop application
kubectl scale deployment education-revenue-engine --replicas=0

# 3. Upgrade PostgreSQL
pg_upgrade -b /usr/lib/postgresql/14/bin -B /usr/lib/postgresql/15/bin \
  -d /var/lib/postgresql/14/data -D /var/lib/postgresql/15/data

# 4. Verify upgrade
psql --version

# 5. Restart application
kubectl scale deployment education-revenue-engine --replicas=3
```

## Troubleshooting

### Connection Issues

```bash
# Test connection
psql -h $POSTGRES_HOST -U $POSTGRES_USER -d $POSTGRES_DB -c "SELECT 1;"

# Check connection limits
psql -h $POSTGRES_HOST -U $POSTGRES_USER -d $POSTGRES_DB -c "SHOW max_connections;"

# View active connections
psql -h $POSTGRES_HOST -U $POSTGRES_USER -d $POSTGRES_DB -c "SELECT * FROM pg_stat_activity;"
```

### Replication Lag

```bash
# Check replication status
psql -h $POSTGRES_HOST -U $POSTGRES_USER -d $POSTGRES_DB -c "SELECT * FROM pg_stat_replication;"

# Check replica lag
psql -h $REPLICA_HOST -U $POSTGRES_USER -d $POSTGRES_DB -c "SELECT now() - pg_last_xact_replay_timestamp() AS replication_lag;"
```

### Disk Space Issues

```bash
# Check database size
psql -h $POSTGRES_HOST -U $POSTGRES_USER -d $POSTGRES_DB -c "SELECT pg_size_pretty(pg_database_size('azora_production'));"

# Check table sizes
psql -h $POSTGRES_HOST -U $POSTGRES_USER -d $POSTGRES_DB -c "SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) FROM pg_tables ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;"

# Vacuum and analyze
VACUUM ANALYZE;
```

## Support

For issues or questions:

1. Check PostgreSQL logs: `/var/log/postgresql/postgresql.log`
2. Review Prometheus metrics
3. Check Grafana dashboards
4. Contact DevOps team

## References

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Prisma Database Documentation](https://www.prisma.io/docs/concepts/database-connectors/postgresql)
- [PostgreSQL Replication](https://www.postgresql.org/docs/current/warm-standby.html)
- [PostgreSQL Backup and Restore](https://www.postgresql.org/docs/current/backup.html)
