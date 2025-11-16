#!/bin/bash

echo "🚀 Azora OS Deployment Validation"
echo "=================================="

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

ERRORS=0

# Check test coverage
echo -n "Checking test coverage... "
COVERAGE=$(npm run test:coverage --silent | grep "All files" | awk '{print $10}' | sed 's/%//')
if [ "$COVERAGE" -ge 80 ]; then
  echo -e "${GREEN}✓${NC} ($COVERAGE%)"
else
  echo -e "${RED}✗${NC} ($COVERAGE% < 80%)"
  ERRORS=$((ERRORS + 1))
fi

# Check tests passing
echo -n "Running tests... "
if npm test --silent > /dev/null 2>&1; then
  echo -e "${GREEN}✓${NC}"
else
  echo -e "${RED}✗${NC}"
  ERRORS=$((ERRORS + 1))
fi

# Check security vulnerabilities
echo -n "Checking security... "
VULNS=$(npm audit --json | jq '.metadata.vulnerabilities.critical + .metadata.vulnerabilities.high')
if [ "$VULNS" -eq 0 ]; then
  echo -e "${GREEN}✓${NC}"
else
  echo -e "${RED}✗${NC} ($VULNS critical/high vulnerabilities)"
  ERRORS=$((ERRORS + 1))
fi

# Check environment variables
echo -n "Checking environment... "
REQUIRED_VARS=("DATABASE_URL" "JWT_SECRET" "STRIPE_SECRET_KEY")
MISSING=0
for VAR in "${REQUIRED_VARS[@]}"; do
  if [ -z "${!VAR}" ]; then
    MISSING=$((MISSING + 1))
  fi
done
if [ "$MISSING" -eq 0 ]; then
  echo -e "${GREEN}✓${NC}"
else
  echo -e "${RED}✗${NC} ($MISSING missing variables)"
  ERRORS=$((ERRORS + 1))
fi

# Check build
echo -n "Building application... "
if npm run build --silent > /dev/null 2>&1; then
  echo -e "${GREEN}✓${NC}"
else
  echo -e "${RED}✗${NC}"
  ERRORS=$((ERRORS + 1))
fi

echo "=================================="
if [ "$ERRORS" -eq 0 ]; then
  echo -e "${GREEN}✓ Deployment validation passed${NC}"
  exit 0
else
  echo -e "${RED}✗ Deployment validation failed ($ERRORS errors)${NC}"
  exit 1
fi
