#!/bin/bash
# REAL CONFLUX (CFX) MINING SCRIPT
# Optimized for Intel Core i7-1065G7

echo "🚀 Starting REAL Conflux (CFX) Mining"
echo "===================================="
echo "Hardware: Intel Core i7-1065G7"
echo "Algorithm: Octopus"
echo "Expected Hashrate: ~15-25 MH/s"
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
if [[ $CFX_WALLET == PLACEHOLDER* ]]; then
    echo "❌ ERROR: CFX wallet not configured!"
    echo "💡 Edit wallets.conf and replace PLACEHOLDER with your real CFX address"
    echo "   Get CFX wallet at: https://confluxnetwork.org/"
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
echo "⛏️  Starting lolMiner with Octopus algorithm..."
echo "Pool: $CFX_POOL_1"
echo "Wallet: ${CFX_WALLET:0:20}..."
echo ""

cd 1.87

# Start mining with optimized settings
./lolMiner --algo OCTOPUS \
    --pool $CFX_POOL_1 \
    --user $CFX_WALLET.i7-1065G7 \
    --pass x \
    --tls 1 \
    --cpu-threads 8 \
    --cpu-affinity 0xFF \
    --apiport 4445 \
    --apihost 127.0.0.1