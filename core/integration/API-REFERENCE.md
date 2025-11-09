# 📡 Azora Integration API Reference

Complete API reference for all backend services and integration components.

## 🔐 Authentication Service

### `authService.login(email, password)`
Authenticate user with email and password.

```typescript
const user = await authService.login('user@azora.com', 'password123');
// Returns: { id, email, role, profile }
```

### `authService.loginWithOAuth(provider, code)`
Authenticate using OAuth provider.

```typescript
const user = await authService.loginWithOAuth('google', 'auth_code');
```

### `authService.register(data)`
Register new user account.

```typescript
const user = await authService.register({
  email: 'new@azora.com',
  password: 'secure123',
  name: 'John Doe'
});
```

### `authService.logout()`
Log out current user.

```typescript
await authService.logout();
```

---

## 🎓 Education Service

### `educationService.getCourses(filters?)`
Get list of available courses.

```typescript
const courses = await educationService.getCourses({ category: 'AI' });
```

### `educationService.getCourse(id)`
Get specific course details.

```typescript
const course = await educationService.getCourse('course-123');
```

### `educationService.enrollCourse(courseId, studentId)`
Enroll student in course.

```typescript
await educationService.enrollCourse('course-123', 'student-456');
```

### `educationService.getProgress(studentId)`
Get student learning progress.

```typescript
const progress = await educationService.getProgress('student-456');
```

### `educationService.submitAssessment(assessmentId, answers)`
Submit assessment answers.

```typescript
const result = await educationService.submitAssessment('assess-789', {
  q1: 'answer1',
  q2: 'answer2'
});
```

---

## 💰 Mint Service (Financial)

### `mintService.getWallet(userId)`
Get user's wallet information.

```typescript
const wallet = await mintService.getWallet('user-123');
// Returns: { id, balances: { AZR, BTC, ETH, USD } }
```

### `mintService.getBalance(userId, currency)`
Get balance for specific currency.

```typescript
const balance = await mintService.getBalance('user-123', 'AZR');
```

### `mintService.startMining(userId, activityType)`
Start mining session.

```typescript
await mintService.startMining('user-123', 'learning');
```

### `mintService.getTransactions(userId, limit)`
Get transaction history.

```typescript
const txs = await mintService.getTransactions('user-123', 50);
```

### `mintService.transfer(from, to, amount, currency)`
Transfer funds between wallets.

```typescript
await mintService.transfer('user-123', 'user-456', 100, 'AZR');
```

---

## 🔨 Forge Service (Marketplace)

### `forgeService.getJobs(filters?)`
Get available job listings.

```typescript
const jobs = await forgeService.getJobs({ 
  skills: ['React', 'TypeScript'],
  remote: true 
});
```

### `forgeService.getJob(id)`
Get specific job details.

```typescript
const job = await forgeService.getJob('job-123');
```

### `forgeService.applyJob(jobId, userId, proposal)`
Apply to a job.

```typescript
await forgeService.applyJob('job-123', 'user-456', {
  coverLetter: 'I am interested...',
  rate: 50
});
```

### `forgeService.assessSkills(userId, skills)`
Assess user skills.

```typescript
const assessment = await forgeService.assessSkills('user-123', [
  'JavaScript', 'React', 'Node.js'
]);
```

### `forgeService.matchJobs(userId, preferences)`
Get AI-matched jobs.

```typescript
const matches = await forgeService.matchJobs('user-123', {
  minRate: 40,
  maxHours: 20,
  remote: true
});
```

---

## 🤖 Sapiens Service (AI)

### `sapiensService.chat(userId, message, context?)`
Chat with AI tutor.

```typescript
const response = await sapiensService.chat('user-123', 
  'Explain quantum computing',
  { level: 'beginner' }
);
```

### `sapiensService.generateLearningPath(userId, goals)`
Generate personalized learning path.

```typescript
const path = await sapiensService.generateLearningPath('user-123', [
  'Learn React',
  'Build full-stack app'
]);
```

### `sapiensService.explainConcept(concept, level)`
Get concept explanation.

```typescript
const explanation = await sapiensService.explainConcept(
  'Blockchain',
  'intermediate'
);
```

### `sapiensService.getRecommendations(userId)`
Get personalized recommendations.

```typescript
const recs = await sapiensService.getRecommendations('user-123');
```

---

## 🛡️ Aegis Service (Security)

### `aegisService.verifyIdentity(userId, documents)`
Verify user identity.

```typescript
await aegisService.verifyIdentity('user-123', {
  idType: 'passport',
  idNumber: 'ABC123'
});
```

### `aegisService.checkPermissions(userId, resource, action)`
Check user permissions.

```typescript
const allowed = await aegisService.checkPermissions(
  'user-123',
  'course-456',
  'edit'
);
```

### `aegisService.getSecurityStatus(userId)`
Get security status.

```typescript
const status = await aegisService.getSecurityStatus('user-123');
```

---

## 🌐 Nexus Service (Events)

### `nexusService.publishEvent(event)`
Publish event to event bus.

```typescript
await nexusService.publishEvent({
  type: 'course:completed',
  userId: 'user-123',
  courseId: 'course-456'
});
```

### `nexusService.subscribeToEvents(userId, eventTypes)`
Subscribe to event types.

```typescript
await nexusService.subscribeToEvents('user-123', [
  'course:progress',
  'mining:reward'
]);
```

---

## ⛓️ Ledger Service (Blockchain)

### `ledgerService.mintNFT(userId, metadata)`
Mint NFT certificate.

```typescript
const nft = await ledgerService.mintNFT('user-123', {
  type: 'certificate',
  courseId: 'course-456',
  grade: 'A'
});
```

### `ledgerService.getNFTs(userId)`
Get user's NFTs.

```typescript
const nfts = await ledgerService.getNFTs('user-123');
```

### `ledgerService.verifyCertificate(certificateId)`
Verify certificate authenticity.

```typescript
const valid = await ledgerService.verifyCertificate('cert-789');
```

---

## 🔌 WebSocket Client

### `wsClient.connect(token?)`
Connect to WebSocket server.

```typescript
wsClient.connect(authToken);
```

### `wsClient.on(event, handler)`
Subscribe to event.

```typescript
wsClient.on('mining:reward', (data) => {
  console.log('Reward:', data.amount);
});
```

### `wsClient.send(type, data)`
Send message to server.

```typescript
wsClient.send('ping', { timestamp: Date.now() });
```

---

## ⚛️ React Hooks

### `useAuth()`
Authentication hook.

```typescript
const { user, loading, login, logout, isAuthenticated } = useAuth();
```

### `useWallet(userId)`
Wallet hook with auto-refresh.

```typescript
const { wallet, loading, refresh } = useWallet(userId);
```

### `useCourse(courseId)`
Course data hook.

```typescript
const { course, loading } = useCourse('course-123');
```

### `useJobs(filters?)`
Jobs listing hook.

```typescript
const { jobs, loading } = useJobs({ remote: true });
```

### `useAIChat(userId)`
AI chat hook.

```typescript
const { messages, loading, sendMessage } = useAIChat(userId);
```

### `useWebSocket(event, handler)`
WebSocket event hook.

```typescript
useWebSocket('mining:reward', (data) => {
  console.log('Reward received:', data);
});
```

---

## 🚀 Initialization

### `initializeAzora(config?)`
Initialize entire integration layer.

```typescript
const azora = await initializeAzora({ autoAuth: true });

// Access all services
azora.auth.login(email, password);
azora.services.education.getCourses();
azora.ws.connect();
```

---

**Azora ES (Pty) Ltd**  
Constitutional AI Operating System  
*Complete API Reference - Ubuntu Integration* 🚀
