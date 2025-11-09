#!/bin/bash

echo "========================================"
echo " Azora Financial Services Launcher"
echo " Tier 2: Financial Engine"
echo "========================================"
echo ""

echo "Starting all financial services..."
echo ""

echo "[1/6] Starting Azora Mint (Port 3005)..."
cd azora-mint && npm start &
sleep 2

echo "[2/6] Starting Azora Pay (Port 3003)..."
cd ../azora-pay-service && npm start &
sleep 2

echo "[3/6] Starting Virtual Cards (Port 3007)..."
cd ../virtual-card-service && npm start &
sleep 2

echo "[4/6] Starting Exchange Rates (Port 3008)..."
cd ../exchange-rate-service && npm start &
sleep 2

echo "[5/6] Starting Billing (Port 3009)..."
cd ../billing-service && npm start &
sleep 2

echo "[6/6] Starting Lending (Port 3010)..."
cd ../lending-service && npm start &
sleep 2

echo ""
echo "========================================"
echo " All Financial Services Started!"
echo "========================================"
echo ""
echo "Services running on:"
echo "  - Azora Mint:      http://localhost:3005"
echo "  - Azora Pay:       http://localhost:3003"
echo "  - Virtual Cards:   http://localhost:3007"
echo "  - Exchange Rates:  http://localhost:3008"
echo "  - Billing:         http://localhost:3009"
echo "  - Lending:         http://localhost:3010"
echo ""
echo "Press Ctrl+C to stop all services"

wait
