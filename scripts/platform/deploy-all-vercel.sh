#!/bin/bash

# 🚀 AZORA OS - Deploy All Services to Vercel
# Deploys the entire ecosystem in one command

set -e

DEPLOY_LOG="deployment-$(date +%Y%m%d-%H%M%S).log"

echo "═══════════════════════════════════════════════════════════════"
echo "          🌍 AZORA OS - COMPLETE ECOSYSTEM DEPLOYMENT"
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "This will deploy 12 services to Vercel:"
echo "  1. Main Application (azora.world)"
echo "  2. Elara IDE (ide.azora.world)"
echo "  3. Marketplace UI (marketplace.azora.world)"
echo "  4. Pay UI (pay.azora.world)"
echo "  5. Synapse Portal (synapse.azora.world)"
echo "  6. Synapse Vigil UI (vigil.azora.world)"
echo "  7. Synapse Academy UI (academy.azora.world)"
echo "  8. Synapse Frontend (synapse.azora.world)"
echo "  9. Mint-Mine Engine (mint.azora.world)"
echo " 10. Onboarding Service (onboard.azora.world)"
echo " 11. Synapse API (synapse-api.azora.world)"
echo " 12. UI Components (ui.azora.world)"
echo ""
echo "Log file: $DEPLOY_LOG"
echo ""
read -p "Continue with deployment? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Deployment cancelled."
    exit 1
fi

echo "" | tee -a "$DEPLOY_LOG"
echo "🚀 Starting deployment at $(date)" | tee -a "$DEPLOY_LOG"
echo "" | tee -a "$DEPLOY_LOG"

DEPLOYED=0
FAILED=0
SKIPPED=0

deploy_service() {
    local name=$1
    local path=$2
    local custom_domain=$3
    
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" | tee -a "$DEPLOY_LOG"
    echo "📦 Deploying: $name" | tee -a "$DEPLOY_LOG"
    echo "📂 Path: $path" | tee -a "$DEPLOY_LOG"
    echo "🌐 Domain: $custom_domain" | tee -a "$DEPLOY_LOG"
    echo "" | tee -a "$DEPLOY_LOG"
    
    if [ ! -d "$path" ]; then
        echo "⚠️  SKIPPED: Directory not found" | tee -a "$DEPLOY_LOG"
        SKIPPED=$((SKIPPED + 1))
        return
    fi
    
    cd "$path"
    
    # Check if package.json exists
    if [ ! -f "package.json" ]; then
        echo "⚠️  SKIPPED: No package.json found" | tee -a "$DEPLOY_LOG"
        cd - > /dev/null
        SKIPPED=$((SKIPPED + 1))
        return
    fi
    
    # Install dependencies if needed
    if [ ! -d "node_modules" ]; then
        echo "📦 Installing dependencies..." | tee -a "$DEPLOY_LOG"
        npm install >> "$DEPLOY_LOG" 2>&1
    fi
    
    # Deploy with Vercel
    echo "🚀 Deploying to Vercel..." | tee -a "$DEPLOY_LOG"
    if vercel --prod --yes >> "$DEPLOY_LOG" 2>&1; then
        echo "✅ SUCCESS: $name deployed" | tee -a "$DEPLOY_LOG"
        DEPLOYED=$((DEPLOYED + 1))
    else
        echo "❌ FAILED: $name deployment failed (check log for details)" | tee -a "$DEPLOY_LOG"
        FAILED=$((FAILED + 1))
    fi
    
    cd - > /dev/null
    echo "" | tee -a "$DEPLOY_LOG"
}

# Deploy all services
echo "Starting deployments..." | tee -a "$DEPLOY_LOG"
echo "" | tee -a "$DEPLOY_LOG"

# 1. Main Application
deploy_service "Main Application" "." "azora.world"

# 2. Elara IDE
deploy_service "Elara IDE" "./elara-ide" "ide.azora.world"

# 3. Marketplace UI
deploy_service "Marketplace UI" "./marketplace-ui" "marketplace.azora.world"

# 4. Pay UI
deploy_service "Pay UI" "./pay-ui" "pay.azora.world"

# 5. Synapse Portal
deploy_service "Synapse Portal" "./synapse" "azora.world"

# 6. Synapse Vigil UI
deploy_service "Synapse Vigil UI" "./synapse/vigil-ui" "vigil.azora.world"

# 7. Synapse Academy UI
deploy_service "Synapse Academy UI" "./synapse/academy-ui" "academy.azora.world"

# 8. Synapse Frontend
deploy_service "Synapse Frontend" "./synapse/frontend" "synapse.azora.world"

# 9. Mint-Mine Engine
deploy_service "Mint-Mine Engine" "./azora/azora-mint-mine-engine-next" "mint.azora.world"

# 10. Onboarding Service
deploy_service "Onboarding Service" "./services/azora-onboarding" "onboard.azora.world"

# 11. Synapse API
deploy_service "Synapse API" "./services/azora-synapse" "synapse-api.azora.world"

# 12. UI Components
deploy_service "UI Components" "./ui" "ui.azora.world"

# Summary
echo "═══════════════════════════════════════════════════════════════" | tee -a "$DEPLOY_LOG"
echo "                    DEPLOYMENT COMPLETE" | tee -a "$DEPLOY_LOG"
echo "═══════════════════════════════════════════════════════════════" | tee -a "$DEPLOY_LOG"
echo "" | tee -a "$DEPLOY_LOG"
echo "📊 Summary:" | tee -a "$DEPLOY_LOG"
echo "   ✅ Deployed: $DEPLOYED" | tee -a "$DEPLOY_LOG"
echo "   ❌ Failed: $FAILED" | tee -a "$DEPLOY_LOG"
echo "   ⚠️  Skipped: $SKIPPED" | tee -a "$DEPLOY_LOG"
echo "" | tee -a "$DEPLOY_LOG"
echo "📝 Full log: $DEPLOY_LOG" | tee -a "$DEPLOY_LOG"
echo "" | tee -a "$DEPLOY_LOG"

if [ $FAILED -gt 0 ]; then
    echo "⚠️  Some deployments failed. Check the log for details." | tee -a "$DEPLOY_LOG"
    exit 1
else
    echo "🎉 All services deployed successfully!" | tee -a "$DEPLOY_LOG"
    echo "" | tee -a "$DEPLOY_LOG"
    echo "🌐 Your Azora OS ecosystem is now live!" | tee -a "$DEPLOY_LOG"
fi

echo ""
echo "Completed at $(date)" | tee -a "$DEPLOY_LOG"
