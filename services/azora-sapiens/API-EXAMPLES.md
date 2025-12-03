# Azora Sapiens API Examples

Complete API usage examples for all Azora Sapiens endpoints.

---

## 🔐 Authentication

All endpoints require authentication token in header:
```
Authorization: Bearer <your_jwt_token>
```

---

## 💬 Real-Time Chat API

### Start Chat Session
```bash
POST /api/chat/start
Content-Type: application/json

{
  "subject": "Mathematics"
}

# Response
{
  "success": true,
  "data": {
    "sessionId": "chat_user123_1699564800000"
  }
}
```

### Send Message
```bash
POST /api/chat/message
Content-Type: application/json

{
  "sessionId": "chat_user123_1699564800000",
  "message": "Can you explain quadratic equations?"
}

# Response
{
  "success": true,
  "data": {
    "message": "Of course! A quadratic equation is...",
    "suggestions": [
      "Can you give me an example?",
      "What are the key concepts I should focus on?",
      "How can I practice this?"
    ],
    "resources": [
      "Mathematics fundamentals course",
      "Interactive Mathematics exercises",
      "Mathematics practice problems"
    ]
  }
}
```

### Get Chat History
```bash
GET /api/chat/history/chat_user123_1699564800000

# Response
{
  "success": true,
  "data": [
    {
      "role": "user",
      "content": "Can you explain quadratic equations?",
      "timestamp": "2024-11-14T10:30:00Z"
    },
    {
      "role": "assistant",
      "content": "Of course! A quadratic equation is...",
      "timestamp": "2024-11-14T10:30:05Z"
    }
  ]
}
```

---

## 🎯 Learning Path API

### Generate Personalized Learning Path
```bash
POST /api/learning-path
Content-Type: application/json

{
  "goal": "advanced",
  "studentProfile": {
    "currentLevel": "beginner",
    "interests": ["algebra", "geometry"],
    "learningStyle": "visual"
  }
}

# Response
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
      },
      {
        "level": "advanced",
        "order": 2,
        "skills": ["complex_systems", "optimization", "real_world_apps"],
        "completed": false
      }
    ],
    "estimatedDuration": 6,
    "resources": {
      "videos": 10,
      "readings": 5,
      "exercises": 20,
      "projects": 5
    },
    "assessments": [
      { "type": "quiz", "frequency": "weekly" },
      { "type": "project", "frequency": "monthly" },
      { "type": "final", "frequency": "end" }
    ]
  }
}
```

---

## 📚 Adaptive Curriculum API

### Get Curriculum Adjustments
```bash
POST /api/curriculum/adjust
Content-Type: application/json

{
  "subject": "Physics",
  "scores": [65, 70, 75, 78, 82],
  "weakAreas": ["thermodynamics", "optics"],
  "strongAreas": ["mechanics", "electricity"]
}

# Response
{
  "success": true,
  "data": {
    "studentId": "user123",
    "recommendations": [
      "Focus on weak areas: thermodynamics, optics",
      "Attempt more challenging problems"
    ],
    "focusAreas": ["thermodynamics", "optics"],
    "difficulty": "harder",
    "nextTopics": [
      "Remedial: thermodynamics",
      "Advanced: mechanics",
      "Integration exercises combining multiple concepts"
    ]
  }
}
```

---

## 📝 Assessment API

### Create Diagnostic Test
```bash
POST /api/assessment/diagnostic
Content-Type: application/json

{
  "subject": "Chemistry",
  "topics": ["atomic_structure", "chemical_bonding", "reactions"]
}

# Response
{
  "success": true,
  "data": {
    "testId": "diag_1699564800000",
    "subject": "Chemistry",
    "topics": ["atomic_structure", "chemical_bonding", "reactions"],
    "questions": 15,
    "adaptive": true
  }
}
```

### Analyze Assessment Results
```bash
POST /api/assessment/analyze
Content-Type: application/json

{
  "subject": "Chemistry",
  "topicScores": {
    "atomic_structure": 85,
    "chemical_bonding": 55,
    "reactions": 72
  }
}

# Response
{
  "success": true,
  "data": {
    "studentId": "user123",
    "subject": "Chemistry",
    "overallScore": 70.67,
    "topicScores": {
      "atomic_structure": 85,
      "chemical_bonding": 55,
      "reactions": 72
    },
    "knowledgeGaps": [
      {
        "topic": "chemical_bonding",
        "severity": "medium",
        "recommendedActions": [
          "Review chemical_bonding concepts",
          "Practice intermediate problems",
          "Join study group"
        ]
      }
    ],
    "strengths": ["atomic_structure"],
    "nextSteps": [
      "Address specific knowledge gaps",
      "Practice application problems",
      "Track progress weekly"
    ]
  }
}
```

### Create Standard Assessment
```bash
POST /api/assessment
Content-Type: application/json

{
  "subject": "Biology",
  "level": "intermediate",
  "questionCount": 15
}

# Response
{
  "success": true,
  "data": {
    "id": "assess_1699564800000",
    "subject": "Biology",
    "level": "intermediate",
    "questions": [
      {
        "id": "q_1",
        "question": "Biology question 1 at intermediate level",
        "type": "multiple_choice",
        "difficulty": "medium",
        "points": 10
      }
      // ... 14 more questions
    ],
    "timeLimit": 30,
    "passingScore": 70
  }
}
```

---

## 📊 Progress Tracking API

### Track Student Activity
```bash
POST /api/progress/track
Content-Type: application/json

{
  "type": "quiz_passed",
  "data": {
    "quizId": "quiz_123",
    "score": 85,
    "completed": true
  }
}

# Response
{
  "success": true,
  "data": {
    "studentId": "user123",
    "activity": "quiz_passed",
    "timestamp": "2024-11-14T10:30:00Z",
    "data": {
      "quizId": "quiz_123",
      "score": 85,
      "completed": true
    },
    "azrEarned": 25
  }
}
```

### Get Progress Summary
```bash
GET /api/progress/user123
Content-Type: application/json

{
  "activities": [
    // Array of previous activities
  ]
}

# Response
{
  "success": true,
  "data": {
    "totalActivities": 45,
    "totalAZR": 1250,
    "completionRate": 87.5,
    "streak": 12,
    "level": "intermediate"
  }
}
```

---

## 🎓 Complete Workflow Example

### 1. Start Learning Session
```javascript
// Start chat session
const chatResponse = await fetch('/api/chat/start', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer <token>',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ subject: 'Mathematics' })
});
const { sessionId } = await chatResponse.json();

// Generate learning path
const pathResponse = await fetch('/api/learning-path', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer <token>',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    goal: 'advanced',
    studentProfile: {
      currentLevel: 'beginner',
      interests: ['algebra'],
      learningStyle: 'visual'
    }
  })
});
const learningPath = await pathResponse.json();
```

### 2. Interactive Learning
```javascript
// Ask questions
const messageResponse = await fetch('/api/chat/message', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer <token>',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    sessionId,
    message: 'Explain linear equations'
  })
});
const tutorResponse = await messageResponse.json();
```

### 3. Take Assessment
```javascript
// Create diagnostic test
const testResponse = await fetch('/api/assessment/diagnostic', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer <token>',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    subject: 'Mathematics',
    topics: ['algebra', 'geometry', 'calculus']
  })
});
const diagnosticTest = await testResponse.json();

// Analyze results
const analysisResponse = await fetch('/api/assessment/analyze', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer <token>',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    subject: 'Mathematics',
    topicScores: {
      algebra: 85,
      geometry: 65,
      calculus: 72
    }
  })
});
const analysis = await analysisResponse.json();
```

### 4. Track Progress
```javascript
// Track activity
const progressResponse = await fetch('/api/progress/track', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer <token>',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    type: 'assessment_passed',
    data: { assessmentId: 'assess_123', score: 85, completed: true }
  })
});
const progress = await progressResponse.json();
```

### 5. Get Adaptive Recommendations
```javascript
// Get curriculum adjustments
const curriculumResponse = await fetch('/api/curriculum/adjust', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer <token>',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    subject: 'Mathematics',
    scores: [65, 70, 75, 80, 85],
    weakAreas: ['geometry'],
    strongAreas: ['algebra']
  })
});
const adjustments = await curriculumResponse.json();
```

---

## 🔧 Error Handling

All endpoints return consistent error format:

```json
{
  "success": false,
  "error": "Error message description"
}
```

Common HTTP status codes:
- `200` - Success
- `400` - Bad request (invalid input)
- `401` - Unauthorized (missing/invalid token)
- `404` - Resource not found
- `500` - Internal server error

---

## 📈 Rate Limits

- Default: 30 requests per minute per user
- Adjust in service configuration if needed

---

*Built with Ubuntu philosophy: "I can because we can"* 🌍
