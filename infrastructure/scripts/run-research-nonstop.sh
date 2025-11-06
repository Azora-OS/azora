#!/bin/bash
#
# AZORA PROPRIETARY LICENSE
# Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.
#
# NON-STOP CONSTITUTIONAL RESEARCH RUNNER
# Runs research agent continuously with auto-restart
# From Africa, For Humanity, Unto God's Glory
#

set -e

echo "🙏 STARTING NON-STOP CONSTITUTIONAL RESEARCH"
echo "=============================================="
echo ""
echo "📖 'Unless the LORD builds the house, the builders labor in vain.' - Psalm 127:1"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
GOLD='\033[0;33m'
NC='\033[0m' # No Color

# Configuration
LOG_DIR="/workspace/logs/research"
RESEARCH_DIR="/workspace/docs/research"
MAX_RESTARTS=1000
RESTART_DELAY=5

# Create directories
mkdir -p "$LOG_DIR"
mkdir -p "$RESEARCH_DIR"

# Log file
LOG_FILE="$LOG_DIR/research_$(date +%Y%m%d_%H%M%S).log"

echo -e "${BLUE}📁 Logs: $LOG_FILE${NC}"
echo -e "${BLUE}📚 Research: $RESEARCH_DIR${NC}"
echo ""

# Function to run research
run_research() {
    local restart_count=0
    
    while [ $restart_count -lt $MAX_RESTARTS ]; do
        echo -e "${GOLD}🚀 Starting research agent (Restart #$restart_count)${NC}" | tee -a "$LOG_FILE"
        echo -e "${GREEN}⏰ $(date)${NC}" | tee -a "$LOG_FILE"
        
        # Run the research agent
        npx ts-node /workspace/scripts/start-constitutional-research.ts 2>&1 | tee -a "$LOG_FILE"
        
        EXIT_CODE=$?
        
        if [ $EXIT_CODE -eq 0 ]; then
            echo -e "${GREEN}✅ Research agent stopped gracefully${NC}" | tee -a "$LOG_FILE"
            break
        else
            echo -e "${GOLD}⚠️  Agent stopped with code $EXIT_CODE${NC}" | tee -a "$LOG_FILE"
            restart_count=$((restart_count + 1))
            
            if [ $restart_count -lt $MAX_RESTARTS ]; then
                echo -e "${BLUE}🔄 Restarting in ${RESTART_DELAY} seconds...${NC}" | tee -a "$LOG_FILE"
                sleep $RESTART_DELAY
            fi
        fi
    done
    
    echo -e "${GREEN}🏁 Research runner completed after $restart_count restarts${NC}" | tee -a "$LOG_FILE"
}

# Trap SIGINT and SIGTERM for graceful shutdown
trap 'echo -e "\n${GOLD}🛑 Stopping research runner...${NC}"; exit 0' SIGINT SIGTERM

# Start research
echo -e "${GREEN}✨ Research agent starting in non-stop mode${NC}"
echo -e "${BLUE}Press Ctrl+C to stop${NC}"
echo ""

run_research

echo ""
echo -e "${GOLD}🙏 'May all glory be given to God' - AMEN${NC}"
echo ""
