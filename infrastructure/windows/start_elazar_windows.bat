@echo off
REM Elazar OS Windows Compatibility Layer
REM Enables Windows integration with Elazar OS running in WSL2

echo Starting Elazar OS Windows Compatibility Layer...

REM Check if WSL2 is installed
wsl --list --verbose >nul 2>&1
if %errorlevel% neq 0 (
    echo WSL2 is not installed. Please install WSL2 first.
    echo Visit: https://docs.microsoft.com/en-us/windows/wsl/install
    pause
    exit /b 1
)

REM Check if Ubuntu distribution is installed
wsl --list --quiet | findstr /i "Ubuntu" >nul
if %errorlevel% neq 0 (
    echo Ubuntu WSL2 distribution not found. Installing...
    wsl --install -d Ubuntu
    echo Please complete Ubuntu setup and run this script again.
    pause
    exit /b 1
)

REM Start Elazar OS services in WSL2
echo Starting Elazar OS core services in WSL2...
wsl -d Ubuntu -- bash -c "cd /workspaces/azora-os && ./START_AZORA_OS.sh"

REM Start Windows-specific services
echo Starting Windows device tracking service...
powershell -ExecutionPolicy Bypass -File "%~dp0windows_device_tracking.ps1"

REM Start Windows-Elazar sync service
echo Starting Windows-Elazar synchronization...
powershell -ExecutionPolicy Bypass -File "%~dp0windows_sync_service.ps1"

REM Start Windows payment integration
echo Starting Windows payment integration...
powershell -ExecutionPolicy Bypass -File "%~dp0windows_payjoy_integration.ps1"

echo Elazar OS Windows compatibility layer started successfully.
echo Press any key to exit...
pause >nul