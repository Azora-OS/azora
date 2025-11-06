@echo off
:: AZORA OS - PUSH TO GITHUB
:: Automated push to GitHub with clean branch management
:: Date: October 30, 2025

echo ================================================
echo   AZORA OS - PUSH TO GITHUB
echo ================================================
echo.

echo [GIT] Checking current branch...
for /f %%i in ('git branch --show-current') do set CURRENT_BRANCH=%%i
echo [INFO] Current branch: %CURRENT_BRANCH%

echo.
echo [GIT] Adding all changes...
git add .

echo [GIT] Committing changes...
set /p commit_message="Enter commit message (or press Enter for default): "
if "%commit_message%"=="" set commit_message="Automated commit - %date% %time%"

git commit -m "%commit_message%"

echo.
echo [GIT] Pushing to GitHub...
if "%CURRENT_BRANCH%"=="clean-branch" (
    echo [INFO] Pushing to clean-branch...
    git push origin clean-branch
) else (
    echo [INFO] Pushing to main branch...
    git push origin main
)

if %errorLevel% == 0 (
    echo.
    echo [SUCCESS] Push operation completed successfully!
    echo.
    echo Repository is now up to date on GitHub.
) else (
    echo.
    echo [ERROR] Push operation failed.
    echo.
    echo This might be due to:
    echo 1. Network connectivity issues
    echo 2. GitHub authentication problems
    echo 3. Repository rule violations (secrets in history)
    echo.
    echo If you continue to have issues, try:
    echo 1. 'git push origin clean-branch' to push to the clean branch
    echo 2. Check GitHub repository settings for branch protection rules
)

echo.
echo From Africa, For Humanity, Towards Infinity 🇿🇦
pause