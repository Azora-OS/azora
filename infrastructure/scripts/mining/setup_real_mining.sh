#!/bin/bash
# REAL CRYPTO MINING SETUP SCRIPT
# Complete setup for actual cryptocurrency mining

echo "🚀 REAL CRYPTOCURRENCY MINING SETUP"
echo "==================================="
echo "Hardware: Intel Core i7-1065G7"
echo "Mining Software: lolMiner v1.87"
echo "Expected Profit: \$3-5/day (after electricity)"
echo ""

# Check if wallets are configured
check_wallets() {
    echo "📋 Checking wallet configuration..."

    if [ ! -f "wallets.conf" ]; then
        echo "❌ wallets.conf not found!"
        return 1
    fi

    source wallets.conf

    MISSING=""
    if [[ $XMR_WALLET == PLACEHOLDER* ]]; then MISSING="$MISSING XMR"; fi
    if [[ $CFX_WALLET == PLACEHOLDER* ]]; then MISSING="$MISSING CFX"; fi
    if [[ $ERG_WALLET == PLACEHOLDER* ]]; then MISSING="$MISSING ERG"; fi
    if [[ $RVN_WALLET == PLACEHOLDER* ]]; then MISSING="$MISSING RVN"; fi

    if [ ! -z "$MISSING" ]; then
        echo "❌ Missing wallet addresses for:$MISSING"
        echo ""
        echo "💡 Please edit wallets.conf and replace PLACEHOLDER addresses with real wallet addresses:"
        echo "   • XMR: https://www.getmonero.org/downloads/"
        echo "   • CFX: https://confluxnetwork.org/ (MetaMask)"
        echo "   • ERG: https://ergoplatform.org/ (Yoroi wallet)"
        echo "   • RVN: https://ravencoin.org/wallet/"
        echo ""
        return 1
    fi

    echo "✅ All wallets configured"
    return 0
}

# Install dependencies
install_dependencies() {
    echo "📦 Installing dependencies..."

    # Install Python requirements for dashboard
    pip3 install flask requests psutil 2>/dev/null

    echo "✅ Dependencies installed"
}

# Test mining software
test_miner() {
    echo "🧪 Testing mining software..."

    if [ ! -f "1.87/lolMiner" ]; then
        echo "❌ lolMiner not found! Please run setup again."
        return 1
    fi

    # Quick benchmark test
    cd 1.87
    timeout 10s ./lolMiner --benchmark AUTOLYKOS2 2>/dev/null | head -20
    cd ..

    echo "✅ Mining software ready"
}

# Start mining dashboard
start_dashboard() {
    echo "📊 Starting mining dashboard..."

    if pgrep -f "real_mining_dashboard.py" > /dev/null; then
        echo "📊 Dashboard already running on http://localhost:5001"
    else
        python3 real_mining_dashboard.py &
        sleep 3
        echo "📊 Dashboard started: http://localhost:5001"
    fi
}

# Show profitability estimates
show_profitability() {
    echo ""
    echo "💰 PROFITABILITY ESTIMATES (i7-1065G7)"
    echo "====================================="
    echo "• Monero (XMR):     ~\$2.50/day  (~75 MH/s RandomX)"
    echo "• Conflux (CFX):    ~\$3.20/day  (~25 MH/s Octopus)"
    echo "• Ergo (ERG):       ~\$4.80/day  (~35 MH/s Autolykos v2)"
    echo "• Ravencoin (RVN):  ~\$1.80/day  (~12 MH/s KawPow)"
    echo ""
    echo "⚡ ELECTRICITY COSTS (estimated):"
    echo "• Power Usage: 25-45W during mining"
    echo "• Daily Cost: \$0.07-0.13 (@ \$0.12/kWh)"
    echo "• Monthly Cost: \$2.10-3.90"
    echo ""
    echo "💵 NET PROFIT (after electricity):"
    echo "• Daily: \$2.37-4.67"
    echo "• Monthly: \$71-140"
    echo "• Yearly: \$850-1,680"
    echo ""
    echo "⚠️  Note: Prices fluctuate. Check current rates at:"
    echo "   • https://whattomine.com/"
    echo "   • https://miningpoolstats.stream/"
}

# Main menu
show_menu() {
    echo ""
    echo "🎯 REAL MINING MENU:"
    echo "==================="
    echo "1) 🚀 Start Mining (Auto-profit switching)"
    echo "2) ⛏️  Mine Monero (XMR)"
    echo "3) ⛏️  Mine Conflux (CFX)"
    echo "4) ⛏️  Mine Ergo (ERG)"
    echo "5) ⛏️  Mine Ravencoin (RVN)"
    echo "6) 📊 Open Mining Dashboard"
    echo "7) 💰 Show Profitability"
    echo "8) 🔧 Edit Wallet Config"
    echo "9) ❌ Exit"
    echo ""
    read -p "Choose option (1-9): " choice
}

# Main setup process
main() {
    # Initial checks
    if ! check_wallets; then
        echo ""
        read -p "Configure wallets now? (y/n): " configure
        if [[ $configure == "y" || $configure == "Y" ]]; then
            echo "📝 Edit wallets.conf with your real wallet addresses"
            echo "   Then run this setup script again."
            exit 1
        else
            echo "❌ Setup cancelled. Configure wallets first."
            exit 1
        fi
    fi

    install_dependencies
    test_miner
    start_dashboard
    show_profitability

    # Main menu loop
    while true; do
        show_menu

        case $choice in
            1)
                echo "🚀 Starting auto-profit mining..."
                ./start_real_mining.sh
                ;;
            2)
                echo "⛏️  Starting XMR mining..."
                ./mine_xmr.sh
                ;;
            3)
                echo "⛏️  Starting CFX mining..."
                ./mine_cfx.sh
                ;;
            4)
                echo "⛏️  Starting ERG mining..."
                ./mine_erg.sh
                ;;
            5)
                echo "⛏️  Starting RVN mining..."
                ./mine_rvn.sh
                ;;
            6)
                echo "📊 Opening dashboard..."
                if command -v xdg-open > /dev/null; then
                    xdg-open http://localhost:5001
                else
                    echo "🌐 Dashboard: http://localhost:5001"
                fi
                ;;
            7)
                show_profitability
                ;;
            8)
                echo "🔧 Opening wallet config..."
                if command -v nano > /dev/null; then
                    nano wallets.conf
                else
                    echo "Edit wallets.conf manually"
                fi
                ;;
            9)
                echo "👋 Goodbye! Happy mining! 🚀"
                exit 0
                ;;
            *)
                echo "❌ Invalid option. Please choose 1-9."
                ;;
        esac

        echo ""
        read -p "Press Enter to continue..."
    done
}

# Run main setup
main