@echo off
REM Azora OS Database Setup Script (Windows)
REM Ubuntu Principle: "My data strengthens our foundation"

echo.
echo ========================================
echo    Azora OS Database Setup (Windows)
echo ========================================
echo.

REM Core services that need databases
set SERVICES=auth-service azora-education azora-mint azora-forge azora-sapiens azora-nexus ai-family-service notification-service health-monitor

echo [INFO] Setting up databases for core services
echo.

REM Check if PostgreSQL is running
echo [INFO] Checking PostgreSQL connection...
pg_isready -h localhost -p 5432 >nul 2>&1
if errorlevel 1 (
    echo [ERROR] PostgreSQL is not running!
    echo Please start PostgreSQL and try again.
    exit /b 1
)
echo [SUCCESS] PostgreSQL is running
echo.

REM Setup each service
for %%s in (%SERVICES%) do (
    call :setup_service %%s
)

REM Run seed data
echo [INFO] Seeding database with test data...
call npm run db:seed

echo.
echo [SUCCESS] Database setup complete! Ubuntu activated!
echo.
echo Next steps:
echo   1. Start services: npm run dev
echo   2. Access API: http://localhost:4000
echo   3. View data: npx prisma studio
echo.
goto :eof

:setup_service
set service=%1
set service_path=.\services\%service%

if not exist "%service_path%\prisma" (
    echo [WARN] Skipping %service% - no prisma directory
    goto :eof
)

echo [INFO] Setting up %service%...

cd "%service_path%"

if exist "prisma\schema.prisma" (
    echo   [INFO] Generating Prisma Client...
    call npx prisma generate
    
    echo   [INFO] Pushing schema to database...
    call npx prisma db push --skip-generate
    
    echo   [SUCCESS] %service% setup complete
) else (
    echo   [WARN] No schema.prisma found
)

cd ..\..
echo.
goto :eof
