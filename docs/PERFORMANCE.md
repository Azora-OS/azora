# Azora OS - Performance Optimization Guide

## Overview

This guide covers performance optimization strategies for the Azora OS platform, focusing on database efficiency, code splitting, and caching.

## Database Optimization

### DataLoader Pattern

Use DataLoader to batch and cache database requests within a single operation:

```typescript
import DataLoader from 'dataloader';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Create DataLoader for users
const userLoader = new DataLoader(async (userIds: readonly string[]) => {
  const users = await prisma.user.findMany({
    where: { id: { in: [...userIds] } },
  });

  // Return users in the same order as requested IDs
  const userMap = new Map(users.map(user => [user.id, user]));
  return userIds.map(id => userMap.get(id) || null);
});

// Usage in GraphQL resolver
export const resolvers = {
  Query: {
    user: async (_parent, { id }, context) => {
      return context.loaders.user.load(id);
    },
  },
  Course: {
    instructor: async (course, _args, context) => {
      // This will be batched with other instructor loads
      return context.loaders.user.load(course.instructorId);
    },
  },
};
```

### Query Optimization

#### ❌ N+1 Query Problem
```typescript
// BAD: This creates N+1 queries
const courses = await prisma.course.findMany();
for (const course of courses) {
  course.instructor = await prisma.user.findUnique({
    where: { id: course.instructorId },
  });
}
```

#### ✅ Solution: Include Relations
```typescript
// GOOD: Single query with include
const courses = await prisma.course.findMany({
  include: {
    instructor: true,
    enrollments: {
      include: {
        student: true,
      },
    },
  },
});
```

### Indexing

Add database indexes for frequently queried fields:

```prisma
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  createdAt DateTime @default(now())
  
  @@index([email])
  @@index([createdAt])
}

model Course {
  id           String   @id @default(uuid())
  instructorId String
  category     String
  published    Boolean
  
  @@index([instructorId])
  @@index([category, published])
}
```

### Connection Pooling

Configure Prisma connection pool:

```typescript
// config/database.ts
import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  log: process.env.NODE_ENV === 'development' ? ['query'] : [],
  // Connection pool configuration
  __internal: {
    engine: {
      connection_limit: 20,
      pool_timeout: 10,
    },
  },
});
```

## Frontend Performance

### Code Splitting

#### Next.js Dynamic Imports

```typescript
import dynamic from 'next/dynamic';

// ✅ Lazy load heavy components
const HeavyChart = dynamic(() => import('@/components/HeavyChart'), {
  loading: () => <div>Loading chart...</div>,
  ssr: false, // Disable SSR for client-only components
});

// ✅ Lazy load based on condition
const AdminPanel = dynamic(() => import('@/components/AdminPanel'), {
  loading: () => <div>Loading admin panel...</div>,
});

export default function Dashboard({ isAdmin }) {
  return (
    <div>
      <h1>Dashboard</h1>
      {isAdmin && <AdminPanel />}
    </div>
  );
}
```

#### React.lazy for Vite Apps

```typescript
import React, { Suspense, lazy } from 'react';

// Lazy load components
const Settings = lazy(() => import('./Settings'));
const Analytics = lazy(() => import('./Analytics'));

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Routes>
        <Route path="/settings" element={<Settings />} />
        <Route path="/analytics" element={<Analytics />} />
      </Routes>
    </Suspense>
  );
}
```

### Route-based Code Splitting

```typescript
// app/courses/[id]/page.tsx
import dynamic from 'next/dynamic';

// Split by feature
const CourseVideo = dynamic(() => import('@/features/course/CourseVideo'));
const CourseNotes = dynamic(() => import('@/features/course/CourseNotes'));
const CourseDiscussion = dynamic(() => import('@/features/course/CourseDiscussion'));

export default function CoursePage({ params }: { params: { id: string } }) {
  const [activeTab, setActiveTab] = useState('video');

  return (
    <div>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="video">Video</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
          <TabsTrigger value="discussion">Discussion</TabsTrigger>
        </TabsList>
        
        <TabsContent value="video">
          <CourseVideo courseId={params.id} />
        </TabsContent>
        
        <TabsContent value="notes">
          <CourseNotes courseId={params.id} />
        </TabsContent>
        
        <TabsContent value="discussion">
          <CourseDiscussion courseId={params.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

### Bundle Size Optimization

```typescript
// ❌ BAD: Imports entire library
import _ from 'lodash';
import moment from 'moment';

// ✅ GOOD: Import only what you need
import debounce from 'lodash/debounce';
import dayjs from 'dayjs'; // Smaller alternative to moment
```

### Image Optimization

```typescript
import Image from 'next/image';

// ✅ Use Next.js Image component
export function CourseCard({ course }) {
  return (
    <div>
      <Image
        src={course.thumbnailUrl}
        alt={course.title}
        width={400}
        height={300}
        placeholder="blur"
        blurDataURL={course.blurDataURL}
        loading="lazy"
      />
      <h3>{course.title}</h3>
    </div>
  );
}
```

## Caching Strategies

### Server-Side Caching (Redis)

```typescript
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

// Cache expensive queries
export async function getCourseWithCache(courseId: string) {
  const cacheKey = `course:${courseId}`;
  
  // Try cache first
  const cached = await redis.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }
  
  // Fetch from database
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      instructor: true,
      modules: true,
    },
  });
  
  // Cache for 1 hour
  await redis.setex(cacheKey, 3600, JSON.stringify(course));
  
  return course;
}

// Invalidate cache on update
export async function updateCourse(courseId: string, data: any) {
  const updated = await prisma.course.update({
    where: { id: courseId },
    data,
  });
  
  // Invalidate cache
  await redis.del(`course:${courseId}`);
  
  return updated;
}
```

### Client-Side Caching (SWR/React Query)

```typescript
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export function useCourse(courseId: string) {
  const { data, error, mutate } = useSWR(
    `/api/courses/${courseId}`,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 60000, // 1 minute
    }
  );

  return {
    course: data,
    isLoading: !error && !data,
    isError: error,
    refresh: mutate,
  };
}
```

### API Route Caching

```typescript
// app/api/courses/route.ts
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const courses = await getCourses();

  return NextResponse.json(courses, {
    headers: {
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
    },
  });
}
```

## React Performance

### Memoization

```typescript
import { memo, useMemo, useCallback } from 'react';

// ✅ Memoize expensive calculations
function CourseList({ courses, filter }) {
  const filteredCourses = useMemo(() => {
    return courses.filter(course => 
      course.category === filter
    );
  }, [courses, filter]);

  return <>{/* render filteredCourses */}</>;
}

// ✅ Memoize callbacks
function SearchBar({ onSearch }) {
  const [query, setQuery] = useState('');

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    onSearch(query);
  }, [query, onSearch]);

  return <form onSubmit={handleSubmit}>...</form>;
}

// ✅ Memoize components
export const CourseCard = memo(function CourseCard({ course }) {
  return <div>{course.title}</div>;
});
```

### Virtual Scrolling

```typescript
import { FixedSizeList } from 'react-window';

export function LargeCourseList({ courses }) {
  const Row = ({ index, style }) => (
    <div style={style}>
      <CourseCard course={courses[index]} />
    </div>
  );

  return (
    <FixedSizeList
      height={600}
      itemCount={courses.length}
      itemSize={120}
      width="100%"
    >
      {Row}
    </FixedSizeList>
  );
}
```

## Monitoring

### Performance Metrics

```typescript
// lib/metrics.ts
export function measurePerformance(name: string, fn: () => Promise<any>) {
  return async (...args: any[]) => {
    const start = performance.now();
    
    try {
      const result = await fn(...args);
      const duration = performance.now() - start;
      
      // Log to monitoring service
      console.log(`[Performance] ${name}: ${duration.toFixed(2)}ms`);
      
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      console.error(`[Performance Error] ${name}: ${duration.toFixed(2)}ms`, error);
      throw error;
    }
  };
}

// Usage
export const getCourse = measurePerformance(
  'getCourse',
  async (id: string) => {
    return await prisma.course.findUnique({ where: { id } });
  }
);
```

### Web Vitals

```typescript
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
```

## Performance Budget

Set performance budgets for your application:

```json
// .lighthouserc.json
{
  "ci": {
    "assert": {
      "assertions": {
        "first-contentful-paint": ["error", { "maxNumericValue": 2000 }],
        "interactive": ["error", { "maxNumericValue": 5000 }],
        "total-blocking-time": ["error", { "maxNumericValue": 300 }],
        "cumulative-layout-shift": ["error", { "maxNumericValue": 0.1 }]
      }
    }
  }
}
```

## Checklist

- [ ] Database indexes on frequently queried fields
- [ ] DataLoader for GraphQL resolvers
- [ ] Code splitting for large components
- [ ] Image optimization with Next.js Image
- [ ] Redis caching for expensive queries
- [ ] SWR/React Query for client-side caching
- [ ] Memoization for expensive calculations
- [ ] Virtual scrolling for large lists
- [ ] Performance monitoring in place
- [ ] Web Vitals tracking enabled
