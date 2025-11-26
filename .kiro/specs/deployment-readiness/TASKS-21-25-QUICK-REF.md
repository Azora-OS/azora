# Tasks 21-25 Quick Reference

## One-Line Commands

```bash
# Run all validations
npm run validate:staging

# Individual tasks
npm run validate:load          # Task 21.1: Load tests
npm run validate:monitoring    # Task 21.2: Monitoring
npm run validate:autoscaling   # Task 21.3: Autoscaling
npm run validate:dr            # Task 21.4: Disaster recovery
```

## Files Created

| Task | File | Purpose |
|------|------|---------|
| 21.1 | `tests/performance/load-tests-staging.ts` | k6 load test script |
| 21.2 | `tests/performance/monitoring-validation.ts` | Monitoring checks |
| 21.3 | `tests/performance/autoscaling-test.ts` | HPA validation |
| 21.4 | `tests/performance/disaster-recovery-test.ts` | DR testing |
| All | `tests/performance/run-staging-validation.ts` | Main runner |
| All | `scripts/run-staging-validation.sh` | Bash automation |
| All | `scripts/run-staging-validation.ps1` | PowerShell automation |
| All | `.github/workflows/staging-validation.yml` | CI/CD workflow |
| All | `docs/deployment/STAGING-VALIDATION-GUIDE.md` | Documentation |

## Success Criteria

- ✅ p95 latency < 200ms
- ✅ Error rate < 5%
- ✅ Monitoring operational
- ✅ Autoscaling works
- ✅ RTO < 4 hours
- ✅ RPO < 1 hour

## Status: ✅ COMPLETE
