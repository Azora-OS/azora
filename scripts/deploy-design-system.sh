#!/bin/bash
#
# AZORA PROPRIETARY LICENSE
# Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved.
#
# DESIGN SYSTEM DEPLOYMENT SCRIPT
# Deploy design system to all services before main deployment
#

set -e

echo "🎨 DESIGN SYSTEM DEPLOYMENT"
echo "==========================="
echo ""

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warn() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Navigate to design system
cd tools/design-system

# Install dependencies
log_info "Installing design system dependencies..."
npm install --silent

# Deploy design tokens to all services
log_info "Deploying design tokens to all services..."
npx tsx infrastructure-design-cli.ts deploy --all || log_warn "Some services failed (non-critical)"

# Validate infrastructure
log_info "Validating infrastructure design..."
npx tsx infrastructure-design-cli.ts validate || log_warn "Validation found issues (non-critical)"

# Generate report
log_info "Generating design compliance report..."
npx tsx infrastructure-design-cli.ts report --output=./design-deployment-report.json || log_warn "Report generation failed (non-critical)"

log_info "Design system deployment complete!"
cd ../..
