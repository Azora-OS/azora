@echo off
REM Live Withdrawal Test

echo.
echo ====================================
echo   LIVE WITHDRAWAL TEST
echo ====================================
echo.

echo WARNING: This will attempt a REAL withdrawal!
echo.
echo Prerequisites:
echo   ✅ Luno account created
echo   ✅ API keys added to .env.production
echo   ✅ Capitec account linked to Luno
echo   ✅ At least R10 in Luno ZAR wallet
echo.

set /p CONFIRM="Ready to test? (yes/no): "
if /i not "%CONFIRM%"=="yes" (
    echo Test cancelled
    pause
    exit /b 0
)

echo.
echo Testing withdrawal flow...
echo.

node test-direct-withdrawal.cjs

echo.
echo ====================================
echo   TEST COMPLETE!
echo ====================================
echo.

echo Next steps:
echo   1. Check your Capitec app for incoming R10
echo   2. If successful, scale up to 100 students
echo   3. Start earning R1000/month!
echo.
pause
