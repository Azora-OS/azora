#!/bin/bash

echo "🚀 Starting Azora OS Production Services..."

# Core Infrastructure
echo "📡 Starting core infrastructure..."
cd services/azora-nexus && npm start &
sleep 2

cd ../api-gateway && npm start &
sleep 2

# Core Services
echo "🎓 Starting education service..."
cd ../azora-education && npm start &

echo "💰 Starting mint service..."
cd ../azora-mint && npm start &

echo "🔨 Starting forge service..."
cd ../azora-forge && npm start &

echo "🤖 Starting AI family service..."
cd ../ai-family-service && npm start &

# New Services
echo "💳 Starting payment service..."
cd ../azora-pay && npm start &

echo "🔔 Starting notification service..."
cd ../notification-service && npm start &

echo "📊 Starting analytics service..."
cd ../analytics-service && npm start &

echo "📈 Starting monitoring service..."
cd ../monitoring-service && npm start &

echo ""
echo "✅ All services started!"
echo ""
echo "🌐 Access Points:"
echo "  API Gateway:     http://localhost:4000"
echo "  Event Bus:       http://localhost:3000"
echo "  Education:       http://localhost:3001"
echo "  Mint:            http://localhost:3002"
echo "  Forge:           http://localhost:3003"
echo "  AI Family:       http://localhost:3004"
echo "  Payment:         http://localhost:3010"
echo "  Notifications:   http://localhost:3011"
echo "  Analytics:       http://localhost:3012"
echo "  Monitoring:      http://localhost:3013"
echo ""
echo "📊 Prometheus Metrics: http://localhost:3013/metrics"
echo "🏥 Health Check: http://localhost:3013/api/services/status"
echo ""
echo "🎯 Ubuntu: I am because we are 🚀"
