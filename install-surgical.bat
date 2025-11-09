@echo off
REM AZORA OS - SURGICAL DEPENDENCY INSTALLATION
REM Installing dependencies service by service to avoid conflicts

echo ========================================
echo   AZORA OS SURGICAL DEPENDENCY INSTALL
echo ========================================
echo.

cd "c:\Users\Azora Sapiens\Documents\azora"

echo [1/8] Installing auth-service...
cd services/auth-service
call npm install
cd ..\..

echo [2/8] Installing azora-mint...
cd services/azora-mint
call npm install --legacy-peer-deps
cd ..\..

echo [3/8] Installing azora-forge...
cd services/azora-forge
call npm install --legacy-peer-deps
cd ..\..

echo [4/8] Installing azora-lms...
cd services/azora-lms
call npm install --legacy-peer-deps
cd ..\..

echo [5/8] Installing azora-nexus...
cd services/azora-nexus
call npm install --legacy-peer-deps
cd ..\..

echo [6/8] Installing azora-education...
cd services/azora-education
call npm install --legacy-peer-deps
cd ..\..

echo [7/8] Installing knowledge-ingestion...
cd services/knowledge-ingestion
call npm install --legacy-peer-deps
cd ..\..

echo [8/8] Installing api-gateway...
cd services/api-gateway
call npm install --legacy-peer-deps
cd ..\..

echo.
echo ========================================
echo   SURGICAL INSTALLATION COMPLETE
echo ========================================
echo.
echo Next: Run health check
echo.
pause