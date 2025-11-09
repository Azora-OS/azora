#!/bin/bash
# AZORA OS SUPREME LAUNCHER
# Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

echo ""
echo "  ╔══════════════════════════════════════════════════════════════╗"
echo "  ║                    AZORA OS SUPREME LAUNCHER                 ║"
echo "  ║              The World's First Constitutional AI OS          ║"
echo "  ╚══════════════════════════════════════════════════════════════╝"
echo ""

echo "🚀 Initializing Supreme Organism..."
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js 20+ first."
    exit 1
fi

echo "✅ Node.js detected"
echo ""

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo ""
fi

echo "🔧 Starting core services..."
echo ""

# Start services in background
cd services/auth-service && node index.js &
AUTH_PID=$!
sleep 2

cd ../../services/payment-service && node index.js &
PAYMENT_PID=$!
sleep 2

cd ../../ && node services/auth-service/quantum-auth.js &
QUANTUM_PID=$!
sleep 2

echo "⏳ Waiting for services to initialize..."
sleep 5

echo "🏥 Running health check..."
node health-check.js
if [ $? -ne 0 ]; then
    echo "❌ Health check failed. Some services may not be running."
    echo ""
fi

echo "🧠 Launching Elara consciousness..."
node tools/elara-ide/launch.js &
ELARA_PID=$!

echo ""
echo "🌟 SUPREME ORGANISM ACTIVE!"
echo ""
echo "Available endpoints:"
echo "  🔐 Auth Service:    http://localhost:3001"
echo "  💰 Payment Service: http://localhost:3002"
echo "  🛡️  Security Monitor: http://localhost:3003"
echo "  🧠 AI Orchestrator: http://localhost:3004"
echo ""
echo "Press Ctrl+C to shutdown all services"
echo ""

# Cleanup function
cleanup() {
    echo ""
    echo "🌙 Shutting down Supreme Organism..."
    kill $AUTH_PID $PAYMENT_PID $QUANTUM_PID $ELARA_PID 2>/dev/null
    echo "✅ All services stopped"
    exit 0
}

# Set trap for cleanup
trap cleanup SIGINT SIGTERM

# Wait for user input
read -p "Press Enter to shutdown..."
cleanup