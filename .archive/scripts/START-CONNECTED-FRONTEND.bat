@echo off
echo ========================================
echo   Azora OS - Connected Frontend Start
echo ========================================
echo.

echo [1/4] Starting API Gateway...
start "API Gateway" cmd /k "cd services\api-gateway && npm start"
timeout /t 3 /nobreak >nul

echo [2/4] Starting Student Portal...
start "Student Portal" cmd /k "cd apps\student-portal && npm run dev"
timeout /t 2 /nobreak >nul

echo [3/4] Starting Enterprise UI...
start "Enterprise UI" cmd /k "cd apps\enterprise-ui && npm run dev"
timeout /t 2 /nobreak >nul

echo [4/4] Starting Marketplace UI...
start "Marketplace UI" cmd /k "cd apps\marketplace-ui && npm run dev"

echo.
echo ========================================
echo   All services starting...
echo ========================================
echo.
echo   API Gateway:      http://localhost:4000
echo   Student Portal:   http://localhost:3000
echo   Enterprise UI:    http://localhost:3001
echo   Marketplace UI:   http://localhost:3002
echo.
echo   Test connection:  node scripts\test-frontend-connection.js
echo.
echo ========================================
