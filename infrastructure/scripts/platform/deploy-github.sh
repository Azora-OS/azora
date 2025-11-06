#!/bin/bash
# GitHub Deployment Script (for Git Bash on Windows)

echo ""
echo "===================================="
echo "  AZORA OS - GITHUB DEPLOYMENT"
echo "===================================="
echo ""

# Check if git is initialized
if [ ! -d .git ]; then
    echo "Initializing Git..."
    git init
    echo "✅ Git initialized"
fi

# Configure git
echo "Configuring Git..."
git config user.name "Sizwe Ngwenya"
git config user.email "sizwe.ngwenya@azora.world"
echo "✅ Git configured"

# Check for .gitignore
if [ ! -f .gitignore ]; then
    echo "Creating .gitignore..."
    cat > .gitignore << 'EOF'
# Dependencies
node_modules/
.pnp
.pnp.js

# Testing
coverage/
*.log

# Production
.next/
out/
build/
dist/

# Environment
.env
.env.local
.env.*.local
.env.supabase
.env.production

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Vercel
.vercel
EOF
    echo "✅ .gitignore created"
fi

# Show status
echo ""
echo "Current status:"
git status --short

# Stage all files
echo ""
echo "Staging files..."
git add .
echo "✅ Files staged"

# Create commit
echo ""
echo "Creating commit..."
git commit -m "🚀 Production: Complete Azora OS (23,532 lines) with Luno-Capitec money system"
echo "✅ Committed"

# Check for remote
if ! git remote get-url origin &>/dev/null; then
    echo ""
    echo "⚠️  NO GITHUB REMOTE FOUND"
    echo ""
    echo "Please add remote:"
    echo "  git remote add origin https://github.com/YOUR_USERNAME/azora-os.git"
    echo ""
    exit 1
fi

# Push to GitHub
echo ""
echo "Pushing to GitHub..."
git push -u origin main || git push -u origin master
echo "✅ Pushed to GitHub!"

echo ""
echo "===================================="
echo "  ✅ DEPLOYMENT COMPLETE!"
echo "===================================="
echo ""
