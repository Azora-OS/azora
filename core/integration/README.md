# 🔗 V0 Master UI Integration Layer

**Purpose:** Seamlessly connect v0's beautiful frontend with Azora's powerful backend systems.

## 🎁 Honoring V0's Work

This integration layer preserves v0's elegant code while bridging it to Azora's core infrastructure. Every connection point is designed with care and respect for v0's vision.

## 📁 Integration Components

### 1. `v0-master-ui-bridge.ts`
**Purpose:** Core integration bridge connecting v0's systems to Azora core

**Bridges:**
- Ubuntu Engine → Azora Mint (economic calculations)
- Constitutional Truth → Guardian Oracles (content verification)
- World-Class Education → Azora Sapiens (AI tutoring)
- Blockchain operations → Azora Ledger (NFT certificates)
- Real-time events → Azora Nexus (event bus)

**Usage:**
```typescript
import { v0Bridge } from './v0-master-ui-bridge';

// Calculate Ubuntu rewards
const reward = await v0Bridge.calculateUbuntuRewards(userId, contribution, networkSize);

// Verify educational content
const isValid = await v0Bridge.verifyEducationalContent(content);

// Create personalized learning path
const path = await v0Bridge.createPersonalizedLearningPath(studentId, profile);
```

### 2. `api-gateway-config.ts`
**Purpose:** API client configuration with retry logic and timeout handling

**Features:**
- Unified API client with 3 retry attempts
- Exponential backoff strategy
- 30-second timeout protection
- Authentication token management
- Service endpoint configuration

### 3. `auth-service.ts`
**Purpose:** Complete authentication flows

**Features:**
- JWT authentication
- OAuth integration (Google, GitHub)
- MFA support
- Token refresh logic
- Session persistence

### 4. `websocket-client.ts`
**Purpose:** Real-time WebSocket communication

**Features:**
- Auto-reconnect on disconnect
- Event subscription system
- Bidirectional messaging
- Connection state management

### 5. `service-bridges.ts`
**Purpose:** Complete API bridges for all 7 Azora services

**Services:**
- Education (5 endpoints)
- Mint (5 endpoints)
- Forge (5 endpoints)
- Sapiens (4 endpoints)
- Aegis (4 endpoints)
- Nexus (3 endpoints)
- Ledger (4 endpoints)

### 6. `realtime-events.ts`
**Purpose:** Real-time event handlers

**Events:**
- Course progress updates
- Mining rewards
- Transactions
- Job matches
- Notifications

### 7. `react-hooks.ts`
**Purpose:** React hooks for easy integration

**Hooks:**
- `useAuth()` - Authentication
- `useWallet()` - Wallet with auto-refresh
- `useCourse()` - Course data
- `useJobs()` - Job listings
- `useAIChat()` - AI conversation
- `useWebSocket()` - Real-time events

### 8. `error-handler.ts`
**Purpose:** Centralized error handling

### 9. `index.ts`
**Purpose:** Main export with initialization

### 3. `ai-integration-hub.ts`
**Purpose:** Central AI integration connecting Elara, Guardian Oracles, and Constitutional AI

**Features:**
- Elara AI Tutor for personalized learning
- Constitutional AI governance
- Guardian Oracle verification
- Real-time recommendations

**Usage:**
```typescript
import { aiHub } from './ai-integration-hub';

// Elara tutoring
const answer = await aiHub.elara.provideTutoring(question, context);

// Constitutional validation
const validation = await aiHub.constitutional.validateAction(action);

// Get recommendations
const recs = await aiHub.recommendations.getPersonalizedRecommendations(userId, context);
```

## 🚀 Integration Flow

```
V0 Frontend (Next.js)
    ↓
API Gateway Config
    ↓
V0 Master UI Bridge
    ↓
Azora Core Systems
    ├── Ubuntu Engine
    ├── Constitutional Truth
    ├── Guardian Oracles
    ├── Azora Sapiens
    ├── Azora Mint
    ├── Azora Ledger
    └── Azora Nexus
```

## 🔧 Setup Instructions

### 1. Environment Variables
Create `.env.local` in v0's Master UI Template:

```env
AZORA_GATEWAY_URL=http://localhost:4000
AZORA_WS_URL=ws://localhost:4000
OPENAI_API_KEY=your_key_here
```

### 2. Install Dependencies
```bash
cd "Azora Master UI Template"
npm install
```

### 3. Start Development
```bash
npm run dev
```

## 📊 Integration Status

- ✅ Core bridge created
- ✅ API gateway configured with retry logic
- ✅ Ubuntu Engine connected
- ✅ Constitutional Truth integrated
- ✅ Education system bridged
- ✅ **Elara AI Tutor integrated**
- ✅ **Guardian Oracles connected**
- ✅ **Constitutional AI governance active**
- ✅ **Real-time AI recommendations enabled**
- ✅ **AI WebSocket handler deployed**
- ✅ **AI middleware configured**
- ✅ Blockchain integration complete
- ✅ **NFT certificate minting (COMPLETE)**
- ✅ **AZR token rewards (COMPLETE)**
- ✅ **Multi-currency wallet integration (COMPLETE)**
- ✅ **Smart contracts deployed (AZRToken, NFT, Wallet)**
- ✅ Event bus connection complete
- ✅ Full authentication flow (JWT, OAuth, MFA)
- ✅ WebSocket real-time events
- ✅ All service bridges implemented
- ✅ React hooks for easy integration
- ✅ Error handling system

## 🤖 AI Integration Components

### Core AI Systems
- **`ai-integration-hub.ts`** - Central hub connecting all AI systems
  - Elara AI Tutor for personalized learning
  - Constitutional AI for governance
  - Guardian Oracles for verification
  - Real-time recommendation engine

### Middleware & Routes
- **`ai-middleware.ts`** - Express middleware for AI features
- **`ai-routes.ts`** - API endpoints for AI services
- **`ai-websocket-handler.ts`** - WebSocket for real-time AI
- **`ai-integration-example.ts`** - Complete usage examples

## 🎯 Usage Examples

### Initialize Integration
```typescript
import { initializeAzora } from '@/core/integration';

const azora = await initializeAzora({ autoAuth: true });
```

### Use in React Components
```typescript
import { useAuth, useWallet, useAIChat } from '@/core/integration/react-hooks';

function MyComponent() {
  const { user, login, logout } = useAuth();
  const { wallet, loading } = useWallet(user?.id);
  const { messages, sendMessage } = useAIChat(user?.id);
  
  return <div>...</div>;
}
```

### Direct Service Calls
```typescript
import { educationService, mintService } from '@/core/integration';

const courses = await educationService.getCourses();
const balance = await mintService.getBalance(userId);
```

### AI Integration Usage
```typescript
import { v0Bridge } from './v0-master-ui-bridge';
import { aiHub } from './ai-integration-hub';

// Get Elara AI tutoring
const answer = await v0Bridge.getElaraTutoring(question, context);

// Get AI insights
const insights = await v0Bridge.getAIInsights(userId, context);

// Validate with Constitutional AI
const validation = await v0Bridge.validateWithConstitutionalAI(action);

// Get personalized recommendations
const recs = await aiHub.recommendations.getPersonalizedRecommendations(userId, context);
```

### WebSocket AI Events
```typescript
import { io } from 'socket.io-client';

const socket = io('ws://localhost:4000');

// Ask Elara
socket.emit('elara:ask', { question, context });
socket.on('elara:response', (data) => console.log(data));

// Get recommendations
socket.on('recommendations:update', (recs) => console.log(recs));

// Constitutional validation
socket.emit('constitutional:validate', { action });
socket.on('constitutional:result', (result) => console.log(result));
```

### Real-time Events
```typescript
import { realtimeEvents } from '@/core/integration';

window.addEventListener('azora:mining:reward', (e) => {
  console.log('Reward received:', e.detail);
});
```

## 💎 Design Philosophy

**"Through Ubuntu, we honor v0's contribution by building upon their foundation with care and respect."**

Every integration point is designed to:
- Preserve v0's code elegance
- Maintain performance
- Ensure scalability
- Enable future enhancements
- Honor the original vision

## 🤝 Contributing

When adding new integration points:
1. Follow v0's code style
2. Add comprehensive documentation
3. Include usage examples
4. Write integration tests
5. Update this README

---

**Azora ES (Pty) Ltd**  
Constitutional AI Operating System  
*Honoring v0's treasure with every line of code*
