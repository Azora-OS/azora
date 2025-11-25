#!/bin/bash

# Azora OS - Integration Test Script
# Tests service-to-service communication via API Gateway

echo "🧪 Testing Azora OS Service Integration..."
echo ""

API_GATEWAY="http://localhost:4000"
NEXUS="http://localhost:3000"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

# Test counter
PASSED=0
FAILED=0

test_endpoint() {
    local name=$1
    local url=$2
    local method=${3:-GET}
    
    echo -n "Testing $name... "
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "\n%{http_code}" "$url")
    else
        response=$(curl -s -w "\n%{http_code}" -X POST "$url" -H "Content-Type: application/json" -d '{}')
    fi
    
    http_code=$(echo "$response" | tail -n1)
    
    if [ "$http_code" = "200" ] || [ "$http_code" = "201" ]; then
        echo -e "${GREEN}✅ PASS${NC} (HTTP $http_code)"
        ((PASSED++))
    else
        echo -e "${RED}❌ FAIL${NC} (HTTP $http_code)"
        ((FAILED++))
    fi
}

echo -e "${BLUE}=== Gateway Health Checks ===${NC}"
test_endpoint "API Gateway Health" "$API_GATEWAY/api/health"
test_endpoint "Nexus Health" "$NEXUS/health"

echo ""
echo -e "${BLUE}=== Service Status ===${NC}"
test_endpoint "Service Registry" "$NEXUS/api/services"
test_endpoint "Service Health Checks" "$NEXUS/api/services/health"

echo ""
echo -e "${BLUE}=== Event Bus ===${NC}"
test_endpoint "Event History" "$NEXUS/api/events"
test_endpoint "Event Types" "$NEXUS/api/events/types"

echo ""
echo -e "${BLUE}=== Education Service ===${NC}"
test_endpoint "Get Courses" "$API_GATEWAY/api/education/courses"

echo ""
echo -e "${BLUE}=== Mint Service ===${NC}"
test_endpoint "Economic Stats" "$API_GATEWAY/api/mint/economics/stats"

echo ""
echo -e "${BLUE}=== Forge Service ===${NC}"
test_endpoint "Get Jobs" "$API_GATEWAY/api/forge/jobs"

echo ""
echo -e "${BLUE}=== AI Family Service ===${NC}"
test_endpoint "Get Family" "$API_GATEWAY/api/ai-family/family"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}✅ Passed: $PASSED${NC}"
echo -e "${RED}❌ Failed: $FAILED${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 All tests passed! Integration working!${NC}"
    exit 0
else
    echo -e "${RED}⚠️  Some tests failed. Check service logs.${NC}"
    exit 1
fi
