# Azora OS Services

**128+ Microservices** powering the world's first Constitutional AI Operating System.

## 🚀 Quick Start

### Start All Services
```bash
# Using Node.js orchestrator
node start-all.js

# Using Docker Compose
docker-compose -f docker-compose.all.yml up -d

# Check health
node health-check-all.js
```

### Start Individual Service
```bash
cd <service-name>
npm install
npm start
```

## 📊 Service Status

**Total Services:** 128+  
**Implemented:** 23 (18%)  
**In Progress:** 105+ (82%)

See [IMPLEMENTATION-STATUS.md](./IMPLEMENTATION-STATUS.md) for detailed status.

## 🏗️ Architecture

### Service Categories

#### 🧠 AI Services (15+)
- AI Ethics Monitor - Constitutional AI compliance
- AI Enhancement - Model optimization
- AI ML Service - Machine learning operations
- AI Orchestrator - Multi-model coordination
- AI Family Service - Elara & family personalities
- AI Model Service - Model management
- AI System Monitor - Performance tracking

#### 💰 Financial Services (12+)
- Azora Mint - Multi-currency wallet & mining
- Azora Pay - Payment processing
- Payment Gateway - Transaction routing
- Payment Service - Payment operations
- Billing Service - Subscription management
- Lending Service - Micro-loans
- Virtual Card Service - Digital cards

#### 🎓 Education Services (15+)
- Azora Education - Learning management
- Azora LMS - Course platform
- Azora Sapiens - AI tutoring
- Azora Assessment - Testing & grading
- Azora Classroom - Live lectures
- Azora Content - Content management
- Azora Library - Digital library

#### 🔨 Marketplace Services (8+)
- Azora Forge - Job matching
- Azora Careers - Career services
- Marketplace Service - Skills marketplace
- Project Marketplace - Freelance projects

#### 🌐 Infrastructure Services (20+)
- API Gateway - Unified routing
- Auth Service - Authentication
- Azora Nexus - Event bus
- Azora Aegis - Security framework
- Database Service - Data management
- Logger Service - Centralized logging
- Health Monitor - System monitoring

#### ⛓️ Blockchain Services (10+)
- Azora Covenant - Smart contracts
- Azora Ledger - Blockchain ledger
- Chronicle Protocol - Immutable records
- NFT Certificates - Digital credentials

#### 📧 Communication Services (8+)
- Email Service - Email delivery
- Notification Service - Multi-channel notifications
- Azora Mail - Email platform
- Azora Support - Help desk

#### 📊 Analytics Services (6+)
- Azora Analytics - Business intelligence
- Analytics Service - Data analytics
- Analytics Dashboard - Visualization

#### 🏛️ Institutional Services (8+)
- Institutional Service - University management
- Azora Credentials - Credential verification
- Azora ERP - Student information system

#### 👥 Community Services (6+)
- Azora Community - Social platform
- Azora Student Life - Campus activities
- Community Safety - Safety networks

#### 💻 Development Services (8+)
- Azora Codespaces - Cloud IDE
- Azora Scriptorium - Code collaboration
- Azora Spark - Data processing

#### 🛡️ Security Services (6+)
- Security Service - Security operations
- KYC/AML Service - Compliance
- Shield Service - Threat protection

## 🔧 Service Generator

Generate new services quickly:

```bash
node service-generator.js
```

This creates:
- ✅ index.js with Express server
- ✅ package.json with dependencies
- ✅ Dockerfile for containerization
- ✅ .env.example for configuration
- ✅ README.md with documentation

## 🐳 Docker Deployment

### Build All Services
```bash
docker-compose -f docker-compose.all.yml build
```

### Start Services
```bash
# All services
docker-compose -f docker-compose.all.yml up -d

# Specific service
docker-compose -f docker-compose.all.yml up -d api-gateway

# View logs
docker-compose -f docker-compose.all.yml logs -f
```

### Stop Services
```bash
docker-compose -f docker-compose.all.yml down
```

## 🏥 Health Monitoring

### Check All Services
```bash
node health-check-all.js
```

### Check Individual Service
```bash
curl http://localhost:<PORT>/health
```

### Expected Response
```json
{
  "status": "healthy",
  "service": "service-name",
  "timestamp": "2025-01-10T12:00:00.000Z"
}
```

## 📡 Service Ports

| Service | Port | Status |
|---------|------|--------|
| API Gateway | 4000 | ✅ |
| Auth Service | 3001 | ✅ |
| AI Ethics Monitor | 3010 | ✅ |
| AI Enhancement | 3020 | ✅ |
| AI ML Service | 3021 | ✅ |
| AI Orchestrator | 3022 | ✅ |
| Airtime Rewards | 3023 | ✅ |
| API Integration | 3024 | ✅ |
| Blockchain | 3025 | ✅ |
| Database | 3026 | ✅ |
| DevOps | 3027 | ✅ |
| DNA Service | 3028 | ✅ |
| Documentation | 3029 | ✅ |
| Email | 3030 | ✅ |
| Enterprise | 3031 | ✅ |
| Global | 3032 | ✅ |
| Governance | 3033 | ✅ |
| Logger | 3034 | ✅ |
| Master UI | 3035 | ✅ |
| Mobile | 3036 | ✅ |
| Notification | 3037 | ✅ |
| Payment Gateway | 3038 | ✅ |
| Payment Service | 3039 | ✅ |
| Student Earnings | 3040 | ✅ |
| Testing | 3041 | ✅ |
| UI Enhancement | 3042 | ✅ |

## 🔐 Environment Variables

Each service requires:

```env
NODE_ENV=production
PORT=<service-port>
DATABASE_URL=postgresql://user:pass@localhost:5432/azora_os
REDIS_URL=redis://localhost:6379
LOG_LEVEL=info
```

## 🧪 Testing

### Test Individual Service
```bash
cd <service-name>
npm test
```

### Test All Services
```bash
npm run test:services
```

### Integration Tests
```bash
npm run test:integration
```

## 📝 Development

### Add New Service

1. **Generate Service**
   ```bash
   node service-generator.js
   ```

2. **Implement Logic**
   ```javascript
   // Add routes and business logic
   app.post('/api/endpoint', async (req, res) => {
     // Implementation
   });
   ```

3. **Add to Orchestrator**
   ```javascript
   // Add to start-all.js
   { name: 'new-service', port: 3050, priority: 3 }
   ```

4. **Add to Docker Compose**
   ```yaml
   new-service:
     build: ./new-service
     ports:
       - "3050:3050"
   ```

### Service Template

```javascript
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'service-name',
    timestamp: new Date().toISOString() 
  });
});

app.listen(PORT, () => {
  console.log(`Service running on port ${PORT}`);
});
```

## 🌟 Ubuntu Principles

Every service implements:

- ✅ **Health Checks** - `/health` endpoint
- ✅ **Error Handling** - Graceful error responses
- ✅ **Logging** - Structured logging
- ✅ **Metrics** - Performance tracking
- ✅ **Security** - Helmet, CORS, rate limiting
- ✅ **Constitutional Compliance** - AI ethics monitoring

## 📚 Documentation

- [Implementation Status](./IMPLEMENTATION-STATUS.md)
- [Service Generator](./service-generator.js)
- [Health Check](./health-check-all.js)
- [Docker Compose](./docker-compose.all.yml)

## 🤝 Contributing

1. Generate service template
2. Implement business logic
3. Add tests
4. Update documentation
5. Submit pull request

## 📊 Monitoring

### Prometheus Metrics
```
http://localhost:9090
```

### Grafana Dashboard
```
http://localhost:3000
```

### Service Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f api-gateway
```

## 🚨 Troubleshooting

### Service Won't Start
```bash
# Check logs
docker-compose logs <service-name>

# Check port availability
lsof -i :<port>

# Restart service
docker-compose restart <service-name>
```

### Health Check Fails
```bash
# Check service status
curl http://localhost:<port>/health

# Check Docker status
docker-compose ps

# View service logs
docker-compose logs <service-name>
```

## 🎯 Roadmap

### Phase 1: Core Services (Week 1)
- ✅ API Gateway
- ✅ Auth Service
- ✅ AI Ethics Monitor
- 🚧 Azora Education
- 🚧 Azora Mint

### Phase 2: Extended Services (Week 2)
- 🚧 Azora LMS
- 🚧 Azora Forge
- 🚧 Azora Nexus
- 🚧 Azora Aegis

### Phase 3: Specialized Services (Week 3-4)
- 🚧 All remaining services

## 📞 Support

- **Documentation**: [docs.azora.world](https://docs.azora.world)
- **Discord**: [discord.gg/azora](https://discord.gg/azora)
- **Email**: support@azora.world

---

**"Ngiyakwazi ngoba sikwazi" - "I can because we can"**

*Building the future of Constitutional AI, one service at a time.* 🚀
