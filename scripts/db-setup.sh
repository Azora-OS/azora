#!/bin/bash
# Azora OS Database Setup Script
# Ubuntu Principle: "My data strengthens our foundation"

set -e

echo "🌍 Azora OS Database Setup"
echo "=========================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

# Core services that need databases
SERVICES=(
  "auth-service"
  "azora-education"
  "azora-mint"
  "azora-forge"
  "azora-sapiens"
  "azora-nexus"
  "ai-family-service"
  "notification-service"
  "health-monitor"
)

echo -e "${BLUE}📊 Setting up databases for ${#SERVICES[@]} services${NC}"
echo ""

# Function to setup a service database
setup_service_db() {
  local service=$1
  local service_path="./services/$service"
  
  if [ ! -d "$service_path/prisma" ]; then
    echo -e "${RED}⚠️  Skipping $service - no prisma directory${NC}"
    return
  fi
  
  echo -e "${BLUE}🔧 Setting up $service...${NC}"
  
  cd "$service_path"
  
  # Generate Prisma Client
  if [ -f "prisma/schema.prisma" ]; then
    echo "  📦 Generating Prisma Client..."
    npx prisma generate
    
    # Push schema to database
    echo "  🗄️  Pushing schema to database..."
    npx prisma db push --skip-generate
    
    echo -e "${GREEN}  ✅ $service setup complete${NC}"
  else
    echo -e "${RED}  ⚠️  No schema.prisma found${NC}"
  fi
  
  cd - > /dev/null
  echo ""
}

# Check if PostgreSQL is running
echo "🔍 Checking PostgreSQL connection..."
if ! pg_isready -h localhost -p 5432 > /dev/null 2>&1; then
  echo -e "${RED}❌ PostgreSQL is not running!${NC}"
  echo "Please start PostgreSQL and try again."
  exit 1
fi
echo -e "${GREEN}✅ PostgreSQL is running${NC}"
echo ""

# Setup each service
for service in "${SERVICES[@]}"; do
  setup_service_db "$service"
done

# Run seed data
echo -e "${BLUE}🌱 Seeding database with test data...${NC}"
npm run db:seed

echo ""
echo -e "${GREEN}✨ Database setup complete! Ubuntu activated! 🚀${NC}"
echo ""
echo "Next steps:"
echo "  1. Start services: npm run dev"
echo "  2. Access API: http://localhost:4000"
echo "  3. View data: npx prisma studio"
