#!/bin/bash

echo "🚀 AZORA OS - COMPLETE LAUNCH"
echo "=============================="
echo ""

# Backend
echo "📦 Step 1: Deploy Backend..."
./deploy-now.sh

# Seed Data
echo "🌱 Step 2: Seed Demo Data..."
cd services/auth-service
node ../../seed-demo-data.js
cd ../..

# Frontend
echo "🎨 Step 3: Deploy Frontend..."
cd apps/student-portal
npm install
npm run build
vercel --prod
cd ../..

echo ""
echo "✅ AZORA OS FULLY DEPLOYED!"
echo ""
echo "🌐 Backend:  http://localhost:4000"
echo "🎨 Frontend: https://your-app.vercel.app"
echo ""
echo "👤 Demo Login:"
echo "   Email: demo@azora.com"
echo "   Password: demo123"
echo ""
echo "🇿🇦 AFRICANS EATING NOW!"
