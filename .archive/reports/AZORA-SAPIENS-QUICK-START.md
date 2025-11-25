# Azora Sapiens - Quick Start Guide 🤖

## What is Azora Sapiens?

The AI tutoring system that provides personalized learning, homework help, and adaptive assessments using OpenAI GPT-4.

---

## ⚡ Quick Start (30 seconds)

```bash
cd services/azora-sapiens
./START.sh
```

Service runs on **http://localhost:3075**

---

## 🧪 Test It Works

```bash
# Health check
curl http://localhost:3075/health

# Or run automated tests
node TEST-SERVICE.js
```

---

## 📡 API Endpoints

### 1. Generate Learning Path
```bash
curl -X POST http://localhost:3075/api/learning-path \
  -H "Content-Type: application/json" \
  -d '{
    "studentProfile": {
      "currentLevel": "beginner",
      "interests": ["programming"],
      "learningStyle": "visual"
    },
    "goal": "advanced"
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "goal": "advanced",
    "currentLevel": "beginner",
    "milestones": [
      {
        "level": "intermediate",
        "order": 1,
        "skills": ["applied_knowledge", "problem_solving", "projects"],
        "completed": false
      }
    ],
    "estimatedDuration": 6,
    "resources": {
      "videos": 10,
      "readings": 8,
      "exercises": 20,
      "projects": 5
    }
  }
}
```

### 2. Create Assessment
```bash
curl -X POST http://localhost:3075/api/assessment \
  -H "Content-Type: application/json" \
  -d '{
    "subject": "Python",
    "level": "intermediate",
    "questionCount": 5
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "assess_1234567890",
    "subject": "Python",
    "level": "intermediate",
    "questions": [
      {
        "id": "q_1",
        "question": "Python question 1 at intermediate level",
        "type": "multiple_choice",
        "difficulty": "medium",
        "points": 10
      }
    ],
    "timeLimit": 10,
    "passingScore": 70
  }
}
```

### 3. AI Tutoring (Requires OpenAI API Key)
```bash
curl -X POST http://localhost:3075/api/tutor \
  -H "Content-Type: application/json" \
  -d '{
    "studentId": "student123",
    "subject": "Python",
    "question": "How do I use list comprehensions?"
  }'
```

---

## 🔧 Configuration

Create `.env` file:
```bash
PORT=3075
OPENAI_API_KEY=your_key_here
SERVICE_NAME=azora-sapiens
```

---

## 📦 What's Included

- ✅ **Tutor Engine** - AI-powered tutoring with GPT-4
- ✅ **Learning Path Engine** - Adaptive curriculum generation
- ✅ **Assessment Engine** - Dynamic test creation & grading
- ✅ **REST API** - Complete endpoints
- ✅ **TypeScript** - Type-safe implementation
- ✅ **Express Server** - Production-ready

---

## 🔗 Integration Examples

### With Frontend (React)
```typescript
const generatePath = async () => {
  const response = await fetch('http://localhost:3075/api/learning-path', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      studentProfile: { currentLevel: 'beginner', learningStyle: 'visual' },
      goal: 'advanced'
    })
  });
  const { data } = await response.json();
  return data;
};
```

### With Azora Mint (Token Mining)
```javascript
// After assessment completion
const assessment = await createAssessment('Python', 'intermediate', 10);
const result = await gradeAssessment(answers, assessment);

if (result.passed) {
  await miningEngine.mine(studentId, {
    type: 'QUIZ_PASSED',
    score: result.score,
    difficulty: assessment.level,
    metadata: { subject: assessment.subject }
  });
}
```

---

## 📊 Service Status

| Feature | Status | Notes |
|---------|--------|-------|
| AI Tutoring | ✅ Working | Requires OpenAI API key |
| Learning Paths | ✅ Working | Fully functional |
| Assessments | ✅ Working | Dynamic generation |
| Grading | ✅ Working | Automatic scoring |
| API Endpoints | ✅ Working | All routes active |
| Database | ⚠️ In-memory | Needs Prisma integration |

---

## 🚀 Next Steps

1. **Add OpenAI API Key** to `.env` for tutoring features
2. **Integrate with Database** for persistence
3. **Connect to Student Portal** frontend
4. **Link with Azora Mint** for token rewards

---

## 📝 Files Reference

```
services/azora-sapiens/
├── index.js                          # Simple entry point
├── START.sh                          # Startup script
├── TEST-SERVICE.js                   # Test suite
├── src/
│   ├── index.ts                      # TypeScript server
│   ├── engines/
│   │   ├── tutor-engine.ts          # AI tutoring
│   │   ├── learning-paths.ts        # Path generation
│   │   └── assessment-engine.ts     # Test creation
│   └── routes/
│       └── tutoringRoutes.ts        # API routes
└── IMPLEMENTATION-STATUS.md          # Full documentation
```

---

**Service Ready!** 🎉

For full documentation, see `IMPLEMENTATION-STATUS.md`
