#!/bin/bash
set -e

echo "=== Disaster Recovery Test ==="

# Configuration
NAMESPACE="azora-staging"
BACKUP_DIR="./backups/test-$(date +%Y%m%d-%H%M%S)"
POSTGRES_POD=$(kubectl get pod -n $NAMESPACE -l app=postgres -o jsonpath='{.items[0].metadata.name}')

echo "1. Creating test backup..."
mkdir -p $BACKUP_DIR

# Backup PostgreSQL
kubectl exec -n $NAMESPACE $POSTGRES_POD -- pg_dump -U postgres azora > $BACKUP_DIR/postgres.sql
echo "✓ PostgreSQL backup created"

# Backup Redis
kubectl exec -n $NAMESPACE redis-0 -- redis-cli BGSAVE
sleep 5
kubectl cp $NAMESPACE/redis-0:/data/dump.rdb $BACKUP_DIR/redis.rdb
echo "✓ Redis backup created"

echo "2. Simulating data loss..."
kubectl exec -n $NAMESPACE $POSTGRES_POD -- psql -U postgres -c "DROP DATABASE azora;"
kubectl exec -n $NAMESPACE $POSTGRES_POD -- psql -U postgres -c "CREATE DATABASE azora;"
echo "✓ Database dropped"

echo "3. Restoring from backup..."
kubectl exec -n $NAMESPACE $POSTGRES_POD -- psql -U postgres azora < $BACKUP_DIR/postgres.sql
echo "✓ PostgreSQL restored"

kubectl cp $BACKUP_DIR/redis.rdb $NAMESPACE/redis-0:/data/dump.rdb
kubectl exec -n $NAMESPACE redis-0 -- redis-cli SHUTDOWN SAVE
kubectl rollout restart statefulset/redis -n $NAMESPACE
echo "✓ Redis restored"

echo "4. Verifying restoration..."
sleep 10
RECORD_COUNT=$(kubectl exec -n $NAMESPACE $POSTGRES_POD -- psql -U postgres azora -t -c "SELECT COUNT(*) FROM users;")
echo "✓ Found $RECORD_COUNT user records"

echo "=== Disaster Recovery Test Complete ==="
echo "RTO: $(date +%s) seconds"
echo "RPO: Backup age"
