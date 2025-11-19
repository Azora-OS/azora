# Dependency Update Automation - Quick Reference

## What Changed

The dependency update system has been enhanced to provide comprehensive automated management of npm dependencies with intelligent grouping, testing, and merge strategies.

## Key Features

### 1. Automated PR Creation
- Renovate scans for updates weekly (Monday 3 AM UTC+2)
- Creates PRs for all available updates
- Groups related packages together

### 2. Intelligent Merging
- **Auto-merge:** Minor and patch updates (if tests pass)
- **Manual review:** Major version updates
- **3-day safety period:** Before auto-merging new releases

### 3. Comprehensive Testing
- Tests run across Node 18, 20, 22
- Includes linting, type checking, unit and integration tests
- Security audit runs on all updates

### 4. Smart Grouping
- Type definitions grouped together
- Linting tools grouped together
- Testing frameworks grouped together
- Database drivers grouped together
- Security packages grouped together
- Framework updates grouped together

## Workflow Jobs

| Job | Trigger | Purpose |
|-----|---------|---------|
| `renovate` | Schedule/Manual | Creates dependency update PRs |
| `test-dependency-updates` | On Renovate PR | Runs tests across Node versions |
| `security-check-dependency-updates` | On Renovate PR | Runs security audit |
| `auto-merge-dependency-updates` | On Renovate PR | Auto-merges minor/patch if tests pass |
| `notify-major-updates` | On Renovate PR | Notifies about major updates |

## Update Type Handling

### Auto-merged (Minor/Patch)
```
✅ Type definitions (@types/*)
✅ Linting tools (eslint, prettier)
✅ Testing frameworks (jest, playwright)
✅ Other minor/patch updates
```

### Manual Review (Major)
```
⚠️ Major version updates
⚠️ Node.js runtime
⚠️ Database drivers
⚠️ Security packages
⚠️ Framework updates
```

## Configuration Files

### `.github/renovate.json`
- Renovate configuration
- Package rules and grouping
- Auto-merge settings
- Schedule and limits

### `.github/workflows/dependency-update.yml`
- GitHub Actions workflow
- Job definitions
- Testing and security checks
- Auto-merge logic

### `.github/DEPENDENCY-UPDATE-GUIDE.md`
- Comprehensive user guide
- Troubleshooting
- Best practices
- Configuration reference

## Common Tasks

### Monitor Updates
1. Go to GitHub → Pull Requests
2. Filter by label: `dependencies` or `renovate`
3. Check PR status and test results

### Review Major Update
1. Open the major update PR
2. Read the PR description and changelog
3. Review the changes
4. Run tests locally if needed
5. Approve and merge

### Skip an Update
1. Edit `.github/renovate.json`
2. Add package to `ignoreDeps` array
3. Commit and push

### Force Update Check
1. Go to GitHub Actions
2. Select "Dependency Updates" workflow
3. Click "Run workflow"
4. Select branch and run

## Limits & Schedules

- **Schedule:** Weekly on Monday at 3 AM (Africa/Johannesburg)
- **Max concurrent PRs:** 5
- **Max PRs per hour:** 2
- **Min release age:** 3 days (before auto-merge)
- **Merge strategy:** Squash

## Artifacts

- **Test results:** 30-day retention
- **Coverage reports:** 30-day retention
- **Security reports:** 90-day retention

## Status Checks

All dependency update PRs must pass:
- ✅ Linting
- ✅ Type checking
- ✅ Unit tests
- ✅ Integration tests
- ✅ Security audit

## Notifications

- PR comments on major updates
- GitHub status checks
- Assignee notifications

## Need Help?

See `.github/DEPENDENCY-UPDATE-GUIDE.md` for:
- Detailed troubleshooting
- Best practices
- Configuration reference
- FAQ

## Quick Links

- [Renovate Docs](https://docs.renovatebot.com/)
- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [npm audit Docs](https://docs.npmjs.com/cli/v8/commands/npm-audit)
- [Semantic Versioning](https://semver.org/)
