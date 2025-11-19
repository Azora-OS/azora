# CI/CD Workflows - Design Document

## Overview

The CI/CD Workflows system provides automated quality gates and deployment pipelines using GitHub Actions. The design establishes a multi-stage pipeline that validates code quality, security, and functionality before allowing merges and deployments. The architecture follows a progressive validation model where faster checks run first, followed by comprehensive testing and security scanning.

## Architecture

### Pipeline Stages

The CI/CD system is organized into distinct stages that execute in sequence or parallel:

1. **Code Quality Stage** (runs on PR creation/update)
   - ESLint linting
   - TypeScript type checking
   - Dependency validation

2. **Testing Stage** (runs on PR creation/update)
   - Jest unit and integration tests (parallel across Node versions)
   - E2E tests with Playwright
   - Test coverage reporting

3. **Security Stage** (runs on PR creation/update)
   - npm audit for dependency vulnerabilities
   - SAST scanning for code-level issues
   - Secret detection

4. **Staging Deployment Stage** (runs on merge to main)
   - Database migrations
   - Service deployment
   - Health checks

5. **Production Deployment Stage** (runs on release tags)
   - Pre-deployment validation
   - Database backups
   - Gradual rollout with monitoring

6. **Maintenance Stages** (scheduled or manual)
   - Dependency updates
   - Release automation

### Design Decisions & Rationale

**Parallel Testing Across Node Versions**: Running tests against Node 18, 20, and 22 ensures compatibility across supported versions. This catches version-specific issues early without significantly increasing pipeline time due to GitHub Actions parallelization.

**Fail-Fast Approach**: Linting and type checking run first as they're fast and catch obvious issues before expensive test execution. This reduces feedback time for developers.

**Separate E2E Workflow**: E2E tests run in a separate workflow from unit tests to allow independent scheduling and resource allocation. They can be run on a subset of PRs or on a schedule to balance speed vs. coverage.

**Staging as Validation Gate**: Staging deployment serves as a final validation before production. Health checks ensure the deployment succeeded before allowing production promotion.

**Artifact Storage**: Test reports, coverage data, and deployment logs are stored as artifacts for audit trails and debugging without cluttering the repository.

## Components and Interfaces

### Workflow Files Structure

```
.github/workflows/
├── ci-lint-and-type-check.yml      # ESLint + TypeScript validation
├── ci-test.yml                      # Jest tests across Node versions
├── ci-e2e-tests.yml                 # Playwright E2E tests
├── ci-security-scan.yml             # Security scanning
├── deploy-staging.yml               # Staging deployment
├── deploy-production.yml            # Production deployment
├── release-automation.yml            # Version bumping & changelog
├── dependency-updates.yml            # Automated dependency PRs
└── status-checks.yml                # Aggregated status reporting
```

### Workflow Triggers

| Workflow | Trigger | Condition |
|----------|---------|-----------|
| ci-lint-and-type-check | pull_request, push | All branches |
| ci-test | pull_request, push | All branches |
| ci-e2e-tests | pull_request | All branches (can be scheduled) |
| ci-security-scan | pull_request, push | All branches |
| deploy-staging | push | main branch only |
| deploy-production | release | tag: v* |
| release-automation | workflow_dispatch | Manual trigger |
| dependency-updates | schedule | Weekly (configurable) |
| status-checks | pull_request | All branches |

### Required Status Checks

The following workflows must pass before a PR can be merged:
- ci-lint-and-type-check
- ci-test
- ci-security-scan

Optional but recommended:
- ci-e2e-tests (can be required for critical paths)

### Environment Configuration

**Secrets Required**:
- `SAST_API_KEY` - Static analysis tool credentials
- `NPM_TOKEN` - npm registry authentication (for publishing)
- `STAGING_DEPLOY_KEY` - Staging environment credentials
- `PROD_DEPLOY_KEY` - Production environment credentials
- `SLACK_WEBHOOK` - Notifications (optional)

**Variables**:
- `NODE_VERSIONS` - Supported Node versions (18, 20, 22)
- `COVERAGE_THRESHOLD` - Minimum coverage percentage (80%)
- `SECURITY_SEVERITY_THRESHOLD` - Fail on high/critical (configurable)

## Data Models

### Test Report Format

```json
{
  "timestamp": "2024-11-19T10:30:00Z",
  "workflow": "ci-test",
  "status": "passed|failed",
  "nodeVersion": "20.x",
  "tests": {
    "total": 1250,
    "passed": 1245,
    "failed": 5,
    "skipped": 0
  },
  "coverage": {
    "lines": 85.5,
    "branches": 78.2,
    "functions": 82.1,
    "statements": 85.5
  }
}
```

### Security Report Format

```json
{
  "timestamp": "2024-11-19T10:30:00Z",
  "workflow": "ci-security-scan",
  "vulnerabilities": {
    "critical": 0,
    "high": 2,
    "medium": 5,
    "low": 12
  },
  "secrets_detected": 0,
  "sast_issues": [
    {
      "file": "services/api-gateway/src/auth.ts",
      "line": 45,
      "severity": "high",
      "issue": "Hardcoded credential"
    }
  ]
}
```

### Deployment Record Format

```json
{
  "timestamp": "2024-11-19T10:30:00Z",
  "environment": "staging|production",
  "version": "1.2.3",
  "status": "success|failed",
  "services_deployed": ["api-gateway", "auth-service", "..."],
  "migrations_applied": 3,
  "health_checks": {
    "api-gateway": "healthy",
    "auth-service": "healthy"
  },
  "rollback_available": true
}
```

## Error Handling

### Workflow Failure Scenarios

**Linting/Type Check Failures**:
- Display errors in PR with file paths and line numbers
- Provide actionable error messages
- Link to style guide documentation
- Allow developers to run locally with `npm run lint` and `npm run type-check`

**Test Failures**:
- Generate test failure reports with stack traces
- Capture screenshots for E2E failures
- Store video recordings for debugging
- Provide links to failed test files
- Suggest re-running specific test suites

**Security Scan Failures**:
- List specific vulnerabilities with CVE references
- Provide remediation guidance
- Allow security team to review and approve exceptions
- Track security debt in issues

**Deployment Failures**:
- Halt pipeline and alert team immediately
- Preserve logs for investigation
- Provide rollback instructions
- Create incident tracking issue automatically

### Retry Logic

- Transient failures (network timeouts) retry up to 3 times
- Flaky E2E tests can be re-run individually
- Failed deployments require manual intervention before retry

### Notifications

- Slack notifications for workflow failures (if configured)
- GitHub PR comments with failure summaries
- Email notifications for production deployment failures
- Daily digest of workflow metrics

## Testing Strategy

### Unit & Integration Tests

**Scope**: All services and packages with Jest
**Trigger**: Every PR and push
**Parallelization**: Run across Node 18, 20, 22 simultaneously
**Coverage Threshold**: Minimum 80% line coverage
**Artifacts**: Coverage reports, test results JSON

**Test Execution**:
```bash
npm run test -- --coverage --json --outputFile=coverage.json
```

### E2E Tests

**Scope**: Critical user journeys across frontend applications
**Trigger**: Every PR (can be scheduled for off-peak hours)
**Environment**: Test environment with seeded data
**Parallelization**: Run tests in parallel with multiple workers
**Artifacts**: Test reports, screenshots on failure, video recordings

**Test Execution**:
```bash
npx playwright test --reporter=json --reporter=html
```

### Security Testing

**Dependency Scanning**: npm audit on all package.json files
**SAST**: Automated code analysis for common vulnerabilities
**Secret Detection**: Scan for hardcoded credentials and API keys
**Artifacts**: Security reports with remediation guidance

## Deployment Strategy

### Staging Deployment

**Trigger**: Automatic on merge to main
**Steps**:
1. Build all services and applications
2. Run database migrations
3. Deploy to staging environment
4. Execute health checks on all services
5. Run smoke tests
6. Notify team of deployment status

**Rollback**: Automatic if health checks fail

### Production Deployment

**Trigger**: Manual via release tag (v*)
**Pre-deployment Checks**:
- All required status checks passed
- Security scan passed
- Staging deployment successful
- Release notes generated

**Deployment Steps**:
1. Create database backup
2. Run database migrations
3. Deploy services with gradual rollout (canary)
4. Monitor health and error rates
5. Complete rollout if healthy
6. Generate deployment record

**Rollback**: Manual trigger available for 1 hour post-deployment

### Health Checks

Services must respond to health check endpoint:
```
GET /health
Response: { "status": "healthy", "version": "1.2.3" }
```

## Monitoring & Observability

### Workflow Metrics

- Execution time per workflow
- Success/failure rates
- Time to feedback for developers
- Deployment frequency and lead time

### Status Badges

README displays current status:
```markdown
![Tests](https://github.com/azora/azora-os/workflows/ci-test/badge.svg)
![Security](https://github.com/azora/azora-os/workflows/ci-security-scan/badge.svg)
![Staging](https://github.com/azora/azora-os/workflows/deploy-staging/badge.svg)
```

### Artifact Retention

- Test reports: 30 days
- Coverage reports: 90 days
- Deployment logs: 1 year
- Security reports: 1 year

## Integration Points

### GitHub Integration

- Required status checks prevent merging
- PR comments with detailed failure information
- Automatic PR creation for dependency updates
- Release creation with changelog

### External Services

- npm registry for package publishing
- SAST tool API for security scanning
- Slack for notifications (optional)
- Monitoring/observability platform for metrics

## Scalability Considerations

- Workflows use matrix strategy for parallel execution
- Artifact storage managed with retention policies
- Large test suites can be split across multiple jobs
- E2E tests can run on schedule to reduce PR feedback time
- Caching of dependencies and build artifacts to reduce execution time

## Future Enhancements

- Performance benchmarking workflows
- Automated performance regression detection
- Canary deployment with automatic rollback
- Multi-region deployment support
- Advanced SAST with custom rules
- Integration with external security tools (Snyk, Dependabot)
