@echo off
:: AZORA OS - PUSH AND PULL OPERATIONS
:: Simple script to pull and push changes to GitHub
:: Date: October 30, 2025

echo ================================================
echo   AZORA OS - PUSH AND PULL OPERATIONS
echo ================================================
echo.

echo [GIT] Pulling latest changes from GitHub...
git pull origin main
if %errorLevel% == 0 (
    echo [SUCCESS] Pull operation completed successfully!
) else (
    echo [ERROR] Pull operation failed. Please check your connection and try again.
)

echo.
echo [GIT] Adding all changes...
git add .

echo [GIT] Committing changes...
set /p commit_message="Enter commit message (or press Enter for default): "
if "%commit_message%"=="" set commit_message="Automated commit - %date% %time%"

git commit -m "%commit_message%"

echo [GIT] Pushing changes to GitHub...
git push origin main
if %errorLevel% == 0 (
    echo [SUCCESS] Push operation completed successfully!
) else (
    echo [ERROR] Push operation failed. Please check your connection and try again.
)

echo.
echo From Africa, For Humanity, Towards Infinity 🇿🇦
pause