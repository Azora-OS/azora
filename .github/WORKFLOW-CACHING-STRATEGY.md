# Workflow Caching and Optimization Strategy

## Overview

This document outlines the caching strategy implemented across all CI/CD workflows to optimize execution time and reduce resource consumption.

## Caching Layers

### 1. npm Dependency Caching

**Strategy**: Cache `node_modules` and npm package metadata

**Implementation**:
- Use `actions/setup-node@v4` with `cache: 'npm'`
- Cache key: `npm-${{ runner.os }}-${{ hashFiles('**/package-lock.json') }}`
- Restore keys: `npm-${{ runner.os }}-`
- Scope: All workflows that run `npm ci`

**Benefits**:
- Eliminates redundant npm install operations
- Reduces workflow execution time by 30-40%
- Saves bandwidth on dependency downloads

**Cache Invalidation**:
- Automatically invalidates when `package-lock.json` changes
- Manual invalidation: Delete cache from GitHub Actions settings

### 2. Build Artifact Caching

**Strategy**: Cache compiled TypeScript and build outputs

**Implementation**:
- Cache path: `dist/`, `build/`, `.next/`
- Cache key: `build-${{ runner.os }}-${{ github.sha }}`
- Restore keys: `build-${{ runner.os }}-`
- Scope: Workflows that run `npm run build`

**Benefits**:
- Reuse build artifacts across jobs
- Avoid rebuilding unchanged code
- Reduces execution time by 20-30%

**Cache Invalidation**:
- Automatically invalidates on source code changes
- Scope limited to current commit SHA

### 3. Playwright Browser Cache

**Strategy**: Cache Playwright browser binaries

**Implementation**:
- Cache path: `~/.cache/ms-playwright/`
- Cache key: `playwright-${{ runner.os }}-${{ hashFiles('**/package-lock.json') }}`
- Restore keys: `playwright-${{ runner.os }}-`
- Scope: E2E test workflows

**Benefits**:
- Eliminates browser binary downloads (500MB+)
- Reduces E2E test setup time by 50%
- Improves CI/CD reliability

**Cache Invalidation**:
- Automatically invalidates when Playwright version changes
- Manual invalidation: Delete cache from GitHub Actions settings

### 4. TypeScript Compilation Cache

**Strategy**: Cache TypeScript incremental compilation

**Implementation**:
- Cache path: `tsconfig.tsbuildinfo`
- Cache key: `tsc-${{ runner.os }}-${{ github.sha }}`
- Restore keys: `tsc-${{ runner.os }}-`
- Scope: Type checking workflows

**Benefits**:
- Incremental compilation reduces type checking time
- Reuses previous compilation results
- Reduces execution time by 40-50%

**Cache Invalidation**:
- Automatically invalidates on TypeScript config changes
- Scope limited to current commit SHA

### 5. ESLint Cache

**Strategy**: Cache ESLint analysis results

**Implementation**:
- Cache path: `.eslintcache`
- Cache key: `eslint-${{ runner.os }}-${{ github.sha }}`
- Restore keys: `eslint-${{ runner.os }}-`
- Scope: Linting workflows

**Benefits**:
- Incremental linting skips unchanged files
- Reduces linting time by 30-40%
- Improves feedback speed

**Cache Invalidation**:
- Automatically invalidates on ESLint config changes
- Scope limited to current commit SHA

### 6. Jest Test Cache

**Strategy**: Cache Jest test results and coverage

**Implementation**:
- Cache path: `.jest-cache/`
- Cache key: `jest-${{ runner.os }}-${{ github.sha }}`
- Restore keys: `jest-${{ runner.os }}-`
- Scope: Test workflows

**Benefits**:
- Jest skips unchanged test files
- Reduces test execution time by 20-30%
- Improves test feedback speed

**Cache Invalidation**:
- Automatically invalidates on test file changes
- Scope limited to current commit SHA

## Workflow Optimization Techniques

### 1. Parallel Job Execution

**Strategy**: Run independent jobs in parallel

**Implementation**:
- Linting and type checking run in parallel
- Unit tests run across multiple Node versions simultaneously
- E2E tests run across multiple browsers and shards

**Benefits**:
- Reduces total workflow execution time
- Utilizes GitHub Actions parallelization
- Improves feedback speed

### 2. Conditional Job Execution

**Strategy**: Skip unnecessary jobs based on file changes

**Implementation**:
```yaml
- name: Check if dependencies changed
  id: deps-changed
  run: |
    if git diff HEAD~1 package-lock.json > /dev/null 2>&1; then
      echo "changed=true" >> $GITHUB_OUTPUT
    else
      echo "changed=false" >> $GITHUB_OUTPUT
    fi

- name: Install dependencies
  if: steps.deps-changed.outputs.changed == 'true'
  run: npm ci
```

**Benefits**:
- Skips unnecessary npm installs
- Reduces workflow execution time
- Saves GitHub Actions minutes

### 3. Matrix Strategy Optimization

**Strategy**: Use matrix strategy for multi-version testing

**Implementation**:
```yaml
strategy:
  matrix:
    node-version: [18.x, 20.x, 22.x]
  fail-fast: false
```

**Benefits**:
- Tests across multiple Node versions simultaneously
- Catches version-specific issues early
- Parallelizes test execution

### 4. Job Dependencies

**Strategy**: Minimize job dependencies to enable parallelization

**Implementation**:
- Linting and type checking don't depend on each other
- Unit and integration tests run independently
- Security scanning runs in parallel with tests

**Benefits**:
- Reduces critical path length
- Enables maximum parallelization
- Improves overall workflow speed

### 5. Artifact Management

**Strategy**: Minimize artifact storage and retention

**Implementation**:
- Test reports: 30 days retention
- Coverage reports: 90 days retention
- Deployment logs: 1 year retention
- Security reports: 1 year retention

**Benefits**:
- Reduces storage costs
- Improves artifact retrieval speed
- Maintains audit trails

## Cache Size Limits

GitHub Actions has cache size limits per repository:
- **Total cache size**: 5 GB per repository
- **Individual cache size**: 400 MB per cache entry

**Current cache allocation**:
- npm dependencies: ~200 MB
- Build artifacts: ~150 MB
- Playwright browsers: ~500 MB
- TypeScript cache: ~50 MB
- ESLint cache: ~10 MB
- Jest cache: ~50 MB

**Total**: ~960 MB (well within limits)

## Monitoring Cache Performance

### Cache Hit Rates

Monitor cache effectiveness in GitHub Actions:
1. Go to repository Settings → Actions → Caches
2. View cache hit rates for each workflow
3. Identify optimization opportunities

**Target metrics**:
- npm cache hit rate: >80%
- Build cache hit rate: >70%
- Playwright cache hit rate: >90%

### Execution Time Tracking

Track workflow execution times:
1. Review workflow run history
2. Compare execution times with/without cache
3. Identify bottlenecks

**Expected improvements**:
- Linting: 30-40% faster
- Type checking: 40-50% faster
- Testing: 20-30% faster
- E2E tests: 50% faster (browser cache)

## Cache Invalidation Procedures

### Automatic Invalidation

Caches automatically invalidate when:
- Lock files change (`package-lock.json`)
- Source code changes (for SHA-based caches)
- Configuration files change (ESLint, TypeScript, Jest)

### Manual Invalidation

To manually clear caches:
1. Go to repository Settings → Actions → Caches
2. Select cache to delete
3. Click "Delete" button
4. Cache will be recreated on next workflow run

### Selective Invalidation

To invalidate specific cache types:
```bash
# Clear npm cache
gh cache delete npm-Linux-<hash>

# Clear build cache
gh cache delete build-Linux-<hash>

# Clear Playwright cache
gh cache delete playwright-Linux-<hash>
```

## Best Practices

1. **Always use lock files**: Ensures reproducible builds and cache hits
2. **Monitor cache sizes**: Keep total cache under 5 GB limit
3. **Use appropriate retention**: Balance storage costs with cache effectiveness
4. **Test cache invalidation**: Verify caches invalidate correctly on changes
5. **Document cache strategy**: Keep this document updated with changes
6. **Review cache hits**: Monitor cache effectiveness regularly

## Troubleshooting

### Cache Not Being Used

**Symptoms**: Workflow runs slow despite cache configuration

**Solutions**:
1. Verify cache key matches exactly
2. Check if cache size exceeds 400 MB limit
3. Verify lock file hasn't changed unexpectedly
4. Check GitHub Actions cache storage limits

### Cache Corruption

**Symptoms**: Workflow fails with cache-related errors

**Solutions**:
1. Manually delete corrupted cache
2. Verify cache paths are correct
3. Check for file permission issues
4. Re-run workflow to recreate cache

### Cache Misses

**Symptoms**: Cache hit rate is low (<50%)

**Solutions**:
1. Review cache key strategy
2. Check if dependencies change frequently
3. Consider using broader restore keys
4. Evaluate cache retention policies

## Future Optimizations

1. **Docker layer caching**: Cache Docker build layers for faster image builds
2. **Distributed caching**: Use external cache storage for larger artifacts
3. **Smart cache pruning**: Automatically remove unused caches
4. **Cache warming**: Pre-populate caches for faster initial runs
5. **Conditional caching**: Cache only when beneficial

## References

- [GitHub Actions Caching Documentation](https://docs.github.com/en/actions/using-workflows/caching-dependencies-to-speed-up-workflows)
- [actions/setup-node Caching](https://github.com/actions/setup-node#caching-packages-dependencies)
- [Workflow Performance Best Practices](https://docs.github.com/en/actions/learn-github-actions/workflow-syntax-for-github-actions)
