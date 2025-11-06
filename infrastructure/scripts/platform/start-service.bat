@echo off
REM Universal service starter - Works for any Azora service

set SERVICE_NAME=%1
set SERVICE_PORT=%2
set SERVICE_DIR=%3
set SERVICE_FILE=%4

cd "%SERVICE_DIR%"

echo.
echo ========================================
echo Starting %SERVICE_NAME% on port %SERVICE_PORT%
echo ========================================
echo.

set PORT=%SERVICE_PORT%
set NODE_ENV=development
set MOCK_MODE=true
set REQUIRE_DB=false

if "%SERVICE_FILE:~-3%"==".ts" (
    start "Azora - %SERVICE_NAME%" cmd /k "npx tsx %SERVICE_FILE%"
) else (
    start "Azora - %SERVICE_NAME%" cmd /k "node %SERVICE_FILE%"
)

echo Started %SERVICE_NAME% in new window
cd "%~dp0"

