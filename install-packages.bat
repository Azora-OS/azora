@echo off
echo 🚀 Installing packages for critical Azora OS services...
echo.

cd services\auth-service
echo 📦 Installing packages for auth-service...
call npm install
if %errorlevel% equ 0 (
    echo ✅ Successfully installed packages for auth-service
) else (
    echo ❌ Failed to install packages for auth-service
)
cd ..\..

cd services\api-gateway
echo 📦 Installing packages for api-gateway...
call npm install
if %errorlevel% equ 0 (
    echo ✅ Successfully installed packages for api-gateway
) else (
    echo ❌ Failed to install packages for api-gateway
)
cd ..\..

cd apps\student-portal
echo 📦 Installing packages for student-portal...
call npm install
if %errorlevel% equ 0 (
    echo ✅ Successfully installed packages for student-portal
) else (
    echo ❌ Failed to install packages for student-portal
)
cd ..\..

echo.
echo 🎉 Critical service package installation completed!