# Security Scanning Pipeline Guide

## Overview

The Security Scanning pipeline (`security.yml`) provides comprehensive security checks to detect vulnerabilities, code-level security issues, and hardcoded secrets before code is merged or deployed.

## Workflow Components

### 1. npm Audit Job
**Purpose**: Scan npm dependencies for known vulnerabilities

**Configuration**:
- Runs on: Every push and PR to main/develop branches, weekly schedule
- Severity threshold: HIGH and CRITICAL (fails on these levels)
- Generates: Detailed audit report with remediation guidance

**Artifacts**:
- `audit-report.json` - Full npm audit output
- `audit-summary.md` - Formatted summary with remediation steps

**Remediation**:
```bash
npm audit fix                    # Automatic fixes
npm audit fix --force            # Force updates (may break compatibility)
npm audit --json                 # Review detailed report
```

### 2. Dependency Review Job
**Purpose**: Review dependency changes in pull requests

**Configuration**:
- Runs on: Pull requests only
- Severity threshold: HIGH
- Uses: GitHub's native dependency review action

**Behavior**:
- Fails if new high-severity vulnerabilities are introduced
- Provides inline comments on package.json changes

### 3. SAST Scan Job (CodeQL)
**Purpose**: Static Application Security Testing for code-level vulnerabilities

**Configuration**:
- Runs on: Every push and PR
- Languages: JavaScript and TypeScript
- Uses: GitHub CodeQL analysis

**Detects**:
- SQL injection vulnerabilities
- Cross-site scripting (XSS)
- Insecure cryptography
- Hardcoded credentials
- Path traversal issues
- Command injection

**Artifacts**:
- `codeql-results/` - Detailed CodeQL analysis results

**Review Results**:
1. Go to GitHub Actions run
2. Click "Security" tab
3. Review CodeQL alerts
4. Apply recommended fixes

### 4. Secret Detection Job (TruffleHog)
**Purpose**: Detect hardcoded secrets, API keys, and credentials

**Configuration**:
- Runs on: Every push and PR
- Tool: TruffleHog OSS
- Verification: Only verified secrets are reported

**Detects**:
- AWS credentials
- GitHub tokens
- Private keys
- API keys
- Database credentials
- Slack tokens
- And 500+ other secret patterns

**Artifacts**:
- `secret-scan-report.md` - Remediation guidance

**If Secrets Are Found**:
1. **Immediately rotate** the exposed credentials
2. **Remove from history**: Use `git-filter-repo` to remove from git history
3. **Add to .gitignore**: Prevent future commits
4. **Use environment variables**: Store secrets in GitHub Secrets or environment variables

```bash
# Example: Remove secret from history
git filter-repo --invert-paths --path-glob '*.env'
```

### 5. Security Report Job
**Purpose**: Consolidate all security scan results

**Configuration**:
- Runs after: All security jobs complete
- Condition: Always runs (even if other jobs fail)

**Outputs**:
- Consolidated security report
- PR comment with summary (on PRs)
- Links to all detailed artifacts

## Status Checks

The following security checks are **required** to pass before merging:
- ✅ npm-audit (fails on HIGH/CRITICAL)
- ✅ dependency-review (fails on HIGH severity)
- ✅ sast-scan (CodeQL analysis)
- ✅ secret-detection (TruffleHog)

## Local Security Scanning

Run security checks locally before pushing:

```bash
# Run all security checks
npm run security:scan

# Run individual checks
npm run security:audit              # npm audit
npm run lint                        # ESLint
npm run typecheck                   # TypeScript
npm run security:audit:fix          # Auto-fix vulnerabilities
```

## Artifact Retention

Security artifacts are retained for audit and compliance purposes:
- npm audit reports: 365 days
- CodeQL results: 365 days
- Secret scan reports: 365 days
- Consolidated reports: 365 days

## Troubleshooting

### npm audit failures

**Issue**: "npm audit failed with exit code 1"

**Solution**:
```bash
npm audit fix                       # Try automatic fixes first
npm audit fix --force               # Force updates if needed
npm update                          # Update all packages
```

**If vulnerabilities persist**:
- Review the vulnerability details: `npm audit --json`
- Check if there's a patched version available
- Consider using `npm audit --audit-level=moderate` if necessary (not recommended)

### CodeQL analysis failures

**Issue**: "CodeQL analysis failed"

**Solution**:
1. Check the CodeQL alerts in GitHub Security tab
2. Review the recommended fixes
3. Apply fixes to the code
4. Re-run the workflow

### Secret detection false positives

**Issue**: "TruffleHog detected a false positive"

**Solution**:
1. Verify it's not actually a secret
2. Add to `.gitignore` if it's a pattern to exclude
3. Use environment variables for actual secrets

## Best Practices

### 1. Keep Dependencies Updated
- Run `npm audit` regularly
- Update packages promptly
- Use `npm update` for minor/patch updates
- Test thoroughly after major updates

### 2. Secure Coding
- Never hardcode secrets
- Use environment variables for sensitive data
- Use GitHub Secrets for CI/CD
- Rotate credentials regularly

### 3. Code Review
- Review security scan results before merging
- Address all HIGH and CRITICAL vulnerabilities
- Document any accepted risks
- Keep security team informed

### 4. Monitoring
- Check security scan results regularly
- Subscribe to vulnerability notifications
- Review weekly security reports
- Track remediation progress

## Environment Variables & Secrets

Required GitHub Secrets (if using advanced features):
- `SAST_API_KEY` - For advanced SAST tools (optional)
- `SLACK_WEBHOOK` - For Slack notifications (optional)

No additional secrets are required for the default configuration.

## Integration with Other Workflows

The security scanning workflow integrates with:
- **PR Status Checks**: Prevents merging if security checks fail
- **Deployment Workflows**: Requires security checks to pass before deployment
- **Release Workflow**: Requires security checks before creating releases

## Reporting & Compliance

### Security Reports
- Available in GitHub Actions artifacts
- Retained for 1 year for compliance
- Can be downloaded for audit purposes

### Metrics
- Track vulnerability trends over time
- Monitor remediation time
- Measure security check pass rates

## Support & Questions

For security-related questions:
1. Review this guide
2. Check GitHub Actions logs
3. Contact the security team
4. File an issue with details

## References

- [npm audit documentation](https://docs.npmjs.com/cli/v8/commands/npm-audit)
- [GitHub CodeQL documentation](https://codeql.github.com/)
- [TruffleHog documentation](https://github.com/trufflesecurity/trufflehog)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
