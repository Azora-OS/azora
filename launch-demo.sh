#!/bin/bash

# Azora OS Demo Launch Script
# Ubuntu Philosophy: "I am because we are"

echo "🌟 Launching Azora OS Demo - Constitutional AI Operating System"
echo "=================================================="

# Set environment variables
export NODE_ENV=development
export JWT_SECRET=azora-ubuntu-constitutional-ai-secret-2025
export PORT=4000

# Kill any existing processes
echo "🔄 Cleaning up existing processes..."
pkill -f "node.*azora" 2>/dev/null || true
pkill -f "nodemon.*azora" 2>/dev/null || true

# Install dependencies if needed
echo "📦 Installing dependencies..."
cd /home/user/azora-os

# API Gateway
if [ ! -d "services/api-gateway/node_modules" ]; then
    echo "Installing API Gateway dependencies..."
    npm install --prefix services/api-gateway
fi

# Auth Service
if [ ! -d "services/auth-service/node_modules" ]; then
    echo "Installing Auth Service dependencies..."
    npm install --prefix services/auth-service
fi

# LMS Service
if [ ! -d "services/azora-lms/node_modules" ]; then
    echo "Installing LMS Service dependencies..."
    npm install --prefix services/azora-lms
fi

# Start services in background
echo "🚀 Starting Azora OS services..."

# Start Auth Service (Port 3001)
cd services/auth-service
PORT=3001 node sqlite-index.js > /tmp/auth-service.log 2>&1 &
AUTH_PID=$!
echo "✅ Auth Service started (PID: $AUTH_PID, Port: 3001)"

# Start LMS Service (Port 3002)
cd ../azora-lms
PORT=3002 node sqlite-index.js > /tmp/lms-service.log 2>&1 &
LMS_PID=$!
echo "✅ LMS Service started (PID: $LMS_PID, Port: 3002)"

# Start API Gateway (Port 4000)
cd ../api-gateway
PORT=4000 node simple-index.js > /tmp/api-gateway.log 2>&1 &
GATEWAY_PID=$!
echo "✅ API Gateway started (PID: $GATEWAY_PID, Port: 4000)"

# Wait for services to start
echo "⏳ Waiting for services to initialize..."
sleep 5

# Health check
echo "🏥 Performing health checks..."
if curl -s http://localhost:4000/api/health > /dev/null; then
    echo "✅ API Gateway: HEALTHY"
else
    echo "❌ API Gateway: UNHEALTHY"
fi

if curl -s http://localhost:3001/health > /dev/null; then
    echo "✅ Auth Service: HEALTHY"
else
    echo "❌ Auth Service: UNHEALTHY"
fi

if curl -s http://localhost:3002/health > /dev/null; then
    echo "✅ LMS Service: HEALTHY"
else
    echo "❌ LMS Service: UNHEALTHY"
fi

echo ""
echo "🌟 Azora OS Demo is LIVE!"
echo "=================================================="
echo "🌐 API Gateway:    http://localhost:4000"
echo "🔐 Auth Service:   http://localhost:3001"
echo "🎓 LMS Service:    http://localhost:3002"
echo ""
echo "📊 Service Logs:"
echo "   API Gateway: tail -f /tmp/api-gateway.log"
echo "   Auth Service: tail -f /tmp/auth-service.log"
echo "   LMS Service: tail -f /tmp/lms-service.log"
echo ""
echo "🛑 To stop all services: pkill -f 'node.*azora'"
echo ""
echo "Ubuntu Philosophy Active: 'Ngiyakwazi ngoba sikwazi' - I can because we can"