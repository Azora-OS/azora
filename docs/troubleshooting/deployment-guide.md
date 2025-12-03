# 🚀 Deployment Guide

**Ubuntu Principle:** *"My deployment strengthens our foundation"*

---

## 📋 Pre-Deployment Checklist

- [ ] All tests passing (`npm test`)
- [ ] Database migrations ready
- [ ] Environment variables configured
- [ ] SSL certificates obtained
- [ ] Backup strategy in place
- [ ] Monitoring configured
- [ ] Load testing completed

---

## 🐳 Docker Deployment (Recommended)

### 1. Build Images

```bash
# Build all services
docker-compose -f docker-compose.prod.yml build

# Build specific service
docker-compose -f docker-compose.prod.yml build api-gateway
```

### 2. Configure Environment

```bash
# Create production .env
cp .env.example .env.production

# Edit with production values
nano .env.production
```

**Required Variables:**
```env
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@db:5432/azora_auth
JWT_SECRET=<strong-secret-here>
API_PORT=4000
REDIS_URL=redis://redis:6379
```

### 3. Deploy Services

```bash
# Start all services
docker-compose -f docker-compose.prod.yml up -d

# Check status
docker-compose -f docker-compose.prod.yml ps

# View logs
docker-compose -f docker-compose.prod.yml logs -f
```

### 4. Run Migrations

```bash
# Run database migrations
docker-compose -f docker-compose.prod.yml exec api-gateway npm run db:migrate

# Seed production data (optional)
docker-compose -f docker-compose.prod.yml exec api-gateway npm run db:seed:prod
```

### 5. Verify Deployment

```bash
# Health check
curl https://api.azora.world/api/health

# Test endpoints
curl https://api.azora.world/api/courses
```

---

## ☁️ Cloud Deployment

### AWS Deployment

**1. Setup ECS Cluster:**
```bash
# Create cluster
aws ecs create-cluster --cluster-name azora-prod

# Create task definition
aws ecs register-task-definition --cli-input-json file://task-definition.json
```

**2. Deploy Services:**
```bash
# Create service
aws ecs create-service \
  --cluster azora-prod \
  --service-name api-gateway \
  --task-definition azora-api-gateway \
  --desired-count 2 \
  --launch-type FARGATE
```

**3. Setup Load Balancer:**
```bash
# Create ALB
aws elbv2 create-load-balancer \
  --name azora-alb \
  --subnets subnet-xxx subnet-yyy \
  --security-groups sg-xxx
```

### DigitalOcean Deployment

**1. Create Droplet:**
```bash
# Using doctl
doctl compute droplet create azora-prod \
  --size s-2vcpu-4gb \
  --image ubuntu-22-04-x64 \
  --region nyc1
```

**2. Setup Server:**
```bash
# SSH into droplet
ssh root@<droplet-ip>

# Install Docker
curl -fsSL https://get.docker.com | sh

# Clone repository
git clone https://github.com/Sizwe780/azora-os.git
cd azora-os

# Deploy
docker-compose -f docker-compose.prod.yml up -d
```

---

## 🔧 Manual Deployment

### 1. Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install PostgreSQL 15
sudo apt install -y postgresql-15

# Install PM2
sudo npm install -g pm2
```

### 2. Application Setup

```bash
# Clone repository
git clone https://github.com/Sizwe780/azora-os.git
cd azora-os

# Install dependencies
npm install

# Build services
npm run build

# Setup database
npm run db:setup
npm run db:migrate
```

### 3. Start Services with PM2

```bash
# Start API Gateway
pm2 start services/api-gateway/dist/index.js --name api-gateway

# Start other services
pm2 start services/azora-education/dist/index.js --name education
pm2 start services/azora-mint/dist/index.js --name mint
pm2 start services/azora-forge/dist/index.js --name forge

# Save PM2 config
pm2 save

# Setup startup script
pm2 startup
```

### 4. Configure Nginx

```nginx
# /etc/nginx/sites-available/azora
server {
    listen 80;
    server_name api.azora.world;

    location / {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/azora /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 5. Setup SSL with Let's Encrypt

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d api.azora.world

# Auto-renewal
sudo certbot renew --dry-run
```

---

## 📊 Monitoring Setup

### 1. Prometheus

```yaml
# prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'azora-api'
    static_configs:
      - targets: ['localhost:4000']
```

```bash
# Start Prometheus
docker run -d \
  -p 9090:9090 \
  -v $(pwd)/prometheus.yml:/etc/prometheus/prometheus.yml \
  prom/prometheus
```

### 2. Grafana

```bash
# Start Grafana
docker run -d \
  -p 3000:3000 \
  grafana/grafana

# Access at http://localhost:3000
# Default: admin/admin
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
      
      - name: Install dependencies
        run: npm install
      
      - name: Run tests
        run: npm test
      
      - name: Build
        run: npm run build
      
      - name: Deploy to server
        run: |
          ssh user@server 'cd /app && git pull && npm install && pm2 restart all'
```

---

## 🔐 Security Hardening

### 1. Firewall Setup

```bash
# UFW (Ubuntu)
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### 2. Fail2Ban

```bash
# Install
sudo apt install -y fail2ban

# Configure
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

### 3. Database Security

```sql
-- Create restricted user
CREATE USER azora_app WITH PASSWORD 'strong-password';
GRANT CONNECT ON DATABASE azora_auth TO azora_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO azora_app;
```

---

## 📦 Backup Strategy

### Automated Backups

```bash
# Create backup script
cat > /usr/local/bin/azora-backup.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump azora_auth > /backups/azora_auth_$DATE.sql
find /backups -mtime +7 -delete
EOF

chmod +x /usr/local/bin/azora-backup.sh

# Add to crontab
crontab -e
# Add: 0 2 * * * /usr/local/bin/azora-backup.sh
```

---

## 🎯 Post-Deployment

### 1. Smoke Tests

```bash
# Health check
curl https://api.azora.world/api/health

# Test authentication
curl -X POST https://api.azora.world/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@azora.world","password":"test123"}'

# Test database
curl https://api.azora.world/api/courses
```

### 2. Performance Testing

```bash
# Install k6
sudo apt install -y k6

# Run load test
k6 run load-test.js
```

### 3. Monitor Logs

```bash
# PM2 logs
pm2 logs

# Docker logs
docker-compose logs -f

# System logs
tail -f /var/log/nginx/access.log
```

---

## 🆘 Rollback Procedure

```bash
# 1. Stop current deployment
pm2 stop all

# 2. Restore previous version
git checkout <previous-commit>
npm install
npm run build

# 3. Restore database backup
psql azora_auth < /backups/azora_auth_20250110.sql

# 4. Restart services
pm2 restart all

# 5. Verify
curl https://api.azora.world/api/health
```

---

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [PM2 Documentation](https://pm2.keymetrics.io/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [AWS ECS Guide](https://docs.aws.amazon.com/ecs/)

---

**Ubuntu:** *"Ngiyakwazi ngoba sikwazi" - "I can because we can"* 🌍
