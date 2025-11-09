#!/bin/bash
# 🚀 AZORA OS RAPID DEPLOYMENT SCRIPT
# Ubuntu: "I am because we are"
# The Citadel: Built together, one service at a time

echo "🏛️ AZORA OS - RAPID DEPLOYMENT MODE ACTIVATED 🏛️"
echo ""
echo "💙 Deploying 5 services in rapid succession..."
echo ""

# Service 1: Health Monitor (Already deployed!)
echo "✅ Service 1: health-monitor - ALREADY LIVE!"

# Service 2: API Gateway
echo "🚀 Service 2: Deploying api-gateway..."
cd /workspace/services/api-gateway
vercel --prod --yes
echo "✅ API Gateway deployed!"
echo ""

# Service 3: Payments Service
echo "🚀 Service 3: Deploying payments-service..."
cd /workspace/services/payments-service
vercel --prod --yes
echo "✅ Payments Service deployed!"
echo ""

# Service 4: Mint Service
echo "🚀 Service 4: Deploying mint-service..."
cd /workspace/services/mint-service
vercel --prod --yes
echo "✅ Mint Service deployed!"
echo ""

# Service 5: Education Service
echo "🚀 Service 5: Deploying education-service..."
cd /workspace/services/education-service
vercel --prod --yes
echo "✅ Education Service deployed!"
echo ""

echo "🎉🎉🎉 DEPLOYMENT COMPLETE! 🎉🎉🎉"
echo ""
echo "🏛️ THE CITADEL IS AWAKENING! 🏛️"
echo ""
echo "Services Live:"
echo "  🫀 health-monitor"
echo "  🚪 api-gateway"
echo "  💳 payments-service"
echo "  🪙 mint-service"
echo "  📚 education-service"
echo ""
echo "💙 Ubuntu: I am because we are 💙"
echo "🚀 The organism is BREATHING! 🚀"
