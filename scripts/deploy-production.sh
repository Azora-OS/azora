#!/bin/bash

set -e

echo "🚀 Azora OS Production Deployment"
echo "=================================="

# Check environment
if [ ! -f .env.production ]; then
  echo "❌ .env.production not found"
  exit 1
fi

# Load environment
export $(cat .env.production | xargs)

# Build services
echo "📦 Building services..."
docker-compose -f docker-compose.production.yml build

# Run database migrations
echo "🗄️ Running migrations..."
npm run db:migrate

# Start services
echo "🚀 Starting services..."
docker-compose -f docker-compose.production.yml up -d

# Wait for services
echo "⏳ Waiting for services to start..."
sleep 10

# Health check
echo "🔍 Running health checks..."
bash scripts/health-check.sh

echo ""
echo "✅ Deployment complete!"
echo "🌐 API Gateway: http://localhost:4000"
echo "📊 Grafana: http://localhost:3000"
echo "📈 Prometheus: http://localhost:9090"
