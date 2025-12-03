#!/bin/bash

# Ubuntu Tokenomics Service Startup Script

echo "🌍 Starting Ubuntu Tokenomics Service..."
echo "🤝 Collective Prosperity Engine Initializing..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Build TypeScript if dist doesn't exist
if [ ! -d "dist" ]; then
    echo "🔨 Building TypeScript..."
    npm run build
fi

# Copy environment file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "📝 Creating environment file..."
    cp .env.example .env
    echo "⚠️  Please update .env file with your configuration"
fi

# Start the service
echo "🚀 Starting Ubuntu Tokenomics Service..."
echo "📈 Ubuntu Scoring System Online"
echo "💰 Token Distribution Active"
echo "🤝 Community Prosperity Engine Ready"

npm start
