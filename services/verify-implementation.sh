#!/bin/bash

echo "🔍 Azora OS Services - Implementation Verification"
echo "═══════════════════════════════════════════════════"
echo ""

# Count implemented services
SERVICES=$(find . -maxdepth 1 -type d -name "*-service" -o -name "ai-*" -o -name "azora-*" | wc -l)
echo "📦 Total Service Directories: $SERVICES"

# Check for key files
echo ""
echo "✅ Infrastructure Files:"
[ -f "service-generator.js" ] && echo "   ✓ service-generator.js"
[ -f "start-all.js" ] && echo "   ✓ start-all.js"
[ -f "health-check-all.js" ] && echo "   ✓ health-check-all.js"
[ -f "docker-compose.all.yml" ] && echo "   ✓ docker-compose.all.yml"

echo ""
echo "✅ Documentation Files:"
[ -f "README.md" ] && echo "   ✓ README.md"
[ -f "IMPLEMENTATION-STATUS.md" ] && echo "   ✓ IMPLEMENTATION-STATUS.md"
[ -f "IMPLEMENTATION-COMPLETE.md" ] && echo "   ✓ IMPLEMENTATION-COMPLETE.md"

echo ""
echo "✅ Generated Services (Sample):"
for service in ai-enhancement-service ai-ml-service payment-gateway; do
  if [ -d "$service" ]; then
    echo "   ✓ $service/"
    [ -f "$service/index.js" ] && echo "      - index.js"
    [ -f "$service/package.json" ] && echo "      - package.json"
    [ -f "$service/Dockerfile" ] && echo "      - Dockerfile"
  fi
done

echo ""
echo "═══════════════════════════════════════════════════"
echo "🎉 Implementation Verification Complete!"
echo ""
