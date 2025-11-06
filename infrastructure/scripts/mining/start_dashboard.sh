#!/bin/bash
# AZR Ultra Mining Dashboard Startup Script

echo "🚀 Starting AZR Ultra Mining Dashboard..."
echo "========================================"

# Check if we're in the mining-engine directory
if [ ! -f "dashboard.py" ]; then
    echo "❌ Error: dashboard.py not found. Please run from mining-engine directory."
    exit 1
fi

# Install dependencies if needed
if ! python3 -c "import flask, requests" 2>/dev/null; then
    echo "📦 Installing dependencies..."
    pip3 install -r requirements-dashboard.txt
fi

# Start the dashboard
echo "📊 Starting dashboard on http://localhost:5000"
echo "🔄 Auto-updates every 30 seconds"
echo "🎯 Monitoring ultra mining engine..."
echo ""
echo "Press Ctrl+C to stop"
echo ""

python3 dashboard.py