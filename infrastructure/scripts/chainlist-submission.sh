#!/bin/bash

# Chainlist Submission Helper Script
# This script helps prepare the Azora Mainnet submission for Chainlist.org

echo "🔗 Azora Mainnet Chainlist Submission Helper"
echo "=========================================="
echo ""

# Check if the chain file exists and is valid
if [ -f "constants/additionalChainRegistry/chainid-195.json" ]; then
    echo "✅ Chain configuration file found"

    # Validate JSON
    if node -e "JSON.parse(require('fs').readFileSync('constants/additionalChainRegistry/chainid-195.json', 'utf8')); console.log('✅ Valid JSON');" 2>/dev/null; then
        echo "✅ JSON validation passed"
    else
        echo "❌ JSON validation failed"
        exit 1
    fi
else
    echo "❌ Chain configuration file not found"
    exit 1
fi

echo ""
echo "📋 Submission Checklist:"
echo "1. Fork https://github.com/ethereum-lists/chains"
echo "2. Copy constants/additionalChainRegistry/chainid-195.json to _data/chains/"
echo "3. Create a pull request with title: 'Add Azora Mainnet (Chain ID 195)'"
echo "4. Include this description:"
echo ""

cat << 'EOF'
Add Azora Mainnet (Chain ID 195)

## Network Details
- **Chain ID**: 195
- **Name**: Azora Mainnet
- **Native Token**: AZR (Azora)
- **RPC URL**: https://rpc.azora.network
- **Block Explorer**: https://explorer.azora.network
- **Website**: https://azora.world

## Technical Information
- **Consensus**: Proof of Stake
- **Gas Token**: AZR
- **EIP Support**: EIP-155, EIP-1559
- **Genesis Date**: October 23, 2025

## Contact
- **Website**: https://azora.world
- **GitHub**: https://github.com/Sizwe780/azora-os
EOF

echo ""
echo "🎯 Ready for submission!"