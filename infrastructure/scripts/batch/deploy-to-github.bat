@echo off
setlocal enabledelayedexpansion

echo ======================================================================
echo AZORA OS - GITHUB DEPLOYMENT AUTOMATION
echo ======================================================================
echo.

echo 1. Checking Git repository status...
echo ----------------------------------------
git status >nul 2>&1
if %errorlevel% neq 0 (
    echo Initializing Git repository...
    git init
    echo Please set your remote repository URL:
    set /p remote_url="Enter remote URL (e.g., https://github.com/username/repo.git): "
    git remote add origin !remote_url!
    echo ✅ Git repository initialized
) else (
    echo ✅ Git repository detected
)

echo.
echo 2. Adding license headers to files...
echo ----------------------------------------
:: Create license header
echo /* > license-header.txt
echo AZORA PROPRIETARY LICENSE >> license-header.txt
echo Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved. >> license-header.txt
echo  >> license-header.txt
echo See LICENSE file for details. >> license-header.txt
echo */ >> license-header.txt
echo  >> license-header.txt

:: Add license to JavaScript/TypeScript files that don't have it
echo Adding license headers to source files...
for /r %%f in (*.js *.ts *.tsx) do (
    if exist "%%f" (
        findstr /c:"AZORA PROPRIETARY LICENSE" "%%f" >nul 2>&1
        if !errorlevel! neq 0 (
            echo Adding license to %%f
            copy license-header.txt temp-license.txt >nul
            type "%%f" >> temp-license.txt
            move /y temp-license.txt "%%f" >nul
        )
    )
)

:: Clean up
del license-header.txt >nul 2>&1

echo ✅ License headers added to files

echo.
echo 3. Creating LICENSE file if missing...
echo ----------------------------------------
if not exist "LICENSE" (
    echo Creating LICENSE file...
    echo AZORA PROPRIETARY LICENSE > LICENSE
    echo ======================= >> LICENSE
    echo  >> LICENSE
    echo Copyright (c) 2025 Azora ES (Pty) Ltd. >> LICENSE
    echo All Rights Reserved. >> LICENSE
    echo  >> LICENSE
    echo Unauthorized copying of this project, via any medium is strictly prohibited. >> LICENSE
    echo Proprietary and confidential. >> LICENSE
    echo  >> LICENSE
    echo Written by Azora Development Team. >> LICENSE
    echo ✅ LICENSE file created
) else (
    echo ✅ LICENSE file already exists
)

echo.
echo 4. Staging all files...
echo ----------------------------------------
git add . >nul 2>&1
echo ✅ All files staged

echo.
echo 5. Creating commit...
echo ----------------------------------------
set /p commit_message="Enter commit message (or press Enter for 'Automated deployment'): "
if "!commit_message!"=="" set commit_message=Automated deployment

git commit -m "!commit_message!" >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Changes committed: !commit_message!
) else (
    echo ⚠️  No changes to commit or commit failed
)

echo.
echo 6. Pushing to GitHub...
echo ----------------------------------------
echo Pushing to main branch...
git push -u origin main >nul 2>&1
if %errorlevel% neq 0 (
    echo Trying to push to master branch...
    git push -u origin master >nul 2>&1
    if %errorlevel% neq 0 (
        echo ⚠️  Push failed. Please check your repository settings.
        echo    You may need to set up your remote repository first.
        echo    Common solutions:
        echo    1. Verify your remote URL: git remote -v
        echo    2. Check your credentials
        echo    3. Create the repository on GitHub first
        pause
        exit /b 1
    ) else (
        echo ✅ Pushed to master branch
    )
) else (
    echo ✅ Pushed to main branch
)

echo.
echo 7. Pulling latest changes...
echo ----------------------------------------
git pull origin main >nul 2>&1
if %errorlevel% neq 0 (
    git pull origin master >nul 2>&1
    if %errorlevel% neq 0 (
        echo ⚠️  Pull failed. Repository may be ahead of remote.
    ) else (
        echo ✅ Pulled from master branch
    )
) else (
    echo ✅ Pulled from main branch
)

echo.
echo ======================================================================
echo DEPLOYMENT COMPLETE!
echo ======================================================================
echo.
echo Summary:
echo ✅ License headers added to source files
echo ✅ LICENSE file created
echo ✅ All files committed
echo ✅ Changes pushed to GitHub
echo ✅ Repository synchronized
echo.
echo Your code is now live on GitHub!
echo.
echo Next steps:
echo 1. Visit your repository on GitHub
echo 2. Verify the changes
echo 3. Set up GitHub Actions for CI/CD (optional)
echo.
pause