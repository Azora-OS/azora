@echo off
echo 🚀 Launching Azora BuildSpaces...

echo 📦 Installing dependencies...
npm install

echo 🔧 Building application...
npm run build

if %ERRORLEVEL% EQU 0 (
    echo ✅ Build successful! Starting BuildSpaces...
    npm run dev
) else (
    echo ❌ Build failed. Check errors above.
    pause
)