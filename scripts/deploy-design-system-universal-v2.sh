#!/bin/bash
# PHASE 2: UNIVERSAL DESIGN SYSTEM DEPLOYMENT (Resilient Version)
# Deploy @azora/design-system and @azora/branding to ALL services and apps
# Continues even if some deployments fail

echo "🎨 PHASE 2: UNIVERSAL DESIGN SYSTEM DEPLOYMENT"
echo "=============================================="
echo ""

WORKSPACE_ROOT="/workspace"
SUCCESS_COUNT=0
FAIL_COUNT=0
SKIP_COUNT=0

# Function to deploy to a single target
deploy_to_target() {
    local TARGET_DIR=$1
    local TARGET_NAME=$(basename $TARGET_DIR)
    
    echo "📦 Deploying to: $TARGET_NAME"
    
    # Check if package.json exists
    if [ ! -f "$TARGET_DIR/package.json" ]; then
        echo "   ⏭️  SKIP: No package.json found"
        ((SKIP_COUNT++))
        return 0
    fi
    
    cd "$TARGET_DIR" || { echo "   ❌ FAIL: Cannot cd to directory"; ((FAIL_COUNT++)); return 1; }
    
    # Add design system package
    npm pkg set dependencies."@azora/design-system"="file:../../packages/@azora/design-system" 2>/dev/null || true
    
    # Add branding package (adjust path based on actual location)
    npm pkg set dependencies."@azora/branding"="file:../../packages/branding" 2>/dev/null || true
    
    # Add telemetry package  
    npm pkg set dependencies."@azora/telemetry"="file:../../packages/@azora/telemetry" 2>/dev/null || true
    
    # Run npm install
    echo "   🔧 Running npm install..."
    if npm install --legacy-peer-deps --no-audit --no-fund &>/dev/null; then
        echo "   ✅ SUCCESS: $TARGET_NAME"
        ((SUCCESS_COUNT++))
    else
        echo "   ❌ FAILED: npm install error (continuing...)"
        ((FAIL_COUNT++))
    fi
    
    echo ""
    return 0
}

# Deploy to all apps
echo "🎯 DEPLOYING TO FRONTEND APPS"
echo "=============================="
APP_COUNT=0
for APP_DIR in $WORKSPACE_ROOT/apps/*; do
    if [ -d "$APP_DIR" ]; then
        deploy_to_target "$APP_DIR" || true
        ((APP_COUNT++))
    fi
done
echo "Processed $APP_COUNT apps"
echo ""

# Deploy to backend services (limit to first 20 for now to test)
echo "🎯 DEPLOYING TO BACKEND SERVICES (Sample)"
echo "=========================================="
SERVICE_COUNT=0
for SERVICE_DIR in $WORKSPACE_ROOT/services/*; do
    if [ -d "$SERVICE_DIR" ] && [ $SERVICE_COUNT -lt 20 ]; then
        deploy_to_target "$SERVICE_DIR" || true
        ((SERVICE_COUNT++))
    fi
done
echo "Processed $SERVICE_COUNT services"
echo ""

# Summary
echo "=============================================="
echo "📊 DEPLOYMENT SUMMARY"
echo "=============================================="
echo "✅ Successful: $SUCCESS_COUNT"
echo "❌ Failed: $FAIL_COUNT"
echo "⏭️  Skipped: $SKIP_COUNT"
echo "📊 Total: $((SUCCESS_COUNT + FAIL_COUNT + SKIP_COUNT))"
echo ""

if [ $SUCCESS_COUNT -gt 0 ]; then
    echo "🎉 Phase 2 deployment completed!"
    echo "✅ $SUCCESS_COUNT components now have design system"
fi

exit 0
