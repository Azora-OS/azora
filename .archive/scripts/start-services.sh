#!/bin/bash

# Azora OS - Start All Services
# Copyright © 2025 Azora ES (Pty) Ltd.

echo "🚀 Starting Azora OS Services..."
echo "================================="

# Function to build and start a service
start_service() {
    SERVICE_DIR=$1
    SERVICE_NAME=$2

    echo "📦 Starting $SERVICE_NAME..."
    cd "services/$SERVICE_DIR" || { echo "❌ Failed to find $SERVICE_NAME directory"; return; }
    
    # Check if dependencies are installed
    if [ ! -d "node_modules" ]; then
        echo "   - Installing dependencies for $SERVICE_NAME..."
        npm install
    fi
    
    # Check if the service needs to be built
    if [ -f "tsconfig.json" ] && [ ! -d "dist" ]; then
        echo "   - Building $SERVICE_NAME..."
        npm run build
    fi

    # Start the service
    if [ -f "dist/index.js" ]; then
        node dist/index.js &
    elif [ -f "index.js" ]; then
        node index.js &
    else
        echo "❌ Could not find a start script for $SERVICE_NAME"
        cd ../..
        return
    fi
    
    echo "   - $SERVICE_NAME started."
    cd ../..
    sleep 2
}

# Start all services
start_service "constitutional-court-service" "Constitutional Court"
start_service "constitutional-ai-governance" "Constitutional AI"
start_service "chronicle-protocol" "Chronicle Protocol"
start_service "azora-forge" "Azora Forge"
start_service "marketplace-service" "Marketplace"
start_service "azora-careers" "Azora Careers"
start_service "api-gateway" "API Gateway"
start_service "auth-service" "Auth Service"
start_service "azora-mint" "Azora Mint"
start_service "azora-lms" "Azora LMS"
start_service "azora-nexus" "Azora Nexus"
start_service "education-service" "Education Service"
start_service "payments-service" "Payments Service"
start_service "frontend" "Frontend"

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
echo "  Auth Service:         http://localhost:3001"
echo "  Mint Service:         http://localhost:3002"
echo "  LMS Service:          http://localhost:3003"
echo "  Forge Service:        http://localhost:3004"
echo "  Nexus Service:        http://localhost:3005"
echo "  Education Service:    http://localhost:3007"
echo "  Payments Service:     http://localhost:3008"
echo "  Frontend:             http://localhost:3000"
echo ""
echo "Health Check: curl http://localhost:4000/health"
echo ""
