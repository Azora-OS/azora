# Quick Start Deployment Guide

## 🚀 Get Live in 3 Days

Follow these exact steps to deploy and start generating revenue.

---

## Day 1: Infrastructure Setup

### Step 1: Create AWS Account
```bash
# Go to https://aws.amazon.com
# Sign up for free tier
# Create IAM user with programmatic access
```

### Step 2: Create RDS Database
```bash
# AWS Console → RDS → Create Database
# Engine: PostgreSQL 14
# Instance: db.t3.micro (free tier)
# Storage: 20GB
# Multi-AZ: No (for now)
# Public accessibility: Yes
# Database name: elara_incubator

# Save connection string:
# postgresql://user:password@host:5432/elara_incubator
```

### Step 3: Create Stripe Account
```bash
# Go to https://stripe.com
# Sign up for business account
# Verify email
# Get live API keys:
# - Publishable Key: pk_live_...
# - Secret Key: sk_live_...
```

### Step 4: Deploy Backend

```bash
# Clone repository
git clone <repo-url>
cd services/elara-incubator

# Create .env file
cat > .env << EOF
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://user:password@host:5432/elara_incubator
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
JWT_SECRET=$(openssl rand -base64 32)
JWT_EXPIRY=24h
EOF

# Install dependencies
npm install

# Build
npm run build

# Run migrations
npm run migrate

# Deploy to Heroku (or AWS)
# Option A: Heroku
heroku create elara-incubator-api
git push heroku main

# Option B: AWS Elastic Beanstalk
eb init -p node.js-18 elara-incubator
eb create elara-incubator-env
eb deploy
```

### Step 5: Deploy Frontend

```bash
# Go to frontend directory
cd apps/business-incubator

# Create .env.local
cat > .env.local << EOF
NEXT_PUBLIC_API_URL=https://api.elara-incubator.com
NEXT_PUBLIC_STRIPE_KEY=pk_live_...
EOF

# Build
npm run build

# Deploy to Vercel
npm install -g vercel
vercel --prod

# Or deploy to S3 + CloudFront
aws s3 sync out/ s3://elara-incubator-web
aws cloudfront create-invalidation --distribution-id ID --paths "/*"
```

---

## Day 2: Testing & Verification

### Step 1: Test Backend

```bash
# Health check
curl https://api.elara-incubator.com/health

# Create test business
curl -X POST https://api.elara-incubator.com/api/businesses \
  -H "Authorization: Bearer <test-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "businessName": "Test Business",
    "businessType": "e-commerce",
    "templateId": "template-1"
  }'

# Test payment
curl -X POST https://api.elara-incubator.com/api/payments \
  -H "Authorization: Bearer <test-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "businessId": "business-123",
    "amount": 100,
    "type": "revenue",
    "paymentMethod": "stripe"
  }'
```

### Step 2: Test Frontend

```bash
# Visit https://elara-incubator.com
# Test sign-up flow
# Test business creation
# Test payment processing
# Verify dashboard displays correctly
```

### Step 3: Test Payment Processing

```bash
# Use Stripe test card: 4242 4242 4242 4242
# Expiry: 12/25
# CVC: 123

# Process test payment
# Verify Citadel Fund allocation (10%)
# Check payment history
# Verify receipts
```

### Step 4: Configure Monitoring

```bash
# Set up CloudWatch
aws cloudwatch put-metric-alarm \
  --alarm-name api-errors \
  --alarm-description "Alert on API errors" \
  --metric-name Errors \
  --namespace AWS/Lambda \
  --statistic Sum \
  --period 300 \
  --threshold 10 \
  --comparison-operator GreaterThanThreshold

# Set up error tracking (Sentry)
npm install @sentry/node
# Configure in backend
```

---

## Day 3: Marketing & Launch

### Step 1: Create Landing Page

```bash
# Create simple landing page
# Use template from GO-TO-MARKET-STRATEGY.md
# Deploy to https://elara-incubator.com

# Key sections:
# - Hero with CTA
# - How it works
# - Features
# - Pricing
# - FAQ
# - Sign up form
```

### Step 2: Set Up Email

```bash
# Create Gmail account for support
# support@elara-incubator.com

# Set up email sequences
# Welcome email
# Social proof email
# FOMO email
# Launch email

# Use SendGrid or Mailgun for transactional emails
npm install @sendgrid/mail
```

### Step 3: Social Media

```bash
# Create accounts
# - Twitter: @ElaraIncubator
# - LinkedIn: Elara Incubator
# - Facebook: Elara Incubator

# Schedule posts
# - Launch announcement
# - How it works
# - Success stories
# - Community impact
```

### Step 4: Launch

```bash
# Send launch email to warm contacts
# Post on social media
# Submit to Product Hunt
# Reach out to 50 warm contacts

# Monitor:
# - Sign-ups
# - Conversions
# - Revenue
# - Errors
```

---

## Verification Checklist

### Backend
- [ ] API responding at `/health`
- [ ] Database connected
- [ ] Stripe integration working
- [ ] Payment processing successful
- [ ] Revenue allocation correct (90/10)
- [ ] Audit logging working
- [ ] Error handling working

### Frontend
- [ ] Landing page loads
- [ ] Sign-up flow works
- [ ] Business creation works
- [ ] Payment flow works
- [ ] Dashboard displays correctly
- [ ] Mobile responsive

### Payment
- [ ] Test payment succeeds
- [ ] Citadel Fund allocation correct
- [ ] Receipt generated
- [ ] Payment history tracked
- [ ] Webhook processing works

### Monitoring
- [ ] CloudWatch configured
- [ ] Error tracking working
- [ ] Logs being collected
- [ ] Alerts configured

---

## Environment Variables

### Backend (.env)
```
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://user:password@host:5432/elara_incubator
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
JWT_SECRET=<random-secret>
JWT_EXPIRY=24h
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=<sendgrid-api-key>
ELARA_AI_API_KEY=<api-key>
ELARA_AI_BASE_URL=https://api.elara.ai
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=https://api.elara-incubator.com
NEXT_PUBLIC_STRIPE_KEY=pk_live_...
NEXT_PUBLIC_GA_ID=<google-analytics-id>
```

---

## Troubleshooting

### Database Connection Failed
```bash
# Check connection string
psql postgresql://user:password@host:5432/elara_incubator

# If fails, verify:
# - Host is correct
# - Port is 5432
# - Database exists
# - User has permissions
```

### Payment Processing Failed
```bash
# Check Stripe keys
# Verify webhook endpoint
# Check payment intent creation
# Review Stripe dashboard for errors
```

### Frontend Not Loading
```bash
# Check API URL in .env.local
# Verify CORS headers
# Check CloudFront cache
# Clear browser cache
```

### High Error Rate
```bash
# Check CloudWatch logs
# Review error tracking (Sentry)
# Check database performance
# Review API response times
```

---

## Monitoring Commands

### Check API Health
```bash
curl https://api.elara-incubator.com/health
```

### View Logs
```bash
# Heroku
heroku logs --tail

# AWS
aws logs tail /aws/lambda/elara-incubator --follow

# Local
tail -f logs/app.log
```

### Check Database
```bash
psql postgresql://user:password@host:5432/elara_incubator

# List tables
\dt

# Check business count
SELECT COUNT(*) FROM businesses;

# Check revenue
SELECT SUM(amount) FROM revenue_transactions;
```

### Monitor Stripe
```bash
# Go to https://dashboard.stripe.com
# Check recent payments
# Review payment success rate
# Monitor payout schedule
```

---

## First Revenue Checklist

- [ ] Platform deployed
- [ ] Payment processing verified
- [ ] Landing page live
- [ ] Email sequences ready
- [ ] Social media posts scheduled
- [ ] Warm contacts identified (50+)
- [ ] Launch email drafted
- [ ] Monitoring configured
- [ ] Support email set up
- [ ] Analytics configured

---

## Success Metrics (First Week)

| Metric | Target |
|--------|--------|
| Visits | 500+ |
| Sign-ups | 50+ |
| Paid Conversions | 5+ |
| Revenue | $500+ |
| Citadel Fund | $50+ |
| Uptime | 99%+ |

---

## Next Steps After Launch

### Day 1-7
- Monitor metrics daily
- Respond to support tickets
- Fix any bugs
- Collect user feedback

### Week 2
- Analyze conversion funnel
- Optimize onboarding
- A/B test landing page
- Scale marketing spend

### Week 3-4
- Reach 100+ sign-ups
- Process 20+ payments
- Generate $5K+ revenue
- Plan premium features

---

## Support

### During Launch
- Slack: #launch-support
- Email: support@elara-incubator.com
- Phone: [Your phone]

### Resources
- API Docs: `API-DOCUMENTATION.md`
- Deployment: `DEPLOYMENT-CHECKLIST.md`
- Go-to-Market: `GO-TO-MARKET-STRATEGY.md`
- Revenue Model: `REVENUE-MODEL.md`

---

## Timeline

```
Day 1: Infrastructure (3-4 hours)
Day 2: Testing & Verification (2-3 hours)
Day 3: Marketing & Launch (2-3 hours)

Total: 7-10 hours to first revenue
```

---

**Status**: Ready to Deploy
**Date**: 2024-11-19
**Version**: 1.0

**Let's go live.** 🚀
