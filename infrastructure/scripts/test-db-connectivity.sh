#!/bin/bash
# Test Database Connectivity
set -e

NAMESPACE=${1:-azora-staging}

echo "🔍 Testing database connectivity in $NAMESPACE..."

# Test PostgreSQL
echo "Testing PostgreSQL..."
kubectl run -it --rm psql-test --image=postgres:15-alpine --restart=Never -n $NAMESPACE -- \
  psql -h postgres.$NAMESPACE.svc.cluster.local -U azora -c "SELECT version();"

# Test Redis
echo "Testing Redis..."
kubectl run -it --rm redis-test --image=redis:7-alpine --restart=Never -n $NAMESPACE -- \
  redis-cli -h redis.$NAMESPACE.svc.cluster.local ping

echo "✅ Database connectivity tests passed!"
