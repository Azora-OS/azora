@echo off
REM Active Repository Monitor for Azora OS
REM Monitors every 2 minutes and commits/pushes changes automatically

echo 🚀 Starting ACTIVE Repository Monitor for Azora OS
echo This will check for changes every 2 minutes and auto-commit/push
echo Press Ctrl+C to stop monitoring
echo.

REM Check if we're in a git repository
if not exist ".git" (
    echo ❌ Not in a git repository!
    pause
    exit /b 1
)

:monitor_loop
echo.
echo 🔍 Checking for repository changes at %TIME%

REM Check for changes
for /f %%i in ('git status --porcelain 2^>nul ^| find /c /v ""') do set change_count=%%i

if %change_count% gtr 0 (
    echo 📝 Found %change_count% changes - processing...

    REM Add all changes
    git add . >nul 2>&1

    REM Create commit message
    for /f "tokens=2-4 delims=/ " %%a in ('date /t') do set date_str=%%c-%%a-%%b
    for /f "tokens=1-2 delims=: " %%a in ('time /t') do set time_str=%%a:%%b

    git commit -m "feat: active monitoring update%n%n- Changes: %change_count% files%n- Auto-committed by active monitor%n- %date_str% %time_str%" >nul 2>&1

    REM Push to GitHub
    git push origin clean-branch >nul 2>&1

    echo ✅ Successfully committed and pushed %change_count% changes

) else (
    echo ✅ No changes detected
)

echo ⏰ Waiting 2 minutes...
timeout /t 120 /nobreak >nul

goto monitor_loop
