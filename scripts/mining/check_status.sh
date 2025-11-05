#!/bin/bash
# AZR Mining Engine Status Monitor
# Checks system health and provides daily reports

echo "📊 AZR Autonomous Mining Engine Status Report"
echo "=========================================="

# Check if autonomous engine is running
if [ -f /tmp/azr_autonomous.pid ]; then
    AUTONOMOUS_PID=$(cat /tmp/azr_autonomous.pid)
    if ps -p $AUTONOMOUS_PID > /dev/null; then
        echo "✅ Autonomous Engine: RUNNING (PID: $AUTONOMOUS_PID)"
    else
        echo "❌ Autonomous Engine: STOPPED (PID file exists but process not found)"
    fi
else
    echo "❌ Autonomous Engine: NOT STARTED"
fi

# Check Redis
if sudo service redis-server status | grep -q "active (running)"; then
    echo "✅ Redis Cache: RUNNING"
else
    echo "❌ Redis Cache: STOPPED"
fi

# Check dashboard
if curl -s http://localhost:3000 > /dev/null; then
    echo "✅ Dashboard: RUNNING (http://localhost:3000)"
else
    echo "❌ Dashboard: STOPPED"
fi

# Check API
if curl -s http://localhost:8000/health > /dev/null; then
    echo "✅ API: RUNNING (http://localhost:8000)"
else
    echo "❌ API: STOPPED"
fi

# Show recent logs
echo ""
echo "📝 Recent Activity (last 10 lines):"
tail -10 /tmp/azr_mining_engine.log 2>/dev/null || echo "No logs available"

# Show earnings summary
echo ""
echo "💰 Earnings Summary:"
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
    print('No earnings data available yet')
"

echo ""
echo "🔧 Quick Commands:"
echo "  Start: ./start_autonomous.sh"
echo "  Stop: kill $AUTONOMOUS_PID"
echo "  Logs: tail -f /tmp/azr_mining_engine.log"
echo "  Dashboard: open http://localhost:3000"