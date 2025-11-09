#!/bin/bash
# AZORA OS - Canary Deployment Script
# Gradual traffic shifting with automated rollback

set -e

ENVIRONMENT=$1
IMAGE_TAG=$2
CANARY_PERCENTAGE=${3:-10}

if [ -z "$ENVIRONMENT" ] || [ -z "$IMAGE_TAG" ]; then
    echo "Usage: $0 <environment> <image-tag> [canary-percentage]"
    echo "Example: $0 staging v1.2.3 20"
    exit 1
fi

echo "🦜 Starting canary deployment to $ENVIRONMENT"
echo "📦 Image tag: $IMAGE_TAG"
echo "📊 Canary percentage: $CANARY_PERCENTAGE%"

# Function to rollback on failure
rollback() {
    echo "❌ Deployment failed, rolling back..."

    # Reset traffic to 100% old version
    kubectl patch service api-gateway -n azora-$ENVIRONMENT -p '{
        "spec": {
            "selector": {"color": "blue"}
        }
    }' || true

    # Scale down canary deployment
    kubectl scale deployment api-gateway-canary --replicas=0 -n azora-$ENVIRONMENT || true
    kubectl scale deployment auth-service-canary --replicas=0 -n azora-$ENVIRONMENT || true
    kubectl scale deployment lms-service-canary --replicas=0 -n azora-$ENVIRONMENT || true

    echo "✅ Rollback completed"
    exit 1
}

# Trap errors and rollback
trap rollback ERR

# Deploy canary deployments
echo "📦 Deploying canary deployments..."
kubectl set image deployment/api-gateway-canary api-gateway=azora/api-gateway:$IMAGE_TAG -n azora-$ENVIRONMENT
kubectl set image deployment/auth-service-canary auth-service=azora/auth-service:$IMAGE_TAG -n azora-$ENVIRONMENT
kubectl set image deployment/lms-service-canary lms-service=azora/lms-service:$IMAGE_TAG -n azora-$ENVIRONMENT

# Wait for canary rollout
echo "⏳ Waiting for canary rollout..."
kubectl rollout status deployment/api-gateway-canary -n azora-$ENVIRONMENT --timeout=300s
kubectl rollout status deployment/auth-service-canary -n azora-$ENVIRONMENT --timeout=300s
kubectl rollout status deployment/lms-service-canary -n azora-$ENVIRONMENT --timeout=300s

# Run smoke tests on canary
echo "🧪 Running smoke tests on canary..."
if kubectl exec -n azora-$ENVIRONMENT deployment/api-gateway-canary -- wget --quiet --tries=1 --spider http://localhost:4000/health; then
    echo "✅ API Gateway canary smoke test passed"
else
    echo "❌ API Gateway canary smoke test failed"
    rollback
fi

# Gradually shift traffic
echo "🔄 Gradually shifting traffic to canary..."

# 10% traffic
echo "📊 Shifting 10% traffic to canary..."
kubectl apply -f - <<EOF
apiVersion: networking.istio.io/v1beta1
kind: VirtualService
metadata:
  name: api-gateway
  namespace: azora-$ENVIRONMENT
spec:
  http:
  - route:
    - destination:
        host: api-gateway
        subset: stable
      weight: 90
    - destination:
        host: api-gateway
        subset: canary
      weight: 10
EOF

sleep 60

# Monitor error rates and latency
echo "📊 Monitoring canary metrics..."
ERROR_RATE=$(kubectl exec -n monitoring prometheus-0 -- promtool query instant http://localhost:9090 'rate(http_requests_total{status=~"5.."}[5m]) / rate(http_requests_total[5m]) * 100' 2>/dev/null | tail -1 || echo "0")

if (( $(echo "$ERROR_RATE > 5" | bc -l 2>/dev/null || echo "0") )); then
    echo "❌ High error rate detected: ${ERROR_RATE}%"
    rollback
fi

# 25% traffic
echo "📊 Shifting 25% traffic to canary..."
kubectl apply -f - <<EOF
apiVersion: networking.istio.io/v1beta1
kind: VirtualService
metadata:
  name: api-gateway
  namespace: azora-$ENVIRONMENT
spec:
  http:
  - route:
    - destination:
        host: api-gateway
        subset: stable
      weight: 75
    - destination:
        host: api-gateway
        subset: canary
      weight: 25
EOF

sleep 120

# Monitor again
ERROR_RATE=$(kubectl exec -n monitoring prometheus-0 -- promtool query instant http://localhost:9090 'rate(http_requests_total{status=~"5.."}[5m]) / rate(http_requests_total[5m]) * 100' 2>/dev/null | tail -1 || echo "0")

if (( $(echo "$ERROR_RATE > 3" | bc -l 2>/dev/null || echo "0") )); then
    echo "❌ High error rate detected: ${ERROR_RATE}%"
    rollback
fi

# 50% traffic
echo "📊 Shifting 50% traffic to canary..."
kubectl apply -f - <<EOF
apiVersion: networking.istio.io/v1beta1
kind: VirtualService
metadata:
  name: api-gateway
  namespace: azora-$ENVIRONMENT
spec:
  http:
  - route:
    - destination:
        host: api-gateway
        subset: stable
      weight: 50
    - destination:
        host: api-gateway
        subset: canary
      weight: 50
EOF

sleep 300

# Final monitoring
ERROR_RATE=$(kubectl exec -n monitoring prometheus-0 -- promtool query instant http://localhost:9090 'rate(http_requests_total{status=~"5.."}[5m]) / rate(http_requests_total[5m]) * 100' 2>/dev/null | tail -1 || echo "0")

if (( $(echo "$ERROR_RATE > 2" | bc -l 2>/dev/null || echo "0") )); then
    echo "❌ High error rate detected: ${ERROR_RATE}%"
    rollback
fi

# Full rollout
echo "🎯 Full rollout - 100% traffic to canary..."
kubectl apply -f - <<EOF
apiVersion: networking.istio.io/v1beta1
kind: VirtualService
metadata:
  name: api-gateway
  namespace: azora-$ENVIRONMENT
spec:
  http:
  - route:
    - destination:
        host: api-gateway
        subset: canary
      weight: 100
EOF

# Scale down old deployments
echo "⬇️ Scaling down stable deployments..."
kubectl scale deployment api-gateway-stable --replicas=0 -n azora-$ENVIRONMENT
kubectl scale deployment auth-service-stable --replicas=0 -n azora-$ENVIRONMENT
kubectl scale deployment lms-service-stable --replicas=0 -n azora-$ENVIRONMENT

# Rename canary to stable
echo "🏷️ Promoting canary to stable..."
kubectl label deployment api-gateway-canary color=stable --overwrite -n azora-$ENVIRONMENT
kubectl label deployment auth-service-canary color=stable --overwrite -n azora-$ENVIRONMENT
kubectl label deployment lms-service-canary color=stable --overwrite -n azora-$ENVIRONMENT

kubectl patch service api-gateway -n azora-$ENVIRONMENT -p '{
    "spec": {
        "selector": {"color": "stable"}
    }
}'

echo "🎉 Canary deployment successful!"
echo "📊 Monitor metrics at: http://grafana.azora-$ENVIRONMENT.svc.cluster.local"