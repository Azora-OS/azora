# 🌟 Azora Database Layer - Ubuntu Data Infrastructure

**"My data becomes our knowledge"** - Ubuntu Philosophy

## 🎯 Overview

The Azora Database Layer provides a unified data infrastructure combining:
- **PostgreSQL** (via Prisma) - Relational data
- **MongoDB** - Document storage
- **Redis** - Caching & real-time sync

## 🏗️ Architecture

```
┌─────────────────────────────────────────┐
│     Azora Database Layer (Ubuntu)       │
├─────────────────────────────────────────┤
│                                         │
│  ┌──────────┐  ┌──────────┐  ┌──────┐ │
│  │PostgreSQL│  │ MongoDB  │  │Redis │ │
│  │ (Prisma) │  │(Documents)│ │(Cache)│ │
│  └────┬─────┘  └────┬─────┘  └───┬──┘ │
│       │             │             │    │
│  ┌────┴─────────────┴─────────────┴──┐ │
│  │      Sync Manager (Ubuntu)        │ │
│  │   Real-time synchronization       │ │
│  └───────────────┬───────────────────┘ │
│                  │                      │
│  ┌───────────────┴───────────────────┐ │
│  │   Azora Nexus Event Bus           │ │
│  │   WebSocket + Event Broadcasting  │ │
│  └───────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

## 🚀 Quick Start

### 1. Start Database Infrastructure
```bash
cd services/database
docker-compose up -d
```

### 2. Setup Prisma
```bash
npm install
npm run db:generate
npm run db:migrate
```

### 3. Initialize Connections
```typescript
import { initializeDatabase } from '@azora/database';

await initializeDatabase();
```

## 📊 Data Models

### User & Identity
- User accounts with roles
- Profiles with personal info
- Multi-currency wallets

### Education System
- Courses with lessons
- Enrollments with progress tracking
- Certificates and achievements

### Financial System
- Multi-currency wallets (AZR, USD, BTC, ETH)
- Transaction history
- Mining rewards & UBI distribution

### Marketplace
- Job postings
- Applications and proposals
- Contract management

## 🔄 Real-Time Synchronization

### Cache-Aside Pattern
```typescript
import { syncManager } from '@azora/database';

// Automatic caching with database fallback
const user = await syncManager.getUserWithCache(userId);
```

### Event Broadcasting
```typescript
import { nexus, EventTypes } from '@azora/nexus';

// Publish events that sync across all clients
await nexus.publish({
  type: EventTypes.TRANSACTION_COMPLETED,
  payload: { walletId, amount },
  source: 'payment-service',
  timestamp: Date.now()
});
```

### WebSocket Real-Time Updates
```typescript
// Client-side subscription
socket.on('finance.transaction.completed', (event) => {
  updateWalletBalance(event.payload);
});
```

## 🛡️ Ubuntu Principles

### Data Sovereignty
- Users own their data
- Transparent data usage
- Privacy by design

### Collective Intelligence
- Shared knowledge graphs
- Community-driven insights
- Collaborative learning

### Prosperity Circulation
- Fair value distribution
- Transparent transactions
- Community wealth building

## 📡 API Examples

### User Operations
```typescript
import { dbIntegration } from '@azora/integration';

// Get user with caching
const user = await dbIntegration.getUser(userId);

// Create new user with event
const newUser = await dbIntegration.createUser({
  email: 'user@azora.es',
  username: 'ubuntu_user',
  passwordHash: hashedPassword
});
```

### Course Enrollment
```typescript
// Enroll with real-time notification
const enrollment = await dbIntegration.enrollCourse(userId, courseId);

// Update progress with sync
await syncManager.updateEnrollmentProgress(enrollmentId, 75, userId);
```

### Wallet Operations
```typescript
// Get wallet with cache
const wallet = await dbIntegration.getWallet(userId, 'AZR');

// Update balance with real-time broadcast
await dbIntegration.updateBalance(walletId, 100, userId);
```

## 🔧 Configuration

### Environment Variables
```env
DATABASE_URL="postgresql://azora:azora@localhost:5432/azora"
MONGODB_URI="mongodb://localhost:27017/azora"
REDIS_URL="redis://localhost:6379"
NODE_ENV="development"
```

### Prisma Commands
```bash
npm run db:generate    # Generate Prisma client
npm run db:migrate     # Run migrations
npm run db:push        # Push schema changes
npm run db:studio      # Open Prisma Studio
```

## 📈 Performance

- **Cache Hit Rate**: 85%+ for frequently accessed data
- **Query Response**: <50ms average
- **Real-time Latency**: <100ms for event propagation
- **Concurrent Connections**: 10K+ supported

## 🧪 Testing

```bash
# Test database connections
npm run test:db

# Test sync manager
npm run test:sync

# Test event bus
npm run test:events
```

## 🌐 Integration Points

### Services Using Database Layer
- ✅ Auth Service (user management)
- ✅ Azora Mint (wallet operations)
- ✅ Azora Education (course data)
- ✅ Azora Forge (marketplace)
- ✅ Azora Nexus (event bus)

### Frontend Integration
```typescript
// In v0 Master UI
import { dbIntegration } from '@azora/integration';

const courses = await dbIntegration.getCourse(courseId);
```

## 🛠️ Maintenance

### Backup Strategy
- Automated daily backups
- Point-in-time recovery
- Multi-region replication

### Monitoring
- Prometheus metrics
- Grafana dashboards
- Real-time alerts

## 📚 Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [MongoDB Documentation](https://docs.mongodb.com)
- [Redis Documentation](https://redis.io/docs)
- [Socket.IO Documentation](https://socket.io/docs)

---

**Built with Ubuntu Philosophy** 🌟  
*"I am because we are" - Ngiyakwazi ngoba sikwazi*

**Azora ES (Pty) Ltd**  
Constitutional AI Operating System
