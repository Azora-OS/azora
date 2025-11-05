#!/bin/bash
# AZR Autonomous Mining Engine Startup Script
# Runs the mining engine autonomously for 365 days

echo "🚀 Starting AZR Autonomous Mining Engine"
echo "Target: 365 days of continuous operation"
echo "Features: Free electricity, AI optimization, Cloud GPU scaling"
echo "=========================================="

# Set working directory
cd /workspaces/azora-os/mining-engine

# Start Redis (required for the system)
echo "Starting Redis server..."
sudo service redis-server start

# Wait for Redis to start
sleep 3

# Start the autonomous mining engine
echo "Starting autonomous mining engine..."
python autonomous_engine.py &

# Save the process ID
AUTONOMOUS_PID=$!
echo $AUTONOMOUS_PID > /tmp/azr_autonomous.pid

echo "✅ Autonomous mining engine started (PID: $AUTONOMOUS_PID)"
echo "📊 Dashboard: http://localhost:3000"
echo "🔧 API: http://localhost:8000"
echo "📝 Logs: tail -f /tmp/azr_mining_engine.log"
echo ""
echo "The system will run autonomously for 365 days."
echo "Progress will be logged daily."
echo "Use 'kill $AUTONOMOUS_PID' to stop manually."
echo ""
echo "🎯 Happy mining! Your AZR tokens are being generated autonomously."