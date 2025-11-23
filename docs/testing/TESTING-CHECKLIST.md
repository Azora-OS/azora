# Testing Checklist

Use this checklist when writing tests, reviewing code, or preparing for deployment.

---

## Pre-Development Checklist

Before starting a new feature:

- [ ] Review existing tests for similar features
- [ ] Identify critical paths that need testing
- [ ] Plan test strategy (unit/integration/e2e)
- [ ] Set up test data factories if needed
- [ ] Review testing standards and guidelines

---

## Writing Tests Checklist

### Unit Tests

- [ ] Test file follows naming convention: `[filename].test.ts`
- [ ] Tests are organized in `describe` blocks
- [ ] Each test has a clear, descriptive name
- [ ] Tests follow AAA pattern (Arrange, Act, Assert)
- [ ] All public methods are tested
- [ ] Edge cases and boundary conditions are covered
- [ ] Error cases are tested
- [ ] Tests are independent (no shared state)
- [ ] Mocks are properly set up and cleaned up
- [ ] Tests run in under 100ms each
- [ ] No hardcoded values (use constants or factories)
- [ ] Assertions are specific and meaningful

### Integration Tests

- [ ] Test file follows naming convention: `[feature].integration.test.ts`
- [ ] Tests use real database with test data
- [ ] Database is cleaned up after each test
- [ ] Tests verify data consistency
- [ ] Service interactions are tested
- [ ] Transaction handling is verified
- [ ] Cache synchronization is tested
- [ ] Tests are isolated from each other
- [ ] External services are mocked appropriately
- [ ] Tests run in under 1 second each

### E2E Tests

- [ ] Test file follows naming convention: `[feature].e2e.test.ts`
- [ ] Tests cover critical user journeys
- [ ] Tests use stable selectors (data-testid)
- [ ] Tests wait for elements explicitly
- [ ] Error scenarios are tested
- [ ] Accessibility is verified
- [ ] Performance budgets are checked
- [ ] Tests clean up test data
- [ ] Tests are not flaky
- [ ] Tests run in under 10 seconds each

---

## Code Quality Checklist

### Test Code Quality

- [ ] Tests are readable and maintainable
- [ ] Test names describe behavior, not implementation
- [ ] No duplicate test code (use helpers/factories)
- [ ] Comments explain complex test scenarios
- [ ] Test data is realistic and meaningful
- [ ] Magic numbers are replaced with named constants
- [ ] Tests don't test implementation details
- [ ] Tests focus on behavior and outcomes

### Coverage Quality

- [ ] New code has 60%+ coverage
- [ ] Critical paths have 90%+ coverage
- [ ] All error paths are tested
- [ ] Branch coverage is adequate
- [ ] No trivial tests just for coverage
- [ ] Coverage report reviewed
- [ ] Coverage gaps documented

---

## Code Review Checklist

### For Authors

Before requesting review:

- [ ] All tests pass locally
- [ ] Coverage meets minimum requirements
- [ ] No flaky tests
- [ ] Test documentation is updated
- [ ] CI/CD pipeline passes
- [ ] Coverage report reviewed
- [ ] Test performance is acceptable

### For Reviewers

When reviewing tests:

- [ ] Tests are meaningful and valuable
- [ ] Test names are clear and descriptive
- [ ] Tests follow project standards
- [ ] Coverage is adequate for changes
- [ ] No obvious test gaps
- [ ] Tests are maintainable
- [ ] Mocks are appropriate
- [ ] Test data is cleaned up
- [ ] No flaky tests introduced
- [ ] Performance is acceptable

---

## Pre-Commit Checklist

Before committing code:

- [ ] Run tests locally: `npm test`
- [ ] Check coverage: `npm test -- --coverage`
- [ ] Fix any failing tests
- [ ] Review coverage report
- [ ] Update test documentation if needed
- [ ] Run linter: `npm run lint`
- [ ] Format code: `npm run format`
- [ ] Stage test files with code changes

---

## Pull Request Checklist

### Before Creating PR

- [ ] All tests pass in CI/CD
- [ ] Coverage meets requirements
- [ ] No coverage regression
- [ ] Test documentation updated
- [ ] PR description includes test summary
- [ ] Screenshots/videos for UI changes
- [ ] Breaking changes documented

### PR Description

Include in PR description:

- [ ] What was tested
- [ ] Test coverage percentage
- [ ] Critical paths covered
- [ ] Known limitations
- [ ] Manual testing performed

### After PR Approval

- [ ] Final CI/CD check passes
- [ ] Coverage gates pass
- [ ] No merge conflicts
- [ ] Squash commits if needed
- [ ] Update changelog if needed

---

## Deployment Checklist

### Pre-Deployment

- [ ] All tests pass in staging
- [ ] Coverage meets production requirements
- [ ] Critical path tests verified
- [ ] Performance tests pass
- [ ] Security tests pass
- [ ] Load tests pass (if applicable)
- [ ] Smoke tests prepared

### Post-Deployment

- [ ] Run smoke tests in production
- [ ] Monitor error rates
- [ ] Check performance metrics
- [ ] Verify critical paths work
- [ ] Review logs for issues
- [ ] Update test documentation

---

## Maintenance Checklist

### Weekly

- [ ] Review test health report
- [ ] Identify flaky tests
- [ ] Check test performance
- [ ] Review coverage trends
- [ ] Address failing tests
- [ ] Update test documentation

### Monthly

- [ ] Review coverage gaps
- [ ] Identify slow tests
- [ ] Optimize test performance
- [ ] Update test data factories
- [ ] Review mock services
- [ ] Update testing standards

### Quarterly

- [ ] Review testing strategy
- [ ] Update coverage requirements
- [ ] Audit test quality
- [ ] Review test infrastructure
- [ ] Update test templates
- [ ] Training for new patterns

---

## Troubleshooting Checklist

### When Tests Fail

- [ ] Read the error message carefully
- [ ] Check if test is flaky (run multiple times)
- [ ] Verify test environment setup
- [ ] Check database state
- [ ] Verify mock configuration
- [ ] Review recent code changes
- [ ] Check for race conditions
- [ ] Review test logs
- [ ] Consult troubleshooting guide

### When Coverage Drops

- [ ] Identify which files lost coverage
- [ ] Check if code was deleted
- [ ] Verify tests are running
- [ ] Check coverage configuration
- [ ] Review excluded files
- [ ] Add missing tests
- [ ] Update coverage baseline

### When Tests Are Slow

- [ ] Identify slow tests
- [ ] Check for unnecessary waits
- [ ] Optimize database operations
- [ ] Review mock performance
- [ ] Check for memory leaks
- [ ] Use test parallelization
- [ ] Profile test execution

---

## Quick Reference

### Common Commands

```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific test
npm test -- path/to/test.test.ts

# Run in watch mode
npm test -- --watch

# Run only changed tests
npm test -- --onlyChanged

# Update snapshots
npm test -- -u

# Debug tests
node --inspect-brk node_modules/.bin/jest --runInBand
```

### Coverage Thresholds

| Service Type | Minimum | Target |
|--------------|---------|--------|
| Critical | 80% | 90% |
| High Priority | 70% | 85% |
| Standard | 60% | 75% |
| Support | 50% | 65% |

### Test Types

| Type | Purpose | Speed | Coverage |
|------|---------|-------|----------|
| Unit | Test functions | Fast | 60% |
| Integration | Test interactions | Medium | 30% |
| E2E | Test journeys | Slow | 10% |

---

## Resources

- [Testing Standards](./TESTING-STANDARDS.md)
- [Test Writing Guide](./TEST-WRITING-GUIDE.md)
- [Code Review Checklist](./CODE-REVIEW-CHECKLIST.md)
- [Troubleshooting Guide](./TROUBLESHOOTING.md)
- [Test Templates](../../tests/templates/)

---

## Need Help?

- Check the [FAQ](./TESTING-STANDARDS.md#faq)
- Review [examples](../../tests/templates/)
- Consult [troubleshooting guide](./TROUBLESHOOTING.md)
- Ask in #testing channel
- Contact the testing team
