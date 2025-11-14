#!/bin/bash
cd "$(dirname "$0")"

echo "🤖 Starting Azora Sapiens (AI Tutor)..."

if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

if [ ! -d "dist" ]; then
    echo "🔨 Building TypeScript..."
    npm run build
fi

echo "✅ Starting service on port 3075..."
node index.js
