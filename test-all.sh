#!/bin/bash

echo "🧪 Testing Azora OS Services..."

# Test API Gateway
echo "Testing API Gateway..."
curl -s http://localhost:4000/health || echo "❌ Gateway down"

# Test Auth
echo "Testing Auth..."
curl -s http://localhost:3001/health || echo "❌ Auth down"

# Test Mint
echo "Testing Mint..."
curl -s http://localhost:3002/health || echo "❌ Mint down"

# Test LMS
echo "Testing LMS..."
curl -s http://localhost:3003/health || echo "❌ LMS down"

# Test Forge
echo "Testing Forge..."
curl -s http://localhost:3004/health || echo "❌ Forge down"

# Test Health Monitor
echo "Testing Health Monitor..."
curl -s http://localhost:9090/health || echo "❌ Monitor down"

echo "✅ All tests complete"
