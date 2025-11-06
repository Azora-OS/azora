#!/bin/bash

# AZORA Mint-Mine Engine - Vercel Deployment Script

echo "🚀 AZORA Mint-Mine Engine - Vercel Deployment"
echo "============================================"

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Install with: npm install -g vercel"
    exit 1
fi

# Check if logged in
if ! vercel whoami &> /dev/null; then
    echo "❌ Not logged in to Vercel. Run: vercel login"
    exit 1
fi

# Navigate to Next.js app
cd azora-mint-mine-engine-next

echo "📦 Building Next.js application..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

echo "✅ Build successful!"

# Prompt for backend API URL
read -p "Enter your backend API URL (e.g., https://your-server.com): " BACKEND_API_URL

if [ -z "$BACKEND_API_URL" ]; then
    echo "⚠️  No backend API URL provided. Using demo mode."
    BACKEND_API_URL="http://localhost:5000"
fi

# Set environment variable
echo "🔧 Setting environment variables..."
vercel env add BACKEND_API_URL --force

echo "🚀 Deploying to Vercel..."
vercel --prod

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 Deployment successful!"
    echo ""
    echo "📋 Next Steps:"
    echo "1. Configure your backend server using the deployment guide"
    echo "2. Update BACKEND_API_URL in Vercel dashboard if needed"
    echo "3. Test the mining dashboard"
    echo "4. Start minting AZR tokens!"
    echo ""
    echo "📖 See VERCEL_DEPLOYMENT_GUIDE.md for detailed instructions"
else
    echo "❌ Deployment failed!"
    exit 1
fi