@echo off
REM Test Complete Money System

echo.
echo ====================================
echo   AZORA MINT - MONEY SYSTEM TEST
echo ====================================
echo.

cd /d "%~dp0"
node --loader tsx scripts/test-money-system.ts

echo.
pause
