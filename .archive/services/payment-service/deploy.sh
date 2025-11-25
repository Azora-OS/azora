#!/bin/bash

# Azora Payment Service Deployment Script
# Agent 3: Payment Integration Specialist

set -e

echo "🚀 Deploying Azora Payment Service..."
echo "Agent 3: Payment Integration Specialist"
echo "========================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed. Please install Docker first.${NC}"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose is not installed. Please install Docker Compose first.${NC}"
    exit 1
fi

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  .env file not found. Creating from .env.example...${NC}"
    cp .env.example .env
    echo -e "${YELLOW}⚠️  Please edit .env file with your configuration before continuing.${NC}"
    echo -e "${YELLOW}⚠️  Especially set your STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET${NC}"
    read -p "Press Enter to continue after editing .env file..."
fi

# Create necessary directories
echo -e "${BLUE}📁 Creating directories...${NC}"
mkdir -p logs
mkdir -p ssl

# Install dependencies
echo -e "${BLUE}📦 Installing dependencies...${NC}"
npm install

# Run tests
echo -e "${BLUE}🧪 Running tests...${NC}"
npm test

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Tests failed. Please fix issues before deploying.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Tests passed!${NC}"

# Build Docker images
echo -e "${BLUE}🐳 Building Docker images...${NC}"
docker-compose build

# Start services
echo -e "${BLUE}🚀 Starting services...${NC}"
docker-compose up -d

# Wait for services to be ready
echo -e "${BLUE}⏳ Waiting for services to be ready...${NC}"
sleep 10

# Health check
echo -e "${BLUE}🏥 Performing health check...${NC}"
for i in {1..30}; do
    if curl -f http://localhost:3039/health > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Payment service is healthy!${NC}"
        break
    fi
    echo -e "${YELLOW}⏳ Waiting for service to be ready... (attempt $i/30)${NC}"
    sleep 2
done

# Check if service is running
if ! curl -f http://localhost:3039/health > /dev/null 2>&1; then
    echo -e "${RED}❌ Payment service failed to start properly.${NC}"
    echo -e "${RED}❌ Check logs with: docker-compose logs payment-service${NC}"
    exit 1
fi

# Display service information
echo ""
echo -e "${GREEN}🎉 Azora Payment Service deployed successfully!${NC}"
echo ""
echo -e "${BLUE}📊 Service Information:${NC}"
echo -e "  💳 Payment Service: http://localhost:3039"
echo -e "  🏥 Health Check: http://localhost:3039/health"
echo -e "  📡 Webhook Endpoint: http://localhost:3039/api/webhooks/stripe"
echo -e "  🐳 Docker Status: docker-compose ps"
echo -e "  📋 Logs: docker-compose logs -f payment-service"
echo ""

# Display feature summary
echo -e "${BLUE}🎯 Features Available:${NC}"
echo -e "  ✅ Stripe Payment Processing"
echo -e "  ✅ AZR Token System"
echo -e "  ✅ KYC/AML Compliance"
echo -e "  ✅ Payment UI APIs"
echo -e "  ✅ Multi-Currency Support"
echo -e "  ✅ Staking & Rewards"
echo -e "  ✅ Real-time Webhooks"
echo ""

# Display API endpoints
echo -e "${BLUE}🔗 Key API Endpoints:${NC}"
echo -e "  GET  /health - Service health check"
echo -e "  POST /api/kyc/initialize - Initialize KYC"
echo -e "  POST /api/azr/wallet - Create AZR wallet"
echo -e "  POST /api/stripe/customers - Create Stripe customer"
echo -e "  GET  /api/ui/payment-config - Payment configuration"
echo ""

# Display next steps
echo -e "${BLUE}🚀 Next Steps:${NC}"
echo -e "  1. Configure Stripe webhook URL in Stripe dashboard"
echo -e "  2. Test payment flows with Stripe test cards"
echo -e "  3. Integrate with frontend applications"
echo -e "  4. Monitor logs and performance"
echo ""

# Display monitoring commands
echo -e "${BLUE}📊 Monitoring Commands:${NC}"
echo -e "  docker-compose ps                    # Check service status"
echo -e "  docker-compose logs -f payment-service  # View logs"
echo -e "  curl http://localhost:3039/health    # Health check"
echo -e "  docker-compose down                  # Stop services"
echo -e "  docker-compose up -d                 # Start services"
echo ""

echo -e "${GREEN}🌍 Ubuntu Achievement: 'My payment system enables our collective prosperity'${NC}"
echo -e "${GREEN}✨ Agent 3: Payment Integration Specialist - MISSION COMPLETE${NC}"