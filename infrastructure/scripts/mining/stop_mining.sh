#!/bin/bash
# AZR Mining Engine Stop Script
# Gracefully stops all autonomous mining operations

echo "🛑 Stopping AZR Autonomous Mining Engine"
echo "======================================="

# Check if autonomous engine is running
if [ -f /tmp/azr_autonomous.pid ]; then
    AUTONOMOUS_PID=$(cat /tmp/azr_autonomous.pid)

    if ps -p $AUTONOMOUS_PID > /dev/null; then
        echo "Stopping autonomous engine (PID: $AUTONOMOUS_PID)..."
        kill $AUTONOMOUS_PID

        # Wait for graceful shutdown
        for i in {1..10}; do
            if ! ps -p $AUTONOMOUS_PID > /dev/null; then
                echo "✅ Autonomous engine stopped gracefully"
                break
            fi
            echo "Waiting for graceful shutdown... ($i/10)"
            sleep 1
        done

        # Force kill if still running
        if ps -p $AUTONOMOUS_PID > /dev/null; then
            echo "Force stopping autonomous engine..."
            kill -9 $AUTONOMOUS_PID
            echo "✅ Autonomous engine force stopped"
        fi
    else
        echo "❌ Autonomous engine process not found"
    fi

    # Clean up PID file
    rm -f /tmp/azr_autonomous.pid
else
    echo "❌ No autonomous engine PID file found"
fi

# Stop Redis if it was started by the system
echo "Stopping Redis server..."
sudo service redis-server stop

# Stop any remaining mining processes
echo "Stopping any remaining mining processes..."
pkill -f "miner_agent" || echo "No miner agents running"
pkill -f "orchestrator" || echo "No orchestrator running"
pkill -f "dashboard" || echo "No dashboard running"

echo ""
echo "✅ All mining operations stopped"
echo "💰 Final earnings summary:"
python -c "
import json
try:
    with open('/tmp/azr_earnings.json', 'r') as f:
        data = json.load(f)
        print(f'Total AZR Generated: {data.get(\"total_azr\", 0):.4f}')
        print(f'Total USD Value: ${data.get(\"total_usd\", 0):.2f}')
        print(f'Runtime: {data.get(\"days_running\", 0)} days')
        print(f'Avg Daily AZR: {data.get(\"avg_daily_azr\", 0):.4f}')
except:
    print('No earnings data available')
"

echo ""
echo "To restart: ./start_autonomous.sh"