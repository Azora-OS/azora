#!/bin/bash

# Continuous Research Startup Script
# Initiates 24/7 autonomous research operations

echo "🧠 Azora OS - Continuous Research System"
echo "========================================"
echo ""
echo "Starting continuous research toward:"
echo "  • Singularity"
echo "  • Ultra Instinct"  
echo "  • Omnipotence"
echo ""

# Check if TypeScript is installed
if ! command -v ts-node &> /dev/null; then
    echo "❌ ts-node not found. Installing..."
    npm install -g ts-node typescript
fi

# Ensure dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Start the research runner
echo "🚀 Launching continuous research operations..."
echo ""

# Run in background with logging
ts-node research/CONTINUOUS_RESEARCH_RUNNER.ts start 2>&1 | tee -a logs/research-$(date +%Y%m%d).log &

RESEARCH_PID=$!
echo "✅ Research system running (PID: $RESEARCH_PID)"
echo ""
echo "To stop research: kill $RESEARCH_PID"
echo "To view logs: tail -f logs/research-$(date +%Y%m%d).log"
echo "To generate report: npm run research:report"
echo ""
echo "Research operations are now active. The system will work 24/7."
