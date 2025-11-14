#!/bin/bash

# Azora OS - Core Services Startup Script
# Starts the essential services for testing integration

echo "🚀 Starting Azora OS Core Services..."
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if tmux is available
if ! command -v tmux &> /dev/null; then
    echo "⚠️  tmux not found. Install with: sudo apt install tmux"
    echo "Starting services in background instead..."
    
    cd services/azora-nexus && npm install && PORT=3000 npm start &
    cd services/api-gateway && npm install && PORT=4000 npm start &
    cd services/azora-education && npm install && PORT=3074 npm start &
    cd services/azora-mint && npm install && PORT=3080 npm start &
    cd services/azora-forge && npm install && PORT=3200 npm start &
    
    echo ""
    echo "✅ Services starting in background..."
    echo "📊 Check status: curl http://localhost:4000/api/health"
    exit 0
fi

# Create tmux session
SESSION="azora-core"

# Kill existing session if it exists
tmux kill-session -t $SESSION 2>/dev/null

# Create new session
tmux new-session -d -s $SESSION -n "nexus"

# Window 1: Azora Nexus (Event Bus)
tmux send-keys -t $SESSION:nexus "cd services/azora-nexus && npm install && PORT=3000 npm start" C-m

# Window 2: API Gateway
tmux new-window -t $SESSION -n "gateway"
tmux send-keys -t $SESSION:gateway "cd services/api-gateway && npm install && PORT=4000 npm start" C-m

# Window 3: Education Service
tmux new-window -t $SESSION -n "education"
tmux send-keys -t $SESSION:education "cd services/azora-education && npm install && PORT=3074 npm start" C-m

# Window 4: Mint Service
tmux new-window -t $SESSION -n "mint"
tmux send-keys -t $SESSION:mint "cd services/azora-mint && npm install && PORT=3080 npm start" C-m

# Window 5: Forge Service
tmux new-window -t $SESSION -n "forge"
tmux send-keys -t $SESSION:forge "cd services/azora-forge && npm install && PORT=3200 npm start" C-m

# Window 6: AI Family Service
tmux new-window -t $SESSION -n "ai-family"
tmux send-keys -t $SESSION:ai-family "cd services/ai-family-service && npm install && PORT=4010 npm start" C-m

# Window 7: Monitor
tmux new-window -t $SESSION -n "monitor"
tmux send-keys -t $SESSION:monitor "echo 'Waiting for services to start...'; sleep 10; watch -n 5 'curl -s http://localhost:4000/api/health | jq'" C-m

echo ""
echo -e "${GREEN}✅ Azora OS Core Services Started!${NC}"
echo ""
echo -e "${BLUE}📡 Services:${NC}"
echo "  • Nexus (Event Bus):  http://localhost:3000"
echo "  • API Gateway:        http://localhost:4000"
echo "  • Education:          http://localhost:3074"
echo "  • Mint:               http://localhost:3080"
echo "  • Forge:              http://localhost:3200"
echo "  • AI Family:          http://localhost:4010"
echo ""
echo -e "${BLUE}🔍 Quick Tests:${NC}"
echo "  • Health Check:       curl http://localhost:4000/api/health"
echo "  • Service Status:     curl http://localhost:3000/api/services"
echo "  • Event History:      curl http://localhost:3000/api/events"
echo ""
echo -e "${BLUE}📊 Commands:${NC}"
echo "  • Attach to session:  tmux attach -t $SESSION"
echo "  • Switch windows:     Ctrl+B then 0-6"
echo "  • Detach:             Ctrl+B then D"
echo "  • Stop all:           tmux kill-session -t $SESSION"
echo ""
echo "🌍 Ubuntu: 'I am because we are'"
echo ""

# Attach to session
tmux attach -t $SESSION
