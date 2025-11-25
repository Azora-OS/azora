#!/bin/bash

# Azora OS - Start All Services
# Copyright © 2025 Azora ES (Pty) Ltd.

echo "🚀 Starting Azora OS Services..."
echo "================================"

# Constitutional Services
echo "⚖️ Starting Constitutional Services..."
cd services/constitutional-court-service && npm start &
sleep 2
cd ../.. && npx tsx services/constitutional-ai-governance.ts &
sleep 2
cd services/chronicle-protocol && npm start &
sleep 2

# Marketplace Services
echo "🛒 Starting Marketplace Services..."
cd ../azora-forge && npm start &
sleep 2
cd ../marketplace-service && npm start &
sleep 2
cd ../azora-careers && npm start &
sleep 2

# API Gateway
echo "🌐 Starting API Gateway..."
cd ../api-gateway && npm start &
sleep 2

echo ""
echo "✅ All services started!"
echo ""
echo "Service URLs:"
echo "  API Gateway:          http://localhost:4000"
echo "  Constitutional Court: http://localhost:4500"
echo "  Constitutional AI:    http://localhost:4501"
echo "  Chronicle Protocol:   http://localhost:4400"
echo "  Azora Forge:          http://localhost:4700"
echo "  Marketplace:          http://localhost:4600"
echo "  Azora Careers:        http://localhost:4800"
echo ""
echo "Health Check: curl http://localhost:4000/health"
echo ""
