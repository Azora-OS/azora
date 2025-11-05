@echo off
setlocal enabledelayedexpansion

echo ======================================================================
echo AZORA OS - CONSTITUTIONAL COMPLIANCE VERIFICATION
echo ======================================================================
echo.

echo Running constitutional compliance verification...
echo --------------------------------------------------

node verify-constitutional-compliance.js

echo.
echo ======================================================================
echo VERIFICATION COMPLETE
echo ======================================================================
echo.
echo Next steps:
echo 1. Review any warnings or failures
echo 2. Address compliance issues if found
echo 3. Run build-all-platforms.bat for deployment
echo.
pause