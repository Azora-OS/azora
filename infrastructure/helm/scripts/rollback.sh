#!/bin/bash
set -e

NAMESPACE=${1:-azora-staging}
RELEASE_NAME="azora"
REVISION=${2:-0}

echo "⏪ Rolling back Azora in $NAMESPACE..."

if [ "$REVISION" -eq 0 ]; then
  helm rollback $RELEASE_NAME --namespace $NAMESPACE
else
  helm rollback $RELEASE_NAME $REVISION --namespace $NAMESPACE
fi

echo "✅ Rollback complete!"
kubectl get pods -n $NAMESPACE
