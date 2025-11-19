# Dependency Update Automation Guide

## Overview

This guide explains how the automated dependency update system works and how to manage dependency updates in the Azora OS project.

## How It Works

### Automated Dependency Updates

The dependency update system uses **Renovate** to automatically detect and create pull requests for available dependency updates. The system is configured to:

1. **Create PRs for available updates** - Renovate scans all `package.json` files weekly (Monday at 3 AM UTC+2)
2. **Group related dependencies** - Similar packages are grouped into single PRs for efficiency
3. **Run tests and security checks** - All dependency update PRs automatically run the full test and security suite
4. **Auto-merge minor/patch updates** - Updates for minor and patch versions are automatically merged if tests pass
5. **Require manual review for major updates** - Major version updates require manual review and approval

### Update Types

#### Minor & Patch Updates (Auto-merged)
- **Patch updates** (e.g., 1.2.3 → 1.2.4): Bug fixes and security patches
- **Minor updates** (e.g., 1.2.0 → 1.3.0): New features, backward compatible
- **Type definitions** (@types/*): Automatically merged
- **Linting tools** (eslint, prettier): Automatically merged
- **Testing frameworks** (jest, playwright): Automatically merged

These updates are automatically merged after:
- All tests pass across Node 18, 20, and 22
- Security audit passes with no moderate or higher severity issues
- A 3-day minimum release age (to catch any immediate issues)

#### Major Updates (Manual Review Required)
- **Major updates** (e.g., 1.0.0 → 2.0.0): Breaking changes
- **Node.js runtime updates**: Require testing and verification
- **Database drivers**: Require testing and verification
- **Security packages**: Require security review
- **Framework updates**: Require compatibility testing

Major updates require:
1. Manual review of breaking changes
2. Full test suite execution
3. Compatibility verification with existing code
4. Manual approval and merge

## Workflow Configuration

### Schedule

- **Default**: Weekly on Monday at 3 AM (Africa/Johannesburg timezone)
- **Manual trigger**: Available via GitHub Actions UI
- **PR-based**: Runs on any changes to package.json files

### Grouping Strategy

Dependencies are grouped by category for efficiency:

| Group | Packages | Auto-merge |
|-------|----------|-----------|
| Type Definitions | @types/* | ✅ Yes |
| Linting Tools | eslint, prettier, @typescript-eslint | ✅ Yes |
| Testing Frameworks | jest, playwright, @testing-library, vitest | ✅ Yes |
| Database Drivers | prisma, pg, mysql, mongodb | ❌ No |
| Security Packages | helmet, bcrypt, jsonwebtoken, passport | ❌ No |
| Framework Updates | react, vue, angular, express, fastify | ❌ No |
| Node.js Runtime | node | ❌ No |

### Limits

- **PR Concurrent Limit**: Maximum 5 open dependency update PRs at once
- **PR Hourly Limit**: Maximum 2 new PRs per hour
- **Minimum Release Age**: 3 days before auto-merging (allows time to catch issues)

## Managing Dependency Updates

### Reviewing Auto-merged Updates

Auto-merged updates are automatically merged after tests pass. You can:

1. **Monitor the PR**: Watch for test results in the PR checks
2. **Review the changes**: Click on the PR to see what was updated
3. **Check the commit**: View the squashed commit in the main branch

### Reviewing Major Updates

When a major update PR is created:

1. **Read the PR description**: Contains information about the update
2. **Check the changelog**: Review breaking changes in the linked changelog
3. **Run tests locally**: 
   ```bash
   npm install
   npm run test:unit -- --run
   npm run test:integration -- --run
   npm run test:e2e -- --run
   ```
4. **Test compatibility**: Verify the update works with your code
5. **Approve and merge**: Click "Approve" and merge when ready

### Handling Failed Updates

If a dependency update PR fails tests:

1. **Check the failure reason**: Review the test output in the PR checks
2. **Investigate the issue**: 
   - Is it a breaking change?
   - Is there a compatibility issue?
   - Is it a transient test failure?
3. **Options**:
   - **Fix the code**: Update your code to be compatible with the new version
   - **Revert the update**: Close the PR and Renovate will try again later
   - **Pin the version**: Add to `.renovaterc` to skip this update

### Skipping Updates

To skip specific packages or versions:

1. **Edit `.github/renovate.json`**
2. **Add to `ignoreDeps` array**:
   ```json
   "ignoreDeps": ["package-name", "another-package"]
   ```
3. **Commit and push**: Renovate will respect the configuration

### Forcing an Update

To manually trigger dependency updates:

1. **Go to GitHub Actions**
2. **Select "Dependency Updates" workflow**
3. **Click "Run workflow"**
4. **Select the branch** (usually main)
5. **Click "Run workflow"**

## Troubleshooting

### PR Not Being Created

**Problem**: Expected dependency update PR not created

**Solutions**:
1. Check if the package is in `ignoreDeps`
2. Verify the schedule (runs Monday at 3 AM UTC+2)
3. Check Renovate logs in the workflow run
4. Manually trigger the workflow

### Auto-merge Not Working

**Problem**: Minor/patch update PR not auto-merging

**Solutions**:
1. Check if tests are passing (required for auto-merge)
2. Verify the update is actually minor/patch (not major)
3. Check if minimum release age has passed (3 days)
4. Review the PR for any blocking issues

### Security Audit Failing

**Problem**: Dependency update PR fails security audit

**Solutions**:
1. Review the audit report in the PR artifacts
2. Check if the vulnerability is in the new version
3. If it's a pre-existing vulnerability, update the baseline
4. Consider using `npm audit fix` to resolve issues

### Tests Failing on Update

**Problem**: Tests fail after dependency update

**Solutions**:
1. Review the test failure details
2. Check the package changelog for breaking changes
3. Update your code to be compatible
4. Run tests locally to debug
5. If it's a transient failure, close and reopen the PR

## Best Practices

### 1. Review Major Updates Promptly

Major updates require manual review. Don't let them sit in the PR queue:
- Set up notifications for major update PRs
- Review within 24-48 hours
- Test thoroughly before merging

### 2. Keep Dependencies Current

Regular updates prevent security issues and keep the codebase modern:
- Don't ignore update PRs
- Merge auto-merged updates promptly
- Review and merge major updates regularly

### 3. Monitor Security Alerts

Security vulnerabilities are high priority:
- Review security update PRs immediately
- Merge security patches as soon as possible
- Check the vulnerability details before merging

### 4. Test Locally for Major Updates

Before merging major updates:
- Run the full test suite locally
- Test the specific functionality affected by the update
- Verify in a staging environment if possible

### 5. Document Breaking Changes

When merging major updates:
- Add a note to the changelog
- Document any code changes required
- Update documentation if needed

## Configuration Reference

### Renovate Configuration File

Location: `.github/renovate.json`

Key settings:
- `schedule`: When to run (cron format)
- `timezone`: Timezone for schedule
- `packageRules`: Rules for different package types
- `automerge`: Enable/disable auto-merging
- `groupName`: Group related packages
- `labels`: Labels to add to PRs
- `assignees`: Who to assign PRs to

### GitHub Actions Workflow

Location: `.github/workflows/dependency-update.yml`

Key jobs:
- `renovate`: Creates dependency update PRs
- `test-dependency-updates`: Runs tests on update PRs
- `security-check-dependency-updates`: Runs security checks
- `auto-merge-dependency-updates`: Auto-merges minor/patch updates
- `notify-major-updates`: Notifies about major updates

## Related Documentation

- [Renovate Documentation](https://docs.renovatebot.com/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [npm audit Documentation](https://docs.npmjs.com/cli/v8/commands/npm-audit)
- [Semantic Versioning](https://semver.org/)

## Support

For issues or questions about dependency updates:

1. Check this guide first
2. Review the Renovate logs in GitHub Actions
3. Check the PR for error messages
4. Consult the Renovate documentation
5. Open an issue in the repository
