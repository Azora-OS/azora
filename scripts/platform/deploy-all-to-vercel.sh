#!/bin/bash

# 🚀 AZORA OS - Deploy All Applications to Vercel
# Complete deployment script for the entire ecosystem

set -e

DEPLOY_LOG="deployment-$(date +%Y%m%d-%H%M%S).log"

echo "═══════════════════════════════════════════════════════════════" | tee "$DEPLOY_LOG"
echo "          🌍 AZORA OS - COMPLETE ECOSYSTEM DEPLOYMENT" | tee -a "$DEPLOY_LOG"
echo "═══════════════════════════════════════════════════════════════" | tee -a "$DEPLOY_LOG"
echo "" | tee -a "$DEPLOY_LOG"
echo "This will deploy ALL applications with Vercel configurations:" | tee -a "$DEPLOY_LOG"
echo "" | tee -a "$DEPLOY_LOG"

# Count applications
TOTAL_APPS=$(find . -name "vercel.json" | grep -v node_modules | wc -l)
echo "📦 Total applications: $TOTAL_APPS" | tee -a "$DEPLOY_LOG"
echo "" | tee -a "$DEPLOY_LOG"

# List all applications
echo "Applications to deploy:" | tee -a "$DEPLOY_LOG"
find . -name "vercel.json" | grep -v node_modules | sed 's|^\./||' | sed 's|/vercel.json$||' | sort | nl | tee -a "$DEPLOY_LOG"
echo "" | tee -a "$DEPLOY_LOG"

read -p "Continue with deployment? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Deployment cancelled." | tee -a "$DEPLOY_LOG"
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
    local start_dir="$(pwd)"
    
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" | tee -a "$DEPLOY_LOG"
    echo "📦 Deploying: $name" | tee -a "$DEPLOY_LOG"
    echo "📂 Path: $path" | tee -a "$DEPLOY_LOG"
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
        cd "$start_dir"
        SKIPPED=$((SKIPPED + 1))
        return
    fi
    
    # Check if vercel.json exists
    if [ ! -f "vercel.json" ]; then
        echo "⚠️  SKIPPED: No vercel.json found" | tee -a "$DEPLOY_LOG"
        cd "$start_dir"
        SKIPPED=$((SKIPPED + 1))
        return
    fi
    
    # Install dependencies if needed
    if [ ! -d "node_modules" ]; then
        echo "📦 Installing dependencies..." | tee -a "$DEPLOY_LOG"
        npm install >> "$start_dir/$DEPLOY_LOG" 2>&1 || {
            echo "⚠️  Warning: npm install had issues, continuing..." | tee -a "$start_dir/$DEPLOY_LOG"
        }
    fi
    
    # Deploy with Vercel
    echo "🚀 Deploying to Vercel..." | tee -a "$DEPLOY_LOG"
    if vercel --prod --yes >> "$start_dir/$DEPLOY_LOG" 2>&1; then
        echo "✅ SUCCESS: $name deployed" | tee -a "$DEPLOY_LOG"
        DEPLOYED=$((DEPLOYED + 1))
    else
        echo "❌ FAILED: $name deployment failed (check log for details)" | tee -a "$DEPLOY_LOG"
        FAILED=$((FAILED + 1))
    fi
    
    cd "$start_dir"
    echo "" | tee -a "$DEPLOY_LOG"
}

# Deploy all services with vercel.json
echo "Starting deployments..." | tee -a "$DEPLOY_LOG"
echo "" | tee -a "$DEPLOY_LOG"

# Main Application
deploy_service "Main Application (Root)" "."

# Azora Applications
deploy_service "Azora UI" "./azora/azora-ui"
deploy_service "Azora Mint-Mine Engine" "./azora/azora-mint-mine-engine-next"

# Elara IDE
deploy_service "Elara IDE" "./elara-ide"

# Marketplace & Pay
deploy_service "Marketplace UI" "./marketplace-ui"
deploy_service "Pay UI" "./pay-ui"

# Services
deploy_service "Azora Synapse API" "./services/azora-synapse"

# Synapse Applications
deploy_service "Synapse Portal" "./synapse"
deploy_service "Synapse Academy UI" "./synapse/academy-ui"
deploy_service "Synapse Atlas UI" "./synapse/atlas-ui"
deploy_service "Synapse Council UI" "./synapse/council-ui"
deploy_service "Synapse Frontend" "./synapse/frontend"
deploy_service "Synapse Main App" "./synapse/main-app"
deploy_service "Synapse Pulse UI" "./synapse/pulse-ui"
deploy_service "Synapse Signal UI" "./synapse/signal-ui"
deploy_service "Synapse Vault UI" "./synapse/vault-ui"
deploy_service "Synapse Vigil UI" "./synapse/vigil-ui"

# UI Components
deploy_service "UI Components" "./ui"
deploy_service "Cloud UI" "./ui/cloud-ui"
deploy_service "Compliance UI" "./ui/compliance-ui"
deploy_service "Dev UI" "./ui/dev-ui"
deploy_service "Enterprise UI" "./ui/enterprise-ui"
deploy_service "Learn UI" "./ui/learn-ui"

# Summary
echo "═══════════════════════════════════════════════════════════════" | tee -a "$DEPLOY_LOG"
echo "                    DEPLOYMENT COMPLETE" | tee -a "$DEPLOY_LOG"
echo "═══════════════════════════════════════════════════════════════" | tee -a "$DEPLOY_LOG"
echo "" | tee -a "$DEPLOY_LOG"
echo "📊 Summary:" | tee -a "$DEPLOY_LOG"
echo "   📦 Total applications: $TOTAL_APPS" | tee -a "$DEPLOY_LOG"
echo "   ✅ Successfully deployed: $DEPLOYED" | tee -a "$DEPLOY_LOG"
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

echo "" | tee -a "$DEPLOY_LOG"
echo "Completed at $(date)" | tee -a "$DEPLOY_LOG"
