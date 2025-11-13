#!/bin/bash
# Batch Implementation Script for Marketplace Services
# Azora OS - Constitutional AI Operating System

set -e

echo "🔨 Azora OS - Marketplace Services Batch Implementation"
echo "========================================================"
echo ""

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

declare -A SERVICES=(
  ["azora-forge"]="3200:AI job matching, skills assessment, portfolio management"
  ["azora-careers"]="3201:Career counseling, resume builder, interview prep"
  ["marketplace-service"]="3202:Freelance platform, gig economy, service listings"
  ["project-marketplace"]="3203:Project bidding, milestone tracking, deliverables"
  ["azora-workspace"]="3204:Collaborative workspaces, project management, time tracking"
  ["arbiter-system"]="3205:Dispute resolution, arbitration, fair judgment"
  ["azora-pricing"]="3206:Dynamic pricing, market analysis, recommendations"
  ["founder-ledger-service"]="3207:Equity tracking, vesting schedules, cap table"
)

create_service() {
  local name=$1
  local port=$2
  local description=$3
  
  echo -e "${BLUE}Creating service: ${name}${NC}"
  
  mkdir -p "$name"
  cd "$name"
  
  cat > package.json <<EOF
{
  "name": "${name}",
  "version": "1.0.0",
  "description": "${description}",
  "main": "index.js",
  "scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "helmet": "^7.1.0",
    "cors": "^2.8.5",
    "compression": "^1.7.4",
    "dotenv": "^16.3.1"
  }
}
EOF

  cat > index.js <<'EOF'
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const SERVICE_NAME = process.env.SERVICE_NAME || 'service';

app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: SERVICE_NAME,
    timestamp: new Date().toISOString()
  });
});

app.get('/api/status', (req, res) => {
  res.json({ 
    service: SERVICE_NAME,
    version: '1.0.0',
    status: 'operational'
  });
});

app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: err.message });
});

app.listen(PORT, () => {
  console.log(`✅ ${SERVICE_NAME} running on port ${PORT}`);
});

module.exports = app;
EOF

  cat > .env.example <<EOF
PORT=${port}
SERVICE_NAME=${name}
NODE_ENV=development
EOF

  cat > README.md <<EOF
# ${name}

${description}

## Quick Start

\`\`\`bash
npm install
npm start
\`\`\`

## Health Check

\`\`\`bash
curl http://localhost:${port}/health
\`\`\`
EOF

  cat > Dockerfile <<EOF
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE ${port}
CMD ["npm", "start"]
EOF

  echo -e "${GREEN}✅ Service ${name} created${NC}"
  cd ..
}

for service_name in "${!SERVICES[@]}"; do
  IFS=':' read -r port description <<< "${SERVICES[$service_name]}"
  create_service "$service_name" "$port" "$description"
  echo ""
done

echo -e "${GREEN}✅ All marketplace services created!${NC}"
echo ""
echo "Next: docker-compose -f docker-compose.marketplace.yml up -d"
