@echo off
echo Installing packages for Azora OS ecosystem...
echo.

echo Installing root packages...
cd /d "c:\azora-os\Azora-OS"
npm install
if %errorlevel% neq 0 (
    echo Root package installation failed
    exit /b 1
)

echo.
echo Installing auth-service packages...
cd /d "c:\azora-os\Azora-OS\services\auth-service"
npm install
if %errorlevel% neq 0 (
    echo Auth service package installation failed
    exit /b 1
)

echo.
echo Installing student-portal packages...
cd /d "c:\azora-os\Azora-OS\apps\student-portal"
npm install
if %errorlevel% neq 0 (
    echo Student portal package installation failed
    exit /b 1
)

echo.
echo Installing cloud-ui packages...
cd /d "c:\azora-os\Azora-OS\apps\cloud-ui"
npm install
if %errorlevel% neq 0 (
    echo Cloud UI package installation failed
    exit /b 1
)

echo.
echo All packages installed successfully!
echo You can now test the OAuth implementation.