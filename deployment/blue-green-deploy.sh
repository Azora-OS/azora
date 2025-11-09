#!/bin/bash
# AZORA OS - Blue-Green Deployment Script
# Zero-downtime deployment with automatic rollback

set -e

ENVIRONMENT=$1
IMAGE_TAG=$2

if [ -z "$ENVIRONMENT" ] || [ -z "$IMAGE_TAG" ]; then
    echo "Usage: $0 <environment> <image-tag>"
    echo "Example: $0 production v1.2.3"
    exit 1
fi

echo "🚀 Starting blue-green deployment to $ENVIRONMENT"
echo "📦 Image tag: $IMAGE_TAG"

# Determine current active color
CURRENT_COLOR=$(kubectl get service api-gateway -n azora-$ENVIRONMENT -o jsonpath='{.spec.selector.color}' 2>/dev/null || echo "blue")

if [ "$CURRENT_COLOR" = "blue" ]; then
    OLD_COLOR="blue"
    NEW_COLOR="green"
else
    OLD_COLOR="green"
    NEW_COLOR="blue"
fi

echo "🎨 Current active: $OLD_COLOR, Deploying to: $NEW_COLOR"

# Function to rollback on failure
rollback() {
    echo "❌ Deployment failed, rolling back..."
    echo "🔄 Switching traffic back to $OLD_COLOR..."

    # Switch traffic back to old color
    kubectl patch service api-gateway -n azora-$ENVIRONMENT -p "{\"spec\":{\"selector\":{\"color\":\"$OLD_COLOR\"}}}" || true
    kubectl patch service auth-service -n azora-$ENVIRONMENT -p "{\"spec\":{\"selector\":{\"color\":\"$OLD_COLOR\"}}}" || true
    kubectl patch service lms-service -n azora-$ENVIRONMENT -p "{\"spec\":{\"selector\":{\"color\":\"$OLD_COLOR\"}}}" || true

    # Scale up old deployment
    kubectl scale deployment api-gateway-$OLD_COLOR --replicas=3 -n azora-$ENVIRONMENT || true
    kubectl scale deployment auth-service-$OLD_COLOR --replicas=2 -n azora-$ENVIRONMENT || true
    kubectl scale deployment lms-service-$OLD_COLOR --replicas=3 -n azora-$ENVIRONMENT || true

    # Scale down new deployment
    kubectl scale deployment api-gateway-$NEW_COLOR --replicas=0 -n azora-$ENVIRONMENT || true
    kubectl scale deployment auth-service-$NEW_COLOR --replicas=0 -n azora-$ENVIRONMENT || true
    kubectl scale deployment lms-service-$NEW_COLOR --replicas=0 -n azora-$ENVIRONMENT || true

    echo "✅ Rollback completed"
    exit 1
}

# Trap errors and rollback
trap rollback ERR

# Update deployments with new image
echo "📦 Updating deployments with new image..."
kubectl set image deployment/api-gateway-$NEW_COLOR api-gateway=azora/api-gateway:$IMAGE_TAG -n azora-$ENVIRONMENT
kubectl set image deployment/auth-service-$NEW_COLOR auth-service=azora/auth-service:$IMAGE_TAG -n azora-$ENVIRONMENT
kubectl set image deployment/lms-service-$NEW_COLOR lms-service=azora/lms-service:$IMAGE_TAG -n azora-$ENVIRONMENT
kubectl set image deployment/forge-service-$NEW_COLOR forge-service=azora/forge-service:$IMAGE_TAG -n azora-$ENVIRONMENT
kubectl set image deployment/nexus-service-$NEW_COLOR nexus-service=azora/nexus-service:$IMAGE_TAG -n azora-$ENVIRONMENT
kubectl set image deployment/education-service-$NEW_COLOR education-service=azora/education-service:$IMAGE_TAG -n azora-$ENVIRONMENT
kubectl set image deployment/payments-service-$NEW_COLOR payments-service=azora/payments-service:$IMAGE_TAG -n azora-$ENVIRONMENT

# Wait for rollout to complete
echo "⏳ Waiting for rollout to complete..."
kubectl rollout status deployment/api-gateway-$NEW_COLOR -n azora-$ENVIRONMENT --timeout=600s
kubectl rollout status deployment/auth-service-$NEW_COLOR -n azora-$ENVIRONMENT --timeout=600s
kubectl rollout status deployment/lms-service-$NEW_COLOR -n azora-$ENVIRONMENT --timeout=600s

# Run smoke tests
echo "🧪 Running smoke tests..."
if kubectl exec -n azora-$ENVIRONMENT deployment/api-gateway-$NEW_COLOR -- wget --quiet --tries=1 --spider http://localhost:4000/health; then
    echo "✅ API Gateway smoke test passed"
else
    echo "❌ API Gateway smoke test failed"
    rollback
fi

if kubectl exec -n azora-$ENVIRONMENT deployment/auth-service-$NEW_COLOR -- wget --quiet --tries=1 --spider http://localhost:3001/health; then
    echo "✅ Auth Service smoke test passed"
else
    echo "❌ Auth Service smoke test failed"
    rollback
fi

# Switch traffic to new color
echo "🔄 Switching traffic to $NEW_COLOR..."
kubectl patch service api-gateway -n azora-$ENVIRONMENT -p "{\"spec\":{\"selector\":{\"color\":\"$NEW_COLOR\"}}}"
kubectl patch service auth-service -n azora-$ENVIRONMENT -p "{\"spec\":{\"selector\":{\"color\":\"$NEW_COLOR\"}}}"
kubectl patch service lms-service -n azora-$ENVIRONMENT -p "{\"spec\":{\"selector\":{\"color\":\"$NEW_COLOR\"}}}"
kubectl patch service forge-service -n azora-$ENVIRONMENT -p "{\"spec\":{\"selector\":{\"color\":\"$NEW_COLOR\"}}}"
kubectl patch service nexus-service -n azora-$ENVIRONMENT -p "{\"spec\":{\"selector\":{\"color\":\"$NEW_COLOR\"}}}"
kubectl patch service education-service -n azora-$ENVIRONMENT -p "{\"spec\":{\"selector\":{\"color\":\"$NEW_COLOR\"}}}"
kubectl patch service payments-service -n azora-$ENVIRONMENT -p "{\"spec\":{\"selector\":{\"color\":\"$NEW_COLOR\"}}}"

# Wait for traffic to switch
echo "⏳ Waiting for traffic switch..."
sleep 30

# Run integration tests
echo "🔍 Running integration tests..."
# Add your integration test commands here
# For now, just check if services are responding
if kubectl run test-pod --image=curlimages/curl --rm -i --restart=Never -- curl -f http://api-gateway.azora-$ENVIRONMENT.svc.cluster.local:4000/health; then
    echo "✅ Integration tests passed"
else
    echo "❌ Integration tests failed"
    rollback
fi

# Scale down old deployment
echo "⬇️ Scaling down $OLD_COLOR deployment..."
kubectl scale deployment api-gateway-$OLD_COLOR --replicas=0 -n azora-$ENVIRONMENT
kubectl scale deployment auth-service-$OLD_COLOR --replicas=0 -n azora-$ENVIRONMENT
kubectl scale deployment lms-service-$OLD_COLOR --replicas=0 -n azora-$ENVIRONMENT
kubectl scale deployment forge-service-$OLD_COLOR --replicas=0 -n azora-$ENVIRONMENT
kubectl scale deployment nexus-service-$OLD_COLOR --replicas=0 -n azora-$ENVIRONMENT
kubectl scale deployment education-service-$OLD_COLOR --replicas=0 -n azora-$ENVIRONMENT
kubectl scale deployment payments-service-$OLD_COLOR --replicas=0 -n azora-$ENVIRONMENT

echo "🎉 Blue-green deployment successful!"
echo "🌐 Active color: $NEW_COLOR"
echo "📊 Monitor metrics at: http://grafana.azora-$ENVIRONMENT.svc.cluster.local"