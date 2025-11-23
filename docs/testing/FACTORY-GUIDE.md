# Test Factory Usage Guide

## Overview

Factories provide a consistent way to create test data with realistic values and proper relationships.

## Available Factories

### User Factory

```typescript
import { userFactory } from '../../../tests/factories';

// Create user with defaults
const user = await userFactory.create();

// Create with specific role
const admin = await userFactory.create({ role: 'ADMIN' });
const student = await userFactory.create({ role: 'STUDENT' });
const instructor = await userFactory.create({ role: 'INSTRUCTOR' });

// Create multiple users
const users = await userFactory.createMany(5);

// Create unverified user
const unverified = await userFactory.createUnverified();

// Create inactive user
const inactive = await userFactory.createInactive();
```

### Course Factory

```typescript
import { courseFactory } from '../../../tests/factories';

// Create course with defaults
const course = await courseFactory.create();

// Create with specific instructor
const course = await courseFactory.create({
  instructorId: instructor.id
});

// Create published course
const published = await courseFactory.createPublished();

// Create draft course
const draft = await courseFactory.createDraft();

// Create multiple courses
const courses = await courseFactory.createMany(3);
```

### Enrollment Factory

```typescript
import { enrollmentFactory } from '../../../tests/factories';

// Create enrollment
const enrollment = await enrollmentFactory.create({
  userId: student.id,
  courseId: course.id
});

// Create active enrollment
const active = await enrollmentFactory.createActive({
  userId: student.id,
  courseId: course.id
});

// Create completed enrollment
const completed = await enrollmentFactory.createCompleted({
  userId: student.id,
  courseId: course.id
});
```

### Financial Factories

```typescript
import { walletFactory, transactionFactory } from '../../../tests/factories';

// Create wallet
const wallet = await walletFactory.create({
  userId: user.id,
  balance: 1000
});

// Create transaction
const transaction = await transactionFactory.create({
  fromWalletId: wallet1.id,
  toWalletId: wallet2.id,
  amount: 100
});

// Create payment transaction
const payment = await transactionFactory.createPayment({
  userId: user.id,
  amount: 50
});
```

### Marketplace Factories

```typescript
import { jobFactory, applicationFactory } from '../../../tests/factories';

// Create job listing
const job = await jobFactory.create({
  employerId: employer.id,
  title: 'Senior Developer',
  budget: 5000
});

// Create job application
const application = await applicationFactory.create({
  jobId: job.id,
  applicantId: applicant.id
});
```

## Factory Patterns

### Override Defaults

```typescript
// Override any field
const user = await userFactory.create({
  email: 'custom@example.com',
  name: 'Custom Name',
  role: 'ADMIN'
});
```

### Create Related Data

```typescript
// Create user with profile
const user = await userFactory.create();
const profile = await profileFactory.create({
  userId: user.id
});

// Create course with enrollments
const course = await courseFactory.create();
const students = await userFactory.createMany(5);
const enrollments = await Promise.all(
  students.map(student =>
    enrollmentFactory.create({
      userId: student.id,
      courseId: course.id
    })
  )
);
```

### Batch Creation

```typescript
// Create multiple with same overrides
const admins = await userFactory.createMany(3, { role: 'ADMIN' });

// Create multiple with different overrides
const users = await Promise.all([
  userFactory.create({ role: 'ADMIN' }),
  userFactory.create({ role: 'INSTRUCTOR' }),
  userFactory.create({ role: 'STUDENT' })
]);
```

## Best Practices

### Use Factories for All Test Data

```typescript
// ✅ Good - Using factory
const user = await userFactory.create();

// ❌ Bad - Manual creation
const user = await prisma.user.create({
  data: {
    email: 'test@example.com',
    name: 'Test User',
    password: await bcrypt.hash('password', 10),
    // ... many more fields
  }
});
```

### Override Only What's Necessary

```typescript
// ✅ Good - Minimal overrides
const user = await userFactory.create({ role: 'ADMIN' });

// ❌ Bad - Unnecessary overrides
const user = await userFactory.create({
  email: 'test@example.com',
  name: 'Test User',
  role: 'ADMIN',
  isActive: true,
  isEmailVerified: true,
  // ... defaults that don't need to change
});
```

### Clean Up Created Data

```typescript
describe('User Tests', () => {
  afterEach(async () => {
    await cleanupTestDatabase();
  });

  it('should create user', async () => {
    const user = await userFactory.create();
    expect(user).toBeDefined();
  });
});
```

### Use Descriptive Variable Names

```typescript
// ✅ Good - Clear intent
const instructor = await userFactory.create({ role: 'INSTRUCTOR' });
const student = await userFactory.create({ role: 'STUDENT' });

// ❌ Bad - Unclear
const user1 = await userFactory.create({ role: 'INSTRUCTOR' });
const user2 = await userFactory.create({ role: 'STUDENT' });
```

## Common Patterns

### Testing Relationships

```typescript
it('should enroll student in course', async () => {
  const student = await userFactory.create({ role: 'STUDENT' });
  const course = await courseFactory.create();
  
  const enrollment = await enrollmentFactory.create({
    userId: student.id,
    courseId: course.id
  });
  
  expect(enrollment.userId).toBe(student.id);
  expect(enrollment.courseId).toBe(course.id);
});
```

### Testing Permissions

```typescript
it('should allow admin to delete user', async () => {
  const admin = await userFactory.create({ role: 'ADMIN' });
  const user = await userFactory.create({ role: 'USER' });
  
  const result = await deleteUser(admin.id, user.id);
  
  expect(result.success).toBe(true);
});

it('should prevent user from deleting other users', async () => {
  const user1 = await userFactory.create({ role: 'USER' });
  const user2 = await userFactory.create({ role: 'USER' });
  
  await expect(deleteUser(user1.id, user2.id))
    .rejects
    .toThrow('Unauthorized');
});
```

### Testing State Transitions

```typescript
it('should transition enrollment from active to completed', async () => {
  const enrollment = await enrollmentFactory.createActive();
  
  const updated = await completeEnrollment(enrollment.id);
  
  expect(updated.status).toBe('COMPLETED');
  expect(updated.completedAt).toBeDefined();
});
```

## Advanced Usage

### Custom Factory Methods

```typescript
// Create user with specific characteristics
const createPremiumUser = async () => {
  const user = await userFactory.create();
  const wallet = await walletFactory.create({
    userId: user.id,
    balance: 10000
  });
  return { user, wallet };
};

it('should process premium feature', async () => {
  const { user, wallet } = await createPremiumUser();
  // Test premium functionality
});
```

### Factory Sequences

```typescript
// Create sequential data
const createCourseSequence = async (count: number) => {
  const instructor = await userFactory.create({ role: 'INSTRUCTOR' });
  const courses = await courseFactory.createMany(count, {
    instructorId: instructor.id
  });
  return { instructor, courses };
};
```

### Factory Traits

```typescript
// Use specialized factory methods
const verifiedUser = await userFactory.createVerified();
const unverifiedUser = await userFactory.createUnverified();
const activeUser = await userFactory.createActive();
const inactiveUser = await userFactory.createInactive();
```

## Troubleshooting

### Factory Not Found

```typescript
// ❌ Wrong import path
import { userFactory } from './factories';

// ✅ Correct import path
import { userFactory } from '../../../tests/factories';
```

### Missing Required Fields

```typescript
// ❌ Missing required relationship
const enrollment = await enrollmentFactory.create();
// Error: userId and courseId are required

// ✅ Provide required fields
const enrollment = await enrollmentFactory.create({
  userId: user.id,
  courseId: course.id
});
```

### Data Not Cleaned Up

```typescript
// ❌ No cleanup
describe('Tests', () => {
  it('test 1', async () => {
    const user = await userFactory.create();
  });
  
  it('test 2', async () => {
    const user = await userFactory.create();
    // Previous test data still exists!
  });
});

// ✅ Proper cleanup
describe('Tests', () => {
  afterEach(async () => {
    await cleanupTestDatabase();
  });
  
  it('test 1', async () => {
    const user = await userFactory.create();
  });
  
  it('test 2', async () => {
    const user = await userFactory.create();
    // Clean slate!
  });
});
```

## Performance Tips

### Minimize Database Calls

```typescript
// ✅ Good - Create only what's needed
it('should validate email format', () => {
  const email = 'test@example.com';
  expect(isValidEmail(email)).toBe(true);
});

// ❌ Bad - Unnecessary database call
it('should validate email format', async () => {
  const user = await userFactory.create();
  expect(isValidEmail(user.email)).toBe(true);
});
```

### Reuse Data When Appropriate

```typescript
describe('Course Tests', () => {
  let instructor;

  beforeEach(async () => {
    instructor = await userFactory.create({ role: 'INSTRUCTOR' });
  });

  it('should create course', async () => {
    const course = await courseFactory.create({
      instructorId: instructor.id
    });
    expect(course).toBeDefined();
  });

  it('should update course', async () => {
    const course = await courseFactory.create({
      instructorId: instructor.id
    });
    // Use same instructor
  });
});
```

## Resources

- [Testing Standards](./TESTING-STANDARDS.md)
- [Test Writing Guide](./TEST-WRITING-GUIDE.md)
- [Mock Service Guide](./MOCK-GUIDE.md)
