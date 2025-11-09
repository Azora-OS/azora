#!/bin/bash
# AZORA OS - Emergency Rollback Script
# Immediate rollback to previous stable version

set -e

ENVIRONMENT=$1
REASON=${2:-"Emergency rollback"}

if [ -z "$ENVIRONMENT" ]; then
    echo "Usage: $0 <environment> [reason]"
    echo "Example: $0 production 'High error rates detected'"
    exit 1
fi

echo "🚨 Emergency rollback initiated for $ENVIRONMENT"
echo "📝 Reason: $REASON"
echo "⏰ Timestamp: $(date)"

# Log rollback event
echo "$(date): Emergency rollback - $REASON" >> deployment/rollback.log

# Determine current active deployment
CURRENT_IMAGE=$(kubectl get deployment api-gateway -n azora-$ENVIRONMENT -o jsonpath='{.spec.template.spec.containers[0].image}' 2>/dev/null || echo "")

if [ -z "$CURRENT_IMAGE" ]; then
    echo "❌ Could not determine current image"
    exit 1
fi

echo "📦 Current image: $CURRENT_IMAGE"

# Find previous stable image from git tags or deployment history
# This assumes you have tagged releases properly
PREVIOUS_TAG=$(git tag --sort=-version:refname | grep -E '^v[0-9]+\.[0-9]+\.[0-9]+$' | sed -n '2p' || echo "")

if [ -z "$PREVIOUS_TAG" ]; then
    echo "❌ Could not find previous stable tag"
    echo "🔍 Checking deployment history..."

    # Alternative: Check deployment history if available
    PREVIOUS_IMAGE=$(kubectl rollout history deployment/api-gateway -n azora-$ENVIRONMENT --to-revision=1 2>/dev/null | grep "Image:" | head -1 | awk '{print $2}' || echo "")

    if [ -z "$PREVIOUS_IMAGE" ]; then
        echo "❌ Could not find previous deployment image"
        echo "💡 Manual intervention required"
        exit 1
    fi
else
    PREVIOUS_IMAGE="azora/api-gateway:$PREVIOUS_TAG"
fi

echo "🔄 Rolling back to: $PREVIOUS_IMAGE"

# Immediate traffic switch to blue deployment (assuming blue-green setup)
echo "🔄 Switching traffic to blue deployment..."
kubectl patch service api-gateway -n azora-$ENVIRONMENT -p '{"spec":{"selector":{"color":"blue"}}}' || true
kubectl patch service auth-service -n azora-$ENVIRONMENT -p '{"spec":{"selector":{"color":"blue"}}}' || true
kubectl patch service lms-service -n azora-$ENVIRONMENT -p '{"spec":{"selector":{"color":"blue"}}}' || true
kubectl patch service forge-service -n azora-$ENVIRONMENT -p '{"spec":{"selector":{"color":"blue"}}}' || true
kubectl patch service nexus-service -n azora-$ENVIRONMENT -p '{"spec":{"selector":{"color":"blue"}}}' || true
kubectl patch service education-service -n azora-$ENVIRONMENT -p '{"spec":{"selector":{"color":"blue"}}}' || true
kubectl patch service payments-service -n azora-$ENVIRONMENT -p '{"spec":{"selector":{"color":"blue"}}}' || true

# Scale up blue deployment
echo "⬆️ Scaling up blue deployment..."
kubectl scale deployment api-gateway-blue --replicas=3 -n azora-$ENVIRONMENT
kubectl scale deployment auth-service-blue --replicas=2 -n azora-$ENVIRONMENT
kubectl scale deployment lms-service-blue --replicas=3 -n azora-$ENVIRONMENT
kubectl scale deployment forge-service-blue --replicas=2 -n azora-$ENVIRONMENT
kubectl scale deployment nexus-service-blue --replicas=2 -n azora-$ENVIRONMENT
kubectl scale deployment education-service-blue --replicas=3 -n azora-$ENVIRONMENT
kubectl scale deployment payments-service-blue --replicas=2 -n azora-$ENVIRONMENT

# Update blue deployment with previous image
echo "📦 Updating blue deployment with previous image..."
kubectl set image deployment/api-gateway-blue api-gateway=$PREVIOUS_IMAGE -n azora-$ENVIRONMENT
kubectl set image deployment/auth-service-blue auth-service=azora/auth-service:$PREVIOUS_TAG -n azora-$ENVIRONMENT
kubectl set image deployment/lms-service-blue lms-service=azora/lms-service:$PREVIOUS_TAG -n azora-$ENVIRONMENT
kubectl set image deployment/forge-service-blue forge-service=azora/forge-service:$PREVIOUS_TAG -n azora-$ENVIRONMENT
kubectl set image deployment/nexus-service-blue nexus-service=azora/nexus-service:$PREVIOUS_TAG -n azora-$ENVIRONMENT
kubectl set image deployment/education-service-blue education-service=azora/education-service:$PREVIOUS_TAG -n azora-$ENVIRONMENT
kubectl set image deployment/payments-service-blue payments-service=azora/payments-service:$PREVIOUS_TAG -n azora-$ENVIRONMENT

# Wait for rollout
echo "⏳ Waiting for rollback rollout..."
kubectl rollout status deployment/api-gateway-blue -n azora-$ENVIRONMENT --timeout=300s
kubectl rollout status deployment/auth-service-blue -n azora-$ENVIRONMENT --timeout=300s
kubectl rollout status deployment/lms-service-blue -n azora-$ENVIRONMENT --timeout=300s

# Scale down green deployment
echo "⬇️ Scaling down green deployment..."
kubectl scale deployment api-gateway-green --replicas=0 -n azora-$ENVIRONMENT || true
kubectl scale deployment auth-service-green --replicas=0 -n azora-$ENVIRONMENT || true
kubectl scale deployment lms-service-green --replicas=0 -n azora-$ENVIRONMENT || true
kubectl scale deployment forge-service-green --replicas=0 -n azora-$ENVIRONMENT || true
kubectl scale deployment nexus-service-green --replicas=0 -n azora-$ENVIRONMENT || true
kubectl scale deployment education-service-green --replicas=0 -n azora-$ENVIRONMENT || true
kubectl scale deployment payments-service-green --replicas=0 -n azora-$ENVIRONMENT || true

# Verify rollback success
echo "✅ Verifying rollback..."
if kubectl exec -n azora-$ENVIRONMENT deployment/api-gateway-blue -- wget --quiet --tries=1 --spider http://localhost:4000/health; then
    echo "✅ API Gateway rollback successful"
else
    echo "❌ API Gateway rollback verification failed"
    exit 1
fi

# Send notifications
echo "📢 Sending rollback notifications..."

# Slack notification (if webhook configured)
if [ -n "$SLACK_WEBHOOK" ]; then
    curl -X POST -H 'Content-type: application/json' \
        --data "{\"text\":\"🚨 Emergency rollback completed for Azora OS $ENVIRONMENT\\nReason: $REASON\\nRolled back to: $PREVIOUS_IMAGE\"}" \
        $SLACK_WEBHOOK || true
fi

# Email notification (if configured)
if [ -n "$ROLLBACK_EMAIL" ]; then
    echo "Emergency rollback completed for Azora OS $ENVIRONMENT

Reason: $REASON
Timestamp: $(date)
Previous Image: $PREVIOUS_IMAGE
Current Image: $CURRENT_IMAGE

Please investigate the issue and plan next deployment." | \
    mail -s "Azora OS Emergency Rollback - $ENVIRONMENT" $ROLLBACK_EMAIL || true
fi

echo "🎉 Emergency rollback completed successfully!"
echo "📊 Monitor metrics at: http://grafana.azora-$ENVIRONMENT.svc.cluster.local"
echo "🔍 Investigate the rollback reason and plan next steps"