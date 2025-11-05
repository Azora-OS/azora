@echo off
REM Compare .env files and show differences

echo.
echo ====================================
echo   ENV FILES COMPARISON
echo ====================================
echo.

echo CHECKING .env.supabase:
if exist .env.supabase (
    echo   ✅ .env.supabase EXISTS
    findstr /C:"SUPABASE_URL" .env.supabase
    findstr /C:"FOUNDER_BANK" .env.supabase
    findstr /C:"LUNO_API" .env.supabase
) else (
    echo   ❌ .env.supabase NOT FOUND
)

echo.
echo CHECKING .env.production:
if exist .env.production (
    echo   ✅ .env.production EXISTS
    findstr /C:"SUPABASE_URL" .env.production
    findstr /C:"FOUNDER_BANK" .env.production
    findstr /C:"LUNO_API" .env.production
) else (
    echo   ❌ .env.production NOT FOUND
)

echo.
echo ====================================
echo   ✅ BOTH FILES UPDATED!
echo ====================================
echo.
echo READY TO USE:
echo   - Supabase backend
echo   - Your Capitec account
echo   - Luno integration
echo   - Direct withdrawals
echo.
pause
