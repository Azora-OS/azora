#!/bin/bash
# Azora Phase 1: Education Platform Deployment
# This script deploys the core infrastructure and education services

set -e

echo "🚀 Azora Phase 1: Education Platform Deployment"
echo "================================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Verify environment
echo -e "${BLUE}Step 1: Verifying environment...${NC}"
if [ ! -f .env ]; then
    echo -e "${YELLOW}Warning: .env file not found. Copying from .env.example${NC}"
    cp .env.example .env
    echo "Please update .env with your actual values before continuing."
    exit 1
fi

# Step 2: Create docker network if it doesn't exist
echo -e "${BLUE}Step 2: Creating Docker network...${NC}"
docker network create azora-network 2>/dev/null || echo "Network already exists"

# Step 3: Start core infrastructure
echo -e "${BLUE}Step 3: Starting core infrastructure...${NC}"
echo "  - PostgreSQL database"
echo "  - Redis cache"
docker-compose up -d database redis

# Wait for database to be ready
echo "Waiting for database to be ready..."
sleep 10

# Step 4: Run database migrations
echo -e "${BLUE}Step 4: Running database migrations...${NC}"
# TODO: Add migration commands here
# npx prisma migrate deploy

# Step 5: Start API Gateway and Auth Service
echo -e "${BLUE}Step 5: Starting API Gateway and Auth Service...${NC}"
docker-compose up -d api-gateway auth-service

# Wait for services to be ready
echo "Waiting for services to start..."
sleep 5

# Step 6: Start education services
echo -e "${BLUE}Step 6: Starting education services...${NC}"
docker-compose -f services/docker-compose.education.yml up -d

# Step 7: Health checks
echo -e "${BLUE}Step 7: Running health checks...${NC}"
echo "Checking API Gateway..."
curl -f http://localhost:4000/health || echo "API Gateway not ready yet"

echo "Checking Auth Service..."
curl -f http://localhost:3001/health || echo "Auth Service not ready yet"

# Step 8: Show running services
echo -e "${GREEN}✅ Phase 1 deployment complete!${NC}"
echo ""
echo "Running services:"
docker-compose ps

echo ""
echo "Next steps:"
echo "1. Build and deploy frontend applications"
echo "2. Seed database with sample courses"
echo "3. Test the education platform"
echo ""
echo "To view logs: docker-compose logs -f"
echo "To stop services: docker-compose down"
