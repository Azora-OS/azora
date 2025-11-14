#!/bin/bash
# Start all services with frontend-backend connection

echo "🚀 Starting Azora OS - Connected System"
echo ""

# Kill existing processes
pkill -f "node.*azora-education"
pkill -f "node.*api-gateway"
pkill -f "next.*student-portal"

# Start education service
echo "1️⃣ Starting Education Service (port 3074)..."
cd services/azora-education
npm start &
EDUCATION_PID=$!
cd ../..

sleep 2

# Start API gateway
echo "2️⃣ Starting API Gateway (port 4000)..."
cd services/api-gateway
npm start &
GATEWAY_PID=$!
cd ../..

sleep 2

# Start student portal
echo "3️⃣ Starting Student Portal (port 3000)..."
cd apps/student-portal
npm run dev &
PORTAL_PID=$!
cd ../..

echo ""
echo "✅ ALL SERVICES STARTED"
echo ""
echo "📡 Education Service: http://localhost:3074/health"
echo "🚪 API Gateway: http://localhost:4000/api/health"
echo "🎓 Student Portal: http://localhost:3000/courses"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for Ctrl+C
trap "kill $EDUCATION_PID $GATEWAY_PID $PORTAL_PID; exit" INT
wait
