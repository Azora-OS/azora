# 🚀 Deployment Guide

## Quick Start (Development)

```bash
# 1. Install dependencies
npm install

# 2. Set up database
npm run db:generate
npm run db:migrate
npm run db:seed

# 3. Create .env file
cp .env.example .env
# Edit .env and set JWT_SECRET

# 4. Run tests
npm test

# 5. Start services
npm run start:auth     # Port 4001
npm run start:education # Port 4002
npm run start:payment   # Port 4003
```

---

## Production Deployment

### Option 1: Docker Compose (Recommended)

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Option 2: Manual Deployment

#### Prerequisites
- Node.js 20+
- npm or yarn
- Reverse proxy (nginx/Caddy)
- SSL certificate

#### Steps

1. **Prepare Production Environment**
```bash
# Set up production server
ssh user@your-server.com

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clone repository
git clone <your-repo>
cd production
```

2. **Configure Environment**
```bash
# Create production .env
cat > .env << EOF
NODE_ENV=production
JWT_SECRET=$(openssl rand -base64 32)
DATABASE_URL=file:./azora-production.db
AUTH_PORT=4001
EDUCATION_PORT=4002
PAYMENT_PORT=4003
LOG_LEVEL=warn
EOF
```

3. **Install & Build**
```bash
# Production dependencies only
npm ci --only=production

# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate

# Seed initial data (optional)
npm run db:seed
```

4. **Set Up Process Manager (PM2)**
```bash
# Install PM2
npm install -g pm2

# Create ecosystem file
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [
    {
      name: 'auth-service',
      script: './auth-service/index.js',
      env: { AUTH_PORT: 4001 }
    },
    {
      name: 'education-service',
      script: './education-service/index.js',
      env: { EDUCATION_PORT: 4002 }
    },
    {
      name: 'payment-service',
      script: './payment-service/index.js',
      env: { PAYMENT_PORT: 4003 }
    }
  ]
}
EOF

# Start services
pm2 start ecosystem.config.js

# Set up startup script
pm2 startup
pm2 save
```

5. **Configure Nginx Reverse Proxy**
```nginx
# /etc/nginx/sites-available/azora
server {
    listen 80;
    server_name api.azora.world;

    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.azora.world;

    ssl_certificate /etc/letsencrypt/live/api.azora.world/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.azora.world/privkey.pem;

    # Auth service
    location /api/auth {
        proxy_pass http://localhost:4001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Education service
    location /api/courses {
        proxy_pass http://localhost:4002;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }

    location /api/enrollments {
        proxy_pass http://localhost:4002;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }

    # Payment service
    location /api/wallet {
        proxy_pass http://localhost:4003;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }

    location /api/transactions {
        proxy_pass http://localhost:4003;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }

    location /api/earn {
        proxy_pass http://localhost:4003;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }

    # Health checks
    location /health {
        access_log off;
        proxy_pass http://localhost:4001;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/azora /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

6. **Set Up SSL with Let's Encrypt**
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d api.azora.world
```

7. **Configure Firewall**
```bash
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw enable
```

---

## Option 3: Cloud Deployment

### AWS EC2 + RDS

1. **Create RDS PostgreSQL Instance**
```bash
# Create database
aws rds create-db-instance \
  --db-instance-identifier azora-db \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --master-username azora \
  --master-user-password <secure-password> \
  --allocated-storage 20
```

2. **Update .env**
```bash
DATABASE_URL="postgresql://azora:<password>@<rds-endpoint>:5432/azora"
```

3. **Deploy to EC2**
- Launch EC2 t3.small instance
- Follow manual deployment steps above
- Configure security groups

### Heroku

```bash
# Login
heroku login

# Create apps
heroku create azora-auth-prod
heroku create azora-education-prod
heroku create azora-payment-prod

# Add PostgreSQL
heroku addons:create heroku-postgresql:mini -a azora-auth-prod

# Deploy (example for auth)
cd auth-service
git init
heroku git:remote -a azora-auth-prod
git add .
git commit -m "Deploy"
git push heroku main
```

### DigitalOcean App Platform

```yaml
# .do/app.yaml
name: azora-production
services:
  - name: auth-service
    source_dir: auth-service
    envs:
      - key: NODE_ENV
        value: production
    http_port: 4001
    routes:
      - path: /api/auth

  - name: education-service
    source_dir: education-service
    http_port: 4002
    routes:
      - path: /api/courses
      - path: /api/enrollments

  - name: payment-service
    source_dir: payment-service
    http_port: 4003
    routes:
      - path: /api/wallet
      - path: /api/transactions
      - path: /api/earn

databases:
  - name: azora-db
    engine: PG
    version: "14"
```

---

## Monitoring & Maintenance

### Health Checks
```bash
# Check service health
curl https://api.azora.world/health

# All services should respond with:
# {"service":"auth-service","status":"healthy","timestamp":"..."}
```

### Logs
```bash
# PM2 logs
pm2 logs

# View specific service
pm2 logs auth-service

# Check log files
tail -f logs/error.log
tail -f logs/combined.log
```

### Backups
```bash
# Backup database
sqlite3 azora-production.db .dump > backup-$(date +%Y%m%d).sql

# Restore database
sqlite3 azora-production.db < backup-20251110.sql

# Automated daily backups
echo "0 2 * * * cd /path/to/production && sqlite3 azora-production.db .dump > backups/backup-\$(date +\%Y\%m\%d).sql" | crontab -
```

### Updates
```bash
# Stop services
pm2 stop all

# Pull updates
git pull

# Install dependencies
npm ci --only=production

# Run migrations
npm run db:migrate

# Restart services
pm2 restart all
```

---

## Testing in Production

```bash
# Register user
curl -X POST https://api.azora.world/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "testpass123",
    "name": "Test User"
  }'

# Login
TOKEN=$(curl -s -X POST https://api.azora.world/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "testpass123"
  }' | jq -r '.data.accessToken')

# Get courses
curl https://api.azora.world/api/courses

# Earn tokens
curl -X POST https://api.azora.world/api/earn \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"amount": 100, "description": "Test"}'

# Check balance
curl https://api.azora.world/api/wallet \
  -H "Authorization: Bearer $TOKEN"
```

---

## Troubleshooting

### Services won't start
```bash
# Check logs
pm2 logs

# Check ports
sudo netstat -tulpn | grep LISTEN

# Check environment
cat .env
```

### Database errors
```bash
# Regenerate Prisma client
npm run db:generate

# Reset database (DEV ONLY!)
rm azora-production.db
npm run db:migrate
npm run db:seed
```

### High memory usage
```bash
# Check PM2 status
pm2 status

# Restart services
pm2 restart all

# Monitor in real-time
pm2 monit
```

---

## Performance Tuning

### Database Optimization
```sql
-- Add indexes (run in Prisma Studio or migrate)
CREATE INDEX idx_user_email ON users(email);
CREATE INDEX idx_enrollment_user ON enrollments(userId);
CREATE INDEX idx_payment_user ON payments(userId);
```

### Caching (Future Enhancement)
- Add Redis for token caching
- Cache course listings
- Cache user profiles

### Load Balancing (Future Enhancement)
- Run multiple instances with PM2 cluster mode
- Use nginx for load balancing
- Consider Kubernetes for auto-scaling

---

## Support

**Issues**: File on GitHub  
**Docs**: `/workspace/production/`  
**Tests**: `npm test`  
**Coverage**: `npm run test:coverage`
