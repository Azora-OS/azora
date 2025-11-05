@echo off
echo ======================================================================
echo AZORA OS - VERCEL DEPLOYMENT
echo ======================================================================
echo.

echo STEP 1: Check Vercel CLI
where vercel >nul 2>&1
if %errorlevel% neq 0 (
    echo Installing Vercel CLI...
    npm install -g vercel
)

echo.
echo STEP 2: Login to Vercel
vercel login

echo.
echo STEP 3: Link Project
cd ui
vercel link

echo.
echo STEP 4: Set Environment Variables
echo.
echo Please run these commands in Vercel dashboard or CLI:
echo.
echo vercel env add SUPABASE_URL
echo vercel env add SUPABASE_ANON_KEY  
echo vercel env add LUNO_API_KEY_ID
echo vercel env add LUNO_API_SECRET
echo.
pause

echo.
echo STEP 5: Deploy to Production
vercel --prod

echo.
echo ======================================================================
echo DEPLOYMENT COMPLETE!
echo ======================================================================
echo.
echo Your site is now live at: https://azora-os.vercel.app
echo.
echo NEXT STEPS:
echo 1. Set up custom domain (azora.africa)
echo 2. Test registration page: /register
echo 3. Test student dashboard: /dashboard/student
echo 4. Share with first students!
echo.
pause
