# 🚂 Railway Deployment Guide - Azora OS

**Quick Deploy:** Get Azora OS live in 30 minutes

---

## 📋 Pre-Deployment Checklist

- [ ] Railway account created (railway.app)
- [ ] Railway CLI installed: `npm install -g @railway/cli`
- [ ] GitHub repository pushed
- [ ] Stripe account set up (for payments)
- [ ] Environment variables ready

---

## 🚀 Step 1: Install Railway CLI

```bash
npm install -g @railway/cli
railway login
```

---

## 🗄️ Step 2: Create PostgreSQL Database

```bash
# In Railway dashboard or CLI
railway add postgresql

# Get database URL
railway variables
# Copy DATABASE_URL value
```

---

## 📦 Step 3: Deploy Services (In Order)

### 3.1 Deploy API Gateway

```bash
cd services/api-gateway
railway init
railway up

# Set environment variables
railway variables set PORT=4000
railway variables set AUTH_URL=<auth-service-url>
railway variables set EDUCATION_URL=<education-service-url>
railway variables set MARKETPLACE_URL=<marketplace-service-url>
railway variables set PAYMENT_URL=<payment-service-url>
```

### 3.2 Deploy Auth Service

```bash
cd services/auth-service
railway init
railway up

# Set environment variables
railway variables set PORT=4001
railway variables set DATABASE_URL=<postgres-url>
railway variables set JWT_SECRET=<generate-random-secret>
railway variables set JWT_EXPIRES_IN=7d
```

### 3.3 Deploy Education Service

```bash
cd services/azora-education
railway init
railway up

# Set environment variables
railway variables set PORT=4201
railway variables set DATABASE_URL=<postgres-url>

# Run migrations and seed
railway run npx prisma migrate deploy
railway run npm run db:seed
```

### 3.4 Deploy Payment Service

```bash
cd services/payment
railway init
railway up

# Set environment variables
railway variables set PORT=4010
railway variables set DATABASE_URL=<postgres-url>
railway variables set STRIPE_SECRET_KEY=<your-stripe-secret>
railway variables set STRIPE_WEBHOOK_SECRET=<your-webhook-secret>
railway variables set EDUCATION_SERVICE_URL=<education-service-url>
```

### 3.5 Deploy Marketplace Service

```bash
cd services/azora-marketplace
railway init
railway up

# Set environment variables
railway variables set PORT=4004
railway variables set DATABASE_URL=<postgres-url>
```

### 3.6 Deploy Student Portal

```bash
cd apps/student-portal
railway init
railway up

# Set environment variables
railway variables set NEXT_PUBLIC_API_URL=<api-gateway-url>
railway variables set NEXT_PUBLIC_STRIPE_PUBLIC_KEY=<stripe-public-key>
```

---

## 🔧 Step 4: Configure Service URLs

After each service deploys, Railway gives you a URL. Update these in API Gateway:

```bash
cd services/api-gateway
railway variables set AUTH_URL=https://auth-service-xxx.railway.app
railway variables set EDUCATION_URL=https://education-xxx.railway.app
railway variables set MARKETPLACE_URL=https://marketplace-xxx.railway.app
railway variables set PAYMENT_URL=https://payment-xxx.railway.app

# Redeploy gateway
railway up
```

---

## 🔐 Step 5: Environment Variables Reference

### API Gateway
```env
PORT=4000
AUTH_URL=https://auth-service.railway.app
EDUCATION_URL=https://education-service.railway.app
MARKETPLACE_URL=https://marketplace-service.railway.app
PAYMENT_URL=https://payment-service.railway.app
```

### Auth Service
```env
PORT=4001
DATABASE_URL=postgresql://...
JWT_SECRET=your-super-secret-key-min-32-chars
JWT_EXPIRES_IN=7d
BCRYPT_ROUNDS=10
```

### Education Service
```env
PORT=4201
DATABASE_URL=postgresql://...
EDUCATION_PORT=4201
```

### Payment Service
```env
PORT=4010
DATABASE_URL=postgresql://...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
EDUCATION_SERVICE_URL=https://education-service.railway.app
```

### Marketplace Service
```env
PORT=4004
DATABASE_URL=postgresql://...
```

### Student Portal
```env
NEXT_PUBLIC_API_URL=https://api-gateway.railway.app
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_test_...
```

---

## ✅ Step 6: Verify Deployment

### Test API Gateway
```bash
curl https://your-api-gateway.railway.app/api/health
```

### Test Education Service
```bash
curl https://your-api-gateway.railway.app/api/courses
```

### Test Student Portal
Open browser: `https://your-student-portal.railway.app`

---

## 🐛 Troubleshooting

### Service won't start
```bash
# Check logs
railway logs

# Check environment variables
railway variables

# Restart service
railway restart
```

### Database connection fails
```bash
# Verify DATABASE_URL is set
railway variables | grep DATABASE_URL

# Test connection
railway run npx prisma db push
```

### CORS errors
```bash
# Update API Gateway CORS origins
railway variables set CORS_ORIGINS=https://your-student-portal.railway.app

# Redeploy
railway up
```

---

## 🔄 Quick Redeploy

```bash
# After making changes
git add .
git commit -m "Update"
git push

# Railway auto-deploys from GitHub
# Or manual deploy:
railway up
```

---

## 📊 Monitoring

```bash
# View logs
railway logs

# View metrics
railway status

# View all services
railway list
```

---

## 💰 Cost Estimate

**Railway Free Tier:**
- $5 free credit/month
- Enough for development/testing

**Production (Estimated):**
- 5 services × $5/month = $25/month
- PostgreSQL: $10/month
- **Total: ~$35/month**

---

## 🎯 Post-Deployment Checklist

- [ ] All services deployed and running
- [ ] Database seeded with sample courses
- [ ] Can access student portal
- [ ] Can browse courses
- [ ] Can create account
- [ ] Can enroll in course (test mode)
- [ ] Payment webhook configured
- [ ] Stripe webhook endpoint set
- [ ] Custom domain configured (optional)

---

## 🚨 Important Notes

1. **Use Stripe Test Mode** for initial launch
2. **Set up monitoring** (Railway provides basic metrics)
3. **Configure webhook endpoint** in Stripe dashboard
4. **Enable auto-deploy** from GitHub for easy updates
5. **Set up backups** for PostgreSQL database

---

## 🎉 You're Live!

Once deployed, share your student portal URL and start getting users!

**Next Steps:**
1. Test the full user flow
2. Monitor for errors
3. Gather user feedback
4. Iterate and improve

**Support:**
- Railway Docs: https://docs.railway.app
- Azora Docs: See `/docs` folder
- Issues: GitHub Issues
