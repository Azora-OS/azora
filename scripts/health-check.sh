#!/bin/bash

echo "🔍 Azora OS Health Check"
echo "========================"

services=(
  "api-gateway:4000"
  "auth-service:3001"
  "azora-education:3002"
  "azora-mint:3003"
  "azora-forge:3004"
  "azora-sapiens:3006"
  "azora-aegis:3007"
  "payment-service:3008"
)

healthy=0
unhealthy=0

for service in "${services[@]}"; do
  name="${service%%:*}"
  port="${service##*:}"
  
  if curl -sf "http://localhost:$port/health" > /dev/null; then
    echo "✅ $name (port $port) - HEALTHY"
    ((healthy++))
  else
    echo "❌ $name (port $port) - UNHEALTHY"
    ((unhealthy++))
  fi
done

echo ""
echo "Summary: $healthy healthy, $unhealthy unhealthy"

if [ $unhealthy -gt 0 ]; then
  exit 1
fi
