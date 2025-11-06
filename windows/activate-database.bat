@echo off
REM ACTIVATE SUPER AI DATABASE
REM Brings the super AI database to full functionality

echo ========================================
echo 🧠 ACTIVATE SUPER AI DATABASE
echo ========================================
echo.

echo Checking prerequisites...
echo ------------------------

where node >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js not found. Please install Node.js first.
    pause
    exit /b 1
)
echo ✅ Node.js found

where npm >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm not found. Please install npm first.
    pause
    exit /b 1
)
echo ✅ npm found

echo.
echo Installing dependencies...
echo ------------------------
npm install

echo.
echo Activating Super AI Database...
echo -------------------------------
npx tsx scripts/activate-super-database.ts

echo.
echo 🧠 Super AI Database activation completed!
echo Press any key to exit...
pause >nul
