#!/bin/bash
# QUICK START REAL MINING
# Automated setup for first-time miners

echo "🚀 QUICK START REAL CRYPTO MINING"
echo "================================="
echo ""

cd /workspaces/azora-os/real-mining

# Check if wallets are configured
echo "📋 Checking wallet configuration..."
source wallets.conf 2>/dev/null

MISSING=""
if [[ $XMR_WALLET == PLACEHOLDER* ]]; then MISSING="$MISSING XMR"; fi
if [[ $CFX_WALLET == PLACEHOLDER* ]]; then MISSING="$MISSING CFX"; fi
if [[ $ERG_WALLET == PLACEHOLDER* ]]; then MISSING="$MISSING ERG"; fi
if [[ $RVN_WALLET == PLACEHOLDER* ]]; then MISSING="$MISSING RVN"; fi

if [ ! -z "$MISSING" ]; then
    echo "⚠️  WALLET CONFIGURATION REQUIRED"
    echo "=================================="
    echo "You need to set up wallet addresses for:$MISSING"
    echo ""
    echo "📝 STEP-BY-STEP WALLET SETUP:"
    echo "=============================="
    echo ""
    echo "1) MONERO (XMR) - Most Private Coin"
    echo "   • Download: https://www.getmonero.org/downloads/"
    echo "   • Create wallet → Copy primary address"
    echo "   • Edit wallets.conf: XMR_WALLET=\"your_address_here\""
    echo ""
    echo "2) CONFLUX (CFX) - Fast Transactions"
    echo "   • Install MetaMask: https://metamask.io/"
    echo "   • Add Conflux network (search online for RPC)"
    echo "   • Copy CFX address: cfx:your_address_here"
    echo ""
    echo "3) ERGO (ERG) - Smart Contracts"
    echo "   • Download Yoroi: https://yoroi-wallet.com/"
    echo "   • Create Ergo wallet → Copy address"
    echo "   • Edit wallets.conf: ERG_WALLET=\"your_address_here\""
    echo ""
    echo "4) RAVENCOIN (RVN) - Asset Platform"
    echo "   • Download wallet: https://ravencoin.org/wallet/"
    echo "   • Create wallet → Copy RVN address"
    echo ""
    echo "💰 EXPECTED EARNINGS:"
    echo "• Daily: \$3-5 (after electricity costs)"
    echo "• Monthly: \$90-150"
    echo "• Hardware: Your i7-1065G7 optimized"
    echo ""
    echo "⚠️  IMPORTANT SECURITY NOTES:"
    echo "• Backup wallet seeds offline"
    echo "• Use strong passwords"
    echo "• Never share private keys"
    echo "• Mining income may be taxable"
    echo ""
    read -p "Press Enter after configuring wallets..."
fi

# Start the full setup
echo "🔧 Starting full mining setup..."
./setup_real_mining.sh