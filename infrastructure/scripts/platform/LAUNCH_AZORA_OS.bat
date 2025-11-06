@echo off
REM AZORA PROPRIETARY LICENSE
REM Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

echo.
echo ████████████████████████████████████████████████████████████████
echo █                                                              █
echo █                    AZORA OS LAUNCHER                        █
echo █                                                              █
echo ████████████████████████████████████████████████████████████████
echo.
echo Transforming your Windows system into Azora OS...
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed. Please install Node.js 22+ first.
    echo Download from: https://nodejs.org/
    pause
    exit /b 1
)

REM Check if tsx is available
npx tsx --version >nul 2>&1
if errorlevel 1 (
    echo Installing tsx for TypeScript execution...
    npm install -g tsx
)

REM Change to the script directory
cd /d "%~dp0"

REM Launch Azora OS transformation
echo 🚀 Starting Azora OS transformation...
echo.

npx tsx transform-windows-to-azora.ts

REM Keep window open if there's an error
if errorlevel 1 (
    echo.
    echo ❌ Transformation failed. Press any key to exit.
    pause
)

echo.
echo ✅ Azora OS transformation complete!
echo Press any key to exit.
pause >nul
