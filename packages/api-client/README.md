# @azora/api-client

Unified API client for Azora OS backend services.

## Installation

```bash
npm install @azora/api-client
```

## Usage

### Basic Client

```typescript
import { AzoraApiClient } from '@azora/api-client';

const client = new AzoraApiClient({
  baseUrl: 'http://localhost:4000',
  timeout: 30000
});

// Set auth token
client.setAuthToken('your-jwt-token');

// Use services
const courses = await client.lms.getCourses();
const wallet = await client.mint.getWallet('user-id');
```

### React Hooks

```typescript
import { useAuth, useCourses, useTutoring } from '@azora/api-client/hooks';

function MyComponent() {
  const { user, login, logout } = useAuth();
  const { courses, loading } = useCourses({ level: 'beginner' });
  const { session, messages, startSession, sendMessage } = useTutoring();

  return (
    <div>
      {courses.map(course => (
        <div key={course.id}>{course.title}</div>
      ))}
    </div>
  );
}
```

## Available Services

### Auth
- `auth.login(email, password)`
- `auth.register(data)`
- `auth.profile()`

### Education
- `education.getStudents()`
- `education.createStudent(data)`
- `education.getCurriculum(params)`

### LMS
- `lms.getCourses(params)`
- `lms.getCourse(id)`
- `lms.enroll(courseId, studentId)`
- `lms.getEnrollments(studentId)`

### Sapiens (AI Tutor)
- `sapiens.startTutoring(studentId, subject)`
- `sapiens.sendMessage(sessionId, message)`
- `sapiens.getLearningPaths()`

### Assessment
- `assessment.createAssessment(data)`
- `assessment.submitAssessment(id, studentId, answers)`
- `assessment.getGradebook(studentId)`

### Payment
- `payment.getBalance(userId)`
- `payment.createPayment(data)`

### Mint
- `mint.getWallet(userId)`
- `mint.startMining(userId)`

### Marketplace
- `marketplace.getJobs(params)`
- `marketplace.applyToJob(jobId, userId)`

## Environment Variables

```bash
NEXT_PUBLIC_API_URL=http://localhost:4000
```
