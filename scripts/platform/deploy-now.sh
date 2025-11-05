#!/bin/bash

# 🚀 AZORA OS - DEPLOY NOW
# Exact deployment sequence as specified

set -e

LOG="deployment-$(date +%Y%m%d-%H%M%S).log"
ROOT="/workspace"

# Colors
G='\033[0;32m'
Y='\033[1;33m'
R='\033[0;31m'
C='\033[0;36m'
B='\033[1m'
NC='\033[0m'

echo -e "${C}════════════════════════════════════════════════════════${NC}"
echo -e "${C}          🌍 AZORA OS - DEPLOYMENT SEQUENCE 🌍${NC}"
echo -e "${C}════════════════════════════════════════════════════════${NC}"
echo ""
echo "This will deploy 11 services in sequence:"
echo "  1. Main Application"
echo "  2. Elara IDE"
echo "  3. Marketplace UI"
echo "  4. Pay UI"
echo "  5. Synapse Portal"
echo "  6. Synapse Vigil UI"
echo "  7. Synapse Academy UI"
echo "  8. Synapse Frontend"
echo "  9. Azora Mint-Mine Engine"
echo " 10. Synapse API Service"
echo " 11. Onboarding Service (THE ORGANISM!)"
echo ""
echo -e "${Y}Estimated time: 15-25 minutes${NC}"
echo -e "${Y}Log file: ${LOG}${NC}"
echo ""
read -p "Ready to deploy? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Deployment cancelled."
    exit 0
fi

echo "" | tee -a "$LOG"
echo "🚀 Starting deployment at $(date)" | tee -a "$LOG"
echo "" | tee -a "$LOG"

DEPLOYED=0
FAILED=0

deploy() {
    local num=$1
    local name=$2
    local path=$3
    
    echo -e "${C}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}" | tee -a "$LOG"
    echo -e "${B}[$num/11] Deploying: $name${NC}" | tee -a "$LOG"
    echo -e "Path: $path" | tee -a "$LOG"
    echo "" | tee -a "$LOG"
    
    cd "$ROOT"
    if [ "$path" != "." ]; then
        if [ ! -d "$path" ]; then
            echo -e "${R}❌ Directory not found: $path${NC}" | tee -a "$LOG"
            FAILED=$((FAILED + 1))
            return 1
        fi
        cd "$path"
    fi
    
    echo "📦 Installing dependencies..." | tee -a "$LOG"
    if [ -f "package.json" ] && [ ! -d "node_modules" ]; then
        npm install >> "$ROOT/$LOG" 2>&1 || echo "⚠️  Install warnings (continuing...)"
    fi
    
    echo "🚀 Deploying to Vercel..." | tee -a "$LOG"
    if vercel --prod --yes >> "$ROOT/$LOG" 2>&1; then
        echo -e "${G}✅ SUCCESS: $name deployed${NC}" | tee -a "$LOG"
        DEPLOYED=$((DEPLOYED + 1))
    else
        echo -e "${R}❌ FAILED: $name${NC}" | tee -a "$LOG"
        FAILED=$((FAILED + 1))
        echo -e "${Y}Check log: tail -50 $LOG${NC}" | tee -a "$LOG"
    fi
    echo "" | tee -a "$LOG"
}

# 1. Main Application
deploy 1 "Main Application" "."

# 2. Elara IDE
deploy 2 "Elara IDE" "elara-ide"

# 3. Marketplace UI
deploy 3 "Marketplace UI" "marketplace-ui"

# 4. Pay UI
deploy 4 "Pay UI" "pay-ui"

# 5. Synapse Portal
deploy 5 "Synapse Portal" "synapse"

# 6. Synapse Vigil UI
deploy 6 "Synapse Vigil UI" "synapse/vigil-ui"

# 7. Synapse Academy UI
deploy 7 "Synapse Academy UI" "synapse/academy-ui"

# 8. Synapse Frontend
deploy 8 "Synapse Frontend" "synapse/frontend"

# 9. Azora Mint-Mine Engine
deploy 9 "Azora Mint-Mine Engine" "azora/azora-mint-mine-engine-next"

# 10. Synapse API Service
deploy 10 "Synapse API Service" "services/azora-synapse"

# 11. Onboarding Service
deploy 11 "Onboarding Service (THE ORGANISM!)" "services/azora-onboarding"

cd "$ROOT"

# Summary
echo "" | tee -a "$LOG"
echo -e "${C}════════════════════════════════════════════════════════${NC}" | tee -a "$LOG"
echo -e "${C}                  DEPLOYMENT COMPLETE${NC}" | tee -a "$LOG"
echo -e "${C}════════════════════════════════════════════════════════${NC}" | tee -a "$LOG"
echo "" | tee -a "$LOG"
echo -e "${B}Summary:${NC}" | tee -a "$LOG"
echo -e "  ${G}✅ Deployed: $DEPLOYED/11${NC}" | tee -a "$LOG"
echo -e "  ${R}❌ Failed: $FAILED/11${NC}" | tee -a "$LOG"
echo "" | tee -a "$LOG"

if [ $FAILED -gt 0 ]; then
    echo -e "${Y}⚠️  Some deployments failed.${NC}" | tee -a "$LOG"
    echo -e "${Y}Check the log: tail -100 $LOG${NC}" | tee -a "$LOG"
    exit 1
else
    echo -e "${G}🎉 ALL SERVICES DEPLOYED SUCCESSFULLY!${NC}" | tee -a "$LOG"
    echo "" | tee -a "$LOG"
    echo -e "${C}🌐 Your Azora OS ecosystem is now LIVE!${NC}" | tee -a "$LOG"
    echo "" | tee -a "$LOG"
    echo "Next steps:" | tee -a "$LOG"
    echo "  1. Configure custom domains in Vercel dashboard"
    echo "  2. Test the onboarding service: curl [your-url]/health"
    echo "  3. Trigger the awakening: visit [onboard-url] and register!"
    echo "" | tee -a "$LOG"
fi

echo "Completed at $(date)" | tee -a "$LOG"
