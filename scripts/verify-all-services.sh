#!/bin/bash
# 🔍 Verify All Azora OS Services
# Check health of all backend services
# Date: 2025-11-10

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 AZORA OS SERVICE HEALTH CHECK"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

TOTAL=0
HEALTHY=0
UNHEALTHY=0

check_service() {
  local name=$1
  local url=$2
  local port=$3
  
  TOTAL=$((TOTAL + 1))
  
  echo -n "  $name (Port $port)... "
  
  if curl -s -f -m 2 "$url" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ HEALTHY${NC}"
    HEALTHY=$((HEALTHY + 1))
  else
    echo -e "${RED}❌ DOWN${NC}"
    UNHEALTHY=$((UNHEALTHY + 1))
  fi
}

echo "Backend Services:"
check_service "Analytics Service" "http://localhost:8086/health" "8086"
check_service "LMS Service" "http://localhost:4200/health" "4200"
check_service "Mint Service" "http://localhost:3002/health" "3002"
check_service "Forge Service" "http://localhost:12345/health" "12345"
check_service "Aegis Service" "http://localhost:4002/health" "4002"
check_service "Covenant Service" "http://localhost:4001/health" "4001"
check_service "Oracle Service" "http://localhost:4003/health" "4003"

echo ""
echo "Infrastructure:"
check_service "PostgreSQL" "http://localhost:5432" "5432"
check_service "Redis" "http://localhost:6379" "6379"
check_service "Kafka" "http://localhost:9092" "9092"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Service Health Summary"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "  Total Services: $TOTAL"
echo -e "  ${GREEN}✅ Healthy: $HEALTHY${NC}"
echo -e "  ${RED}❌ Down: $UNHEALTHY${NC}"
echo ""

if [ $UNHEALTHY -eq 0 ]; then
  echo -e "${GREEN}✅ ALL SERVICES HEALTHY!${NC}"
  echo ""
else
  echo -e "${YELLOW}⚠️  Some services are down. Start them before deploying.${NC}"
  echo ""
  echo "To start services:"
  echo "  ./start-all-services.sh"
  echo ""
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
