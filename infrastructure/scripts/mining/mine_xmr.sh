#!/bin/bash
# REAL MONERO (XMR) MINING SCRIPT
# Optimized for Intel Core i7-1065G7

echo "🚀 Starting REAL Monero (XMR) Mining"
echo "===================================="
echo "Hardware: Intel Core i7-1065G7"
echo "Algorithm: RandomX"
echo "Expected Hashrate: ~2.5-3.5 KH/s"
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
if [[ $XMR_WALLET == PLACEHOLDER* ]]; then
    echo "❌ ERROR: XMR wallet not configured!"
    echo "💡 Edit wallets.conf and replace PLACEHOLDER with your real XMR address"
    echo "   Get XMR wallet at: https://www.getmonero.org/"
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
echo "⛏️  Starting lolMiner with RandomX algorithm..."
echo "Pool: $XMR_POOL_1"
echo "Wallet: ${XMR_WALLET:0:20}..."
echo ""

cd 1.87

# Start mining with optimized settings
./lolMiner --algo RANDOMX \
    --pool $XMR_POOL_1 \
    --user $XMR_WALLET.i7-1065G7 \
    --pass x \
    --tls 1 \
    --cpu-threads 8 \
    --cpu-affinity 0xFF \
    --cpu-memory-pool -1 \
    --cpu-huge-pages on \
    --cpu-huge-pages-jit on \
    --cpu-randomx-use-tweaks on \
    --cpu-randomx-wrmsr -1 \
    --cpu-randomx-no-rdmsr on \
    --apiport 4444 \
    --apihost 127.0.0.1