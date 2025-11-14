#!/bin/bash

AZORA_DIR="$HOME/.azora"
PID_FILE="$AZORA_DIR/services.pid"
LOG_FILE="$AZORA_DIR/services.log"

mkdir -p "$AZORA_DIR"

echo "🌟 Starting Azora Services as Daemon..."

# Start Auth Service
echo "🔐 Starting Auth Service..."
cd services/auth-service
nohup npm start >> "$LOG_FILE" 2>&1 &
AUTH_PID=$!
echo "Auth Service PID: $AUTH_PID"

# Start Knowledge Ocean
echo "📚 Starting Knowledge Ocean..."
cd ../knowledge-ocean
nohup npm start >> "$LOG_FILE" 2>&1 &
OCEAN_PID=$!
echo "Knowledge Ocean PID: $OCEAN_PID"

# Start AI Knowledge Base
echo "🧠 Starting AI Knowledge Base..."
cd ../ai-knowledge-base
nohup npm run dev >> "$LOG_FILE" 2>&1 &
KB_PID=$!
echo "AI Knowledge Base PID: $KB_PID"

# Save PIDs
cat > "$PID_FILE" <<EOF
{
  "auth-service": $AUTH_PID,
  "knowledge-ocean": $OCEAN_PID,
  "ai-knowledge-base": $KB_PID
}
EOF

echo "✅ Services started!"
echo "📝 Logs: $LOG_FILE"
echo "🔍 PIDs: $PID_FILE"
echo ""
echo "To stop services: ./scripts/stop-services-daemon.sh"
