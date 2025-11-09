# 🚀 Azora Education Services - Quick Start Guide

**Get up and running in 5 minutes!**

---

## ⚡ Lightning Setup

### 1. Prerequisites
```bash
# Required
- Node.js 18+
- npm 8+
- OpenAI API key
- Supabase account (optional for full features)
```

### 2. Install
```bash
cd services
npm install
```

### 3. Configure
```bash
# Copy environment template
cp .env.example .env

# Minimal configuration (for testing):
OPENAI_API_KEY=your_key_here
NODE_ENV=development
PORT=4000
```

### 4. Start
```bash
# Start all education services
node education-integration-service.ts
```

---

## 🎯 Quick Examples

### Example 1: Complete Learning Session
```typescript
import { educationIntegration } from './education-integration-service'

// Start session
const session = await educationIntegration.startLearningSession(
  'user123',
  'math-101',
  'web'
)

// Complete and earn rewards
const module = {
  id: 'math-101',
  title: 'Basic Math',
  difficulty: 5,
  duration: 30,
  topics: ['algebra'],
  completed: true
}

const result = await educationIntegration.completeLearningSession(
  session.sessionId,
  85,
  module
)

console.log(`✅ Earned ${result.proof.rewardAmount} AZR`)
console.log(`📜 Certificate: ${result.certificate.certificateUrl}`)
```

### Example 2: AI Tutor Interaction
```typescript
import { elaraAI } from './elara-ai-tutor'

// Analyze student
const path = await elaraAI.analyzeLearner('user123')

// Get personalized lesson
const lesson = await elaraAI.getNextLesson('user123')

// Elara speaks!
await elaraAI.speak('Welcome to your lesson!', 'en')

// Get encouragement
const message = await elaraAI.encourage('user123', 'Completed module')
```

### Example 3: SMS Learning
```typescript
import { smsLearning } from './sms-learning'

// Start SMS quiz
await smsLearning.startSession('+27123456789', 'zu')

// Process answer
await smsLearning.processAnswer('+27123456789', '2')
```

### Example 4: USSD Learning
```bash
# Dial USSD code
*123#

# Select language
1

# Start quiz
1

# Answer questions
2

# Get results
🎉 Passed! Score: 80%
Earned: 0.04 AZR
```

### Example 5: Faculty AI Assistant
```bash
# AI grading assistance
curl -X POST http://localhost:3002/api/lms/ai/grade-assist \
  -H "Content-Type: application/json" \
  -d '{
    "question": "Explain photosynthesis",
    "studentAnswer": "Plants use sunlight to make food...",
    "maxPoints": 100
  }'

# Response:
{
  "suggestedGrade": 75,
  "feedback": "Good understanding of basics. Add more detail about chlorophyll...",
  "confidence": 0.85
}
```

---

## 📊 Check System Health

```bash
# Health check
curl http://localhost:4000/health

# System analytics
curl http://localhost:4000/analytics

# Student dashboard
curl http://localhost:4000/dashboard/user123
```

---

## 🎓 Common Use Cases

### Use Case 1: Student Learns and Earns
```typescript
// 1. Student starts lesson
const session = await educationIntegration.startLearningSession('user123', 'math-101', 'web')

// 2. Student completes lesson
const result = await educationIntegration.completeLearningSession(session.sessionId, 85, module)

// 3. Student earns AZR
console.log(`Earned: ${result.proof.rewardAmount} AZR`)

// 4. Certificate issued on blockchain
console.log(`TX: ${result.txHash}`)
```

### Use Case 2: Teacher Creates Course
```bash
# Create course
curl -X POST http://localhost:3002/api/lms/courses \
  -H "Content-Type: application/json" \
  -d '{
    "code": "CS101",
    "title": "Intro to CS",
    "instructorId": "prof123",
    "institutionType": "university",
    "department": "CS",
    "credits": 3,
    "capacity": 100,
    "startDate": "2025-02-01",
    "endDate": "2025-06-01"
  }'
```

### Use Case 3: AI Generates Content
```typescript
import { aiEducation } from './azora-education/ai-integration'

// Generate lesson
const content = await aiEducation.generatePersonalizedContent(
  'user123',
  'African History',
  'Grade 10'
)

// Generate quiz
const quiz = await aiEducation.generateQuiz('African History', 7, 10)
```

### Use Case 4: SMS Learning (No Smartphone)
```typescript
// Student sends SMS
"START"

// System responds
"Q1: What is 7 × 8?
1. 54
2. 56
3. 58
4. 60

Reply with 1-4"

// Student answers
"2"

// System responds
"✅ Correct! Next question..."
```

---

## 🔧 Troubleshooting

### Issue: OpenAI API Error
```bash
# Check API key
echo $OPENAI_API_KEY

# Test API
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"
```

### Issue: Database Connection
```bash
# Check Supabase URL
echo $SUPABASE_URL

# Test connection
curl $SUPABASE_URL/rest/v1/
```

### Issue: Service Not Starting
```bash
# Check logs
tail -f logs/education.log

# Check port availability
lsof -i :4000

# Restart service
npm run restart:education
```

---

## 📚 Next Steps

1. **Read Full Documentation:** `EDUCATION-SERVICES-README.md`
2. **Review Architecture:** `TIER-3-EDUCATION-COMPLETION-REPORT.md`
3. **Explore Examples:** `examples/education/`
4. **Join Community:** https://discord.gg/azora
5. **Deploy to Production:** Follow deployment guide

---

## 🎯 Key Features

- ✅ AI-powered personalized learning
- ✅ Blockchain-verified certificates
- ✅ Multi-channel delivery (Web, SMS, USSD)
- ✅ 11 languages supported
- ✅ Learn-to-earn (AZR rewards)
- ✅ Faculty AI assistant
- ✅ Real-time analytics
- ✅ Offline-first architecture

---

## 🌟 Success Stories

> "I earned 5 AZR in my first week of learning!" - Student, Cape Town

> "The AI grading assistant saves me 10 hours per week." - Professor, Johannesburg

> "Learning via SMS changed my life - no smartphone needed!" - Student, Rural KZN

---

## 📞 Support

- **Docs:** `EDUCATION-SERVICES-README.md`
- **Discord:** https://discord.gg/azora
- **Email:** education@azora.world
- **GitHub:** https://github.com/azora-os/azora-os

---

**From Africa, For Humanity, Towards Infinity** 🚀

*Azora ES - Where Education Meets Innovation*
