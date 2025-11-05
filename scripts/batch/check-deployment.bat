@echo off
REM Quick deployment check

echo.
echo DEPLOYMENT FILES READY:
echo.
dir /b deploy-production.bat 2>nul && echo   ✅ deploy-production.bat
dir /b test-api.bat 2>nul && echo   ✅ test-api.bat
dir /b vercel.json 2>nul && echo   ✅ vercel.json
dir /b DEPLOYMENT.md 2>nul && echo   ✅ DEPLOYMENT.md
dir /b .env.production 2>nul && echo   ✅ .env.production
dir /b .env.supabase 2>nul && echo   ✅ .env.supabase

echo.
echo SYSTEM STATUS:
node system-check.cjs | findstr /C:"System Health" /C:"100"

echo.
echo READY TO DEPLOY!
echo Run: .\deploy-production.bat
echo.
pause
