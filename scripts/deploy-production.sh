#!/bin/bash

# Azora Production Deployment Script
# Ubuntu Philosophy: "My security ensures our freedom"

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT=${1:-production}
REGION=${AWS_REGION:-us-east-1}
CLUSTER_NAME="azora-${ENVIRONMENT}"
NAMESPACE="azora"

echo -e "${BLUE}🚀 Azora OS Production Deployment${NC}"
echo -e "${GREEN}Ubuntu Philosophy: My security ensures our freedom${NC}"
echo -e "${YELLOW}Environment: ${ENVIRONMENT}${NC}"
echo -e "${YELLOW}Region: ${REGION}${NC}"
echo ""

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    # Check AWS CLI
    if ! command -v aws &> /dev/null; then
        print_error "AWS CLI is not installed"
        exit 1
    fi
    
    # Check kubectl
    if ! command -v kubectl &> /dev/null; then
        print_error "kubectl is not installed"
        exit 1
    fi
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed"
        exit 1
    fi
    
    # Check AWS credentials
    if ! aws sts get-caller-identity &> /dev/null; then
        print_error "AWS credentials not configured"
        exit 1
    fi
    
    print_status "Prerequisites check passed ✓"
}

# Build and push Docker images
build_and_push_images() {
    print_status "Building and pushing Docker images..."
    
    # Services to build
    services=(
        "azora-api-gateway"
        "azora-auth"
        "azora-pay"
        "azora-marketplace"
        "azora-education"
        "azora-blockchain"
        "azora-ai"
        "azora-treasury"
    )
    
    for service in "${services[@]}"; do
        print_status "Building ${service}..."
        
        # Build Docker image
        docker build -t "azora/${service}:latest" "services/${service}/"
        
        # Tag for ECR
        account_id=$(aws sts get-caller-identity --query Account --output text)
        ecr_repo="${account_id}.dkr.ecr.${REGION}.amazonaws.com/azora-${service}"
        
        docker tag "azora/${service}:latest" "${ecr_repo}:latest"
        docker tag "azora/${service}:latest" "${ecr_repo}:$(date +%Y%m%d%H%M%S)"
        
        # Push to ECR
        aws ecr get-login-password --region ${REGION} | docker login --username AWS --password-stdin "${account_id}.dkr.ecr.${REGION}.amazonaws.com"
        docker push "${ecr_repo}:latest"
        
        print_status "${service} built and pushed ✓"
    done
}

# Deploy infrastructure
deploy_infrastructure() {
    print_status "Deploying infrastructure..."
    
    # Create EKS cluster if it doesn't exist
    if ! aws eks describe-cluster --name ${CLUSTER_NAME} --region ${REGION} &> /dev/null; then
        print_status "Creating EKS cluster ${CLUSTER_NAME}..."
        
        aws eks create-cluster \
            --name ${CLUSTER_NAME} \
            --version 1.29 \
            --role-arn arn:aws:iam::${account_id}:role/EKSClusterRole \
            --resources-vpc-config subnetIds=$(aws ec2 describe-subnets --filters Name=tag:Name,Values=azora-private-* --query "Subnets[*].SubnetId" --output text | tr '\t' ','),securityGroupIds=$(aws ec2 describe-security-groups --filters Name=tag:Name,Values=azora-sg --query "SecurityGroups[0].GroupId" --output text) \
            --region ${REGION}
        
        # Wait for cluster to be ready
        aws eks wait cluster-active --name ${CLUSTER_NAME} --region ${REGION}
        
        # Update kubeconfig
        aws eks update-kubeconfig --name ${CLUSTER_NAME} --region ${REGION}
    fi
    
    # Deploy Istio service mesh
    print_status "Deploying Istio service mesh..."
    kubectl create namespace istio-system --dry-run=client -o yaml | kubectl apply -f -
    
    # Install Istio
    if ! kubectl get namespace istio-system &> /dev/null; then
        istioctl install --set profile=default -y
    fi
    
    # Deploy cert-manager
    print_status "Deploying cert-manager..."
    kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml
    
    # Wait for cert-manager to be ready
    kubectl wait --for=condition=ready pod -l app.kubernetes.io/instance=cert-manager -n cert-manager-system --timeout=300s
    
    print_status "Infrastructure deployed ✓"
}

# Deploy applications
deploy_applications() {
    print_status "Deploying applications..."
    
    # Create namespace
    kubectl create namespace ${NAMESPACE} --dry-run=client -o yaml | kubectl apply -f -
    
    # Label namespace for Istio injection
    kubectl label namespace ${NAMESPACE} istio-injection=enabled --overwrite
    
    # Deploy secrets
    print_status "Deploying secrets..."
    kubectl apply -f infrastructure/k8s/secrets/
    
    # Deploy databases
    print_status "Deploying databases..."
    kubectl apply -f infrastructure/k8s/databases/
    
    # Deploy applications
    services=(
        "azora-auth"
        "azora-api-gateway"
        "azora-pay"
        "azora-marketplace"
        "azora-education"
        "azora-blockchain"
        "azora-ai"
        "azora-treasury"
    )
    
    for service in "${services[@]}"; do
        print_status "Deploying ${service}..."
        
        # Apply Kubernetes manifests
        if [ -d "services/${service}/k8s" ]; then
            kubectl apply -f services/${service}/k8s/ -n ${NAMESPACE}
        else
            # Generate basic deployment if no manifests exist
            cat <<EOF | kubectl apply -f -
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ${service}
  namespace: ${NAMESPACE}
  labels:
    app: ${service}
    ubuntu: "security-through-community"
spec:
  replicas: 3
  selector:
    matchLabels:
      app: ${service}
  template:
    metadata:
      labels:
        app: ${service}
        ubuntu: "security-through-community"
    spec:
      containers:
      - name: ${service}
        image: ${account_id}.dkr.ecr.${REGION}.amazonaws.com/azora-${service}:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "${ENVIRONMENT}"
        - name: UBUNTU_MODE
          value: "production"
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: ${service}
  namespace: ${NAMESPACE}
  labels:
    app: ${service}
    ubuntu: "security-through-community"
spec:
  selector:
    app: ${service}
  ports:
  - port: 80
    targetPort: 3000
  type: ClusterIP
EOF
        fi
        
        # Wait for deployment to be ready
        kubectl rollout status deployment/${service} -n ${NAMESPACE} --timeout=300s
        
        print_status "${service} deployed ✓"
    done
}

# Configure networking
configure_networking() {
    print_status "Configuring networking..."
    
    # Deploy Istio gateway
    kubectl apply -f infrastructure/k8s/istio-gateway.yaml
    
    # Deploy virtual services
    kubectl apply -f infrastructure/k8s/virtual-services/
    
    # Deploy mTLS policies
    kubectl apply -f infrastructure/k8s/mtls-service-mesh.yaml
    
    print_status "Networking configured ✓"
}

# Setup monitoring
setup_monitoring() {
    print_status "Setting up monitoring..."
    
    # Deploy Prometheus
    kubectl apply -f infrastructure/monitoring/prometheus/
    
    # Deploy Grafana
    kubectl apply -f infrastructure/monitoring/grafana/
    
    # Deploy Jaeger for tracing
    kubectl apply -f infrastructure/monitoring/jaeger/
    
    print_status "Monitoring setup ✓"
}

# Run health checks
run_health_checks() {
    print_status "Running health checks..."
    
    # Wait for all pods to be ready
    kubectl wait --for=condition=ready pod --all -n ${NAMESPACE} --timeout=600s
    
    # Check service health
    services=(
        "azora-auth"
        "azora-api-gateway"
        "azora-pay"
    )
    
    for service in "${services[@]}"; do
        # Get service URL
        service_url=$(kubectl get service ${service} -n ${NAMESPACE} -o jsonpath='{.status.loadBalancer.ingress[0].hostname}')
        
        if [ -n "$service_url" ]; then
            # Health check
            if curl -f -s "http://${service_url}/health" > /dev/null; then
                print_status "${service} health check passed ✓"
            else
                print_error "${service} health check failed ✗"
            fi
        fi
    done
}

# Cleanup old resources
cleanup() {
    print_status "Cleaning up old resources..."
    
    # Remove old Docker images
    docker system prune -f
    
    # Remove old Kubernetes resources
    kubectl delete pods -n ${NAMESPACE} --field-selector=status.phase=Succeeded --ignore-not-found=true
    kubectl delete pods -n ${NAMESPACE} --field-selector=status.phase=Failed --ignore-not-found=true
    
    print_status "Cleanup completed ✓"
}

# Main deployment flow
main() {
    print_status "Starting Azora OS deployment..."
    
    check_prerequisites
    build_and_push_images
    deploy_infrastructure
    deploy_applications
    configure_networking
    setup_monitoring
    run_health_checks
    cleanup
    
    print_status "🎉 Azora OS deployment completed successfully!"
    print_status "Ubuntu Philosophy: My security ensures our freedom"
    
    # Display access information
    echo ""
    echo -e "${GREEN}Access Information:${NC}"
    echo -e "API Gateway: http://$(kubectl get service azora-api-gateway -n ${NAMESPACE} -o jsonpath='{.status.loadBalancer.ingress[0].hostname}')"
    echo -e "Grafana: http://$(kubectl get service grafana -n monitoring -o jsonpath='{.status.loadBalancer.ingress[0].hostname}'):3000"
    echo -e "Prometheus: http://$(kubectl get service prometheus -n monitoring -o jsonpath='{.status.loadBalancer.ingress[0].hostname}'):9090"
}

# Handle script interruption
trap 'print_error "Deployment interrupted"; exit 1' INT TERM

# Run main function
main "$@"
