@echo off
REM Azora OS - Start All Services (Windows)
REM Copyright (c) 2025 Azora ES (Pty) Ltd.

echo Starting Azora OS Services...
echo ================================

REM Constitutional Services
echo Starting Constitutional Services...
start "Constitutional Court" cmd /k "cd services\constitutional-court-service && npm start"
timeout /t 2 /nobreak >nul
start "Constitutional AI" cmd /k "npx tsx services\constitutional-ai-governance.ts"
timeout /t 2 /nobreak >nul
start "Chronicle Protocol" cmd /k "cd services\chronicle-protocol && npm start"
timeout /t 2 /nobreak >nul

REM Marketplace Services
echo Starting Marketplace Services...
start "Azora Forge" cmd /k "cd services\azora-forge && npm start"
timeout /t 2 /nobreak >nul
start "Marketplace" cmd /k "cd services\marketplace-service && npm start"
timeout /t 2 /nobreak >nul
start "Azora Careers" cmd /k "cd services\azora-careers && npm start"
timeout /t 2 /nobreak >nul

REM API Gateway
echo Starting API Gateway...
start "API Gateway" cmd /k "cd services\api-gateway && npm start"
timeout /t 2 /nobreak >nul

echo.
echo All services started!
echo.
echo Service URLs:
echo   API Gateway:          http://localhost:4000
echo   Constitutional Court: http://localhost:4500
echo   Constitutional AI:    http://localhost:4501
echo   Chronicle Protocol:   http://localhost:4400
echo   Azora Forge:          http://localhost:4700
echo   Marketplace:          http://localhost:4600
echo   Azora Careers:        http://localhost:4800
echo.
echo Health Check: curl http://localhost:4000/health
echo.
pause
