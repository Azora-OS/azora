#!/bin/bash
# Azora OS Production Deployment Script
# Agent 1: DevOps & Production Specialist
# Sprint 2: Automated Production Deployment

set -e

echo "🚀 Starting Azora OS Production Deployment"
echo "Ubuntu Philosophy: 'Ngiyakwazi ngoba sikwazi' - I can because we can"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
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

# Check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    if ! command -v kubectl &> /dev/null; then
        print_error "kubectl is not installed"
        exit 1
    fi
    
    if ! command -v helm &> /dev/null; then
        print_error "helm is not installed"
        exit 1
    fi
    
    # Check if kubectl can connect to cluster
    if ! kubectl cluster-info &> /dev/null; then
        print_error "Cannot connect to Kubernetes cluster"
        exit 1
    fi
    
    print_success "Prerequisites check passed"
}

# Install cert-manager
install_cert_manager() {
    print_status "Installing cert-manager..."
    
    # Add cert-manager repository
    helm repo add jetstack https://charts.jetstack.io
    helm repo update
    
    # Install cert-manager
    helm upgrade --install cert-manager jetstack/cert-manager \
        --namespace cert-manager \
        --create-namespace \
        --version v1.13.0 \
        --set installCRDs=true \
        --wait
    
    print_success "cert-manager installed"
}

# Install nginx ingress controller
install_nginx_ingress() {
    print_status "Installing NGINX Ingress Controller..."
    
    # Add nginx ingress repository
    helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
    helm repo update
    
    # Install nginx ingress
    helm upgrade --install ingress-nginx ingress-nginx/ingress-nginx \
        --namespace ingress-nginx \
        --create-namespace \
        --set controller.replicaCount=2 \
        --set controller.nodeSelector."kubernetes\.io/os"=linux \
        --set defaultBackend.nodeSelector."kubernetes\.io/os"=linux \
        --set controller.admissionWebhooks.patch.nodeSelector."kubernetes\.io/os"=linux \
        --wait
    
    print_success "NGINX Ingress Controller installed"
}

# Deploy Azora OS
deploy_azora() {
    print_status "Deploying Azora OS to production..."
    
    # Apply production deployment
    kubectl apply -f production-deployment.yaml
    
    # Wait for namespace to be ready
    kubectl wait --for=condition=Ready namespace/azora-production --timeout=60s
    
    # Apply monitoring stack
    kubectl apply -f monitoring-stack.yaml
    
    # Apply SSL certificates
    kubectl apply -f ssl-certificates.yaml
    
    print_success "Azora OS deployed"
}

# Wait for deployments
wait_for_deployments() {
    print_status "Waiting for deployments to be ready..."
    
    # Core services
    kubectl wait --for=condition=available --timeout=300s deployment/postgres -n azora-production
    kubectl wait --for=condition=available --timeout=300s deployment/redis -n azora-production
    kubectl wait --for=condition=available --timeout=300s deployment/api-gateway -n azora-production
    
    # Frontend applications
    kubectl wait --for=condition=available --timeout=300s deployment/student-portal -n azora-production
    kubectl wait --for=condition=available --timeout=300s deployment/enterprise-ui -n azora-production
    kubectl wait --for=condition=available --timeout=300s deployment/marketplace-ui -n azora-production
    kubectl wait --for=condition=available --timeout=300s deployment/pay-ui -n azora-production
    
    # Backend services
    kubectl wait --for=condition=available --timeout=300s deployment/auth-service -n azora-production
    kubectl wait --for=condition=available --timeout=300s deployment/education-service -n azora-production
    kubectl wait --for=condition=available --timeout=300s deployment/payment-service -n azora-production
    kubectl wait --for=condition=available --timeout=300s deployment/marketplace-service -n azora-production
    
    # Monitoring
    kubectl wait --for=condition=available --timeout=300s deployment/prometheus -n azora-production
    kubectl wait --for=condition=available --timeout=300s deployment/grafana -n azora-production
    
    print_success "All deployments are ready"
}

# Run database migrations
run_migrations() {
    print_status "Running database migrations..."
    
    # Create migration job
    kubectl create job --from=deployment/api-gateway migrate-db -n azora-production || true
    kubectl patch job migrate-db -n azora-production -p '{"spec":{"template":{"spec":{"containers":[{"name":"api-gateway","command":["npm","run","db:migrate"]}]}}}}'
    
    # Wait for migration to complete
    kubectl wait --for=condition=complete --timeout=300s job/migrate-db -n azora-production
    
    # Clean up migration job
    kubectl delete job migrate-db -n azora-production
    
    print_success "Database migrations completed"
}

# Health check
health_check() {
    print_status "Performing health checks..."
    
    # Get external IP
    EXTERNAL_IP=$(kubectl get service ingress-nginx-controller -n ingress-nginx -o jsonpath='{.status.loadBalancer.ingress[0].ip}')
    
    if [ -z "$EXTERNAL_IP" ]; then
        print_warning "External IP not yet assigned, checking service endpoints..."
        kubectl get services -n azora-production
    else
        print_success "External IP: $EXTERNAL_IP"
    fi
    
    # Check pod status
    print_status "Pod status:"
    kubectl get pods -n azora-production
    
    # Check service status
    print_status "Service status:"
    kubectl get services -n azora-production
    
    # Check ingress status
    print_status "Ingress status:"
    kubectl get ingress -n azora-production
    
    print_success "Health check completed"
}

# Display access information
display_access_info() {
    print_success "🎉 Azora OS Production Deployment Complete!"
    echo ""
    echo "🌍 Access Points:"
    echo "  • Main Site: https://azora.world"
    echo "  • Student Portal: https://learn.azora.world"
    echo "  • Enterprise UI: https://business.azora.world"
    echo "  • Marketplace: https://work.azora.world"
    echo "  • Payment Portal: https://pay.azora.world"
    echo "  • API Gateway: https://api.azora.world"
    echo "  • Monitoring: https://monitor.azora.world"
    echo ""
    echo "📊 Monitoring:"
    echo "  • Prometheus: https://monitor.azora.world/prometheus"
    echo "  • Grafana: https://monitor.azora.world (admin/ubuntu_admin)"
    echo ""
    echo "🔧 Management Commands:"
    echo "  • View pods: kubectl get pods -n azora-production"
    echo "  • View logs: kubectl logs -f deployment/api-gateway -n azora-production"
    echo "  • Scale service: kubectl scale deployment api-gateway --replicas=5 -n azora-production"
    echo ""
    echo "Ubuntu Success: Individual excellence enables collective advancement! 🚀"
}

# Main execution
main() {
    echo "Starting deployment at $(date)"
    
    check_prerequisites
    install_cert_manager
    install_nginx_ingress
    deploy_azora
    wait_for_deployments
    run_migrations
    health_check
    display_access_info
    
    echo "Deployment completed at $(date)"
}

# Handle script arguments
case "${1:-deploy}" in
    "deploy")
        main
        ;;
    "check")
        health_check
        ;;
    "clean")
        print_warning "Cleaning up Azora OS deployment..."
        kubectl delete namespace azora-production --ignore-not-found=true
        helm uninstall cert-manager -n cert-manager || true
        helm uninstall ingress-nginx -n ingress-nginx || true
        kubectl delete namespace cert-manager --ignore-not-found=true
        kubectl delete namespace ingress-nginx --ignore-not-found=true
        print_success "Cleanup completed"
        ;;
    "update")
        print_status "Updating Azora OS deployment..."
        kubectl apply -f production-deployment.yaml
        kubectl apply -f monitoring-stack.yaml
        kubectl apply -f ssl-certificates.yaml
        kubectl rollout restart deployment -n azora-production
        print_success "Update completed"
        ;;
    *)
        echo "Usage: $0 {deploy|check|clean|update}"
        echo "  deploy - Full production deployment"
        echo "  check  - Health check only"
        echo "  clean  - Remove all resources"
        echo "  update - Update existing deployment"
        exit 1
        ;;
esac