# 🚀 Azora OS Deployment Guide

**Complete guide for deploying the Constitutional AI Operating System**

---

## 📋 Prerequisites

### System Requirements
- **OS**: Ubuntu 20.04+ / Windows Server 2019+ / macOS 12+
- **CPU**: 4+ cores
- **RAM**: 8GB minimum, 16GB recommended
- **Storage**: 100GB+ SSD
- **Network**: Stable internet connection

### Software Dependencies
- **Node.js**: 20.x LTS
- **PostgreSQL**: 15+
- **Redis**: 7+
- **Docker**: 24+
- **Docker Compose**: 2.20+

---

## ⚡ Quick Deployment

### Option 1: Docker Compose (Recommended)
```bash
# 1. Clone repository
git clone https://github.com/azora-os/azora-os.git
cd azora-os

# 2. Setup environment
cp .env.example .env
# Edit .env with your configuration

# 3. Deploy with Docker
docker-compose -f docker-compose.prod.yml up -d

# 4. Verify deployment
curl http://localhost:4000/api/health
```

### Option 2: Manual Installation
```bash
# 1. Install dependencies
npm install

# 2. Build all services
npm run build

# 3. Setup database
npm run db:migrate
npm run db:seed

# 4. Start production servers
npm run start:prod
```

---

## 🔧 Environment Configuration

### Required Environment Variables
```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/azora_prod
REDIS_URL=redis://localhost:6379

# Authentication
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d
REFRESH_TOKEN_SECRET=your-refresh-token-secret

# API Configuration
API_BASE_URL=https://api.yourdomain.com
FRONTEND_URL=https://yourdomain.com
CORS_ORIGINS=https://yourdomain.com,https://app.yourdomain.com

# External Services
OPENAI_API_KEY=your-openai-api-key
STRIPE_SECRET_KEY=your-stripe-secret-key
SENDGRID_API_KEY=your-sendgrid-api-key

# File Storage
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_S3_BUCKET=your-s3-bucket-name
AWS_REGION=us-east-1

# Monitoring
SENTRY_DSN=your-sentry-dsn
LOG_LEVEL=info
```

### Optional Environment Variables
```bash
# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100

# Mining Configuration
MINING_DIFFICULTY=medium
MINING_REWARD_RATE=0.1

# Constitutional AI
CONSTITUTIONAL_AI_ENABLED=true
CONSTITUTIONAL_AI_STRICTNESS=medium
```

---

## 🐳 Docker Deployment

### Production Docker Compose
```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  api-gateway:
    build: 
      context: .
      dockerfile: services/api-gateway/Dockerfile
    ports:
      - "4000:4000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
    depends_on:
      - postgres
      - redis
    restart: unless-stopped

  auth-service:
    build:
      context: .
      dockerfile: services/auth-service/Dockerfile
    environment:
      - NODE_ENV=production
      - JWT_SECRET=${JWT_SECRET}
    restart: unless-stopped

  student-portal:
    build:
      context: .
      dockerfile: apps/student-portal/Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_API_URL=${API_BASE_URL}
    restart: unless-stopped

  postgres:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=azora_prod
      - POSTGRES_USER=${DB_USER}
      - POSTGRES_PASSWORD=${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - api-gateway
      - student-portal
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
```

### Building Images
```bash
# Build all images
docker-compose -f docker-compose.prod.yml build

# Build specific service
docker-compose -f docker-compose.prod.yml build api-gateway

# Build with no cache
docker-compose -f docker-compose.prod.yml build --no-cache
```

---

## ☁️ Cloud Deployment

### AWS Deployment
```bash
# 1. Install AWS CLI
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# 2. Configure AWS credentials
aws configure

# 3. Deploy using CDK
cd infrastructure/aws
npm install
npx cdk deploy --all
```

### Google Cloud Deployment
```bash
# 1. Install gcloud CLI
curl https://sdk.cloud.google.com | bash
exec -l $SHELL

# 2. Initialize gcloud
gcloud init

# 3. Deploy to Cloud Run
gcloud run deploy azora-api \
  --image gcr.io/PROJECT_ID/azora-api \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

### Azure Deployment
```bash
# 1. Install Azure CLI
curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash

# 2. Login to Azure
az login

# 3. Deploy to Container Instances
az container create \
  --resource-group azora-rg \
  --name azora-api \
  --image azoraos/api:latest \
  --dns-name-label azora-api \
  --ports 4000
```

---

## 🔒 SSL/TLS Configuration

### Let's Encrypt with Certbot
```bash
# 1. Install Certbot
sudo apt install certbot python3-certbot-nginx

# 2. Obtain SSL certificate
sudo certbot --nginx -d yourdomain.com -d api.yourdomain.com

# 3. Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### Nginx Configuration
```nginx
# nginx.conf
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    location / {
        proxy_pass http://student-portal:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /api/ {
        proxy_pass http://api-gateway:4000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

---

## 📊 Monitoring & Logging

### Health Checks
```bash
# API Gateway health
curl http://localhost:4000/api/health

# Database connectivity
curl http://localhost:4000/api/health/db

# Redis connectivity
curl http://localhost:4000/api/health/redis

# All services status
curl http://localhost:4000/api/health/services
```

### Prometheus Monitoring
```yaml
# prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'azora-api'
    static_configs:
      - targets: ['api-gateway:4000']
    metrics_path: '/metrics'

  - job_name: 'azora-services'
    static_configs:
      - targets: 
        - 'auth-service:3001'
        - 'azora-mint:3002'
        - 'azora-lms:3003'
```

### Grafana Dashboard
```bash
# Start Grafana
docker run -d \
  --name grafana \
  -p 3001:3000 \
  -e "GF_SECURITY_ADMIN_PASSWORD=admin" \
  grafana/grafana

# Import Azora dashboard
# Dashboard ID: 12345 (custom Azora dashboard)
```

---

## 🔄 CI/CD Pipeline

### GitHub Actions
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '20'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run tests
      run: npm test
    
    - name: Build application
      run: npm run build
    
    - name: Deploy to production
      run: |
        echo "${{ secrets.DEPLOY_KEY }}" | base64 -d > deploy_key
        chmod 600 deploy_key
        ssh -i deploy_key -o StrictHostKeyChecking=no user@server 'cd /app && git pull && docker-compose -f docker-compose.prod.yml up -d --build'
```

### Automated Deployment Script
```bash
#!/bin/bash
# deploy-production.sh

set -e

echo "🚀 Starting Azora OS deployment..."

# Pull latest code
git pull origin main

# Build and deploy
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml build --no-cache
docker-compose -f docker-compose.prod.yml up -d

# Wait for services to start
sleep 30

# Run health checks
echo "🔍 Running health checks..."
curl -f http://localhost:4000/api/health || exit 1

# Run database migrations
docker-compose -f docker-compose.prod.yml exec api-gateway npm run db:migrate

echo "✅ Deployment completed successfully!"
```

---

## 🔧 Troubleshooting

### Common Issues

#### Service Won't Start
```bash
# Check logs
docker-compose -f docker-compose.prod.yml logs api-gateway

# Check container status
docker-compose -f docker-compose.prod.yml ps

# Restart specific service
docker-compose -f docker-compose.prod.yml restart api-gateway
```

#### Database Connection Issues
```bash
# Check PostgreSQL status
docker-compose -f docker-compose.prod.yml exec postgres pg_isready

# Check database logs
docker-compose -f docker-compose.prod.yml logs postgres

# Reset database
docker-compose -f docker-compose.prod.yml exec api-gateway npm run db:reset
```

#### High Memory Usage
```bash
# Check memory usage
docker stats

# Restart services with memory limits
docker-compose -f docker-compose.prod.yml up -d --force-recreate
```

### Performance Optimization
```bash
# Enable Redis caching
export REDIS_CACHE_ENABLED=true

# Optimize database connections
export DB_POOL_SIZE=20

# Enable compression
export COMPRESSION_ENABLED=true
```

---

## 📈 Scaling

### Horizontal Scaling
```yaml
# docker-compose.scale.yml
version: '3.8'

services:
  api-gateway:
    deploy:
      replicas: 3
    
  auth-service:
    deploy:
      replicas: 2
```

### Load Balancer Configuration
```nginx
upstream api_backend {
    server api-gateway-1:4000;
    server api-gateway-2:4000;
    server api-gateway-3:4000;
}

server {
    location /api/ {
        proxy_pass http://api_backend;
    }
}
```

---

## 🔐 Security Checklist

- [ ] SSL/TLS certificates configured
- [ ] Environment variables secured
- [ ] Database credentials rotated
- [ ] API rate limiting enabled
- [ ] CORS properly configured
- [ ] Security headers implemented
- [ ] Regular security updates applied
- [ ] Backup strategy implemented
- [ ] Monitoring and alerting configured
- [ ] Access logs enabled

---

## 📞 Support

- **Documentation**: [docs.azora.com/deployment](https://docs.azora.com/deployment)
- **Discord**: [discord.gg/azora](https://discord.gg/azora)
- **Email**: devops@azora.com

---

**Happy deploying! 🚀**