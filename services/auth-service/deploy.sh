#!/bin/bash

# Azora Auth Service Deployment Script
# Ubuntu Principle: "My security ensures our freedom"

set -e

echo "🔐 Deploying Azora Auth Service..."

# Check environment
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found"
    echo "📝 Copy .env.example to .env and configure"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

# Run migrations
echo "🗄️  Running database migrations..."
npx prisma migrate deploy

# Run tests
echo "🧪 Running tests..."
npm test

# Start service
echo "🚀 Starting auth service..."
npm start
