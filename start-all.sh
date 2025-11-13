#!/bin/bash

echo "🚀 Starting Azora OS - Ubuntu Activated"
echo "========================================"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

# Start AI Family Service
echo -e "${BLUE}Starting AI Family Service...${NC}"
cd services/ai-family-service
npm start > ../../logs/ai-family.log 2>&1 &
echo $! > ../../pids/ai-family.pid
echo -e "${GREEN}✓ AI Family Service (Port 4010)${NC}"

# Start Azora LMS
echo -e "${BLUE}Starting Azora LMS...${NC}"
cd ../azora-lms
npm start > ../../logs/lms.log 2>&1 &
echo $! > ../../pids/lms.pid
echo -e "${GREEN}✓ Azora LMS (Port 4015)${NC}"

# Start Azora Mint
echo -e "${BLUE}Starting Azora Mint...${NC}"
cd ../azora-mint
npm start > ../../logs/mint.log 2>&1 &
echo $! > ../../pids/mint.pid
echo -e "${GREEN}✓ Azora Mint (Port 4020)${NC}"

# Start Azora Forge
echo -e "${BLUE}Starting Azora Forge...${NC}"
cd ../azora-forge
npm start > ../../logs/forge.log 2>&1 &
echo $! > ../../pids/forge.pid
echo -e "${GREEN}✓ Azora Forge (Port 4030)${NC}"

# Start Azora Nexus
echo -e "${BLUE}Starting Azora Nexus...${NC}"
cd ../azora-nexus
npm start > ../../logs/nexus.log 2>&1 &
echo $! > ../../pids/nexus.pid
echo -e "${GREEN}✓ Azora Nexus (Port 4016)${NC}"

cd ../..

echo ""
echo "========================================"
echo -e "${GREEN}✅ All Services Started!${NC}"
echo ""
echo "📊 Service URLs:"
echo "  • AI Family: http://localhost:4010"
echo "  • LMS:       http://localhost:4015"
echo "  • Mint:      http://localhost:4020"
echo "  • Forge:     http://localhost:4030"
echo "  • Nexus:     http://localhost:4016"
echo ""
echo "📝 Logs: ./logs/"
echo "🛑 Stop: ./stop-all.sh"
echo ""
echo "\"Ngiyakwazi ngoba sikwazi\" 🚀💚"
