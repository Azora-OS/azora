#!/bin/bash
set -e

echo "🚀 Deploying V0 Master UI to Production"

cd "Azora Master UI Template"

echo "📦 Building Docker image..."
docker build -f Dockerfile.production -t azora/master-ui:latest .

echo "🔄 Pushing to registry..."
docker push azora/master-ui:latest

echo "☸️  Deploying to Kubernetes..."
kubectl apply -f ../kubernetes/v0-master-ui-deployment.yaml

echo "📊 Deploying monitoring..."
kubectl apply -f ../kubernetes/monitoring.yaml

echo "⏳ Waiting for rollout..."
kubectl rollout status deployment/azora-master-ui -n azora

echo "✅ Deployment complete!"
echo "🌐 UI: http://azora-master-ui.azora.svc.cluster.local:3000"
echo "📊 Grafana: http://grafana.azora.svc.cluster.local:3000"
echo "📈 Prometheus: http://prometheus.azora.svc.cluster.local:9090"
