# 🚀 Deploy Azora OS to Vercel - Step by Step

**Status**: ✅ Ready  
**Time**: 20 minutes  
**Method**: Manual deployment (no CLI needed)

---

## 🎯 Deployment Strategy

Since we're in a space-constrained environment, we'll use **Vercel's GitHub integration** for automatic deployments.

---

## 📋 Step-by-Step Instructions

### Step 1: Push to GitHub (5 min)

```bash
# If not already done
cd /home/user/azora-os
git add .
git commit -m "Ready for Vercel deployment"
git push origin main
```

### Step 2: Deploy via Vercel Dashboard (10 min)

#### For Each Backend Service:

1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Configure project:
   - **Framework Preset**: Other
   - **Root Directory**: `production/auth-service` (or education-service, payment-service, api-gateway)
   - **Build Command**: Leave empty
   - **Output Directory**: Leave empty
   - **Install Command**: `npm install`

4. Add Environment Variables:
   ```
   DATABASE_URL = postgresql://your-connection-string
   JWT_SECRET = your-secret-min-32-chars
   NODE_ENV = production
   ```

5. Click "Deploy"

#### Repeat for:
- `production/auth-service` → Name: `azora-auth-service`
- `production/education-service` → Name: `azora-education-service`
- `production/payment-service` → Name: `azora-payment-service`
- `production/api-gateway` → Name: `azora-api-gateway`

### Step 3: Update API Gateway URLs (5 min)

After backend services deploy, update API Gateway environment variables:

1. Go to your `azora-api-gateway` project on Vercel
2. Settings → Environment Variables
3. Add:
   ```
   AUTH_SERVICE_URL = https://azora-auth-service.vercel.app
   EDUCATION_SERVICE_URL = https://azora-education-service.vercel.app
   PAYMENT_SERVICE_URL = https://azora-payment-service.vercel.app
   ```
4. Redeploy: Deployments → Latest → Redeploy

---

## 🗄️ Database Setup (Required First!)

### Option 1: Supabase (Recommended - FREE)

1. Go to https://supabase.com
2. Create new project
3. Get connection string from Settings → Database
4. Format: `postgresql://postgres:[password]@[host]:5432/postgres`

### Option 2: Neon (Alternative - FREE)

1. Go to https://neon.tech
2. Create new project
3. Copy connection string
4. Format: `postgresql://[user]:[password]@[host]/[database]`

### Option 3: Railway (Paid - $5/mo)

1. Go to https://railway.app
2. New Project → PostgreSQL
3. Copy connection string

### Run Migrations

```bash
# Locally with your DATABASE_URL
cd production
DATABASE_URL="your-url" npx prisma migrate deploy
DATABASE_URL="your-url" node prisma/seed.js
```

---

## 🧪 Test Your Deployment

```bash
# Replace with your actual URLs

# 1. Test health
curl https://azora-api-gateway.vercel.app/health

# 2. Register user
curl -X POST https://azora-api-gateway.vercel.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@azora.world","password":"Test@2024!","name":"Test User"}'

# 3. Login
curl -X POST https://azora-api-gateway.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@azora.world","password":"Test@2024!"}'

# 4. Get courses (use token from login)
curl https://azora-api-gateway.vercel.app/api/courses \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 🎨 Deploy Frontend Apps (Optional)

Same process for frontend apps:

1. Vercel Dashboard → New Project
2. Import repository
3. Root Directory: `apps/student-portal` (or other app)
4. Framework: Next.js (auto-detected)
5. Environment Variables:
   ```
   NEXT_PUBLIC_API_URL = https://azora-api-gateway.vercel.app
   ```
6. Deploy

---

## ✅ Deployment Checklist

- [ ] Database created (Supabase/Neon/Railway)
- [ ] Migrations run
- [ ] Seed data loaded
- [ ] Auth Service deployed
- [ ] Education Service deployed
- [ ] Payment Service deployed
- [ ] API Gateway deployed
- [ ] Gateway environment variables updated
- [ ] Health checks passing
- [ ] Can register/login
- [ ] Can fetch courses

---

## 🔧 Alternative: Use Vercel CLI Locally

If you have space on your local machine:

```bash
# On your local machine (not in this environment)
npm install -g vercel
vercel login

# Deploy each service
cd production/auth-service
vercel --prod

cd ../education-service
vercel --prod

cd ../payment-service
vercel --prod

cd ../api-gateway
vercel --prod
```

---

## 💡 Pro Tips

1. **Use GitHub Integration**: Automatic deployments on push
2. **Environment Variables**: Set once, use everywhere
3. **Preview Deployments**: Every PR gets a preview URL
4. **Logs**: Check Vercel dashboard for errors
5. **Domains**: Add custom domains in project settings

---

## 🆘 Troubleshooting

**"Module not found"**
- Ensure `package.json` exists in root directory
- Check `node_modules` is in `.vercelignore`

**"Database connection failed"**
- Verify DATABASE_URL format
- Check database is accessible
- Ensure SSL is enabled

**"Function timeout"**
- Hobby plan: 10s limit
- Upgrade to Pro for 60s
- Optimize queries

---

## 📊 What You'll Get

- ✅ 4 backend services live
- ✅ Automatic HTTPS
- ✅ Global CDN
- ✅ Auto-scaling
- ✅ Zero-downtime deployments
- ✅ Preview environments
- ✅ Analytics dashboard

**Cost**: FREE on Hobby tier

---

**Ready to deploy!** 🚀

Start with database setup, then deploy via Vercel dashboard.
