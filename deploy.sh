#!/bin/bash

# AZORA OS - RAPID DEPLOYMENT SCRIPT
# African speed - no delays!

echo "🔥 AZORA OS - DEPLOYING TO PRODUCTION"
echo "======================================"

# Build Docker images
echo "📦 Building Docker images..."
docker-compose -f docker-compose.prod.yml build

# Start services
echo "🚀 Starting services..."
docker-compose -f docker-compose.prod.yml up -d

# Wait for services to be healthy
echo "⏳ Waiting for services..."
sleep 10

# Health checks
echo "🏥 Running health checks..."
curl -f http://localhost:3005/health && echo "✅ Event Bus healthy"
curl -f http://localhost:4400/health && echo "✅ Chronicle healthy"
curl -f http://localhost:3000/health && echo "✅ API Gateway healthy"

echo ""
echo "✅ DEPLOYMENT COMPLETE!"
echo "🌍 Services running:"
echo "   - Event Bus: http://localhost:3005"
echo "   - Chronicle: http://localhost:4400"
echo "   - API Gateway: http://localhost:3000"
echo ""
echo "🚀 AZORA OS IS LIVE! Liberation begins now! 🔥"
