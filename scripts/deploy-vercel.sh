#!/bin/bash
#
# AZORA PROPRIETARY LICENSE
# Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved.
#
# VERCEL DEPLOYMENT SCRIPT
# Automated deployment to Vercel
#

set -e

echo "🚀 AZORA - VERCEL DEPLOYMENT"
echo "============================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log_info() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warn() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    log_warn "Vercel CLI not found. Installing..."
    npm install -g vercel
fi

log_info "Vercel CLI ready"

# Check if logged in
if ! vercel whoami &> /dev/null; then
    log_warn "Not logged in to Vercel. Please run: vercel login"
    exit 1
fi

log_info "Vercel authentication verified"

# Build design system tools (if needed)
if [ -d "tools/design-system" ]; then
    log_info "Building design system tools..."
    cd tools/design-system
    npm install --silent || log_warn "Design system dependencies install failed"
    cd ../..
fi

# Run design system validation
if [ -d "tools/design-system" ]; then
    log_info "Validating design system..."
    cd tools/design-system
    npx tsx infrastructure-design-cli.ts validate || log_warn "Design validation found issues (non-critical)"
    cd ../..
fi

# Install dependencies
log_info "Installing dependencies..."
npm install --silent

# Build project
log_info "Building project..."
npm run build || {
    log_error "Build failed"
    exit 1
}

# Deploy to Vercel
log_info "Deploying to Vercel..."
vercel --prod --yes || {
    log_error "Deployment failed"
    exit 1
}

log_info "Deployment complete!"
echo ""
echo "🌐 Your app is live on Vercel!"
echo ""
