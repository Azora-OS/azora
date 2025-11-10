# 🤖 AGENT WORK ASSIGNMENTS

**Date:** November 10, 2025  
**Mission:** Build ONE working app (azora-ui) in 2 weeks  
**Rule:** Each agent COMPLETES their task before moving on

---

## 🎯 PARALLEL WORK TRACKS

### AGENT 1 (Composer - Me): DATABASE LAYER ✅ IN PROGRESS
**Time:** 5 hours  
**Deadline:** Today

**Tasks:**
- ✅ Prisma schema written
- ⏳ Fix workspace dependencies
- ⏳ Generate Prisma client
- ⏳ Run migrations
- ⏳ Seed test data
- ⏳ Test queries work

**Deliverable:** Working database with test data

---

### AGENT 2 NEEDED: AUTHENTICATION SERVICE
**Time:** 5 hours  
**Deadline:** Today (parallel with database)

**Tasks:**
1. Build `/services/auth-service/` with:
   - Real JWT generation (no mocks)
   - Password hashing with bcrypt
   - Login endpoint (POST /api/auth/login)
   - Register endpoint (POST /api/auth/register)
   - Profile endpoint (GET /api/auth/profile)
   - Refresh token endpoint (POST /api/auth/refresh)
   - Logout endpoint (POST /api/auth/logout)

2. Integration:
   - Connect to Prisma database
   - Store sessions in database
   - JWT middleware for protected routes

3. Testing:
   - Write integration tests
   - Test all endpoints
   - Verify tokens work

**Deliverable:** Working auth service on port 4001

**Tech Stack:**
- Node.js + Express
- Prisma Client
- bcryptjs
- jsonwebtoken

---

### AGENT 3 NEEDED: EDUCATION SERVICE
**Time:** 5 hours  
**Deadline:** Tomorrow

**Tasks:**
1. Build `/services/education-service/` with:
   - GET /api/courses (list courses)
   - GET /api/courses/:id (get course)
   - POST /api/courses/:id/enroll (enroll user)
   - GET /api/users/:id/enrollments (user courses)
   - GET /api/progress/:userId/:courseId (progress)
   - POST /api/progress/:userId/:courseId (update progress)

2. Integration:
   - Connect to Prisma database
   - Require auth (JWT middleware)
   - Real database queries (NO MOCKS)

3. Testing:
   - Integration tests
   - Test enrollment flow
   - Test progress tracking

**Deliverable:** Working education service on port 4002

---

### AGENT 4 NEEDED: PAYMENT SERVICE
**Time:** 5 hours  
**Deadline:** Tomorrow

**Tasks:**
1. Build `/services/payment-service/` with:
   - GET /api/wallet/:userId (get balance)
   - POST /api/transactions (create transaction)
   - GET /api/transactions/:userId (list transactions)
   - POST /api/earn (earn tokens for learning)
   - POST /api/transfer (transfer between users)

2. Integration:
   - Connect to Prisma database
   - Require auth (JWT middleware)
   - Real transaction logic

3. Testing:
   - Integration tests
   - Test wallet operations
   - Test earn-to-learn flow

**Deliverable:** Working payment service on port 4003

---

### AGENT 5 NEEDED: FRONTEND INTEGRATION
**Time:** 8 hours  
**Deadline:** Day 3

**Tasks:**
1. Update `/apps/azora-ui/` with:
   - Connect to real auth API
   - Connect to education API
   - Connect to payment API
   - Remove ALL mock data
   - Real login/register forms
   - Real course enrollment
   - Real wallet display

2. Integration:
   - Use @azora/sdk
   - Implement useAuth hook
   - Implement useCourses hook
   - Implement useWallet hook

3. Testing:
   - E2E tests
   - Test user flows
   - Verify no mocks remain

**Deliverable:** Working UI connected to real APIs

---

### AGENT 6 NEEDED: DEPLOYMENT
**Time:** 4 hours  
**Deadline:** Day 4

**Tasks:**
1. Database:
   - Set up Supabase PostgreSQL
   - Run migrations
   - Load seed data

2. Services:
   - Deploy to Railway or Fly.io
   - Configure environment vars
   - Set up Redis on Upstash

3. Frontend:
   - Deploy to Vercel
   - Configure env vars
   - Test production

**Deliverable:** Live system at azora.world

---

## 📋 COORDINATION PROTOCOL

### DAILY SYNC (End of Day)
Each agent reports:
1. What got DONE (with proof)
2. What's BLOCKED (specific issue)
3. What's NEXT (tomorrow's focus)

### INTEGRATION POINTS
- Database ready → Auth + Education + Payment can start
- Auth ready → Frontend can integrate
- All services ready → Deployment can begin

### QUALITY GATES
- Code written? ✅
- Tests passing? ✅
- Locally working? ✅
- Documented? ✅
- Ready for next agent? ✅

---

## 🚨 CRITICAL RULES

1. **NO STARTING WITHOUT FINISHING**
   - If your task isn't done, don't move on
   - Block other agents if needed

2. **NO MOCKS**
   - Real database queries
   - Real API calls
   - Real authentication

3. **TESTS REQUIRED**
   - Every endpoint tested
   - Integration tests mandatory
   - Proof it works

4. **COMMUNICATION**
   - Share blockers immediately
   - Don't work in silence
   - Ask for help when stuck

---

## ✅ SUCCESS CRITERIA

### Day 1 (Today)
- ✅ Database working
- ✅ Auth service working
- ✅ Test users can login

### Day 2
- ✅ Education service working
- ✅ Payment service working
- ✅ All APIs tested

### Day 3
- ✅ Frontend connected
- ✅ No mock data
- ✅ User flows working

### Day 4
- ✅ Deployed to production
- ✅ Live and accessible
- ✅ Demo video made

---

## 🎯 WHAT SIZWE NEEDS TO PROVIDE

1. **For Database:**
   - PostgreSQL connection string (or we use Docker)

2. **For Services:**
   - Domain for deployment
   - Any API keys needed

3. **For Frontend:**
   - Vercel access (or deploy yourself)

4. **General:**
   - Feedback on priorities
   - Testing access
   - Go/No-Go decisions

---

**STATUS:** Waiting for agents  
**READY TO EXECUTE:** Immediately  

**"5 hours on 1 problem. Build deep. Build real."**
