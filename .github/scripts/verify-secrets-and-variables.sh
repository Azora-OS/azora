#!/bin/bash

# Verify GitHub Secrets and Variables Configuration
# This script checks that all required secrets and variables are configured in GitHub

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
REPO="${1:-.}"
GITHUB_CLI_AVAILABLE=false

# Check if GitHub CLI is available
if command -v gh &> /dev/null; then
    GITHUB_CLI_AVAILABLE=true
fi

echo -e "${BLUE}=== GitHub Secrets and Variables Verification ===${NC}"
echo ""

# Define required secrets
declare -a REQUIRED_SECRETS=(
    "DOCKER_USERNAME"
    "DOCKER_PASSWORD"
    "STAGING_HOST"
    "STAGING_USER"
    "STAGING_KEY"
    "STAGING_DATABASE_URL"
    "PROD_HOST"
    "PROD_USER"
    "PROD_KEY"
    "PROD_DATABASE_URL"
    "NPM_TOKEN"
)

# Define optional secrets
declare -a OPTIONAL_SECRETS=(
    "SLACK_WEBHOOK"
    "RENOVATE_TOKEN"
)

# Define required variables
declare -a REQUIRED_VARIABLES=(
    "NODE_VERSIONS"
    "COVERAGE_THRESHOLD"
    "SECURITY_SEVERITY_THRESHOLD"
)

# Define required environments
declare -a REQUIRED_ENVIRONMENTS=(
    "staging"
    "production"
)

# Counters
SECRETS_FOUND=0
SECRETS_MISSING=0
VARIABLES_FOUND=0
VARIABLES_MISSING=0
ENVIRONMENTS_FOUND=0
ENVIRONMENTS_MISSING=0

# Function to check if GitHub CLI is available
check_github_cli() {
    if [ "$GITHUB_CLI_AVAILABLE" = false ]; then
        echo -e "${YELLOW}⚠️  GitHub CLI (gh) is not installed${NC}"
        echo "   Install it from: https://cli.github.com/"
        echo "   Or manually verify secrets in GitHub repository settings"
        echo ""
        return 1
    fi
    return 0
}

# Function to check secrets
check_secrets() {
    echo -e "${BLUE}Checking Required Secrets:${NC}"
    
    if ! check_github_cli; then
        echo -e "${YELLOW}Skipping secret verification (GitHub CLI not available)${NC}"
        echo ""
        return
    fi
    
    for secret in "${REQUIRED_SECRETS[@]}"; do
        if gh secret list --repo "$REPO" 2>/dev/null | grep -q "^$secret"; then
            echo -e "${GREEN}✓${NC} $secret"
            ((SECRETS_FOUND++))
        else
            echo -e "${RED}✗${NC} $secret (MISSING)"
            ((SECRETS_MISSING++))
        fi
    done
    
    echo ""
    echo -e "${BLUE}Checking Optional Secrets:${NC}"
    
    for secret in "${OPTIONAL_SECRETS[@]}"; do
        if gh secret list --repo "$REPO" 2>/dev/null | grep -q "^$secret"; then
            echo -e "${GREEN}✓${NC} $secret"
        else
            echo -e "${YELLOW}○${NC} $secret (optional)"
        fi
    done
    
    echo ""
}

# Function to check variables
check_variables() {
    echo -e "${BLUE}Checking Required Variables:${NC}"
    
    if ! check_github_cli; then
        echo -e "${YELLOW}Skipping variable verification (GitHub CLI not available)${NC}"
        echo ""
        return
    fi
    
    for variable in "${REQUIRED_VARIABLES[@]}"; do
        if gh variable list --repo "$REPO" 2>/dev/null | grep -q "^$variable"; then
            echo -e "${GREEN}✓${NC} $variable"
            ((VARIABLES_FOUND++))
        else
            echo -e "${RED}✗${NC} $variable (MISSING)"
            ((VARIABLES_MISSING++))
        fi
    done
    
    echo ""
}

# Function to check environments
check_environments() {
    echo -e "${BLUE}Checking Required Environments:${NC}"
    
    if ! check_github_cli; then
        echo -e "${YELLOW}Skipping environment verification (GitHub CLI not available)${NC}"
        echo ""
        return
    fi
    
    for env in "${REQUIRED_ENVIRONMENTS[@]}"; do
        if gh api repos/"$REPO"/environments 2>/dev/null | grep -q "\"name\": \"$env\""; then
            echo -e "${GREEN}✓${NC} $env"
            ((ENVIRONMENTS_FOUND++))
        else
            echo -e "${RED}✗${NC} $env (MISSING)"
            ((ENVIRONMENTS_MISSING++))
        fi
    done
    
    echo ""
}

# Function to display summary
display_summary() {
    echo -e "${BLUE}=== Summary ===${NC}"
    echo ""
    
    if [ "$GITHUB_CLI_AVAILABLE" = true ]; then
        echo "Secrets:"
        echo "  Found: $SECRETS_FOUND/${#REQUIRED_SECRETS[@]}"
        echo "  Missing: $SECRETS_MISSING"
        echo ""
        
        echo "Variables:"
        echo "  Found: $VARIABLES_FOUND/${#REQUIRED_VARIABLES[@]}"
        echo "  Missing: $VARIABLES_MISSING"
        echo ""
        
        echo "Environments:"
        echo "  Found: $ENVIRONMENTS_FOUND/${#REQUIRED_ENVIRONMENTS[@]}"
        echo "  Missing: $ENVIRONMENTS_MISSING"
        echo ""
        
        if [ $SECRETS_MISSING -eq 0 ] && [ $VARIABLES_MISSING -eq 0 ] && [ $ENVIRONMENTS_MISSING -eq 0 ]; then
            echo -e "${GREEN}✓ All required secrets, variables, and environments are configured!${NC}"
            return 0
        else
            echo -e "${RED}✗ Some required secrets, variables, or environments are missing${NC}"
            echo ""
            echo "To configure missing items:"
            echo "1. Go to: https://github.com/$REPO/settings/secrets"
            echo "2. Add missing secrets"
            echo "3. Go to: https://github.com/$REPO/settings/variables"
            echo "4. Add missing variables"
            echo "5. Go to: https://github.com/$REPO/settings/environments"
            echo "6. Create missing environments with protection rules"
            echo ""
            echo "For detailed setup instructions, see:"
            echo "  .github/SECRETS-AND-VARIABLES-SETUP.md"
            return 1
        fi
    else
        echo -e "${YELLOW}GitHub CLI not available. Manual verification required.${NC}"
        echo ""
        echo "To verify manually:"
        echo "1. Go to: https://github.com/$REPO/settings/secrets"
        echo "2. Verify all required secrets are present"
        echo "3. Go to: https://github.com/$REPO/settings/variables"
        echo "4. Verify all required variables are present"
        echo "5. Go to: https://github.com/$REPO/settings/environments"
        echo "6. Verify staging and production environments exist"
        echo ""
        echo "For detailed setup instructions, see:"
        echo "  .github/SECRETS-AND-VARIABLES-SETUP.md"
        return 1
    fi
}

# Main execution
main() {
    check_secrets
    check_variables
    check_environments
    display_summary
}

# Run main function
main
exit $?
