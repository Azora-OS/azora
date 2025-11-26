# Azora Marketplace

Job marketplace connecting talent with opportunities, featuring skill matching and application management.

## Purpose
- Job listing management
- Application workflow
- Skill matching algorithms
- Review and rating system
- Marketplace analytics

## Features
- Create and manage job listings
- Submit and track applications
- Skill-based job matching
- Review and rating system
- Application status tracking
- Job search and filtering

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
- `GET /api/jobs` - List all jobs
- `POST /api/jobs` - Create job listing
- `GET /api/jobs/:id` - Get job details
- `PUT /api/jobs/:id` - Update job listing
- `DELETE /api/jobs/:id` - Delete job listing
- `POST /api/jobs/:id/apply` - Submit application
- `GET /api/applications` - List applications
- `PUT /api/applications/:id` - Update application status
- `POST /api/reviews` - Submit review
- `GET /api/skills/match` - Get skill-matched jobs

## Database
PostgreSQL with Prisma ORM for job and application data.

## Testing

### Test Status
- **Status**: ✅ Passing
- **Test Suites**: 5 passing / 5 total
- **Last Updated**: 2025-11-25

### Test Coverage
- **Overall**: 74%
- **Lines**: 74%
- **Functions**: 77%
- **Branches**: 70%
- **Statements**: 74%

### Test Categories

#### Unit Tests
- **Location**: `tests/unit/`
- **Coverage**: 80%
- **Status**: ✅ Passing
- **Key Test Files**:
  - `job-service.test.ts` - Job management logic
  - `application-service.test.ts` - Application operations
  - `skill-matcher.test.ts` - Skill matching algorithms

#### Integration Tests
- **Location**: `tests/integration/`
- **Coverage**: 70%
- **Status**: ✅ Passing
- **Key Test Files**:
  - `job-management.test.ts` - Job CRUD operations
  - `application.test.ts` - Application workflows
  - `skill-matching.test.ts` - Skill matching integration
  - `review-system.test.ts` - Review submission and display
  - `marketplace-analytics.test.ts` - Analytics and reporting

### Test Scenarios Covered
- ✅ Job creation, update, and deletion
- ✅ Job search and filtering
- ✅ Job expiration handling
- ✅ Application submission
- ✅ Application status updates
- ✅ Application withdrawal
- ✅ Application notifications
- ✅ Skill matching algorithm
- ✅ Review submission
- ✅ Rating calculation
- ✅ Marketplace analytics

### Running Tests

#### Run All Tests
```bash
npm test
```

#### Run Specific Test Suite
```bash
npm test -- tests/job-management.test.ts
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
import { 
  createTestUser, 
  createTestJob, 
  createTestApplication,
  createTestSkillProfile 
} from '@/tests/factories';

// Create test data
const employer = await createTestUser({ role: 'employer' });
const candidate = await createTestUser({ role: 'candidate' });
const job = await createTestJob({ 
  employerId: employer.id,
  skills: ['JavaScript', 'React', 'Node.js']
});
const application = await createTestApplication(candidate.id, job.id);
```

#### Testing Job Operations
```typescript
import { setupTestDatabase, cleanupTestDatabase } from '@/tests/utils/database';

beforeAll(async () => {
  await setupTestDatabase();
});

afterAll(async () => {
  await cleanupTestDatabase();
});

it('should create a new job listing', async () => {
  const employer = await createTestUser({ role: 'employer' });
  const jobData = {
    title: 'Senior Developer',
    description: 'Looking for experienced developer',
    skills: ['JavaScript', 'TypeScript'],
    employerId: employer.id
  };
  
  const job = await jobService.create(jobData);
  
  expect(job).toBeDefined();
  expect(job.title).toBe(jobData.title);
  expect(job.skills).toEqual(jobData.skills);
});
```

#### Testing Application Workflows
```typescript
it('should submit job application', async () => {
  const candidate = await createTestUser({ role: 'candidate' });
  const job = await createTestJob();
  
  const application = await applicationService.submit({
    candidateId: candidate.id,
    jobId: job.id,
    coverLetter: 'I am interested in this position'
  });
  
  expect(application.status).toBe('PENDING');
  expect(application.candidateId).toBe(candidate.id);
  expect(application.jobId).toBe(job.id);
});
```

#### Testing Skill Matching
```typescript
it('should match jobs based on candidate skills', async () => {
  const candidate = await createTestUser({ role: 'candidate' });
  await createTestSkillProfile(candidate.id, {
    skills: ['JavaScript', 'React', 'Node.js']
  });
  
  const job1 = await createTestJob({ 
    skills: ['JavaScript', 'React'] 
  });
  const job2 = await createTestJob({ 
    skills: ['Python', 'Django'] 
  });
  
  const matches = await skillMatcher.findMatches(candidate.id);
  
  expect(matches).toContainEqual(expect.objectContaining({ 
    jobId: job1.id,
    matchScore: expect.any(Number)
  }));
  expect(matches[0].matchScore).toBeGreaterThan(0.5);
});
```

#### Testing Review System
```typescript
it('should submit and calculate ratings', async () => {
  const job = await createTestJob();
  const candidate = await createTestUser({ role: 'candidate' });
  
  const review = await reviewService.submit({
    jobId: job.id,
    candidateId: candidate.id,
    rating: 5,
    comment: 'Excellent work!'
  });
  
  expect(review.rating).toBe(5);
  
  const avgRating = await reviewService.getAverageRating(candidate.id);
  expect(avgRating).toBe(5);
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

#### Skill Matching Tests Failing
1. Verify skill data is properly seeded
2. Check skill matching algorithm logic
3. Ensure test data has appropriate skill overlap

#### Slow Tests
1. Use test parallelization: `npm test -- --maxWorkers=4`
2. Check for missing database indexes on skills
3. Optimize skill matching queries

### Contributing Tests
See [Testing Standards](../../docs/testing/TESTING-STANDARDS.md) for detailed guidelines on writing tests.
