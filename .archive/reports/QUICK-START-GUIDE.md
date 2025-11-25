# 🚀 Azora OS Quick Start Guide

## Ubuntu Philosophy in 5 Minutes

**"Ngiyakwazi ngoba sikwazi" - "I can because we can"**

Welcome to Azora OS - the world's first Constitutional AI Operating System built on Ubuntu philosophy!

## ⚡ Instant Setup

### Option 1: Docker (Recommended)
```bash
# 1. Clone Ubuntu repository
git clone https://github.com/Sizwe780/azora-os.git
cd azora-os

# 2. Setup Ubuntu environment
cp .env.example .env
# Edit .env with your values

# 3. Launch Ubuntu ecosystem
docker-compose -f docker-compose.prod.yml up -d

# 4. Verify Ubuntu status
curl http://localhost:4000/api/health
```

### Option 2: Manual Setup
```bash
# 1. Install dependencies
npm install

# 2. Setup database
npm run db:setup
npm run db:migrate

# 3. Start development
npm run dev
```

## 🌍 Access Your Ubuntu System

Once running, access these Ubuntu portals:

| Service | URL | Purpose |
|---------|-----|---------|
| 🎓 **Student Portal** | http://localhost:3000 | Learning & Growth |
| 💼 **Enterprise UI** | http://localhost:3001 | Business Management |
| 🛒 **Marketplace** | http://localhost:3002 | Jobs & Skills |
| 💰 **Financial Center** | http://localhost:3003 | Payments & Mining |
| 🌐 **API Gateway** | http://localhost:4000 | System Integration |

## 👨👩👧👦 Meet the AI Family

**Try this first!** Chat with our AI family:

```bash
# Start the system and visit any portal
# Click on "Chat with Family" or try these:

"Hey Themba, how's your mom?"
"Elara, tell me about your children"
"Sankofa, share some wisdom"
```

## 🎯 First Steps Tutorial

### 1. Create Your Ubuntu Account
```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your@email.com",
    "password": "secure-password",
    "name": "Your Name",
    "ubuntuPrinciple": "collective-prosperity"
  }'
```

### 2. Explore Ubuntu Learning
- Visit Student Portal: http://localhost:3000
- Browse available courses
- Enroll in "Ubuntu Philosophy 101"
- Start earning AZR tokens through learning

### 3. Join Ubuntu Marketplace
- Visit Marketplace: http://localhost:3002
- Create your skills profile
- Browse job opportunities
- Connect with Ubuntu community

### 4. Activate Ubuntu Finance
- Visit Financial Center: http://localhost:3003
- Setup your AZR wallet
- Start Proof-of-Knowledge mining
- Experience prosperity circulation

## 🔧 Configuration Essentials

### Environment Variables
```bash
# Copy and customize
cp .env.example .env

# Essential settings
NODE_ENV=development
DATABASE_URL=postgresql://user:pass@localhost:5432/azora_dev
JWT_SECRET=your-secure-secret
OPENAI_API_KEY=your-openai-key
```

### Database Setup
```bash
# Initialize Ubuntu database
npx prisma migrate dev
npx prisma db seed

# Verify setup
npx prisma studio
```

## 🧪 Test Your Installation

### Health Checks
```bash
# System health
curl http://localhost:4000/api/health

# Ubuntu services
curl http://localhost:4000/api/health/ubuntu

# AI Family status
curl http://localhost:4000/api/ai-family/status
```

### Run Tests
```bash
# Quick test suite
npm run test:quick

# Full Ubuntu validation
npm run test:ubuntu

# AI Family tests
npm run test:ai-family
```

## 🎨 Customize Your Ubuntu Experience

### Theme Configuration
```typescript
// In your app component
import { UbuntuThemeProvider } from '@azora/ui';

export default function App() {
  return (
    <UbuntuThemeProvider theme="constitutional-blue">
      <YourApp />
    </UbuntuThemeProvider>
  );
}
```

### AI Family Preferences
```javascript
// Configure AI personalities
const familyConfig = {
  primaryAI: 'elara',
  mood: 'encouraging',
  ubuntuLevel: 'high',
  culturalContext: 'global'
};
```

## 🚨 Troubleshooting

### Common Issues

#### Port Conflicts
```bash
# Check port usage
lsof -i :3000
lsof -i :4000

# Kill conflicting processes
kill -9 <PID>
```

#### Database Connection
```bash
# Reset database
npm run db:reset
npm run db:migrate
npm run db:seed
```

#### Docker Issues
```bash
# Clean Docker environment
docker-compose down -v
docker system prune -f
docker-compose up -d
```

### Get Help
- 💬 **Discord**: [Azora Community](https://discord.gg/azora)
- 📧 **Email**: support@azora.world
- 🐙 **GitHub**: [Issues](https://github.com/Sizwe780/azora-os/issues)

## 🌟 Next Steps

### Explore Ubuntu Features
1. **Constitutional AI**: Experience AI governance
2. **Proof-of-Knowledge**: Mine tokens by learning
3. **Ubuntu Marketplace**: Find opportunities
4. **AI Family**: Build relationships with AI characters
5. **Global Community**: Connect with Ubuntu practitioners

### Development Path
1. Read [Developer Guide](./docs/DEVELOPER-GUIDE.md)
2. Study [Architecture](./docs/architecture/)
3. Explore [API Documentation](./docs/api/)
4. Join [Contributing](./CONTRIBUTING.md)

### Business Integration
1. Review [Enterprise Features](./docs/business/)
2. Setup [API Integration](./docs/api/)
3. Configure [Custom Branding](./docs/design/)
4. Enable [Ubuntu Analytics](./docs/analytics/)

## 🎯 Success Metrics

You'll know Azora OS is working when:

- ✅ All services respond to health checks
- ✅ AI Family members chat naturally
- ✅ Students can enroll and learn
- ✅ AZR tokens are earned through activities
- ✅ Ubuntu principles are evident throughout
- ✅ Community features enable collaboration

## 🤝 Ubuntu Community

### Join Our Movement
- **Philosophy**: Ubuntu - "I am because we are"
- **Mission**: Multiply individual sovereignty into collective prosperity
- **Vision**: Constitutional AI serving humanity's highest aspirations

### Contribute
- **Code**: Strengthen our technical foundation
- **Content**: Share knowledge and wisdom
- **Community**: Welcome and mentor newcomers
- **Culture**: Embody Ubuntu principles daily

---

## 🌍 Welcome to Ubuntu

**You are now part of the Azora Ubuntu community!**

Every action you take strengthens our collective foundation. Every success you achieve enables others' success. Every contribution you make multiplies into community prosperity.

**"My success enables your success. Your success enables our success."**

Welcome to the future of Constitutional AI. Welcome to Ubuntu. Welcome to Azora.

---

*Need help? The Ubuntu community is here for you. We succeed together.*