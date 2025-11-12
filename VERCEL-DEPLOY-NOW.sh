#!/bin/bash
set -e

echo "🚀 Deploying Azora OS to Vercel..."
echo ""
echo "⚠️  IMPORTANT: You need to login first!"
echo "Run: npx vercel login"
echo ""
read -p "Have you logged in? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]
then
    echo "Please run: npx vercel login"
    exit 1
fi

echo ""
echo "📦 Deploying Backend Services..."
echo ""

echo "1/4 Auth Service..."
cd production/auth-service
npx vercel --prod --yes
cd ../..

echo "2/4 Education Service..."
cd production/education-service
npx vercel --prod --yes
cd ../..

echo "3/4 Payment Service..."
cd production/payment-service
npx vercel --prod --yes
cd ../..

echo "4/4 API Gateway..."
cd production/api-gateway
npx vercel --prod --yes
cd ../..

echo ""
echo "✅ Backend deployment complete!"
echo ""
echo "📋 Next Steps:"
echo "1. Note the deployment URLs from above"
echo "2. Add environment variables to each service:"
echo "   - DATABASE_URL"
echo "   - JWT_SECRET"
echo "3. Update API Gateway with service URLs"
echo "4. Redeploy API Gateway"
echo ""
echo "See VERCEL-DEPLOYMENT.md for details"
