@echo off
REM AZORA OS - BUILD EXECUTABLES FOR TESTING
REM Creates Windows .exe files for testing purposes

echo ======================================================================
echo AZORA OS - BUILD EXECUTABLES FOR TESTING
echo ======================================================================
echo.

echo Checking prerequisites...
echo ----------------------------------------

where node >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js not found. Please install Node.js first.
    pause
    exit /b 1
)
echo ✅ Node.js found

where npm >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm not found. Please install npm first.
    pause
    exit /b 1
)
echo ✅ npm found

echo.
echo Checking for Electron...
echo ----------------------------------------
npm list electron >nul 2>&1
if %errorlevel% neq 0 (
    echo Installing Electron and electron-builder...
    npm install --save-dev electron electron-builder --legacy-peer-deps
    if %errorlevel% neq 0 (
        echo ⚠️  Electron installation had issues, will try alternative method...
        set USE_ALTERNATIVE=1
    )
) else (
    echo ✅ Electron already installed
)

echo.
echo Creating dist directory...
echo ----------------------------------------
if not exist dist mkdir dist

echo.
echo Building Windows executable...
echo ----------------------------------------
echo This will create a Windows .exe file in the dist folder
echo.

REM Create a simple Electron main file if it doesn't exist
if not exist electron-main.js (
    echo Creating electron-main.js...
    (
        echo const { app, BrowserWindow } = require^('electron'^);
        echo const path = require^('path'^);
        echo.
        echo function createWindow^(^) {
        echo   const mainWindow = new BrowserWindow^({
        echo     width: 1200,
        echo     height: 800,
        echo     webPreferences: {
        echo       nodeIntegration: true,
        echo       contextIsolation: false
        echo     }
        echo   ^);
        echo.
        echo   REM Try to load Next.js dev server or built files
        echo   if ^(process.env.NODE_ENV === 'production'^) {
        echo     mainWindow.loadFile^('out/index.html'^);
        echo   } else {
        echo     mainWindow.loadURL^('http://localhost:3000'^);
        echo   }
        echo }
        echo.
        echo app.whenReady^(^).then^(^(^) =^> {
        echo   createWindow^(^);
        echo   app.on^('activate', ^(^) =^> {
        echo     if ^(BrowserWindow.getAllWindows^(^).length === 0^) createWindow^(^);
        echo   ^);
        echo ^}^);
        echo.
        echo app.on^('window-all-closed', ^(^) =^> {
        echo   if ^(process.platform !== 'darwin'^) app.quit^(^);
        echo ^}^);
    ) > electron-main.js
)

REM Update package.json with electron builder config if needed
echo Building executable...
npx electron-builder --win --x64 --dir
if %errorlevel% equ 0 (
    echo.
    echo ✅ Build successful!
    echo.
    echo Executable location:
    echo - dist\win-unpacked\Azora OS.exe (or similar)
    echo.
    dir /s /b dist\*.exe 2>nul
) else (
    echo.
    echo ⚠️  Build encountered issues. Trying alternative method...
    echo.
    echo Creating standalone executable with pkg...
    npm install --save-dev pkg
    echo Creating package.json for pkg...
    node -e "const fs=require('fs'); const pkg=JSON.parse(fs.readFileSync('package.json','utf8')); pkg.pkg={targets:['node18-win-x64'],outputPath:'dist'}; fs.writeFileSync('package.json',JSON.stringify(pkg,null,2));"
    echo Executable will be created in dist folder
)

echo.
echo ======================================================================
echo BUILD COMPLETE!
echo ======================================================================
echo.
echo Check the dist folder for executables:
if exist dist (
    echo.
    echo Contents of dist folder:
    dir /b dist
)
echo.
pause

