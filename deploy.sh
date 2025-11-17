#!/bin/bash

echo "🚀 AZORA OS DEPLOYMENT"
echo "======================"

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "📦 Initializing git repository..."
    git init
    git branch -M main
fi

# Add all files
echo "📁 Adding files to git..."
git add .

# Commit changes
echo "💾 Committing changes..."
git commit -m "Production ready: Clean repository with working services"

# Check if remote exists
if ! git remote get-url origin > /dev/null 2>&1; then
    echo "🔗 Adding GitHub remote..."
    git remote add origin https://github.com/Sizwe780/azora-os.git
fi

# Push to GitHub
echo "⬆️ Pushing to GitHub..."
git push -u origin main

# Deploy to Vercel
echo "🌐 Deploying to Vercel..."
if command -v vercel &> /dev/null; then
    vercel --prod
else
    echo "⚠️ Vercel CLI not found. Install with: npm i -g vercel"
    echo "Then run: vercel --prod"
fi

echo "✅ Deployment complete!"
echo "📊 Check status at: https://github.com/Sizwe780/azora-os"