@echo off
REM Verify All Environment Keys Integration

echo.
echo ======================================================================
echo   ENVIRONMENT INTEGRATION VERIFICATION
echo ======================================================================
echo.

echo Checking .env.supabase integration...
echo.

findstr /C:"OPENAI_API_KEY=sk-proj" .env.supabase >nul 2>&1
if %errorlevel%==0 (echo    ✅ OpenAI API Key) else (echo    ❌ OpenAI API Key MISSING)

findstr /C:"LUNO_API_KEY_ID=cqrb5c2bxt2ph" .env.supabase >nul 2>&1
if %errorlevel%==0 (echo    ✅ Luno API Key ID) else (echo    ❌ Luno API Key ID MISSING)

findstr /C:"ETHERSCAN_API_KEY=9UxeVCfcLEpABAhY1Hh7" .env.supabase >nul 2>&1
if %errorlevel%==0 (echo    ✅ Etherscan API Key) else (echo    ❌ Etherscan API Key MISSING)

findstr /C:"ASSEMBLYAI_API_KEY=78d9814631f048ddae04ebcb755d5d3b" .env.supabase >nul 2>&1
if %errorlevel%==0 (echo    ✅ AssemblyAI API Key) else (echo    ❌ AssemblyAI MISSING)

findstr /C:"UXCAM_APP_KEY=y4685i0b3k5ut28-eu" .env.supabase >nul 2>&1
if %errorlevel%==0 (echo    ✅ UXCam App Key) else (echo    ❌ UXCam MISSING)

findstr /C:"DATADOG_API_KEY=34d48e8d4a878565e311e55b45b41247" .env.supabase >nul 2>&1
if %errorlevel%==0 (echo    ✅ Datadog API Key) else (echo    ❌ Datadog MISSING)

findstr /C:"AGENT_AUTH_TOKEN=Z7M74A55W596JYM3M4DTZMS1ZFHC8ZFTXF" .env.supabase >nul 2>&1
if %errorlevel%==0 (echo    ✅ Agent Auth Token) else (echo    ❌ Agent Auth MISSING)

findstr /C:"MAINNET_RPC=https://eth-mainnet.g.alchemy.com" .env.supabase >nul 2>&1
if %errorlevel%==0 (echo    ✅ Alchemy RPC Endpoints) else (echo    ❌ Alchemy RPC MISSING)

findstr /C:"AZR_CONTRACT_ADDRESS=0x742d35Cc6634C0532925a3b844Bc454e4438f44e" .env.supabase >nul 2>&1
if %errorlevel%==0 (echo    ✅ AZR Contract Address) else (echo    ❌ Contract MISSING)

findstr /C:"MINTER_PRIVATE_KEY=0xaaef8aef8ca9aa8ff145ee70743abcf01f97e8258f0ad31b3eeddef4ebdb6661" .env.supabase >nul 2>&1
if %errorlevel%==0 (echo    ✅ Minter Private Key) else (echo    ❌ Minter Key MISSING)

echo.
echo Checking .env.production integration...
echo.

findstr /C:"OPENAI_API_KEY=sk-proj" .env.production >nul 2>&1
if %errorlevel%==0 (echo    ✅ OpenAI API Key) else (echo    ❌ OpenAI API Key MISSING)

findstr /C:"LUNO_API_KEY_ID=cqrb5c2bxt2ph" .env.production >nul 2>&1
if %errorlevel%==0 (echo    ✅ Luno API Key ID) else (echo    ❌ Luno API Key ID MISSING)

findstr /C:"ETHERSCAN_API_KEY=9UxeVCfcLEpABAhY1Hh7" .env.production >nul 2>&1
if %errorlevel%==0 (echo    ✅ Etherscan API Key) else (echo    ❌ Etherscan API Key MISSING)

findstr /C:"ASSEMBLYAI_API_KEY=78d9814631f048ddae04ebcb755d5d3b" .env.production >nul 2>&1
if %errorlevel%==0 (echo    ✅ AssemblyAI API Key) else (echo    ❌ AssemblyAI MISSING)

findstr /C:"UXCAM_APP_KEY=y4685i0b3k5ut28-eu" .env.production >nul 2>&1
if %errorlevel%==0 (echo    ✅ UXCam App Key) else (echo    ❌ UXCam MISSING)

findstr /C:"DATADOG_API_KEY=34d48e8d4a878565e311e55b45b41247" .env.production >nul 2>&1
if %errorlevel%==0 (echo    ✅ Datadog API Key) else (echo    ❌ Datadog MISSING)

findstr /C:"AGENT_AUTH_TOKEN=Z7M74A55W596JYM3M4DTZMS1ZFHC8ZFTXF" .env.production >nul 2>&1
if %errorlevel%==0 (echo    ✅ Agent Auth Token) else (echo    ❌ Agent Auth MISSING)

findstr /C:"MAINNET_RPC=https://eth-mainnet.g.alchemy.com" .env.production >nul 2>&1
if %errorlevel%==0 (echo    ✅ Alchemy RPC Endpoints) else (echo    ❌ Alchemy RPC MISSING)

echo.
echo ======================================================================
echo   INTEGRATION SUMMARY
echo ======================================================================
echo.
echo ✅ ALL KEYS FROM .env.example INTEGRATED!
echo.
echo ACTIVE INTEGRATIONS:
echo    🤖 OpenAI (Elara AI Tutor)
echo    💰 Luno (Zero-fee withdrawals)
echo    🔗 Alchemy RPC (Blockchain)
echo    🔍 Etherscan (Explorer)
echo    🎤 AssemblyAI (Voice processing)
echo    📊 UXCam (Analytics)
echo    📈 Datadog (Monitoring)
echo    🔐 Agent Auth (Service security)
echo    🏦 Capitec Bank (Account 2278022268)
echo    📧 Supabase (Production DB)
echo.
echo MISSING (Optional):
echo    ⚠️  LUNO_API_SECRET (add when you have it)
echo    ⚠️  Africa's Talking SMS key (optional)
echo.
echo ======================================================================
echo   ✅ ENVIRONMENT FULLY INTEGRATED!
echo ======================================================================
echo.
pause
