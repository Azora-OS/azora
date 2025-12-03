@echo off
REM NONSTOP Repository Monitor for Azora OS - HIGH FREQUENCY
REM Monitors every 1 minute for maximum responsiveness

echo 🚀🚀🚀 STARTING NONSTOP REPOSITORY MONITOR 🚀🚀🚀
echo Monitoring every 60 seconds for instant change detection
echo This will run CONTINUOUSLY until production is complete
echo Press Ctrl+C to stop (but we don't want to stop!)
echo Repository: %CD%
echo.

REM Check if we're in a git repository
if not exist ".git" (
    echo ❌ Not in a git repository!
    pause
    exit /b 1
)

:monitor_loop
echo.
echo 🔍 Checking for changes at %DATE% %TIME%

REM Check for changes
for /f %%i in ('git status --porcelain 2^>nul ^| find /c /v ""') do set change_count=%%i

if %change_count% gtr 0 (
    echo 📝 FOUND %change_count% CHANGES - PROCESSING IMMEDIATELY...

    REM Add all changes
    git add . >nul 2>&1

    REM Create detailed commit message with timestamp
    for /f "tokens=2-4 delims=/ " %%a in ('date /t') do set date_str=%%c-%%a-%%b
    for /f "tokens=1-2 delims=: " %%a in ('time /t') do set time_str=%%a:%%b

    git commit -m "feat: nonstop monitoring update%n%n- Changes detected: %change_count% files%n- Auto-committed by nonstop monitor%n- %date_str% %time_str%%n- Continuous deployment active" >nul 2>&1

    REM Push immediately
    git push origin clean-branch >nul 2>&1

    if %errorlevel% equ 0 (
        echo ✅ PUSHED %change_count% changes to GitHub successfully!
    ) else (
        echo ❌ Push failed, will retry next cycle
    )

) else (
    echo ✅ Repository clean - no changes detected
)

echo ⏰ Next check in 60 seconds...
timeout /t 60 /nobreak >nul

goto monitor_loop
