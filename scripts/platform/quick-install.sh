#!/bin/bash

# Quick install script for Azora OS dependencies
# This installs only the most critical packages needed to run services

echo "🚀 Azora OS - Quick Dependency Install"
echo "========================================"
echo ""
echo "This script installs core dependencies only to get services running faster."
echo ""

# Install core packages that all services need
echo "📦 Installing core packages..."

npm install --legacy-peer-deps --no-save \
  express \
  cors \
  dotenv \
  helmet \
  compression \
  mongoose \
  axios \
  jsonwebtoken \
  bcryptjs \
  winston

echo ""
echo "✅ Core packages installed!"
echo ""
echo "To install all dependencies (may take 15+ minutes):"
echo "  npm install --legacy-peer-deps"
echo ""
echo "To launch services:"
echo "  node LAUNCH_ALL_SERVICES.js"
echo ""
