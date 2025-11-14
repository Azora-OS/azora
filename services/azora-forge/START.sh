#!/bin/bash
cd "$(dirname "$0")"

echo "🔨 Starting Azora Forge (Job Marketplace)..."

if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

echo "✅ Starting service on port 3200..."
node index.js
