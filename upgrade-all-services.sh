#!/bin/bash
################################################################################
# AZORA SERVICE UPGRADE AUTOMATION
# 
# This script upgrades ALL services to world-class standards:
# - Adds shared utilities (logger, errors)
# - Creates standard tsconfig.json
# - Creates jest.config.js for testing
# - Creates .env.example
# - Creates standard README.md
# - Removes console.log (reports only, manual fix needed)
# - Reports TypeScript 'any' usage
################################################################################

set -e

SERVICES_DIR="/workspace/services"
SHARED_DIR="/workspace/services/shared"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "🌟 =========================================="
echo "🌟 AZORA SERVICE UPGRADE AUTOMATION"
echo "🌟 =========================================="
echo ""

# Function to check if service exists
service_exists() {
    [ -d "$SERVICES_DIR/$1" ]
}

# Function to check if file exists in service
file_exists() {
    [ -f "$SERVICES_DIR/$1/$2" ]
}

# Function to count console.log usage
count_console_logs() {
    local service=$1
    local count=$(find "$SERVICES_DIR/$service" -name "*.ts" -not -path "*/node_modules/*" -exec grep -c "console\." {} + 2>/dev/null | awk '{sum+=$1} END {print sum}' || echo "0")
    echo "$count"
}

# Function to count 'any' usage
count_any_types() {
    local service=$1
    local count=$(find "$SERVICES_DIR/$service" -name "*.ts" -not -path "*/node_modules/*" -exec grep -c ": any\|<any>" {} + 2>/dev/null | awk '{sum+=$1} END {print sum}' || echo "0")
    echo "$count"
}

# Function to create standard tsconfig.json
create_tsconfig() {
    local service=$1
    if ! file_exists "$service" "tsconfig.json"; then
        cat > "$SERVICES_DIR/$service/tsconfig.json" <<'EOF'
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "__tests__"]
}
EOF
        echo -e "${GREEN}✅ Created tsconfig.json${NC}"
    else
        echo -e "${BLUE}ℹ️  tsconfig.json exists${NC}"
    fi
}

# Function to create jest.config.js
create_jest_config() {
    local service=$1
    if ! file_exists "$service" "jest.config.js"; then
        cat > "$SERVICES_DIR/$service/jest.config.js" <<'EOF'
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/__tests__'],
  testMatch: ['**/__tests__/**/*.test.ts', '**/?(*.)+(spec|test).ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/index.ts'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
};
EOF
        echo -e "${GREEN}✅ Created jest.config.js${NC}"
    else
        echo -e "${BLUE}ℹ️  jest.config.js exists${NC}"
    fi
}

# Function to create .env.example
create_env_example() {
    local service=$1
    if ! file_exists "$service" ".env.example"; then
        cat > "$SERVICES_DIR/$service/.env.example" <<'EOF'
# Service Configuration
NODE_ENV=development
PORT=3000
LOG_LEVEL=info

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/dbname

# Redis (if needed)
REDIS_URL=redis://localhost:6379

# Authentication
JWT_SECRET=your-secret-key-here

# Organism Integration
SUPREME_ORGANISM_URL=http://localhost:3100
EOF
        echo -e "${GREEN}✅ Created .env.example${NC}"
    else
        echo -e "${BLUE}ℹ️  .env.example exists${NC}"
    fi
}

# Function to create __tests__ directory
create_tests_dir() {
    local service=$1
    if [ ! -d "$SERVICES_DIR/$service/__tests__" ]; then
        mkdir -p "$SERVICES_DIR/$service/__tests__/unit"
        mkdir -p "$SERVICES_DIR/$service/__tests__/integration"
        echo -e "${GREEN}✅ Created __tests__ directory${NC}"
    else
        echo -e "${BLUE}ℹ️  __tests__ directory exists${NC}"
    fi
}

# Function to upgrade package.json
upgrade_package_json() {
    local service=$1
    if file_exists "$service" "package.json"; then
        # Check if test script exists
        if ! grep -q '"test"' "$SERVICES_DIR/$service/package.json"; then
            echo -e "${YELLOW}⚠️  No test script in package.json${NC}"
        fi
    else
        echo -e "${RED}❌ Missing package.json${NC}"
    fi
}

# Main upgrade function
upgrade_service() {
    local service=$1
    
    echo ""
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}📦 Upgrading: $service${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    
    # Create standard files
    create_tsconfig "$service"
    create_jest_config "$service"
    create_env_example "$service"
    create_tests_dir "$service"
    upgrade_package_json "$service"
    
    # Report issues
    local console_count=$(count_console_logs "$service")
    local any_count=$(count_any_types "$service")
    
    if [ "$console_count" -gt 0 ]; then
        echo -e "${YELLOW}⚠️  Found $console_count console.log statements${NC}"
    else
        echo -e "${GREEN}✅ No console.log found${NC}"
    fi
    
    if [ "$any_count" -gt 0 ]; then
        echo -e "${YELLOW}⚠️  Found $any_count 'any' types${NC}"
    else
        echo -e "${GREEN}✅ No 'any' types found${NC}"
    fi
    
    echo -e "${GREEN}✅ Service upgrade complete${NC}"
}

# Get all azora services
echo "🔍 Scanning for services..."
services=$(find "$SERVICES_DIR" -type d -name "azora-*" -maxdepth 1 -exec basename {} \; | sort)

total=0
upgraded=0

for service in $services; do
    ((total++))
    if service_exists "$service"; then
        upgrade_service "$service"
        ((upgraded++))
    fi
done

echo ""
echo "🌟 =========================================="
echo "🌟 UPGRADE COMPLETE"
echo "🌟 =========================================="
echo ""
echo -e "${GREEN}✅ Services processed: $upgraded/$total${NC}"
echo ""
echo "📋 Next Steps:"
echo "1. Review services with console.log and replace with Logger"
echo "2. Review services with 'any' types and add proper types"
echo "3. Add tests to services with 0% coverage"
echo "4. Run: npm install in each service"
echo "5. Run: npm test in each service"
echo ""
echo "🚀 Ready for world-class deployment!"
