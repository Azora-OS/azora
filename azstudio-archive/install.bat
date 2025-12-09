@echo off
echo ========================================
echo AzStudio Installation Script
echo ========================================
echo.

echo Installing dependencies...
call npm install

if %errorlevel% neq 0 (
    echo.
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo ========================================
echo Installation Complete!
echo ========================================
echo.
echo To start development:
echo   1. Run: npm run dev
echo   2. In another terminal: npm start
echo.
echo To build for production:
echo   npm run build
echo   npm run package
echo.
pause
