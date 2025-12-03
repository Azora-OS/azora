@echo off
:: AZORA OS - GIT OPERATIONS AUTOMATION
:: Automated push and pull operations for GitHub
:: Date: October 30, 2025

echo ================================================
echo   AZORA OS - GIT OPERATIONS AUTOMATION
echo ================================================
echo.

:MENU
echo Select an operation:
echo 1. Pull latest changes from GitHub
echo 2. Push all changes to GitHub
echo 3. Full sync (Pull then Push)
echo 4. Status check
echo 5. Exit
echo.
set /p choice="Enter your choice (1-5): "

if "%choice%"=="1" goto PULL
if "%choice%"=="2" goto PUSH
if "%choice%"=="3" goto SYNC
if "%choice%"=="4" goto STATUS
if "%choice%"=="5" goto EXIT

echo Invalid choice. Please try again.
echo.
goto MENU

:PULL
echo.
echo [GIT] Pulling latest changes from GitHub...
echo.
git pull origin main
if %errorLevel% == 0 (
    echo.
    echo [SUCCESS] Pull operation completed successfully!
) else (
    echo.
    echo [ERROR] Pull operation failed. Please check your connection and try again.
)
echo.
pause
goto MENU

:PUSH
echo.
echo [GIT] Adding all changes...
git add .

echo [GIT] Committing changes...
set /p commit_message="Enter commit message: "
if "%commit_message%"=="" set commit_message="Automated commit - %date% %time%"

git commit -m "%commit_message%"

echo [GIT] Pushing changes to GitHub...
git push origin main
if %errorLevel% == 0 (
    echo.
    echo [SUCCESS] Push operation completed successfully!
) else (
    echo.
    echo [ERROR] Push operation failed. Please check your connection and try again.
)
echo.
pause
goto MENU

:SYNC
echo.
echo [GIT] Performing full sync (Pull then Push)...
echo.

echo [GIT] Pulling latest changes...
git pull origin main
if %errorLevel% neq 0 (
    echo.
    echo [ERROR] Pull failed. Cannot continue with sync.
    echo.
    pause
    goto MENU
)

echo.
echo [GIT] Adding all changes...
git add .

echo [GIT] Committing changes...
set /p commit_message="Enter commit message (or press Enter for default): "
if "%commit_message%"=="" set commit_message="Automated sync commit - %date% %time%"

git commit -m "%commit_message%"

echo [GIT] Pushing changes...
git push origin main
if %errorLevel% == 0 (
    echo.
    echo [SUCCESS] Full sync completed successfully!
) else (
    echo.
    echo [ERROR] Push failed during sync operation.
)
echo.
pause
goto MENU

:STATUS
echo.
echo [GIT] Current repository status:
git status
echo.
pause
goto MENU

:EXIT
echo.
echo Thank you for using Azora OS Git Operations!
echo From Africa, For Humanity, Towards Infinity 🇿🇦
echo.
pause
exit /b 0