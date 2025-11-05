# 🚀 Deployment Documentation

This directory contains deployment guides for all Azora services and platforms.

---

## 📚 Quick Start

**[Complete Deployment Guide](./DEPLOYMENT-COMPLETE-GUIDE.md)** - Everything you need to deploy Azora

---

## 🎨 Frontend Deployment (Vercel)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy student portal
cd apps/student-portal
vercel --prod

# Deploy other frontends
cd ../job-board && vercel --prod
cd ../mint-dashboard && vercel --prod
cd ../admin-panel && vercel --prod
```

**Domains:**
- student.azora.world
- jobs.azora.world
- mint.azora.world
- admin.azora.world

---

## ⚙️ Backend Deployment (Railway)

```bash
# Install Railway CLI
npm install -g @railway/cli

# Deploy core services
cd services/azora-mint && railway up
cd ../azora-education && railway up
cd ../azora-forge && railway up
```

**APIs:**
- mint-api.azora.world
- edu-api.azora.world
- forge-api.azora.world

---

## 🗄️ Database Setup

### PostgreSQL (Supabase)
```bash
1. Create project at supabase.com
2. Copy connection string
3. Add to environment: DATABASE_URL=postgresql://...
```

### Redis (Upstash)
```bash
1. Create database at upstash.com
2. Copy connection string
3. Add to environment: REDIS_URL=redis://...
```

---

## 💰 Cost Estimate

```
Vercel (Frontends):      $20/month
Railway (Backends):      $200/month
Supabase (Database):     $25/month
Upstash (Redis):         $10/month
─────────────────────────────────
TOTAL:                   ~$255/month

(Scales to millions of users)
```

---

## ⏱️ Deployment Time

```
Setup:           5 minutes
Frontend Deploy: 15 minutes (4 apps)
Backend Deploy:  10 minutes (core services)
Database Setup:  5 minutes
───────────────────────────────
TOTAL:           ~30 minutes
```

---

## ✅ Deployment Checklist

- [ ] Vercel account created
- [ ] Railway account created
- [ ] Database provisioned
- [ ] Redis provisioned
- [ ] Environment variables set
- [ ] DNS configured
- [ ] SSL certificates active
- [ ] Health checks passing

---

[← Back to Docs](../README.md)
