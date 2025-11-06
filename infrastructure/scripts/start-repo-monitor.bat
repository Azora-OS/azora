@echo off
REM Azora OS Repository Monitor Launcher
REM This script starts the repository monitoring system

echo Starting Azora OS Repository Monitor...
echo This will continuously monitor the repository for changes and update documentation.
echo Press Ctrl+C to stop monitoring.
echo.

REM Check if tsx is installed
where tsx >nul 2>nul
if %errorlevel% neq 0 (
    echo Installing tsx globally...
    npm install -g tsx
)

REM Start the repository monitor
tsx scripts/repo-monitor.ts start 5

pause
