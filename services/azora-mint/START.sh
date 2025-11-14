#!/bin/bash
cd "$(dirname "$0")"

echo "💰 Starting Azora Mint (Token System)..."

if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

echo "✅ Starting service on port 3080..."
node index.js
