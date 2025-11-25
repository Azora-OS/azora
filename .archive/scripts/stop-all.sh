#!/bin/bash

echo "🛑 Stopping Azora OS Services"
echo "=============================="

# Kill all services
for pid_file in pids/*.pid; do
  if [ -f "$pid_file" ]; then
    pid=$(cat "$pid_file")
    service=$(basename "$pid_file" .pid)
    if kill -0 "$pid" 2>/dev/null; then
      kill "$pid"
      echo "✓ Stopped $service (PID: $pid)"
    fi
    rm "$pid_file"
  fi
done

echo ""
echo "✅ All services stopped"
