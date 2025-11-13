#!/bin/bash

AZORA_DIR="$HOME/.azora"
PID_FILE="$AZORA_DIR/services.pid"

if [ ! -f "$PID_FILE" ]; then
  echo "⚠️ No services running (PID file not found)"
  exit 0
fi

echo "🛑 Stopping Azora Services..."

# Read PIDs and stop services
OCEAN_PID=$(jq -r '.["knowledge-ocean"]' "$PID_FILE")
KB_PID=$(jq -r '.["ai-knowledge-base"]' "$PID_FILE")

if [ "$OCEAN_PID" != "null" ]; then
  echo "Stopping Knowledge Ocean (PID: $OCEAN_PID)..."
  kill $OCEAN_PID 2>/dev/null || echo "Already stopped"
fi

if [ "$KB_PID" != "null" ]; then
  echo "Stopping AI Knowledge Base (PID: $KB_PID)..."
  kill $KB_PID 2>/dev/null || echo "Already stopped"
fi

rm "$PID_FILE"
echo "✅ Services stopped!"
