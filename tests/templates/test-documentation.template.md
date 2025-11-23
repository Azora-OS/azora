# Test Documentation Template

## Test Suite: [Service/Feature Name]

### Overview
Brief description of what this test suite covers and why it's important.

**Service/Module:** [Name]  
**Test Type:** [Unit/Integration/E2E]  
**Coverage Target:** [Percentage]  
**Last Updated:** [Date]

---

## Test Coverage

### Current Coverage
- **Lines:** X%
- **Branches:** X%
- **Functions:** X%
- **Statements:** X%

### Critical Paths Covered
- [ ] User registration flow
- [ ] Authentication flow
- [ ] Payment processing
- [ ] Data persistence
- [ ] Error handling

### Known Gaps
List areas that need additional test coverage:
1. Edge case: [Description]
2. Error scenario: [Description]
3. Integration: [Description]

---

## Test Structure

### Test Files
```
tests/
├── unit/
│   ├── service.test.ts          # Core service logic
│   └── utils.test.ts            # Utility functions
├── integration/
│   └── workflow.integration.test.ts
└── e2e/
    └── user-journey.e2e.test.ts
```

### Test Organization
- **Unit Tests:** Test individual functions in isolation
- **Integration Tests:** Test service interactions
- **E2E Tests:** Test complete user workflows

---

## Test Data

### Factories Used
- `createTestUser()` - Creates test users with various roles
- `createTestCourse()` - Creates test courses
- `createTestTransaction()` - Creates test financial transactions

### Test Database
- **Database:** azora_test
- **Migrations:** Run automatically before tests
- **Cleanup:** Automatic after each test

### Mock Services
- Stripe API - Payment processing
- OpenAI API - AI completions
- Email Service - Email sending
- S3 - File storage

---

## Running Tests

### Run All Tests
```bash
npm test
```

### Run Specific Suite
```bash
npm test -- tests/path/to/test.test.ts
```

### Run with Coverage
```bash
npm test -- --coverage
```

### Run in Watch Mode
```bash
npm test -- --watch
```

### Debug Tests
```bash
node --inspect-brk node_modules/.bin/jest --runInBand
```

---

## Test Scenarios

### Scenario 1: [Happy Path]
**Description:** Test the main success flow

**Setup:**
```typescript
const user = await createTestUser();
const course = await createTestCourse();
```

**Expected Behavior:**
- User can enroll in course
- Payment is processed
- Enrollment is recorded

**Assertions:**
```typescript
expect(enrollment.status).toBe('active');
expect(payment.status).toBe('succeeded');
```

### Scenario 2: [Error Case]
**Description:** Test error handling

**Setup:**
```typescript
const user = await createTestUser();
// Simulate payment failure
mockStripe.paymentIntents.create.mockRejectedValue(new Error('Card declined'));
```

**Expected Behavior:**
- Error is caught and handled
- User receives error message
- No enrollment is created

**Assertions:**
```typescript
expect(result.error).toBeDefined();
expect(enrollment).toBeNull();
```

---

## Dependencies

### External Services
- PostgreSQL (test database)
- Redis (test instance)
- Stripe (test mode)

### Test Libraries
- Jest - Test runner
- Playwright - E2E testing
- Faker - Test data generation
- Supertest - API testing

---

## Maintenance

### Flaky Tests
List any tests that occasionally fail:
- `test name` - Reason: [Description] - Status: [Investigating/Fixed]

### Slow Tests
Tests that take longer than 1 second:
- `test name` - Duration: Xs - Optimization: [Planned/In Progress]

### Disabled Tests
Tests that are temporarily disabled:
- `test name` - Reason: [Description] - Ticket: [Link]

---

## Troubleshooting

### Common Issues

#### Database Connection Errors
**Problem:** Tests fail with "Cannot connect to database"  
**Solution:** Ensure PostgreSQL is running and DATABASE_URL is set in .env.test

#### Redis Connection Errors
**Problem:** Tests fail with "Redis connection refused"  
**Solution:** Start Redis on port 6380 or update REDIS_URL in .env.test

#### Mock Not Working
**Problem:** Mock service not intercepting calls  
**Solution:** Ensure mock is set up in beforeEach and reset in afterEach

#### Timeout Errors
**Problem:** Tests timeout after 5 seconds  
**Solution:** Increase timeout or optimize slow operations

---

## Contributing

### Adding New Tests
1. Choose appropriate test type (unit/integration/e2e)
2. Use test templates from `tests/templates/`
3. Follow naming conventions
4. Add test documentation
5. Ensure tests pass locally
6. Update coverage metrics

### Test Review Checklist
- [ ] Tests follow AAA pattern (Arrange, Act, Assert)
- [ ] Test names clearly describe behavior
- [ ] Tests are independent and isolated
- [ ] Mocks are properly set up and cleaned up
- [ ] Test data is cleaned up after tests
- [ ] Coverage meets minimum threshold
- [ ] Tests run in CI/CD pipeline

---

## References

- [Testing Standards](../../docs/testing/TESTING-STANDARDS.md)
- [Test Writing Guide](../../docs/testing/TEST-WRITING-GUIDE.md)
- [Factory Guide](../../docs/testing/FACTORY-GUIDE.md)
- [Mock Guide](../../docs/testing/MOCK-GUIDE.md)
- [Troubleshooting](../../docs/testing/TROUBLESHOOTING.md)

---

## Metrics

### Test Execution
- **Total Tests:** X
- **Passing:** X
- **Failing:** X
- **Skipped:** X
- **Duration:** Xs

### Reliability
- **Pass Rate:** X%
- **Flaky Tests:** X
- **Average Duration:** Xs

### Trends (Last 30 Days)
- Coverage: [Trend]
- Pass Rate: [Trend]
- Duration: [Trend]
