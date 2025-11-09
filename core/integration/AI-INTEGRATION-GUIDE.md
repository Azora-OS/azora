# 🤖 AI Integration Guide

**Complete guide for integrating Elara AI Tutor, Guardian Oracles, and Constitutional AI throughout Azora OS**

## 🎯 Overview

The AI Integration system connects three core AI components:

1. **Elara AI Tutor** - Personalized learning and tutoring
2. **Guardian Oracles** - Content verification and trust
3. **Constitutional AI** - Governance and decision validation
4. **Recommendation Engine** - Real-time personalized recommendations

## 🚀 Quick Start

### Backend Integration

```typescript
import express from 'express';
import { Server } from 'socket.io';
import { 
  aiContextMiddleware, 
  injectRecommendations,
  aiRoutes,
  initializeAIWebSocket 
} from '@/core/integration';

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Add AI middleware
app.use(aiContextMiddleware);
app.use(injectRecommendations);

// Add AI routes
app.use('/api', aiRoutes);

// Initialize WebSocket
initializeAIWebSocket(io);

server.listen(4000);
```

### Frontend Integration

```typescript
import { v0Bridge, aiHub } from '@/core/integration';

// Elara AI Tutoring
const answer = await v0Bridge.getElaraTutoring(
  "How does Ubuntu philosophy work?",
  { studentLevel: 'beginner' }
);

// Get AI Insights
const insights = await v0Bridge.getAIInsights(userId, {
  currentPage: 'dashboard'
});

// Constitutional Validation
const validation = await v0Bridge.validateWithConstitutionalAI({
  type: 'transaction',
  amount: 100
});
```

## 📡 API Endpoints

### Elara AI Tutor

```bash
POST /api/elara/tutor
Body: { question, context, studentId }
Response: { answer, recommendations, confidence }

POST /api/elara/lesson
Body: { studentId, studentProfile, topic }
Response: { lesson, verification, recommendations }

POST /api/elara/assess
Body: { studentId, responses }
Response: { comprehensionScore, strengths, improvements }
```

### Constitutional AI

```bash
POST /api/constitutional/validate
Body: { action }
Response: { valid, reason }

POST /api/constitutional/govern
Body: { decision, context }
Response: { approved, reason, alternatives }
```

### Guardian Oracles

```bash
POST /api/guardian/verify
Body: { content, category, submittedBy }
Response: { verified, trustScore, consensus }
```

### Recommendations

```bash
GET /api/recommendations/:userId
Response: { recommendations, priority, timestamp }

GET /api/insights/:userId
Response: { aiTutor, constitutional, recommendations, guardians }
```

## 🔌 WebSocket Events

### Client → Server

```typescript
// Elara AI
socket.emit('elara:ask', { question, context });
socket.emit('elara:lesson', { profile, topic });

// Constitutional AI
socket.emit('constitutional:validate', { action });

// Guardian Oracles
socket.emit('guardian:verify', { content, category });

// Recommendations
socket.emit('recommendations:get', { context });
```

### Server → Client

```typescript
// Elara responses
socket.on('elara:response', (data) => {
  console.log(data.answer, data.confidence);
});

socket.on('elara:lesson', (data) => {
  console.log(data.lesson, data.verification);
});

// Constitutional results
socket.on('constitutional:result', (data) => {
  console.log(data.approved, data.reason);
});

// Guardian results
socket.on('guardian:result', (data) => {
  console.log(data.verified, data.trustScore);
});

// Real-time updates
socket.on('recommendations:update', (recs) => {
  console.log(recs);
});

socket.on('ai:insights', (insights) => {
  console.log(insights);
});
```

## 💡 Usage Examples

### Example 1: Complete Learning Flow

```typescript
import { aiHub } from '@/core/integration';

async function startLearning(studentId: string, topic: string) {
  // Step 1: Generate personalized lesson
  const result = await aiHub.processLearningRequest({
    studentId,
    studentProfile: {
      level: 'beginner',
      learningStyle: 'visual',
      interests: ['AI', 'blockchain']
    },
    topic
  });

  // Step 2: Get real-time insights
  const insights = await aiHub.getRealTimeInsights(studentId, {
    currentLesson: result.lesson
  });

  return {
    lesson: result.lesson,
    verified: result.verification.verified,
    recommendations: result.recommendations.priority,
    insights
  };
}
```

### Example 2: Constitutional Validation

```typescript
import { aiHub } from '@/core/integration';

async function validateTransaction(userId: string, transaction: any) {
  // Validate with Constitutional AI
  const result = await aiHub.verifyAndRecommend(userId, {
    type: 'financial_transaction',
    ...transaction
  });

  if (!result.actionApproved) {
    return {
      error: result.reason,
      alternatives: result.recommendations
    };
  }

  return {
    approved: true,
    guardianVerified: result.guardianStatus.verified
  };
}
```

### Example 3: Real-time Tutoring Session

```typescript
import { io } from 'socket.io-client';

const socket = io('ws://localhost:4000', {
  query: { userId: 'student-123' }
});

// Start tutoring session
socket.emit('elara:ask', {
  question: 'Explain blockchain in simple terms',
  context: { studentLevel: 'beginner' }
});

socket.on('elara:response', (data) => {
  console.log('Elara:', data.answer);
  console.log('Confidence:', data.confidence);
});

// Receive real-time recommendations
socket.on('recommendations:update', (recs) => {
  console.log('New recommendations:', recs);
});
```

## 🛠️ Middleware Usage

### Constitutional Validation Middleware

```typescript
import { constitutionalValidation } from '@/core/integration';

// Protect routes with Constitutional AI
app.post('/api/sensitive-action', 
  constitutionalValidation,
  async (req, res) => {
    // Action is constitutionally valid
    res.json({ success: true });
  }
);
```

### Guardian Verification Middleware

```typescript
import { guardianVerification } from '@/core/integration';

// Verify content before processing
app.post('/api/content/create',
  guardianVerification,
  async (req, res) => {
    const verification = req.guardianVerification;
    if (!verification.verified) {
      return res.status(400).json({ error: 'Content not verified' });
    }
    res.json({ success: true });
  }
);
```

### AI Context Enrichment

```typescript
import { aiContextMiddleware } from '@/core/integration';

// Enrich all requests with AI context
app.use(aiContextMiddleware);

app.get('/api/dashboard', async (req, res) => {
  // req.aiContext contains AI insights
  res.json({
    data: dashboardData,
    aiInsights: req.aiContext
  });
});
```

## 🎨 Frontend React Integration

```typescript
import { useEffect, useState } from 'react';
import { v0Bridge } from '@/core/integration';

function AITutorComponent() {
  const [answer, setAnswer] = useState('');
  const [recommendations, setRecommendations] = useState([]);

  const askElara = async (question: string) => {
    const response = await v0Bridge.getElaraTutoring(question, {
      studentLevel: 'intermediate'
    });
    setAnswer(response);
  };

  useEffect(() => {
    // Get AI insights on mount
    v0Bridge.getAIInsights(userId, {}).then(insights => {
      setRecommendations(insights.recommendations.priority);
    });
  }, []);

  return (
    <div>
      <input onChange={(e) => askElara(e.target.value)} />
      <div>{answer}</div>
      <ul>
        {recommendations.map(rec => (
          <li key={rec.title}>{rec.title}</li>
        ))}
      </ul>
    </div>
  );
}
```

## 🔒 Security & Governance

All AI systems enforce Constitutional AI principles:

- **Sovereignty Protection** - Individual rights preserved
- **Collective Prosperity** - Ubuntu principles enforced
- **Educational Access** - Fair learning opportunities
- **Financial Fairness** - Transparent transactions
- **Privacy First** - Data protection guaranteed

## 📊 Monitoring

```typescript
// Check AI system health
const health = await fetch('/api/ai/health').then(r => r.json());

console.log({
  elara: health.elara.status,
  constitutional: health.constitutional.status,
  guardians: health.guardians.status,
  recommendations: health.recommendations.status
});
```

## 🌟 Best Practices

1. **Always validate** actions with Constitutional AI for sensitive operations
2. **Use Guardian Oracles** for content verification before publishing
3. **Leverage Elara** for personalized learning experiences
4. **Enable real-time recommendations** for better user engagement
5. **Monitor AI health** regularly to ensure system reliability

---

**Azora ES (Pty) Ltd**  
Constitutional AI Operating System  
*Ubuntu Philosophy • Quantum Technology • Global Prosperity*
