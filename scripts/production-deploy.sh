#!/bin/bash
# Task 23: Production Deployment

set -e

echo "=== Azora Production Deployment ==="

# Task 23.1: Create backups
echo "Task 23.1: Creating backups..."
pg_dump -h $DB_HOST -U $DB_USER -d azora_production > backup-$(date +%Y%m%d-%H%M%S).sql
kubectl get configmap -n azora-production -o yaml > configmap-backup.yaml
echo "✅ Backups created"

# Task 23.2: Deploy to production
echo "Task 23.2: Deploying to production..."
helm upgrade --install azora-production ./infrastructure/helm/azora \
  --namespace azora-production \
  --values ./infrastructure/helm/values-production.yaml \
  --wait --timeout 10m
echo "✅ Deployment complete"

# Task 23.3: Smoke tests
echo "Task 23.3: Running smoke tests..."
npm run test:smoke:production
echo "✅ Smoke tests passed"

# Task 23.4: Traffic switch
echo "Task 23.4: Switching traffic..."
./scripts/blue-green-switch.sh 10
sleep 60
./scripts/blue-green-switch.sh 50
sleep 120
./scripts/blue-green-switch.sh 100
echo "✅ Traffic switched to production"

echo "=== Deployment Complete ==="
