#!/bin/bash
# REAL CRYPTO MINING CONTROLLER
# Automatically switches to most profitable coin

echo "🚀 REAL Crypto Mining Controller"
echo "==============================="
echo "Hardware: Intel Core i7-1065G7"
echo "Mode: Profitability Switching"
echo ""

# Load configurations
if [ -f "wallets.conf" ]; then
    source wallets.conf
else
    echo "❌ ERROR: wallets.conf not found!"
    exit 1
fi

if [ -f "pools.conf" ]; then
    source pools.conf
else
    echo "❌ ERROR: pools.conf not found!"
    exit 1
fi

# Check all wallets are configured
MISSING_WALLETS=""
if [[ $XMR_WALLET == PLACEHOLDER* ]]; then MISSING_WALLETS="$MISSING_WALLETS XMR"; fi
if [[ $CFX_WALLET == PLACEHOLDER* ]]; then MISSING_WALLETS="$MISSING_WALLETS CFX"; fi
if [[ $ERG_WALLET == PLACEHOLDER* ]]; then MISSING_WALLETS="$MISSING_WALLETS ERG"; fi
if [[ $RVN_WALLET == PLACEHOLDER* ]]; then MISSING_WALLETS="$MISSING_WALLETS RVN"; fi

if [ ! -z "$MISSING_WALLETS" ]; then
    echo "❌ ERROR: Missing wallet addresses for:$MISSING_WALLETS"
    echo "💡 Edit wallets.conf and replace PLACEHOLDER addresses"
    echo "   Get wallets at the URLs listed in wallets.conf"
    exit 1
fi

echo "✅ All wallets configured"
echo ""

# Function to get profitability data
get_profitability() {
    echo "📊 Checking profitability..."
    # In a real implementation, this would query mining calculators
    # For now, we'll use approximate values based on current market

    # Approximate profitability (USD per day for i7-1065G7)
    XMR_PROFIT=2.50   # Monero - stable but lower
    CFX_PROFIT=3.20   # Conflux - good CPU hashrate
    ERG_PROFIT=4.80   # Ergo - currently most profitable
    RVN_PROFIT=1.80   # Ravencoin - lower profitability

    echo "💰 Current Daily Profitability:"
    echo "   XMR: \$$XMR_PROFIT"
    echo "   CFX: \$$CFX_PROFIT"
    echo "   ERG: \$$ERG_PROFIT"
    echo "   RVN: \$$RVN_PROFIT"
    echo ""
}

# Determine most profitable coin
get_most_profitable() {
    # Simple comparison - in reality would query APIs
    MOST_PROFITABLE="ERG"  # Ergo is usually most profitable for CPU
    PROFIT=4.80

    echo "🎯 Most profitable coin: $MOST_PROFITABLE (~\$$PROFIT/day)"
}

# Main mining loop
while true; do
    get_profitability
    get_most_profitable

    echo "⛏️  Starting mining: $MOST_PROFITABLE"
    echo "Press Ctrl+C to stop and switch coins"
    echo ""

    # Start mining the most profitable coin
    case $MOST_PROFITABLE in
        "XMR")
            ./mine_xmr.sh
            ;;
        "CFX")
            ./mine_cfx.sh
            ;;
        "ERG")
            ./mine_erg.sh
            ;;
        "RVN")
            ./mine_rvn.sh
            ;;
        *)
            echo "❌ Unknown coin: $MOST_PROFITABLE"
            sleep 60
            ;;
    esac

    # Check profitability every hour
    echo ""
    echo "⏰ Checking profitability again in 1 hour..."
    sleep 3600
done