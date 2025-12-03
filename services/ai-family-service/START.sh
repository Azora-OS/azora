#!/bin/bash
cd "$(dirname "$0")"

echo "👨👩👧👦 Starting AI Family Service..."

if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

echo "✅ Starting service on port 3100..."
node index.js
