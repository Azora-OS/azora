# Deployment Test Requirements

This document outlines the testing requirements that must be met before deploying to any environment.

---

## 📋 Pre-Deployment Test Checklist

### ✅ Required Before Any Deployment

**1. All Tests Must Pass**
```bash
npm test
```
- ✅ All test suites passing
- ✅ No flaky tests
- ✅ No skipped critical tests
- ✅ Test execution time acceptable

**2. Coverage Requirements Met**
```bash
npm test -- --coverage
```

| Environment | Minimum Coverage | Target Coverage |
|-------------|------------------|-----------------|
| Development | 40% | 50% |
| Staging | 50% | 60% |
| Production | 50% | 70% |

**Service-Specific Requirements:**

| Service Type | Minimum | Target |
|--------------|---------|--------|
| Critical (auth, payment) | 60% | 80% |
| High Priority (education, marketplace) | 50% | 70% |
| Standard Services | 40% | 60% |
| Support Services | 30% | 50% |

**3. Coverage Gates Pass**
```bash
npm run coverage:check
```
- ✅ Minimum thresholds met
- ✅ No coverage regression
- ✅ Critical paths covered (90%+)
- ✅ New code has 60%+ coverage

**4. Integration Tests Pass**
```bash
npm run test:integration
```
- ✅ Database integration tests
- ✅ External service integration tests
- ✅ Service-to-service communication tests
- ✅ Cache integration tests

**5. Linting and Type Checking**
```bash
npm run lint
npm run type-check
```
- ✅ No linting errors
- ✅ No type errors
- ✅ Code formatted correctly

---

## 🔴 Deployment Blockers

**The following will block deployment:**

### Critical Blockers
- ❌ **Failing tests** - Any test failure blocks deployment
- ❌ **Coverage below minimum** - Must meet minimum thresholds
- ❌ **Flaky tests in critical paths** - Must be fixed or disabled
- ❌ **Missing tests for new features** - New code must have tests
- ❌ **Integration test failures** - Service interactions must work
- ❌ **Security vulnerabilities** - High/critical vulnerabilities must be fixed

### Warning Blockers (Production Only)
- ⚠️ **Coverage regression** - Coverage decreased from previous version
- ⚠️ **Slow tests** - Tests taking longer than expected
- ⚠️ **Test health issues** - Flaky tests or performance degradation
- ⚠️ **Missing E2E tests** - Critical paths not covered

---

## 🌍 Environment-Specific Requirements

### Development Environment

**Minimum Requirements:**
- ✅ Unit tests pass
- ✅ Basic integration tests pass
- ✅ No critical linting errors

**Optional:**
- E2E tests
- Performance tests
- Load tests

**Deployment Command:**
```bash
npm run deploy:dev
```

---

### Staging Environment

**Minimum Requirements:**
- ✅ All unit tests pass
- ✅ All integration tests pass
- ✅ Coverage meets minimum (50%)
- ✅ No flaky tests
- ✅ Linting and type checking pass

**Recommended:**
- ✅ E2E tests for critical paths
- ✅ Performance tests
- ✅ Security scan

**Pre-Deployment Checklist:**
```bash
# Run full test suite
npm test

# Check coverage
npm test -- --coverage

# Run integration tests
npm run test:integration

# Run linting
npm run lint

# Type check
npm run type-check

# Security scan
npm audit
```

**Deployment Command:**
```bash
npm run deploy:staging
```

---

### Production Environment

**Minimum Requirements:**
- ✅ All unit tests pass (100%)
- ✅ All integration tests pass (100%)
- ✅ All E2E tests pass (100%)
- ✅ Coverage meets minimum (50%)
- ✅ No flaky tests
- ✅ No coverage regression
- ✅ Linting and type checking pass
- ✅ Security scan pass (no high/critical vulnerabilities)
- ✅ Performance tests pass
- ✅ Load tests pass (if applicable)

**Required:**
- ✅ Code review approved
- ✅ QA sign-off
- ✅ Security review (for sensitive changes)
- ✅ Database migration tested
- ✅ Rollback plan documented
- ✅ Monitoring alerts configured

**Pre-Deployment Checklist:**
```bash
# Run full test suite
npm test

# Check coverage with strict thresholds
npm test -- --coverage --coverageThreshold='{"global":{"lines":50,"branches":45,"functions":50,"statements":50}}'

# Run integration tests
npm run test:integration

# Run E2E tests
npm run test:e2e

# Run performance tests
npm run test:performance

# Run security scan
npm audit --audit-level=high

# Run linting
npm run lint

# Type check
npm run type-check

# Verify build
npm run build
```

**Deployment Command:**
```bash
npm run deploy:production
```

---

## 🧪 Test Types and Requirements

### Unit Tests

**Purpose**: Test individual functions in isolation

**Requirements:**
- Must pass 100%
- Coverage: 60% of total coverage
- Execution time: <100ms per test
- No external dependencies
- Proper mocking of services

**Running:**
```bash
npm test -- --testPathPattern="\.test\.ts$"
```

---

### Integration Tests

**Purpose**: Test component interactions

**Requirements:**
- Must pass 100%
- Coverage: 30% of total coverage
- Execution time: <1s per test
- Real database (test instance)
- Real Redis (test instance)
- Mocked external APIs

**Running:**
```bash
npm run test:integration
```

---

### E2E Tests

**Purpose**: Test complete user journeys

**Requirements:**
- Must pass 100% (production)
- Coverage: 10% of total coverage
- Execution time: <10s per test
- Critical paths only
- Real-world scenarios

**Running:**
```bash
npm run test:e2e
```

**Critical Paths to Test:**
1. User registration and login
2. Course enrollment
3. Payment processing
4. Job application
5. AI query routing

---

### Performance Tests

**Purpose**: Ensure acceptable performance

**Requirements:**
- API response time: <200ms (p95)
- Database query time: <50ms (p95)
- Page load time: <2s
- No memory leaks
- Acceptable resource usage

**Running:**
```bash
npm run test:performance
```

---

### Security Tests

**Purpose**: Identify security vulnerabilities

**Requirements:**
- No high/critical vulnerabilities
- Dependencies up to date
- Security headers configured
- Authentication tested
- Authorization tested

**Running:**
```bash
npm audit
npm run test:security
```

---

## 📊 Coverage Requirements by Service

### Critical Services (80% Target)

**Services:**
- auth-service
- payment
- azora-finance
- kyc-aml-service

**Requirements:**
- Minimum: 60% coverage
- Target: 80% coverage
- Critical paths: 90%+ coverage
- All error scenarios tested
- Integration tests required
- E2E tests for main flows

---

### High Priority Services (70% Target)

**Services:**
- azora-education
- azora-marketplace
- ai-routing
- api-gateway

**Requirements:**
- Minimum: 50% coverage
- Target: 70% coverage
- Core workflows: 80%+ coverage
- Error handling tested
- Integration tests for boundaries

---

### Standard Services (60% Target)

**Services:**
- azora-library
- azora-analytics
- monitoring-service
- health-monitor

**Requirements:**
- Minimum: 40% coverage
- Target: 60% coverage
- Core functionality: 70%+ coverage
- Basic error handling tested

---

### Support Services (50% Target)

**Services:**
- shared
- infrastructure
- scripts

**Requirements:**
- Minimum: 30% coverage
- Target: 50% coverage
- Key utilities tested
- Common use cases covered

---

## 🚀 CI/CD Integration

### GitHub Actions Workflow

**On Pull Request:**
1. Run all tests
2. Check coverage
3. Run linting
4. Type checking
5. Security scan
6. Post results as PR comment

**On Merge to Main:**
1. Run full test suite
2. Check coverage gates
3. Build Docker images
4. Deploy to staging
5. Run smoke tests
6. Notify team

**On Release Tag:**
1. Run full test suite
2. Run E2E tests
3. Run performance tests
4. Security scan
5. Build production images
6. Deploy to production (manual approval)
7. Run smoke tests
8. Monitor for errors

---

## 📈 Monitoring Post-Deployment

### Immediate Checks (First 5 Minutes)

```bash
# Check service health
curl https://api.azora.io/health

# Check error rates
npm run monitor:errors -- --duration=5m

# Check response times
npm run monitor:performance -- --duration=5m

# Check logs for errors
kubectl logs -n production -l app=api-gateway --since=5m | grep -i error
```

### Short-term Monitoring (First Hour)

- Monitor error rates
- Check response times
- Review logs for warnings
- Verify metrics in Grafana
- Check user reports

### Long-term Monitoring (First 24 Hours)

- Review error trends
- Check performance metrics
- Monitor resource usage
- Review user feedback
- Check business metrics

---

## 🔄 Rollback Criteria

**Automatic Rollback Triggers:**
- Error rate > 5%
- Response time > 2x baseline
- Service availability < 99%
- Critical functionality broken

**Manual Rollback Triggers:**
- User-reported critical bugs
- Data integrity issues
- Security vulnerabilities discovered
- Performance degradation

**Rollback Process:**
```bash
# Rollback to previous version
helm rollback azora-prod -n production

# Verify rollback
kubectl rollout status deployment/api-gateway -n production

# Run smoke tests
npm run test:smoke -- --env=production

# Notify team
npm run notify:rollback
```

---

## 📚 Resources

### Documentation
- [Testing Standards](./testing/TESTING-STANDARDS.md)
- [Test Writing Guide](./testing/TEST-WRITING-GUIDE.md)
- [Testing Roadmap](./TESTING-ROADMAP.md)
- [Service Testing Status](./SERVICE-TESTING-STATUS.md)

### Tools
- [Test Reminder](../scripts/test-reminder.js)
- [Coverage Checker](../scripts/check-coverage-gates.ts)
- [Pre-commit Hook](../.husky/pre-commit)

### Commands
```bash
# View test status
npm run test:reminder

# Check coverage
npm run coverage:check

# Run full test suite
npm test -- --coverage

# View test health
npm run test:health
```

---

## 🤝 Getting Help

**Before Deployment:**
- Review this document
- Check [Testing Documentation](./testing/README.md)
- Run `npm run test:checklist`
- Ask in #testing channel

**During Deployment:**
- Monitor deployment logs
- Check service health
- Review error rates
- Contact DevOps team if issues

**After Deployment:**
- Monitor for 24 hours
- Review metrics
- Check user feedback
- Document any issues

---

**Remember: Quality over speed. It's better to delay deployment than to deploy broken code.**

---

**Last Updated**: November 2024  
**Next Review**: February 2025  
**Owner**: Testing & DevOps Teams
