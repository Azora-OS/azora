#!/bin/bash
# Azora OS Production Deployment Validation
# Agent 1: DevOps & Production Specialist
# Sprint 2: Deployment Verification

set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_header() {
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE}  AZORA OS DEPLOYMENT VALIDATION${NC}"
    echo -e "${BLUE}================================${NC}"
    echo ""
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if kubectl is available
check_kubectl() {
    if ! command -v kubectl &> /dev/null; then
        print_error "kubectl is not installed or not in PATH"
        exit 1
    fi
    print_success "kubectl is available"
}

# Check cluster connectivity
check_cluster() {
    if kubectl cluster-info &> /dev/null; then
        print_success "Connected to Kubernetes cluster"
        kubectl cluster-info | head -2
    else
        print_error "Cannot connect to Kubernetes cluster"
        exit 1
    fi
}

# Check namespace
check_namespace() {
    if kubectl get namespace azora-production &> /dev/null; then
        print_success "azora-production namespace exists"
    else
        print_error "azora-production namespace not found"
        return 1
    fi
}

# Check deployments
check_deployments() {
    print_info "Checking deployments..."
    
    deployments=(
        "postgres"
        "redis"
        "api-gateway"
        "student-portal"
        "enterprise-ui"
        "marketplace-ui"
        "pay-ui"
        "auth-service"
        "education-service"
        "payment-service"
        "marketplace-service"
        "nginx"
        "prometheus"
        "grafana"
    )
    
    for deployment in "${deployments[@]}"; do
        if kubectl get deployment "$deployment" -n azora-production &> /dev/null; then
            ready=$(kubectl get deployment "$deployment" -n azora-production -o jsonpath='{.status.readyReplicas}')
            desired=$(kubectl get deployment "$deployment" -n azora-production -o jsonpath='{.spec.replicas}')
            
            if [ "$ready" = "$desired" ] && [ "$ready" != "" ]; then
                print_success "$deployment: $ready/$desired replicas ready"
            else
                print_warning "$deployment: $ready/$desired replicas ready"
            fi
        else
            print_error "$deployment: deployment not found"
        fi
    done
}

# Check services
check_services() {
    print_info "Checking services..."
    
    services=(
        "postgres"
        "redis"
        "api-gateway"
        "student-portal"
        "enterprise-ui"
        "marketplace-ui"
        "pay-ui"
        "auth-service"
        "education-service"
        "payment-service"
        "marketplace-service"
        "nginx"
        "prometheus"
        "grafana"
    )
    
    for service in "${services[@]}"; do
        if kubectl get service "$service" -n azora-production &> /dev/null; then
            print_success "$service: service exists"
        else
            print_error "$service: service not found"
        fi
    done
}

# Check persistent volumes
check_pvcs() {
    print_info "Checking persistent volume claims..."
    
    pvcs=(
        "postgres-pvc"
        "redis-pvc"
        "prometheus-pvc"
        "grafana-pvc"
        "backup-pvc"
    )
    
    for pvc in "${pvcs[@]}"; do
        if kubectl get pvc "$pvc" -n azora-production &> /dev/null; then
            status=$(kubectl get pvc "$pvc" -n azora-production -o jsonpath='{.status.phase}')
            if [ "$status" = "Bound" ]; then
                print_success "$pvc: $status"
            else
                print_warning "$pvc: $status"
            fi
        else
            print_error "$pvc: not found"
        fi
    done
}

# Check ingress
check_ingress() {
    print_info "Checking ingress..."
    
    if kubectl get ingress azora-ingress -n azora-production &> /dev/null; then
        print_success "azora-ingress exists"
        
        # Check if external IP is assigned
        external_ip=$(kubectl get ingress azora-ingress -n azora-production -o jsonpath='{.status.loadBalancer.ingress[0].ip}')
        if [ -n "$external_ip" ]; then
            print_success "External IP assigned: $external_ip"
        else
            print_warning "External IP not yet assigned"
        fi
    else
        print_error "azora-ingress not found"
    fi
}

# Check SSL certificates
check_certificates() {
    print_info "Checking SSL certificates..."
    
    if kubectl get certificate azora-tls -n azora-production &> /dev/null; then
        status=$(kubectl get certificate azora-tls -n azora-production -o jsonpath='{.status.conditions[0].status}')
        if [ "$status" = "True" ]; then
            print_success "SSL certificate is ready"
        else
            print_warning "SSL certificate is not ready yet"
        fi
    else
        print_warning "SSL certificate not found (may not be configured)"
    fi
}

# Check monitoring
check_monitoring() {
    print_info "Checking monitoring stack..."
    
    # Check if Prometheus is accessible
    if kubectl get service prometheus -n azora-production &> /dev/null; then
        print_success "Prometheus service exists"
    else
        print_error "Prometheus service not found"
    fi
    
    # Check if Grafana is accessible
    if kubectl get service grafana -n azora-production &> /dev/null; then
        print_success "Grafana service exists"
    else
        print_error "Grafana service not found"
    fi
}

# Check backup jobs
check_backups() {
    print_info "Checking backup jobs..."
    
    backup_jobs=(
        "postgres-backup"
        "redis-backup"
        "backup-health-check"
    )
    
    for job in "${backup_jobs[@]}"; do
        if kubectl get cronjob "$job" -n azora-production &> /dev/null; then
            print_success "$job: cronjob exists"
        else
            print_warning "$job: cronjob not found"
        fi
    done
}

# Health check endpoints
check_health_endpoints() {
    print_info "Checking health endpoints..."
    
    # Port forward API gateway temporarily for health check
    kubectl port-forward service/api-gateway 8080:4000 -n azora-production &
    PF_PID=$!
    sleep 3
    
    if curl -s http://localhost:8080/api/health > /dev/null; then
        print_success "API Gateway health endpoint responding"
    else
        print_warning "API Gateway health endpoint not responding"
    fi
    
    # Clean up port forward
    kill $PF_PID 2>/dev/null || true
}

# Resource usage summary
check_resource_usage() {
    print_info "Resource usage summary..."
    
    echo ""
    echo "Pod Resource Usage:"
    kubectl top pods -n azora-production 2>/dev/null || print_warning "Metrics server not available"
    
    echo ""
    echo "Node Resource Usage:"
    kubectl top nodes 2>/dev/null || print_warning "Metrics server not available"
}

# Main validation function
main() {
    print_header
    
    print_info "Starting Azora OS deployment validation..."
    echo ""
    
    check_kubectl
    check_cluster
    echo ""
    
    check_namespace
    echo ""
    
    check_deployments
    echo ""
    
    check_services
    echo ""
    
    check_pvcs
    echo ""
    
    check_ingress
    echo ""
    
    check_certificates
    echo ""
    
    check_monitoring
    echo ""
    
    check_backups
    echo ""
    
    check_health_endpoints
    echo ""
    
    check_resource_usage
    echo ""
    
    print_info "Validation completed!"
    echo ""
    print_success "🚀 Azora OS Production Infrastructure Status Check Complete"
    echo -e "${BLUE}Ubuntu Philosophy: 'Ngiyakwazi ngoba sikwazi' - Individual excellence enables collective advancement${NC}"
}

# Run validation
main