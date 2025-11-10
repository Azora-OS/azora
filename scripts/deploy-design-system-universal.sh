#!/bin/bash
# PHASE 2: UNIVERSAL DESIGN SYSTEM DEPLOYMENT
# Deploy @azora/design-system and @azora/branding to ALL services and apps

set -e

echo "🎨 PHASE 2: UNIVERSAL DESIGN SYSTEM DEPLOYMENT"
echo "=============================================="
echo ""

WORKSPACE_ROOT="/workspace"
DESIGN_SYSTEM_PATH="$WORKSPACE_ROOT/packages/@azora/design-system"
BRANDING_PATH="$WORKSPACE_ROOT/packages/@azora/branding"
TELEMETRY_PATH="$WORKSPACE_ROOT/packages/@azora/telemetry"

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
        return
    fi
    
    cd "$TARGET_DIR"
    
    # Add design system package
    if npm pkg get dependencies."@azora/design-system" &>/dev/null; then
        echo "   ✅ @azora/design-system already installed"
    else
        echo "   📥 Installing @azora/design-system..."
        npm pkg set dependencies."@azora/design-system"="file:../../packages/@azora/design-system" 2>/dev/null || true
    fi
    
    # Add branding package
    if npm pkg get dependencies."@azora/branding" &>/dev/null; then
        echo "   ✅ @azora/branding already installed"
    else
        echo "   📥 Installing @azora/branding..."
        npm pkg set dependencies."@azora/branding"="file:../../packages/@azora/branding" 2>/dev/null || true
    fi
    
    # Add telemetry package
    if npm pkg get dependencies."@azora/telemetry" &>/dev/null; then
        echo "   ✅ @azora/telemetry already installed"
    else
        echo "   📥 Installing @azora/telemetry..."
        npm pkg set dependencies."@azora/telemetry"="file:../../packages/@azora/telemetry" 2>/dev/null || true
    fi
    
    # Run npm install
    echo "   🔧 Running npm install..."
    if npm install --legacy-peer-deps --no-audit --no-fund &>/dev/null; then
        echo "   ✅ SUCCESS: $TARGET_NAME"
        ((SUCCESS_COUNT++))
    else
        echo "   ❌ FAILED: npm install error"
        ((FAIL_COUNT++))
    fi
    
    echo ""
}

# Deploy to all apps
echo "🎯 DEPLOYING TO FRONTEND APPS"
echo "=============================="
for APP_DIR in $WORKSPACE_ROOT/apps/*; do
    if [ -d "$APP_DIR" ] && [ ! "$APP_DIR" == "*" ]; then
        deploy_to_target "$APP_DIR"
    fi
done

echo ""
echo "🎯 DEPLOYING TO BACKEND SERVICES"
echo "================================="
for SERVICE_DIR in $WORKSPACE_ROOT/services/*; do
    if [ -d "$SERVICE_DIR" ] && [ ! "$SERVICE_DIR" == "*" ]; then
        deploy_to_target "$SERVICE_DIR"
    fi
done

# Summary
echo ""
echo "=============================================="
echo "📊 DEPLOYMENT SUMMARY"
echo "=============================================="
echo "✅ Successful: $SUCCESS_COUNT"
echo "❌ Failed: $FAIL_COUNT"
echo "⏭️  Skipped: $SKIP_COUNT"
echo "📊 Total: $((SUCCESS_COUNT + FAIL_COUNT + SKIP_COUNT))"
echo ""

if [ $FAIL_COUNT -eq 0 ]; then
    echo "🎉 ALL DEPLOYMENTS SUCCESSFUL!"
    exit 0
else
    echo "⚠️  Some deployments failed. Check logs above."
    exit 1
fi
