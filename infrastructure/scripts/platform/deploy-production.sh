#!/bin/bash

# 🚀 AZORA OS - Production Deployment Script
# Deploys all 12 services to Vercel in the correct order

set -e

TIMESTAMP=$(date +%Y%m%d-%H%M%S)
LOG_FILE="deployment-${TIMESTAMP}.log"
ROOT_DIR=$(pwd)

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Counters
DEPLOYED=0
FAILED=0
TOTAL=12

echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${CYAN}          🌍 AZORA OS - PRODUCTION DEPLOYMENT 🌍${NC}"
echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}"
echo ""
echo "Deploying 12 services to Vercel..."
echo "Log file: ${LOG_FILE}"
echo ""
echo "Services:"
echo "  1. Main Application (azora.world)"
echo "  2. Elara IDE (ide.azora.world)"
echo "  3. Marketplace UI (marketplace.azora.world)"
echo "  4. Pay UI (pay.azora.world)"
echo "  5. Synapse Portal (synapse.azora.world)"
echo "  6. Synapse Vigil UI (vigil.azora.world)"
echo "  7. Synapse Academy UI (academy.azora.world)"
echo "  8. Synapse Frontend"
echo "  9. Mint-Mine Engine (mint.azora.world)"
echo " 10. Synapse API (synapse-api.azora.world)"
echo " 11. Onboarding Service (onboard.azora.world)"
echo " 12. UI Components (ui.azora.world)"
echo ""
read -p "Continue with deployment? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Deployment cancelled."
    exit 1
fi

# Log function
log() {
    echo -e "$1" | tee -a "${LOG_FILE}"
}

# Deployment function
deploy_service() {
    local num=$1
    local name=$2
    local path=$3
    local domain=$4
    
    log ""
    log "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    log "${CYAN}[$num/$TOTAL] Deploying: ${name}${NC}"
    log "${CYAN}📂 Path: ${path}${NC}"
    if [ -n "$domain" ]; then
        log "${CYAN}🌐 Domain: ${domain}${NC}"
    fi
    log ""
    
    # Navigate to service directory
    cd "${ROOT_DIR}"
    if [ -n "$path" ] && [ "$path" != "." ]; then
        if [ ! -d "$path" ]; then
            log "${RED}❌ FAILED: Directory not found${NC}"
            FAILED=$((FAILED + 1))
            return 1
        fi
        cd "$path"
    fi
    
    # Check for package.json
    if [ ! -f "package.json" ]; then
        log "${YELLOW}⚠️  No package.json found, skipping npm install${NC}"
    else
        # Install dependencies if node_modules doesn't exist
        if [ ! -d "node_modules" ]; then
            log "📦 Installing dependencies..."
            if npm install >> "${ROOT_DIR}/${LOG_FILE}" 2>&1; then
                log "${GREEN}✓ Dependencies installed${NC}"
            else
                log "${YELLOW}⚠️  Dependency installation had warnings (continuing...)${NC}"
            fi
        else
            log "${GREEN}✓ Dependencies already installed${NC}"
        fi
    fi
    
    # Deploy to Vercel
    log "🚀 Deploying to Vercel..."
    if vercel --prod --yes >> "${ROOT_DIR}/${LOG_FILE}" 2>&1; then
        log "${GREEN}✅ SUCCESS: ${name} deployed${NC}"
        DEPLOYED=$((DEPLOYED + 1))
        
        # Get deployment URL
        local url=$(vercel ls --prod 2>/dev/null | grep "https://" | head -1 | awk '{print $2}')
        if [ -n "$url" ]; then
            log "${GREEN}   URL: ${url}${NC}"
        fi
        return 0
    else
        log "${RED}❌ FAILED: ${name} deployment failed${NC}"
        log "${YELLOW}   Check ${LOG_FILE} for details${NC}"
        FAILED=$((FAILED + 1))
        return 1
    fi
}

# Start deployment
log ""
log "${GREEN}🚀 Starting deployment at $(date)${NC}"
log ""

# 1. Main Application
deploy_service 1 "Main Application" "." "azora.world"

# 2. Elara IDE
deploy_service 2 "Elara IDE" "elara-ide" "ide.azora.world"

# 3. Marketplace UI
deploy_service 3 "Marketplace UI" "marketplace-ui" "marketplace.azora.world"

# 4. Pay UI
deploy_service 4 "Pay UI" "pay-ui" "pay.azora.world"

# 5. Synapse Portal
deploy_service 5 "Synapse Portal" "synapse" "synapse.azora.world"

# 6. Synapse Vigil UI
deploy_service 6 "Synapse Vigil UI" "synapse/vigil-ui" "vigil.azora.world"

# 7. Synapse Academy UI
deploy_service 7 "Synapse Academy UI" "synapse/academy-ui" "academy.azora.world"

# 8. Synapse Frontend
deploy_service 8 "Synapse Frontend" "synapse/frontend" ""

# 9. Mint-Mine Engine
deploy_service 9 "Mint-Mine Engine" "azora/azora-mint-mine-engine-next" "mint.azora.world"

# 10. Synapse API
deploy_service 10 "Synapse API" "services/azora-synapse" "synapse-api.azora.world"

# 11. Onboarding Service  
deploy_service 11 "Onboarding Service" "services/azora-onboarding" "onboard.azora.world"

# 12. UI Components
if [ -d "ui" ]; then
    deploy_service 12 "UI Components" "ui" "ui.azora.world"
else
    log "${YELLOW}⚠️  UI Components directory not found, skipping${NC}"
fi

# Return to root
cd "${ROOT_DIR}"

# Summary
log ""
log "${CYAN}═══════════════════════════════════════════════════════════════${NC}"
log "${CYAN}                    DEPLOYMENT COMPLETE${NC}"
log "${CYAN}═══════════════════════════════════════════════════════════════${NC}"
log ""
log "📊 Summary:"
log "   ${GREEN}✅ Deployed: ${DEPLOYED}/${TOTAL}${NC}"
log "   ${RED}❌ Failed: ${FAILED}/${TOTAL}${NC}"
log ""
log "📝 Full log: ${LOG_FILE}"
log ""

if [ $FAILED -gt 0 ]; then
    log "${YELLOW}⚠️  Some deployments failed. Check the log for details:${NC}"
    log "${YELLOW}   tail -100 ${LOG_FILE}${NC}"
    log ""
    exit 1
else
    log "${GREEN}🎉 All services deployed successfully!${NC}"
    log ""
    log "${CYAN}🌐 Your Azora OS ecosystem is now live!${NC}"
    log ""
    log "Access your services:"
    log "  • Main: https://azora.world"
    log "  • IDE: https://ide.azora.world"
    log "  • Marketplace: https://marketplace.azora.world"
    log "  • Pay: https://pay.azora.world"
    log "  • Onboard: https://onboard.azora.world"
    log "  • Synapse: https://synapse.azora.world"
    log "  • Vigil: https://vigil.azora.world"
    log "  • Academy: https://academy.azora.world"
    log "  • Mint: https://mint.azora.world"
    log "  • API: https://synapse-api.azora.world"
    log "  • UI: https://ui.azora.world"
    log ""
fi

log "Completed at $(date)"
log ""

# Show next steps
if [ $DEPLOYED -eq $TOTAL ]; then
    echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
    echo -e "${GREEN}                    🎉 NEXT STEPS 🎉${NC}"
    echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
    echo ""
    echo "1. Configure custom domains in Vercel dashboard"
    echo "2. Set up DNS records (CNAME → cname.vercel-dns.com)"
    echo "3. Add environment variables if needed"
    echo "4. Test each service endpoint"
    echo "5. Announce your launch! 🚀"
    echo ""
    echo "Run health checks:"
    echo "  curl https://onboard.azora.world/health"
    echo "  curl https://synapse-api.azora.world/health"
    echo ""
fi
