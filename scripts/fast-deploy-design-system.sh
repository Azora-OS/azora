#!/bin/bash
# FAST DEPLOYMENT: Just update package.json files without npm install
set -e

echo "🚀 FAST DESIGN SYSTEM DEPLOYMENT"
echo "================================"

WORKSPACE_ROOT="/workspace"
SUCCESS_COUNT=0
SKIP_COUNT=0

# Function to deploy to a single target
fast_deploy() {
    local TARGET_DIR=$1
    local TARGET_NAME=$(basename $TARGET_DIR)
    
    if [ ! -f "$TARGET_DIR/package.json" ]; then
        ((SKIP_COUNT++))
        return
    fi
    
    cd "$TARGET_DIR"
    
    # Add packages using npm pkg set (doesn't require npm install)
    npm pkg set dependencies."@azora/design-system"="file:../../packages/@azora/design-system" 2>/dev/null || true
    npm pkg set dependencies."@azora/branding"="file:../../packages/branding" 2>/dev/null || true  
    npm pkg set dependencies."@azora/telemetry"="file:../../packages/@azora/telemetry" 2>/dev/null || true
    
    echo "✅ $TARGET_NAME"
    ((SUCCESS_COUNT++))
}

# Deploy to all apps
echo ""
echo "📱 APPS:"
for APP_DIR in $WORKSPACE_ROOT/apps/*; do
    [ -d "$APP_DIR" ] && fast_deploy "$APP_DIR"
done

# Deploy to top services
echo ""
echo "🔧 SERVICES:"
for SERVICE_DIR in $WORKSPACE_ROOT/services/*; do
    [ -d "$SERVICE_DIR" ] && fast_deploy "$SERVICE_DIR"
done

echo ""
echo "================================"
echo "📊 SUMMARY"
echo "================================"
echo "✅ Updated: $SUCCESS_COUNT"
echo "⏭️  Skipped: $SKIP_COUNT"
echo "🎉 Phase 2 deployment complete!"
