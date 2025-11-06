#!/bin/bash

# Elazar OS Service Health Check Script
# Monitors all services and reports their status

echo "=========================================="
echo "Elazar OS Service Health Check"
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_header() {
    echo -e "${BLUE}[HEALTH]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[OK]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check service status
check_service() {
    local service_name=$1
    local pid_file="/tmp/elazar_${service_name}.pid"

    if [ -f "$pid_file" ]; then
        local pid=$(cat "$pid_file")
        if kill -0 "$pid" 2>/dev/null; then
            print_success "$service_name is running (PID: $pid)"
            return 0
        else
            print_error "$service_name PID file exists but process is dead"
            rm -f "$pid_file"
            return 1
        fi
    else
        print_error "$service_name is not running"
        return 1
    fi
}

# Function to check port availability
check_port() {
    local port=$1
    local service_name=$2

    if command -v nc &> /dev/null; then
        if nc -z localhost $port 2>/dev/null; then
            print_success "$service_name responding on port $port"
            return 0
        else
            print_warning "$service_name not responding on port $port"
            return 1
        fi
    else
        print_warning "netcat not available - skipping port check for $service_name"
        return 0
    fi
}

print_header "Checking C++ Core Services"

# Check C++ services
check_service "elazar-ai"
check_service "azora-mine"
check_service "elazar-security"
check_service "elazar-network"
check_service "elazar-package"
check_service "elazar-monitor"

print_header "Checking Web Services"

# Check web services
if command -v node &> /dev/null && [ -f "server.js" ]; then
    check_service "web-server"
    check_port 3000 "Web Server"
else
    print_warning "Node.js not available or server.js not found"
fi

print_header "Checking Planetary Network"

# Check planetary network
if [ -f "planetary-config.json" ]; then
    check_port 8081 "Node Discovery Service"
    check_port 8082 "Planetary API"
    print_success "Planetary network configuration found"
else
    print_warning "Planetary network not configured"
fi

print_header "Checking Android Integration"

# Check Android services
if [ -d "android" ]; then
    if [ -f "android/app/build/outputs/apk/debug/app-debug.apk" ]; then
        print_success "Android app built and ready"
    else
        print_warning "Android app not built"
    fi
else
    print_warning "Android integration not configured"
fi

print_header "Checking Windows Integration"

# Check Windows services
if [ -d "windows" ]; then
    print_success "Windows integration configured"
    # Check if Windows services are running (would need Windows-specific checks)
else
    print_warning "Windows integration not configured"
fi

print_header "System Resources"

# Check system resources
echo "CPU Usage: $(top -bn1 | grep "Cpu(s)" | sed "s/.*, *\([0-9.]*\)%* id.*/\1/" | awk '{print 100 - $1"%"}')"
echo "Memory Usage: $(free | grep Mem | awk '{printf "%.2f%%", $3/$2 * 100.0}')"
echo "Disk Usage: $(df / | tail -1 | awk '{print $5}')"

print_header "Service Health Summary"

# Count running services
running_services=0
total_services=6  # C++ services

services=("elazar-ai" "azora-mine" "elazar-security" "elazar-network" "elazar-package" "elazar-monitor")
for service in "${services[@]}"; do
    pid_file="/tmp/elazar_${service}.pid"
    if [ -f "$pid_file" ]; then
        pid=$(cat "$pid_file")
        if kill -0 "$pid" 2>/dev/null; then
            ((running_services++))
        fi
    fi
done

echo "=========================================="
echo "Services Running: $running_services / $total_services"
echo "Health Status: $([ $running_services -eq $total_services ] && echo "EXCELLENT" || echo "DEGRADED")"
echo "=========================================="

if [ $running_services -eq $total_services ]; then
    print_success "All core services are healthy"
    exit 0
else
    print_warning "Some services are not running"
    echo ""
    echo "To start missing services, run:"
    echo "  ./START_AZORA_OS.sh"
    exit 1
fi