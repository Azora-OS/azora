# Minimum Coverage Requirements

## Overview

This document defines the minimum test coverage requirements for Azora OS. These requirements ensure code quality, reduce bugs, and maintain confidence in deployments.

---

## Coverage Thresholds

### Overall Project Coverage

| Metric | Minimum | Target | Excellent |
|--------|---------|--------|-----------|
| Lines | 50% | 70% | 85%+ |
| Branches | 45% | 65% | 80%+ |
| Functions | 50% | 70% | 85%+ |
| Statements | 50% | 70% | 85%+ |

### Service-Level Coverage

Different services have different criticality levels and coverage requirements:

#### Critical Services (80% minimum)
Services that handle sensitive data or core functionality:
- **auth-service** - Authentication and authorization
- **payment** - Payment processing and transactions
- **azora-finance** - Financial operations
- **kyc-aml-service** - Compliance and verification

#### High Priority Services (70% minimum)
Services that are essential for core features:
- **azora-education** - Course and enrollment management
- **azora-marketplace** - Job listings and applications
- **ai-routing** - AI request routing and optimization
- **api-gateway** - Request routing and validation

#### Standard Services (60% minimum)
All other production services:
- **azora-library** - Content management
- **azora-analytics** - Analytics and reporting
- **monitoring-service** - System monitoring
- **health-monitor** - Health checks

#### Support Services (50% minimum)
Internal tools and utilities:
- **shared** - Shared utilities
- **infrastructure** - Infrastructure code
- **scripts** - Automation scripts

---

## Coverage by Test Type

### Unit Tests (60% of total coverage)
- **Purpose:** Test individual functions in isolation
- **Coverage Target:** 80%+ of business logic
- **Scope:** Single function, class, or module
- **Speed:** Fast (<100ms per test)

**Required Coverage:**
- All public methods
- All business logic functions
- All utility functions
- Error handling paths
- Edge cases and boundary conditions

### Integration Tests (30% of total coverage)
- **Purpose:** Test component interactions
- **Coverage Target:** 70%+ of service boundaries
- **Scope:** Multiple modules or services
- **Speed:** Medium (100ms-1s per test)

**Required Coverage:**
- Service-to-service communication
- Database operations
- Cache interactions
- External API integrations
- Transaction handling

### E2E Tests (10% of total coverage)
- **Purpose:** Test complete user journeys
- **Coverage Target:** 5-10 critical paths
- **Scope:** Full application stack
- **Speed:** Slow (1s-10s per test)

**Required Coverage:**
- User registration and login
- Payment processing
- Course enrollment
- Critical workflows
- Error scenarios

---

## Critical Path Coverage

### Definition
Critical paths are user flows that must work for the system to function. These require **90%+ coverage**.

### Critical Paths by Service

#### Auth Service
- ✅ User registration with email verification
- ✅ User login with JWT generation
- ✅ Token refresh and validation
- ✅ Password reset flow
- ✅ MFA setup and verification

#### Payment Service
- ✅ Payment intent creation
- ✅ Payment confirmation
- ✅ Webhook processing
- ✅ Refund processing
- ✅ Transaction history

#### Education Service
- ✅ Course creation and management
- ✅ Student enrollment
- ✅ Progress tracking
- ✅ Assessment submission
- ✅ Certificate generation

#### Marketplace Service
- ✅ Job posting and search
- ✅ Application submission
- ✅ Skill matching
- ✅ Review system
- ✅ Payment processing

---

## New Code Requirements

### Pull Request Requirements

All pull requests must meet these requirements:

1. **Coverage Delta:** New code must have 60%+ coverage
2. **No Coverage Regression:** Overall coverage cannot decrease
3. **Critical Path Tests:** Changes to critical paths require tests
4. **Test Documentation:** Complex tests must be documented

### Enforcement

Coverage requirements are enforced through:
- ✅ Pre-commit hooks (warning only)
- ✅ CI/CD pipeline (blocking)
- ✅ Code review checklist
- ✅ Automated PR comments

---

## Exemptions

### When Coverage Can Be Lower

Certain code types may have lower coverage requirements:

#### Configuration Files (30% minimum)
- Environment configuration
- Build configuration
- Deployment scripts

#### Type Definitions (0% minimum)
- TypeScript interfaces
- Type declarations
- Constants

#### Generated Code (0% minimum)
- Prisma client
- GraphQL types
- API clients

#### Deprecated Code (0% minimum)
- Code marked for removal
- Legacy systems being replaced

### Requesting Exemptions

To request a coverage exemption:

1. Document the reason in code comments
2. Add `/* istanbul ignore next */` for specific lines
3. Update `.coveragerc` for entire files
4. Get approval from tech lead
5. Create ticket to address later

Example:
```typescript
/* istanbul ignore next - Legacy code, will be removed in v2.0 */
function deprecatedFunction() {
  // ...
}
```

---

## Coverage Measurement

### Tools

- **Jest Coverage:** Primary coverage tool
- **Istanbul/nyc:** Coverage reporting
- **Codecov:** Coverage tracking and visualization

### Running Coverage

```bash
# Run all tests with coverage
npm test -- --coverage

# Run specific service with coverage
npm test -- services/auth-service --coverage

# Generate HTML report
npm test -- --coverage --coverageReporters=html

# Check coverage thresholds
npm run test:coverage
```

### Coverage Reports

Coverage reports are generated in multiple formats:

- **Terminal:** Summary in console
- **HTML:** Detailed report in `coverage/` directory
- **JSON:** Machine-readable in `coverage/coverage-summary.json`
- **LCOV:** For CI/CD integration

---

## Monitoring and Tracking

### Coverage Dashboard

View current coverage at:
- Local: `coverage/index.html`
- CI/CD: GitHub Actions artifacts
- Codecov: [Project dashboard]

### Historical Tracking

Coverage trends are tracked:
- **Daily:** Automated coverage runs
- **Per PR:** Coverage delta in PR comments
- **Weekly:** Coverage health reports
- **Monthly:** Coverage trend analysis

### Alerts

Alerts are triggered for:
- Coverage drops below minimum threshold
- Critical path coverage drops below 90%
- New code has <60% coverage
- Coverage trend declining for 7+ days

---

## Improvement Plan

### Current State (as of implementation)
- Overall Coverage: ~50%
- Critical Path Coverage: ~80%
- Passing Tests: 88/88 suites

### Short-term Goals (3 months)
- Overall Coverage: 60%
- Critical Path Coverage: 90%
- All critical services: 70%+

### Long-term Goals (6 months)
- Overall Coverage: 70%
- Critical Path Coverage: 95%
- All services: 60%+

### Continuous Improvement

- **Weekly:** Review coverage reports
- **Monthly:** Identify coverage gaps
- **Quarterly:** Update coverage requirements
- **Annually:** Review and adjust thresholds

---

## Best Practices

### Writing Testable Code

1. **Single Responsibility:** Functions do one thing
2. **Dependency Injection:** Pass dependencies as parameters
3. **Pure Functions:** Avoid side effects when possible
4. **Small Functions:** Keep functions under 50 lines
5. **Clear Interfaces:** Well-defined inputs and outputs

### Achieving High Coverage

1. **Test First:** Write tests before implementation (TDD)
2. **Cover Edge Cases:** Test boundary conditions
3. **Test Errors:** Verify error handling
4. **Test Integration:** Test component interactions
5. **Refactor Tests:** Keep tests maintainable

### Avoiding Coverage Gaming

❌ **Don't:**
- Write tests that don't assert anything
- Test trivial code (getters/setters)
- Focus on coverage percentage over quality
- Skip error cases to inflate coverage
- Use coverage as the only quality metric

✅ **Do:**
- Write meaningful assertions
- Test behavior, not implementation
- Focus on critical paths first
- Test error scenarios thoroughly
- Use coverage as one of many metrics

---

## Resources

- [Testing Standards](./TESTING-STANDARDS.md)
- [Test Writing Guide](./TEST-WRITING-GUIDE.md)
- [Code Review Checklist](./CODE-REVIEW-CHECKLIST.md)
- [Troubleshooting Guide](./TROUBLESHOOTING.md)

---

## Questions?

For questions about coverage requirements:
- Check the [FAQ](./TESTING-STANDARDS.md#faq)
- Review [examples](../tests/templates/)
- Ask in #testing channel
- Contact the testing team
