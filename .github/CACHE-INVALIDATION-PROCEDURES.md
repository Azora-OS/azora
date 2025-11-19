# Cache Invalidation Procedures

## Overview

This document provides procedures for managing cache invalidation in GitHub Actions workflows. Proper cache management ensures optimal performance while preventing stale cache issues.

## Automatic Cache Invalidation

### When Caches Automatically Invalidate

Caches automatically invalidate when:

1. **Lock Files Change**
   - `package-lock.json` changes
   - npm cache invalidates automatically
   - Playwright cache invalidates automatically

2. **Source Code Changes (SHA-based caches)**
   - ESLint cache invalidates when source files change
   - TypeScript cache invalidates when source files change
   - Jest cache invalidates when test files change
   - Build cache invalidates when source files change

3. **Configuration Files Change**
   - `.eslintrc.json` changes → ESLint cache invalidates
   - `tsconfig.json` changes → TypeScript cache invalidates
   - `jest.config.js` changes → Jest cache invalidates
   - `playwright.config.ts` changes → Playwright cache invalidates

4. **Cache Expiration**
   - Caches expire after 7 days of no access
   - GitHub Actions automatically removes expired caches
   - No manual action required

### Cache Key Strategy

**npm dependencies**:
```yaml
key: npm-${{ runner.os }}-${{ hashFiles('**/package-lock.json') }}
```
- Invalidates when `package-lock.json` changes
- Specific to operating system

**ESLint cache**:
```yaml
key: eslint-${{ runner.os }}-${{ github.sha }}
```
- Invalidates on every commit (SHA changes)
- Specific to operating system

**TypeScript cache**:
```yaml
key: tsc-${{ runner.os }}-${{ github.sha }}
```
- Invalidates on every commit (SHA changes)
- Specific to operating system

**Jest cache**:
```yaml
key: jest-unit-${{ runner.os }}-node-${{ matrix.node-version }}-${{ github.sha }}
```
- Invalidates on every commit (SHA changes)
- Specific to operating system and Node version

**Playwright cache**:
```yaml
key: playwright-${{ runner.os }}-${{ hashFiles('**/package-lock.json') }}
```
- Invalidates when `package-lock.json` changes
- Specific to operating system

**Build cache**:
```yaml
key: build-staging-${{ runner.os }}-${{ github.sha }}
```
- Invalidates on every commit (SHA changes)
- Specific to operating system and environment

## Manual Cache Invalidation

### Using GitHub UI

1. **Navigate to Cache Settings**
   - Go to repository Settings
   - Click "Actions" in left sidebar
   - Click "Caches"

2. **View Available Caches**
   - See all caches for the repository
   - View cache size and last accessed date
   - Filter by cache name or branch

3. **Delete Specific Cache**
   - Find cache to delete
   - Click "Delete" button
   - Confirm deletion
   - Cache will be recreated on next workflow run

### Using GitHub CLI

**List all caches**:
```bash
gh cache list --repo owner/repo
```

**Delete specific cache**:
```bash
gh cache delete <cache-key> --repo owner/repo
```

**Delete cache by pattern**:
```bash
# Delete all npm caches
gh cache list --repo owner/repo | grep "npm-" | awk '{print $1}' | xargs -I {} gh cache delete {} --repo owner/repo

# Delete all build caches
gh cache list --repo owner/repo | grep "build-" | awk '{print $1}' | xargs -I {} gh cache delete {} --repo owner/repo
```

### Using Workflow Dispatch

Create a manual workflow to clear caches:

```yaml
name: Clear Caches

on:
  workflow_dispatch:
    inputs:
      cache_type:
        description: 'Cache type to clear'
        required: true
        type: choice
        options:
          - npm
          - eslint
          - tsc
          - jest
          - playwright
          - build
          - all

jobs:
  clear-cache:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Clear npm cache
        if: inputs.cache_type == 'npm' || inputs.cache_type == 'all'
        run: |
          gh cache list --repo ${{ github.repository }} | grep "npm-" | awk '{print $1}' | xargs -I {} gh cache delete {} --repo ${{ github.repository }}
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
      
      - name: Clear ESLint cache
        if: inputs.cache_type == 'eslint' || inputs.cache_type == 'all'
        run: |
          gh cache list --repo ${{ github.repository }} | grep "eslint-" | awk '{print $1}' | xargs -I {} gh cache delete {} --repo ${{ github.repository }}
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
      
      - name: Clear TypeScript cache
        if: inputs.cache_type == 'tsc' || inputs.cache_type == 'all'
        run: |
          gh cache list --repo ${{ github.repository }} | grep "tsc-" | awk '{print $1}' | xargs -I {} gh cache delete {} --repo ${{ github.repository }}
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
      
      - name: Clear Jest cache
        if: inputs.cache_type == 'jest' || inputs.cache_type == 'all'
        run: |
          gh cache list --repo ${{ github.repository }} | grep "jest-" | awk '{print $1}' | xargs -I {} gh cache delete {} --repo ${{ github.repository }}
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
      
      - name: Clear Playwright cache
        if: inputs.cache_type == 'playwright' || inputs.cache_type == 'all'
        run: |
          gh cache list --repo ${{ github.repository }} | grep "playwright-" | awk '{print $1}' | xargs -I {} gh cache delete {} --repo ${{ github.repository }}
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
      
      - name: Clear build cache
        if: inputs.cache_type == 'build' || inputs.cache_type == 'all'
        run: |
          gh cache list --repo ${{ github.repository }} | grep "build-" | awk '{print $1}' | xargs -I {} gh cache delete {} --repo ${{ github.repository }}
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
      
      - name: Verify cache cleared
        run: |
          echo "Cache cleared successfully"
          gh cache list --repo ${{ github.repository }}
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

## Selective Cache Invalidation

### Invalidate npm Cache Only

**Scenario**: Dependencies need to be reinstalled

**Steps**:
1. Go to Settings → Actions → Caches
2. Find caches starting with `npm-`
3. Delete all npm caches
4. Next workflow run will reinstall dependencies

**Command**:
```bash
gh cache list --repo owner/repo | grep "npm-" | awk '{print $1}' | xargs -I {} gh cache delete {} --repo owner/repo
```

### Invalidate Build Cache Only

**Scenario**: Build artifacts are corrupted

**Steps**:
1. Go to Settings → Actions → Caches
2. Find caches starting with `build-`
3. Delete all build caches
4. Next workflow run will rebuild

**Command**:
```bash
gh cache list --repo owner/repo | grep "build-" | awk '{print $1}' | xargs -I {} gh cache delete {} --repo owner/repo
```

### Invalidate Playwright Cache Only

**Scenario**: Playwright browsers need to be reinstalled

**Steps**:
1. Go to Settings → Actions → Caches
2. Find caches starting with `playwright-`
3. Delete all Playwright caches
4. Next E2E test run will reinstall browsers

**Command**:
```bash
gh cache list --repo owner/repo | grep "playwright-" | awk '{print $1}' | xargs -I {} gh cache delete {} --repo owner/repo
```

### Invalidate All Caches

**Scenario**: Complete cache reset needed

**Steps**:
1. Go to Settings → Actions → Caches
2. Select all caches
3. Delete all caches
4. Next workflow run will recreate all caches

**Command**:
```bash
gh cache list --repo owner/repo | awk '{print $1}' | xargs -I {} gh cache delete {} --repo owner/repo
```

## Cache Invalidation Scenarios

### Scenario 1: Corrupted npm Cache

**Problem**: npm install fails with cache errors

**Solution**:
```bash
# Delete npm cache
gh cache delete npm-Linux-<hash> --repo owner/repo

# Next workflow run will reinstall dependencies
```

### Scenario 2: Stale Build Artifacts

**Problem**: Old build artifacts causing issues

**Solution**:
```bash
# Delete build cache
gh cache delete build-staging-Linux-<hash> --repo owner/repo

# Next deployment will rebuild
```

### Scenario 3: Playwright Browser Issues

**Problem**: E2E tests failing due to browser issues

**Solution**:
```bash
# Delete Playwright cache
gh cache delete playwright-Linux-<hash> --repo owner/repo

# Next E2E test run will reinstall browsers
```

### Scenario 4: ESLint Cache Corruption

**Problem**: Linting results are incorrect

**Solution**:
```bash
# Delete ESLint cache
gh cache delete eslint-Linux-<hash> --repo owner/repo

# Next linting run will reanalyze all files
```

### Scenario 5: TypeScript Cache Issues

**Problem**: Type checking producing incorrect results

**Solution**:
```bash
# Delete TypeScript cache
gh cache delete tsc-Linux-<hash> --repo owner/repo

# Next type check will recompile all files
```

## Cache Monitoring

### Monitor Cache Usage

1. **Go to Settings → Actions → Caches**
2. **View cache statistics**:
   - Cache name
   - Size
   - Last accessed date
   - Branch

3. **Identify issues**:
   - Caches not accessed recently
   - Caches exceeding size limits
   - Duplicate caches

### Monitor Cache Hit Rates

1. **Review workflow run logs**
2. **Look for cache hit/miss messages**:
   - "Cache hit: true" = cache was used
   - "Cache hit: false" = cache was not found
3. **Calculate hit rate**:
   - Hit rate = (hits / total runs) × 100
   - Target: >80% for npm, >70% for others

### Monitor Cache Performance

1. **Compare execution times**:
   - With cache: faster
   - Without cache: slower
2. **Track improvements**:
   - Linting: 30-40% faster
   - Type checking: 40-50% faster
   - Testing: 20-30% faster
   - E2E tests: 50% faster

## Best Practices

### 1. Regular Cache Monitoring

- Check cache usage weekly
- Monitor cache hit rates
- Identify optimization opportunities

### 2. Proactive Cache Management

- Delete unused caches
- Monitor cache sizes
- Prevent cache bloat

### 3. Document Cache Changes

- Update WORKFLOW-CACHING-STRATEGY.md
- Document cache invalidation events
- Track cache performance metrics

### 4. Test Cache Invalidation

- Verify caches invalidate correctly
- Test manual cache deletion
- Confirm cache recreation

### 5. Communicate Cache Changes

- Notify team of cache updates
- Document cache strategy changes
- Share cache performance metrics

## Troubleshooting

### Cache Not Invalidating

**Problem**: Cache not invalidating when expected

**Solutions**:
1. Verify cache key is correct
2. Check if lock file actually changed
3. Verify GitHub Actions cache storage
4. Manually delete cache and retry

### Cache Size Exceeding Limits

**Problem**: Cache exceeds 400 MB limit

**Solutions**:
1. Reduce cache paths
2. Exclude unnecessary files
3. Use multiple smaller caches
4. Implement cache pruning

### Cache Corruption

**Problem**: Cache causing workflow failures

**Solutions**:
1. Delete corrupted cache
2. Verify cache paths
3. Check file permissions
4. Re-run workflow

## References

- [GitHub Actions Caching Documentation](https://docs.github.com/en/actions/using-workflows/caching-dependencies-to-speed-up-workflows)
- [GitHub CLI Cache Commands](https://cli.github.com/manual/gh_cache)
- [Cache Troubleshooting](https://docs.github.com/en/actions/using-workflows/caching-dependencies-to-speed-up-workflows#troubleshooting-cache-errors)

## Support

For questions or issues with cache invalidation:
1. Review this document
2. Check GitHub Actions documentation
3. Contact DevOps team
4. Check workflow run logs for cache information
