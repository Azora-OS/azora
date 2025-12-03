#!/bin/bash
# Quick balance check script

echo "🎯 AZR Ultra Mining Balance Check"
echo "=================================="

if [ -f "/tmp/ultra_mining_earnings.json" ]; then
    python3 -c "
import json
with open('/tmp/ultra_mining_earnings.json', 'r') as f:
    data = json.load(f)
print(f'🪙 AZR Tokens: {data.get(\"total_azr\", 0):.4f}')
print(f'💵 USD Value: \${data.get(\"total_usd\", 0):.4f}')
print(f'⏱️  Runtime: {data.get(\"runtime_hours\", 0):.4f} hours')
print(f'📈 Daily Rate: \${data.get(\"daily_profit\", 0):.2f}')
print(f'🚀 Hourly Rate: \${data.get(\"hourly_profit\", 0):.4f}')
    "
else
    echo "❌ No earnings data found"
    echo "💡 Start mining: ./start_ultra_mining.sh"
fi