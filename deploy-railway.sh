#!/bin/bash

# Azora OS Railway Deployment Script
echo "🚀 Deploying Azora OS to Railway..."

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Installing..."
    npm install -g @railway/cli
fi

# Login to Railway (if not already logged in)
echo "🔐 Checking Railway authentication..."
railway login

# Create new Railway project
echo "📦 Creating Railway project..."
railway init azora-os

# Set environment variables
echo "⚙️ Setting environment variables..."
railway variables set NODE_ENV=production
railway variables set PORT=3000
railway variables set DATABASE_URL=$DATABASE_URL
railway variables set REDIS_URL=$REDIS_URL
railway variables set JWT_SECRET=$JWT_SECRET
railway variables set STRIPE_SECRET_KEY=$STRIPE_SECRET_KEY
railway variables set STRIPE_WEBHOOK_SECRET=$STRIPE_WEBHOOK_SECRET

# Deploy services
echo "🚀 Deploying services..."

# Deploy API Gateway first
cd services/api-gateway
railway up --detach
cd ../..

# Deploy Auth Service
cd services/auth-service  
railway up --detach
cd ../..

# Deploy Payment Service
cd services/payment
railway up --detach
cd ../..

# Deploy Education Service
cd services/azora-education
railway up --detach
cd ../..

# Deploy Marketplace Service
cd services/azora-marketplace
railway up --detach
cd ../..

# Deploy Frontend Apps
echo "🎨 Deploying frontend applications..."

# Deploy Student Portal
cd apps/student-portal
railway up --detach
cd ../..

# Deploy Enterprise UI
cd apps/azora-enterprise-ui
railway up --detach
cd ../..

echo "✅ Deployment complete!"
echo "🌐 Your Azora OS is now live on Railway!"
echo "📊 Check deployment status: railway status"
echo "📝 View logs: railway logs"