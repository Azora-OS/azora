@echo off
echo 🔧 AZORA OS CRITICAL DEPENDENCY INSTALLER
echo Constitutional AI Operating System
echo ═══════════════════════════════════════

echo.
echo 📦 Installing critical global packages...
call npm install -g tsx ts-node ts-node-dev vite nodemon

echo.
echo 📦 Installing root dependencies...
call npm install prom-client morgan socket.io openai express cors

echo.
echo 📦 Installing API Gateway dependencies...
cd services\api-gateway
call npm install prom-client express cors
cd ..\..

echo.
echo 📦 Installing Azora Covenant dependencies...
cd services\azora-covenant
call npm install morgan express
cd ..\..

echo.
echo 📦 Installing Azora Workspace dependencies...
cd services\azora-workspace
call npm install socket.io express
cd ..\..

echo.
echo 📦 Installing Azora LMS dependencies...
cd services\azora-lms
call npm install openai typescript
cd ..\..

echo.
echo 📦 Installing frontend dependencies...
cd apps\enterprise-ui
call npm install vite @vitejs/plugin-react
cd ..\..

cd apps\marketplace-ui
call npm install vite @vitejs/plugin-react
cd ..\..

cd apps\pay-ui
call npm install vite @vitejs/plugin-react
cd ..\..

echo.
echo ✅ Critical dependencies installed!
echo 🚀 You can now run: node scripts/master-orchestrator.js
pause