@echo off
echo ========================================
echo   Azora OS - Payment Services
echo ========================================
echo.

echo [1/3] Starting Azora Pay...
start "Azora Pay" cmd /k "cd services\azora-pay && npm start"
timeout /t 2 /nobreak >nul

echo [2/3] Starting Payment Gateway...
start "Payment Gateway" cmd /k "cd services\payment-gateway && npm start"
timeout /t 2 /nobreak >nul

echo [3/3] Starting Virtual Cards...
start "Virtual Cards" cmd /k "cd services\virtual-cards && npm start"

echo.
echo ========================================
echo   Payment services starting...
echo ========================================
echo.
echo   Azora Pay:         http://localhost:3003
echo   Payment Gateway:   http://localhost:3038
echo   Virtual Cards:     http://localhost:3039
echo.
echo   Test: node scripts\test-payment-systems.js
echo.
echo ========================================
