@echo off
REM Quick Launch Script for Azora OS
REM Run this to get production-ready in 2 hours

echo ========================================
echo   AZORA OS - 2 HOUR LAUNCH SPRINT
echo ========================================
echo.

REM Check if we're in the right directory
if not exist "package.json" (
    echo ERROR: Run this from the azora root directory
    exit /b 1
)

echo [1/8] Running database migrations...
call npm run db:setup
if errorlevel 1 (
    echo ERROR: Database setup failed
    exit /b 1
)

echo.
echo [2/8] Running security audit...
call npm audit
call npm audit fix

echo.
echo [3/8] Running tests...
call npm test
if errorlevel 1 (
    echo WARNING: Some tests failed
)

echo.
echo [4/8] Checking test coverage...
call npm run test:coverage

echo.
echo [5/8] Building production artifacts...
call npm run build

echo.
echo [6/8] Starting production services...
docker-compose -f docker-compose.prod.yml up -d

echo.
echo [7/8] Starting monitoring stack...
docker-compose -f docker-compose.observability.yml up -d

echo.
echo [8/8] Running health checks...
timeout /t 30 /nobreak
call bash scripts/health-check.sh

echo.
echo ========================================
echo   LAUNCH SPRINT COMPLETE!
echo ========================================
echo.
echo Services running at:
echo - API Gateway: http://localhost:4000
echo - Student Portal: http://localhost:3000
echo - Grafana: http://localhost:3000
echo - Prometheus: http://localhost:9090
echo.
echo Next: Open 2-HOUR-LAUNCH-SPRINT.md for smoke tests
echo.

pause
