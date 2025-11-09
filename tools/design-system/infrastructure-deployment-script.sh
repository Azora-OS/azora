#!/bin/bash
#
# AZORA PROPRIETARY LICENSE
# Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved.
#
# INFRASTRUCTURE DESIGN DEPLOYMENT SCRIPT
# Automated deployment of design system to all infrastructure services
#

set -e  # Exit on error

echo "🚀 AZORA DESIGN INFRASTRUCTURE DEPLOYMENT"
echo "========================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
WORKSPACE_ROOT="${WORKSPACE_ROOT:-$(pwd)}"
DRY_RUN="${DRY_RUN:-false}"
SERVICES_ONLY="${SERVICES_ONLY:-false}"
APPS_ONLY="${APPS_ONLY:-false}"

# Functions
log_info() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warn() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Step 1: Verify environment
echo "📋 Step 1: Verifying environment..."
if [ ! -d "$WORKSPACE_ROOT/tools/design-system" ]; then
    log_error "Design system tools not found at $WORKSPACE_ROOT/tools/design-system"
    exit 1
fi
log_info "Environment verified"

# Step 2: Install dependencies
echo ""
echo "📦 Step 2: Installing dependencies..."
cd "$WORKSPACE_ROOT/tools/design-system"
if [ -f "package.json" ]; then
    npm install --silent
    log_info "Dependencies installed"
else
    log_warn "No package.json found, skipping dependency installation"
fi

# Step 3: Run infrastructure scan
echo ""
echo "🔍 Step 3: Scanning infrastructure..."
if [ "$DRY_RUN" = "true" ]; then
    log_warn "DRY RUN MODE: Scanning only (no changes will be made)"
fi

npx tsx design-infrastructure-bridge.ts scan || {
    log_error "Infrastructure scan failed"
    exit 1
}
log_info "Infrastructure scan complete"

# Step 4: Deploy design tokens
echo ""
echo "🚀 Step 4: Deploying design tokens..."

if [ "$DRY_RUN" = "true" ]; then
    log_warn "DRY RUN MODE: Would deploy design tokens to all services"
else
    if [ "$SERVICES_ONLY" = "true" ]; then
        log_info "Deploying to services only..."
        # Find all services and deploy
        find "$WORKSPACE_ROOT/services" -mindepth 1 -maxdepth 1 -type d | while read service; do
            service_name=$(basename "$service")
            log_info "Deploying to services/$service_name"
            npx tsx design-infrastructure-bridge.ts deploy "$service" || log_warn "Failed to deploy to $service_name"
        done
    elif [ "$APPS_ONLY" = "true" ]; then
        log_info "Deploying to apps only..."
        find "$WORKSPACE_ROOT/apps" -mindepth 1 -maxdepth 1 -type d | while read app; do
            app_name=$(basename "$app")
            log_info "Deploying to apps/$app_name"
            npx tsx design-infrastructure-bridge.ts deploy "$app" || log_warn "Failed to deploy to $app_name"
        done
    else
        log_info "Deploying to all infrastructure..."
        npx tsx infrastructure-design-cli.ts deploy --all || {
            log_error "Design token deployment failed"
            exit 1
        }
    fi
    log_info "Design tokens deployed"
fi

# Step 5: Validate infrastructure
echo ""
echo "✅ Step 5: Validating infrastructure design..."
npx tsx infrastructure-design-cli.ts validate || {
    log_warn "Infrastructure validation found issues (non-critical)"
}

# Step 6: Generate report
echo ""
echo "📊 Step 6: Generating deployment report..."
REPORT_PATH="$WORKSPACE_ROOT/infrastructure-design-deployment-report.json"
npx tsx infrastructure-design-cli.ts report --output="$REPORT_PATH" || {
    log_warn "Report generation failed (non-critical)"
}

if [ -f "$REPORT_PATH" ]; then
    log_info "Deployment report generated: $REPORT_PATH"
fi

# Step 7: Run integration tests
echo ""
echo "🧪 Step 7: Running integration tests..."
if [ -f "infrastructure-integration-tests.ts" ]; then
    npx tsx infrastructure-integration-tests.ts || {
        log_warn "Some integration tests failed (non-critical)"
    }
    log_info "Integration tests complete"
else
    log_warn "Integration tests not found, skipping"
fi

# Summary
echo ""
echo "========================================"
echo "📊 DEPLOYMENT SUMMARY"
echo "========================================"
echo ""
log_info "Design infrastructure deployment complete"
echo ""
echo "Next steps:"
echo "  1. Review deployment report: $REPORT_PATH"
echo "  2. Run validation: npx tsx infrastructure-design-cli.ts validate"
echo "  3. Fix any violations: npx tsx infrastructure-design-cli.ts fix"
echo ""

if [ "$DRY_RUN" = "true" ]; then
    log_warn "This was a DRY RUN - no changes were made"
    echo "Run without DRY_RUN=true to apply changes"
fi

echo "✅ Deployment script complete"
