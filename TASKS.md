# 🚀 Azora OS - Launch Tasks

**Goal:** Get to MVP launch ASAP  
**Status:** Foundation solid, need to complete critical features  
**Time Estimate:** 10-15 hours focused work

---

## 🔥 CRITICAL PATH (Must Do for Launch)

### Task 1: Complete Student Portal UI ⚡ PRIORITY 1
**Time:** 2-3 hours  
**Status:** 🔴 Not Started

**What to build:**
```
/apps/student-portal/app/
├── login/page.tsx          # Reuse auth UI
├── dashboard/page.tsx      # Welcome + course list
├── courses/page.tsx        # Browse all courses
├── courses/[id]/page.tsx   # Course details + enroll button
└── my-courses/page.tsx     # Enrolled courses
```

**Acceptance Criteria:**
- [ ] Login redirects to dashboard
- [ ] Dashboard shows enrolled courses (or "No courses yet")
- [ ] Can browse course catalog
- [ ] Can view course details
- [ ] Can click "Enroll" → triggers payment flow
- [ ] After payment, course appears in "My Courses"

**API Calls Needed:**
- `GET /api/courses` - list courses
- `GET /api/courses/:id` - course details
- `POST /api/enrollments` - enroll in course
- `GET /api/enrollments/:userId` - my courses

---

### Task 2: Complete Education Service APIs ⚡ PRIORITY 1
**Time:** 1-2 hours  
**Status:** 🟡 50% Done (structure exists, needs implementation)

**File:** `/services/azora-education/server.ts`

**APIs to implement:**
```typescript
// Already have structure, need to add:
GET  /api/courses              // List all courses
GET  /api/courses/:id          // Get course details
POST /api/enrollments          // Enroll student in course
GET  /api/enrollments/:userId  // Get user's enrollments
GET  /api/courses/:id/content  // Get course content/lessons
```

**Database Schema Needed:**
```sql
-- courses table
CREATE TABLE courses (
  id UUID PRIMARY KEY,
  title VARCHAR(255),
  description TEXT,
  price DECIMAL(10,2),
  instructor_id UUID,
  created_at TIMESTAMP
);

-- enrollments table
CREATE TABLE enrollments (
  id UUID PRIMARY KEY,
  user_id UUID,
  course_id UUID,
  enrolled_at TIMESTAMP,
  status VARCHAR(50)
);
```

**Acceptance Criteria:**
- [ ] Can fetch list of courses
- [ ] Can get single course details
- [ ] Can enroll user in course
- [ ] Can fetch user's enrolled courses
- [ ] Data persists in database

---

### Task 3: Fix API Gateway Routing ⚡ PRIORITY 2
**Time:** 1 hour  
**Status:** 🟡 60% Done (basic routing works)

**File:** `/services/api-gateway/index.js`

**What to fix:**
```javascript
// Add routes for education service
app.use('/api/courses', proxy('http://localhost:4002'));
app.use('/api/enrollments', proxy('http://localhost:4002'));

// Add routes for marketplace service
app.use('/api/jobs', proxy('http://localhost:4004'));
app.use('/api/applications', proxy('http://localhost:4004'));

// Configure CORS
app.use(cors({
  origin: ['http://localhost:3000', 'https://your-domain.com'],
  credentials: true
}));
```

**Acceptance Criteria:**
- [ ] Frontend can call `/api/courses` through gateway
- [ ] Frontend can call `/api/enrollments` through gateway
- [ ] CORS allows requests from student portal
- [ ] All services reachable through gateway

---

### Task 4: Seed Database with Sample Data ⚡ PRIORITY 2
**Time:** 30 minutes  
**Status:** 🔴 Not Started

**File:** `/services/azora-education/prisma/seed.ts`

**Sample data to add:**
```typescript
// 5-10 sample courses
const courses = [
  {
    title: "Introduction to Python",
    description: "Learn Python basics",
    price: 49.99,
    instructor_id: "instructor-1"
  },
  {
    title: "Web Development Bootcamp",
    description: "Full-stack web development",
    price: 99.99,
    instructor_id: "instructor-1"
  },
  // ... 3-8 more courses
];
```

**Acceptance Criteria:**
- [ ] Database has 5-10 sample courses
- [ ] Courses show up in student portal
- [ ] Can enroll in sample courses

---

### Task 5: Connect Payment to Enrollment ⚡ PRIORITY 2
**Time:** 1 hour  
**Status:** 🔴 Not Started

**What to build:**
```typescript
// In student portal: courses/[id]/page.tsx
const handleEnroll = async () => {
  // 1. Create payment intent
  const payment = await fetch('/api/payments/create', {
    method: 'POST',
    body: JSON.stringify({ courseId, amount: course.price })
  });
  
  // 2. Show Stripe checkout
  const stripe = await loadStripe(STRIPE_PUBLIC_KEY);
  await stripe.redirectToCheckout({ sessionId: payment.sessionId });
  
  // 3. On success webhook, create enrollment
  // (handled in payment service webhook)
};
```

**Acceptance Criteria:**
- [ ] Click "Enroll" opens Stripe checkout
- [ ] After payment, enrollment created automatically
- [ ] Course appears in "My Courses"
- [ ] Payment recorded in database

---

### Task 6: Deploy to Railway ⚡ PRIORITY 3
**Time:** 2-3 hours  
**Status:** 🔴 Not Started

**Services to deploy:**
1. `api-gateway` (port 4000)
2. `auth-service` (port 4001)
3. `azora-education` (port 4002)
4. `payment` (port 4010)
5. `student-portal` (Next.js app)

**Steps:**
```bash
# 1. Install Railway CLI
npm install -g @railway/cli

# 2. Login
railway login

# 3. Create project
railway init azora-os

# 4. Deploy each service
cd services/api-gateway && railway up
cd services/auth-service && railway up
cd services/azora-education && railway up
cd services/payment && railway up
cd apps/student-portal && railway up

# 5. Set environment variables
railway variables set DATABASE_URL=...
railway variables set REDIS_URL=...
railway variables set JWT_SECRET=...
railway variables set STRIPE_SECRET_KEY=...
```

**Acceptance Criteria:**
- [ ] All services deployed and running
- [ ] Student portal accessible via URL
- [ ] Can login, browse courses, enroll
- [ ] Payments work in production

---

## 🎯 OPTIONAL (Nice to Have)

### Task 7: Complete Marketplace UI
**Time:** 2-3 hours  
**Status:** 🟡 Backend done, frontend missing

**What to build:**
- Job listings page
- Job details page
- Application form
- My applications page

**Can skip for MVP:** Yes, focus on education first

---

### Task 8: Build Admin Dashboard
**Time:** 3-4 hours  
**Status:** 🔴 Not Started

**What to build:**
- View all users
- View all courses
- View all enrollments
- View revenue stats

**Can skip for MVP:** Yes, use database directly for now

---

### Task 9: Add Course Content Viewer
**Time:** 2-3 hours  
**Status:** 🔴 Not Started

**What to build:**
- Video player for lessons
- Progress tracking
- Quiz/assessment system

**Can skip for MVP:** Yes, just show "Course enrolled" for now

---

## 📊 Time Breakdown

**Critical Path (Must Do):**
- Task 1: Student Portal UI - 2-3 hours
- Task 2: Education APIs - 1-2 hours
- Task 3: API Gateway - 1 hour
- Task 4: Seed Data - 30 min
- Task 5: Payment Integration - 1 hour
- Task 6: Deployment - 2-3 hours
- **Total: 8-11 hours**

**Optional (Nice to Have):**
- Task 7: Marketplace UI - 2-3 hours
- Task 8: Admin Dashboard - 3-4 hours
- Task 9: Course Viewer - 2-3 hours
- **Total: 7-10 hours**

---

## 🚀 Launch Checklist

**Before Launch:**
- [ ] All critical tasks complete
- [ ] Can signup/login
- [ ] Can browse courses
- [ ] Can enroll in course (with payment)
- [ ] Course appears in "My Courses"
- [ ] Deployed to Railway
- [ ] Domain configured (or using Railway URL)

**After Launch:**
- [ ] Monitor for errors
- [ ] Fix critical bugs
- [ ] Add optional features
- [ ] Get user feedback

---

## 💡 Pro Tips

**Speed Up Development:**
- Use Antigravity/Cursor for UI generation
- Copy-paste working code from other services
- Use Stripe test mode for payments
- Deploy early, deploy often

**Avoid Scope Creep:**
- Don't add features not on critical path
- Don't perfect the UI yet
- Don't build admin dashboard yet
- Don't add course content yet

**Focus on Core Loop:**
1. User signs up
2. User browses courses
3. User enrolls (pays)
4. User sees enrolled course
5. **THAT'S IT FOR MVP**

---

## 🎯 Success Criteria

**MVP is successful if:**
- [ ] User can signup/login
- [ ] User can see 5-10 courses
- [ ] User can enroll in a course
- [ ] Payment goes through
- [ ] Course shows in "My Courses"
- [ ] Everything works on Railway

**That's the MVP. Ship it. Iterate later.**

---

## 🔥 LET'S GO!

**Start with Task 1 (Student Portal UI)**  
**Then Task 2 (Education APIs)**  
**Then connect them together**  
**Then deploy**  
**Then celebrate 🎉**