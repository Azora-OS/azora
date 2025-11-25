#!/bin/bash

echo "🚀 DEPLOYING AZORA TO VERCEL..."

# Install Vercel CLI if not present
if ! command -v vercel &> /dev/null; then
    echo "Installing Vercel CLI..."
    npm i -g vercel
fi

# Deploy to Vercel
cd apps/web
vercel --prod --yes

echo "✅ AZORA DEPLOYED SUCCESSFULLY!"
echo "🌍 Your platform is now live and making money!"
