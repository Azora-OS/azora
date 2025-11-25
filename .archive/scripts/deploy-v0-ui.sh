#!/bin/bash

# Azora v0 UI Deployment Script
# Deploys v0 components + Azora branding to all apps

echo "🚀 Starting Azora v0 UI Deployment..."

# Apps to deploy to
APPS=(
  "student-portal"
  "app"
  "marketplace-ui"
  "pay-ui"
  "enterprise-ui"
  "azora-mint"
  "learn-ui"
  "cloud-ui"
  "compliance-ui"
  "dev-ui"
)

# Deploy to each app
for APP in "${APPS[@]}"; do
  echo ""
  echo "📦 Deploying to apps/$APP..."
  
  # Create directories
  mkdir -p "apps/$APP/components"
  mkdir -p "apps/$APP/lib"
  
  # Copy all UI components
  cp -r packages/ui/components/* "apps/$APP/components/" 2>/dev/null
  
  # Copy utils
  cp packages/ui/lib/utils.ts "apps/$APP/lib/" 2>/dev/null
  
  # Copy service-specific components
  cp apps/app/components/service-logo.tsx "apps/$APP/components/" 2>/dev/null
  cp apps/app/components/elara-avatar.tsx "apps/$APP/components/" 2>/dev/null
  
  echo "✅ Deployed to $APP"
done

echo ""
echo "🎉 Deployment Complete!"
echo "📊 Deployed to ${#APPS[@]} apps"
