# 🚀 Azora Production Deployment Guide

**Last Updated:** December 3, 2025  
**Status:** Production Ready  
**Estimated Deployment Time:** 4-8 hours

---

## Prerequisites

### Required Accounts & API Keys

1. **Stripe** - Payment processing
   - [ ] Stripe account created
   - [ ] Live API keys obtained
   - [ ] Webhook endpoint configured

2. **Blockchain Infrastructure**
   - [ ] Ethereum/Polygon RPC provider (Infura, Alchemy, or QuickNode)
   - [ ] Deployment wallet with ETH for gas
   - [ ] Smart contracts deployed

3. **Database**
   - [ ] PostgreSQL database (Railway, Supabase, or AWS RDS)
   - [ ] Redis instance (Upstash or Railway)

4. **AI Services**
   - [ ] OpenAI API key
   - [ ] Anthropic API key (optional)
   - [ ] Google Gemini key (optional)

5. **Cloud Storage**
   - [ ] AWS S3 bucket OR Google Cloud Storage
   - [ ] Access credentials configured

6. **Monitoring**
   - [ ] Sentry account (error tracking)
   - [ ] Datadog/New Relic (optional - performance monitoring)

---

## Phase 1: Local Setup & Testing (1 hour)

### Step 1: Install Dependencies

```bash
cd "c:\Users\Azora Sapiens\Documents\azora"
npm install
npx prisma generate
```

### Step 2: Run Database Migrations

```bash
# Create production database migration
npx prisma migrate dev --name production_launch_v1

# Apply to production database
DATABASE_URL="your-production-db-url" npx prisma migrate deploy
```

### Step 3: Test Admin Secrets UI Locally

```bash
# Start admin dashboard
cd services/admin-dashboard
npm install
npm run dev
```

Open `http://localhost:3000/secrets.html` and test:
- Master key authentication
- Add/edit/delete secrets
- Bulk import from `.env.production.example`
- Export .env file

---

## Phase 2: Smart Contract Deployment (1-2 hours)

### Step 1: Deploy Contracts

```bash
cd blockchain/contracts

# Compile contracts
npx hardhat compile

# Deploy to testnet first (Goerli/Mumbai)
npx hardhat run scripts/deploy.js --network goerli

# Deploy to mainnet (Ethereum/Polygon)
npx hardhat run scripts/deploy.js --network mainnet
```

**Record Contract Addresses:**
```
AZR_TOKEN_CONTRACT=0x...
STAKING_CONTRACT=0x...
GOVERNANCE_CONTRACT=0x...
NFT_CERTIFICATE_CONTRACT=0x...
CITADEL_FUND_CONTRACT=0x...
```

### Step 2: Verify Contracts on Etherscan

```bash
npx hardhat verify --network mainnet <CONTRACT_ADDRESS> <CONSTRUCTOR_ARGS>
```

---

## Phase 3: Configure Production Secrets (1 hour)

### Option A: Using Admin UI (Recommended)

1. Deploy admin dashboard to production
2. Navigate to `https://yourdomain.com/admin/secrets.html`
3. Login with `ADMIN_MASTER_KEY`
4. Use bulk import with `.env.production.example`
5. Update all placeholder values with real credentials
6. Validate required secrets

### Option B: Using GitHub Secrets

Go to GitHub repo → Settings → Secrets and variables → Actions

**Add these secrets:**

#### Security
```
JWT_SECRET=<generate with: openssl rand -hex 64>
JWT_REFRESH_SECRET=<generate with: openssl rand -hex 64>
ENCRYPTION_KEY=<generate with: openssl rand -hex 32>
ADMIN_MASTER_KEY=<strong password for admin UI>
SESSION_SECRET=<generate with: openssl rand -hex 32>
```

#### Stripe
```
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

#### Database
```
DATABASE_URL=postgresql://user:password@host:5432/azora_prod?sslmode=require
REDIS_URL=redis://default:password@host:6379
```

#### Blockchain
```
BLOCKCHAIN_RPC_URL=https://mainnet.infura.io/v3/YOUR_PROJECT_ID
BLOCKCHAIN_RPC_URL_FALLBACK=https://polygon-rpc.com
BLOCKCHAIN_PRIVATE_KEY=0x...
AZR_TOKEN_CONTRACT=0x...
STAKING_CONTRACT=0x...
GOVERNANCE_CONTRACT=0x...
NFT_CERTIFICATE_CONTRACT=0x...
CITADEL_FUND_CONTRACT=0x...
```

#### AI Services
```
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_GEMINI_KEY=...
```

#### Cloud Storage
```
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_S3_BUCKET=azora-production
AWS_REGION=us-east-1
```

#### Email
```
SENDGRID_API_KEY=SG...
EMAIL_FROM=noreply@azora.education
```

#### Monitoring
```
SENTRY_DSN=https://...@sentry.io/...
SENTRY_ENVIRONMENT=production
DATADOG_API_KEY=... (optional)
```

---

## Phase 4: Build & Deploy Services (2 hours)

### Option A: Docker Compose (Recommended for VPS)

```bash
# Build all services
docker-compose -f docker-compose.prod.yml build

# Push to registry (if using external registry)
docker-compose -f docker-compose.prod.yml push

# Deploy on production server
docker-compose -f docker-compose.prod.yml up -d

# Check logs
docker-compose -f docker-compose.prod.yml logs -f
```

### Option B: Railway Deployment

1. Install Railway CLI: `npm i -g @railway/cli`
2. Login: `railway login`
3. Create project: `railway init`
4. Deploy each service:

```bash
# Deploy billing service
cd services/billing-service
railway up

# Deploy blockchain service
cd ../azora-blockchain
railway up

# Deploy proof-of-value
cd ../proof-of-value
railway up

# Deploy admin dashboard
cd ../admin-dashboard
railway up
```

5. Configure custom domains in Railway dashboard

### Option C: Kubernetes

```bash
# Apply Kubernetes manifests
kubectl apply -f infrastructure/kubernetes/

# Check deployment status
kubectl get pods -n azora-prod

# Check logs
kubectl logs -f deployment/billing-service -n azora-prod
```

---

## Phase 5: Configure Stripe Webhooks (15 mins)

1. Go to Stripe Dashboard → Developers → Webhooks
2. Click "Add endpoint"
3. Enter URL: `https://api.azora.education/webhooks/stripe`
4. Select events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.succeeded`
   - `charge.refunded`
   - `invoice.payment_succeeded`
   - `subscription.created`
   - `subscription.updated`
   - `subscription.deleted`
   - `customer.created`
   - `customer.updated`
   - `payout.paid`
   - `payout.failed`

5. Copy webhook signing secret and add to `STRIPE_WEBHOOK_SECRET`

### Test Webhook

```bash
# Install Stripe CLI
scoop install stripe

# Login
stripe login

# Forward webhooks to local/production
stripe listen --forward-to https://api.azora.education/webhooks/stripe

# Trigger test event
stripe trigger payment_intent.succeeded
```

---

## Phase 6: Verification & Testing (1-2 hours)

### Health Checks

```bash
# Check all services
curl https://api.azora.education/health
curl https://billing.azora.education/health
curl https://blockchain.azora.education/health
curl https://pov.azora.education/health
```

### End-to-End Tests

#### Test 1: Payment Flow
1. Create test course on platform
2. Purchase with Stripe test card: `4242 4242 4242 4242`
3. Verify payment success webhook received
4. Check database for:
   - Transaction record
   - CitadelFund allocation (10%)
   - Enrollment created
5. Verify user has access to course

#### Test 2: Blockchain Integration
1. Trigger value creation event (e.g., complete course)
2. Verify proof-of-value record created
3. Check token minting transaction on blockchain explorer
4. Verify user balance updated

#### Test 3: Admin Dashboard
1. Access admin secrets UI
2. Verify authentication works
3. Test CRUD operations on secrets
4. Export .env and verify format

### Load Testing

```bash
# Install k6
scoop install k6

# Run load test
k6 run tests/load/webhook-test.js
```

**Target Metrics:**
- 99th percentile response time < 500ms
- Error rate < 0.1%
- Throughput: 1000+ requests/second

---

## Phase 7: Monitoring Setup (30 mins)

### Sentry Error Tracking

1. Go to Sentry dashboard
2. Create new project for each service
3. Copy DSN to environment variables
4. Test error reporting:
   ```bash
   curl -X POST https://api.azora.education/test/sentry-error
   ```

### Datadog/Grafana Dashboards

**Key Metrics to Monitor:**
- Service health (uptime, response times)
- Database query performance
- Blockchain transaction status
- Stripe webhook success rate
- Token minting rate
- CitadelFund balance
- Active user count
- Error rates by service

**Alerts to Configure:**
- Service down for > 1 minute
- Error rate > 1%
- Response time > 1 second (p99)
- Database connection pool exhausted
- Blockchain RPC failure
- Stripe webhook signature mismatch

### Log Aggregation

Configure centralized logging:
- CloudWatch (AWS)
- Google Cloud Logging
- Elasticsearch + Kibana
- Datadog Logs

**Retention Policies:**
- Error logs: 90 days
- Access logs: 30 days
- Debug logs: 7 days

---

## Phase 8: DNS & SSL Configuration (30 mins)

### Domain Setup

Configure DNS records:
```
api.azora.education       → Load balancer IP
billing.azora.education   → Billing service IP
blockchain.azora.education → Blockchain service IP
admin.azora.education     → Admin dashboard IP
```

### SSL Certificates

#### Using Let's Encrypt (Free)

```bash
# Install certbot
sudo apt-get install certbot

# Generate certificates
sudo certbot certonly --standalone -d api.azora.education
sudo certbot certonly --standalone -d billing.azora.education
sudo certbot certonly --standalone -d blockchain.azora.education
sudo certbot certonly --standalone -d admin.azora.education

# Auto-renewal
sudo certbot renew --dry-run
```

#### Using Cloudflare (Recommended)

1. Add domain to Cloudflare
2. Update nameservers
3. Enable SSL (Full Strict)
4. Enable caching for static assets
5. Configure firewall rules
6. Enable DDoS protection

---

## Phase 9: Security Hardening (30 mins)

### API Rate Limiting

Configure rate limits in nginx/load balancer:
```nginx
limit_req_zone $binary_remote_addr zone=api:10m rate=100r/s;

server {
    location /api/ {
        limit_req zone=api burst=200 nodelay;
    }
}
```

### Firewall Rules

Only allow:
- HTTPS (443) from anywhere
- SSH (22) from known IPs
- Database (5432) from app servers only
- Redis (6379) from app servers only

### Database Security

- [ ] Enable SSL connections
- [ ] Use connection pooling
- [ ] Set up read replicas
- [ ] Configure automated backups (daily)
- [ ] Test backup restoration

### Secret Rotation

Schedule quarterly rotation:
- [ ] JWT secrets
- [ ] Encryption keys
- [ ] API keys
- [ ] Database passwords

---

## Phase 10: Go Live! 🚀 (15 mins)

### Pre-Launch Checklist

- [ ] All health checks passing
- [ ] Database migrations applied
- [ ] Smart contracts deployed and verified
- [ ] All secrets configured
- [ ] Stripe webhooks configured and tested
- [ ] SSL certificates installed
- [ ] Monitoring dashboards configured
- [ ] Error tracking enabled
- [ ] Backups configured
- [ ] Team notified

### Launch Steps

1. **Switch DNS** to production servers
2. **Monitor dashboards** closely for first hour
3. **Watch error tracking** for any issues
4. **Test critical flows** manually
5. **Announce launch** to users
6. **Celebrate!** 🎉

### Post-Launch Monitoring

**First 24 Hours:**
- Check dashboards every 30 minutes
- Review all error logs
- Monitor transaction success rates
- Verify CitadelFund allocations
- Watch blockchain transaction status

**First Week:**
- Daily performance reviews
- User feedback analysis
- Bug triage and hot fixes
- Database optimization
- Cost analysis

---

## Rollback Procedure

If critical issues arise:

### Step 1: Immediate Actions
```bash
# Stop all services
docker-compose -f docker-compose.prod.yml down

# OR in Kubernetes
kubectl scale deployment --replicas=0 --all -n azora-prod
```

### Step 2: Switch to Maintenance Mode
- Display maintenance page
- Notify users via email/social media

### Step 3: Investigate & Fix
- Check error logs in Sentry
- Review database state
- Verify smart contract interactions
- Test fixes in staging

### Step 4: Redeploy
```bash
# Apply fixes
git commit -m "hotfix: issue description"
git push

# Redeploy services
docker-compose -f docker-compose.prod.yml up -d

# OR
railway up
```

---

## Support & Troubleshooting

### Common Issues

**Issue:** Stripe webhook signature verification fails
**Solution:** Verify `STRIPE_WEBHOOK_SECRET` matches Stripe dashboard

**Issue:** Blockchain transactions fail
**Solution:** Check wallet has sufficient ETH for gas, verify RPC URL

**Issue:** Database connection timeout
**Solution:** Check connection pool settings, verify DATABASE_URL

**Issue:** Admin UI won't authenticate
**Solution:** Verify `ADMIN_MASTER_KEY` environment variable set

### Getting Help

- **Documentation:** See `LAUNCH-PREPARATION-COMPLETE.md`
- **Logs:** Check service logs for error details
- **Monitoring:** Review Sentry/Datadog for stack traces
- **Community:** Open GitHub issue with error details

---

## Maintenance Schedule

### Daily
- Review error logs
- Check service health
- Monitor transaction success rates

### Weekly
- Database backup verification
- Performance optimization review
- Security scan
- Cost analysis

### Monthly
- Dependency updates
- Security patches
- Database index optimization
- Load testing

### Quarterly
- Secret rotation
- Security audit
- Disaster recovery drill
- Performance review

---

## Success Metrics

### Technical KPIs
- **Uptime:** 99.9%+
- **Response Time (p99):** < 500ms
- **Error Rate:** < 0.1%
- **Webhook Success Rate:** > 99%
- **Blockchain Transaction Success:** > 95%

### Business KPIs
- **Daily Active Users**
- **Course Enrollments**
- **Revenue (ZAR)**
- **CitadelFund Balance**
- **Token Circulation**
- **Staking Participation**

---

## Next Steps (Post-Launch)

1. **Monitor & Optimize** - First month focus on stability
2. **User Feedback** - Collect and prioritize feature requests
3. **Marketing Campaign** - Drive user acquisition
4. **Mobile Apps** - Complete iOS/Android builds
5. **Service Mesh** - Deploy Istio for advanced observability
6. **Constitutional AI** - Upgrade from keyword filtering
7. **Analytics Dashboard** - Real-time founder metrics
8. **Investor Portal** - Transparent financial reporting

---

**🎉 Congratulations on launching Azora!**

Built with ❤️ by the Azora team  
For support: support@azora.education
