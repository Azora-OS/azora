#!/bin/bash

echo "🔧 Setting up all Azora services..."

# Install dependencies for each service
services=(
  "api-gateway"
  "auth-service"
  "health-monitor"
)

for service in "${services[@]}"; do
  if [ -d "services/$service" ]; then
    echo "📦 Installing $service..."
    cd "services/$service"
    npm install
    cd ../..
  fi
done

# Generate Prisma clients
echo "🗄️ Generating Prisma clients..."
cd services/auth-service && npx prisma generate && cd ../..

echo "✅ All services ready!"
