# ⚡ Quick Reference Card

## 🚀 One-Line Setup
```typescript
const azora = await initializeAzora({ autoAuth: true });
```

## 🔐 Authentication
```typescript
// Login
const user = await authService.login(email, password);

// OAuth
const user = await authService.loginWithOAuth('google', code);

// Logout
await authService.logout();

// Check auth
const isAuth = authService.isAuthenticated();
```

## 🎓 Education
```typescript
const courses = await educationService.getCourses();
const course = await educationService.getCourse(id);
await educationService.enrollCourse(courseId, studentId);
const progress = await educationService.getProgress(studentId);
```

## 💰 Finance
```typescript
const wallet = await mintService.getWallet(userId);
const balance = await mintService.getBalance(userId, 'AZR');
await mintService.startMining(userId, 'learning');
const txs = await mintService.getTransactions(userId);
```

## 🔨 Marketplace
```typescript
const jobs = await forgeService.getJobs({ remote: true });
const job = await forgeService.getJob(id);
await forgeService.applyJob(jobId, userId, proposal);
const matches = await forgeService.matchJobs(userId, prefs);
```

## 🤖 AI
```typescript
const response = await sapiensService.chat(userId, message);
const path = await sapiensService.generateLearningPath(userId, goals);
const explanation = await sapiensService.explainConcept(concept, level);
```

## 🔌 WebSocket
```typescript
// Connect
wsClient.connect(token);

// Subscribe
wsClient.on('mining:reward', (data) => console.log(data));

// Send
wsClient.send('ping', { timestamp: Date.now() });
```

## ⚛️ React Hooks
```typescript
// Auth
const { user, login, logout } = useAuth();

// Wallet
const { wallet, loading, refresh } = useWallet(userId);

// Course
const { course, loading } = useCourse(courseId);

// Jobs
const { jobs, loading } = useJobs(filters);

// AI Chat
const { messages, sendMessage } = useAIChat(userId);

// WebSocket
useWebSocket('event:type', (data) => handleEvent(data));
```

## 🎯 Real-time Events
```typescript
// Listen to events
window.addEventListener('azora:mining:reward', (e) => {
  console.log('Reward:', e.detail);
});

window.addEventListener('azora:course:progress', (e) => {
  console.log('Progress:', e.detail);
});
```

## 🛡️ Error Handling
```typescript
try {
  await educationService.getCourses();
} catch (error) {
  const azoraError = errorHandler.handle(error);
  if (errorHandler.isAuthError(azoraError)) {
    // Handle auth error
  }
}
```

## 📦 All Services
```typescript
azora.services.education  // Education
azora.services.mint       // Finance
azora.services.forge      // Marketplace
azora.services.sapiens    // AI
azora.services.aegis      // Security
azora.services.nexus      // Events
azora.services.ledger     // Blockchain
```

## 🌐 Endpoints
- API Gateway: `http://localhost:4000`
- WebSocket: `ws://localhost:4000`

## 📚 Docs
- `README.md` - Setup guide
- `API-REFERENCE.md` - Full API docs
- `INTEGRATION-COMPLETE.md` - Completion report
- `DEPLOYMENT-CHECKLIST.md` - Deploy guide

---

**Azora ES (Pty) Ltd** • Constitutional AI Operating System
