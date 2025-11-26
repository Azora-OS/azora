# Tasks 21-25: Staging validation automation script (Windows)

Write-Host "===================================" -ForegroundColor Cyan
Write-Host "Azora Staging Validation Pipeline" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan

# Task 21.1: Load Tests
Write-Host "`nTask 21.1: Running load tests..." -ForegroundColor Yellow
k6 run --out json=load-test-results.json tests/performance/load-tests-staging.ts
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

# Task 21.2: Monitoring Validation
Write-Host "`nTask 21.2: Validating monitoring..." -ForegroundColor Yellow
npx ts-node tests/performance/monitoring-validation.ts
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

# Task 21.3: Autoscaling Test
Write-Host "`nTask 21.3: Testing autoscaling..." -ForegroundColor Yellow
npx ts-node tests/performance/autoscaling-test.ts
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

# Task 21.4: Disaster Recovery
Write-Host "`nTask 21.4: Testing disaster recovery..." -ForegroundColor Yellow
npx ts-node tests/performance/disaster-recovery-test.ts
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

# Task 22: Pre-deployment checks
Write-Host "`nRunning pre-deployment validation..." -ForegroundColor Yellow
npm test -- --coverage
npm run lint
npm run typecheck

Write-Host "`n===================================" -ForegroundColor Green
Write-Host "✅ All staging validations passed!" -ForegroundColor Green
Write-Host "===================================" -ForegroundColor Green
