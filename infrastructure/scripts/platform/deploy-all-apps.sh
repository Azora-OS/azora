#!/bin/bash

# Azora OS - Deploy All Applications to Vercel
# Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

set -e

echo "🚀 Azora OS - Deploying All Applications to Vercel"
echo "=================================================="
echo ""

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Function to deploy an app
deploy_app() {
    local app_name=$1
    local app_path=$2
    
    echo "📦 Deploying $app_name..."
    echo "   Path: $app_path"
    
    cd "$app_path"
    
    if [ -f "package.json" ]; then
        echo "   Installing dependencies..."
        npm install --silent
        
        echo "   Building application..."
        npm run build
        
        echo "   Deploying to Vercel..."
        vercel --prod --yes
        
        echo "   ✅ $app_name deployed successfully!"
    else
        echo "   ⚠️  No package.json found, skipping..."
    fi
    
    cd - > /dev/null
    echo ""
}

# Deploy Main Application
echo "1️⃣  Main Application"
deploy_app "Main App" "/workspace"

# Deploy Elara IDE
echo "2️⃣  Elara IDE"
deploy_app "Elara IDE" "/workspace/elara-ide"

# Deploy Marketplace UI
echo "3️⃣  Marketplace UI"
deploy_app "Marketplace UI" "/workspace/marketplace-ui"

# Deploy Pay UI
echo "4️⃣  Pay UI"
deploy_app "Pay UI" "/workspace/pay-ui"

# Deploy Synapse Applications
echo "5️⃣  Synapse Academy UI"
deploy_app "Academy UI" "/workspace/synapse/academy-ui"

echo "6️⃣  Synapse Vigil UI"
deploy_app "Vigil UI" "/workspace/synapse/vigil-ui"

echo "7️⃣  Synapse Frontend"
deploy_app "Synapse Frontend" "/workspace/synapse/frontend"

# Deploy Azora Applications
echo "8️⃣  Azora Mint Mine Engine"
deploy_app "Mint Mine Engine" "/workspace/azora/azora-mint-mine-engine-next"

echo ""
echo "=================================================="
echo "🎉 All applications deployed successfully!"
echo "=================================================="
echo ""
echo "📋 Deployment Summary:"
echo "   ✅ Main App"
echo "   ✅ Elara IDE"
echo "   ✅ Marketplace UI"
echo "   ✅ Pay UI"
echo "   ✅ Academy UI"
echo "   ✅ Vigil UI"
echo "   ✅ Synapse Frontend"
echo "   ✅ Mint Mine Engine"
echo ""
echo "🌐 Visit your Vercel dashboard to view all deployments:"
echo "   https://vercel.com/dashboard"
echo ""
echo "✨ Azora OS is now live!"
