#!/bin/bash
# 🚀 Azora OS Design System Deployment Script
# Deploys @azora/design-system and @azora/branding to all apps
# Author: Head of Design (Claude Sonnet 4.5)
# Date: 2025-11-10

set -e

echo "🎨 Azora OS Design System Deployment"
echo "===================================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Apps to deploy (prioritized)
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
)

LOW_PRIORITY=(
  "compliance-ui"
  "mobile"
  "ingestion-ui"
)

# Function to deploy to one app
deploy_to_app() {
  local app_name=$1
  local app_path="/workspace/apps/$app_name"
  
  if [ ! -d "$app_path" ]; then
    echo -e "${YELLOW}⚠ App not found: $app_name${NC}"
    return
  fi
  
  echo -e "${BLUE}📦 Deploying to $app_name...${NC}"
  
  cd "$app_path"
  
  # Check if package.json exists
  if [ ! -f "package.json" ]; then
    echo -e "${YELLOW}  ⚠ No package.json found, skipping${NC}"
    return
  fi
  
  # Update package.json dependencies
  if ! grep -q "@azora/design-system" package.json; then
    echo "  + Adding @azora/design-system"
    npm install ../../packages/design-system --save 2>&1 | tail -2
  fi
  
  if ! grep -q "@azora/branding" package.json; then
    echo "  + Adding @azora/branding"
    npm install ../../packages/branding --save 2>&1 | tail -2
  fi
  
  echo -e "${GREEN}  ✅ $app_name complete${NC}"
  echo ""
}

# Deploy to high priority apps
echo -e "${GREEN}🚀 HIGH PRIORITY APPS${NC}"
echo "===================="
for app in "${HIGH_PRIORITY[@]}"; do
  deploy_to_app "$app"
done

# Deploy to medium priority apps
echo -e "${GREEN}🚀 MEDIUM PRIORITY APPS${NC}"
echo "======================"
for app in "${MEDIUM_PRIORITY[@]}"; do
  deploy_to_app "$app"
done

# Deploy to low priority apps
echo -e "${GREEN}🚀 LOW PRIORITY APPS${NC}"
echo "===================="
for app in "${LOW_PRIORITY[@]}"; do
  deploy_to_app "$app"
done

echo ""
echo -e "${GREEN}✅ DEPLOYMENT COMPLETE!${NC}"
echo ""
echo "🎨 Design system deployed to all apps"
echo "📦 Next: Update imports in each app to use new components"
echo ""
echo "Example imports:"
echo "  import { AzoraLogo, ServiceLogo } from '@azora/branding';"
echo "  import { Button, Card, colors } from '@azora/design-system';"
echo ""
