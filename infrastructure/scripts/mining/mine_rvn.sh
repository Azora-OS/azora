#!/bin/bash
# REAL RAVENCOIN (RVN) MINING SCRIPT
# Optimized for Intel Core i7-1065G7

echo "🚀 Starting REAL Ravencoin (RVN) Mining"
echo "======================================"
echo "Hardware: Intel Core i7-1065G7"
echo "Algorithm: KawPow"
echo "Expected Hashrate: ~8-12 MH/s"
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
if [[ $RVN_WALLET == PLACEHOLDER* ]]; then
    echo "❌ ERROR: RVN wallet not configured!"
    echo "💡 Edit wallets.conf and replace PLACEHOLDER with your real RVN address"
    echo "   Get RVN wallet at: https://ravencoin.org/"
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
echo "⛏️  Starting lolMiner with KawPow algorithm..."
echo "Pool: $RVN_POOL_1"
echo "Wallet: ${RVN_WALLET:0:20}..."
echo ""

cd 1.87

# Start mining with optimized settings
./lolMiner --algo KAWPOW \
    --pool $RVN_POOL_1 \
    --user $RVN_WALLET.i7-1065G7 \
    --pass x \
    --tls 1 \
    --cpu-threads 8 \
    --cpu-affinity 0xFF \
    --apiport 4447 \
    --apihost 127.0.0.1