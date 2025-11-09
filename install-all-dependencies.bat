@echo off
REM AZORA OS - DEPENDENCY INSTALLATION SCRIPT
REM Installs all required dependencies for production launch

echo.
echo ========================================
echo   AZORA OS DEPENDENCY INSTALLATION
echo ========================================
echo.

echo [1/5] Installing root dependencies...
cd "c:\Users\Azora Sapiens\Documents\azora"
call npm install

echo.
echo [2/5] Installing infrastructure dependencies...
cd "c:\Users\Azora Sapiens\Documents\azora\infrastructure\database"
call npm install

cd "c:\Users\Azora Sapiens\Documents\azora\infrastructure\monitoring"
call npm install

echo.
echo [3/5] Installing core service dependencies...
cd "c:\Users\Azora Sapiens\Documents\azora\services\auth-service"
call npm install

cd "c:\Users\Azora Sapiens\Documents\azora\services\api-gateway"
call npm install

cd "c:\Users\Azora Sapiens\Documents\azora\services\azora-mint"
call npm install

cd "c:\Users\Azora Sapiens\Documents\azora\services\azora-lms"
call npm install

cd "c:\Users\Azora Sapiens\Documents\azora\services\azora-forge"
call npm install

cd "c:\Users\Azora Sapiens\Documents\azora\services\azora-nexus"
call npm install

cd "c:\Users\Azora Sapiens\Documents\azora\services\azora-education"
call npm install

echo.
echo [4/5] Installing knowledge ingestion dependencies...
cd "c:\Users\Azora Sapiens\Documents\azora\services\knowledge-ingestion"
call npm install

echo.
echo [5/5] Running health check...
cd "c:\Users\Azora Sapiens\Documents\azora"
node health-check.js

echo.
echo ========================================
echo   DEPENDENCY INSTALLATION COMPLETE
echo ========================================
echo.
echo Next step: Run .\launch-supreme.bat
echo.
pause
