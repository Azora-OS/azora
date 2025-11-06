# Azora OS - Testing Guide

## Overview

This directory contains mock API handlers for testing Azora OS services without spinning up the entire backend infrastructure.

## Mock Service Worker (MSW)

MSW intercepts network requests at the API level during testing, allowing for:
- ✅ Fast, independent testing of frontend applications
- ✅ Consistent test data across environments
- ✅ No need to run 190+ microservices for testing
- ✅ Offline development capability

## Installation

To enable MSW in your tests:

```bash
npm install msw --save-dev
```

## Setup

### For Jest Tests

Create or update `jest.setup.js`:

```javascript
import { server } from './mocks/server';

// Establish API mocking before all tests
beforeAll(() => server.listen());

// Reset any request handlers that are declared in a test
afterEach(() => server.resetHandlers());

// Clean up after the tests are finished
afterAll(() => server.close());
```

### For Playwright Tests

Add to your `playwright.config.ts`:

```typescript
import { defineConfig } from '@playwright/test';

export default defineConfig({
  // ... other config
  use: {
    // Enable API mocking
    baseURL: 'http://localhost:3000',
  },
  webServer: {
    command: 'npm run dev',
    port: 3000,
    reuseExistingServer: !process.env.CI,
  },
});
```

## Usage

### In Component Tests

```typescript
import { render, screen, waitFor } from '@testing-library/react';
import { server } from '@/mocks/server';
import { rest } from 'msw';
import LoginForm from './LoginForm';

describe('LoginForm', () => {
  it('shows error on invalid credentials', async () => {
    // Override the default handler for this test
    server.use(
      rest.post('/api/auth/login', (req, res, ctx) => {
        return res(
          ctx.status(401),
          ctx.json({ message: 'Invalid credentials' })
        );
      })
    );

    render(<LoginForm />);
    
    // ... test implementation
  });
});
```

### In Integration Tests

```typescript
import { test, expect } from '@playwright/test';

test('user can enroll in a course', async ({ page }) => {
  // Navigate to courses page
  await page.goto('/courses');
  
  // Click on a course
  await page.click('text=Introduction to AI');
  
  // Enroll in course
  await page.click('button:has-text("Enroll")');
  
  // Verify enrollment
  await expect(page.locator('text=Successfully enrolled')).toBeVisible();
});
```

## Available Mock Handlers

### Authentication (`mocks/handlers/auth.ts`)
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user

### Courses (`mocks/handlers/courses.ts`)
- `GET /api/courses` - List courses
- `GET /api/courses/:id` - Get course details
- `POST /api/courses/:id/enroll` - Enroll in course

## Adding New Handlers

1. Create a new file in `mocks/handlers/`:

```typescript
// mocks/handlers/payments.ts
import { rest } from 'msw';

export const paymentHandlers = [
  rest.post('/api/payments/process', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        transactionId: 'mock-tx-123',
      })
    );
  }),
];
```

2. Add to `mocks/handlers/index.ts`:

```typescript
import { paymentHandlers } from './payments';

export const handlers = [
  ...authHandlers,
  ...courseHandlers,
  ...paymentHandlers, // Add new handlers here
];
```

## Testing Best Practices

### 1. Test User Journeys, Not Implementation
```typescript
// ✅ Good - tests user behavior
test('user can complete checkout', async ({ page }) => {
  await page.click('text=Add to Cart');
  await page.click('text=Checkout');
  await page.fill('[name=cardNumber]', '4242424242424242');
  await page.click('text=Pay');
  await expect(page.locator('text=Payment successful')).toBeVisible();
});

// ❌ Bad - tests implementation details
test('checkout calls payment API', async () => {
  const spy = jest.spyOn(paymentService, 'processPayment');
  // ...
});
```

### 2. Use Realistic Test Data
```typescript
// ✅ Good
const testUser = {
  email: 'student@azora.es',
  name: 'Test Student',
  studentNumber: 'S2024001',
};

// ❌ Bad
const testUser = {
  email: 'test@test.com',
  name: 'Test',
  studentNumber: '123',
};
```

### 3. Test Error States
```typescript
test('shows error message when payment fails', async ({ page }) => {
  // Mock payment failure
  server.use(
    rest.post('/api/payments/process', (req, res, ctx) => {
      return res(
        ctx.status(402),
        ctx.json({ code: 1300, message: 'Payment failed' })
      );
    })
  );

  // ... test error handling
});
```

### 4. Clean Up Between Tests
```typescript
afterEach(() => {
  // Reset handlers to default
  server.resetHandlers();
  
  // Clear any stored state
  localStorage.clear();
  sessionStorage.clear();
});
```

## Debugging Tests

### Enable MSW Logging

```typescript
// In your test file
import { server } from '@/mocks/server';

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'warn' });
});
```

### Inspect Network Requests

```typescript
test('debugging network requests', async () => {
  // Temporarily spy on requests
  server.events.on('request:start', (req) => {
    console.log('Request:', req.method, req.url.href);
  });

  // Your test code
});
```

## Performance Testing

For services handling sensitive data (azora-mint, azora-aegis):

```typescript
import { performance } from 'perf_hooks';

test('payment processing completes within 3 seconds', async () => {
  const start = performance.now();
  
  await processPayment({
    amount: 100,
    currency: 'USD',
  });
  
  const duration = performance.now() - start;
  expect(duration).toBeLessThan(3000);
});
```

## Contract Testing

Ensure mock responses match real API:

```typescript
import { validateResponse } from '@/lib/api-validator';

test('mock response matches API contract', () => {
  const mockResponse = {
    id: '123',
    email: 'test@azora.es',
    name: 'Test User',
  };

  // Validate against OpenAPI schema or Zod schema
  expect(() => validateResponse(mockResponse, UserSchema)).not.toThrow();
});
```

## CI/CD Integration

```yaml
# .github/workflows/test.yml
name: Test

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm test
      - run: npm run test:e2e
```

## Resources

- [MSW Documentation](https://mswjs.io/)
- [Playwright Testing](https://playwright.dev/)
- [Jest Documentation](https://jestjs.io/)
- [Testing Library](https://testing-library.com/)
