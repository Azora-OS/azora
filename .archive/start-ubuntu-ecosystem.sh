#!/bin/bash

# 🌍 UBUNTU ECOSYSTEM PRODUCTION STARTUP
# "I am because we are" - Production Deployment Script

echo "🌍 Starting Ubuntu Azora Ecosystem..."
echo "⚡ Philosophy: Ngiyakwazi ngoba sikwazi"
echo ""

# Set production environment
export UBUNTU_ENV=production
export NODE_ENV=production

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to start service with status
start_service() {
    local service_name=$1
    local service_path=$2
    local service_port=$3
    
    echo -e "${BLUE}🚀 Starting ${service_name} on port ${service_port}...${NC}"
    
    cd "$service_path"
    if [ -f "package.json" ]; then
        npm start > /dev/null 2>&1 &
        local pid=$!
        
        # Wait a moment for service to start
        sleep 2
        
        # Check if service is responding
        if curl -s "http://localhost:${service_port}/health" > /dev/null 2>&1; then
            echo -e "${GREEN}✅ ${service_name} is healthy on port ${service_port}${NC}"
            echo $pid > /tmp/${service_name}.pid
        else
            echo -e "${RED}❌ ${service_name} failed to start on port ${service_port}${NC}"
        fi
    else
        echo -e "${YELLOW}⚠️  No package.json found for ${service_name}${NC}"
    fi
    
    cd - > /dev/null
}

# Function to check Ubuntu philosophy
check_ubuntu_philosophy() {
    local service_url=$1
    
    echo -e "${BLUE}🧘 Checking Ubuntu philosophy at ${service_url}...${NC}"
    
    response=$(curl -s "${service_url}/api/ubuntu/philosophy")
    if [[ $response == *"I am because we are"* ]]; then
        echo -e "${GREEN}✅ Ubuntu philosophy active${NC}"
        return 0
    else
        echo -e "${RED}❌ Ubuntu philosophy not found${NC}"
        return 1
    fi
}

# Start Core Services
echo -e "${YELLOW}🏗️  Starting Core Ubuntu Services...${NC}"

start_service "API Gateway" "services/azora-api-gateway" 4000
start_service "Blockchain Service" "services/azora-blockchain" 4009
start_service "Citadel Fund" "services/citadel-fund" 4010
start_service "Proof of Value" "services/proof-of-value" 4011
start_service "Constitutional AI" "services/constitutional-ai" 4012
start_service "Azora Education" "services/azora-education" 4013
start_service "Azora Treasury" "services/azora-treasury" 4015
start_service "Azora Auth" "services/azora-auth" 4016
start_service "NFT Minting" "services/azora-nft-minting" 4017
start_service "Governance" "services/azora-governance" 4018
start_service "Event Bus" "services/azora-events" 4019

# Wait for services to initialize
echo -e "${YELLOW}⏳ Waiting for services to initialize...${NC}"
sleep 5

# Start Frontend Apps
echo -e "${YELLOW}🎨 Starting Ubuntu Frontend Apps...${NC}"

start_service "Azora Sapiens" "apps/azora-sapiens" 3000
start_service "Azora Pay" "apps/azora-pay" 3005
start_service "Azora Mint" "apps/azora-mint" 3004
start_service "Marketplace" "apps/azora-marketplace" 3006

# Final verification
echo -e "${YELLOW}🔍 Final Ubuntu Ecosystem Verification...${NC}"

# Check main services
services_to_check=(
    "API Gateway:4000"
    "Citadel Fund:4010"
    "Proof of Value:4011"
    "Constitutional AI:4012"
    "Governance:4018"
    "Event Bus:4019"
)

all_healthy=true

for service in "${services_to_check[@]}"; do
    IFS=':' read -r name port <<< "$service"
    if curl -s "http://localhost:${port}/health" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ ${name} healthy${NC}"
    else
        echo -e "${RED}❌ ${name} not responding${NC}"
        all_healthy=false
    fi
done

# Check Ubuntu philosophy integration
echo ""
check_ubuntu_philosophy "http://localhost:4000"

# Display deployment summary
echo ""
echo -e "${GREEN}🌍 UBUNTU ECOSYSTEM DEPLOYMENT SUMMARY${NC}"
echo "=================================="
echo -e "${BLUE}🌐 Main Portal:${NC}     http://localhost:3000"
echo -e "${BLUE}🔗 API Gateway:${NC}     http://localhost:4000"
echo -e "${BLUE}💰 Citadel Fund:${NC}    http://localhost:4010"
echo -e "${BLUE}⭐ Proof of Value:${NC}   http://localhost:4011"
echo -e "${BLUE}🤖 Constitutional AI:${NC} http://localhost:4012"
echo -e "${BLUE}🗳️ Governance:${NC}      http://localhost:4018"
echo -e "${BLUE}📨 Event Bus:${NC}       http://localhost:4019"
echo ""

if [ "$all_healthy" = true ]; then
    echo -e "${GREEN}🎉 Ubuntu Ecosystem is PRODUCTION READY!${NC}"
    echo -e "${GREEN}🌍 'I am because we are' - Live in Production!${NC}"
else
    echo -e "${YELLOW}⚠️  Some services may need attention${NC}"
    echo -e "${YELLOW}🔧 Check individual service logs for details${NC}"
fi

echo ""
echo -e "${BLUE}📊 Ubuntu Services Running:${NC}"
ps aux | grep -E "(node|npm)" | grep -v grep | wc -l | xargs echo -e "${GREEN}Services active:${NC}"

echo ""
echo -e "${YELLOW}💡 Ubuntu Tips:${NC}"
echo "• Check service health: curl http://localhost:PORT/health"
echo "• View Ubuntu philosophy: curl http://localhost:4000/api/ubuntu/philosophy"
echo "• Monitor Citadel Fund: curl http://localhost:4010/api/balance"
echo "• Submit knowledge proofs: curl http://localhost:4011/api/submit"
echo "• Participate in governance: curl http://localhost:4018/api/proposals"
echo ""
echo -e "${GREEN}🌍 Ubuntu Azora Ecosystem - Production Complete!${NC}"
