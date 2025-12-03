# Deployment Guide

## Overview

This guide covers deploying Azora OS to production environments. We use a containerized, Kubernetes-based approach with automated CI/CD pipelines.

**Deployment Strategy**: Blue-green deployments with canary releases  
**Infrastructure**: Kubernetes on AWS/GCP/Azure  
**Configuration Management**: Helm charts  
**Secrets Management**: Sealed Secrets / AWS Secrets Manager

---

## Prerequisites

### Required Tools
```bash
# Install Docker
docker --version  # 24.0+

# Install Kubernetes CLI
kubectl version --client  # 1.27+

# Install Helm
helm version  # 3.12+

# Install Terraform (for infrastructure)
terraform version  # 1.5+

# AWS CLI (if using AWS)
aws --version  # 2.13+
```

### Access Requirements
- Docker Hub credentials
- Kubernetes cluster access (kubeconfig)
- AWS/GCP/Azure credentials
- GitHub personal access token
- Stripe API keys
- OpenAI API key

---

## Environment Setup

### 1. Development Environment

**Local Setup**:
```bash
# Clone repository
git clone https://github.com/azora-os/azora-os.git
cd azora-os

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Start services locally
docker-compose up -d

# Verify services
npm run health-check
```

**Environment Variables** (`.env.local`):
```
NODE_ENV=development
DATABASE_URL=postgresql://user:pass@localhost:5432/azora_dev
REDIS_URL=redis://localhost:6379
MONGODB_URL=mongodb://localhost:27017/azora_dev
JWT_SECRET=your-secret-key
STRIPE_SECRET_KEY=sk_test_...
OPENAI_API_KEY=sk-...
POLYGON_RPC_URL=https://rpc-mumbai.maticvigil.com
```

### 2. Staging Environment

**Infrastructure**:
```bash
# Create staging namespace
kubectl create namespace staging

# Deploy using Helm
helm install azora-staging ./helm/azora \
  --namespace staging \
  --values helm/values-staging.yaml

# Verify deployment
kubectl get pods -n staging
kubectl logs -n staging -l app=api-gateway
```

**Configuration** (`helm/values-staging.yaml`):
```yaml
environment: staging
replicas:
  apiGateway: 2
  authService: 2
  educationService: 2
  aiService: 1

resources:
  requests:
    memory: "256Mi"
    cpu: "250m"
  limits:
    memory: "512Mi"
    cpu: "500m"

database:
  host: staging-db.c.azora.internal
  port: 5432
  name: azora_staging

redis:
  host: staging-redis.c.azora.internal
  port: 6379

ingress:
  enabled: true
  host: staging.azora.io
  tls: true
```

### 3. Production Environment

**Infrastructure**:
```bash
# Create production namespace
kubectl create namespace production

# Deploy using Helm
helm install azora-prod ./helm/azora \
  --namespace production \
  --values helm/values-production.yaml

# Verify deployment
kubectl get pods -n production
kubectl get services -n production
```

**Configuration** (`helm/values-production.yaml`):
```yaml
environment: production
replicas:
  apiGateway: 5
  authService: 3
  educationService: 3
  aiService: 2
  paymentService: 3
  financialService: 3

resources:
  requests:
    memory: "512Mi"
    cpu: "500m"
  limits:
    memory: "1Gi"
    cpu: "1000m"

database:
  host: prod-db.c.azora.internal
  port: 5432
  name: azora_production
  replicas: 3
  backup: true

redis:
  host: prod-redis.c.azora.internal
  port: 6379
  cluster: true

ingress:
  enabled: true
  host: api.azora.io
  tls: true
  certManager: true

autoscaling:
  enabled: true
  minReplicas: 3
  maxReplicas: 10
  targetCPU: 70
  targetMemory: 80
```

---

## Deployment Process

### Step 1: Build Docker Images

```bash
# Build all services
npm run docker:build

# Or build specific service
docker build -t azora/api-gateway:1.0.0 services/api-gateway/

# Tag for registry
docker tag azora/api-gateway:1.0.0 \
  registry.azora.io/azora/api-gateway:1.0.0

# Push to registry
docker push registry.azora.io/azora/api-gateway:1.0.0
```

**Dockerfile Example** (`services/api-gateway/Dockerfile`):
```dockerfile
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Start service
CMD ["npm", "start"]
```

### Step 2: Update Kubernetes Manifests

```bash
# Update image tags in values.yaml
sed -i 's/image.tag:.*/image.tag: 1.0.0/' helm/values-production.yaml

# Validate Helm chart
helm lint ./helm/azora

# Generate manifests (dry-run)
helm template azora ./helm/azora \
  --namespace production \
  --values helm/values-production.yaml > manifests.yaml
```

### Step 3: Deploy to Staging

```bash
# Upgrade staging deployment
helm upgrade azora-staging ./helm/azora \
  --namespace staging \
  --values helm/values-staging.yaml \
  --wait \
  --timeout 5m

# Verify deployment
kubectl rollout status deployment/api-gateway -n staging

# Run smoke tests
npm run test:smoke -- --env=staging
```

### Step 4: Run Tests

```bash
# Unit tests
npm run test:unit

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e -- --env=staging

# Performance tests
npm run test:performance

# Security tests
npm run test:security
```

### Step 5: Deploy to Production (Blue-Green)

```bash
# Current deployment is "blue"
# New deployment will be "green"

# Deploy green environment
helm upgrade azora-prod ./helm/azora \
  --namespace production \
  --values helm/values-production.yaml \
  --set deployment.strategy=blue-green \
  --set deployment.activeSlot=green \
  --wait \
  --timeout 10m

# Verify green deployment
kubectl get pods -n production -l slot=green

# Run smoke tests on green
npm run test:smoke -- --env=production-green

# Switch traffic to green
kubectl patch service api-gateway -n production \
  -p '{"spec":{"selector":{"slot":"green"}}}'

# Monitor for errors (5 minutes)
npm run monitor:errors -- --duration=5m

# If successful, delete blue
kubectl delete deployment api-gateway-blue -n production

# If failed, switch back to blue
kubectl patch service api-gateway -n production \
  -p '{"spec":{"selector":{"slot":"blue"}}}'
```

### Step 6: Canary Deployment (Alternative)

```bash
# Deploy canary (10% traffic)
helm upgrade azora-prod ./helm/azora \
  --namespace production \
  --values helm/values-production.yaml \
  --set deployment.strategy=canary \
  --set deployment.canaryWeight=10 \
  --wait

# Monitor metrics
kubectl logs -n production -l app=api-gateway --tail=100

# Gradually increase traffic
for weight in 25 50 75 100; do
  helm upgrade azora-prod ./helm/azora \
    --namespace production \
    --values helm/values-production.yaml \
    --set deployment.canaryWeight=$weight \
    --wait
  sleep 5m  # Monitor for 5 minutes
done
```

---

## Rollback Procedures

### Automatic Rollback

```bash
# If deployment fails, automatically rollback
helm rollback azora-prod 1 --namespace production

# Verify rollback
kubectl rollout status deployment/api-gateway -n production
```

### Manual Rollback

```bash
# List release history
helm history azora-prod -n production

# Rollback to specific revision
helm rollback azora-prod 5 -n production

# Verify services are healthy
kubectl get pods -n production
npm run health-check -- --env=production
```

---

## Database Migrations

### Pre-deployment

```bash
# Create migration
npm run db:migration:create -- --name=add_user_preferences

# Review migration
cat migrations/[timestamp]_add_user_preferences.sql

# Test migration locally
npm run db:migrate -- --env=local

# Backup production database
pg_dump azora_production > backup_$(date +%Y%m%d_%H%M%S).sql
```

### During Deployment

```bash
# Run migrations
kubectl exec -it deployment/api-gateway -n production \
  -- npm run db:migrate

# Verify migration
kubectl exec -it deployment/api-gateway -n production \
  -- npm run db:verify

# Check for errors
kubectl logs deployment/api-gateway -n production | grep -i error
```

### Rollback Migration

```bash
# Rollback last migration
npm run db:rollback

# Restore from backup
psql azora_production < backup_20231115_120000.sql
```

---

## Secrets Management

### Store Secrets

```bash
# Create secret in Kubernetes
kubectl create secret generic azora-secrets \
  --from-literal=jwt-secret=your-secret \
  --from-literal=stripe-key=sk_... \
  --from-literal=openai-key=sk-... \
  -n production

# Or use Sealed Secrets
kubeseal -f secret.yaml -w sealed-secret.yaml
```

### Reference Secrets in Deployment

```yaml
# In Helm values
env:
  - name: JWT_SECRET
    valueFrom:
      secretKeyRef:
        name: azora-secrets
        key: jwt-secret
  - name: STRIPE_SECRET_KEY
    valueFrom:
      secretKeyRef:
        name: azora-secrets
        key: stripe-key
```

---

## Monitoring & Logging

### Check Deployment Status

```bash
# Get deployment status
kubectl get deployment -n production

# Get pod status
kubectl get pods -n production

# Get service status
kubectl get svc -n production

# Get events
kubectl get events -n production --sort-by='.lastTimestamp'
```

### View Logs

```bash
# View service logs
kubectl logs deployment/api-gateway -n production

# Follow logs in real-time
kubectl logs -f deployment/api-gateway -n production

# View logs from specific pod
kubectl logs pod/api-gateway-xyz -n production

# View logs from all pods
kubectl logs -l app=api-gateway -n production --all-containers=true
```

### Access Dashboards

```
Grafana: https://grafana.azora.io
Prometheus: https://prometheus.azora.io
Jaeger: https://jaeger.azora.io
Loki: https://loki.azora.io
```

---

## Scaling

### Manual Scaling

```bash
# Scale deployment
kubectl scale deployment api-gateway \
  --replicas=5 \
  -n production

# Verify scaling
kubectl get pods -n production -l app=api-gateway
```

### Auto-scaling

```bash
# Create HPA (Horizontal Pod Autoscaler)
kubectl autoscale deployment api-gateway \
  --min=3 --max=10 \
  --cpu-percent=70 \
  -n production

# View HPA status
kubectl get hpa -n production
```

---

## Troubleshooting

### Pod Not Starting

```bash
# Check pod status
kubectl describe pod <pod-name> -n production

# Check logs
kubectl logs <pod-name> -n production

# Check events
kubectl get events -n production --sort-by='.lastTimestamp'
```

### Service Not Responding

```bash
# Check service
kubectl get svc -n production

# Check endpoints
kubectl get endpoints -n production

# Test connectivity
kubectl run -it --rm debug --image=busybox --restart=Never -- \
  wget -O- http://api-gateway:3000/health
```

### High Memory Usage

```bash
# Check resource usage
kubectl top pods -n production

# Check limits
kubectl describe pod <pod-name> -n production

# Increase limits in values.yaml and redeploy
```

---

## Maintenance

### Regular Tasks

```bash
# Daily: Check logs for errors
kubectl logs -n production --since=24h | grep -i error

# Weekly: Review metrics
# Access Grafana dashboard

# Monthly: Test disaster recovery
npm run test:dr

# Quarterly: Security audit
npm run audit:security
```

### Backup & Recovery

```bash
# Backup database
pg_dump azora_production > backup.sql

# Backup Kubernetes configuration
kubectl get all -n production -o yaml > k8s-backup.yaml

# Restore from backup
psql azora_production < backup.sql
kubectl apply -f k8s-backup.yaml
```

---

## Deployment Checklist

- [ ] All tests passing
- [ ] Code reviewed and approved
- [ ] Security scan passed
- [ ] Database migrations tested
- [ ] Secrets configured
- [ ] Monitoring alerts configured
- [ ] Rollback plan documented
- [ ] Team notified
- [ ] Deployment window scheduled
- [ ] Backup created
- [ ] Deployment executed
- [ ] Smoke tests passed
- [ ] Monitoring verified
- [ ] Team notified of completion

