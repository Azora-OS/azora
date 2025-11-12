#!/bin/bash
set -e

echo "🚀 Deploying Azora OS to Vercel..."
echo ""

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Check if logged in
if ! vercel whoami &> /dev/null; then
    echo "🔐 Please login to Vercel..."
    vercel login
fi

echo "✅ Vercel CLI ready"
echo ""

# Backend Services
echo "📦 Deploying Backend Services..."
echo ""

echo "1/4 Deploying Auth Service..."
cd production/auth-service
vercel --prod --yes
cd ../..
echo "✅ Auth Service deployed"
echo ""

echo "2/4 Deploying Education Service..."
cd production/education-service
vercel --prod --yes
cd ../..
echo "✅ Education Service deployed"
echo ""

echo "3/4 Deploying Payment Service..."
cd production/payment-service
vercel --prod --yes
cd ../..
echo "✅ Payment Service deployed"
echo ""

echo "4/4 Deploying API Gateway..."
cd production/api-gateway
vercel --prod --yes
cd ../..
echo "✅ API Gateway deployed"
echo ""

# Frontend Apps (Optional - uncomment to deploy)
# echo "🎨 Deploying Frontend Apps..."
# echo ""

# echo "Deploying Student Portal..."
# cd apps/student-portal
# vercel --prod --yes
# cd ../..
# echo "✅ Student Portal deployed"

# echo "Deploying Enterprise UI..."
# cd apps/enterprise-ui
# vercel --prod --yes
# cd ../..
# echo "✅ Enterprise UI deployed"

echo ""
echo "🎉 Deployment Complete!"
echo ""
echo "📋 Next Steps:"
echo "1. Check your Vercel dashboard for deployment URLs"
echo "2. Update API Gateway environment variables with service URLs"
echo "3. Test health endpoints: curl https://your-gateway.vercel.app/health"
echo "4. Update frontend apps with API Gateway URL"
echo ""
echo "📚 Full guide: See VERCEL-DEPLOYMENT.md"
