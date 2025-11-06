# Aegis Citadel 🏛️

**Sovereign Microservice for Nation Grants and Triggers with Elara AI Constitutional Oversight**

Aegis Citadel is the constitutional guardian of Azora OS, providing AI-audited nation instantiation, sovereign triggers, and blockchain-secured economic sovereignty.

## Features

### 🧠 Elara AI Constitutional Oversight
- **Constitutional Compliance**: All actions audited by Elara AI for alignment with Azora Constitution
- **Sovereign Decision Making**: AI-powered approval system for nation grants and triggers
- **Transparent Auditing**: Complete audit trail of all constitutional decisions

### 🏛️ Sovereign Nation Grants
- **Nation Instantiation**: Create sovereign nations with constitutional backing
- **Token Deployment**: Automatic ERC20 sovereign token deployment
- **Economic Sovereignty**: 1:1 AZR peg maintained at inception

### ⚡ Sovereign Triggers
- **Economic Stimulus**: AI-audited economic interventions
- **Sovereign Defense**: Constitutional defense mechanisms
- **Constitutional Amendments**: Governed amendment processes

### 🔗 Blockchain Integration
- **ERC20 Sovereign Tokens**: Each nation gets its own token
- **Transparent Ledger**: All actions recorded on blockchain
- **Decentralized Governance**: Sovereignty through smart contracts

## API Endpoints

### Nation Grants
```http
POST /api/nation-grants
Content-Type: application/json

{
  "nationName": "Azora Prime",
  "founderId": "user_123",
  "initialCapital": 1000000,
  "constitution": "Constitutional text..."
}
```

### Sovereign Triggers
```http
POST /api/sovereign-triggers
Content-Type: application/json

{
  "triggerType": "economic-stimulus",
  "nationId": "nation_123",
  "parameters": { "amount": 50000 },
  "justification": "Market stabilization required"
}
```

### Nation Status
```http
GET /api/nations/:nationId
```

## Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Express API   │────│   Elara AI       │────│ Constitutional  │
│                 │    │   Oversight      │    │   Compliance    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                        │                       │
         ▼                        ▼                       ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Bull Queues   │────│   Redis          │────│   Blockchain     │
│   (Nation       │    │   Cache          │    │   Bridge         │
│    Grants)      │    │                  │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                        │                       │
         ▼                        ▼                       ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Prisma ORM    │────│   SQLite         │────│   Sovereign      │
│                 │    │   Database       │    │   Tokens         │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## Setup

1. **Install Dependencies**
```bash
npm install
```

2. **Environment Configuration**
```bash
cp .env.example .env
# Edit .env with your API keys and configuration
```

3. **Database Setup**
```bash
npx prisma generate
npx prisma db push
```

4. **Start Services**
```bash
# Start Aegis Citadel
npm run dev

# Start Redis (if not running)
redis-server

# Start Azora Covenant (for blockchain integration)
# ... start covenant service on port 4001
```

## Development

```bash
# Development mode with auto-reload
npm run dev

# Build for production
npm run build

# Run tests
npm test
```

## Constitutional Principles

Aegis Citadel operates under strict constitutional guidelines:

1. **Sovereign Integrity**: All nations maintain economic and political sovereignty
2. **AI Oversight**: Elara AI ensures constitutional compliance
3. **Transparent Governance**: All actions are auditable and transparent
4. **Economic Stability**: 1:1 AZR peg maintained at all times
5. **Collective Benefit**: Actions must benefit the sovereign collective

## Security

- **AI Auditing**: All actions pass through Elara AI constitutional review
- **Queue Processing**: Asynchronous processing prevents system overload
- **Blockchain Security**: Sovereign actions secured by blockchain
- **Audit Trails**: Complete logging of all constitutional decisions

## Integration

Aegis Citadel integrates with:
- **Azora Covenant**: Blockchain operations and token deployment
- **Azora Mint**: Economic transactions and AZR token management
- **Azora Nexus**: Cross-service communication
- **Azora Oracle**: External data and market information

---

**Built with ❤️ for Sovereign Economic Freedom**