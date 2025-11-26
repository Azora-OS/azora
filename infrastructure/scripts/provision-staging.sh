#!/bin/bash
# Provision Staging Kubernetes Cluster
set -e

echo "🚀 Provisioning Azora Staging Environment..."

# Apply cluster configuration
echo "📦 Creating namespaces and network policies..."
kubectl apply -f ../kubernetes/environments/staging/cluster-config.yaml

# Create secrets (requires manual base64 encoding)
echo "🔐 Please create secrets manually using:"
echo "  kubectl create secret generic postgres-secret --from-literal=password=YOUR_PASSWORD -n azora-staging"
echo "  kubectl create secret generic jwt-secret --from-literal=secret=YOUR_JWT_SECRET -n azora-staging"

# Deploy databases
echo "💾 Deploying databases..."
kubectl apply -f ../kubernetes/environments/staging/databases.yaml

# Wait for databases
echo "⏳ Waiting for databases to be ready..."
kubectl wait --for=condition=ready pod -l app=postgres -n azora-staging --timeout=300s
kubectl wait --for=condition=ready pod -l app=redis -n azora-staging --timeout=300s

echo "✅ Staging environment provisioned successfully!"
echo "📝 Next steps:"
echo "  1. Configure secrets"
echo "  2. Deploy services"
echo "  3. Run smoke tests"
