# Testing Documentation

Welcome to the Azora OS testing documentation. This directory contains all the resources you need to write, maintain, and improve tests.

---

## 📚 Documentation Index

### Getting Started

- **[Testing Standards](./TESTING-STANDARDS.md)** - Core testing principles and conventions
- **[Test Writing Guide](./TEST-WRITING-GUIDE.md)** - Step-by-step guide to writing tests
- **[Testing Checklist](./TESTING-CHECKLIST.md)** - Comprehensive checklist for testing tasks

### Test Development

- **[Factory Guide](./FACTORY-GUIDE.md)** - Using test data factories
- **[Mock Guide](./MOCK-GUIDE.md)** - Mocking external services
- **[Code Review Checklist](./CODE-REVIEW-CHECKLIST.md)** - Reviewing test code

### Advanced Topics

- **[Test Optimization Guide](./TEST-OPTIMIZATION-GUIDE.md)** - Performance optimization
- **[Test Execution Optimization](./TEST-EXECUTION-OPTIMIZATION.md)** - Parallel and selective testing
- **[Troubleshooting](./TROUBLESHOOTING.md)** - Common issues and solutions

### Reference

- **[Minimum Coverage Requirements](./MINIMUM-COVERAGE-REQUIREMENTS.md)** - Coverage thresholds
- **[Test Templates](../../tests/templates/)** - Starter templates for tests

---

## 🚀 Quick Start

### Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific test file
npm test -- path/to/test.test.ts

# Run in watch mode
npm test -- --watch

# Run only changed tests
npm test -- --onlyChanged
```

### Writing Your First Test

1. Choose the appropriate test type (unit/integration/e2e)
2. Copy a template from `tests/templates/`
3. Follow the AAA pattern: Arrange, Act, Assert
4. Use factories for test data
5. Mock external dependencies
6. Run and verify your test

Example:
```typescript
import { describe, it, expect } from '@jest/globals';
import { createTestUser } from '@/tests/factories';

describe('UserService', () => {
  it('should create a new user', async () => {
    // Arrange
    const userData = { email: 'test@example.com', password: 'password123' };
    
    // Act
    const user = await createTestUser(userData);
    
    // Assert
    expect(user.email).toBe('test@example.com');
    expect(user.id).toBeDefined();
  });
});
```

---

## 📊 Coverage Requirements

| Service Type | Minimum | Target |
|--------------|---------|--------|
| Critical (auth, payment) | 80% | 90% |
| High Priority (education, marketplace) | 70% | 85% |
| Standard Services | 60% | 75% |
| Support Services | 50% | 65% |

See [Minimum Coverage Requirements](./MINIMUM-COVERAGE-REQUIREMENTS.md) for details.

---

## 🎯 Test Types

### Unit Tests (60% of coverage)
- **Purpose:** Test individual functions in isolation
- **Speed:** Fast (<100ms)
- **Location:** Same directory as source or `tests/unit/`
- **Template:** [unit.test.template.ts](../../tests/templates/unit.test.template.ts)

### Integration Tests (30% of coverage)
- **Purpose:** Test component interactions
- **Speed:** Medium (100ms-1s)
- **Location:** `tests/integration/`
- **Template:** [integration.test.template.ts](../../tests/templates/integration.test.template.ts)

### E2E Tests (10% of coverage)
- **Purpose:** Test complete user journeys
- **Speed:** Slow (1s-10s)
- **Location:** `tests/e2e/`
- **Template:** [e2e.test.template.ts](../../tests/templates/e2e.test.template.ts)

---

## 🛠️ Tools and Utilities

### Test Infrastructure
- **Jest** - Test runner and framework
- **Playwright** - E2E testing
- **Prisma** - Database testing
- **Redis** - Cache testing

### Test Utilities
- **Factories** - Generate test data (`tests/factories/`)
- **Mocks** - Mock external services (`tests/mocks/`)
- **Database Utils** - Database setup/cleanup (`tests/utils/database.ts`)
- **Redis Utils** - Redis setup/cleanup (`tests/utils/redis.ts`)

### CI/CD Integration
- **GitHub Actions** - Automated testing
- **Coverage Gates** - Enforce coverage thresholds
- **PR Comments** - Automated test reports

---

## 📋 Checklists

### Before Writing Tests
- [ ] Review existing tests for similar features
- [ ] Identify critical paths to test
- [ ] Choose appropriate test type
- [ ] Review testing standards

### Writing Tests
- [ ] Use descriptive test names
- [ ] Follow AAA pattern
- [ ] Use factories for test data
- [ ] Mock external dependencies
- [ ] Clean up after tests
- [ ] Verify tests pass

### Before Committing
- [ ] Run tests locally
- [ ] Check coverage
- [ ] Fix failing tests
- [ ] Update documentation
- [ ] Run linter

### Before PR
- [ ] All tests pass in CI
- [ ] Coverage meets requirements
- [ ] Test documentation updated
- [ ] PR checklist completed

---

## 🎓 Best Practices

### Do's ✅
- Write tests before or with code (TDD)
- Test behavior, not implementation
- Keep tests independent and isolated
- Use meaningful assertions
- Clean up test data
- Write descriptive test names
- Mock external dependencies
- Test error scenarios

### Don'ts ❌
- Write tests without assertions
- Share state between tests
- Use production data
- Ignore flaky tests
- Test implementation details
- Write slow tests
- Skip error cases
- Hardcode test data

---

## 🔧 Troubleshooting

### Common Issues

**Tests failing locally?**
- Check database connection
- Verify Redis is running
- Review environment variables
- Check test isolation

**Coverage not updating?**
- Clear coverage cache: `rm -rf coverage/`
- Run with coverage flag: `npm test -- --coverage`
- Check Jest configuration

**Tests are slow?**
- Use test parallelization
- Optimize database operations
- Review mock performance
- Check for unnecessary waits

See [Troubleshooting Guide](./TROUBLESHOOTING.md) for more solutions.

---

## 📈 Monitoring

### Coverage Dashboard
- **Local:** `open coverage/index.html`
- **CI/CD:** GitHub Actions artifacts
- **Trends:** Coverage history tracking

### Test Health
- **Pass Rate:** Track test reliability
- **Flaky Tests:** Identify intermittent failures
- **Slow Tests:** Monitor performance
- **Coverage Trends:** Track improvements

---

## 🤝 Contributing

### Adding Tests
1. Choose appropriate test type
2. Use test templates
3. Follow naming conventions
4. Add test documentation
5. Ensure tests pass
6. Update coverage metrics

### Improving Documentation
1. Identify gaps or unclear sections
2. Make improvements
3. Add examples
4. Update index
5. Submit PR

---

## 📞 Getting Help

### Resources
- Review documentation in this directory
- Check test templates and examples
- Consult troubleshooting guide
- Review existing tests

### Support Channels
- **Documentation:** This directory
- **Examples:** `tests/templates/`
- **Team Chat:** #testing channel
- **Issues:** GitHub Issues

---

## 🎯 Goals

### Current Status
- Overall Coverage: ~50%
- Passing Tests: 88/88 suites
- Critical Path Coverage: ~80%

### Short-term (3 months)
- Overall Coverage: 60%
- Critical Path Coverage: 90%
- All critical services: 70%+

### Long-term (6 months)
- Overall Coverage: 70%
- Critical Path Coverage: 95%
- All services: 60%+

---

## 📝 Quick Reference

### Commands
```bash
npm test                      # Run all tests
npm test -- --coverage        # Run with coverage
npm test -- --watch           # Watch mode
npm run test:reminder         # Show testing reminders
npm run test:checklist        # Show full checklist
npm run coverage:check        # Check coverage gates
```

### Files
```
docs/testing/                 # Testing documentation
tests/templates/              # Test templates
tests/factories/              # Test data factories
tests/mocks/                  # Mock services
tests/utils/                  # Test utilities
.github/workflows/test.yml    # CI/CD workflow
```

### Coverage Thresholds
- Critical: 80%+
- High Priority: 70%+
- Standard: 60%+
- Support: 50%+

---

**Happy Testing! 🚀**

For questions or improvements, please open an issue or contact the testing team.
