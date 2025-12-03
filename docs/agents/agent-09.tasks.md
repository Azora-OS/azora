# Agent 09 - Infra & Service Mesh

Primary Focus: Deploy service mesh, enable mTLS, and configure observability for distributed tracing.

Priority: HIGH

Tasks:
1. Implement service mesh config using Istio/Linkerd or the platform's chosen service mesh (`infrastructure/service-mesh`).
   - Acceptance: mTLS can be tested between two example services and denies plaintext communication.

2. Integrate Jaeger/OpenTelemetry instrumentation into a sample service (e.g., `azora-api-gateway`) and an example request path.
   - Acceptance: Traces for a login → enroll → payment are visible in Jaeger.

3. Add Prometheus instrumentation and create dashboards in Grafana.
   - Acceptance: Service metrics are collected and visible.

4. Add Helm charts/Ingress rules for service mesh deployment.
   - Acceptance: Chart deploys in staging.

Verification steps:
- Deploy the service mesh in a local minikube or dev cluster using provided manifests.
- Run a health check and ensure encrypted traffic and traces exist.

