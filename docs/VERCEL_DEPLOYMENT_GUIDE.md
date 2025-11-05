# 🚀 AZORA Mint-Mine Engine - Vercel Deployment Guide

## Overview

This guide covers deploying the AZORA Mint-Mine Engine to Vercel with a hybrid architecture:

- **Frontend (Vercel)**: Next.js dashboard with API routes
- **Backend (Server)**: Python mining engines running on dedicated server
- **Database**: PostgreSQL for persistent data storage

## Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Vercel        │────│   Backend API    │────│   Mining Engine │
│   Frontend      │    │   (Server)       │    │   (Python)      │
│   (Next.js)     │    │                  │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌────────────────────┐
                    │   PostgreSQL DB    │
                    │   (Persistent)     │
                    └────────────────────┘
```

## Prerequisites

- Vercel account
- Backend server (AWS/DigitalOcean/Linode/etc.)
- PostgreSQL database
- Domain name (optional)

## Step 1: Deploy Backend Services

### 1.1 Setup Backend Server

```bash
# On your backend server (Ubuntu/Debian)
sudo apt update
sudo apt install -y python3 python3-pip postgresql postgresql-contrib

# Clone repository
git clone <your-repo-url>
cd azora-os

# Setup Python environment
./setup_azora_mint_mine_v2.sh

# Configure environment
nano .env
# Set your database and blockchain configurations

# Start services
./start_azora_mint_mine.sh
```

### 1.2 Configure Database

```bash
# Create PostgreSQL database
sudo -u postgres psql
CREATE DATABASE azora_os;
CREATE USER azora WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE azora_os TO azora;
\q

# Run schema
psql -d azora_os -f database/schema.sql
```

### 1.3 Deploy Smart Contracts

```bash
# Deploy AZR contract to Azora Chain
cd azora-mint
npx hardhat run scripts/deploy-contracts.js --network azora

# Note the deployed contract address
```

### 1.4 Start Mining Engine

```bash
# Start the enhanced mining engine
cd azora-mint-mine-engine
python3 azora_mint_mine_engine_v2.py &
```

### 1.5 Setup Reverse Proxy (Optional)

```bash
# Install nginx
sudo apt install nginx

# Configure nginx for API access
sudo nano /etc/nginx/sites-available/azora-api

server {
    listen 80;
    server_name your-backend-server.com;

    location /api/ {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

sudo ln -s /etc/nginx/sites-available/azora-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## Step 2: Deploy Frontend to Vercel

### 2.1 Install Vercel CLI

```bash
npm install -g vercel
vercel login
```

### 2.2 Configure Environment Variables

```bash
cd azora-mint-mine-engine-next

# Set backend API URL
vercel env add BACKEND_API_URL
# Enter: https://your-backend-server.com
```

### 2.3 Deploy to Vercel

```bash
# Deploy
vercel --prod

# Or link project first
vercel link
vercel --prod
```

### 2.4 Configure Custom Domain (Optional)

```bash
vercel domains add your-domain.com
# Follow DNS configuration instructions
```

## Step 3: Post-Deployment Configuration

### 3.1 Update Backend API URL

In your Vercel dashboard:
1. Go to Project Settings
2. Environment Variables
3. Set `BACKEND_API_URL` to your backend server URL

### 3.2 Configure CORS (Backend)

Ensure your backend allows requests from Vercel:

```python
# In your Flask/FastAPI backend
from flask_cors import CORS
CORS(app, origins=["https://your-vercel-app.vercel.app"])
```

### 3.3 Setup Monitoring

```bash
# On backend server
sudo apt install prometheus-node-exporter
sudo systemctl enable prometheus-node-exporter
sudo systemctl start prometheus-node-exporter
```

## Step 4: Testing Deployment

### 4.1 Test Frontend

```bash
# Visit your Vercel URL
https://your-app.vercel.app

# Check API routes
curl https://your-app.vercel.app/api/health
```

### 4.2 Test Backend Connection

```bash
# Test mining stats API
curl https://your-app.vercel.app/api/mining/stats

# Test control API
curl -X POST https://your-app.vercel.app/api/mining/control \
  -H "Content-Type: application/json" \
  -d '{"action": "start-mining"}'
```

### 4.3 Test Mining Integration

1. Start mining from the dashboard
2. Check backend logs for mining activity
3. Verify AZR token minting transactions
4. Monitor database for new records

## Configuration Files

### Vercel Environment Variables

```bash
BACKEND_API_URL=https://your-backend-server.com
```

### Backend Environment Variables (.env)

```bash
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=azora_os
DB_USER=azora
DB_PASSWORD=your_secure_password

# Blockchain
AZORA_RPC_URL=http://localhost:8545
AZORA_CHAIN_ID=1337
AZR_CONTRACT_ADDRESS=0x...

# Mining
MINING_ALGORITHM=FishHash
MINING_COIN=IRON
CONVERSION_RATE=1.0

# Security
ALERT_WEBHOOK=https://hooks.slack.com/...
```

## Troubleshooting

### Common Issues

1. **API Connection Failed**
   - Check `BACKEND_API_URL` environment variable
   - Verify backend server is running
   - Check firewall settings

2. **Mining Not Starting**
   - Ensure backend services are running
   - Check wallet configurations
   - Verify mining pool connectivity

3. **Database Connection Issues**
   - Check database credentials
   - Verify PostgreSQL is running
   - Check network connectivity

4. **Build Failures**
   - Clear Vercel cache: `vercel --force`
   - Check TypeScript errors
   - Verify dependencies

### Logs

```bash
# Vercel logs
vercel logs

# Backend logs
tail -f /var/log/azora/mint_mine_engine.log

# Database logs
tail -f /var/log/postgresql/postgresql-*.log
```

## Security Considerations

1. **API Authentication**: Implement API keys for backend access
2. **Rate Limiting**: Add rate limiting to prevent abuse
3. **HTTPS Only**: Ensure all connections use HTTPS
4. **Firewall**: Configure firewall rules for backend server
5. **Monitoring**: Set up alerts for unusual activity

## Performance Optimization

1. **Caching**: Implement Redis for API response caching
2. **CDN**: Use Vercel's CDN for static assets
3. **Database Indexing**: Ensure proper database indexes
4. **Connection Pooling**: Use connection pooling for database

## Backup Strategy

1. **Database Backups**: Daily automated backups
2. **Code Backups**: Version control with Git
3. **Configuration Backups**: Backup environment files
4. **Monitoring**: Regular health checks

## Scaling

1. **Horizontal Scaling**: Add multiple backend servers
2. **Load Balancing**: Use load balancer for backend APIs
3. **Database Scaling**: Consider read replicas for high traffic
4. **CDN**: Use global CDN for worldwide access

## Maintenance

### Regular Tasks

1. **Update Dependencies**: Monthly dependency updates
2. **Security Patches**: Apply security patches promptly
3. **Performance Monitoring**: Regular performance audits
4. **Backup Verification**: Test backup restoration

### Monitoring Dashboards

1. **Vercel Analytics**: Monitor frontend performance
2. **Backend Monitoring**: Server resource usage
3. **Database Monitoring**: Query performance and connections
4. **Mining Monitoring**: Hashrate and profitability tracking

---

## 🚀 Deployment Checklist

- [ ] Backend server provisioned
- [ ] PostgreSQL database configured
- [ ] Smart contracts deployed
- [ ] Mining engine configured
- [ ] Backend API tested
- [ ] Vercel project created
- [ ] Environment variables set
- [ ] Frontend deployed
- [ ] API routes tested
- [ ] Mining integration verified
- [ ] Monitoring configured
- [ ] Security measures implemented
- [ ] Backup strategy in place

**Ready to deploy? Your AZORA Mint-Mine Engine will be live and minting AZR tokens! 🎉**