#!/bin/bash

# Azora Service Launcher
# Launches all 58 services in the correct order

echo "🚀 Launching Azora Ecosystem..."
echo "================================"

# Infrastructure services first
echo "📡 Starting Infrastructure Services..."
cd services/azora-api-gateway && npm start &
sleep 2
cd ../health-monitor && npm start &
sleep 2

# Core services
echo "🔐 Starting Core Services..."
cd ../azora-auth && npm start &
sleep 2

# AI services
echo "🤖 Starting AI Services..."
cd ../ai-orchestrator && npm start &
sleep 2
cd ../constitutional-ai && npm start &
sleep 2

# Blockchain services
echo "⛓️ Starting Blockchain Services..."
cd ../azora-mint && npm start &
sleep 2
cd ../azora-ledger && npm start &
sleep 2

# Payment services
echo "💰 Starting Payment Services..."
cd ../azora-pay && npm start &
sleep 2

# Education services
echo "📚 Starting Education Services..."
cd ../azora-education && npm start &
sleep 2
cd ../azora-sapiens && npm start &
sleep 2

# Antifragile services
echo "🔥 Starting Antifragile Services..."
cd ../chaos-monkey && npm start &
sleep 2
cd ../phoenix-server && npm start &
sleep 2

echo "✅ All services launched!"
echo "🌐 API Gateway: http://localhost:4000"
echo "🔍 Health Monitor: http://localhost:3030"
echo "🐵 ChaosMonkey: http://localhost:3050"
echo "🔥 PhoenixServer: http://localhost:3051"
