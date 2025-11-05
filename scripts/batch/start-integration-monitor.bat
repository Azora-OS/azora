@echo off
echo ============================================
echo  AZORA OS - Continuous Integration Monitor
echo ============================================
echo.

echo Starting Azora OS Continuous Integration Monitor...
echo This will monitor for incoming changes and auto-integrate them.
echo Press Ctrl+C to stop monitoring.
echo.

npm run monitor:integration

echo.
echo Monitor stopped.
pause
