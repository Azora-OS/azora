@echo off
:: AZORA OS - PULL FROM GITHUB
:: Automated pull from GitHub with conflict handling
:: Date: October 30, 2025

echo ================================================
echo   AZORA OS - PULL FROM GITHUB
echo ================================================
echo.

echo [GIT] Checking current branch...
for /f %%i in ('git branch --show-current') do set CURRENT_BRANCH=%%i
echo [INFO] Current branch: %CURRENT_BRANCH%

echo.
echo [GIT] Pulling latest changes from GitHub...
git pull origin %CURRENT_BRANCH%

if %errorLevel% == 0 (
    echo.
    echo [SUCCESS] Pull operation completed successfully!
    echo.
    echo Your local repository is now up to date with GitHub.
) else (
    echo.
    echo [WARNING] Pull operation encountered issues.
    echo.
    echo This might be due to:
    echo 1. Merge conflicts that need manual resolution
    echo 2. Network connectivity issues
    echo 3. Local uncommitted changes
    echo.
    echo Checking for uncommitted changes...
    git status --porcelain
    if %errorLevel% == 0 (
        echo.
        echo [INFO] You may need to commit or stash your changes before pulling.
        echo.
        echo Options:
        echo 1. Commit your changes first: 'git add .' then 'git commit -m "message"'
        echo 2. Stash your changes: 'git stash', pull, then 'git stash pop'
        echo 3. Reset your changes: 'git reset --hard HEAD'
    )
)

echo.
echo From Africa, For Humanity, Towards Infinity 🇿🇦
pause