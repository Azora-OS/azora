# Testing Guide

## Structure

```
tests/
├── e2e/              # Playwright E2E tests
│   ├── auth/
│   └── education/
├── integration/      # Integration tests
└── __tests__/        # Unit tests
```

## Running Tests

```bash
# All tests
npm test

# Unit tests
npm run test:unit

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage
```

## Writing Tests

### Unit Tests
```typescript
import { userFactory } from '@azora/test-utils';

describe('UserService', () => {
  it('should create user', async () => {
    const user = userFactory.create();
    const result = await service.create(user);
    expect(result).toBeDefined();
  });
});
```

### E2E Tests
```typescript
import { test, expect } from '@playwright/test';

test('should login', async ({ page }) => {
  await page.goto('/login');
  await page.fill('[name="email"]', 'test@test.com');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL('/dashboard');
});
```

## Coverage Threshold

Minimum 80% coverage required for:
- Branches
- Functions
- Lines
- Statements
