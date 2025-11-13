#!/bin/bash
echo "🔍 Azora OS - Complete Verification"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "📦 Service Files:"
find . -maxdepth 2 -name "index.js" -type f | wc -l | xargs echo "   index.js files:"
find . -maxdepth 2 -name "package.json" -type f | wc -l | xargs echo "   package.json files:"
echo ""
echo "🛠️ Tools:"
ls -1 *.js 2>/dev/null | grep -E "(batch|start|health|integration|verify)" | wc -l | xargs echo "   Automation scripts:"
echo ""
echo "📚 Documentation:"
ls -1 *.md 2>/dev/null | wc -l | xargs echo "   Documentation files:"
echo ""
echo "✅ Key Services:"
for service in billing-service lending-service exchange-rate-service virtual-card-service kyc-aml-service security-service course-management-service job-matching-service ai-tutor-service assessment-service; do
  if [ -f "$service/index.js" ]; then
    echo "   ✓ $service"
  fi
done
echo ""
echo "═══════════════════════════════════════════════════════════"
echo "🎉 Verification Complete!"
