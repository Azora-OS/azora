#!/bin/bash

echo "🎨 Starting Azora OS Frontend Applications..."

# Student Portal
echo "🎓 Starting Student Portal..."
cd apps/student-portal && npm run dev &

# Enterprise UI
echo "💼 Starting Enterprise UI..."
cd ../enterprise-ui && npm run dev &

# Marketplace UI
echo "🛒 Starting Marketplace UI..."
cd ../marketplace-ui && npm run dev &

# Pay UI
echo "💰 Starting Pay UI..."
cd ../pay-ui && npm run dev &

echo ""
echo "✅ All frontend apps started!"
echo ""
echo "🌐 Access Points:"
echo "  Student Portal:  http://localhost:3000"
echo "  Enterprise UI:   http://localhost:3001"
echo "  Marketplace UI:  http://localhost:3002"
echo "  Pay UI:          http://localhost:3003"
echo ""
echo "🎯 Ubuntu: Beautiful interfaces, real data 🚀"
