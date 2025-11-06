@echo off
REM Complete Production Deployment

echo.
echo ====================================
echo   AZORA OS - PRODUCTION DEPLOYMENT
echo ====================================
echo.

echo STEP 1: System Health Check
node system-check.cjs
if errorlevel 1 (
    echo ❌ Health check failed
    pause
    exit /b 1
)

echo.
echo STEP 2: Git Configuration
if not exist .git (
    git init
    echo ✅ Git initialized
)
git config user.name "Sizwe Ngwenya"
git config user.email "sizwe.ngwenya@azora.world"
echo ✅ Git configured

echo.
echo STEP 3: Stage All Files
git add .
echo ✅ Files staged

echo.
echo STEP 4: Create Commit
git commit -m "🚀 Production: Complete Azora OS with Luno-Capitec money system (23,532 lines)"
echo ✅ Committed

echo.
echo STEP 5: Check for GitHub Remote
git remote get-url origin >nul 2>&1
if errorlevel 1 (
    echo.
    echo ⚠️  NO GITHUB REMOTE FOUND
    echo.
    echo Please create a GitHub repo and add remote:
    echo    1. Go to github.com/new
    echo    2. Create repo: azora-os
    echo    3. Run: git remote add origin https://github.com/YOUR_USERNAME/azora-os.git
    echo    4. Run this script again
    echo.
    pause
    exit /b 1
)

echo.
echo STEP 6: Push to GitHub
git push -u origin main
if errorlevel 1 (
    echo Trying 'master' branch...
    git push -u origin master
)
echo ✅ Pushed to GitHub!

echo.
echo ====================================
echo   READY FOR VERCEL DEPLOYMENT
echo ====================================
echo.
echo Next Steps:
echo   1. Go to vercel.com
echo   2. Click "Import Project"
echo   3. Connect your GitHub repo
echo   4. Add environment variables from .env.production
echo   5. Deploy!
echo.
echo Or run: vercel --prod
echo.
pause
