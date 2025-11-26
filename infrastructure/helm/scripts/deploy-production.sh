#!/bin/bash
set -e

NAMESPACE="azora-production"
RELEASE_NAME="azora"
CHART_PATH="./infrastructure/helm/charts/azora"

echo "🚀 Deploying Azora to Production..."
read -p "Are you sure? (yes/no): " confirm
[[ "$confirm" != "yes" ]] && echo "Aborted" && exit 1

kubectl create namespace $NAMESPACE --dry-run=client -o yaml | kubectl apply -f -

helm upgrade --install $RELEASE_NAME $CHART_PATH \
  --namespace $NAMESPACE \
  --values $CHART_PATH/values-production.yaml \
  --wait \
  --timeout 15m

echo "✅ Deployment complete!"
kubectl get pods -n $NAMESPACE
