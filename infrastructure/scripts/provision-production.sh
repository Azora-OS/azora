#!/bin/bash
# Provision Production Kubernetes Cluster
set -e

echo "🚀 Provisioning Azora Production Environment..."

# Apply cluster configuration
echo "📦 Creating namespaces, RBAC, and network policies..."
kubectl apply -f ../kubernetes/environments/production/cluster-config.yaml

# Create secrets (use AWS Secrets Manager in production)
echo "🔐 Configure secrets using AWS Secrets Manager or Sealed Secrets"

# Deploy databases with HA
echo "💾 Deploying production databases with HA..."
kubectl apply -f ../kubernetes/environments/production/databases.yaml

# Wait for databases
echo "⏳ Waiting for databases to be ready..."
kubectl wait --for=condition=ready pod -l app=postgres,role=primary -n azora-production --timeout=600s
kubectl wait --for=condition=ready pod -l app=redis -n azora-production --timeout=600s

echo "✅ Production environment provisioned successfully!"
echo "📝 Next steps:"
echo "  1. Configure SSL certificates"
echo "  2. Set up monitoring"
echo "  3. Deploy services with blue-green strategy"
