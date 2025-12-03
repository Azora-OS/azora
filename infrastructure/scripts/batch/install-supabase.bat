@echo off
REM Install Supabase Package

echo.
echo ===================================
echo  Installing Supabase Package
echo ===================================
echo.

cd /d "%~dp0"
npm install @supabase/supabase-js

echo.
if %ERRORLEVEL% EQU 0 (
    echo ✅ Supabase package installed successfully!
    echo.
    echo Next step: Run the database schema
    echo   1. Go to: https://mpqlpqegrzxklljwrzpe.supabase.co
    echo   2. Click SQL Editor
    echo   3. Copy contents of supabase\schema.sql
    echo   4. Paste and Run
    echo.
    echo Then test: npm run test:supabase
) else (
    echo ❌ Installation failed
    echo Try running this batch file as Administrator
)

echo.
pause
