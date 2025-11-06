@echo off
REM Azora OS Repository Monitor - Windows Task Scheduler Setup
REM This script sets up automated repository monitoring using Windows Task Scheduler

echo Setting up Azora OS Repository Monitor...
echo.

REM Check if running as administrator
net session >nul 2>&1
if %errorLevel% == 0 (
    echo Running with administrator privileges
) else (
    echo Please run this script as administrator to set up scheduled tasks
    pause
    exit /b 1
)

REM Get the current directory
set "SCRIPT_DIR=%~dp0"
set "REPO_ROOT=%SCRIPT_DIR%.."
set "MONITOR_SCRIPT=%REPO_ROOT%\scripts\automated-repo-monitor.ps1"

REM Create the scheduled task
echo Creating scheduled task for repository monitoring...
echo Task will run every 30 minutes to check for changes and update documentation.
echo.

schtasks /create /tn "Azora OS Repository Monitor" /tr "powershell.exe -ExecutionPolicy Bypass -File \"%MONITOR_SCRIPT%\" -IntervalMinutes 30" /sc minute /mo 30 /rl highest /f

if %errorlevel% equ 0 (
    echo ✅ Scheduled task created successfully!
    echo The repository will now be monitored automatically every 30 minutes.
    echo.
    echo To modify the schedule:
    echo schtasks /change /tn "Azora OS Repository Monitor" /mo [new_interval_in_minutes]
    echo.
    echo To run manually:
    echo powershell.exe -ExecutionPolicy Bypass -File "%MONITOR_SCRIPT%" -RunOnce
    echo.
    echo To stop monitoring:
    echo schtasks /delete /tn "Azora OS Repository Monitor" /f
) else (
    echo ❌ Failed to create scheduled task.
    echo Please check your permissions and try again.
)

echo.
pause
