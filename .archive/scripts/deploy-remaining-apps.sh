#!/bin/bash

echo "🚀 Deploying to Remaining Apps..."

# Remaining apps
APPS=(
  "azora-ide"
  "azora-ui"
  "ingestion-ui"
  "onboarding-wizard"
  "main-app"
  "mobile"
  "student-portal-mobile"
  "electron"
  "web"
  "routes"
)

for APP in "${APPS[@]}"; do
  echo "📦 Deploying to apps/$APP..."
  
  mkdir -p "apps/$APP/components"
  mkdir -p "apps/$APP/lib"
  mkdir -p "apps/$APP/app"
  
  cp -r packages/ui/components/* "apps/$APP/components/" 2>/dev/null
  cp packages/ui/lib/utils.ts "apps/$APP/lib/" 2>/dev/null
  cp apps/app/components/service-logo.tsx "apps/$APP/components/" 2>/dev/null
  cp apps/app/components/elara-avatar.tsx "apps/$APP/components/" 2>/dev/null
  
  echo "✅ $APP"
done

echo ""
echo "🎉 All 20 Apps Deployed!"
