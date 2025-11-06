#!/bin/bash

# AZORA PROPRIETARY LICENSE
# Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved.
# See LICENSE file for details.

# Batch Update All Frontends Script
# Updates all frontend applications with premium UI components

set -e

echo "🚀 Starting batch update of all frontends..."
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to copy directory
copy_dir() {
    if [ -d "$1" ] && [ -d "$2" ]; then
        cp -r "$1"/* "$2" 2>/dev/null || true
        echo -e "${GREEN}✅ Copied $1 to $2${NC}"
    else
        echo -e "${YELLOW}⏭️  Skipped $1 (not found)${NC}"
    fi
}

# Function to copy file
copy_file() {
    if [ -f "$1" ]; then
        mkdir -p "$(dirname "$2")"
        cp "$1" "$2" 2>/dev/null || true
        echo -e "${GREEN}✅ Copied $1 to $2${NC}"
    else
        echo -e "${YELLOW}⏭️  Skipped $1 (not found)${NC}"
    fi
}

# Copy premium components to each frontend
echo "📦 Copying premium components..."

# List of frontends with their component paths
declare -A FRONTENDS=(
    ["synapse/academy-ui"]="components"
    ["synapse/atlas-ui"]="components"
    ["synapse/council-ui"]="components"
    ["synapse/pulse-ui"]="components"
    ["synapse/signal-ui"]="components"
    ["synapse/vault-ui"]="components"
    ["synapse/vigil-ui"]="components"
    ["synapse/main-app"]="components"
    ["elara-ide"]="components"
    ["azora-ui"]="components"
    ["ui"]="components"
)

# Copy components to each frontend
for frontend in "${!FRONTENDS[@]}"; do
    if [ -d "$frontend" ]; then
        echo ""
        echo "📦 Updating $frontend..."

        # Copy UI components
        copy_dir "components/ui" "$frontend/${FRONTENDS[$frontend]}/ui"

        # Copy theme provider
        copy_file "components/theme-provider.tsx" "$frontend/${FRONTENDS[$frontend]}/theme-provider.tsx"

        # Copy utils
        copy_file "lib/utils.ts" "$frontend/lib/utils.ts"

        # Copy design tokens
        copy_file "lib/design-system/premium-tokens.ts" "$frontend/lib/design-system/premium-tokens.ts"

        echo -e "${GREEN}✅ Updated $frontend${NC}"
    else
        echo -e "${YELLOW}⏭️  Skipped $frontend (not found)${NC}"
    fi
done

# For Vite apps, copy to src directory
echo ""
echo "📦 Updating Vite applications..."

VITE_APPS=("marketplace-ui" "pay-ui" "cloud-ui" "dev-ui" "enterprise-ui" "learn-ui" "compliance-ui")

for app in "${VITE_APPS[@]}"; do
    if [ -d "$app" ]; then
        echo ""
        echo "📦 Updating $app (Vite)..."

        # Copy to src directory
        copy_dir "components/ui" "$app/src/components/ui"
        copy_file "components/theme-provider.tsx" "$app/src/components/theme-provider.tsx"
        copy_file "lib/utils.ts" "$app/src/lib/utils.ts"
        copy_file "lib/design-system/premium-tokens.ts" "$app/src/lib/design-system/premium-tokens.ts"

        echo -e "${GREEN}✅ Updated $app${NC}"
    else
        echo -e "${YELLOW}⏭️  Skipped $app (not found)${NC}"
    fi
done

echo ""
echo -e "${GREEN}✅ Batch update complete!${NC}"
echo ""
echo "📝 Next steps:"
echo "   1. Run the TypeScript update script: npm run update:all-frontends"
echo "   2. Update layouts manually for each app"
echo "   3. Update globals.css files"
echo "   4. Test each application"

