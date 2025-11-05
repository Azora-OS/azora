#!/bin/bash

# 🗄️ Create Unified Database Schema
# This script creates the unified database from the Prisma schema

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}🗄️  Creating Unified Database Schema...${NC}\n"

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo -e "${YELLOW}⚠️  DATABASE_URL not set. Using default...${NC}"
    export DATABASE_URL="postgresql://postgres:postgres@localhost:5432/azora_os?schema=public"
fi

# Check if prisma is installed
if ! command -v npx &> /dev/null; then
    echo -e "${RED}❌ npx not found. Please install Node.js${NC}"
    exit 1
fi

# Generate Prisma Client
echo -e "${BLUE}📦 Generating Prisma Client...${NC}"
npx prisma generate --schema=./prisma/unified-schema.prisma || {
    echo -e "${YELLOW}⚠️  Using default schema.prisma${NC}"
    npx prisma generate
}

# Create migration
echo -e "\n${BLUE}📝 Creating database migration...${NC}"
npx prisma migrate dev --name init_unified_schema --schema=./prisma/unified-schema.prisma --create-only || {
    echo -e "${YELLOW}⚠️  Migration creation failed, trying with default schema...${NC}"
    npx prisma migrate dev --name init_unified_schema --create-only
}

# Apply migration
echo -e "\n${BLUE}🚀 Applying database migration...${NC}"
npx prisma migrate deploy --schema=./prisma/unified-schema.prisma || {
    echo -e "${YELLOW}⚠️  Using default schema...${NC}"
    npx prisma migrate deploy
}

# Generate Prisma Client again after migration
echo -e "\n${BLUE}📦 Regenerating Prisma Client...${NC}"
npx prisma generate --schema=./prisma/unified-schema.prisma || {
    npx prisma generate
}

echo -e "\n${GREEN}✅ Unified database schema created successfully!${NC}"
echo -e "${BLUE}📊 You can now use Prisma Studio to view the database:${NC}"
echo -e "${YELLOW}   npx prisma studio --schema=./prisma/unified-schema.prisma${NC}\n"

