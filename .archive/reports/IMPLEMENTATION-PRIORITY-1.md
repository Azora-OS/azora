# STOP DOCUMENTING. START BUILDING.

## Priority 1: Connect ONE Frontend to ONE Backend Service

**Goal:** Get student-portal talking to education-service through api-gateway in 1 day.

---

## Step 1: Database Schema (30 min)

```prisma
// prisma/schema.prisma - ADD THESE MODELS

model User {
  id        String   @id @default(uuid())
  email     String   @unique
  name      String
  role      String   @default("student")
  createdAt DateTime @default(now())
  
  enrollments Enrollment[]
  progress    Progress[]
}

model Course {
  id          String   @id @default(uuid())
  title       String
  description String
  price       Float    @default(0)
  createdAt   DateTime @default(now())
  
  enrollments Enrollment[]
  lessons     Lesson[]
}

model Lesson {
  id        String   @id @default(uuid())
  courseId  String
  title     String
  content   String
  order     Int
  
  course    Course   @relation(fields: [courseId], references: [id])
  progress  Progress[]
}

model Enrollment {
  id        String   @id @default(uuid())
  userId    String
  courseId  String
  status    String   @default("active")
  createdAt DateTime @default(now())
  
  user      User     @relation(fields: [userId], references: [id])
  course    Course   @relation(fields: [courseId], references: [id])
  
  @@unique([userId, courseId])
}

model Progress {
  id         String   @id @default(uuid())
  userId     String
  lessonId   String
  completed  Boolean  @default(false)
  score      Float?
  updatedAt  DateTime @updatedAt
  
  user       User     @relation(fields: [userId], references: [id])
  lesson     Lesson   @relation(fields: [lessonId], references: [id])
  
  @@unique([userId, lessonId])
}
```

**Run:**
```bash
npx prisma migrate dev --name add_education_models
npx prisma generate
```

---

## Step 2: Education Service API (45 min)

```javascript
// services/azora-education/src/api/courses.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET /api/courses
exports.getCourses = async (req, res) => {
  const courses = await prisma.course.findMany({
    include: { lessons: true }
  });
  res.json(courses);
};

// POST /api/courses/:id/enroll
exports.enrollCourse = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id; // from auth middleware
  
  const enrollment = await prisma.enrollment.create({
    data: { userId, courseId: id }
  });
  
  res.json(enrollment);
};

// GET /api/progress/:userId
exports.getProgress = async (req, res) => {
  const { userId } = req.params;
  
  const progress = await prisma.progress.findMany({
    where: { userId },
    include: { lesson: { include: { course: true } } }
  });
  
  res.json(progress);
};
```

```javascript
// services/azora-education/src/index.js

const express = require('express');
const coursesRouter = require('./api/courses');

const app = express();
app.use(express.json());

app.get('/api/courses', coursesRouter.getCourses);
app.post('/api/courses/:id/enroll', coursesRouter.enrollCourse);
app.get('/api/progress/:userId', coursesRouter.getProgress);

app.listen(4001, () => console.log('Education service on :4001'));
```

---

## Step 3: API Gateway Routes (30 min)

```javascript
// services/api-gateway/src/routes/education.js

const express = require('express');
const axios = require('axios');
const router = express.Router();

const EDUCATION_SERVICE = process.env.EDUCATION_SERVICE_URL || 'http://localhost:4001';

router.get('/courses', async (req, res) => {
  const { data } = await axios.get(`${EDUCATION_SERVICE}/api/courses`);
  res.json(data);
});

router.post('/courses/:id/enroll', async (req, res) => {
  const { data } = await axios.post(
    `${EDUCATION_SERVICE}/api/courses/${req.params.id}/enroll`,
    {},
    { headers: { 'user-id': req.user.id } }
  );
  res.json(data);
});

router.get('/progress/:userId', async (req, res) => {
  const { data } = await axios.get(`${EDUCATION_SERVICE}/api/progress/${req.params.userId}`);
  res.json(data);
});

module.exports = router;
```

```javascript
// services/api-gateway/src/index.js - ADD THIS

const educationRoutes = require('./routes/education');
app.use('/api/education', educationRoutes);
```

---

## Step 4: Frontend API Client (30 min)

```typescript
// packages/shared-api/src/education.ts

import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export const educationApi = {
  getCourses: () => 
    axios.get(`${API_URL}/api/education/courses`).then(r => r.data),
  
  enrollCourse: (courseId: string) =>
    axios.post(`${API_URL}/api/education/courses/${courseId}/enroll`).then(r => r.data),
  
  getProgress: (userId: string) =>
    axios.get(`${API_URL}/api/education/progress/${userId}`).then(r => r.data),
};
```

---

## Step 5: Student Portal UI (45 min)

```tsx
// apps/student-portal/src/pages/courses.tsx

import { useEffect, useState } from 'react';
import { educationApi } from '@azora/shared-api';

export default function CoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    educationApi.getCourses()
      .then(setCourses)
      .finally(() => setLoading(false));
  }, []);

  const handleEnroll = async (courseId: string) => {
    await educationApi.enrollCourse(courseId);
    alert('Enrolled!');
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Available Courses</h1>
      <div className="grid gap-4">
        {courses.map((course: any) => (
          <div key={course.id} className="border p-4 rounded">
            <h2 className="text-xl font-bold">{course.title}</h2>
            <p className="text-gray-600">{course.description}</p>
            <button 
              onClick={() => handleEnroll(course.id)}
              className="mt-2 bg-blue-600 text-white px-4 py-2 rounded"
            >
              Enroll Now
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## Step 6: Test End-to-End (30 min)

```bash
# Terminal 1: Start database
docker-compose up postgres

# Terminal 2: Start education service
cd services/azora-education && npm start

# Terminal 3: Start API gateway
cd services/api-gateway && npm start

# Terminal 4: Start student portal
cd apps/student-portal && npm run dev

# Browser: http://localhost:3000/courses
```

---

## SUCCESS CRITERIA

✅ Student portal shows real courses from database  
✅ Click "Enroll" button → creates enrollment record  
✅ Data flows: Frontend → Gateway → Service → Database  

**Time: 3-4 hours for ONE working feature**

---

## REPEAT FOR NEXT FEATURES

1. ✅ Courses list + enrollment (DONE)
2. Progress tracking dashboard
3. Lesson viewer with completion
4. AI tutor chat (Elara)
5. Token earnings display

**Build ONE feature at a time. Make it work. Then move to next.**

---

## STOP DOING

❌ Writing more architecture documents  
❌ Creating new agent assignments  
❌ Designing 147 services at once  
❌ Celebrating incomplete work  

## START DOING

✅ Writing actual code  
✅ Connecting real APIs  
✅ Testing in browser  
✅ Fixing bugs  
✅ Shipping features  

---

**Next file to create: The actual implementation code above.**
