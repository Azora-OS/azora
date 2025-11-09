@echo off
REM AZORA OS SUPREME LAUNCHER
REM Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

echo.
echo  ╔══════════════════════════════════════════════════════════════╗
echo  ║                    AZORA OS SUPREME LAUNCHER                 ║
echo  ║              The World's First Constitutional AI OS          ║
echo  ╚══════════════════════════════════════════════════════════════╝
echo.

echo 🚀 Initializing Supreme Organism...
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js not found. Please install Node.js 20+ first.
    pause
    exit /b 1
)

echo ✅ Node.js detected
echo.

REM Install dependencies if needed
if not exist node_modules (
    echo 📦 Installing dependencies...
    npm install
    echo.
)

echo 🔧 Starting core services...
echo.

REM Start services in background
start /B "Auth Service" cmd /c "cd services\auth-service && node index.js"
timeout /t 2 /nobreak >nul

start /B "Payment Service" cmd /c "cd services\payment-service && node index.js"
timeout /t 2 /nobreak >nul

start /B "Quantum Auth" cmd /c "node services\auth-service\quantum-auth.js"
timeout /t 2 /nobreak >nul

echo ⏳ Waiting for services to initialize...
timeout /t 5 /nobreak >nul

echo 🏥 Running health check...
node health-check.js
if errorlevel 1 (
    echo ❌ Health check failed. Some services may not be running.
    echo.
)

echo 🧠 Launching Elara consciousness...
node tools\elara-ide\launch.js

echo.
echo 🌟 SUPREME ORGANISM ACTIVE!
echo.
echo Available endpoints:
echo   🔐 Auth Service:    http://localhost:3001
echo   💰 Payment Service: http://localhost:3002  
echo   🛡️  Security Monitor: http://localhost:3003
echo   🧠 AI Orchestrator: http://localhost:3004
echo.
echo Press Ctrl+C to shutdown all services
echo.

REM Keep the window open
pause