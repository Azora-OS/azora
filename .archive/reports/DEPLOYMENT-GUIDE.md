# 🚀 Deployment Guide

**Production deployment for Azora OS services**

---

## 📋 Prerequisites

- Docker & Docker Compose
- Node.js 18+
- PostgreSQL 15+
- Redis 7+
- 4GB RAM minimum
- 20GB disk space

---

## 🐳 Docker Deployment (Recommended)

### 1. Environment Setup

```bash
# Copy environment template
cp .env.example .env

# Edit with your values
nano .env
```

Required variables:
```bash
NODE_ENV=production
JWT_SECRET=your-secret-key
DB_USER=azora
DB_PASSWORD=secure-password
MONGODB_URI=mongodb://localhost:27017/azora
STRIPE_KEY=your-stripe-key
```

### 2. Start All Services

```bash
# Start all services
docker-compose -f docker-compose.services.yml up -d

# Check logs
docker-compose logs -f

# Check health
./scripts/health-check-all.sh
```

### 3. Verify Deployment

```bash
# API Gateway
curl http://localhost:4000/health

# Education Services
curl http://localhost:4200/health  # Education
curl http://localhost:4015/health  # LMS
curl http://localhost:4011/health  # Sapiens
curl http://localhost:4016/health  # Assessment

# Financial Services
curl http://localhost:3038/health  # Payment Gateway
curl http://localhost:3009/health  # Billing
```

---

## 🔧 Manual Deployment

### 1. Install Dependencies

```bash
# Install all service dependencies
for dir in services/*/; do
  cd "$dir"
  npm install
  cd ../..
done
```

### 2. Start Services

```bash
# Start in separate terminals or use PM2
cd services/api-gateway && npm start &
cd services/azora-education && npm start &
cd services/azora-lms && npm start &
cd services/azora-sapiens && npm start &
cd services/azora-assessment && npm start &
```

### 3. Using PM2 (Recommended)

```bash
# Install PM2
npm install -g pm2

# Start all services
pm2 start services/api-gateway/index.js --name api-gateway
pm2 start services/azora-education/index.js --name education
pm2 start services/azora-lms/index.js --name lms
pm2 start services/azora-sapiens/index.js --name sapiens
pm2 start services/azora-assessment/index.js --name assessment

# Monitor
pm2 monit

# Save configuration
pm2 save
pm2 startup
```

---

## 🌐 Production Deployment

### Kubernetes

```yaml
# k8s/deployment.yml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: azora-lms
spec:
  replicas: 3
  selector:
    matchLabels:
      app: azora-lms
  template:
    metadata:
      labels:
        app: azora-lms
    spec:
      containers:
      - name: azora-lms
        image: azora/lms:latest
        ports:
        - containerPort: 4015
        env:
        - name: NODE_ENV
          value: "production"
```

### Deploy to Kubernetes

```bash
kubectl apply -f k8s/
kubectl get pods
kubectl get services
```

---

## 📊 Monitoring

### Health Checks

```bash
# Automated health check
./scripts/health-check-all.sh

# Individual service
curl http://localhost:4015/health
```

### Logs

```bash
# Docker logs
docker-compose logs -f service-name

# PM2 logs
pm2 logs service-name

# Kubernetes logs
kubectl logs -f pod-name
```

---

## 🔒 Security

### SSL/TLS Setup

```bash
# Using Let's Encrypt
certbot --nginx -d api.azora.world
```

### Firewall Rules

```bash
# Allow only necessary ports
ufw allow 80/tcp
ufw allow 443/tcp
ufw deny 4000:5000/tcp  # Block direct service access
ufw enable
```

---

## 🔄 Updates & Rollbacks

### Update Services

```bash
# Pull latest code
git pull origin main

# Rebuild and restart
docker-compose -f docker-compose.services.yml up -d --build

# Or with PM2
pm2 restart all
```

### Rollback

```bash
# Docker
docker-compose down
git checkout previous-version
docker-compose up -d

# PM2
pm2 stop all
git checkout previous-version
pm2 restart all
```

---

## 📈 Scaling

### Horizontal Scaling

```bash
# Scale specific service
docker-compose up -d --scale azora-lms=3

# Kubernetes
kubectl scale deployment azora-lms --replicas=5
```

### Load Balancing

```nginx
# nginx.conf
upstream azora_lms {
    server localhost:4015;
    server localhost:4016;
    server localhost:4017;
}

server {
    listen 80;
    location / {
        proxy_pass http://azora_lms;
    }
}
```

---

## ✅ Post-Deployment Checklist

- [ ] All services healthy
- [ ] Database migrations run
- [ ] Environment variables set
- [ ] SSL certificates installed
- [ ] Monitoring configured
- [ ] Backups scheduled
- [ ] Logs aggregated
- [ ] Alerts configured
- [ ] Documentation updated
- [ ] Team notified

---

## 🆘 Troubleshooting

### Service Won't Start

```bash
# Check logs
docker-compose logs service-name

# Check port conflicts
netstat -tulpn | grep PORT

# Check environment
docker-compose config
```

### Database Connection Issues

```bash
# Test connection
psql -h localhost -U azora -d azora

# Check credentials
echo $DB_PASSWORD
```

### High Memory Usage

```bash
# Check resource usage
docker stats

# Restart service
docker-compose restart service-name
```

---

**"Ngiyakwazi ngoba sikwazi"** - Deploying together! 🚀
