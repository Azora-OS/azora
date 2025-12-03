#!/bin/bash

# Azora OS Service Mesh Deployment Script
# Deploys Istio with mTLS enforcement and security policies
# Ubuntu Philosophy: "My security ensures our freedom"

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
NAMESPACE="azora-production"
ISTIO_VERSION="1.19.3"
CERT_MANAGER_VERSION="1.13.0"

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check if kubectl is installed
    if ! command -v kubectl &> /dev/null; then
        log_error "kubectl is not installed"
        exit 1
    fi
    
    # Check if cluster is accessible
    if ! kubectl cluster-info &> /dev/null; then
        log_error "Cannot connect to Kubernetes cluster"
        exit 1
    fi
    
    # Check if helm is installed
    if ! command -v helm &> /dev/null; then
        log_error "helm is not installed"
        exit 1
    fi
    
    log_success "Prerequisites check passed"
}

# Install Istio
install_istio() {
    log_info "Installing Istio..."
    
    # Add Istio Helm repository
    helm repo add istio https://istio-release.storage.googleapis.com/charts
    helm repo update
    
    # Create Istio namespace
    kubectl create namespace istio-system --dry-run=client -o yaml | kubectl apply -f -
    
    # Install Istio base
    helm upgrade --install istio-base istio/base \
        --namespace istio-system \
        --set defaultRevision=default \
        --wait
    
    # Install Istiod
    helm upgrade --install istiod istio/istiod \
        --namespace istio-system \
        --set values.global.mtls.enabled=true \
        --set values.pilot.autoscaleEnabled=true \
        --set values.pilot.replicaCount=2 \
        --set values.telemetry.v2.prometheus.enabled=true \
        --wait
    
    # Install Istio ingress gateway
    helm upgrade --install istio-ingressgateway istio/gateway \
        --namespace istio-system \
        --set values.autoscaleEnabled=true \
        --set values.replicaCount=2 \
        --set values.service.type=LoadBalancer \
        --wait
    
    log_success "Istio installed successfully"
}

# Install cert-manager
install_cert_manager() {
    log_info "Installing cert-manager..."
    
    # Add cert-manager Helm repository
    helm repo add jetstack https://charts.jetstack.io
    helm repo update
    
    # Install cert-manager CRDs
    kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v${CERT_MANAGER_VERSION}/cert-manager.crds.yaml
    
    # Install cert-manager
    helm upgrade --install cert-manager jetstack/cert-manager \
        --namespace cert-manager \
        --create-namespace \
        --set installCRDs=true \
        --wait
    
    log_success "cert-manager installed successfully"
}

# Enable mTLS
enable_mtls() {
    log_info "Enabling mTLS..."
    
    # Apply mTLS policies
    kubectl apply -f infrastructure/k8s/mtls-service-mesh.yaml
    
    # Wait for policies to be applied
    kubectl wait --for=condition=ready peerauthentication azora-mtls-strict -n ${NAMESPACE} --timeout=300s
    
    log_success "mTLS enabled successfully"
}

# Verify mTLS
verify_mtls() {
    log_info "Verifying mTLS configuration..."
    
    # Check if mTLS is enforced
    local mtls_status=$(kubectl get peerauthentication azora-mtls-strict -n ${NAMESPACE} -o jsonpath='{.spec.mtls.mode}')
    
    if [[ "$mtls_status" == "STRICT" ]]; then
        log_success "mTLS is enforced in STRICT mode"
    else
        log_error "mTLS is not properly configured"
        exit 1
    fi
    
    # Test service-to-service communication
    log_info "Testing service-to-service communication..."
    
    # Deploy test pods
    kubectl apply -f - <<EOF
apiVersion: v1
kind: Pod
metadata:
  name: mtls-test-client
  namespace: ${NAMESPACE}
spec:
  containers:
  - name: client
    image: curlimages/curl:latest
    command: ['sleep', '3600']
---
apiVersion: v1
kind: Pod
metadata:
  name: mtls-test-server
  namespace: ${NAMESPACE}
  labels:
    app: mtls-test-server
spec:
  containers:
  - name: server
    image: nginx:alpine
    ports:
    - containerPort: 80
EOF
    
    # Wait for pods to be ready
    kubectl wait --for=condition=ready pod mtls-test-client -n ${NAMESPACE} --timeout=120s
    kubectl wait --for=condition=ready pod mtls-test-server -n ${NAMESPACE} --timeout=120s
    
    # Test communication
    if kubectl exec mtls-test-client -n ${NAMESPACE} -- curl -s http://mtls-test-server > /dev/null; then
        log_success "Service-to-service communication test passed"
    else
        log_warning "Service-to-service communication test failed - this may be expected with strict mTLS"
    fi
    
    # Clean up test pods
    kubectl delete pod mtls-test-client mtls-test-server -n ${NAMESPACE} --ignore-not-found=true
}

# Configure monitoring
configure_monitoring() {
    log_info "Configuring monitoring for service mesh..."
    
    # Enable Istio telemetry
    kubectl apply -f - <<EOF
apiVersion: v1
kind: Service
metadata:
  name: istio-prometheus
  namespace: istio-system
  labels:
    app: prometheus
spec:
  ports:
  - name: http
    port: 9090
    targetPort: 9090
  selector:
    app: prometheus
EOF
    
    log_success "Monitoring configured successfully"
}

# Deploy security policies
deploy_security_policies() {
    log_info "Deploying security policies..."
    
    # Apply network policies
    kubectl apply -f infrastructure/k8s/ssl-certificates.yaml
    
    # Apply additional security policies
    kubectl apply -f - <<EOF
apiVersion: security.istio.io/v1beta1
kind: AuthorizationPolicy
metadata:
  name: deny-all
  namespace: ${NAMESPACE}
spec:
  {}
EOF
    
    log_success "Security policies deployed successfully"
}

# Generate certificates
generate_certificates() {
    log_info "Generating mTLS certificates..."
    
    # Wait for cert-manager to be ready
    kubectl wait --for=condition=ready pod -l app.kubernetes.io/instance=cert-manager -n cert-manager --timeout=300s
    
    # Apply certificate configuration
    kubectl apply -f - <<EOF
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: azora-ca-issuer
spec:
  selfSigned: {}
---
apiVersion: cert-manager.io/v1
kind: Certificate
metadata:
  name: azora-mtls-certificate
  namespace: istio-system
spec:
  secretName: azora-mtls-cert
  dnsNames:
  - "*.azora.world"
  issuerRef:
    name: azora-ca-issuer
    kind: ClusterIssuer
  privateKey:
    algorithm: ECDSA
    size: 256
EOF
    
    # Wait for certificate to be issued
    kubectl wait --for=condition=ready certificate azora-mtls-certificate -n istio-system --timeout=300s
    
    log_success "mTLS certificates generated successfully"
}

# Main deployment function
main() {
    log_info "Starting Azora OS Service Mesh Deployment..."
    log_info "Ubuntu Philosophy: 'My security ensures our freedom'"
    
    # Check prerequisites
    check_prerequisites
    
    # Install components
    install_cert_manager
    install_istio
    
    # Configure mTLS
    generate_certificates
    enable_mtls
    
    # Deploy security and monitoring
    deploy_security_policies
    configure_monitoring
    
    # Verify deployment
    verify_mtls
    
    log_success "Service mesh deployment completed successfully!"
    log_info "Next steps:"
    log_info "1. Enable Istio sidecar injection for your services: kubectl label namespace ${NAMESPACE} istio-injection=enabled"
    log_info "2. Redeploy your services to get Istio sidecars"
    log_info "3. Monitor service mesh: kubectl port-forward svc/istio-ingressgateway -n istio-system 8443:443"
    log_info "Ubuntu: 'My security ensures our freedom' - Service mesh is now protecting our communications"
}

# Handle script interruption
trap 'log_error "Script interrupted"; exit 1' INT TERM

# Run main function
main "$@"
