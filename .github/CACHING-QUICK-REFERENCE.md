# Workflow Caching - Quick Reference

## Cache Types

| Cache Type | Path | Key | Invalidates | Impact |
|-----------|------|-----|------------|--------|
| npm | node_modules | `npm-${{ runner.os }}-${{ hashFiles('**/package-lock.json') }}` | When package-lock.json changes | 30-40% faster |
| ESLint | .eslintcache | `eslint-${{ runner.os }}-${{ github.sha }}` | On every commit | 30-40% faster |
| TypeScript | tsconfig.tsbuildinfo | `tsc-${{ runner.os }}-${{ github.sha }}` | On every commit | 40-50% faster |
| Jest | .jest-cache | `jest-*-${{ github.sha }}` | On every commit | 20-30% faster |
| Playwright | ~/.cache/ms-playwright | `playwright-${{ runner.os }}-${{ hashFiles('**/package-lock.json') }}` | When package-lock.json changes | 50% faster |
| Build | dist/, build/, .next/ | `build-*-${{ github.sha }}` | On every commit | 20-30% faster |

## Common Tasks

### Clear All Caches

```bash
gh cache list --repo owner/repo | awk '{print $1}' | xargs -I {} gh cache delete {} --repo owner/repo
```

### Clear npm Cache

```bash
gh cache list --repo owner/repo | grep "npm-" | awk '{print $1}' | xargs -I {} gh cache delete {} --repo owner/repo
```

### Clear Build Cache

```bash
gh cache list --repo owner/repo | grep "build-" | awk '{print $1}' | xargs -I {} gh cache delete {} --repo owner/repo
```

### Clear Playwright Cache

```bash
gh cache list --repo owner/repo | grep "playwright-" | awk '{print $1}' | xargs -I {} gh cache delete {} --repo owner/repo
```

### List All Caches

```bash
gh cache list --repo owner/repo
```

### View Cache Details

```bash
gh cache list --repo owner/repo --json name,sizeBytes,createdAt,lastAccessedAt
```

## Performance Improvements

### Before Caching
- Linting: 2-3 minutes
- Type checking: 3-4 minutes
- Unit tests: 5-7 minutes
- Integration tests: 8-10 minutes
- E2E tests: 15-20 minutes
- **Total**: 45-60 minutes

### After Caching
- Linting: 1-2 minutes (30-40% faster)
- Type checking: 1.5-2 minutes (40-50% faster)
- Unit tests: 4-5 minutes (20-30% faster)
- Integration tests: 6-8 minutes (20-30% faster)
- E2E tests: 7-10 minutes (50% faster)
- **Total**: 25-35 minutes (40-50% faster)

## Cache Hit Rates

**Target metrics**:
- npm cache: >80%
- Build cache: >70%
- Playwright cache: >90%
- ESLint cache: >70%
- Jest cache: >70%
- TypeScript cache: >70%

**Monitor in GitHub UI**:
1. Settings → Actions → Caches
2. View cache hit rates
3. Identify optimization opportunities

## Troubleshooting

### Cache Not Working

1. Check cache key matches exactly
2. Verify cache size < 400 MB
3. Check lock file hasn't changed
4. Delete cache and retry

### Slow Workflows

1. Check cache hit rates
2. Verify cache is being used
3. Monitor cache sizes
4. Consider cache warming

### Cache Corruption

1. Delete corrupted cache
2. Verify cache paths
3. Check file permissions
4. Re-run workflow

## Workflows Using Caching

| Workflow | Caches Used |
|----------|------------|
| ci-lint-and-type-check.yml | npm, ESLint, TypeScript |
| test.yml | npm, Jest |
| e2e-tests.yml | npm, Playwright |
| security.yml | npm |
| deploy-staging.yml | npm, build |
| deploy-production.yml | npm, build |

## Cache Storage Limits

- **Total per repository**: 5 GB
- **Individual cache**: 400 MB
- **Current usage**: ~960 MB (19% of limit)

## When Caches Invalidate

- **npm**: When package-lock.json changes
- **ESLint**: On every commit (SHA-based)
- **TypeScript**: On every commit (SHA-based)
- **Jest**: On every commit (SHA-based)
- **Playwright**: When package-lock.json changes
- **Build**: On every commit (SHA-based)
- **Automatic expiration**: After 7 days of no access

## Best Practices

1. ✅ Always use lock files (`npm ci`)
2. ✅ Monitor cache hit rates
3. ✅ Delete unused caches
4. ✅ Document cache changes
5. ✅ Test cache invalidation
6. ❌ Don't cache large files (>400 MB)
7. ❌ Don't cache frequently changing files
8. ❌ Don't rely on cache for critical data

## Documentation

- **Detailed guide**: WORKFLOW-CACHING-STRATEGY.md
- **Optimization guide**: WORKFLOW-OPTIMIZATION-GUIDE.md
- **Invalidation procedures**: CACHE-INVALIDATION-PROCEDURES.md
- **GitHub Actions docs**: https://docs.github.com/en/actions/using-workflows/caching-dependencies-to-speed-up-workflows

## Support

For questions or issues:
1. Check this quick reference
2. Review detailed documentation
3. Check GitHub Actions logs
4. Contact DevOps team
