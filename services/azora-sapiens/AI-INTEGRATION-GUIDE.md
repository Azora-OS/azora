# AI Integration Guide - Azora Sapiens & AI Family Service

Complete guide for GPT-4 integration with 11 AI personalities.

## Overview

Azora OS features an advanced AI system with:
- **GPT-4 Integration** - State-of-the-art language model
- **11 AI Personalities** - Each with unique expertise and communication style
- **Context Management** - Personalized learning experiences
- **Multi-Perspective Analysis** - Get insights from multiple experts

## The 11 AI Personalities

### 1. **Elara** - The Wise Mentor
- **Role**: Experienced educator and life coach
- **Expertise**: Education, mentoring, life coaching, career guidance
- **Tone**: Warm, thoughtful, encouraging
- **Best For**: Personalized learning paths, career transitions, life planning

### 2. **Themba** - The Technical Expert
- **Role**: Software engineer and technology specialist
- **Expertise**: Programming, software engineering, web development, databases
- **Tone**: Technical, precise, helpful
- **Best For**: Coding help, architecture design, debugging

### 3. **Naledi** - The Data Scientist
- **Role**: Analytics expert and data storyteller
- **Expertise**: Data science, statistics, analytics, visualization
- **Tone**: Analytical, clear, insightful
- **Best For**: Data analysis, statistical modeling, business intelligence

### 4. **Jabari** - The Business Strategist
- **Role**: Entrepreneur and business consultant
- **Expertise**: Business strategy, entrepreneurship, marketing, finance
- **Tone**: Strategic, practical, motivating
- **Best For**: Business planning, market analysis, growth strategies

### 5. **Amara** - The Creative Director
- **Role**: Artist and creative innovator
- **Expertise**: Design, art, creativity, user experience
- **Tone**: Inspiring, imaginative, encouraging
- **Best For**: Design thinking, creative projects, innovation

### 6. **Sankofa** - The Historian
- **Role**: Historian and cultural expert
- **Expertise**: History, culture, anthropology, social studies
- **Tone**: Scholarly, thoughtful, contextual
- **Best For**: Historical analysis, cultural understanding, context

### 7. **Kofi** - The Health & Wellness Coach
- **Role**: Fitness and wellness specialist
- **Expertise**: Fitness, nutrition, mental health, wellness
- **Tone**: Motivating, supportive, practical
- **Best For**: Fitness planning, nutrition, stress management

### 8. **Zola** - The Language Master
- **Role**: Linguist and communication expert
- **Expertise**: Languages, writing, communication, linguistics
- **Tone**: Clear, encouraging, precise
- **Best For**: Language learning, writing improvement, communication

### 9. **Abeni** - The Environmental Advocate
- **Role**: Sustainability and environmental expert
- **Expertise**: Sustainability, environment, climate, conservation
- **Tone**: Passionate, informed, hopeful
- **Best For**: Sustainability, environmental impact, green practices

### 10. **Thembo** - The Financial Advisor
- **Role**: Finance expert and investment advisor
- **Expertise**: Finance, investing, budgeting, wealth management
- **Tone**: Knowledgeable, practical, empowering
- **Best For**: Financial planning, investing, wealth building

### 11. **Nexus** - The AI Coordinator
- **Role**: Orchestrator of the AI family
- **Expertise**: Coordination, synthesis, routing, integration
- **Tone**: Organized, efficient, helpful
- **Best For**: Question routing, multi-perspective analysis, coordination

## Setup

### 1. Environment Variables

```bash
# .env
OPENAI_API_KEY=sk-your-api-key-here
OPENAI_MODEL=gpt-4
OPENAI_TEMPERATURE=0.7
OPENAI_MAX_TOKENS=2000
```

### 2. Install Dependencies

```bash
npm install openai
```

### 3. Initialize AI Services

```typescript
import { sendMessage } from './src/ai/openai-client';
import { getPersonality, generatePersonalityResponse } from '../ai-family-service/src/engines/personality-engine';
import { getUserContext, createConversation } from './src/ai/context-manager';
```

## Usage Examples

### Get a Response from a Specific Personality

```typescript
import { generatePersonalityResponse } from '../ai-family-service/src/engines/personality-engine';

const response = await generatePersonalityResponse(
  'themba',  // personality name
  'How do I optimize my database queries?'
);

console.log(response);
```

### Get the Best Personality for a Question

```typescript
import { getBestPersonalityForQuestion } from '../ai-family-service/src/engines/personality-engine';

const question = 'How should I structure my startup?';
const personality = getBestPersonalityForQuestion(question);
console.log(`Best personality: ${personality.name}`);
// Output: Best personality: Jabari
```

### Generate a Learning Path

```typescript
import { generateLearningPath } from './src/ai/openai-client';

const path = await generateLearningPath(
  'Alice',
  'Become a full-stack developer',
  'beginner',
  ['web development', 'JavaScript', 'databases']
);

console.log(path);
```

### Manage User Context

```typescript
import { getUserContext, updateUserContext, recordProgress } from './src/ai/context-manager';

// Get user context
const context = getUserContext('user123');

// Update preferences
updateUserContext('user123', {
  level: 'intermediate',
  interests: ['web development', 'AI'],
  preferences: {
    communicationStyle: 'technical',
    pacePreference: 'fast',
    learningStyle: 'visual',
  },
});

// Record progress
recordProgress('user123', 'JavaScript Basics', true, 95);
```

### Create a Conversation

```typescript
import { createConversation, addMessageToConversation, getConversationHistory } from './src/ai/context-manager';

// Create conversation
const conversation = createConversation('user123', 'themba', {
  topic: 'Web Development',
});

// Add messages
addMessageToConversation(conversation.sessionId, 'user', 'How do I build a REST API?');
addMessageToConversation(conversation.sessionId, 'assistant', 'Here\'s how to build a REST API...');

// Get history
const history = getConversationHistory(conversation.sessionId);
```

### Get Multi-Perspective Response

```typescript
import { getMultiPerspectiveResponse } from '../ai-family-service/src/engines/personality-engine';

const perspectives = await getMultiPerspectiveResponse(
  'What\'s the best way to learn programming?',
  ['themba', 'elara', 'amara']
);

console.log(perspectives);
// {
//   themba: "Here's a technical approach...",
//   elara: "Here's a mentoring approach...",
//   amara: "Here's a creative approach..."
// }
```

## API Endpoints

### Chat with AI Personality

```
POST /api/chat/start
{
  "userId": "user123",
  "personality": "themba",
  "message": "How do I optimize my code?"
}

Response:
{
  "sessionId": "session_...",
  "response": "Here's how to optimize your code...",
  "personality": "themba"
}
```

### Get Learning Path

```
POST /api/learning-path
{
  "userId": "user123",
  "goal": "Become a full-stack developer",
  "currentLevel": "beginner",
  "interests": ["web development", "JavaScript"]
}

Response:
{
  "path": "Week 1: HTML & CSS basics...",
  "duration": "12 weeks",
  "milestones": [...]
}
```

### Generate Assessment

```
POST /api/assessment/generate
{
  "topic": "JavaScript",
  "level": "intermediate",
  "count": 5
}

Response:
{
  "questions": [
    "1. What is a closure? A) ... B) ... C) ... D) ...",
    ...
  ]
}
```

### Analyze Performance

```
POST /api/analysis/performance
{
  "userId": "user123",
  "scores": {
    "JavaScript": 85,
    "React": 78,
    "Node.js": 92
  },
  "completedTopics": ["HTML", "CSS", "JavaScript"]
}

Response:
{
  "analysis": "You have strong backend skills...",
  "strengths": ["Node.js", "JavaScript"],
  "weaknesses": ["React"],
  "recommendations": ["Focus on React", "Build a full-stack project"]
}
```

## Best Practices

### 1. Use Context for Personalization
Always load user context before generating responses:
```typescript
const context = getUserContext(userId);
const systemPrompt = buildSystemPrompt(basePrompt, context);
```

### 2. Route Questions Intelligently
Use `getBestPersonalityForQuestion()` to automatically route:
```typescript
const personality = getBestPersonalityForQuestion(userQuestion);
const response = await generatePersonalityResponse(personality.name, userQuestion);
```

### 3. Maintain Conversation History
Keep conversation history for better context:
```typescript
const history = getConversationHistory(sessionId);
const response = await generatePersonalityResponse(personality, message, history);
```

### 4. Record Progress
Track user progress for recommendations:
```typescript
recordProgress(userId, topic, completed, score);
```

### 5. Clean Up Old Conversations
Periodically clean up old conversations:
```typescript
clearOldConversations(24); // Clear conversations older than 24 hours
```

## Performance Optimization

### Token Management
- Monitor token usage to control costs
- Use shorter prompts when possible
- Batch requests when appropriate

### Caching
- Cache frequently asked questions
- Store generated learning paths
- Reuse conversation contexts

### Rate Limiting
- Implement rate limiting per user
- Queue requests during peak times
- Use exponential backoff for retries

## Error Handling

```typescript
try {
  const response = await generatePersonalityResponse(personality, message);
} catch (error) {
  if (error.code === 'rate_limit_exceeded') {
    // Handle rate limiting
  } else if (error.code === 'invalid_api_key') {
    // Handle auth error
  } else {
    // Handle other errors
  }
}
```

## Monitoring

Track AI usage:
- Requests per personality
- Average response time
- Token usage
- Error rates
- User satisfaction

## Troubleshooting

### API Key Issues
```bash
# Verify API key
echo $OPENAI_API_KEY

# Test connection
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"
```

### Rate Limiting
- Implement exponential backoff
- Queue requests
- Use batch processing

### Token Limits
- Reduce context window
- Summarize long conversations
- Use shorter prompts

## Support

- OpenAI Docs: https://platform.openai.com/docs/
- API Reference: https://platform.openai.com/docs/api-reference/
- Azora Specs: `.kiro/specs/observability/`

---

**Status**: Phase 5 Complete - AI Integration Ready
