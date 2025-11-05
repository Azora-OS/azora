@echo off
REM Test Supabase Connection

echo.
echo ===================================
echo  Testing Supabase Connection
echo ===================================
echo.

cd /d "%~dp0"
node scripts/test-supabase-simple.js

echo.
pause
