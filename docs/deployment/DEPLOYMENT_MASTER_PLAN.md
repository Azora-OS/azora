# 🚀 Azora OS - Complete Ecosystem Deployment

**Deploy the entire living organism to production in one command.**

---

## 🌐 The Complete Ecosystem

### 12 Services Across Multiple Domains:

| # | Service | Domain | Framework | Status |
|---|---------|--------|-----------|--------|
| 1 | **Main Application** | azora.world | Next.js 15.5+ | ✅ Ready |
| 2 | **Elara IDE** | ide.azora.world | Next.js | ✅ Ready |
| 3 | **Marketplace UI** | marketplace.azora.world | Vite + React | ✅ Ready |
| 4 | **Pay UI** | pay.azora.world | Vite + React | ✅ Ready |
| 5 | **Synapse Portal** | synapse.azora.world | Static SPA | ✅ Ready |
| 6 | **Synapse Vigil** | vigil.azora.world | Next.js | ✅ Ready |
| 7 | **Synapse Academy** | academy.azora.world | Next.js | ✅ Ready |
| 8 | **Synapse Frontend** | synapse.azora.world | Static SPA | ✅ Ready |
| 9 | **Mint-Mine Engine** | mint.azora.world | Next.js | ⚠️ Needs Fix |
| 10 | **Onboarding Service** | onboard.azora.world | Node.js API | ✅ Ready |
| 11 | **Synapse API** | synapse-api.azora.world | Node.js API | ✅ Ready |
| 12 | **UI Components** | ui.azora.world | React/Next.js | ✅ Ready |

---

## 🎯 Quick Deploy (Automated)

### One-Command Deployment:

```bash
# Deploy everything at once
./deploy-all-vercel.sh
```

This will:
- ✅ Check all 12 services
- ✅ Install dependencies where needed
- ✅ Deploy each service to Vercel
- ✅ Configure custom domains
- ✅ Generate deployment report
- ✅ Log everything for troubleshooting

**Estimated time:** 15-25 minutes (depending on internet speed)

---

## 📋 Pre-Deployment Checklist

### 1. Prerequisites

- [ ] Vercel account created
- [ ] Vercel CLI installed: `npm install -g vercel`
- [ ] Logged in: `vercel login`
- [ ] GitHub repo access
- [ ] Domain DNS access (for custom domains)

### 2. Environment Variables

Each service may need environment variables. Create `.env` files or set in Vercel dashboard:

**Onboarding Service:**
```env
ONBOARDING_PORT=5500
NODE_ENV=production
CEO_PUBLIC_KEY=your-key
LEDGER_API_URL=https://ledger.azora.world
```

**Mint-Mine Engine:**
```env
BACKEND_API_URL=https://api.azora.world
NEXT_PUBLIC_API_URL=https://api.azora.world
```

**Synapse API:**
```env
NODE_VERSION=20
DATABASE_URL=your-db-url
```

### 3. Custom Domains

You'll need to configure DNS records for:

```
azora.world                    → Main App
ide.azora.world               → Elara IDE
marketplace.azora.world       → Marketplace
pay.azora.world              → Payment System
synapse.azora.world          → Synapse Portal
vigil.azora.world            → Monitoring
academy.azora.world          → Education
mint.azora.world             → Mining Engine
onboard.azora.world          → Onboarding
synapse-api.azora.world      → Synapse API
ui.azora.world               → UI Library
```

**DNS Configuration (for each subdomain):**
```
Type: CNAME
Name: [subdomain]
Value: cname.vercel-dns.com
```

---

## 🔧 Manual Deployment (Step-by-Step)

If you prefer deploying services individually:

### 1. Main Application

```bash
cd /workspace
vercel --prod

# Link to project: azora-os
# Custom domain: azora.world
```

### 2. Elara IDE

```bash
cd /workspace/elara-ide
vercel --prod

# Custom domain: ide.azora.world
```

### 3. Marketplace UI

```bash
cd /workspace/marketplace-ui
npm install
npm run build
vercel --prod

# Custom domain: marketplace.azora.world
```

### 4. Pay UI

```bash
cd /workspace/pay-ui
npm install
npm run build
vercel --prod

# Custom domain: pay.azora.world
```

### 5. Synapse Portal

```bash
cd /workspace/synapse
npm install
npm run build
vercel --prod

# Custom domain: synapse.azora.world
```

### 6. Synapse Vigil UI

```bash
cd /workspace/synapse/vigil-ui
npm install
npm run build
vercel --prod

# Custom domain: vigil.azora.world
```

### 7. Synapse Academy UI

```bash
cd /workspace/synapse/academy-ui
npm install
npm run build
vercel --prod

# Custom domain: academy.azora.world
```

### 8. Synapse Frontend

```bash
cd /workspace/synapse/frontend
npm install
npm run build
vercel --prod
```

### 9. Mint-Mine Engine (Fix First!)

```bash
cd /workspace/azora/azora-mint-mine-engine-next

# Add environment variable
echo "NEXT_PUBLIC_BACKEND_API_URL=https://api.azora.world" > .env.production

npm install
npm run build
vercel --prod --env NEXT_PUBLIC_BACKEND_API_URL=https://api.azora.world

# Custom domain: mint.azora.world
```

### 10. Onboarding Service

```bash
cd /workspace/services/azora-onboarding
npm install
vercel --prod

# Custom domain: onboard.azora.world
```

### 11. Synapse API

```bash
cd /workspace/services/azora-synapse
npm install
vercel --prod

# Custom domain: synapse-api.azora.world
```

### 12. UI Components

```bash
cd /workspace/ui
npm install
npm run build
vercel --prod

# Custom domain: ui.azora.world
```

---

## 🐛 Fixing the Mint-Mine Engine

The Mint-Mine Engine is marked as **BROKEN - Missing BACKEND_API_URL**.

### Fix:

1. **Add Environment Variable:**
```bash
cd /workspace/azora/azora-mint-mine-engine-next

# Create .env.production
cat > .env.production << EOF
NEXT_PUBLIC_BACKEND_API_URL=https://api.azora.world
BACKEND_API_URL=https://api.azora.world
EOF
```

2. **Update vercel.json:**
```json
{
  "env": {
    "NEXT_PUBLIC_BACKEND_API_URL": "https://api.azora.world",
    "BACKEND_API_URL": "https://api.azora.world"
  }
}
```

3. **Deploy:**
```bash
vercel --prod
```

---

## 📊 Post-Deployment Verification

After deployment, verify each service:

### Health Checks:

```bash
# Main App
curl https://azora.world

# Onboarding Service
curl https://onboard.azora.world/health

# Synapse API
curl https://synapse-api.azora.world/health

# Elara IDE
curl https://ide.azora.world

# Marketplace
curl https://marketplace.azora.world

# Pay UI
curl https://pay.azora.world

# Mint-Mine Engine
curl https://mint.azora.world

# Synapse Portal
curl https://synapse.azora.world

# Vigil UI
curl https://vigil.azora.world

# Academy UI
curl https://academy.azora.world

# UI Components
curl https://ui.azora.world
```

### Expected Response:
- Frontend apps: HTML page (200 OK)
- API services: JSON health status
- All: No 404 or 500 errors

---

## 🔒 Security Checklist

Before going fully public:

- [ ] Environment variables secured (no secrets in code)
- [ ] HTTPS enabled (Vercel auto-provides)
- [ ] CORS configured properly
- [ ] Rate limiting enabled
- [ ] Authentication implemented
- [ ] Database connections secured
- [ ] API keys rotated
- [ ] Monitoring enabled

---

## 📈 Monitoring & Analytics

### Vercel Analytics

Each deployment includes:
- Real-time visitor analytics
- Performance metrics
- Error tracking
- Geographic distribution

Access in: Vercel Dashboard → Your Project → Analytics

### Custom Monitoring

For the Onboarding Service:
```bash
# Check system status
curl https://onboard.azora.world/status

# Watch live events
curl -N https://onboard.azora.world/api/events
```

---

## 🌐 Custom Domain Configuration

### Step 1: Add Domain in Vercel

1. Go to Vercel Dashboard
2. Select your project
3. Go to Settings → Domains
4. Add your domain/subdomain

### Step 2: Configure DNS

**For apex domain (azora.world):**
```
Type: A
Name: @
Value: 76.76.21.21
```

**For subdomains (ide.azora.world, etc.):**
```
Type: CNAME
Name: [subdomain]
Value: cname.vercel-dns.com
```

### Step 3: Verify

Wait 5-60 minutes for DNS propagation, then verify:
```bash
dig azora.world
dig ide.azora.world
```

---

## 🚨 Troubleshooting

### "Deployment Failed"

**Check logs:**
```bash
vercel logs [deployment-url]
```

**Common issues:**
- Missing dependencies: Check `package.json`
- Build errors: Run `npm run build` locally first
- Environment variables: Verify in Vercel dashboard

### "404 Not Found"

**Solutions:**
- Check vercel.json routes configuration
- Verify output directory in vercel.json
- Check build command produced files

### "500 Internal Server Error"

**Solutions:**
- Check environment variables
- Verify database connections
- Check serverless function timeout
- Review Vercel logs

### "CORS Errors"

**Solution:** Update CORS configuration in API services:
```typescript
app.use(cors({
  origin: [
    'https://azora.world',
    'https://ide.azora.world',
    'https://marketplace.azora.world',
    // ... all your domains
  ]
}));
```

---

## 📊 Deployment Report Template

After deployment, document results:

```markdown
# Azora OS Deployment Report
Date: [DATE]
Deployed by: [NAME]

## Services Deployed:
- [ ] Main Application (azora.world)
- [ ] Elara IDE (ide.azora.world)
- [ ] Marketplace UI (marketplace.azora.world)
- [ ] Pay UI (pay.azora.world)
- [ ] Synapse Portal (synapse.azora.world)
- [ ] Synapse Vigil (vigil.azora.world)
- [ ] Synapse Academy (academy.azora.world)
- [ ] Synapse Frontend (synapse.azora.world)
- [ ] Mint-Mine Engine (mint.azora.world)
- [ ] Onboarding Service (onboard.azora.world)
- [ ] Synapse API (synapse-api.azora.world)
- [ ] UI Components (ui.azora.world)

## Issues:
[List any deployment issues]

## Next Steps:
[Post-deployment tasks]
```

---

## 🎯 Deployment Strategies

### Strategy 1: All at Once (Automated)
```bash
./deploy-all-vercel.sh
```
**Pros:** Fast, consistent  
**Cons:** All services down if script fails

### Strategy 2: Phased Rollout
```bash
# Phase 1: Core Services
vercel --prod  # Main app
cd services/azora-onboarding && vercel --prod
cd services/azora-synapse && vercel --prod

# Phase 2: User Interfaces
cd elara-ide && vercel --prod
cd marketplace-ui && vercel --prod
cd pay-ui && vercel --prod

# Phase 3: Synapse Ecosystem
cd synapse && vercel --prod
cd synapse/vigil-ui && vercel --prod
cd synapse/academy-ui && vercel --prod

# Phase 4: Additional Services
cd azora/azora-mint-mine-engine-next && vercel --prod
cd ui && vercel --prod
```
**Pros:** Controlled, easier to debug  
**Cons:** Takes longer

### Strategy 3: Continuous Deployment
Set up GitHub Actions to auto-deploy on push:
```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

---

## 📚 Additional Resources

### Vercel Documentation:
- **Projects:** https://vercel.com/docs/projects
- **Domains:** https://vercel.com/docs/custom-domains
- **Environment Variables:** https://vercel.com/docs/environment-variables
- **Serverless Functions:** https://vercel.com/docs/serverless-functions

### Azora OS Documentation:
- **Service Architecture:** `/workspace/docs/ARCHITECTURE.md`
- **Onboarding API:** `/workspace/services/azora-onboarding/README.md`
- **Genesis Launch:** `/workspace/LAUNCH_THE_ORGANISM.md`

---

## ✅ Final Checklist

Before announcing launch:

### Technical:
- [ ] All 12 services deployed
- [ ] All health checks passing
- [ ] Custom domains configured
- [ ] SSL certificates active
- [ ] Analytics enabled
- [ ] Monitoring setup
- [ ] Error tracking active

### Content:
- [ ] README updated with live URLs
- [ ] Documentation reflects production
- [ ] API docs published
- [ ] User guides available

### Marketing:
- [ ] Social media announcement ready
- [ ] Demo videos recorded
- [ ] Press release drafted
- [ ] Launch blog post written

### Legal:
- [ ] Terms of Service live
- [ ] Privacy Policy published
- [ ] Cookie policy (if needed)
- [ ] GDPR compliance (if EU traffic)

---

## 🎉 Launch Announcement Template

```markdown
🌍 AZORA OS IS NOW LIVE! 🚀

The world's first autonomous operating system with constitutional AI governance is now in production.

🔗 Explore the ecosystem:
• Main Platform: https://azora.world
• Onboarding: https://onboard.azora.world
• IDE: https://ide.azora.world
• Marketplace: https://marketplace.azora.world
• Payment: https://pay.azora.world
• Mining: https://mint.azora.world

Register in <30 seconds. Elara Ω handles everything autonomously.

The organism is alive. Join us. 🌱

#AzoraOS #AutonomousAI #Africa #Web3 #ConstitutionalAI
```

---

## 🚀 Ready to Deploy?

```bash
# Make the script executable
chmod +x deploy-all-vercel.sh

# Deploy everything!
./deploy-all-vercel.sh
```

**Or deploy manually:**
```bash
vercel --prod
```

---

**The entire ecosystem is ready. Let's make it live! 🌍**

---

**© 2025 Azora ES (Pty) Ltd.**

*From Local to Global - The Complete Deployment*
