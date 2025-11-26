#!/bin/bash
set -e

NAMESPACE="azora-staging"
RELEASE_NAME="azora"
CHART_PATH="./infrastructure/helm/charts/azora"

echo "🚀 Deploying Azora to Staging..."

# Create namespace if not exists
kubectl create namespace $NAMESPACE --dry-run=client -o yaml | kubectl apply -f -

# Deploy with Helm
helm upgrade --install $RELEASE_NAME $CHART_PATH \
  --namespace $NAMESPACE \
  --values $CHART_PATH/values-staging.yaml \
  --wait \
  --timeout 10m

echo "✅ Deployment complete!"
kubectl get pods -n $NAMESPACE
