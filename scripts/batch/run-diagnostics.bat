@echo off
setlocal enabledelayedexpansion

echo ======================================================================
echo AZORA OS - SYSTEM DIAGNOSTICS
echo ======================================================================
echo.

echo 1. Checking critical files...
echo ----------------------------
if exist "package.json" (
    echo ✅ package.json found
) else (
    echo ❌ package.json missing
)

if exist "tsconfig.json" (
    echo ✅ tsconfig.json found
) else (
    echo ❌ tsconfig.json missing
)

if exist "codex\constitution\AZORA_CONSTITUTION.md" (
    echo ✅ Constitution found
) else (
    echo ❌ Constitution missing
)

echo.
echo 2. Checking UI components...
echo ----------------------------
if exist "ui\components\GlassmorphicLayout.tsx" (
    echo ✅ GlassmorphicLayout.tsx found
) else (
    echo ❌ GlassmorphicLayout.tsx missing
)

if exist "ui\app\dashboard\page.tsx" (
    echo ✅ Dashboard page found
) else (
    echo ❌ Dashboard page missing
)

if exist "ui\app\enterprise\page.tsx" (
    echo ✅ Enterprise page found
) else (
    echo ❌ Enterprise page missing
)

echo.
echo 3. Checking services...
echo ----------------------
if exist "services\server-integration.js" (
    echo ✅ Server integration found
) else (
    echo ❌ Server integration missing
)

if exist "services\email-hosting.js" (
    echo ✅ Email hosting found
) else (
    echo ❌ Email hosting missing
)

echo.
echo 4. Checking deployment scripts...
echo -------------------------------
if exist "build-all-platforms.bat" (
    echo ✅ build-all-platforms.bat found
) else (
    echo ❌ build-all-platforms.bat missing
)

if exist "deploy-to-github.bat" (
    echo ✅ deploy-to-github.bat found
) else (
    echo ❌ deploy-to-github.bat missing
)

if exist "deploy-to-vercel.bat" (
    echo ✅ deploy-to-vercel.bat found
) else (
    echo ❌ deploy-to-vercel.bat missing
)

echo.
echo ======================================================================
echo DIAGNOSTICS COMPLETE
echo ======================================================================
echo.
echo Next steps:
echo 1. Review any missing files
echo 2. Run comprehensive system check
echo 3. Address any issues found
echo.
pause