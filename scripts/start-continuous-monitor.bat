@echo off
REM Azora OS Continuous Repository Monitor - HIGH FREQUENCY
REM Monitors every 2 minutes for rapid change detection

echo 🚀 Starting Azora OS HIGH-FREQUENCY Repository Monitor
echo This will check for changes every 2 minutes and auto-commit/push
echo Press Ctrl+C to stop monitoring
echo.

REM Check if tsx is available (for documentation updates)
where tsx >nul 2>nul
if %errorlevel% neq 0 (
    echo ⚠️  Warning: tsx not found. Documentation updates will be skipped.
    echo Install with: npm install -g tsx
    echo.
)

REM Start the continuous monitor
powershell.exe -ExecutionPolicy Bypass -File "%~dp0continuous-monitor.ps1" -IntervalSeconds 120

pause
