# Azora OS Production Deployment Runbook

## Pre-Deployment Checklist

- [ ] All tests passing (unit, integration, E2E)
- [ ] Security scan completed and vulnerabilities remediated
- [ ] Load tests executed and performance targets met
- [ ] Production environment validated
- [ ] Database backups configured
- [ ] Monitoring dashboards created
- [ ] Alert rules configured
- [ ] Rollback plan documented
- [ ] Team trained on deployment process
- [ ] Stakeholders notified

## Phase 1: Infrastructure Provisioning (2-3 hours)

### 1.1 Database Setup

```bash
# Apply PostgreSQL StatefulSet
kubectl apply -f infrastructure/production-database.yaml

# Verify database is running
kubectl get statefulset postgres -n production
kubectl logs postgres-0 -n production

# Run migrations
kubectl exec -it postgres-0 -n production -- psql -U azora_admin -d azora_production -f /migrations/001-initial.sql

# Verify schema
kubectl exec -it postgres-0 -n production -- psql -U azora_admin -d azora_production -c "\dt"
```

### 1.2 Redis Cluster Setup

```bash
# Apply Redis StatefulSet
kubectl apply -f infrastructure/redis-cluster-prod.yaml

# Verify Redis cluster
kubectl get statefulset redis -n production
kubectl logs redis-0 -n production

# Initialize cluster
kubectl exec -it redis-0 -n production -- redis-cli cluster init

# Verify cluster status
kubectl exec -it redis-0 -n production -- redis-cli cluster info
```

### 1.3 Load Balancer Setup

```bash
# Apply Nginx load balancer
kubectl apply -f infrastructure/load-balancer.yaml

# Verify load balancer
kubectl get deployment nginx-lb -n production
kubectl get svc nginx-lb -n production

# Get external IP
kubectl get svc nginx-lb -n production -o jsonpath='{.status.loadBalancer.ingress[0].ip}'
```

### 1.4 Monitoring Stack Setup

```bash
# Apply Prometheus, Grafana, AlertManager
kubectl apply -f infrastructure/monitoring-stack.yaml

# Verify services
kubectl get deployment prometheus grafana alertmanager -n production

# Access Grafana
kubectl port-forward svc/grafana 3000:3000 -n production
# Navigate to http://localhost:3000 (admin/admin)
```

## Phase 2: Application Deployment (1-2 hours)

### 2.1 Build Docker Images

```bash
# Build all service images
docker build -t azora/api-gateway:latest services/api-gateway/
docker build -t azora/constitutional-ai:latest services/constitutional-ai/
docker build -t azora/knowledge-ocean:latest services/ai-routing/
docker build -t azora/ai-routing:latest services/ai-routing/

# Push to registry
docker push azora/api-gateway:latest
docker push azora/constitutional-ai:latest
docker push azora/knowledge-ocean:latest
docker push azora/ai-routing:latest
```

### 2.2 Deploy Services

```bash
# Create namespace
kubectl create namespace production

# Deploy API Gateway
kubectl apply -f infrastructure/api-gateway-deployment.yaml -n production

# Deploy Constitutional AI
kubectl apply -f infrastructure/constitutional-ai-deployment.yaml -n production

# Deploy Knowledge Ocean
kubectl apply -f infrastructure/knowledge-ocean-deployment.yaml -n production

# Deploy AI Routing
kubectl apply -f infrastructure/ai-routing-deployment.yaml -n production

# Verify deployments
kubectl get deployments -n production
kubectl get pods -n production
```

### 2.3 Configure Environment Variables

```bash
# Create secrets
kubectl create secret generic app-secrets \
  --from-literal=DATABASE_URL=$DATABASE_URL \
  --from-literal=REDIS_URL=$REDIS_URL \
  --from-literal=OPENAI_API_KEY=$OPENAI_API_KEY \
  --from-literal=PINECONE_API_KEY=$PINECONE_API_KEY \
  --from-literal=STRIPE_API_KEY=$STRIPE_API_KEY \
  --from-literal=JWT_SECRET=$JWT_SECRET \
  -n production

# Verify secrets
kubectl get secrets -n production
```

## Phase 3: Validation (1 hour)

### 3.1 Environment Validation

```bash
# Validate production environment
npx ts-node scripts/validate-production-env.ts

# Expected output: ✅ Production environment is valid!
```

### 3.2 External Service Connectivity

```bash
# Test external services
npx ts-node scripts/test-external-services.ts

# Expected output: ✅ All external services are reachable!
```

### 3.3 Smoke Tests

```bash
# Run smoke tests
npx ts-node tests/smoke/production-smoke-tests.ts

# Expected output: ✅ All smoke tests passed!
```

### 3.4 Database Verification

```bash
# Verify database connectivity
kubectl exec -it postgres-0 -n production -- psql -U azora_admin -d azora_production -c "SELECT COUNT(*) FROM information_schema.tables;"

# Verify migrations applied
kubectl exec -it postgres-0 -n production -- psql -U azora_admin -d azora_production -c "SELECT * FROM schema_migrations;"
```

### 3.5 Redis Verification

```bash
# Verify Redis connectivity
kubectl exec -it redis-0 -n production -- redis-cli ping

# Verify cluster status
kubectl exec -it redis-0 -n production -- redis-cli cluster info
```

## Phase 4: Monitoring Setup (30 minutes)

### 4.1 Create Dashboards

```bash
# Access Grafana
kubectl port-forward svc/grafana 3000:3000 -n production

# Create Constitutional AI Dashboard
# - Compliance rate (target: >95%)
# - Validation latency (target: <200ms)
# - Violation types distribution
# - Regeneration rate

# Create Knowledge Ocean Dashboard
# - Retrieval latency (target: <100ms)
# - 70/30 ratio adherence
# - Average relevance score
# - Cache hit rate

# Create AI Routing Dashboard
# - Cost per query by tier
# - Tier distribution
# - Fallback rate
# - Cache hit rate (target: >40%)
```

### 4.2 Configure Alerts

```bash
# Edit AlertManager configuration
kubectl edit configmap alertmanager-config -n production

# Add alert rules:
# - Constitutional compliance <90%
# - Knowledge Ocean unavailable
# - Cost threshold exceeded
# - Fallback rate >10%
# - API response time >500ms
```

### 4.3 Verify Monitoring

```bash
# Access Prometheus
kubectl port-forward svc/prometheus 9090:9090 -n production

# Verify metrics are being scraped
# Navigate to http://localhost:9090/targets
```

## Phase 5: Post-Deployment (30 minutes)

### 5.1 Verify All Services

```bash
# Check all pods are running
kubectl get pods -n production

# Check all services are healthy
kubectl get svc -n production

# Check logs for errors
kubectl logs -l app=api-gateway -n production --tail=100
kubectl logs -l app=constitutional-ai -n production --tail=100
kubectl logs -l app=knowledge-ocean -n production --tail=100
kubectl logs -l app=ai-routing -n production --tail=100
```

### 5.2 Performance Baseline

```bash
# Run load tests to establish baseline
npm run test:load

# Expected results:
# - p95 response time <500ms
# - 1000 concurrent users supported
# - Cache hit rate >40%
```

### 5.3 Security Verification

```bash
# Verify SSL/TLS
curl -I https://api.azora.io

# Verify security headers
curl -I https://api.azora.io | grep -E "Strict-Transport-Security|X-Content-Type-Options|X-Frame-Options"

# Run security scan
npm run test:security
```

## Rollback Procedure

If deployment fails or critical issues are discovered:

### Immediate Rollback

```bash
# Scale down new deployment
kubectl scale deployment api-gateway --replicas=0 -n production

# Scale up previous version
kubectl set image deployment/api-gateway api-gateway=azora/api-gateway:previous -n production
kubectl scale deployment api-gateway --replicas=3 -n production

# Verify rollback
kubectl get pods -n production
kubectl logs -l app=api-gateway -n production --tail=50
```

### Database Rollback

```bash
# If migrations caused issues, restore from backup
kubectl exec -it postgres-0 -n production -- psql -U azora_admin -d azora_production < /backups/backup-latest.sql

# Verify data integrity
kubectl exec -it postgres-0 -n production -- psql -U azora_admin -d azora_production -c "SELECT COUNT(*) FROM users;"
```

### Full Rollback

```bash
# Delete all production resources
kubectl delete namespace production

# Restore from previous infrastructure
kubectl apply -f infrastructure/production-database.yaml
kubectl apply -f infrastructure/redis-cluster-prod.yaml
kubectl apply -f infrastructure/load-balancer.yaml
kubectl apply -f infrastructure/monitoring-stack.yaml

# Redeploy previous version
# (Follow Phase 2 with previous image tags)
```

## Monitoring During Deployment

### Key Metrics to Watch

1. **API Response Time**: Should remain <500ms
2. **Error Rate**: Should remain <0.1%
3. **Database Connections**: Should not exceed 80% of max
4. **Redis Memory**: Should not exceed 80% of allocated
5. **CPU Usage**: Should not exceed 70%
6. **Memory Usage**: Should not exceed 80%

### Alert Thresholds

- Critical: Response time >1000ms or error rate >1%
- Warning: Response time >500ms or error rate >0.5%
- Info: Response time >200ms or error rate >0.1%

## Post-Deployment Checklist

- [ ] All services running and healthy
- [ ] Smoke tests passing
- [ ] Monitoring dashboards populated
- [ ] Alerts configured and tested
- [ ] Performance baseline established
- [ ] Security scan passed
- [ ] Database backups verified
- [ ] Team notified of successful deployment
- [ ] Documentation updated
- [ ] Incident response plan reviewed

## Support Contacts

- **On-Call Engineer**: [contact info]
- **Database Admin**: [contact info]
- **Infrastructure Team**: [contact info]
- **Security Team**: [contact info]

## Additional Resources

- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Redis Documentation](https://redis.io/documentation)
- [Prometheus Documentation](https://prometheus.io/docs/)
- [Grafana Documentation](https://grafana.com/docs/)
