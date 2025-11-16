# 🚀 Start Cleanup - Quick Guide

## Run This Right Now!

### Step 1: Run the Audit
```bash
# Make script executable (if on Unix/Mac)
chmod +x scripts/pre-launch-audit.js

# Run the audit
node scripts/pre-launch-audit.js
```

### Step 2: Review Results
The audit will show you:
- 🚨 **Critical Issues** - MUST fix before launch
- ⚠️ **Warnings** - Should fix for best results
- ℹ️ **Info** - Good to know

### Step 3: Fix Critical Issues First

#### If you see: "Found test keys in .env"
```bash
# Edit .env file
# Replace all test_ keys with production keys
# Example:
# STRIPE_SECRET_KEY=sk_test_xxx  →  STRIPE_SECRET_KEY=sk_live_xxx
```

#### If you see: "Missing required environment variable"
```bash
# Copy example and fill in
cp .env.example .env

# Add missing variables:
DATABASE_URL=postgresql://user:pass@localhost:5432/azora
JWT_SECRET=your-super-secret-key-min-32-chars
STRIPE_SECRET_KEY=sk_test_your_key
OPENAI_API_KEY=sk-your-openai-key
```

#### If you see: "Security vulnerabilities"
```bash
# Fix automatically
npm audit fix

# If that doesn't work, fix manually
npm audit fix --force
```

### Step 4: Clean Up Code

#### Remove console.log statements
```bash
# Find all console.log
grep -r "console.log" services/ apps/ packages/

# Remove them manually or use:
# (Be careful - review before running!)
find services/ apps/ packages/ -type f \( -name "*.ts" -o -name "*.js" \) -exec sed -i '/console\.log/d' {} +
```

#### Remove TODO/FIXME comments
```bash
# Find all TODOs
grep -r "TODO\|FIXME" services/ apps/ packages/

# Review and either:
# 1. Fix the issue
# 2. Create a GitHub issue
# 3. Remove if not important
```

### Step 5: Test Everything

```bash
# 1. Database
npm run db:migrate
npm run db:seed

# 2. Run tests
npm run test

# 3. Start services
npm run dev

# 4. Test in browser
# - http://localhost:3000 (Student Portal)
# - http://localhost:4000/api/health (API)
```

### Step 6: Verify Core Flows

#### Test User Registration
1. Go to signup page
2. Create account
3. Verify email works
4. Login successfully

#### Test Course Enrollment
1. Browse courses
2. Click enroll
3. Verify enrollment shows in dashboard

#### Test AI Family Chat
1. Go to /family
2. Click on Themba
3. Ask: "How's your mom?"
4. Verify response mentions Elara

#### Test Payment (Test Mode)
1. Try to purchase course
2. Use Stripe test card: 4242 4242 4242 4242
3. Verify payment succeeds
4. Check receipt generated

---

## 📋 Quick Checklist

### Week 1 (This Week!)
- [ ] Run audit script
- [ ] Fix critical issues
- [ ] Clean up code (remove mocks, TODOs)
- [ ] Test core flows
- [ ] Commit changes

### Week 2
- [ ] Deploy AI Family chat
- [ ] Seed 5 demo courses
- [ ] Test all user journeys
- [ ] Fix bugs found

### Week 3
- [ ] Optimize performance
- [ ] Fix responsive issues
- [ ] Improve UX
- [ ] Polish UI

### Week 4
- [ ] Switch to live Stripe keys
- [ ] Recruit 50 beta users
- [ ] Collect feedback
- [ ] Fix critical bugs

### Week 5 (Launch!)
- [ ] Final security audit
- [ ] Deploy to production
- [ ] Launch announcement
- [ ] Monitor & support

---

## 🎯 Focus Areas

### 1. Security (CRITICAL)
- Strong passwords/secrets
- No test keys in production
- HTTPS everywhere
- Rate limiting enabled

### 2. Performance (HIGH)
- Page load < 2s
- API response < 100ms
- Database queries optimized
- Caching enabled

### 3. User Experience (HIGH)
- Mobile responsive
- Clear error messages
- Smooth onboarding
- Fast interactions

### 4. Content (MEDIUM)
- 5+ quality courses
- 10+ job listings
- AI Family working
- Demo videos

---

## 🚨 Red Flags - Stop If You See

1. **Payment processing broken** - Money is critical!
2. **Users can't login** - Authentication must work
3. **Database errors** - Data integrity is key
4. **Security vulnerabilities** - Don't launch with holes
5. **Site crashes** - Stability is essential

---

## 💡 Pro Tips

### Use Git Branches
```bash
# Create cleanup branch
git checkout -b cleanup/pre-launch

# Make changes, commit often
git add .
git commit -m "fix: remove mock data from production"

# When done, merge to main
git checkout main
git merge cleanup/pre-launch
```

### Test Locally First
```bash
# Always test locally before deploying
npm run dev

# Run tests
npm run test

# Check for errors
npm run lint
```

### Keep Backups
```bash
# Backup database before migrations
pg_dump azora > backup-$(date +%Y%m%d).sql

# Backup .env file
cp .env .env.backup
```

---

## 📞 Need Help?

### Documentation
- [Pre-Launch Cleanup](./PRE-LAUNCH-CLEANUP.md) - Full checklist
- [December Launch Plan](./DECEMBER-LAUNCH-PLAN.md) - 8-week roadmap
- [Developer Guide](./docs/DEVELOPER-GUIDE.md) - Technical docs

### Common Issues
- **Database connection fails:** Check DATABASE_URL in .env
- **Stripe errors:** Verify API keys are correct
- **Build fails:** Run `npm install` again
- **Tests fail:** Check test database is running

---

## 🎉 You Got This!

**Current Status:** 60% ready (7 services, complete database)  
**Target:** 100% ready by December 15  
**Time:** 8 weeks  
**Goal:** $5K-$15K MRR

**Next Action:** Run the audit script NOW! 👇

```bash
node scripts/pre-launch-audit.js
```

---

**"Ngiyakwazi ngoba sikwazi" - "I can because we can"**

Let's clean up and launch! 🚀
