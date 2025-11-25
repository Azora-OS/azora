#!/bin/bash

echo "🚀 Starting Complete Azora OS System..."
echo ""

# Backend Services
echo "⚙️ Starting Backend Services..."
./start-production.sh &
sleep 5

# Frontend Applications
echo "🎨 Starting Frontend Applications..."
./start-frontend.sh &

echo ""
echo "⏳ Waiting for all services to initialize..."
sleep 10

echo ""
echo "✅ AZORA OS FULLY OPERATIONAL!"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🌐 BACKEND SERVICES"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  API Gateway:        http://localhost:4000"
echo "  Event Bus:          http://localhost:3000"
echo "  Education:          http://localhost:3001"
echo "  Mint:               http://localhost:3002"
echo "  Forge:              http://localhost:3003"
echo "  AI Family:          http://localhost:3004"
echo "  Payment:            http://localhost:3010"
echo "  Notifications:      http://localhost:3011"
echo "  Analytics:          http://localhost:3012"
echo "  Monitoring:         http://localhost:3013"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎨 FRONTEND APPLICATIONS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Student Portal:     http://localhost:3000"
echo "  Enterprise UI:      http://localhost:3001"
echo "  Marketplace UI:     http://localhost:3002"
echo "  Pay UI:             http://localhost:3003"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 MONITORING & METRICS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Service Status:     http://localhost:3013/api/services/status"
echo "  Prometheus:         http://localhost:3013/metrics"
echo "  Analytics:          http://localhost:3012/api/analytics/dashboard"
echo ""
echo "🎯 Ubuntu: I am because we are 🚀"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
