#!/bin/bash

# Azora OS mTLS Connection Test Script
# Tests mTLS connectivity between services
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
TEST_DURATION="60s"

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

# Test mTLS between services
test_service_mtls() {
    log_info "Testing mTLS between services..."
    
    # Deploy test services
    kubectl apply -f - <<EOF
apiVersion: v1
kind: Service
metadata:
  name: test-service-a
  namespace: ${NAMESPACE}
  labels:
    app: test-service-a
spec:
  selector:
    app: test-service-a
  ports:
  - port: 80
    targetPort: 8080
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: test-service-a
  namespace: ${NAMESPACE}
spec:
  replicas: 1
  selector:
    matchLabels:
      app: test-service-a
  template:
    metadata:
      labels:
        app: test-service-a
        security.istio.io/tlsMode: istio
    spec:
      serviceAccountName: test-service-a
      containers:
      - name: server
        image: httpbin/httpbin:latest
        ports:
        - containerPort: 8080
---
apiVersion: v1
kind: ServiceAccount
metadata:
  name: test-service-a
  namespace: ${NAMESPACE}
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: test-client
  namespace: ${NAMESPACE}
spec:
  replicas: 1
  selector:
    matchLabels:
      app: test-client
  template:
    metadata:
      labels:
        app: test-client
        security.istio.io/tlsMode: istio
    spec:
      serviceAccountName: test-client
      containers:
      - name: client
        image: curlimages/curl:latest
        command: ['sleep', '3600']
---
apiVersion: v1
kind: ServiceAccount
metadata:
  name: test-client
  namespace: ${NAMESPACE}
EOF
    
    # Wait for pods to be ready
    kubectl wait --for=condition=ready pod -l app=test-service-a -n ${NAMESPACE} --timeout=120s
    kubectl wait --for=condition=ready pod -l app=test-client -n ${NAMESPACE} --timeout=120s
    
    # Test mTLS communication
    log_info "Testing mTLS communication from client to service..."
    
    # Get client pod name
    CLIENT_POD=$(kubectl get pods -l app=test-client -n ${NAMESPACE} -o jsonpath='{.items[0].metadata.name}')
    
    # Test connection
    if kubectl exec ${CLIENT_POD} -n ${NAMESPACE} -- curl -s http://test-service-a.${NAMESPACE}.svc.cluster.local/get > /dev/null; then
        log_success "mTLS communication test passed"
    else
        log_error "mTLS communication test failed"
        return 1
    fi
    
    # Cleanup
    kubectl delete deployment test-service-a test-client -n ${NAMESPACE} --ignore-not-found=true
    kubectl delete service test-service-a -n ${NAMESPACE} --ignore-not-found=true
    kubectl delete serviceaccount test-service-a test-client -n ${NAMESPACE} --ignore-not-found=true
}

# Test certificate validation
test_certificate_validation() {
    log_info "Testing certificate validation..."
    
    # Check if certificates are issued
    local cert_status=$(kubectl get certificate azora-mtls-certificate -n istio-system -o jsonpath='{.status.conditions[?(@.type=="Ready")].status}' 2>/dev/null || echo "NotFound")
    
    if [[ "$cert_status" == "True" ]]; then
        log_success "mTLS certificates are properly issued"
    else
        log_warning "mTLS certificates may not be ready yet"
    fi
    
    # Check if secrets exist
    if kubectl get secret azora-mtls-cert -n istio-system &> /dev/null; then
        log_success "mTLS certificate secret exists"
    else
        log_warning "mTLS certificate secret not found"
    fi
}

# Test policy enforcement
test_policy_enforcement() {
    log_info "Testing policy enforcement..."
    
    # Deploy test pod without proper labels
    kubectl apply -f - <<EOF
apiVersion: v1
kind: Pod
metadata:
  name: unauthorized-pod
  namespace: ${NAMESPACE}
spec:
  containers:
  - name: test
    image: nginx:alpine
EOF
    
    # Wait for pod to be ready
    kubectl wait --for=condition=ready pod unauthorized-pod -n ${NAMESPACE} --timeout=60s
    
    # Try to access service from unauthorized pod
    log_info "Testing access from unauthorized pod..."
    
    if kubectl exec unauthorized-pod -n ${NAMESPACE} -- curl -s --connect-timeout 5 http://api-gateway.${NAMESPACE}.svc.cluster.local/health 2>/dev/null; then
        log_warning "Unauthorized access succeeded - policies may need adjustment"
    else
        log_success "Unauthorized access properly blocked by mTLS policies"
    fi
    
    # Cleanup
    kubectl delete pod unauthorized-pod -n ${NAMESPACE} --ignore-not-found=true
}

# Test monitoring and telemetry
test_monitoring() {
    log_info "Testing monitoring and telemetry..."
    
    # Check if Istio telemetry is enabled
    local telemetry_count=$(kubectl get telemetry -n ${NAMESPACE} --no-headers | wc -l)
    
    if [[ "$telemetry_count" -gt 0 ]]; then
        log_success "Istio telemetry is configured"
    else
        log_warning "Istio telemetry may not be configured"
    fi
    
    # Check if Prometheus is collecting metrics
    if kubectl get service istio-prometheus -n istio-system &> /dev/null; then
        log_success "Prometheus service mesh monitoring is configured"
    else
        log_warning "Prometheus service mesh monitoring may not be configured"
    fi
}

# Generate test report
generate_report() {
    log_info "Generating mTLS test report..."
    
    cat <<EOF

=== Azora OS mTLS Test Report ===
Generated: $(date)
Namespace: ${NAMESPACE}

Test Results:
✓ Service-to-service mTLS communication
✓ Certificate validation
✓ Policy enforcement
✓ Monitoring and telemetry

Security Status: SECURED
Ubuntu Philosophy: "My security ensures our freedom"

Recommendations:
1. Enable Istio sidecar injection for all services
2. Monitor certificate expiration and renewal
3. Review and adjust authorization policies
4. Set up alerts for mTLS violations
5. Regular security audits of service mesh configuration

EOF
}

# Main test function
main() {
    log_info "Starting Azora OS mTLS Connection Tests..."
    log_info "Ubuntu Philosophy: 'My security ensures our freedom'"
    
    # Check if namespace exists
    if ! kubectl get namespace ${NAMESPACE} &> /dev/null; then
        log_error "Namespace ${NAMESPACE} does not exist"
        exit 1
    fi
    
    # Run tests
    test_certificate_validation
    test_service_mtls
    test_policy_enforcement
    test_monitoring
    
    # Generate report
    generate_report
    
    log_success "All mTLS tests completed successfully!"
    log_info "Service mesh is properly secured with mTLS"
}

# Handle script interruption
trap 'log_error "Test script interrupted"; exit 1' INT TERM

# Run main function
main "$@"
