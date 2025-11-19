# Release Automation Workflow Guide

## Overview

The Release Automation workflow (`release.yml`) provides automated version bumping, changelog generation, and release management based on conventional commits. This ensures consistent, traceable releases across the Azora OS project.

## Requirements Addressed

This workflow implements all requirements from Requirement 8 (Release Automation):

- **8.1**: Automatic version bumping based on conventional commits
- **8.2**: Changelog generation from conventional commits
- **8.3**: GitHub release creation with changelog and version tag
- **8.4**: npm package publishing to registry
- **8.5**: Team notifications for new releases

## Workflow Triggers

### Automatic Trigger (Tag Push)
When a tag matching `v*.*.*` is pushed to the repository:
```bash
git tag v1.2.3
git push origin v1.2.3
```

### Manual Trigger (Workflow Dispatch)
Manually trigger the workflow from GitHub Actions UI with optional version override.

## How It Works

### Stage 1: Determine Version

The `determine-version` job analyzes commits since the last release tag and automatically determines the next version using semantic versioning:

**Version Bumping Logic:**
- **BREAKING CHANGE**: Major version bump (e.g., 1.0.0 → 2.0.0)
- **feat**: Minor version bump (e.g., 1.0.0 → 1.1.0)
- **fix**: Patch version bump (e.g., 1.0.0 → 1.0.1)
- **Other commits**: Patch version bump

**Conventional Commit Format:**
```
<type>(<scope>): <subject>

<body>

<footer>
```

Examples:
```
feat(auth): add multi-factor authentication
fix(api): resolve timeout issue in gateway
BREAKING CHANGE: removed deprecated endpoints
```

### Stage 2: Generate Changelog

The workflow generates a structured changelog from conventional commits:

**Changelog Sections:**
- Features (feat commits)
- Bug Fixes (fix commits)
- Other Changes (all other commits)

Each entry includes:
- Commit message
- Commit hash (short form)

### Stage 3: Create Release

The `create-release` job performs the following steps:

1. **Update package.json**: Sets the version number
2. **Build**: Compiles the project with `npm run build`
3. **Test**: Runs full test suite with coverage
4. **Create GitHub Release**: Creates a release with:
   - Version tag (e.g., v1.2.3)
   - Generated changelog as release notes
   - Build artifacts (dist/, LICENSE, README.md)
5. **Publish to npm**: Publishes the package to npm registry
6. **Commit Version**: Commits the version update to the repository
7. **Notify Team**: Sends notifications via GitHub and Slack

## Configuration

### Required Secrets

Add these secrets to your GitHub repository settings:

- **NPM_TOKEN**: npm registry authentication token
  - Generate at: https://www.npmjs.com/settings/[username]/tokens
  - Scope: Automation (publish)

- **SLACK_WEBHOOK** (optional): Slack webhook for notifications
  - Generate at: https://api.slack.com/messaging/webhooks

### Environment Variables

No additional environment variables required. The workflow uses:
- Node.js 20.x (configurable in workflow)
- npm for package management
- Git for version control

## Usage Examples

### Example 1: Automatic Release from Commits

```bash
# Make commits with conventional format
git commit -m "feat(api): add new endpoint"
git commit -m "fix(auth): resolve token validation"

# Create and push release tag
git tag v1.1.0
git push origin v1.1.0

# Workflow automatically:
# - Detects v1.1.0 tag
# - Generates changelog from commits
# - Builds and tests
# - Creates GitHub release
# - Publishes to npm
# - Notifies team
```

### Example 2: Manual Release Trigger

1. Go to GitHub Actions → Release Automation
2. Click "Run workflow"
3. Optionally specify a version (e.g., 2.0.0)
4. Click "Run workflow"

## Outputs

### GitHub Release
- Created at: https://github.com/azora/azora-os/releases/tag/v{version}
- Contains: Changelog, build artifacts, version tag

### npm Registry
- Published at: https://www.npmjs.com/package/azora-os
- Version: Matches GitHub release tag

### Notifications
- **GitHub**: Comment on related issues/PRs
- **Slack**: Message to configured webhook with release details

## Troubleshooting

### Issue: Version Not Bumping Correctly

**Cause**: Commits don't follow conventional commit format

**Solution**: Ensure commits follow the format:
```
feat: description
fix: description
BREAKING CHANGE: description
```

### Issue: npm Publish Fails

**Cause**: NPM_TOKEN not set or invalid

**Solution**:
1. Generate new token at https://www.npmjs.com/settings/[username]/tokens
2. Update NPM_TOKEN secret in GitHub repository settings
3. Ensure token has "Automation" scope

### Issue: Slack Notification Not Sent

**Cause**: SLACK_WEBHOOK not configured

**Solution**:
1. Create webhook at https://api.slack.com/messaging/webhooks
2. Add SLACK_WEBHOOK secret to GitHub repository settings
3. Workflow will continue even if Slack notification fails

### Issue: Build or Tests Fail

**Cause**: Code quality issues or test failures

**Solution**:
1. Check workflow logs for specific errors
2. Fix issues locally and commit
3. Retry release workflow

## Best Practices

1. **Use Conventional Commits**: Always follow the conventional commit format for accurate version bumping
2. **Test Before Release**: Ensure all tests pass locally before creating release tag
3. **Review Changelog**: Check the generated changelog before confirming release
4. **Tag Naming**: Use semantic versioning format (v1.2.3)
5. **Commit Messages**: Write clear, descriptive commit messages for better changelog

## Integration with Other Workflows

This workflow integrates with:
- **Production Deployment** (`deploy-production.yml`): Triggered by release tags
- **Status Checks** (`status-checks.yml`): Ensures all checks pass before release
- **Dependency Updates** (`dependency-updates.yml`): Can trigger releases for dependency updates

## Performance

- **Typical Execution Time**: 5-10 minutes
- **Bottleneck**: npm publish (2-3 minutes)
- **Parallelization**: Version determination and changelog generation run in parallel

## Future Enhancements

- [ ] Support for pre-release versions (alpha, beta, rc)
- [ ] Automatic changelog file generation (CHANGELOG.md)
- [ ] Multi-package monorepo support
- [ ] Release notes template customization
- [ ] Integration with GitHub Releases API for better formatting
- [ ] Support for release branches and hotfixes

## References

- [Conventional Commits](https://www.conventionalcommits.org/)
- [Semantic Versioning](https://semver.org/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [npm Publishing Guide](https://docs.npmjs.com/packages-and-modules/contributing-packages-to-the-registry)
