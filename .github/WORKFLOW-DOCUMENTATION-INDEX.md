# CI/CD Workflow Documentation Index

## Overview

This index provides a comprehensive guide to all CI/CD workflow documentation. Use this to quickly find the information you need.

---

## Quick Navigation

### By Use Case

**I need to...**

- **Fix a failing workflow** → [Troubleshooting Guide](./WORKFLOW-TROUBLESHOOTING-GUIDE.md)
- **Handle a deployment failure** → [Deployment Failure Runbook](./DEPLOYMENT-FAILURE-RUNBOOK.md)
- **Manually run a workflow** → [Manual Workflow Execution Guide](./MANUAL-WORKFLOW-EXECUTION-GUIDE.md)
- **Rollback a production deployment** → [Production Rollback Procedures](./PRODUCTION-ROLLBACK-PROCEDURES.md)
- **Monitor workflow performance** → [Performance Monitoring Guide](./WORKFLOW-PERFORMANCE-MONITORING.md)
- **Understand workflow configuration** → [Workflows README](./workflows/README.md)

### By Role

**Developer**
- [Troubleshooting Guide](./WORKFLOW-TROUBLESHOOTING-GUIDE.md) - Fix failing tests/linting
- [Manual Workflow Execution Guide](./MANUAL-WORKFLOW-EXECUTION-GUIDE.md) - Run workflows manually
- [Performance Monitoring Guide](./WORKFLOW-PERFORMANCE-MONITORING.md) - Understand workflow metrics

**DevOps Engineer**
- [Deployment Failure Runbook](./DEPLOYMENT-FAILURE-RUNBOOK.md) - Handle deployment issues
- [Production Rollback Procedures](./PRODUCTION-ROLLBACK-PROCEDURES.md) - Rollback deployments
- [Performance Monitoring Guide](./WORKFLOW-PERFORMANCE-MONITORING.md) - Optimize workflows

**Release Manager**
- [Manual Workflow Execution Guide](./MANUAL-WORKFLOW-EXECUTION-GUIDE.md) - Trigger deployments
- [Production Rollback Procedures](./PRODUCTION-ROLLBACK-PROCEDURES.md) - Emergency rollback
- [Deployment Failure Runbook](./DEPLOYMENT-FAILURE-RUNBOOK.md) - Handle deployment issues

**Security Team**
- [Troubleshooting Guide](./WORKFLOW-TROUBLESHOOTING-GUIDE.md) - Security scan failures
- [Deployment Failure Runbook](./DEPLOYMENT-FAILURE-RUNBOOK.md) - Security-related issues
- [Performance Monitoring Guide](./WORKFLOW-PERFORMANCE-MONITORING.md) - Security metrics

---

## Documentation Files

### 1. Workflow Troubleshooting Guide
**File:** `WORKFLOW-TROUBLESHOOTING-GUIDE.md`

**Purpose:** Solutions for common CI/CD workflow failures

**Covers:**
- General troubleshooting (workflow not triggering, timeouts)
- Linting & type checking failures
- Test failures (unit, integration, E2E)
- Security scan failures
- Deployment failures
- Performance issues
- Workflow execution issues

**When to use:**
- Workflow fails and you need to fix it
- Tests are failing
- Linting errors
- Type checking errors
- Security scan issues

**Key sections:**
- Diagnostic steps for each issue type
- Solutions with code examples
- Quick reference commands

---

### 2. Deployment Failure Runbook
**File:** `DEPLOYMENT-FAILURE-RUNBOOK.md`

**Purpose:** Step-by-step procedures for handling deployment failures

**Covers:**
- Incident response procedures
- Staging deployment failures
- Production deployment failures
- Rollback procedures
- Post-incident review
- Escalation procedures

**When to use:**
- Deployment fails
- Service is down
- Need to respond to incident
- Need to recover from failure

**Key sections:**
- Initial assessment (first 5 minutes)
- Severity classification
- Failure type diagnosis and remediation
- Automatic and manual rollback
- Post-incident actions

---

### 3. Manual Workflow Execution Guide
**File:** `MANUAL-WORKFLOW-EXECUTION-GUIDE.md`

**Purpose:** How to manually trigger GitHub Actions workflows

**Covers:**
- Manual trigger via GitHub UI
- Manual trigger via GitHub CLI
- Workflow-specific instructions
- Monitoring manual runs
- Troubleshooting manual runs

**When to use:**
- Need to run workflow outside normal triggers
- Testing workflow changes
- Debugging workflow issues
- Running deployment manually

**Key sections:**
- Step-by-step UI instructions
- GitHub CLI commands
- Workflow-specific examples
- Monitoring and troubleshooting

---

### 4. Production Rollback Procedures
**File:** `PRODUCTION-ROLLBACK-PROCEDURES.md`

**Purpose:** Procedures for rolling back production deployments

**Covers:**
- Rollback decision matrix
- Automatic rollback
- Manual rollback procedures
- Verification steps
- Post-rollback actions
- Rollback limitations

**When to use:**
- Production deployment has critical issue
- Need to revert to previous version
- Service is down
- Data corruption detected

**Key sections:**
- When to rollback vs. fix forward
- Step-by-step rollback procedures
- Verification and monitoring
- Post-rollback incident review

---

### 5. Workflow Performance Monitoring
**File:** `WORKFLOW-PERFORMANCE-MONITORING.md`

**Purpose:** Monitor and optimize CI/CD workflow performance

**Covers:**
- Key metrics (execution, test, deployment, security)
- Monitoring setup
- Metrics collection
- Performance analysis
- Optimization strategies
- Dashboards and reporting

**When to use:**
- Workflows are slow
- Need to optimize performance
- Tracking metrics over time
- Creating performance reports

**Key sections:**
- Metrics definitions and targets
- Collection scripts
- Analysis techniques
- Optimization strategies
- Dashboard setup

---

### 6. Workflows README
**File:** `workflows/README.md`

**Purpose:** Overview of all CI/CD workflows

**Covers:**
- Workflow overview
- Individual workflow descriptions
- Workflow dependencies
- Configuration requirements
- Usage instructions
- Best practices

**When to use:**
- Understanding workflow architecture
- Learning about specific workflow
- Configuration reference
- Best practices

**Key sections:**
- Workflow descriptions
- Trigger conditions
- Required secrets
- Environment protection
- Maintenance tasks

---

## Common Scenarios

### Scenario 1: Test Failure on PR

**Steps:**
1. Check [Troubleshooting Guide](./WORKFLOW-TROUBLESHOOTING-GUIDE.md) → Test Failures section
2. Run tests locally: `npm run test:unit`
3. Fix failing tests
4. Commit and push
5. Workflow will re-run automatically

**Related docs:**
- [Troubleshooting Guide - Test Failures](./WORKFLOW-TROUBLESHOOTING-GUIDE.md#test-failures)
- [Manual Workflow Execution Guide](./MANUAL-WORKFLOW-EXECUTION-GUIDE.md#test-suite-testym)

---

### Scenario 2: Linting Errors

**Steps:**
1. Check [Troubleshooting Guide](./WORKFLOW-TROUBLESHOOTING-GUIDE.md) → Linting & Type Checking Failures
2. Run linting locally: `npm run lint`
3. Fix errors: `npm run lint:fix`
4. Commit and push
5. Workflow will re-run automatically

**Related docs:**
- [Troubleshooting Guide - ESLint Errors](./WORKFLOW-TROUBLESHOOTING-GUIDE.md#eslint-errors)
- [Manual Workflow Execution Guide](./MANUAL-WORKFLOW-EXECUTION-GUIDE.md#linting--type-checking-ci-lint-and-type-checkyml)

---

### Scenario 3: Staging Deployment Fails

**Steps:**
1. Check [Deployment Failure Runbook](./DEPLOYMENT-FAILURE-RUNBOOK.md) → Staging Deployment Failures
2. Identify failure type (database, health check, build)
3. Follow remediation steps
4. Verify recovery
5. Document incident

**Related docs:**
- [Deployment Failure Runbook - Staging Failures](./DEPLOYMENT-FAILURE-RUNBOOK.md#staging-deployment-failures)
- [Manual Workflow Execution Guide - Deploy Staging](./MANUAL-WORKFLOW-EXECUTION-GUIDE.md#deploy-staging-deploy-stagingyml)

---

### Scenario 4: Production Deployment Fails

**Steps:**
1. Check [Deployment Failure Runbook](./DEPLOYMENT-FAILURE-RUNBOOK.md) → Production Deployment Failures
2. Assess severity and impact
3. Notify stakeholders
4. Identify failure type
5. Follow remediation steps
6. Consider rollback if needed

**Related docs:**
- [Deployment Failure Runbook - Production Failures](./DEPLOYMENT-FAILURE-RUNBOOK.md#production-deployment-failures)
- [Production Rollback Procedures](./PRODUCTION-ROLLBACK-PROCEDURES.md)

---

### Scenario 5: Need to Rollback Production

**Steps:**
1. Check [Production Rollback Procedures](./PRODUCTION-ROLLBACK-PROCEDURES.md) → Rollback Decision Matrix
2. Verify rollback is appropriate
3. Follow rollback procedure (automatic or manual)
4. Verify recovery
5. Document incident
6. Plan fix and re-deployment

**Related docs:**
- [Production Rollback Procedures](./PRODUCTION-ROLLBACK-PROCEDURES.md)
- [Deployment Failure Runbook - Post-Incident Review](./DEPLOYMENT-FAILURE-RUNBOOK.md#post-incident-review)

---

### Scenario 6: Workflow is Slow

**Steps:**
1. Check [Performance Monitoring Guide](./WORKFLOW-PERFORMANCE-MONITORING.md) → Identifying Bottlenecks
2. Analyze job durations
3. Identify slowest jobs
4. Apply optimization strategies
5. Monitor improvement

**Related docs:**
- [Performance Monitoring Guide - Bottleneck Analysis](./WORKFLOW-PERFORMANCE-MONITORING.md#identifying-bottlenecks)
- [Performance Monitoring Guide - Optimization Strategies](./WORKFLOW-PERFORMANCE-MONITORING.md#optimization-strategies)

---

### Scenario 7: Need to Manually Run Workflow

**Steps:**
1. Check [Manual Workflow Execution Guide](./MANUAL-WORKFLOW-EXECUTION-GUIDE.md)
2. Choose UI or CLI method
3. Select workflow and branch
4. Configure options if needed
5. Monitor execution
6. Review results

**Related docs:**
- [Manual Workflow Execution Guide - UI Instructions](./MANUAL-WORKFLOW-EXECUTION-GUIDE.md#manual-trigger-via-github-ui)
- [Manual Workflow Execution Guide - CLI Instructions](./MANUAL-WORKFLOW-EXECUTION-GUIDE.md#manual-trigger-via-github-cli)

---

## Workflow Triggers & Conditions

| Workflow | Trigger | Branch | Manual |
|----------|---------|--------|--------|
| Test Suite | Push, PR | main, develop | ✅ |
| Linting | Push, PR | main, develop | ✅ |
| Security | Push, PR, Weekly | main, develop | ✅ |
| E2E Tests | Push, PR, Daily | main, develop | ✅ |
| Deploy Staging | Push | main | ✅ |
| Deploy Production | Tag (v*) | main | ✅ |
| Release | Tag (v*) | main | ✅ |
| Dependencies | Weekly | main | ✅ |

---

## Key Contacts

**For workflow issues:**
- DevOps Team: #devops Slack channel
- On-Call Engineer: #on-call Slack channel

**For deployment issues:**
- DevOps Lead: @devops-lead
- VP Engineering: @vp-engineering

**For security issues:**
- Security Team: @security-team
- CTO: @cto

---

## Useful Commands

### GitHub CLI

```bash
# List workflows
gh workflow list

# Run workflow
gh workflow run <workflow-file> -r <branch>

# List runs
gh run list

# Watch run
gh run watch <run-id>

# View logs
gh run view <run-id> --log

# Download artifacts
gh run download <run-id>
```

### Local Testing

```bash
# Run tests
npm run test:unit

# Run linting
npm run lint

# Fix linting
npm run lint:fix

# Type checking
npm run typecheck

# E2E tests
npm run test:e2e

# Security audit
npm run security:audit
```

---

## Performance Targets

| Metric | Target | Current |
|--------|--------|---------|
| Test duration | < 15 min | 12 min |
| Linting duration | < 5 min | 3 min |
| Security scan | < 10 min | 8 min |
| E2E tests | < 20 min | 18 min |
| Staging deployment | < 15 min | 12 min |
| Production deployment | < 20 min | 18 min |
| Test success rate | > 98% | 99% |
| Deployment success rate | > 99% | 99% |

---

## Maintenance Schedule

### Daily
- Monitor workflow runs
- Check for failures
- Review error logs

### Weekly
- Generate metrics report
- Review performance trends
- Update documentation

### Monthly
- Audit workflow configuration
- Review and update secrets
- Optimize slow workflows

### Quarterly
- Full workflow audit
- Security review
- Performance optimization

---

## Related Documentation

- **[Workflows README](./workflows/README.md)** - Workflow overview and configuration
- **[GitHub Actions Docs](https://docs.github.com/en/actions)** - Official GitHub Actions documentation
- **[GitHub CLI Docs](https://cli.github.com/manual/)** - GitHub CLI reference
- **[Workflow Syntax](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions)** - YAML syntax reference

---

## Document Versions

| Document | Version | Last Updated | Status |
|----------|---------|--------------|--------|
| Troubleshooting Guide | 1.0 | 2025-01-19 | ✅ Current |
| Deployment Failure Runbook | 1.0 | 2025-01-19 | ✅ Current |
| Manual Workflow Execution | 1.0 | 2025-01-19 | ✅ Current |
| Production Rollback | 1.0 | 2025-01-19 | ✅ Current |
| Performance Monitoring | 1.0 | 2025-01-19 | ✅ Current |
| Workflows README | 3.0 | 2025-01-19 | ✅ Current |

---

## Feedback & Updates

To suggest improvements or report issues with documentation:

1. Create issue in repository
2. Tag with `documentation` label
3. Describe improvement or issue
4. Include specific document reference

---

## Quick Links

- **GitHub Actions:** https://github.com/azora/azora-os/actions
- **Workflow Runs:** https://github.com/azora/azora-os/actions/runs
- **Repository:** https://github.com/azora/azora-os
- **Issues:** https://github.com/azora/azora-os/issues

