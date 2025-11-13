#!/bin/bash

echo "🌟 Installing Azora Services for VS Code Extension..."

# Install Knowledge Ocean
echo "📚 Installing Knowledge Ocean..."
cd services/knowledge-ocean
npm install
cd ../..

# Install AI Knowledge Base
echo "🧠 Installing AI Knowledge Base..."
cd services/ai-knowledge-base
npm install
cd ../..

# Install VS Code Extension
echo "🔧 Installing Elara VS Code Extension..."
cd tools/elara-vscode-extension
npm install
npm run compile

echo "✅ All services installed!"
echo ""
echo "🚀 To start services:"
echo "   npm run services:start"
echo ""
echo "📦 To install extension:"
echo "   cd tools/elara-vscode-extension"
echo "   npm run install:local"
