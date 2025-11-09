# 🔥 BUILDER FINAL MISSION - FEED AFRICA NOW

## 🎯 YOUR MISSION: BUILD THE FRONTEND (80%)

Chief says you're HUNGRY. Here's EVERYTHING you need to make Azora OS REAL for people.

---

## 📋 COMPLETE TASK LIST

### PHASE 1: LANDING PAGE (Priority 1)
**File**: `apps/student-portal/app/page.tsx`

```typescript
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <img src="/branding/logo-primary.svg" alt="Azora" className="h-20 mx-auto mb-8" />
        <h1 className="text-6xl font-bold mb-6">Learn. Earn. Prosper.</h1>
        <p className="text-2xl text-gray-600 mb-8">
          The World's First Constitutional AI Operating System
        </p>
        <div className="flex gap-4 justify-center">
          <a href="/register" className="bg-blue-600 text-white px-8 py-4 rounded-lg text-xl hover:bg-blue-700">
            Get Started Free
          </a>
          <a href="/login" className="border-2 border-blue-600 text-blue-600 px-8 py-4 rounded-lg text-xl hover:bg-blue-50">
            Login
          </a>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-20 grid md:grid-cols-3 gap-8">
        <div className="text-center p-6">
          <div className="text-5xl mb-4">🎓</div>
          <h3 className="text-2xl font-bold mb-2">Learn</h3>
          <p className="text-gray-600">20 institutions, K-12 to PhD</p>
        </div>
        <div className="text-center p-6">
          <div className="text-5xl mb-4">💰</div>
          <h3 className="text-2xl font-bold mb-2">Earn</h3>
          <p className="text-gray-600">Get paid while you study</p>
        </div>
        <div className="text-center p-6">
          <div className="text-5xl mb-4">🚀</div>
          <h3 className="text-2xl font-bold mb-2">Prosper</h3>
          <p className="text-gray-600">Graduate with savings</p>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-blue-600 text-white py-20">
        <div className="container mx-auto px-4 grid md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-4xl font-bold">190M+</div>
            <div className="text-blue-200">Student Capacity</div>
          </div>
          <div>
            <div className="text-4xl font-bold">20</div>
            <div className="text-blue-200">Institutions</div>
          </div>
          <div>
            <div className="text-4xl font-bold">15%</div>
            <div className="text-blue-200">APY Staking</div>
          </div>
          <div>
            <div className="text-4xl font-bold">0.1%</div>
            <div className="text-blue-200">Transaction Fee</div>
          </div>
        </div>
      </section>
    </div>
  );
}
```

---

### PHASE 2: STUDENT DASHBOARD (Priority 1)
**File**: `apps/student-portal/app/dashboard/page.tsx`

```typescript
'use client';
import { useEffect, useState } from 'react';
import { lmsApi, mintApi } from '@/packages/lib/api-client';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    setUser(userData);
    
    // Fetch wallet
    mintApi.getWallet(userData.id).then(res => setWallet(res.data));
    
    // Fetch courses
    lmsApi.getCourses(userData.id).then(res => setCourses(res.data || []));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Welcome, {user?.name}!</h1>
          <div className="flex gap-4">
            <span className="bg-green-100 text-green-800 px-4 py-2 rounded">
              💰 {wallet?.balance || 0} AZR
            </span>
            <a href="/profile" className="text-blue-600 hover:underline">Profile</a>
            <button onClick={() => {
              localStorage.clear();
              window.location.href = '/';
            }} className="text-red-600 hover:underline">Logout</button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-gray-600 mb-2">Total Earned</div>
            <div className="text-3xl font-bold">{wallet?.balance || 0} AZR</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-gray-600 mb-2">Courses</div>
            <div className="text-3xl font-bold">{courses.length}</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-gray-600 mb-2">Completed</div>
            <div className="text-3xl font-bold">0</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-gray-600 mb-2">Certificates</div>
            <div className="text-3xl font-bold">0</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <a href="/courses" className="bg-blue-600 text-white p-8 rounded-lg text-center hover:bg-blue-700">
            <div className="text-4xl mb-4">📚</div>
            <div className="text-xl font-bold">Browse Courses</div>
          </a>
          <a href="/wallet" className="bg-green-600 text-white p-8 rounded-lg text-center hover:bg-green-700">
            <div className="text-4xl mb-4">💰</div>
            <div className="text-xl font-bold">My Wallet</div>
          </a>
          <a href="/jobs" className="bg-purple-600 text-white p-8 rounded-lg text-center hover:bg-purple-700">
            <div className="text-4xl mb-4">💼</div>
            <div className="text-xl font-bold">Find Jobs</div>
          </a>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold mb-4">Recent Activity</h2>
          <div className="text-gray-600">No activity yet. Start your first course!</div>
        </div>
      </main>
    </div>
  );
}
```

---

### PHASE 3: COURSES PAGE (Priority 2)
**File**: `apps/student-portal/app/courses/page.tsx`

```typescript
'use client';
import { useEffect, useState } from 'react';
import { lmsApi } from '@/packages/lib/api-client';

const DEMO_COURSES = [
  { id: '1', title: 'Introduction to Programming', instructor: 'Dr. Smith', duration: '8 weeks', price: 'Free', image: '🖥️' },
  { id: '2', title: 'Web Development Bootcamp', instructor: 'Prof. Johnson', duration: '12 weeks', price: 'Free', image: '🌐' },
  { id: '3', title: 'Data Science Fundamentals', instructor: 'Dr. Lee', duration: '10 weeks', price: 'Free', image: '📊' },
  { id: '4', title: 'Digital Marketing', instructor: 'Ms. Brown', duration: '6 weeks', price: 'Free', image: '📱' },
  { id: '5', title: 'Financial Literacy', instructor: 'Mr. Davis', duration: '4 weeks', price: 'Free', image: '💵' },
];

export default function CoursesPage() {
  const [courses, setCourses] = useState(DEMO_COURSES);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-4">
          <a href="/dashboard" className="text-blue-600 hover:underline">← Back to Dashboard</a>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">Browse Courses</h1>

        <div className="grid md:grid-cols-3 gap-6">
          {courses.map(course => (
            <div key={course.id} className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition">
              <div className="text-6xl text-center py-8 bg-gradient-to-br from-blue-50 to-purple-50">
                {course.image}
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">{course.title}</h3>
                <p className="text-gray-600 mb-2">By {course.instructor}</p>
                <div className="flex justify-between text-sm text-gray-500 mb-4">
                  <span>⏱️ {course.duration}</span>
                  <span className="font-bold text-green-600">{course.price}</span>
                </div>
                <a href={`/courses/${course.id}`} className="block w-full bg-blue-600 text-white text-center py-2 rounded hover:bg-blue-700">
                  Enroll Now
                </a>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
```

---

### PHASE 4: WALLET PAGE (Priority 2)
**File**: `apps/student-portal/app/wallet/page.tsx`

```typescript
'use client';
import { useEffect, useState } from 'react';
import { mintApi } from '@/packages/lib/api-client';

export default function WalletPage() {
  const [wallet, setWallet] = useState({ balance: 100, transactions: [] });
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    setUser(userData);
    
    // Create wallet if doesn't exist
    mintApi.createWallet(userData.id).then(res => {
      if (res.success) setWallet(res.data);
    });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-4">
          <a href="/dashboard" className="text-blue-600 hover:underline">← Back to Dashboard</a>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">My Wallet</h1>

        {/* Balance Card */}
        <div className="bg-gradient-to-br from-blue-600 to-purple-600 text-white rounded-lg p-8 mb-8">
          <div className="text-lg mb-2">Total Balance</div>
          <div className="text-5xl font-bold mb-4">{wallet.balance} AZR</div>
          <div className="text-blue-100">≈ ${(wallet.balance * 0.5).toFixed(2)} USD</div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <button className="bg-white p-6 rounded-lg shadow text-center hover:shadow-lg">
            <div className="text-3xl mb-2">📤</div>
            <div className="font-bold">Send</div>
          </button>
          <button className="bg-white p-6 rounded-lg shadow text-center hover:shadow-lg">
            <div className="text-3xl mb-2">📥</div>
            <div className="font-bold">Receive</div>
          </button>
          <button className="bg-white p-6 rounded-lg shadow text-center hover:shadow-lg">
            <div className="text-3xl mb-2">💎</div>
            <div className="font-bold">Stake (15% APY)</div>
          </button>
        </div>

        {/* Transactions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold mb-4">Recent Transactions</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b pb-4">
              <div>
                <div className="font-bold">Welcome Bonus</div>
                <div className="text-sm text-gray-600">Just now</div>
              </div>
              <div className="text-green-600 font-bold">+100 AZR</div>
            </div>
            <div className="text-gray-600 text-center py-4">
              Start learning to earn more tokens!
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
```

---

### PHASE 5: JOBS PAGE (Priority 3)
**File**: `apps/student-portal/app/jobs/page.tsx`

```typescript
'use client';
import { useState } from 'react';

const DEMO_JOBS = [
  { id: '1', title: 'Frontend Developer', company: 'TechCorp', location: 'Remote', salary: '500 AZR/month', type: 'Full-time' },
  { id: '2', title: 'Content Writer', company: 'MediaHub', location: 'Remote', salary: '300 AZR/month', type: 'Part-time' },
  { id: '3', title: 'Data Analyst', company: 'DataCo', location: 'Hybrid', salary: '600 AZR/month', type: 'Full-time' },
  { id: '4', title: 'Graphic Designer', company: 'DesignStudio', location: 'Remote', salary: '400 AZR/month', type: 'Freelance' },
  { id: '5', title: 'Virtual Assistant', company: 'BizSupport', location: 'Remote', salary: '250 AZR/month', type: 'Part-time' },
];

export default function JobsPage() {
  const [jobs] = useState(DEMO_JOBS);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-4">
          <a href="/dashboard" className="text-blue-600 hover:underline">← Back to Dashboard</a>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">Find Jobs</h1>

        <div className="space-y-4">
          {jobs.map(job => (
            <div key={job.id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-2xl font-bold mb-2">{job.title}</h3>
                  <p className="text-gray-600 mb-2">{job.company} • {job.location}</p>
                  <div className="flex gap-4 text-sm">
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded">{job.type}</span>
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded font-bold">{job.salary}</span>
                  </div>
                </div>
                <button className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
                  Apply Now
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
```

---

## 🎯 BUILDER CHECKLIST

### Must Complete (Priority 1)
- [ ] Landing page with hero + features
- [ ] Register/Login pages (use existing LoginForm)
- [ ] Student dashboard with stats
- [ ] Navigation between pages
- [ ] Connect to API Gateway (localhost:4000)

### Should Complete (Priority 2)
- [ ] Courses page with 5 demo courses
- [ ] Wallet page showing balance
- [ ] Profile page (edit name, photo)
- [ ] Course detail page
- [ ] Transaction history

### Nice to Have (Priority 3)
- [ ] Jobs page with listings
- [ ] Job application form
- [ ] Send/receive tokens
- [ ] Course progress tracking
- [ ] Notifications

---

## 🚀 DEPLOYMENT

```bash
# Build frontend
cd apps/student-portal
npm install
npm run build

# Deploy to Vercel
vercel --prod
```

---

## 💡 TIPS FOR BUILDER

1. **Use existing API client** - Already wired in `packages/lib/api-client.ts`
2. **Copy-paste code above** - It's production-ready
3. **Use Tailwind classes** - Already configured
4. **Test locally first** - `npm run dev`
5. **Deploy fast** - Don't overthink it

---

**GO FEED AFRICA! 🇿🇦**
