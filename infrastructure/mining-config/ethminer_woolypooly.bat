@echo off
REM AZORA OS - Ethereum Mining Configuration (Windows)
REM WoolyPooly Pool - IRON Mining Setup
REM Date: October 27, 2025

echo 🚀 AZORA OS - Ethereum Mining Setup
echo ====================================
echo ⛏️  Miner: ethminer.exe
echo 🏊 Pool: WoolyPooly (pool.eu.woolypooly.com:3096)
echo 👤 Worker: Sizwe Ngwenya
echo 🔄 Recheck: 2000ms
echo 🎮 Mode: CUDA/GPU Mining
echo.

REM Check if ethminer.exe exists
if not exist "ethminer.exe" (
    echo ❌ ethminer.exe not found in current directory.
    echo Please download ethminer from: https://github.com/ethereum-mining/ethminer/releases
    echo Extract ethminer.exe to this directory.
    pause
    exit /b 1
)

REM Check for NVIDIA GPU
nvidia-smi >nul 2>&1
if errorlevel 1 (
    echo ⚠️  NVIDIA GPU not detected. CUDA mining may not work.
    echo    Install NVIDIA drivers if you have an NVIDIA GPU.
    echo.
)

echo ✅ Starting AZORA Ethereum Mining...
echo 💡 Press Ctrl+C to stop mining
echo.

REM Start mining with the provided configuration
ethminer.exe --farm-recheck 2000 -U -P stratum1+ssl://WPMc2l6d2Uubmd3ZW55YTc4QGdtYWlsLmNvbQ.Sizwe Ngwenya@pool.eu.woolypooly.com:3096

echo.
echo ⏹️  Mining stopped.
pause