#!/bin/bash

# AZORA OS - WORKSPACE CONFLICT RESOLUTION SCRIPT
# Fixes npm workspace naming conflicts

set -e

echo "🔧 AZORA OS Workspace Conflict Resolution"
echo "========================================"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Function to check for conflicts
check_conflicts() {
    echo -e "${BLUE}Checking for workspace conflicts...${NC}"
    if npm ls --depth=0 2>&1 | grep -q "has conflicts"; then
        echo -e "${RED}❌ Workspace conflicts found${NC}"
        return 1
    else
        echo -e "${GREEN}✅ No workspace conflicts found${NC}"
        return 0
    fi
}

# Function to identify conflicting packages
identify_conflicts() {
    echo -e "${BLUE}Identifying conflicting packages...${NC}"
    npm ls --depth=0 2>&1 | grep "has conflicts" | while read -r line; do
        package_name=$(echo "$line" | sed 's/.*package '\''\([^'\'']*\)'\''.*/\1/')
        echo "Conflicting package: $package_name"
        echo "Paths:"
        npm ls --depth=0 2>&1 | grep -A 10 "$package_name" | grep "C:" | head -10
        echo ""
    done
}

# Function to fix conflicts by renaming packages
fix_conflicts() {
    echo -e "${BLUE}Fixing workspace conflicts...${NC}"

    # Fix 'my-v0-project' conflicts
    if [ -f "Azora-OS/apps/azora-ui/package.json" ]; then
        sed -i 's/"name": "my-v0-project"/"name": "azora-ui-main"/' Azora-OS/apps/azora-ui/package.json
        echo "Renamed azora-ui package to azora-ui-main"
    fi

    if [ -f "Azora-OS/apps/ingestion-ui/package.json" ]; then
        sed -i 's/"name": "my-v0-project"/"name": "azora-ingestion-ui"/' Azora-OS/apps/ingestion-ui/package.json
        echo "Renamed ingestion-ui package to azora-ingestion-ui"
    fi

    if [ -f "Azora-OS/packages/ui/package.json" ]; then
        sed -i 's/"name": "my-v0-project"/"name": "azora-ui-package"/' Azora-OS/packages/ui/package.json
        echo "Renamed ui package to azora-ui-package"
    fi

    # Fix 'azora-ui-portal' conflicts
    ui_apps=("cloud-ui" "compliance-ui" "dev-ui" "enterprise-ui" "learn-ui" "marketplace-ui" "pay-ui")

    for app in "${ui_apps[@]}"; do
        if [ -f "Azora-OS/apps/$app/package.json" ]; then
            sed -i "s/\"name\": \"azora-ui-portal\"/\"name\": \"azora-$app\"/" "Azora-OS/apps/$app/package.json"
            echo "Renamed $app package to azora-$app"
        fi
    done

    echo -e "${GREEN}✅ Conflicts fixed${NC}"
}

# Function to verify fixes
verify_fixes() {
    echo -e "${BLUE}Verifying fixes...${NC}"
    if check_conflicts; then
        echo -e "${GREEN}✅ All conflicts resolved${NC}"
        return 0
    else
        echo -e "${RED}❌ Some conflicts remain${NC}"
        return 1
    fi
}

# Function to clean npm cache
clean_cache() {
    echo -e "${BLUE}Cleaning npm cache...${NC}"
    npm cache clean --force
    echo -e "${GREEN}✅ Cache cleaned${NC}"
}

# Main execution
main() {
    echo "Step 1: Checking for conflicts..."
    if ! check_conflicts; then
        echo ""
        echo "Step 2: Identifying conflicts..."
        identify_conflicts
        echo ""
        echo "Step 3: Fixing conflicts..."
        fix_conflicts
        echo ""
        echo "Step 4: Cleaning cache..."
        clean_cache
        echo ""
        echo "Step 5: Verifying fixes..."
        if verify_fixes; then
            echo ""
            echo -e "${GREEN}🎉 Workspace conflicts resolved!${NC}"
            echo ""
            echo "Next steps:"
            echo "1. Run: npm install"
            echo "2. Test parallel installer: ./tools/scripts/DEPLOY-ALL-SERVICES.ps1"
            echo "3. Begin database integration phase"
        fi
    else
        echo -e "${GREEN}✅ No conflicts found - workspace is clean${NC}"
    fi
}

# Run main function
main</content>
<parameter name="filePath">c:\azora-os\Azora-OS\tools\scripts\fix-workspace-conflicts.sh