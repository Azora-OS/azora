# Testing Guidelines

## Test Coverage Requirements

**Minimum**: 80% coverage across all code

## Test Types

### Unit Tests
```typescript
describe('ConsentManager', () => {
  it('should record user consent', async () => {
    const result = await consentManager.recordConsent({
      userId: 'test-user',
      consentType: ConsentType.ANALYTICS,
      granted: true,
      timestamp: new Date()
    });
    expect(result).toBeDefined();
  });
});
```

### Integration Tests
```typescript
describe('API Integration', () => {
  it('should authenticate and fetch user profile', async () => {
    const token = await login('test@azora.world', 'password');
    const profile = await getProfile(token);
    expect(profile.email).toBe('test@azora.world');
  });
});
```

### E2E Tests
```typescript
test('Complete user journey', async ({ page }) => {
  await page.goto('/signup');
  await page.fill('[name="email"]', 'test@azora.world');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL('/dashboard');
});
```

## Running Tests

```bash
# All tests
npm test

# Unit tests only
npm run test:unit

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e

# With coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

## Test Structure

```
tests/
├── unit/           # Unit tests
├── integration/    # Integration tests
├── e2e/           # End-to-end tests
└── performance/   # Load tests
```

## Best Practices

1. **Arrange-Act-Assert**: Structure tests clearly
2. **One Assertion**: Test one thing per test
3. **Descriptive Names**: Use clear test descriptions
4. **Mock External**: Mock external dependencies
5. **Clean Up**: Reset state after tests

## Coverage Enforcement

Coverage checked in CI/CD:
```json
{
  "coverageThreshold": {
    "global": {
      "branches": 80,
      "functions": 80,
      "lines": 80,
      "statements": 80
    }
  }
}
```
