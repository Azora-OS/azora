#!/bin/bash
# REAL ERGO (ERG) MINING SCRIPT
# Optimized for Intel Core i7-1065G7

echo "🚀 Starting REAL Ergo (ERG) Mining"
echo "=================================="
echo "Hardware: Intel Core i7-1065G7"
echo "Algorithm: Autolykos v2"
echo "Expected Hashrate: ~25-35 MH/s"
echo ""

# Load wallet configuration
if [ -f "wallets.conf" ]; then
    source wallets.conf
else
    echo "❌ ERROR: wallets.conf not found!"
    echo "💡 Please create wallets.conf with your wallet addresses"
    exit 1
fi

# Check if wallet is configured
if [[ $ERG_WALLET == PLACEHOLDER* ]]; then
    echo "❌ ERROR: ERG wallet not configured!"
    echo "💡 Edit wallets.conf and replace PLACEHOLDER with your real ERG address"
    echo "   Get ERG wallet at: https://ergoplatform.org/"
    exit 1
fi

# Load pool configuration
if [ -f "pools.conf" ]; then
    source pools.conf
else
    echo "❌ ERROR: pools.conf not found!"
    exit 1
fi

# Mining command optimized for i7-1065G7
echo "⛏️  Starting lolMiner with Autolykos v2 algorithm..."
echo "Pool: $ERG_POOL_1"
echo "Wallet: ${ERG_WALLET:0:20}..."
echo ""

cd 1.87

# Start mining with optimized settings
./lolMiner --algo AUTOLYKOS2 \
    --pool $ERG_POOL_1 \
    --user $ERG_WALLET.i7-1065G7 \
    --pass x \
    --tls 1 \
    --cpu-threads 8 \
    --cpu-affinity 0xFF \
    --apiport 4446 \
    --apihost 127.0.0.1