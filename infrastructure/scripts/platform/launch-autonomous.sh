#!/bin/bash
# 🚀 AZORA OS - AUTONOMOUS LAUNCH (NO PROMPTS)
set -e

LOG="deployment-$(date +%Y%m%d-%H%M%S).log"
ROOT="/workspace"

echo "════════════════════════════════════════════════════════"
echo "          🌍 AZORA OS - AUTONOMOUS DEPLOYMENT 🌍"
echo "════════════════════════════════════════════════════════"
echo ""
echo "🚀 LAUNCHING ALL 11 SERVICES..."
echo "Log: $LOG"
echo ""

DEPLOYED=0
FAILED=0

deploy() {
    local num=$1
    local name=$2
    local path=$3
    
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "[$num/11] 🚀 $name"
    echo "Path: $path"
    
    cd "$ROOT"
    [ "$path" != "." ] && cd "$path" 2>/dev/null || { echo "❌ Path not found"; FAILED=$((FAILED+1)); return 1; }
    
    [ -f "package.json" ] && [ ! -d "node_modules" ] && echo "📦 Installing..." && npm install >> "$ROOT/$LOG" 2>&1
    
    echo "🚀 Deploying..."
    if vercel --prod --yes >> "$ROOT/$LOG" 2>&1; then
        echo "✅ SUCCESS"
        DEPLOYED=$((DEPLOYED+1))
    else
        echo "❌ FAILED (check log)"
        FAILED=$((FAILED+1))
    fi
    echo ""
}

# LAUNCH SEQUENCE
deploy 1 "Main Application" "."
deploy 2 "Elara IDE" "elara-ide"
deploy 3 "Marketplace UI" "marketplace-ui"
deploy 4 "Pay UI" "pay-ui"
deploy 5 "Synapse Portal" "synapse"
deploy 6 "Synapse Vigil UI" "synapse/vigil-ui"
deploy 7 "Synapse Academy UI" "synapse/academy-ui"
deploy 8 "Synapse Frontend" "synapse/frontend"
deploy 9 "Mint-Mine Engine" "azora/azora-mint-mine-engine-next"
deploy 10 "Synapse API" "services/azora-synapse"
deploy 11 "Onboarding Service" "services/azora-onboarding"

cd "$ROOT"

echo "════════════════════════════════════════════════════════"
echo "                  DEPLOYMENT COMPLETE"
echo "════════════════════════════════════════════════════════"
echo ""
echo "Summary:"
echo "  ✅ Deployed: $DEPLOYED/11"
echo "  ❌ Failed: $FAILED/11"
echo ""
echo "Log: $LOG"
echo ""

[ $FAILED -eq 0 ] && echo "🎉 ALL SYSTEMS OPERATIONAL!" || echo "⚠️  Check log for failures"
