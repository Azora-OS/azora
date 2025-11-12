# 🚀 Deploy to Vercel NOW

**Status**: Ready  
**Time**: 5 minutes  
**Method**: CLI or Dashboard

---

## ⚡ Option 1: CLI Deployment (Fastest)

### Step 1: Login
```bash
npx vercel login
```

### Step 2: Deploy
```bash
./VERCEL-DEPLOY-NOW.sh
```

### Step 3: Configure
After deployment, add environment variables via dashboard:
- DATABASE_URL
- JWT_SECRET
- Service URLs (for API Gateway)

---

## 🌐 Option 2: Dashboard Deployment

### Step 1: Push to GitHub
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

### Step 2: Import to Vercel
1. Go to https://vercel.com/new
2. Import your repository
3. Deploy each service:
   - `production/auth-service`
   - `production/education-service`
   - `production/payment-service`
   - `production/api-gateway`

### Step 3: Configure Environment Variables
Add to each service:
```
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-32-chars
NODE_ENV=production
```

For API Gateway, also add:
```
AUTH_SERVICE_URL=https://your-auth.vercel.app
EDUCATION_SERVICE_URL=https://your-education.vercel.app
PAYMENT_SERVICE_URL=https://your-payment.vercel.app
```

---

## 🗄️ Database Setup (Required First!)

### Quick Setup with Supabase
```bash
# 1. Create account at https://supabase.com
# 2. Create new project
# 3. Get connection string from Settings → Database
# 4. Run migrations:

cd production
DATABASE_URL="your-url" npx prisma migrate deploy
DATABASE_URL="your-url" node prisma/seed.js
```

---

## 🧪 Test Deployment

```bash
# Replace with your actual gateway URL
curl https://your-gateway.vercel.app/health

# Register user
curl -X POST https://your-gateway.vercel.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@azora.world","password":"Test@2024!","name":"Test"}'

# Login
curl -X POST https://your-gateway.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@azora.world","password":"Test@2024!"}'
```

---

## ✅ Deployment Checklist

- [ ] Vercel account created
- [ ] Database created (Supabase/Neon)
- [ ] Migrations run
- [ ] Seed data loaded
- [ ] Logged into Vercel CLI (if using CLI)
- [ ] Auth Service deployed
- [ ] Education Service deployed
- [ ] Payment Service deployed
- [ ] API Gateway deployed
- [ ] Environment variables configured
- [ ] API Gateway redeployed with service URLs
- [ ] Health checks passing
- [ ] Can register/login
- [ ] Can fetch courses

---

## 🎯 What Gets Deployed

### Backend (4 Services)
- Auth Service (port 4001)
- Education Service (port 4002)
- Payment Service (port 4003)
- API Gateway (port 4000)

### Features Working
- User registration & login
- Course browsing & enrollment
- Token earning system
- Wallet management
- Transaction history
- Progress tracking

---

## 💰 Cost: FREE

- Vercel Hobby: FREE
- Supabase: FREE (500MB)
- Total: $0/month

---

## 📚 Full Documentation

- Complete Guide: `VERCEL-DEPLOYMENT.md`
- Deployment Instructions: `DEPLOY-INSTRUCTIONS.md`
- Repository Scan: `REPO-SCAN-REPORT.md`

---

**Ready to deploy!** 🚀

Choose Option 1 (CLI) or Option 2 (Dashboard) above.
