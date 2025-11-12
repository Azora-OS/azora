# @azora/sdk

Official TypeScript/JavaScript SDK for the Azora OS platform.

## Installation

```bash
npm install @azora/sdk
```

## Quick Start

```typescript
import { AzoraClient } from '@azora/sdk';

// Initialize the client
const azora = new AzoraClient({
  apiKey: 'your-api-key',
  environment: 'development', // or 'staging', 'production'
  debug: true // Enable debug logging
});

// Login
const loginResult = await azora.auth.login('user@example.com', 'password');
if (loginResult.success) {
  console.log('Logged in as:', loginResult.data?.user.name);
  
  // Store tokens
  azora.setAuthToken(
    loginResult.data!.accessToken,
    loginResult.data!.refreshToken
  );
}

// Get courses
const courses = await azora.education.getCourses();
if (courses.success) {
  console.log('Available courses:', courses.data);
}

// Enroll in a course
const enrollment = await azora.education.enrollInCourse('course-id', 'user-id');
if (enrollment.success) {
  console.log('Enrolled! ID:', enrollment.enrollmentId);
}

// Check wallet balance
const balance = await azora.payment.getBalance('user-id');
if (balance.success) {
  console.log('Balance:', balance.data);
}
```

## Services

### Authentication Service

```typescript
// Register
const result = await azora.auth.register(
  'user@example.com',
  'password',
  'John Doe',
  'student' // or 'educator'
);

// Login
const login = await azora.auth.login('user@example.com', 'password');

// Get profile
const profile = await azora.auth.profile();

// Update profile
const updated = await azora.auth.updateProfile({ name: 'Jane Doe' });

// Logout
await azora.auth.logout();
```

### Education Service

```typescript
// List courses
const courses = await azora.education.getCourses({
  difficulty: 'beginner',
  limit: 10
});

// Get specific course
const course = await azora.education.getCourse('course-id');

// Enroll
const enrollment = await azora.education.enrollInCourse('course-id', 'user-id');

// Check progress
const progress = await azora.education.getProgress('user-id', 'course-id');

// Update progress
const updated = await azora.education.updateProgress(
  'user-id',
  'course-id',
  'lesson-id'
);

// Get enrollments
const enrolled = await azora.education.getEnrollments('user-id');

// Create course (educators only)
const newCourse = await azora.education.createCourse({
  title: 'Introduction to Python',
  description: 'Learn Python basics',
  instructor: 'instructor-id',
  duration: 20,
  price: 99,
  currency: 'AZR'
});
```

### Payment Service

```typescript
// Create payment
const payment = await azora.payment.createPayment(
  99.99,
  'AZR',
  'user-id',
  'Course enrollment'
);

// Get balance
const balance = await azora.payment.getBalance('user-id');

// List transactions
const transactions = await azora.payment.listTransactions('user-id', {
  limit: 20,
  type: 'credit'
});

// Earn tokens (learn-to-earn)
const earned = await azora.payment.earnTokens(
  'user-id',
  10,
  'Completed lesson'
);

// Transfer tokens
const transfer = await azora.payment.transfer(
  'from-user-id',
  'to-user-id',
  50,
  'AZR'
);

// Refund
const refund = await azora.payment.refund('transaction-id', 'User request');
```

### Safety Service

```typescript
// Report incident
const incident = await azora.safety.reportIncident({
  type: 'emergency',
  severity: 'high',
  location: {
    latitude: -26.2041,
    longitude: 28.0473
  },
  description: 'Medical emergency at campus',
  reportedBy: 'user-id'
});

// Get incidents
const incidents = await azora.safety.getIncidents({
  severity: 'high',
  status: 'open'
});

// Get nearby incidents
const nearby = await azora.safety.getNearbyIncidents(
  -26.2041,
  28.0473,
  5 // radius in km
);

// Update incident
const updated = await azora.safety.updateIncident('incident-id', {
  status: 'resolved'
});
```

## Configuration

```typescript
const azora = new AzoraClient({
  apiKey: 'your-api-key',              // Required
  environment: 'production',            // Optional: 'development', 'staging', 'production'
  baseURL: 'https://custom-api.com',   // Optional: Override default base URL
  timeout: 30000,                       // Optional: Request timeout in ms (default: 30000)
  retries: 3,                          // Optional: Number of retries (default: 3)
  debug: false                         // Optional: Enable debug logs (default: false)
});
```

## Error Handling

All SDK methods return responses with a `success` field:

```typescript
const result = await azora.auth.login('email', 'password');

if (result.success) {
  // Operation succeeded
  console.log(result.data);
} else {
  // Operation failed
  console.error(result.error);
}
```

## Token Management

The SDK automatically handles token storage and refresh:

```typescript
// Tokens are automatically stored after login
await azora.auth.login('email', 'password');

// Manually set tokens
azora.setAuthToken('access-token', 'refresh-token');

// Clear tokens
azora.clearAuth();

// Tokens are automatically refreshed on 401 errors
```

## TypeScript Support

Full TypeScript support with complete type definitions:

```typescript
import { 
  AzoraClient, 
  User, 
  Course, 
  ApiResponse 
} from '@azora/sdk';

const azora = new AzoraClient({ apiKey: 'key' });

// All responses are typed
const result: ApiResponse<User> = await azora.auth.profile();
```

## Health Check

```typescript
const health = await azora.healthCheck();
if (health.healthy) {
  console.log('API is healthy. Version:', health.version);
}
```

## Ubuntu Philosophy

This SDK embodies the Ubuntu philosophy: **"I am because we are"**

- All operations consider collective benefit
- Token earnings support community prosperity
- Safety features protect everyone
- Learning advances shared knowledge

## Support

- **Documentation**: https://docs.azora.world
- **Issues**: https://github.com/Sizwe780/azora-os/issues
- **Discord**: https://discord.gg/azora
- **Email**: sdk@azora.world

## License

MIT License - See LICENSE file for details

---

**"Ngiyakwazi ngoba sikwazi" - I can because we can**
