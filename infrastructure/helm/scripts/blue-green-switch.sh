#!/bin/bash
set -e

NAMESPACE=${1:-azora-production}
TARGET_VERSION=${2:-green}

echo "🔄 Switching traffic to $TARGET_VERSION version..."

kubectl patch service azora-api-gateway -n $NAMESPACE -p "{\"spec\":{\"selector\":{\"version\":\"$TARGET_VERSION\"}}}"

echo "✅ Traffic switched to $TARGET_VERSION!"
kubectl get svc azora-api-gateway -n $NAMESPACE -o yaml | grep -A 2 selector
