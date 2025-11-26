# Azora Education

Comprehensive learning management with courses, enrollment, and progress tracking.

## Purpose
- Course catalog management
- Student enrollment
- Progress tracking
- Assessment and grading
- Certificate generation
- Learning analytics

## Setup
```bash
npm install
npm run prisma:generate
```

## Environment Variables
See `.env.example` for required configuration.

## Scripts
- `npm run dev` - Development server
- `npm run build` - Build TypeScript
- `npm run start` - Production server
- `npm run test` - Run tests
- `npm run typecheck` - TypeScript validation

## API Endpoints
- `GET /api/courses` - List all courses
- `POST /api/courses` - Create course (instructor)
- `POST /api/courses/:id/enroll` - Enroll in course
- `GET /api/progress/:studentId` - Get student progress
- `POST /api/assessments/:id/submit` - Submit assessment
- `GET /api/certificates/:id` - Get certificate

## Database
PostgreSQL with Prisma ORM for course and enrollment data.

## Testing

### Test Status
- **Status**: ✅ Passing
- **Test Suites**: 4 passing / 4 total
- **Last Updated**: 2025-11-25

### Test Coverage
- **Overall**: 72%
- **Lines**: 72%
- **Functions**: 75%
- **Branches**: 68%
- **Statements**: 72%

### Test Categories

#### Unit Tests
- **Location**: `tests/unit/`
- **Coverage**: 75%
- **Status**: ✅ Passing
- **Key Test Files**:
  - `course-service.test.ts` - Course management logic
  - `enrollment-service.test.ts` - Enrollment operations
  - `progress-service.test.ts` - Progress tracking

#### Integration Tests
- **Location**: `tests/integration/`
- **Coverage**: 70%
- **Status**: ✅ Passing
- **Key Test Files**:
  - `course-management.test.ts` - Course CRUD operations
  - `enrollment.test.ts` - Enrollment workflows
  - `progress-tracking.test.ts` - Progress updates
  - `assessment.test.ts` - Assessment submission and grading

### Test Scenarios Covered
- ✅ Course creation, update, and deletion
- ✅ Course listing and filtering
- ✅ Student enrollment in courses
- ✅ Enrollment status management
- ✅ Enrollment cancellation
- ✅ Progress tracking and updates
- ✅ Milestone achievement
- ✅ Assessment submission
- ✅ Grading workflows
- ✅ Certificate generation
- ✅ Learning path management

### Running Tests

#### Run All Tests
```bash
npm test
```

#### Run Specific Test Suite
```bash
npm test -- tests/course-management.test.ts
```

#### Run Tests in Watch Mode
```bash
npm test -- --watch
```

#### Run Tests with Coverage
```bash
npm test -- --coverage
```

#### Run Integration Tests Only
```bash
npm test -- tests/integration
```

### Testing Guidelines

#### Using Test Factories
```typescript
import { createTestUser, createTestCourse, createTestEnrollment } from '@/tests/factories';

// Create test data
const instructor = await createTestUser({ role: 'instructor' });
const student = await createTestUser({ role: 'student' });
const course = await createTestCourse({ instructorId: instructor.id });
const enrollment = await createTestEnrollment(student.id, course.id);
```

#### Testing Course Operations
```typescript
import { setupTestDatabase, cleanupTestDatabase } from '@/tests/utils/database';

beforeAll(async () => {
  await setupTestDatabase();
});

afterAll(async () => {
  await cleanupTestDatabase();
});

it('should create a new course', async () => {
  const instructor = await createTestUser({ role: 'instructor' });
  const courseData = {
    title: 'Introduction to AI',
    description: 'Learn AI fundamentals',
    instructorId: instructor.id
  };
  
  const course = await courseService.create(courseData);
  
  expect(course).toBeDefined();
  expect(course.title).toBe(courseData.title);
});
```

#### Testing Enrollment Workflows
```typescript
it('should enroll student in course', async () => {
  const student = await createTestUser({ role: 'student' });
  const course = await createTestCourse();
  
  const enrollment = await enrollmentService.enroll(student.id, course.id);
  
  expect(enrollment.status).toBe('ACTIVE');
  expect(enrollment.studentId).toBe(student.id);
  expect(enrollment.courseId).toBe(course.id);
});
```

#### Testing Progress Tracking
```typescript
it('should update student progress', async () => {
  const enrollment = await createTestEnrollment();
  
  const progress = await progressService.update(enrollment.id, {
    completedLessons: 5,
    totalLessons: 10
  });
  
  expect(progress.percentComplete).toBe(50);
});
```

### Known Issues
- None currently

### Test Dependencies
- Jest 29.x
- Prisma test utilities
- Test factories from `@/tests/factories`
- Database utilities from `@/tests/utils/database`

### Troubleshooting

#### Tests Failing Locally
1. Ensure test database is running: `npm run db:test:start`
2. Run migrations: `npm run prisma:migrate:test`
3. Clear test cache: `npm test -- --clearCache`

#### Database Connection Issues
1. Check DATABASE_URL in .env.test
2. Verify PostgreSQL is running
3. Ensure test database exists: `createdb azora_test`

#### Slow Tests
1. Use test parallelization: `npm test -- --maxWorkers=4`
2. Check for missing database indexes
3. Verify proper test isolation

### Contributing Tests
See [Testing Standards](../../docs/testing/TESTING-STANDARDS.md) for detailed guidelines on writing tests.
