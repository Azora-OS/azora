#!/bin/bash

# API Testing Script for Azora OS
# Tests all critical endpoints

echo "🧪 Testing Azora OS APIs..."
echo ""

API_URL="${API_URL:-http://localhost:4000}"
EDUCATION_URL="${EDUCATION_URL:-http://localhost:4201}"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
PASSED=0
FAILED=0

# Test function
test_endpoint() {
    local name=$1
    local url=$2
    local expected_status=${3:-200}
    
    echo -n "Testing $name... "
    
    response=$(curl -s -o /dev/null -w "%{http_code}" "$url")
    
    if [ "$response" -eq "$expected_status" ]; then
        echo -e "${GREEN}✓ PASS${NC} (HTTP $response)"
        ((PASSED++))
    else
        echo -e "${RED}✗ FAIL${NC} (Expected $expected_status, got $response)"
        ((FAILED++))
    fi
}

echo "=== API Gateway Tests ==="
test_endpoint "Gateway Health" "$API_URL/api/health"
echo ""

echo "=== Education Service Tests ==="
test_endpoint "List Courses" "$API_URL/api/courses"
test_endpoint "Direct Education Health" "$EDUCATION_URL/health"
echo ""

echo "=== Auth Service Tests ==="
test_endpoint "Auth Health" "$API_URL/api/auth/health" 404
echo ""

echo "=== Summary ==="
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 All tests passed!${NC}"
    exit 0
else
    echo -e "${RED}❌ Some tests failed${NC}"
    exit 1
fi
