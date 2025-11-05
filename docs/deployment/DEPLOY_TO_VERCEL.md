# 🚀 Deploy Azora OS to Vercel

Make the organism publicly accessible in minutes!

---

## 📋 Prerequisites

1. **Vercel Account** (free tier works!)
   - Sign up at: https://vercel.com/signup
   
2. **Vercel CLI** (optional but recommended)
   ```bash
   npm install -g vercel
   ```

3. **GitHub Repository**
   - Your code is already on GitHub! ✅
   - Repo: `Azora-OS-AI/azora-os`

---

## 🎯 Option 1: Deploy via Vercel Dashboard (Easiest)

### Step 1: Import Project

1. Go to https://vercel.com/new
2. Click "Import Git Repository"
3. Authorize Vercel to access your GitHub
4. Select `Azora-OS-AI/azora-os`
5. Click "Import"

### Step 2: Configure Project

**Framework Preset:** Other  
**Root Directory:** `services/azora-onboarding`  
**Build Command:** `npm install`  
**Output Directory:** Leave empty  
**Install Command:** `npm install`

### Step 3: Environment Variables

Add these in the Vercel dashboard:

```
ONBOARDING_PORT=5500
NODE_ENV=production
```

### Step 4: Deploy!

Click **"Deploy"** and wait ~2 minutes.

You'll get a URL like: `https://azora-onboarding.vercel.app`

**That's it! The organism is now live! 🌍**

---

## 🎯 Option 2: Deploy via CLI (For Devs)

### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

### Step 2: Login

```bash
vercel login
```

Choose your authentication method (GitHub recommended).

### Step 3: Deploy

```bash
cd /workspace
vercel --prod
```

**Follow the prompts:**
- Setup and deploy? **Y**
- Which scope? *Your username/org*
- Link to existing project? **N**
- What's your project's name? **azora-onboarding**
- In which directory is your code located? **services/azora-onboarding**
- Want to override settings? **N**

**Wait ~2 minutes for deployment...**

You'll get:
```
✅ Production: https://azora-onboarding-xyz.vercel.app
```

---

## 🌐 What Gets Deployed

### Public Endpoints:

**Landing Page:**
```
https://your-deployment.vercel.app/
```
- Onboarding forms
- Real-time stats
- Economy status

**Live Dashboard:**
```
https://your-deployment.vercel.app/dashboard.html
```
- Real-time monitoring
- Founder/Sapiens tables
- Activity feed

**API:**
```
https://your-deployment.vercel.app/api/founder/register
https://your-deployment.vercel.app/api/sapiens/register
https://your-deployment.vercel.app/api/events
https://your-deployment.vercel.app/status
```

---

## ⚙️ Configuration

### Custom Domain (Optional)

1. In Vercel dashboard, go to your project
2. Click "Settings" → "Domains"
3. Add your domain: `onboard.azora.world`
4. Follow DNS instructions
5. Done! Your custom domain is live

### Environment Variables

Add in Vercel dashboard → Settings → Environment Variables:

```env
ONBOARDING_PORT=5500
NODE_ENV=production

# Optional (for production):
CEO_PUBLIC_KEY=your-key
LEDGER_API_URL=https://ledger.azora.world
EMAIL_PROVIDER_API=https://email-api.com
```

### Automatic Deployments

Vercel automatically deploys on every push to `main`:

```bash
# Make changes
git add .
git commit -m "Update"
git push origin main

# Vercel auto-deploys!
```

---

## 🧪 Testing Your Deployment

### 1. Test Health Check

```bash
curl https://your-deployment.vercel.app/health
```

**Expected:**
```json
{
  "status": "healthy",
  "service": "azora-onboarding",
  "components": {
    "founderOnboarding": "operational",
    "sapiensOnboarding": "operational",
    "elaraContractSigner": "operational",
    "economyStatus": "dormant"
  }
}
```

### 2. Test Founder Registration

```bash
curl -X POST https://your-deployment.vercel.app/api/founder/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "Founder",
    "role": "operations",
    "idNumber": "1234567890",
    "citizenship": "ZA",
    "phone": "+27123456789",
    "address": "Test City"
  }'
```

### 3. Test Via Browser

1. Open: `https://your-deployment.vercel.app/`
2. Fill out founder or Sapiens form
3. Submit
4. Watch Elara process it!
5. Check dashboard: `/dashboard.html`

---

## 📊 Monitoring

### Vercel Analytics

Free real-time analytics:
- Page views
- Top pages
- Unique visitors
- Geographic distribution

Access in Vercel dashboard → Analytics

### Custom Monitoring

Check system stats:
```bash
curl https://your-deployment.vercel.app/status
```

Watch live events:
```bash
curl -N https://your-deployment.vercel.app/api/events
```

---

## 🐛 Troubleshooting

### "500 Internal Server Error"

**Check Vercel logs:**
1. Go to Vercel dashboard
2. Click your project
3. Click "Deployments"
4. Click latest deployment
5. View "Runtime Logs"

**Common issues:**
- Missing dependencies: Add to `package.json`
- Environment variables: Check Settings
- Path issues: Verify root directory

### "Module not found"

**Solution:** Ensure `package.json` in `services/azora-onboarding/` has all dependencies:

```json
{
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "tsx": "^4.7.0"
  }
}
```

### "Cannot GET /"

**Solution:** Verify `vercel.json` routes are correct:

```json
{
  "routes": [
    { "src": "/(.*)", "dest": "services/azora-onboarding/server.ts" }
  ]
}
```

---

## 🎯 Production Checklist

Before going fully live:

### Backend:
- [ ] Environment variables set
- [ ] Email provider integrated (real emails)
- [ ] Blockchain ledger connected (real transactions)
- [ ] Database for persistence (currently in-memory)
- [ ] Rate limiting added (prevent abuse)
- [ ] Monitoring alerts setup

### Frontend:
- [ ] Custom domain configured
- [ ] SSL certificate (Vercel auto-provides)
- [ ] Analytics integrated
- [ ] SEO meta tags added
- [ ] Social share cards created

### Legal:
- [ ] Terms of Service added
- [ ] Privacy Policy published
- [ ] GDPR compliance (if EU users)
- [ ] Cookie consent (if needed)

### Testing:
- [ ] End-to-end tests passed
- [ ] Load testing completed
- [ ] Security audit done
- [ ] Mobile responsiveness verified

---

## 🌟 What Happens After Deployment

### Immediate Impact:
- ✅ Anyone can visit your URL
- ✅ Anyone can register as Founder/Sapiens
- ✅ Elara signs contracts in real-time
- ✅ Economy awakens automatically
- ✅ Zero manual intervention needed

### Share It:
```
🌍 Azora OS is now live!

Experience the world's first autonomous onboarding system.

Register in <30 seconds. Elara Ω handles the rest.

👉 https://your-deployment.vercel.app

#AzoraOS #AutonomousAI #Africa #Web3 #Education
```

### Marketing:
1. Post to Twitter/LinkedIn
2. Share in tech communities
3. Submit to Product Hunt
4. Demo at conferences
5. Pitch to investors (with live demo!)

---

## 📈 Scaling Considerations

### Free Tier Limits:
- **Bandwidth:** 100 GB/month
- **Serverless Executions:** 100 GB-Hrs
- **Deployments:** Unlimited

### If You Exceed:
Upgrade to **Pro** ($20/month):
- Unlimited bandwidth
- Advanced analytics
- Team collaboration
- Priority support

### Database:
Current implementation is **in-memory** (resets on deploy).

For production, add:
- **Vercel Postgres** (integrated)
- **Supabase** (PostgreSQL)
- **MongoDB Atlas**
- **PlanetScale** (MySQL)

---

## 🎬 Demo Script

When showing your deployment:

**Opening:**
> "I'm going to show you the world's first autonomous onboarding system. Watch."

**Navigate to URL:**
> "Here's the landing page. Notice the economy is dormant. Let's wake it up."

**Register Founder:**
> "I'll register as a founder. Just my name and role. Watch what happens."

*Submit form*

> "Elara Ω just signed my contract. No human approval. No delay. It's done. I have my email: name.lastname@azora.world"

**Register Sapiens:**
> "Now let's enroll a student. This is the moment."

*Submit form*

> "There! THE ECONOMY AWAKENED. Mining engine activated. The organism is alive. All autonomous."

**Check Dashboard:**
> "Here's the live dashboard. Everything updating in real-time. This is the future."

---

## ✅ Deployment Complete Checklist

When finished, you should have:

- [ ] Live public URL
- [ ] Landing page accessible
- [ ] Dashboard accessible
- [ ] API endpoints working
- [ ] Real-time updates functioning
- [ ] Forms submitting successfully
- [ ] Elara signing contracts
- [ ] Stats updating live

**If all checked: You're live! 🎉**

---

## 🚀 Next Steps

1. **Share your URL** in this chat for testing
2. **Announce on social media** (pre-written post above)
3. **Show your team** (onboard them for real!)
4. **Demo to investors** (book meetings)
5. **Partner with universities** (pilot programs)

---

## 📞 Need Help?

**Vercel Docs:** https://vercel.com/docs  
**Vercel Support:** support@vercel.com  
**Community:** https://github.com/vercel/vercel/discussions

**Azora Specific:**
- Check `/workspace/services/azora-onboarding/README.md`
- Review server logs in Vercel dashboard
- Test locally first: `npm start`

---

**🌍 The organism is ready to go public. Deploy it and let it breathe! 🚀**

---

**© 2025 Azora ES (Pty) Ltd.**

*From Local to Global in Minutes - Powered by Vercel*
