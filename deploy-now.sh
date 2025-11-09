#!/bin/bash

echo "🚀 AZORA OS - RAPID DEPLOYMENT"
echo "================================"

# Setup services
echo "📦 Setting up services..."
chmod +x setup-all-services.sh
./setup-all-services.sh

# Start Docker services
echo "🐳 Starting Docker services..."
docker-compose -f docker-compose.production.yml up -d

# Wait for services
echo "⏳ Waiting for services to start..."
sleep 15

# Health check
echo "🏥 Running health checks..."
curl -s http://localhost:4000/health && echo "✅ API Gateway OK"
curl -s http://localhost:3001/health && echo "✅ Auth Service OK"
curl -s http://localhost:9090/health && echo "✅ Health Monitor OK"

echo ""
echo "✅ AZORA OS IS LIVE!"
echo "🌐 API Gateway: http://localhost:4000"
echo "🔐 Auth Service: http://localhost:3001"
echo "🏥 Health Monitor: http://localhost:9090"
echo ""
echo "🇿🇦 Africans eating NOW!"
