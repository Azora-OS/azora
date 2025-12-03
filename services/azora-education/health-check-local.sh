#!/bin/bash

# Azora Education Service Health Check and Monitoring Script
# This script monitors the health and performance of the Azora Education service

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
SERVICE_URL="http://localhost:4200"
HEALTH_ENDPOINT="/health"
METRICS_ENDPOINT="/metrics"
LOG_FILE="logs/education-health.log"
ALERT_EMAIL="alerts@azora.world"

# Thresholds
RESPONSE_TIME_THRESHOLD=5000  # 5 seconds
ERROR_RATE_THRESHOLD=5        # 5%
MEMORY_USAGE_THRESHOLD=80     # 80%
DISK_USAGE_THRESHOLD=90       # 90%
CPU_USAGE_THRESHOLD=80        # 80%

# Functions
log_info() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')] [INFO]${NC} $1" | tee -a $LOG_FILE
}

log_success() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')] [SUCCESS]${NC} $1" | tee -a $LOG_FILE
}

log_warning() {
    echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')] [WARNING]${NC} $1" | tee -a $LOG_FILE
}

log_error() {
    echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')] [ERROR]${NC} $1" | tee -a $LOG_FILE
}

send_alert() {
    local subject="$1"
    local message="$2"

    if [ -n "$ALERT_EMAIL" ]; then
        echo "$message" | mail -s "Azora Education Alert: $subject" $ALERT_EMAIL
    fi

    # Also log to system journal
    logger -t "azora-education" "ALERT: $subject - $message"
}

check_service_health() {
    log_info "Checking service health..."

    local start_time=$(date +%s%N)
    local response=$(curl -s -w "HTTPSTATUS:%{http_code};TIME:%{time_total}" $SERVICE_URL$HEALTH_ENDPOINT 2>/dev/null)
    local end_time=$(date +%s%N)

    local http_code=$(echo $response | tr -d '\n' | sed -e 's/.*HTTPSTATUS://' | sed -e 's/;TIME.*//')
    local response_time=$(echo $response | tr -d '\n' | sed -e 's/.*TIME://')
    local response_body=$(echo $response | sed -e 's/HTTPSTATUS.*//')

    # Convert response time to milliseconds
    response_time_ms=$(echo "scale=0; $response_time * 1000" | bc 2>/dev/null || echo "0")

    if [ "$http_code" = "200" ]; then
        log_success "Service is healthy (Response time: ${response_time_ms}ms)"

        # Check response time threshold
        if [ "$response_time_ms" -gt "$RESPONSE_TIME_THRESHOLD" ]; then
            log_warning "Response time (${response_time_ms}ms) exceeds threshold (${RESPONSE_TIME_THRESHOLD}ms)"
            send_alert "High Response Time" "Response time: ${response_time_ms}ms (threshold: ${RESPONSE_TIME_THRESHOLD}ms)"
        fi

        return 0
    else
        log_error "Service health check failed (HTTP $http_code)"
        send_alert "Service Unhealthy" "Health check returned HTTP $http_code"
        return 1
    fi
}

check_database_connectivity() {
    log_info "Checking database connectivity..."

    # Check MongoDB connectivity
    if docker-compose exec -T mongo mongo --eval "db.stats()" >/dev/null 2>&1; then
        log_success "Database connectivity is healthy"
        return 0
    else
        log_error "Database connectivity check failed"
        send_alert "Database Connection Failed" "Unable to connect to MongoDB"
        return 1
    fi
}

check_disk_usage() {
    log_info "Checking disk usage..."

    local disk_usage=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')

    if [ "$disk_usage" -lt "$DISK_USAGE_THRESHOLD" ]; then
        log_success "Disk usage is healthy (${disk_usage}%)"
        return 0
    else
        log_error "Disk usage is high (${disk_usage}%)"
        send_alert "High Disk Usage" "Disk usage: ${disk_usage}% (threshold: ${DISK_USAGE_THRESHOLD}%)"
        return 1
    fi
}

check_memory_usage() {
    log_info "Checking memory usage..."

    local memory_usage=$(free | grep Mem | awk '{printf "%.0f", $3/$2 * 100.0}')

    if [ "$memory_usage" -lt "$MEMORY_USAGE_THRESHOLD" ]; then
        log_success "Memory usage is healthy (${memory_usage}%)"
        return 0
    else
        log_error "Memory usage is high (${memory_usage}%)"
        send_alert "High Memory Usage" "Memory usage: ${memory_usage}% (threshold: ${MEMORY_USAGE_THRESHOLD}%)"
        return 1
    fi
}

check_cpu_usage() {
    log_info "Checking CPU usage..."

    local cpu_usage=$(top -bn1 | grep "Cpu(s)" | sed "s/.*, *\([0-9.]*\)%* id.*/\1/" | awk '{print 100 - $1}')

    if [ "$(echo "$cpu_usage < $CPU_USAGE_THRESHOLD" | bc -l)" = "1" ]; then
        log_success "CPU usage is healthy (${cpu_usage}%)"
        return 0
    else
        log_error "CPU usage is high (${cpu_usage}%)"
        send_alert "High CPU Usage" "CPU usage: ${cpu_usage}% (threshold: ${CPU_USAGE_THRESHOLD}%)"
        return 1
    fi
}

check_container_status() {
    log_info "Checking container status..."

    cd /workspaces/azora-os/services/azora-education

    local unhealthy_containers=$(docker-compose ps | grep -v "Up" | grep -v "Name" | wc -l)

    if [ "$unhealthy_containers" -eq "0" ]; then
        log_success "All containers are healthy"
        return 0
    else
        log_error "Some containers are unhealthy"
        docker-compose ps
        send_alert "Container Issues" "Some containers are not running properly"
        return 1
    fi
}

check_error_rate() {
    log_info "Checking application error rate..."

    # Check application logs for errors in the last hour
    local error_count=$(docker-compose logs --since 1h 2>&1 | grep -i error | wc -l)
    local total_requests=$(docker-compose logs --since 1h 2>&1 | grep -E "(GET|POST|PUT|DELETE)" | wc -l)

    if [ "$total_requests" -eq "0" ]; then
        log_info "No requests in the last hour"
        return 0
    fi

    local error_rate=$(echo "scale=2; $error_count / $total_requests * 100" | bc 2>/dev/null || echo "0")

    if [ "$(echo "$error_rate < $ERROR_RATE_THRESHOLD" | bc -l)" = "1" ]; then
        log_success "Error rate is healthy (${error_rate}%)"
        return 0
    else
        log_error "Error rate is high (${error_rate}%)"
        send_alert "High Error Rate" "Error rate: ${error_rate}% (threshold: ${ERROR_RATE_THRESHOLD}%)"
        return 1
    fi
}

collect_metrics() {
    log_info "Collecting performance metrics..."

    # Get metrics from the application
    local metrics=$(curl -s $SERVICE_URL$METRICS_ENDPOINT 2>/dev/null)

    if [ -n "$metrics" ]; then
        log_success "Metrics collected successfully"

        # Log key metrics
        echo "$metrics" | grep -E "(response_time|memory_usage|cpu_usage|active_connections)" | while read -r line; do
            log_info "Metric: $line"
        done
    else
        log_warning "Unable to collect application metrics"
    fi
}

generate_report() {
    log_info "Generating health report..."

    local report_file="/tmp/azora-education-health-report-$(date +%Y%m%d_%H%M%S).txt"

    {
        echo "Azora Education Service Health Report"
        echo "====================================="
        echo "Generated: $(date)"
        echo ""
        echo "Service Status:"
        echo "- URL: $SERVICE_URL"
        echo "- Health Endpoint: $HEALTH_ENDPOINT"
        echo ""
        echo "System Resources:"
        echo "- CPU Usage: $(top -bn1 | grep "Cpu(s)" | sed "s/.*, *\([0-9.]*\)%* id.*/\1/" | awk '{print 100 - $1}')%"
        echo "- Memory Usage: $(free | grep Mem | awk '{printf "%.0f", $3/$2 * 100.0}')%"
        echo "- Disk Usage: $(df / | tail -1 | awk '{print $5}')"
        echo ""
        echo "Container Status:"
        docker-compose ps
        echo ""
        echo "Recent Logs (last 10 lines):"
        docker-compose logs --tail=10 2>&1
        echo ""
        echo "Recent Errors (last hour):"
        docker-compose logs --since 1h 2>&1 | grep -i error | tail -5
    } > "$report_file"

    log_success "Health report generated: $report_file"
    echo "$report_file"
}

cleanup_old_logs() {
    log_info "Cleaning up old log files..."

    # Remove log files older than 30 days
    find logs -name "*.log" -mtime +30 -delete

    log_success "Old logs cleaned up"
}

main() {
    echo "Azora Education Health Check"
    echo "============================"

    local exit_code=0
    local checks_passed=0
    local total_checks=0

    # Create log directory if it doesn't exist
    mkdir -p logs

    case "${1:-check}" in
        "check")
            log_info "Running comprehensive health check..."

            # Run all health checks
            ((total_checks++))
            if check_service_health; then ((checks_passed++)); else exit_code=1; fi

            ((total_checks++))
            if check_database_connectivity; then ((checks_passed++)); else exit_code=1; fi

            ((total_checks++))
            if check_container_status; then ((checks_passed++)); else exit_code=1; fi

            ((total_checks++))
            if check_disk_usage; then ((checks_passed++)); else exit_code=1; fi

            ((total_checks++))
            if check_memory_usage; then ((checks_passed++)); else exit_code=1; fi

            ((total_checks++))
            if check_cpu_usage; then ((checks_passed++)); else exit_code=1; fi

            ((total_checks++))
            if check_error_rate; then ((checks_passed++)); else exit_code=1; fi

            collect_metrics

            echo ""
            log_info "Health check summary: $checks_passed/$total_checks checks passed"

            if [ $exit_code -eq 0 ]; then
                log_success "All critical checks passed"
            else
                log_error "Some checks failed"
            fi

            exit $exit_code
            ;;
        "monitor")
            log_info "Starting continuous monitoring..."

            while true; do
                main check
                sleep 300  # Check every 5 minutes
            done
            ;;
        "report")
            generate_report
            ;;
        "cleanup")
            cleanup_old_logs
            ;;
        "metrics")
            collect_metrics
            ;;
        *)
            echo "Usage: $0 {check|monitor|report|cleanup|metrics}"
            echo ""
            echo "Commands:"
            echo "  check   - Run comprehensive health check"
            echo "  monitor - Start continuous monitoring (runs every 5 minutes)"
            echo "  report  - Generate detailed health report"
            echo "  cleanup - Clean up old log files"
            echo "  metrics - Collect and display performance metrics"
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"