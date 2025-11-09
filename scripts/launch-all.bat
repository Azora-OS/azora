@echo off
REM Azora OS Master Launch Script - Windows
REM Constitutional AI Operating System

echo.
echo ========================================
echo    AZORA OS MASTER LAUNCHER
echo    Constitutional AI Operating System
echo ========================================
echo.

echo 🔍 Checking system requirements...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js not found! Please install Node.js 20+
    pause
    exit /b 1
)

npm --version >nul 2>&1
if errorlevel 1 (
    echo ❌ npm not found! Please install npm
    pause
    exit /b 1
)

echo ✅ Node.js and npm available

echo.
echo 📦 Installing dependencies...
call npm install

echo.
echo 🚀 Launching Azora OS Master Orchestrator...
node scripts/master-orchestrator.js

pause