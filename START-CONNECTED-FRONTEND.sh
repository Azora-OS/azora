#!/bin/bash

echo "========================================"
echo "  Azora OS - Connected Frontend Start"
echo "========================================"
echo ""

echo "[1/4] Starting API Gateway..."
cd services/api-gateway && npm start &
sleep 3

echo "[2/4] Starting Student Portal..."
cd ../../apps/student-portal && npm run dev &
sleep 2

echo "[3/4] Starting Enterprise UI..."
cd ../enterprise-ui && npm run dev &
sleep 2

echo "[4/4] Starting Marketplace UI..."
cd ../marketplace-ui && npm run dev &

echo ""
echo "========================================"
echo "  All services starting..."
echo "========================================"
echo ""
echo "  API Gateway:      http://localhost:4000"
echo "  Student Portal:   http://localhost:3000"
echo "  Enterprise UI:    http://localhost:3001"
echo "  Marketplace UI:   http://localhost:3002"
echo ""
echo "  Test connection:  node scripts/test-frontend-connection.js"
echo ""
echo "========================================"
