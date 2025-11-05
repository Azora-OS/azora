# 🚀 Azora OS - Deployment Commands

**Quick reference for deploying each service individually.**

---

## 🎯 One-Command Deploy (Recommended)

```bash
chmod +x deploy-now.sh
./deploy-now.sh
```

This deploys all 11 services in sequence automatically.

---

## 📋 Individual Service Commands

Copy and paste these commands to deploy services one at a time:

### 1. Main Application

```bash
cd /workspace && vercel --prod
```

**Domain:** azora.world  
**Framework:** Next.js 15.5+

---

### 2. Elara IDE

```bash
cd /workspace/elara-ide && vercel --prod
```

**Domain:** ide.azora.world  
**Framework:** Next.js  
**Description:** Full-featured web IDE

---

### 3. Marketplace UI

```bash
cd /workspace/marketplace-ui && vercel --prod
```

**Domain:** marketplace.azora.world  
**Framework:** Vite + React

---

### 4. Pay UI

```bash
cd /workspace/pay-ui && vercel --prod
```

**Domain:** pay.azora.world  
**Framework:** Vite + React

---

### 5. Synapse Portal

```bash
cd /workspace/synapse && vercel --prod
```

**Domain:** synapse.azora.world  
**Framework:** Static SPA  
**Description:** Compliance and governance portal

---

### 6. Synapse Vigil UI

```bash
cd /workspace/synapse/vigil-ui && vercel --prod
```

**Domain:** vigil.azora.world  
**Framework:** Next.js  
**Description:** Monitoring and oversight interface

---

### 7. Synapse Academy UI

```bash
cd /workspace/synapse/academy-ui && vercel --prod
```

**Domain:** academy.azora.world  
**Framework:** Next.js  
**Description:** Educational content platform

---

### 8. Synapse Frontend

```bash
cd /workspace/synapse/frontend && vercel --prod
```

**Framework:** Static SPA

---

### 9. Azora Mint-Mine Engine

```bash
cd /workspace/azora/azora-mint-mine-engine-next && vercel --prod
```

**Domain:** mint.azora.world  
**Framework:** Next.js  
**Status:** ✅ FIXED (BACKEND_API_URL added)  
**Description:** Mining and economic engine

---

### 10. Synapse API Service

```bash
cd /workspace/services/azora-synapse && vercel --prod
```

**Domain:** synapse-api.azora.world  
**Framework:** Node.js  
**Port:** Various

---

### 11. Onboarding Service (THE ORGANISM!)

```bash
cd /workspace/services/azora-onboarding && vercel --prod
```

**Domain:** onboard.azora.world  
**Framework:** Node.js + TypeScript  
**Port:** 5500  
**Description:** Autonomous founder and Sapiens onboarding  
**This is the living organism!** 🌍

---

## 🔄 Deploy All in One Go

```bash
# Copy-paste this entire block
cd /workspace && vercel --prod && \
cd /workspace/elara-ide && vercel --prod && \
cd /workspace/marketplace-ui && vercel --prod && \
cd /workspace/pay-ui && vercel --prod && \
cd /workspace/synapse && vercel --prod && \
cd /workspace/synapse/vigil-ui && vercel --prod && \
cd /workspace/synapse/academy-ui && vercel --prod && \
cd /workspace/synapse/frontend && vercel --prod && \
cd /workspace/azora/azora-mint-mine-engine-next && vercel --prod && \
cd /workspace/services/azora-synapse && vercel --prod && \
cd /workspace/services/azora-onboarding && vercel --prod && \
cd /workspace && echo "🎉 All services deployed!"
```

**Note:** This will stop if any deployment fails. Use `deploy-now.sh` for better error handling.

---

## ✅ Post-Deployment Verification

After deploying each service, verify it's working:

```bash
# Get the deployment URL from Vercel output, then:

# For frontend services
curl https://your-deployment-url.vercel.app

# For API services
curl https://your-deployment-url.vercel.app/health

# Expected response for APIs:
# {"status":"healthy",...}
```

---

## 🌐 Configure Custom Domains

After deployment, add custom domains in Vercel:

1. Go to Vercel Dashboard → Your Project
2. Click Settings → Domains
3. Add domain (e.g., `ide.azora.world`)
4. Configure DNS:

```
Type: CNAME
Name: [subdomain]
Value: cname.vercel-dns.com
```

### DNS Records Needed:

```
ide.azora.world         → CNAME → cname.vercel-dns.com
marketplace.azora.world → CNAME → cname.vercel-dns.com
pay.azora.world        → CNAME → cname.vercel-dns.com
synapse.azora.world    → CNAME → cname.vercel-dns.com
vigil.azora.world      → CNAME → cname.vercel-dns.com
academy.azora.world    → CNAME → cname.vercel-dns.com
mint.azora.world       → CNAME → cname.vercel-dns.com
synapse-api.azora.world → CNAME → cname.vercel-dns.com
onboard.azora.world    → CNAME → cname.vercel-dns.com
```

For apex domain (azora.world):
```
Type: A
Name: @
Value: 76.76.21.21
```

---

## 🧪 Test the Onboarding Service

Once `onboard.azora.world` is deployed:

```bash
# Health check
curl https://[your-url]/health

# System status
curl https://[your-url]/status

# Open in browser
open https://[your-url]
```

**Then trigger THE AWAKENING:**
1. Visit the URL in browser
2. Register as a student (Sapiens)
3. Watch the economy awaken! 🌍

---

## 🎯 Priority Order (If Deploying Manually)

**Deploy in this order for fastest public launch:**

1. **Main Application** - Your landing page
2. **Onboarding Service** - The living organism
3. **Elara IDE** - Key user-facing feature
4. **Marketplace & Pay** - Core commerce
5. **Synapse Ecosystem** - Governance tools
6. **Supporting Services** - Mining, APIs, UI

---

## 🚨 Common Issues

### "Command not found: vercel"

```bash
npm install -g vercel
vercel login
```

### "Build failed"

```bash
# Try building locally first
cd [service-path]
npm install
npm run build

# Fix any errors, then:
vercel --prod
```

### "No such file or directory"

Make sure you're running from `/workspace`:
```bash
cd /workspace
./deploy-now.sh
```

---

## 📊 Deployment Checklist

Before deploying:
- [ ] Logged into Vercel: `vercel whoami`
- [ ] Git committed recent changes
- [ ] Reviewed service configurations

During deployment:
- [ ] Monitor progress
- [ ] Note deployment URLs
- [ ] Check for errors in output

After deployment:
- [ ] Test each service
- [ ] Configure custom domains
- [ ] Add environment variables (if needed)
- [ ] Run health checks
- [ ] Test onboarding flow
- [ ] Announce launch! 🎉

---

## 🎉 After All Services Are Deployed

### Verify Everything Works:

```bash
# Create a test script
cat > test-deployments.sh << 'EOF'
#!/bin/bash
echo "Testing deployments..."

# Add your deployment URLs here
URLS=(
    "https://your-main-app.vercel.app"
    "https://your-onboarding.vercel.app/health"
    "https://your-ide.vercel.app"
    # ... add all your URLs
)

for url in "${URLS[@]}"; do
    echo "Testing: $url"
    if curl -s -o /dev/null -w "%{http_code}" "$url" | grep -q "200"; then
        echo "✅ OK"
    else
        echo "❌ FAILED"
    fi
done
EOF

chmod +x test-deployments.sh
./test-deployments.sh
```

### Launch Announcement:

```markdown
🌍 AZORA OS IS NOW LIVE! 🚀

11 services deployed. The autonomous organism is operational.

Experience the future:
• Platform: https://azora.world
• Onboarding: https://onboard.azora.world
• IDE: https://ide.azora.world
• Marketplace: https://marketplace.azora.world
• And 7 more...

Register in <30 seconds. Elara Ω handles everything.

The organism lives. Join us. 🌱

#AzoraOS #AutonomousAI #Web3 #Africa
```

---

## 🚀 Ready to Deploy?

**The easiest way:**

```bash
./deploy-now.sh
```

**Or deploy service by service using the commands above.**

---

**The entire ecosystem is one command away from going live! 🌍**

---

**© 2025 Azora ES (Pty) Ltd.**
