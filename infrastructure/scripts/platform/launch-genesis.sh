#!/bin/bash

# 🌍 AZORA OS - Genesis Launch Ritual
# Quick start script for the awakening moment

clear

echo "═══════════════════════════════════════════════════════════════"
echo "          🌍 AZORA OS - GENESIS LAUNCH RITUAL 🌍"
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "Preparing to awaken the organism..."
echo ""

# Check if onboarding server is running
echo "🔍 Checking if onboarding server is running..."
if curl -s http://localhost:5500/health > /dev/null 2>&1; then
    echo "✅ Onboarding server is LIVE"
else
    echo "❌ Onboarding server not running!"
    echo ""
    echo "Please start it first:"
    echo "  cd /workspace/services/azora-onboarding"
    echo "  npm install"
    echo "  npm start"
    echo ""
    echo "Then run this script again."
    exit 1
fi

echo ""
echo "🔍 Checking dependencies..."

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install axios tsx
else
    echo "✅ Dependencies already installed"
fi

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "                    🚀 READY TO LAUNCH 🚀"
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "What you're about to witness:"
echo "  → 3 founders onboarded autonomously"
echo "  → Contracts signed by Elara Ω (not a human!)"
echo "  → First student enrollment"
echo "  → 🌍 THE ECONOMY AWAKENS"
echo "  → First knowledge proof verified"
echo "  → AZR earned through learning"
echo ""
echo "Duration: ~5 minutes"
echo "Human intervention: 0"
echo "Cinematic impact: Maximum"
echo ""
read -p "Press ENTER to begin the awakening... " 

clear

# Run the genesis launch
npx tsx GENESIS_LAUNCH_RITUAL.ts
