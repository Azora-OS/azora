# E2E Test Suite

## Overview

Comprehensive end-to-end tests using Playwright covering critical user journeys.

## Test Coverage

### Authentication (`auth.spec.ts`)
- User registration
- User login
- Invalid credentials handling
- User logout

### Course Enrollment (`enrollment.spec.ts`)
- Browse courses
- View course details
- Enroll in free courses
- Access enrolled courses

### Payment Processing (`payment.spec.ts`)
- Add course to cart
- Proceed to checkout
- Complete payment with test card
- Handle payment failures

## Running Tests

### Local Development
```bash
# Run all E2E tests
npm run test:e2e

# Run specific test file
npx playwright test auth.spec.ts

# Run in headed mode (see browser)
npx playwright test --headed

# Run in debug mode
npx playwright test --debug
```

### Staging Environment
```bash
npm run test:e2e:staging
```

### Production Environment
```bash
npm run test:e2e:production
```

### Smoke Tests Only
```bash
npm run test:smoke:staging
npm run test:smoke:production
```

## Test Data Setup

Tests use `setup.ts` to create test users and data before running.
Tests use `teardown.ts` to cleanup after completion.

### Test User Credentials
- Email: `test@azora.world`
- Password: `TestPass123!`

## Stripe Test Cards

### Successful Payment
- Card: `4242 4242 4242 4242`
- Expiry: Any future date
- CVC: Any 3 digits

### Failed Payment
- Card: `4000 0000 0000 0002`
- Expiry: Any future date
- CVC: Any 3 digits

## CI/CD Integration

Tests run automatically:
- On staging deployment (all E2E tests)
- On production deployment (smoke tests only)

See `.github/workflows/deploy.yml` for configuration.

## Debugging Failed Tests

### View Test Report
```bash
npx playwright show-report
```

### View Traces
```bash
npx playwright show-trace test-results/trace.zip
```

### Screenshots and Videos
Failed tests automatically capture:
- Screenshots: `test-results/screenshots/`
- Videos: `test-results/videos/`

## Best Practices

1. **Use data-testid attributes** for stable selectors
2. **Wait for elements** before interacting
3. **Clean up test data** in teardown
4. **Use test isolation** - each test should be independent
5. **Mock external services** when possible

## Adding New Tests

1. Create new `.spec.ts` file in `tests/e2e/`
2. Follow existing test structure
3. Add setup/teardown if needed
4. Update this README with new test coverage
