#!/bin/bash

# Azora OS Master Launch Script - Unix/Linux/macOS
# Constitutional AI Operating System

echo ""
echo "========================================"
echo "   AZORA OS MASTER LAUNCHER"
echo "   Constitutional AI Operating System"
echo "========================================"
echo ""

echo "🔍 Checking system requirements..."

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found! Please install Node.js 20+"
    exit 1
fi

# Check npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm not found! Please install npm"
    exit 1
fi

echo "✅ Node.js and npm available"

echo ""
echo "📦 Installing dependencies..."
npm install

echo ""
echo "🚀 Launching Azora OS Master Orchestrator..."
node scripts/master-orchestrator.js