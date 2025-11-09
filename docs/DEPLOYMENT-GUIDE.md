# 🚀 Azora OS Deployment Guide

**Constitutional AI Operating System - Production Deployment**

*"Ubuntu: I am because we are" - Deployment Philosophy*

---

## 📋 Table of Contents

1. [Ubuntu Deployment Philosophy](#-ubuntu-deployment-philosophy)
2. [Prerequisites & Requirements](#-prerequisites--requirements)
3. [Quick Deployment](#-quick-deployment)
4. [Production Deployment](#-production-deployment)
5. [Cloud Deployment](#-cloud-deployment)
6. [Monitoring & Observability](#-monitoring--observability)
7. [Security Configuration](#-security-configuration)
8. [Troubleshooting](#-troubleshooting)

---

## 🌍 Ubuntu Deployment Philosophy

### Core Principles
Azora OS deployment embodies Ubuntu philosophy where individual services strengthen the collective system:

```mermaid
graph TB
    subgraph "🌟 Ubuntu Deployment Principles"
        A[Individual Service Excellence<br/>Each service optimally deployed] --> D[Collective System Strength<br/>Resilient infrastructure]
        B[Shared Infrastructure<br/>Common deployment resources] --> D
        C[Mutual Service Support<br/>Interdependent deployments] --> D
        
        D --> E[Emergent Reliability<br/>System-wide resilience]
        D --> F[Scalable Operations<br/>Growth benefits all services]
        D --> G[Constitutional Compliance<br/>Ethical deployment practices]
    end
```

### Deployment Patterns
- **🤝 Collaborative Services**: Services deployed to enhance each other
- **🔄 Rolling Updates**: Zero-downtime deployments preserving Ubuntu continuity
- **📈 Auto-scaling**: Infrastructure that grows with community needs
- **🛡️ Security First**: Constitutional security in every deployment layer
- **🌱 Environment Progression**: Dev → Staging → Production Ubuntu flow

---

## 📋 Prerequisites & Requirements

### System Requirements

#### Minimum Requirements (Development)
```yaml
Ubuntu Development Environment:
  CPU: 4 cores (2.0 GHz)
  RAM: 8 GB
  Storage: 50 GB SSD
  Network: Stable internet connection
  OS: Ubuntu 20.04+ / macOS 12+ / Windows 11
```

#### Recommended Requirements (Production)
```yaml
Ubuntu Production Environment:
  CPU: 16 cores (3.0 GHz)
  RAM: 32 GB
  Storage: 500 GB NVMe SSD
  Network: 1 Gbps connection
  OS: Ubuntu 22.04 LTS (preferred)
```

### Software Dependencies

#### Core Dependencies
```bash
# Ubuntu Foundation Stack
Node.js: 20.x LTS
PostgreSQL: 15+
Redis: 7+
Docker: 24+
Docker Compose: 2.20+
Kubernetes: 1.28+ (production)

# Ubuntu Development Tools
Git: 2.40+
npm: 10+
TypeScript: 5.2+
Prisma: 5.8+
```

#### Optional Dependencies
```bash
# Ubuntu Enhancement Tools
Terraform: 1.6+ (infrastructure)
Helm: 3.12+ (Kubernetes deployments)
Prometheus: 2.45+ (monitoring)
Grafana: 10.0+ (visualization)
```

### Environment Variables

#### Essential Configuration
```bash
# Ubuntu Core Configuration
NODE_ENV=production
UBUNTU_MODE=enabled
CONSTITUTIONAL_AI=active

# Database Configuration
DATABASE_URL=postgresql://user:pass@localhost:5432/azora_prod
REDIS_URL=redis://localhost:6379

# Security Configuration
JWT_SECRET=your-ubuntu-jwt-secret-256-bit
JWT_REFRESH_SECRET=your-ubuntu-refresh-secret-256-bit
ENCRYPTION_KEY=your-ubuntu-encryption-key-256-bit

# API Configuration
API_BASE_URL=https://api.yourdomain.com
FRONTEND_URL=https://yourdomain.com
CORS_ORIGINS=https://yourdomain.com,https://app.yourdomain.com

# Ubuntu Services
OPENAI_API_KEY=your-openai-api-key
STRIPE_SECRET_KEY=your-stripe-secret-key
SENDGRID_API_KEY=your-sendgrid-api-key

# Cloud Storage (Ubuntu Shared Resources)
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_S3_BUCKET=your-ubuntu-s3-bucket
AWS_REGION=us-east-1

# Monitoring (Ubuntu Observability)
SENTRY_DSN=your-sentry-dsn
PROMETHEUS_ENDPOINT=http://prometheus:9090
GRAFANA_URL=http://grafana:3000
```

---

## ⚡ Quick Deployment

### Ubuntu Docker Deployment (Recommended)

#### 1. Clone Ubuntu Repository
```bash
# Clone the Constitutional AI Operating System
git clone https://github.com/azora-os/azora-os.git
cd azora-os

# Verify Ubuntu integrity
git verify-commit HEAD
```

#### 2. Ubuntu Environment Setup
```bash
# Copy Ubuntu environment template
cp .env.example .env

# Configure Ubuntu values (edit .env file)
nano .env

# Validate Ubuntu configuration
npm run ubuntu:validate-config
```

#### 3. Ubuntu Docker Deployment
```bash
# Deploy Ubuntu services with Docker Compose
docker-compose -f docker-compose.prod.yml up -d

# Verify Ubuntu deployment
docker-compose ps

# Check Ubuntu service health
curl http://localhost:4000/api/health
```

#### 4. Ubuntu System Verification
```bash
# Verify all Ubuntu services
npm run ubuntu:health-check

# Test Ubuntu functionality
npm run ubuntu:integration-test

# Monitor Ubuntu metrics
npm run ubuntu:metrics
```

### Ubuntu Service Status Check
```mermaid
graph LR
    A[🚀 Deployment Start] --> B[🔍 Health Check]
    B --> C{All Services Healthy?}
    C -->|Yes| D[✅ Ubuntu Active]
    C -->|No| E[🔧 Debug & Fix]
    E --> B
    D --> F[🌍 Production Ready]
```

---

## 🏭 Production Deployment

### Ubuntu Production Architecture
```mermaid
graph TB
    subgraph "🌍 Ubuntu Production Environment"
        subgraph "🌐 Load Balancer Layer"
            LB[NGINX Load Balancer<br/>⚖️ Traffic Distribution]
            SSL[SSL Termination<br/>🔒 HTTPS Encryption]
            WAF[Web Application Firewall<br/>🛡️ Attack Protection]
        end
        
        subgraph "🐳 Container Orchestration"
            K8S[Kubernetes Cluster<br/>☸️ Ubuntu Orchestration]
            HELM[Helm Charts<br/>📦 Ubuntu Packages]
            INGRESS[Ingress Controller<br/>🚪 Traffic Routing]
        end
        
        subgraph "🏢 Ubuntu Services"
            API[API Gateway<br/>🌐 Service Router]
            AUTH[Auth Service<br/>🔐 Identity Manager]
            EDU[Education Services<br/>🎓 Learning Engine]
            FIN[Financial Services<br/>💰 Money Engine]
            MKT[Marketplace Services<br/>🛒 Trading Engine]
        end
        
        subgraph "💾 Data Layer"
            PG[PostgreSQL Cluster<br/>🗄️ Primary Database]
            REDIS[Redis Cluster<br/>⚡ Cache & Sessions]
            S3[Object Storage<br/>📁 File Storage]
        end
        
        subgraph "📊 Monitoring Layer"
            PROM[Prometheus<br/>📈 Metrics Collection]
            GRAF[Grafana<br/>📊 Visualization]
            ALERT[AlertManager<br/>🚨 Incident Response]
        end
    end
    
    LB --> SSL
    SSL --> WAF
    WAF --> K8S
    
    K8S --> HELM
    HELM --> INGRESS
    INGRESS --> API
    
    API --> AUTH
    API --> EDU
    API --> FIN
    API --> MKT
    
    EDU --> PG
    FIN --> PG
    MKT --> PG
    
    AUTH --> REDIS
    API --> REDIS
    
    EDU --> S3
    FIN --> S3
    MKT --> S3
    
    API --> PROM
    AUTH --> PROM
    EDU --> PROM
    FIN --> PROM
    MKT --> PROM
    
    PROM --> GRAF
    PROM --> ALERT
```

### Production Deployment Steps

#### 1. Infrastructure Preparation
```bash
# Create Ubuntu production namespace
kubectl create namespace azora-ubuntu-prod

# Setup Ubuntu secrets
kubectl create secret generic azora-ubuntu-secrets \
  --from-env-file=.env.production \
  --namespace=azora-ubuntu-prod

# Deploy Ubuntu ConfigMaps
kubectl apply -f k8s/configmaps/ --namespace=azora-ubuntu-prod
```

#### 2. Database Setup
```bash
# Deploy PostgreSQL cluster
helm install azora-postgres bitnami/postgresql \
  --namespace=azora-ubuntu-prod \
  --values=k8s/postgres-values.yaml

# Deploy Redis cluster
helm install azora-redis bitnami/redis \
  --namespace=azora-ubuntu-prod \
  --values=k8s/redis-values.yaml

# Run Ubuntu database migrations
kubectl run azora-migration \
  --image=azora/migration:latest \
  --namespace=azora-ubuntu-prod \
  --restart=Never
```

#### 3. Ubuntu Services Deployment
```bash
# Deploy Ubuntu services with Helm
helm install azora-ubuntu ./helm/azora-ubuntu \
  --namespace=azora-ubuntu-prod \
  --values=helm/production-values.yaml

# Verify Ubuntu deployment
kubectl get pods --namespace=azora-ubuntu-prod

# Check Ubuntu service status
kubectl get services --namespace=azora-ubuntu-prod
```

#### 4. Monitoring Setup
```bash
# Deploy Prometheus stack
helm install prometheus prometheus-community/kube-prometheus-stack \
  --namespace=monitoring \
  --create-namespace \
  --values=monitoring/prometheus-values.yaml

# Deploy Grafana dashboards
kubectl apply -f monitoring/grafana-dashboards/ --namespace=monitoring

# Setup Ubuntu alerts
kubectl apply -f monitoring/ubuntu-alerts.yaml --namespace=monitoring
```

### Production Configuration Files

#### Docker Compose Production
```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  # Ubuntu API Gateway
  api-gateway:
    image: azora/api-gateway:${VERSION}
    ports:
      - "4000:4000"
    environment:
      - NODE_ENV=production
      - UBUNTU_MODE=enabled
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
    depends_on:
      - postgres
      - redis
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:4000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Ubuntu Auth Service
  auth-service:
    image: azora/auth-service:${VERSION}
    environment:
      - NODE_ENV=production
      - UBUNTU_MODE=enabled
      - JWT_SECRET=${JWT_SECRET}
      - DATABASE_URL=${DATABASE_URL}
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3001/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Ubuntu Education Service
  education-service:
    image: azora/education-service:${VERSION}
    environment:
      - NODE_ENV=production
      - UBUNTU_MODE=enabled
      - MONGODB_URI=${MONGODB_URI}
      - OPENAI_API_KEY=${OPENAI_API_KEY}
    restart: unless-stopped

  # Ubuntu Financial Service
  financial-service:
    image: azora/financial-service:${VERSION}
    environment:
      - NODE_ENV=production
      - UBUNTU_MODE=enabled
      - DATABASE_URL=${DATABASE_URL}
      - STRIPE_SECRET_KEY=${STRIPE_SECRET_KEY}
    restart: unless-stopped

  # Ubuntu Marketplace Service
  marketplace-service:
    image: azora/marketplace-service:${VERSION}
    environment:
      - NODE_ENV=production
      - UBUNTU_MODE=enabled
      - DATABASE_URL=${DATABASE_URL}
    restart: unless-stopped

  # Ubuntu Database
  postgres:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=azora_ubuntu_prod
      - POSTGRES_USER=${DB_USER}
      - POSTGRES_PASSWORD=${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./database/init:/docker-entrypoint-initdb.d
    restart: unless-stopped

  # Ubuntu Cache
  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data
    restart: unless-stopped

  # Ubuntu Load Balancer
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - api-gateway
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
```

---

## ☁️ Cloud Deployment

### AWS Ubuntu Deployment

#### 1. AWS Infrastructure Setup
```bash
# Install AWS CLI and configure
aws configure

# Deploy Ubuntu infrastructure with Terraform
cd infrastructure/aws
terraform init
terraform plan -var-file="ubuntu-prod.tfvars"
terraform apply -var-file="ubuntu-prod.tfvars"
```

#### 2. EKS Cluster Setup
```bash
# Create Ubuntu EKS cluster
eksctl create cluster \
  --name azora-ubuntu-prod \
  --region us-east-1 \
  --nodegroup-name ubuntu-workers \
  --node-type m5.xlarge \
  --nodes 3 \
  --nodes-min 1 \
  --nodes-max 10 \
  --managed

# Configure kubectl
aws eks update-kubeconfig --region us-east-1 --name azora-ubuntu-prod
```

#### 3. Ubuntu Services Deployment
```bash
# Deploy Ubuntu services to EKS
helm install azora-ubuntu ./helm/azora-ubuntu \
  --namespace=azora-ubuntu-prod \
  --create-namespace \
  --values=helm/aws-values.yaml

# Setup AWS Load Balancer Controller
kubectl apply -k "github.com/aws/eks-charts/stable/aws-load-balancer-controller//crds?ref=master"
helm install aws-load-balancer-controller eks/aws-load-balancer-controller \
  --namespace=kube-system \
  --set clusterName=azora-ubuntu-prod
```

### Google Cloud Ubuntu Deployment

#### 1. GCP Setup
```bash
# Install gcloud CLI and authenticate
gcloud auth login
gcloud config set project azora-ubuntu-prod

# Enable required APIs
gcloud services enable container.googleapis.com
gcloud services enable cloudsql.googleapis.com
gcloud services enable redis.googleapis.com
```

#### 2. GKE Cluster Creation
```bash
# Create Ubuntu GKE cluster
gcloud container clusters create azora-ubuntu-prod \
  --zone=us-central1-a \
  --num-nodes=3 \
  --enable-autoscaling \
  --min-nodes=1 \
  --max-nodes=10 \
  --machine-type=n1-standard-4 \
  --enable-autorepair \
  --enable-autoupgrade

# Get cluster credentials
gcloud container clusters get-credentials azora-ubuntu-prod --zone=us-central1-a
```

### Azure Ubuntu Deployment

#### 1. Azure Setup
```bash
# Install Azure CLI and login
az login
az account set --subscription "azora-ubuntu-prod"

# Create resource group
az group create --name azora-ubuntu-rg --location eastus
```

#### 2. AKS Cluster Creation
```bash
# Create Ubuntu AKS cluster
az aks create \
  --resource-group azora-ubuntu-rg \
  --name azora-ubuntu-prod \
  --node-count 3 \
  --enable-addons monitoring \
  --generate-ssh-keys \
  --node-vm-size Standard_D4s_v3

# Get cluster credentials
az aks get-credentials --resource-group azora-ubuntu-rg --name azora-ubuntu-prod
```

---

## 📊 Monitoring & Observability

### Ubuntu Monitoring Stack
```mermaid
graph TB
    subgraph "📊 Ubuntu Observability"
        subgraph "📈 Metrics Collection"
            PROM[Prometheus<br/>📊 Time Series DB]
            NODE[Node Exporter<br/>🖥️ System Metrics]
            APP[Application Metrics<br/>📱 Custom Metrics]
        end
        
        subgraph "📋 Logging"
            LOKI[Loki<br/>📝 Log Aggregation]
            FLUENT[Fluent Bit<br/>🌊 Log Collection]
            ELASTIC[Elasticsearch<br/>🔍 Log Search]
        end
        
        subgraph "🔍 Tracing"
            JAEGER[Jaeger<br/>🕵️ Distributed Tracing]
            OTEL[OpenTelemetry<br/>📡 Telemetry Collection]
        end
        
        subgraph "📊 Visualization"
            GRAF[Grafana<br/>📈 Dashboards]
            KIBANA[Kibana<br/>📊 Log Visualization]
        end
        
        subgraph "🚨 Alerting"
            ALERT[AlertManager<br/>🚨 Alert Routing]
            SLACK[Slack Integration<br/>💬 Notifications]
            EMAIL[Email Alerts<br/>📧 Critical Notifications]
        end
    end
    
    NODE --> PROM
    APP --> PROM
    
    FLUENT --> LOKI
    FLUENT --> ELASTIC
    
    APP --> OTEL
    OTEL --> JAEGER
    
    PROM --> GRAF
    LOKI --> GRAF
    ELASTIC --> KIBANA
    JAEGER --> GRAF
    
    PROM --> ALERT
    ALERT --> SLACK
    ALERT --> EMAIL
```

### Monitoring Configuration

#### Prometheus Configuration
```yaml
# monitoring/prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  - "ubuntu-alerts.yml"

scrape_configs:
  - job_name: 'ubuntu-api-gateway'
    static_configs:
      - targets: ['api-gateway:4000']
    metrics_path: '/metrics'
    scrape_interval: 10s

  - job_name: 'ubuntu-auth-service'
    static_configs:
      - targets: ['auth-service:3001']
    metrics_path: '/metrics'

  - job_name: 'ubuntu-education-service'
    static_configs:
      - targets: ['education-service:4200']
    metrics_path: '/metrics'

  - job_name: 'ubuntu-financial-service'
    static_configs:
      - targets: ['financial-service:4300']
    metrics_path: '/metrics'

  - job_name: 'ubuntu-marketplace-service'
    static_configs:
      - targets: ['marketplace-service:4048']
    metrics_path: '/metrics'

alerting:
  alertmanagers:
    - static_configs:
        - targets:
          - alertmanager:9093
```

#### Ubuntu Alert Rules
```yaml
# monitoring/ubuntu-alerts.yml
groups:
  - name: ubuntu-system-alerts
    rules:
      - alert: UbuntuServiceDown
        expr: up == 0
        for: 1m
        labels:
          severity: critical
          ubuntu: true
        annotations:
          summary: "Ubuntu service {{ $labels.instance }} is down"
          description: "Ubuntu service {{ $labels.instance }} has been down for more than 1 minute"

      - alert: UbuntuHighCPU
        expr: (100 - (avg by (instance) (rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)) > 80
        for: 5m
        labels:
          severity: warning
          ubuntu: true
        annotations:
          summary: "Ubuntu high CPU usage on {{ $labels.instance }}"
          description: "CPU usage is above 80% for more than 5 minutes"

      - alert: UbuntuHighMemory
        expr: (node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes) / node_memory_MemTotal_bytes * 100 > 85
        for: 5m
        labels:
          severity: warning
          ubuntu: true
        annotations:
          summary: "Ubuntu high memory usage on {{ $labels.instance }}"
          description: "Memory usage is above 85% for more than 5 minutes"

      - alert: UbuntuDatabaseConnections
        expr: pg_stat_database_numbackends > 80
        for: 2m
        labels:
          severity: warning
          ubuntu: true
        annotations:
          summary: "Ubuntu database has too many connections"
          description: "PostgreSQL has {{ $value }} connections, which is above the threshold"
```

### Grafana Dashboards

#### Ubuntu System Overview Dashboard
```json
{
  "dashboard": {
    "title": "Ubuntu System Overview",
    "panels": [
      {
        "title": "Ubuntu Service Health",
        "type": "stat",
        "targets": [
          {
            "expr": "up{job=~\"ubuntu-.*\"}",
            "legendFormat": "{{ job }}"
          }
        ]
      },
      {
        "title": "Ubuntu Request Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(http_requests_total{job=~\"ubuntu-.*\"}[5m])",
            "legendFormat": "{{ job }} - {{ method }}"
          }
        ]
      },
      {
        "title": "Ubuntu Response Time",
        "type": "graph",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, rate(http_request_duration_seconds_bucket{job=~\"ubuntu-.*\"}[5m]))",
            "legendFormat": "{{ job }} - 95th percentile"
          }
        ]
      }
    ]
  }
}
```

---

## 🔐 Security Configuration

### Ubuntu Security Hardening

#### 1. SSL/TLS Configuration
```bash
# Generate Ubuntu SSL certificates with Let's Encrypt
certbot certonly --nginx \
  -d api.yourdomain.com \
  -d app.yourdomain.com \
  -d marketplace.yourdomain.com \
  --email admin@yourdomain.com \
  --agree-tos \
  --non-interactive

# Setup automatic renewal
echo "0 12 * * * /usr/bin/certbot renew --quiet" | crontab -
```

#### 2. Network Security
```yaml
# k8s/network-policies.yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: ubuntu-network-policy
  namespace: azora-ubuntu-prod
spec:
  podSelector: {}
  policyTypes:
  - Ingress
  - Egress
  ingress:
  - from:
    - namespaceSelector:
        matchLabels:
          name: azora-ubuntu-prod
    ports:
    - protocol: TCP
      port: 8080
  egress:
  - to:
    - namespaceSelector:
        matchLabels:
          name: azora-ubuntu-prod
    ports:
    - protocol: TCP
      port: 5432  # PostgreSQL
    - protocol: TCP
      port: 6379  # Redis
```

#### 3. Secret Management
```bash
# Create Ubuntu secrets in Kubernetes
kubectl create secret generic ubuntu-database-secret \
  --from-literal=username=ubuntu_user \
  --from-literal=password=secure_ubuntu_password \
  --namespace=azora-ubuntu-prod

kubectl create secret generic ubuntu-api-keys \
  --from-literal=openai-key=${OPENAI_API_KEY} \
  --from-literal=stripe-key=${STRIPE_SECRET_KEY} \
  --namespace=azora-ubuntu-prod

# Setup secret rotation
kubectl apply -f k8s/secret-rotation.yaml
```

---

## 🔧 Troubleshooting

### Common Ubuntu Deployment Issues

#### 1. Service Health Check Failures
```bash
# Check Ubuntu service logs
kubectl logs -f deployment/ubuntu-api-gateway --namespace=azora-ubuntu-prod

# Debug Ubuntu service connectivity
kubectl exec -it ubuntu-api-gateway-pod -- curl http://localhost:4000/health

# Check Ubuntu service configuration
kubectl describe configmap ubuntu-config --namespace=azora-ubuntu-prod
```

#### 2. Database Connection Issues
```bash
# Test Ubuntu database connectivity
kubectl run ubuntu-db-test \
  --image=postgres:15-alpine \
  --rm -it --restart=Never \
  --namespace=azora-ubuntu-prod \
  -- psql -h postgres -U ubuntu_user -d azora_ubuntu_prod

# Check Ubuntu database logs
kubectl logs -f statefulset/postgres --namespace=azora-ubuntu-prod

# Verify Ubuntu database configuration
kubectl get secret ubuntu-database-secret -o yaml --namespace=azora-ubuntu-prod
```

#### 3. Performance Issues
```bash
# Check Ubuntu resource usage
kubectl top pods --namespace=azora-ubuntu-prod

# Monitor Ubuntu metrics
kubectl port-forward service/prometheus 9090:9090 --namespace=monitoring

# Scale Ubuntu services
kubectl scale deployment ubuntu-api-gateway --replicas=5 --namespace=azora-ubuntu-prod
```

### Ubuntu Deployment Checklist

#### Pre-deployment Checklist
- [ ] Ubuntu environment variables configured
- [ ] Database migrations completed
- [ ] SSL certificates installed
- [ ] Monitoring stack deployed
- [ ] Security policies applied
- [ ] Backup strategy implemented

#### Post-deployment Checklist
- [ ] All Ubuntu services healthy
- [ ] Database connectivity verified
- [ ] API endpoints responding
- [ ] Monitoring dashboards active
- [ ] Alerts configured and tested
- [ ] Performance benchmarks met

### Ubuntu Recovery Procedures

#### Service Recovery
```bash
# Restart Ubuntu service
kubectl rollout restart deployment/ubuntu-api-gateway --namespace=azora-ubuntu-prod

# Rollback Ubuntu deployment
kubectl rollout undo deployment/ubuntu-api-gateway --namespace=azora-ubuntu-prod

# Scale Ubuntu service
kubectl scale deployment ubuntu-api-gateway --replicas=3 --namespace=azora-ubuntu-prod
```

#### Database Recovery
```bash
# Restore Ubuntu database from backup
kubectl exec -i postgres-0 --namespace=azora-ubuntu-prod -- \
  psql -U ubuntu_user -d azora_ubuntu_prod < backup.sql

# Check Ubuntu database integrity
kubectl exec -it postgres-0 --namespace=azora-ubuntu-prod -- \
  psql -U ubuntu_user -d azora_ubuntu_prod -c "SELECT version();"
```

---

## 📚 Deployment Resources

### Documentation Links
- **[🐳 Docker Configuration](./docker/README.md)** - Container setup and optimization
- **[☸️ Kubernetes Manifests](./k8s/README.md)** - Kubernetes deployment files
- **[📊 Monitoring Setup](./monitoring/README.md)** - Observability configuration
- **[🔐 Security Hardening](./security/README.md)** - Security best practices
- **[☁️ Cloud Providers](./cloud/README.md)** - Cloud-specific deployment guides

### Ubuntu Deployment Commands Reference
```bash
# Quick Ubuntu deployment
docker-compose -f docker-compose.prod.yml up -d

# Ubuntu health check
curl http://localhost:4000/api/health

# Ubuntu service logs
docker-compose logs -f ubuntu-api-gateway

# Ubuntu metrics
curl http://localhost:9090/metrics

# Ubuntu backup
./scripts/ubuntu-backup.sh

# Ubuntu restore
./scripts/ubuntu-restore.sh backup-file.tar.gz
```

---

**"Ngiyakwazi ngoba sikwazi" - "I can because we can"**

*Ubuntu deployment ensures that individual service excellence contributes to collective system reliability and prosperity.*