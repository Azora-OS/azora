@echo off
echo ========================================
echo  Azora Financial Services Launcher
echo  Tier 2: Financial Engine
echo ========================================
echo.

echo Starting all financial services...
echo.

echo [1/6] Starting Azora Mint (Port 3005)...
start "Azora Mint" cmd /k "cd azora-mint && npm start"
timeout /t 2 /nobreak >nul

echo [2/6] Starting Azora Pay (Port 3003)...
start "Azora Pay" cmd /k "cd azora-pay-service && npm start"
timeout /t 2 /nobreak >nul

echo [3/6] Starting Virtual Cards (Port 3007)...
start "Virtual Cards" cmd /k "cd virtual-card-service && npm start"
timeout /t 2 /nobreak >nul

echo [4/6] Starting Exchange Rates (Port 3008)...
start "Exchange Rates" cmd /k "cd exchange-rate-service && npm start"
timeout /t 2 /nobreak >nul

echo [5/6] Starting Billing (Port 3009)...
start "Billing" cmd /k "cd billing-service && npm start"
timeout /t 2 /nobreak >nul

echo [6/6] Starting Lending (Port 3010)...
start "Lending" cmd /k "cd lending-service && npm start"
timeout /t 2 /nobreak >nul

echo.
echo ========================================
echo  All Financial Services Started!
echo ========================================
echo.
echo Services running on:
echo   - Azora Mint:      http://localhost:3005
echo   - Azora Pay:       http://localhost:3003
echo   - Virtual Cards:   http://localhost:3007
echo   - Exchange Rates:  http://localhost:3008
echo   - Billing:         http://localhost:3009
echo   - Lending:         http://localhost:3010
echo.
echo Press any key to exit...
pause >nul
