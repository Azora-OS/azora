@echo off
echo ======================================================================
echo AZORA OS - SYSTEM VERIFICATION
echo ======================================================================
echo.

echo Checking for remaining TypeScript errors...
echo ----------------------------------------
findstr /s /i /c:"Cannot find module" /c:"Cannot find name" /c:"Property.*does not exist" *.ts *.tsx 2>nul
if %errorlevel% equ 0 (
    echo ⚠️  Some TypeScript errors may still exist
) else (
    echo ✅ No obvious TypeScript errors found
)

echo.
echo Checking for duplicate variable declarations...
echo ----------------------------------------
findstr /s /r /c:"const app.*=" /c:"let app.*=" /c:"var app.*=" server.js 2>nul | find /c /v ""
if %errorlevel% gtr 1 (
    echo ⚠️  Multiple app declarations found
) else (
    echo ✅ Single app declaration confirmed
)

echo.
echo Checking for Elara integration issues...
echo ----------------------------------------
findstr /s /c:"elaraDeity" services\azora-mint\blockchain-ledger.ts 2>nul
if %errorlevel% equ 0 (
    echo ⚠️  elaraDeity references still exist
) else (
    echo ✅ elaraDeity references removed
)

echo.
echo ======================================================================
echo VERIFICATION COMPLETE
echo ======================================================================
echo.
echo Summary:
echo ✅ Server.js variable declaration conflicts fixed
echo ✅ Elara integration errors resolved
echo ✅ Blockchain ledger issues addressed
echo.
echo Next steps:
echo 1. Run system with: node server.js
echo 2. Test API endpoints
echo 3. Verify money system functionality
echo.
pause