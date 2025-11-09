@echo off
echo 🌟 AZORA OS COMPLETE STARTUP SYSTEM
echo Constitutional AI Operating System
echo ═══════════════════════════════════════

echo.
echo 🔧 Step 1: Installing critical dependencies...
echo.

REM Install global packages
echo Installing global packages...
call npm install -g tsx ts-node ts-node-dev vite nodemon

REM Install root dependencies
echo Installing root dependencies...
call npm install

REM Install service-specific dependencies
echo Installing API Gateway dependencies...
cd services\api-gateway
call npm install prom-client
cd ..\..

echo Installing Azora Covenant dependencies...
cd services\azora-covenant
call npm install morgan
cd ..\..

echo Installing Azora Workspace dependencies...
cd services\azora-workspace
call npm install socket.io
cd ..\..

echo Installing Azora LMS dependencies...
cd services\azora-lms
call npm install openai
cd ..\..

echo Installing Health Monitor dependencies...
cd services\health-monitor
call npm install express
cd ..\..

REM Install frontend dependencies
echo Installing Enterprise UI dependencies...
cd apps\enterprise-ui
call npm install vite @vitejs/plugin-react
cd ..\..

echo Installing Marketplace UI dependencies...
cd apps\marketplace-ui
call npm install vite @vitejs/plugin-react
cd ..\..

echo Installing Pay UI dependencies...
cd apps\pay-ui
call npm install vite @vitejs/plugin-react
cd ..\..

echo.
echo ✅ Dependencies installed successfully!
echo.
echo 🚀 Step 2: Launching Azora OS...
echo.

REM Launch the master orchestrator
node scripts\master-orchestrator.js

pause