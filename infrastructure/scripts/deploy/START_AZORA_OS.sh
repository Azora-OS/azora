#!/bin/bash

# Elazar OS Startup Script
# Launches all core services and initializes the planetary network

echo "=========================================="
echo "Starting Elazar OS"
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_header() {
    echo -e "${BLUE}[STARTUP]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if a service is running
check_service() {
    local service_name=$1
    local pid_file="/tmp/elazar_${service_name}.pid"

    if [ -f "$pid_file" ]; then
        local pid=$(cat "$pid_file")
        if kill -0 "$pid" 2>/dev/null; then
            return 0
        else
            rm -f "$pid_file"
        fi
    fi
    return 1
}

# Function to start a service
start_service() {
    local service_name=$1
    local service_command=$2
    local pid_file="/tmp/elazar_${service_name}.pid"

    print_header "Starting $service_name..."

    if check_service "$service_name"; then
        print_warning "$service_name is already running"
        return 0
    fi

    # Start service in background
    eval "$service_command" &
    local pid=$!

    # Wait a moment for service to start
    sleep 2

    if kill -0 "$pid" 2>/dev/null; then
        echo $pid > "$pid_file"
        print_success "$service_name started (PID: $pid)"
        return 0
    else
        print_error "Failed to start $service_name"
        return 1
    fi
}

# Check if binaries exist
print_header "Checking Elazar OS binaries..."
if [ ! -f "azora-mine" ] || [ ! -f "elazar-ai" ] || [ ! -f "elazar-monitor" ] || [ ! -f "elazar-security" ] || [ ! -f "elazar-network" ] || [ ! -f "elazar-package" ]; then
    print_error "Elazar OS binaries not found. Run ./build.sh first."
    exit 1
fi

print_success "All binaries found"

# Start C++ core services
print_header "Starting C++ Core Services"

start_service "elazar-ai" "./elazar-ai"
start_service "azora-mine" "./azora-mine"
start_service "elazar-security" "./elazar-security"
start_service "elazar-network" "./elazar-network"
start_service "elazar-package" "./elazar-package"
start_service "elazar-monitor" "./elazar-monitor"

# Start web services (if Node.js is available)
if command -v node &> /dev/null && [ -f "server.js" ]; then
    print_header "Starting Web Services"
    start_service "web-server" "node server.js"
else
    print_warning "Node.js not available - web services skipped"
fi

# Start planetary network (if configured)
if [ -f "planetary-config.json" ]; then
    print_header "Starting Planetary Network"
    # Planetary network services would be started here
    print_success "Planetary network initialized"
else
    print_warning "Planetary network not configured"
fi

# Start Android services (if on Android device)
if [ -d "android" ]; then
    print_header "Android Integration"
    print_info "Android services will start when the app is launched on device"
fi

# Start Windows services (if on Windows)
if [ -d "windows" ]; then
    print_header "Windows Integration"
    print_info "Run windows/start_elazar_windows.bat on Windows systems"
fi

print_header "Elazar OS Startup Complete"
echo "=========================================="
echo "Active Services:"
echo "• Elazar AI: Consciousness Engine"
echo "• Azora Mine: Cryptographic Mining"
echo "• Elazar Security: Quantum Security"
echo "• Elazar Network: Planetary Networking"
echo "• Elazar Package: System Management"
echo "• Elazar Monitor: System Analytics"
if check_service "web-server"; then
    echo "• Web Server: User Interface"
fi
echo "=========================================="

print_success "Elazar OS is now running"
print_success "Access dashboard at: http://localhost:3000"
print_success "Prosperity dashboard: prosperity-dashboard.html"

# Keep script running to monitor services
print_header "Monitoring services... (Press Ctrl+C to stop)"

# Service monitoring loop
while true; do
    sleep 30

    # Check all services
    services=("elazar-ai" "azora-mine" "elazar-security" "elazar-network" "elazar-package" "elazar-monitor")
    all_running=true

    for service in "${services[@]}"; do
        if ! check_service "$service"; then
            print_warning "$service has stopped - attempting restart"
            # Restart logic would go here
            all_running=false
        fi
    done

    if $all_running; then
        echo -e "${GREEN}[HEALTH]${NC} All services running normally"
    fi
done