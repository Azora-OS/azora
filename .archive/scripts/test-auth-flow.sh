#!/bin/bash

# Azora OS Authentication Flow Test
echo "🔐 Testing Azora OS Authentication Flow"
echo "======================================"

API_BASE="http://localhost:4000"
AUTH_BASE="http://localhost:3001"

# Test 1: Health Check
echo "1. Testing API Gateway health..."
curl -s "$API_BASE/api/health" | jq '.' || echo "Health check failed"

# Test 2: Login and get JWT
echo -e "\n2. Testing login flow..."
LOGIN_RESPONSE=$(curl -s -X POST "$AUTH_BASE/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@azora.world","password":"ubuntu123"}')

echo "Login response: $LOGIN_RESPONSE"

# Extract token
TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.token // empty')

if [ -z "$TOKEN" ] || [ "$TOKEN" = "null" ]; then
    echo "❌ Login failed - no token received"
    exit 1
fi

echo "✅ Token received: ${TOKEN:0:20}..."

# Test 3: Access protected route
echo -e "\n3. Testing protected LMS route..."
COURSES_RESPONSE=$(curl -s "$API_BASE/api/lms/courses" \
  -H "Authorization: Bearer $TOKEN")

echo "Courses response: $COURSES_RESPONSE"

# Test 4: Access without token (should fail)
echo -e "\n4. Testing unauthorized access..."
UNAUTH_RESPONSE=$(curl -s "$API_BASE/api/lms/courses")
echo "Unauthorized response: $UNAUTH_RESPONSE"

echo -e "\n✅ Authentication flow test complete!"