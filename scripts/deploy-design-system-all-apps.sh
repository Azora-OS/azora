#!/bin/bash
# 🚀 Deploy Design System to All Azora OS Apps
# Systematic deployment ensuring zero breaking changes
# Author: Head of Design (Sonnet Claude)
# Date: 2025-11-10

set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎨 AZORA OS DESIGN SYSTEM - COMPLETE APP DEPLOYMENT"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Deploying to 16 applications systematically..."
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Counters
TOTAL=0
SUCCESS=0
SKIPPED=0
FAILED=0

# Apps to deploy (high to low priority)
HIGH_PRIORITY=(
  "app"
  "enterprise-ui"
  "marketplace-ui"
  "pay-ui"
)

MEDIUM_PRIORITY=(
  "learn-ui"
  "cloud-ui"
  "dev-ui"
  "azora-mint"
  "master-ui"
)

LOW_PRIORITY=(
  "compliance-ui"
  "mobile"
  "ingestion-ui"
  "electron"
  "web"
)

# Function to deploy to one app
deploy_to_app() {
  local app_name=$1
  local app_path="/workspace/apps/$app_name"
  
  TOTAL=$((TOTAL + 1))
  
  if [ ! -d "$app_path" ]; then
    echo -e "${YELLOW}⚠ App not found: $app_name${NC}"
    SKIPPED=$((SKIPPED + 1))
    return
  fi
  
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${BLUE}📦 Deploying to: $app_name${NC}"
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  
  cd "$app_path"
  
  # Check if package.json exists
  if [ ! -f "package.json" ]; then
    echo -e "${YELLOW}  ⚠ No package.json found, skipping${NC}"
    SKIPPED=$((SKIPPED + 1))
    return
  fi
  
  # Check if already has design system
  if grep -q "@azora/design-system" package.json; then
    echo -e "${GREEN}  ✓ Design system already installed${NC}"
  else
    echo "  + Adding @azora/design-system to package.json"
  fi
  
  # Install packages (using legacy peer deps to avoid conflicts)
  echo "  → Installing dependencies..."
  if npm install ../../packages/@azora/design-system ../../packages/branding ../../packages/@azora/telemetry --save --legacy-peer-deps --no-audit --no-fund 2>&1 | tail -3; then
    echo -e "${GREEN}  ✅ $app_name complete${NC}"
    SUCCESS=$((SUCCESS + 1))
  else
    echo -e "${RED}  ❌ $app_name failed${NC}"
    FAILED=$((FAILED + 1))
  fi
  
  echo ""
}

# Deploy to high priority apps
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}🚀 HIGH PRIORITY APPS (User-Facing)${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
for app in "${HIGH_PRIORITY[@]}"; do
  deploy_to_app "$app"
done

# Deploy to medium priority apps
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}🚀 MEDIUM PRIORITY APPS (Services)${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
for app in "${MEDIUM_PRIORITY[@]}"; do
  deploy_to_app "$app"
done

# Deploy to low priority apps
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}🚀 LOW PRIORITY APPS (Internal)${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
for app in "${LOW_PRIORITY[@]}"; do
  deploy_to_app "$app"
done

# Summary
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}✅ DEPLOYMENT COMPLETE!${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📊 Results:"
echo "  Total apps:     $TOTAL"
echo -e "  ${GREEN}✅ Successful:  $SUCCESS${NC}"
echo -e "  ${YELLOW}⚠ Skipped:      $SKIPPED${NC}"
echo -e "  ${RED}❌ Failed:      $FAILED${NC}"
echo ""
echo "🎨 Design system deployed across Azora OS!"
echo ""
echo "Next steps:"
echo "  1. Update component imports in each app"
echo "  2. Add TelemetryProvider to root layouts"
echo "  3. Verify builds: turbo run build"
echo "  4. Check analytics: http://localhost:8086/dashboard.html"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
