# Testing Documentation

Comprehensive testing documentation for the Azora ecosystem.

## Quick Links

- 🚀 [Quick Reference](./SERVICE-TEST-QUICK-REFERENCE.md) - Fast access to commands and patterns
- 📊 [Service Test Status](./SERVICE-TEST-STATUS.md) - Current status of all services
- 📝 [Testing Standards](./TESTING-STANDARDS.md) - Comprehensive testing guidelines
- 📖 [Test Writing Guide](./TEST-WRITING-GUIDE.md) - How to write effective tests
- 🏭 [Factory Guide](./FACTORY-GUIDE.md) - Using test data factories
- 🎭 [Mock Guide](./MOCK-GUIDE.md) - Working with mock services
- 🔧 [Troubleshooting](./TROUBLESHOOTING.md) - Common issues and solutions

## Documentation Structure

### For Developers

#### Getting Started
1. **New to Testing?** Start with [Test Writing Guide](./TEST-WRITING-GUIDE.md)
2. **Need Quick Commands?** Check [Quick Reference](./SERVICE-TEST-QUICK-REFERENCE.md)
3. **Working on a Service?** See [Service Test Status](./SERVICE-TEST-STATUS.md)

#### Writing Tests
1. **Standards**: [Testing Standards](./TESTING-STANDARDS.md)
2. **Factories**: [Factory Guide](./FACTORY-GUIDE.md)
3. **Mocks**: [Mock Guide](./MOCK-GUIDE.md)
4. **Templates**: [Test Templates](../../tests/templates/)

#### Debugging
1. **Common Issues**: [Troubleshooting](./TROUBLESHOOTING.md)
2. **Service-Specific**: Check individual service READMEs
3. **Performance**: [Test Optimization Guide](./TEST-OPTIMIZATION-GUIDE.md)

### For Project Managers

#### Status Tracking
- **Overall Status**: [Service Test Status](./SERVICE-TEST-STATUS.md)
- **Coverage Metrics**: [Service Test Status - Statistics](./SERVICE-TEST-STATUS.md#overall-statistics)
- **Priority Actions**: [Service Test Status - Priority Actions](./SERVICE-TEST-STATUS.md#priority-actions)

#### Planning
- **Roadmap**: [Testing Roadmap](../TESTING-ROADMAP.md)
- **Requirements**: [Minimum Coverage Requirements](./MINIMUM-COVERAGE-REQUIREMENTS.md)
- **Checklist**: [Testing Checklist](./TESTING-CHECKLIST.md)

### For QA Engineers

#### Quality Gates
- **Coverage Requirements**: [Minimum Coverage Requirements](./MINIMUM-COVERAGE-REQUIREMENTS.md)
- **Code Review**: [Code Review Checklist](./CODE-REVIEW-CHECKLIST.md)
- **Standards**: [Testing Standards Implementation](./TESTING-STANDARDS-IMPLEMENTATION.md)

#### Test Execution
- **Optimization**: [Test Execution Optimization](./TEST-EXECUTION-OPTIMIZATION.md)
- **Performance**: [Test Optimization Guide](./TEST-OPTIMIZATION-GUIDE.md)
- **CI/CD**: [GitHub Actions Workflow](../../.github/workflows/test.yml)

## Documentation Files

### Core Documentation

| File | Purpose | Audience |
|------|---------|----------|
| [SERVICE-TEST-QUICK-REFERENCE.md](./SERVICE-TEST-QUICK-REFERENCE.md) | Quick commands and patterns | All Developers |
| [SERVICE-TEST-STATUS.md](./SERVICE-TEST-STATUS.md) | Current test status across all services | All Teams |
| [SERVICE-TESTING-TEMPLATE.md](./SERVICE-TESTING-TEMPLATE.md) | Template for service READMEs | Service Owners |
| [TESTING-STANDARDS.md](./TESTING-STANDARDS.md) | Comprehensive testing guidelines | All Developers |
| [TEST-WRITING-GUIDE.md](./TEST-WRITING-GUIDE.md) | How to write effective tests | New Developers |

### Specialized Guides

| File | Purpose | Audience |
|------|---------|----------|
| [FACTORY-GUIDE.md](./FACTORY-GUIDE.md) | Using test data factories | Developers |
| [MOCK-GUIDE.md](./MOCK-GUIDE.md) | Working with mock services | Developers |
| [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) | Common issues and solutions | All Developers |
| [TEST-OPTIMIZATION-GUIDE.md](./TEST-OPTIMIZATION-GUIDE.md) | Performance optimization | Advanced Developers |
| [TEST-EXECUTION-OPTIMIZATION.md](./TEST-EXECUTION-OPTIMIZATION.md) | Execution strategies | DevOps/QA |

### Process Documentation

| File | Purpose | Audience |
|------|---------|----------|
| [TESTING-CHECKLIST.md](./TESTING-CHECKLIST.md) | Pre-deployment checklist | QA Engineers |
| [CODE-REVIEW-CHECKLIST.md](./CODE-REVIEW-CHECKLIST.md) | Test review guidelines | Code Reviewers |
| [MINIMUM-COVERAGE-REQUIREMENTS.md](./MINIMUM-COVERAGE-REQUIREMENTS.md) | Coverage thresholds | All Teams |
| [TESTING-STANDARDS-IMPLEMENTATION.md](./TESTING-STANDARDS-IMPLEMENTATION.md) | Implementation status | Project Managers |

## Quick Start

### Running Tests

```bash
# Run all tests
npm test

# Run tests for specific service
npm test -- services/azora-auth

# Run with coverage
npm test -- --coverage

# Run in watch mode
npm test -- --watch
```

### Writing Your First Test

```typescript
import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { setupTestDatabase, cleanupTestDatabase } from '@/tests/utils/database';
import { createTestUser } from '@/tests/factories';

describe('My Service', () => {
  beforeAll(async () => {
    await setupTestDatabase();
  });

  afterAll(async () => {
    await cleanupTestDatabase();
  });

  it('should perform operation', async () => {
    // Arrange
    const user = await createTestUser();
    
    // Act
    const result = await myService.operation(user.id);
    
    // Assert
    expect(result).toBeDefined();
  });
});
```

See [Test Writing Guide](./TEST-WRITING-GUIDE.md) for more details.

## Testing Standards Summary

### Coverage Requirements
- **Critical Services**: 80% minimum
- **High Priority Services**: 70% minimum
- **Standard Services**: 60% minimum
- **New Code**: 60% minimum

### Test Categories
- **Unit Tests**: 60% of test suite
- **Integration Tests**: 30% of test suite
- **E2E Tests**: 10% of test suite

### Quality Gates
- All tests must pass before merge
- Coverage must not decrease
- No flaky tests allowed
- Performance benchmarks must be met

See [Testing Standards](./TESTING-STANDARDS.md) for complete details.

## Current Status

### Overall Metrics
- **Total Services**: 60
- **Services with Tests**: 52 (87%)
- **Average Coverage**: 48%
- **Target Coverage**: 70%
- **Services Passing**: 15 (25%)

### Recent Improvements
- ✅ Fixed 5 critical service test suites
- ✅ Implemented test infrastructure
- ✅ Created test data factory system
- ✅ Set up CI/CD integration
- ✅ Established testing standards

See [Service Test Status](./SERVICE-TEST-STATUS.md) for detailed breakdown.

## Common Tasks

### Adding Tests to a Service

1. **Check Current Status**
   ```bash
   npm test -- services/your-service --coverage
   ```

2. **Review Service README**
   - Check `services/your-service/README.md` for testing section
   - Review existing tests
   - Identify gaps

3. **Write Tests**
   - Use [Test Templates](../../tests/templates/)
   - Follow [Testing Standards](./TESTING-STANDARDS.md)
   - Use [Test Factories](./FACTORY-GUIDE.md)

4. **Run and Verify**
   ```bash
   npm test -- services/your-service
   npm test -- services/your-service --coverage
   ```

5. **Update Documentation**
   - Update service README testing section
   - Update [Service Test Status](./SERVICE-TEST-STATUS.md)

### Debugging Test Failures

1. **Check Troubleshooting Guide**
   - See [Troubleshooting](./TROUBLESHOOTING.md)
   - Check service-specific README

2. **Run with Verbose Output**
   ```bash
   npm test -- services/your-service --verbose
   ```

3. **Clear Cache**
   ```bash
   npm test -- --clearCache
   ```

4. **Check Environment**
   ```bash
   cat .env.test
   ```

5. **Verify Dependencies**
   - Database running?
   - Redis running?
   - Environment variables set?

### Improving Test Performance

1. **Identify Slow Tests**
   ```bash
   npm test -- --verbose
   ```

2. **Use Parallelization**
   ```bash
   npm test -- --maxWorkers=4
   ```

3. **Optimize Database Operations**
   - Use transactions for cleanup
   - Minimize database queries
   - Use proper indexes

4. **Cache Mock Responses**
   - Reuse mock data
   - Reset mocks efficiently

See [Test Optimization Guide](./TEST-OPTIMIZATION-GUIDE.md) for details.

## Contributing

### Adding Documentation

1. **Follow Templates**
   - Use existing documentation as reference
   - Follow markdown standards
   - Include code examples

2. **Update Index**
   - Add new files to this README
   - Update relevant sections
   - Add to quick links if appropriate

3. **Submit PR**
   - Include documentation label
   - Request review from testing team
   - Update changelog

### Improving Tests

1. **Follow Standards**
   - Review [Testing Standards](./TESTING-STANDARDS.md)
   - Use [Code Review Checklist](./CODE-REVIEW-CHECKLIST.md)
   - Follow [Test Writing Guide](./TEST-WRITING-GUIDE.md)

2. **Update Documentation**
   - Update service README
   - Update test status
   - Add examples if helpful

3. **Submit PR**
   - Include testing label
   - Show coverage improvement
   - Document any new patterns

## Resources

### Internal Resources
- [Testing Roadmap](../TESTING-ROADMAP.md)
- [Test Templates](../../tests/templates/)
- [Test Utilities](../../tests/utils/)
- [Test Factories](../../tests/factories/)
- [Mock Services](../../tests/mocks/)

### External Resources
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Testing Library](https://testing-library.com/docs/)
- [Supertest](https://github.com/visionmedia/supertest)
- [Prisma Testing](https://www.prisma.io/docs/guides/testing)

## Support

### Getting Help

1. **Documentation**: Check this directory first
2. **Service README**: Check specific service documentation
3. **Slack**: #testing channel
4. **Issues**: Create issue with `testing` label
5. **Team**: Reach out to testing team

### Reporting Issues

1. **Documentation Issues**: Create issue with `documentation` label
2. **Test Failures**: Create issue with `testing` label
3. **Infrastructure Issues**: Create issue with `test-infrastructure` label

### Suggesting Improvements

1. **Documentation**: PR with improvements
2. **Standards**: Discuss in #testing channel
3. **Tools**: Create issue with `testing-tools` label

## Changelog

### 2025-11-25
- ✅ Created comprehensive testing documentation structure
- ✅ Added SERVICE-TEST-QUICK-REFERENCE.md
- ✅ Added SERVICE-TEST-STATUS.md
- ✅ Added SERVICE-TESTING-TEMPLATE.md
- ✅ Updated 7 service READMEs with testing sections
- ✅ Created this README

### 2025-11-18
- ✅ Fixed 5 critical service test suites
- ✅ Implemented test infrastructure
- ✅ Created test data factory system
- ✅ Set up CI/CD integration

See [Testing Roadmap](../TESTING-ROADMAP.md) for planned improvements.

---

**Last Updated**: 2025-11-25
**Maintained By**: Testing Team
**Questions?** Ask in #testing Slack channel
