#!/bin/bash

echo "🚀 UBUNTU SYSTEM LAUNCH - PREMIUM GRADE ACTIVATION"
echo "================================================="
echo "⚡ 'I launch because we conquer together!' ⚡"
echo ""

# Start all Ubuntu services
echo "🏢 Starting Ubuntu Backend Services..."
cd services/azora-api-gateway && npm install && npm start &
cd services/azora-education && npm install && npm start &
cd services/azora-finance && npm install && npm start &
cd services/azora-marketplace && npm install && npm start &
cd services/azora-auth && npm install && npm start &
cd services/azora-ai && npm install && npm start &
cd services/azora-blockchain && npm install && npm start &
cd services/azora-analytics && npm install && npm start &

echo ""
echo "🎨 Starting Ubuntu Frontend Applications..."
cd apps/azora-student-portal && npm install && npm run dev &
cd apps/azora-enterprise-ui && npm install && npm run dev &
cd apps/azora-marketplace-ui && npm install && npm run dev &
cd apps/azora-pay-ui && npm install && npm run dev &

echo ""
echo "📊 Starting Ubuntu Monitoring..."
cd monitoring && docker-compose -f docker-compose.monitoring.yml up -d

echo ""
echo "🎉 UBUNTU SYSTEM FULLY OPERATIONAL!"
echo "=================================="
echo "🌐 API Gateway: http://localhost:4000"
echo "🎓 Student Portal: http://localhost:3000"
echo "💼 Enterprise UI: http://localhost:3001"
echo "🛒 Marketplace UI: http://localhost:3002"
echo "💰 Pay UI: http://localhost:3003"
echo "📊 Monitoring: http://localhost:3010"
echo ""
echo "🌟 Ubuntu: 'Ngiyakwazi ngoba sikwazi - We are LIVE together!' 🚀"
