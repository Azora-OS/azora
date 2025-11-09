#!/bin/bash

echo "🔥 DEPLOYING EVERYTHING - NOTHING LEFT BEHIND"

# Backend
echo "📦 Starting backend services..."
docker-compose -f docker-compose.production.yml up -d

# Wait for services
echo "⏳ Waiting for services to be healthy..."
sleep 10

# Seed demo data
echo "🌱 Seeding demo data..."
node seed-demo-data.js

# Frontend
echo "🎨 Building frontend..."
cd apps/student-portal
npm install
npm run build

# Deploy to Vercel
echo "🚀 Deploying to Vercel..."
vercel --prod

echo "✅ DEPLOYMENT COMPLETE!"
echo "🌍 Frontend: https://azora-os.vercel.app"
echo "🔌 Backend: http://localhost:4000"
echo "👤 Demo: demo@azora.com / demo123"
