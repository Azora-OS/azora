@echo off
cls
echo.
echo ========================================================================
echo     AZORA OS - LAUNCHING ALL SERVICES
echo     No Databases or API Keys Required
echo     Services will request configuration through the UI
echo ========================================================================
echo.

set ROOT_DIR=%~dp0

REM Main Services
call start-service.bat "Azora Sapiens" 4200 "%ROOT_DIR%services\azora-sapiens" "sapiens-service.js"
timeout /t 2 /nobreak >nul

call start-service.bat "Azora Forge" 12345 "%ROOT_DIR%services\azora-forge" "index.js"
timeout /t 2 /nobreak >nul

call start-service.bat "Azora Covenant" 4099 "%ROOT_DIR%services\azora-covenant" "server.js"
timeout /t 2 /nobreak >nul

call start-service.bat "Azora Nexus" 3006 "%ROOT_DIR%services\azora-nexus\src" "index.ts"
timeout /t 2 /nobreak >nul

REM Nexus Sub-Services
call start-service.bat "Wallet" 4100 "%ROOT_DIR%services\azora-nexus\services\wallet" "index.js"
timeout /t 1 /nobreak >nul

call start-service.bat "Blockchain" 4101 "%ROOT_DIR%services\azora-nexus\services\blockchain" "index.js"
timeout /t 1 /nobreak >nul

call start-service.bat "AI Trading" 4102 "%ROOT_DIR%services\azora-nexus\services\ai-trading" "index.js"
timeout /t 1 /nobreak >nul

call start-service.bat "AI Valuation" 4103 "%ROOT_DIR%services\azora-nexus\services\ai-valuation" "index.js"
timeout /t 1 /nobreak >nul

call start-service.bat "Backed Valuation" 4104 "%ROOT_DIR%services\azora-nexus\services\backed-valuation" "index.js"
timeout /t 1 /nobreak >nul

call start-service.bat "Compliance" 4105 "%ROOT_DIR%services\azora-nexus\services\compliance" "index.js"
timeout /t 1 /nobreak >nul

call start-service.bat "Dashboard" 4106 "%ROOT_DIR%services\azora-nexus\services\dashboard" "index.js"
timeout /t 1 /nobreak >nul

call start-service.bat "DeFi" 4107 "%ROOT_DIR%services\azora-nexus\services\defi" "index.js"
timeout /t 1 /nobreak >nul

call start-service.bat "Global Adoption" 4108 "%ROOT_DIR%services\azora-nexus\services\global-adoption" "index.js"
timeout /t 1 /nobreak >nul

call start-service.bat "Guardian" 4109 "%ROOT_DIR%services\azora-nexus\services\guardian" "index.js"
timeout /t 1 /nobreak >nul

call start-service.bat "Identity" 4110 "%ROOT_DIR%services\azora-nexus\services\identity" "index.js"
timeout /t 1 /nobreak >nul

call start-service.bat "Ledger" 4111 "%ROOT_DIR%services\azora-nexus\services\ledger" "index.js"
timeout /t 1 /nobreak >nul

call start-service.bat "Liquidity" 4112 "%ROOT_DIR%services\azora-nexus\services\liquidity" "index.js"
timeout /t 1 /nobreak >nul

call start-service.bat "Marketplace" 4113 "%ROOT_DIR%services\azora-nexus\services\marketplace" "index.js"
timeout /t 1 /nobreak >nul

call start-service.bat "NFT" 4114 "%ROOT_DIR%services\azora-nexus\services\nft" "index.js"
timeout /t 1 /nobreak >nul

call start-service.bat "Partnerships" 4115 "%ROOT_DIR%services\azora-nexus\services\partnerships" "index.js"
timeout /t 1 /nobreak >nul

call start-service.bat "Reporting" 4116 "%ROOT_DIR%services\azora-nexus\services\reporting" "index.js"
timeout /t 1 /nobreak >nul

call start-service.bat "Revenue" 4117 "%ROOT_DIR%services\azora-nexus\services\revenue" "index.js"
timeout /t 1 /nobreak >nul

call start-service.bat "Staking" 4118 "%ROOT_DIR%services\azora-nexus\services\staking" "index.js"
timeout /t 1 /nobreak >nul

call start-service.bat "User Growth" 4119 "%ROOT_DIR%services\azora-nexus\services\user-growth" "index.js"
timeout /t 1 /nobreak >nul

call start-service.bat "Subscription" 4129 "%ROOT_DIR%services\azora-nexus\services\subscription" "index.js"
timeout /t 1 /nobreak >nul

echo.
echo ========================================================================
echo     ALL SERVICES LAUNCHED!
echo     Each service is running in its own window
echo     Total: 26 services started
echo.
echo     Wait 30 seconds for all services to fully initialize
echo     Close individual windows to stop services
echo ========================================================================
echo.
pause

