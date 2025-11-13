#!/bin/bash

# Health check all services
echo "🏥 Checking health of all Azora OS services..."

SERVICES=(
  "4000:API Gateway"
  "3001:Auth Service"
  "4200:Education"
  "4015:LMS"
  "4011:Sapiens"
  "4016:Assessment"
  "3038:Payment Gateway"
  "3009:Billing"
  "3008:Exchange Rate"
  "3007:Virtual Card"
  "3043:KYC/AML"
  "3044:Security"
)

HEALTHY=0
UNHEALTHY=0

for service in "${SERVICES[@]}"; do
  IFS=':' read -r port name <<< "$service"
  
  if curl -sf "http://localhost:$port/health" > /dev/null 2>&1; then
    echo "✅ $name (port $port) - HEALTHY"
    ((HEALTHY++))
  else
    echo "❌ $name (port $port) - UNHEALTHY"
    ((UNHEALTHY++))
  fi
done

echo ""
echo "📊 Summary: $HEALTHY healthy, $UNHEALTHY unhealthy"

if [ $UNHEALTHY -gt 0 ]; then
  exit 1
fi

exit 0
