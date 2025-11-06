#!/bin/bash
# AZORA OS - Ethereum Mining Configuration
# WoolyPooly Pool - IRON Mining Setup
# Date: October 27, 2025

# Mining Configuration
MINER_EXECUTABLE="ethminer"
POOL_URL="stratum1+ssl://WPMc2l6d2Uubmd3ZW55YTc4QGdtYWlsLmNvbQ.Sizwe Ngwenya@pool.eu.woolypooly.com:3096"
FARM_RECHECK="2000"
MINING_MODE="-U"  # CUDA/GPU mining

# Display mining information
echo "🚀 AZORA OS - Ethereum Mining Setup"
echo "===================================="
echo "⛏️  Miner: ethminer"
echo "🏊 Pool: WoolyPooly (pool.eu.woolypooly.com:3096)"
echo "👤 Worker: Sizwe Ngwenya"
echo "🔄 Recheck: 2000ms"
echo "🎮 Mode: CUDA/GPU Mining"
echo ""

# Check if ethminer is available
if ! command -v ethminer &> /dev/null; then
    echo "❌ ethminer not found. Please install ethminer:"
    echo "   Ubuntu/Debian: sudo apt install ethminer"
    echo "   Or download from: https://github.com/ethereum-mining/ethminer/releases"
    exit 1
fi

# Check for NVIDIA GPU
if ! command -v nvidia-smi &> /dev/null; then
    echo "⚠️  NVIDIA GPU not detected. CUDA mining may not work."
    echo "   Install NVIDIA drivers if you have an NVIDIA GPU."
fi

echo "✅ Starting AZORA Ethereum Mining..."
echo "💡 Press Ctrl+C to stop mining"
echo ""

# Start mining with the provided configuration
$MINER_EXECUTABLE --farm-recheck $FARM_RECHECK $MINING_MODE -P $POOL_URL

echo ""
echo "⏹️  Mining stopped."