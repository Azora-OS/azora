#!/bin/bash
# Azora AI System Monitor Startup Script
# AI-driven auto-diagnosis and self-healing system

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
MONITOR_DIR="$PROJECT_ROOT/services/ai-system-monitor"
CONFIG_FILE="$MONITOR_DIR/config.json"
LOG_FILE="$PROJECT_ROOT/logs/ai_monitor.log"
PID_FILE="$PROJECT_ROOT/database/ai_monitor.pid"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log() {
    echo -e "$(date '+%Y-%m-%d %H:%M:%S') [$1] $2" | tee -a "$LOG_FILE"
}

check_dependencies() {
    log "INFO" "Checking dependencies..."

    # Check if Node.js is installed
    if ! command -v node &> /dev/null; then
        log "ERROR" "Node.js is not installed. Please install Node.js to run the AI monitor."
        exit 1
    fi

    # Check if npm is installed
    if ! command -v npm &> /dev/null; then
        log "ERROR" "npm is not installed. Please install npm to run the AI monitor."
        exit 1
    fi

    # Check if required Node.js modules are available
    if ! node -e "console.log('Node.js modules check passed')" &> /dev/null; then
        log "ERROR" "Node.js modules check failed."
        exit 1
    fi

    log "INFO" "Dependencies check passed."
}

install_dependencies() {
    log "INFO" "Installing AI monitor dependencies..."

    cd "$MONITOR_DIR"

    # Install required npm packages if package.json exists
    if [ -f "package.json" ]; then
        npm install
    else
        log "WARN" "No package.json found. Installing basic dependencies..."
        npm init -y --silent
        npm install --save node-fetch@2
    fi

    log "INFO" "Dependencies installed successfully."
}

start_monitor() {
    log "INFO" "Starting Azora AI System Monitor..."

    # Check if already running
    if [ -f "$PID_FILE" ]; then
        if kill -0 "$(cat "$PID_FILE")" 2>/dev/null; then
            log "WARN" "AI monitor is already running (PID: $(cat "$PID_FILE"))"
            exit 0
        else
            log "WARN" "Removing stale PID file"
            rm -f "$PID_FILE"
        fi
    fi

    # Start the monitor in background
    cd "$MONITOR_DIR"
    nohup node ai_monitor.js start > /dev/null 2>&1 &
    MONITOR_PID=$!

    # Save PID
    echo $MONITOR_PID > "$PID_FILE"

    # Wait a moment and check if it's still running
    sleep 2
    if kill -0 $MONITOR_PID 2>/dev/null; then
        log "INFO" "AI System Monitor started successfully (PID: $MONITOR_PID)"
        echo -e "${GREEN}✅ AI System Monitor is now running${NC}"
        echo -e "${BLUE}📊 PID: $MONITOR_PID${NC}"
        echo -e "${BLUE}📁 Logs: $LOG_FILE${NC}"
        echo -e "${BLUE}⚙️  Config: $CONFIG_FILE${NC}"
    else
        log "ERROR" "Failed to start AI System Monitor"
        rm -f "$PID_FILE"
        exit 1
    fi
}

stop_monitor() {
    log "INFO" "Stopping Azora AI System Monitor..."

    if [ ! -f "$PID_FILE" ]; then
        log "WARN" "PID file not found. AI monitor may not be running."
        exit 0
    fi

    MONITOR_PID=$(cat "$PID_FILE")

    if kill -0 $MONITOR_PID 2>/dev/null; then
        # Try graceful shutdown first
        kill $MONITOR_PID
        sleep 5

        # Force kill if still running
        if kill -0 $MONITOR_PID 2>/dev/null; then
            log "WARN" "Graceful shutdown failed, force killing..."
            kill -9 $MONITOR_PID
            sleep 2
        fi

        if kill -0 $MONITOR_PID 2>/dev/null; then
            log "ERROR" "Failed to stop AI monitor"
            exit 1
        else
            log "INFO" "AI System Monitor stopped successfully"
            rm -f "$PID_FILE"
            echo -e "${GREEN}✅ AI System Monitor stopped${NC}"
        fi
    else
        log "WARN" "AI monitor process not found"
        rm -f "$PID_FILE"
    fi
}

status_monitor() {
    if [ -f "$PID_FILE" ]; then
        MONITOR_PID=$(cat "$PID_FILE")
        if kill -0 $MONITOR_PID 2>/dev/null; then
            echo -e "${GREEN}✅ AI System Monitor is running${NC}"
            echo -e "${BLUE}📊 PID: $MONITOR_PID${NC}"

            # Get health status
            cd "$MONITOR_DIR"
            HEALTH=$(node ai_monitor.js status 2>/dev/null | jq -r '.overall' 2>/dev/null || echo "unknown")
            echo -e "${BLUE}🏥 Health: $HEALTH${NC}"

            return 0
        else
            echo -e "${RED}❌ AI System Monitor is not running (stale PID file)${NC}"
            rm -f "$PID_FILE"
            return 1
        fi
    else
        echo -e "${RED}❌ AI System Monitor is not running${NC}"
        return 1
    fi
}

diagnose_system() {
    log "INFO" "Running AI diagnostics..."

    cd "$MONITOR_DIR"
    if node ai_monitor.js diagnose; then
        log "INFO" "AI diagnostics completed successfully"
        echo -e "${GREEN}✅ AI diagnostics completed${NC}"
    else
        log "ERROR" "AI diagnostics failed"
        echo -e "${RED}❌ AI diagnostics failed${NC}"
        exit 1
    fi
}

generate_report() {
    log "INFO" "Generating AI health report..."

    cd "$MONITOR_DIR"
    if node ai_monitor.js report; then
        REPORT_FILE="$PROJECT_ROOT/docs/ai_system_health_report.json"
        log "INFO" "AI health report generated: $REPORT_FILE"
        echo -e "${GREEN}✅ AI health report generated${NC}"
        echo -e "${BLUE}📄 Report: $REPORT_FILE${NC}"
    else
        log "ERROR" "Failed to generate AI health report"
        echo -e "${RED}❌ Failed to generate AI health report${NC}"
        exit 1
    fi
}

test_healing() {
    log "INFO" "Testing self-healing capabilities..."

    cd "$MONITOR_DIR"
    if node ai_monitor.js heal; then
        log "INFO" "Self-healing test completed"
        echo -e "${GREEN}✅ Self-healing test completed${NC}"
    else
        log "ERROR" "Self-healing test failed"
        echo -e "${RED}❌ Self-healing test failed${NC}"
        exit 1
    fi
}

show_help() {
    echo "Azora AI System Monitor"
    echo "======================="
    echo ""
    echo "AI-driven auto-diagnosis and self-healing system for Azora OS"
    echo ""
    echo "Usage: $0 [command]"
    echo ""
    echo "Commands:"
    echo "  start          Start the AI system monitor"
    echo "  stop           Stop the AI system monitor"
    echo "  status         Show current status of the AI monitor"
    echo "  diagnose       Run AI diagnostics manually"
    echo "  report         Generate AI health report"
    echo "  heal           Test self-healing capabilities"
    echo "  install        Install dependencies"
    echo "  help           Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 start       # Start monitoring"
    echo "  $0 status      # Check if running"
    echo "  $0 diagnose    # Run diagnostics"
    echo "  $0 report      # Generate report"
    echo ""
    echo "Configuration: $CONFIG_FILE"
    echo "Logs: $LOG_FILE"
}

# Main command handling
case "${1:-help}" in
    start)
        check_dependencies
        install_dependencies
        start_monitor
        ;;
    stop)
        stop_monitor
        ;;
    status)
        status_monitor
        ;;
    diagnose)
        check_dependencies
        diagnose_system
        ;;
    report)
        check_dependencies
        generate_report
        ;;
    heal)
        check_dependencies
        test_healing
        ;;
    install)
        check_dependencies
        install_dependencies
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        echo -e "${RED}❌ Unknown command: $1${NC}"
        echo ""
        show_help
        exit 1
        ;;
esac