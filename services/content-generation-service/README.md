# Content Generation Service

AI-powered content generation pipelines for Azora OS educational materials, personalized learning paths, and adaptive content creation.

## Features

- **Multi-Type Content Generation**: Lessons, quizzes, learning paths, personalized content
- **Constitutional AI Integration**: Uses constitutionally-compliant AI models
- **Queue-Based Processing**: Asynchronous content generation with job queues
- **Personalized Learning Paths**: Adaptive curriculum based on learner profiles
- **Content Analytics**: Usage tracking and effectiveness metrics
- **Template System**: Structured content generation with customizable templates
- **Feedback Integration**: User feedback for continuous content improvement

## Content Types

### Lessons
Structured educational content with:
- Learning objectives
- Introduction and main content
- Practical examples
- Practice exercises
- Summaries and assessments

### Quizzes
Assessment content with:
- Multiple-choice questions
- Answer keys with explanations
- Difficulty scaling
- Topic coverage validation

### Learning Paths
Comprehensive curricula with:
- Module sequencing
- Prerequisite mapping
- Time estimations
- Learning outcome definitions

### Personalized Content
Adaptive materials with:
- Learner profile analysis
- Custom content adaptation
- Progress tracking
- Individualized recommendations

## API Endpoints

### Health Check
```
GET /health
```

### Generate Content
```
POST /generate
```
Generate educational content asynchronously.

**Request Body:**
```json
{
  "type": "lesson",
  "topic": "Machine Learning Fundamentals",
  "level": "intermediate",
  "learnerProfile": {
    "learningStyle": "visual",
    "interests": ["AI", "data science"]
  },
  "userId": "user123",
  "priority": "high"
}
```

### Generate Learning Path
```
POST /learning-path
```
Create personalized learning paths.

**Request Body:**
```json
{
  "topic": "Web Development",
  "learnerId": "learner456",
  "currentLevel": "beginner",
  "goals": ["Build full-stack applications", "Master modern frameworks"],
  "timeCommitment": "moderate",
  "preferences": {
    "pace": "steady",
    "focus": "practical"
  }
}
```

### Job Status
```
GET /job/:jobId?queue=content
```
Check the status of content generation jobs.

### Get Generated Content
```
GET /content/:contentId
```
Retrieve generated content by ID.

### Learning Paths
```
GET /learning-paths/:learnerId
```
Get all learning paths for a learner.

### Content Analytics
```
GET /analytics?period=7d
```
Get content generation analytics and metrics.

## Queue System

The service uses Redis-backed queues for:

- **Content Generation Queue**: Handles lesson, quiz, and content generation
- **Learning Path Queue**: Manages personalized curriculum creation
- **Priority Processing**: High, normal, and low priority job processing
- **Job Monitoring**: Real-time job status and progress tracking

## Constitutional AI Integration

All content generation uses:

- **Model Selection**: Constitutional AI model selection service
- **Compliance Monitoring**: Continuous constitutional evaluation
- **Ethical Guidelines**: Content aligned with Azora's ethical framework
- **Bias Prevention**: Multi-model validation for bias detection
- **Truth Verification**: Factual accuracy checking

## Personalization Engine

### Learner Profiling
- Learning style assessment (visual, auditory, kinesthetic)
- Current skill level evaluation
- Interest area identification
- Preferred pace and commitment level

### Adaptive Content
- Difficulty scaling based on learner progress
- Content adaptation for different learning styles
- Personalized examples and exercises
- Progress-based content unlocking

### Learning Path Optimization
- Prerequisite analysis and sequencing
- Time estimation based on learner history
- Goal alignment and milestone setting
- Progress tracking and adjustment

## Template System

### Content Templates
Structured templates for consistent quality:

```javascript
const lessonTemplate = {
  structure: ['objectives', 'introduction', 'content', 'examples', 'exercises', 'summary'],
  prompts: {
    objectives: "Create measurable learning objectives for {topic}",
    introduction: "Write engaging introduction for {topic} at {level} level",
    // ... more prompts
  }
};
```

### Customization
- Template versioning and updates
- Custom prompts for specific topics
- Multi-language template support
- Accessibility-compliant content generation

## Analytics & Metrics

### Content Performance
- Generation success rates
- Content usage and completion statistics
- User engagement and time spent
- Rating and feedback analysis

### Learning Effectiveness
- Learning path completion rates
- Assessment performance trends
- Skill progression tracking
- Goal achievement metrics

### AI Model Performance
- Token usage and cost tracking
- Response time and reliability metrics
- Constitutional compliance scores
- Model selection effectiveness

## Development

```bash
# Install dependencies
npm install

# Generate Prisma client
npm run db:generate

# Run database migrations
npm run db:migrate

# Start development server
npm run dev

# Run tests
npm test
```

## Docker

```bash
# Build image
docker build -t azora/content-generation-service .

# Run container
docker run -p 3008:3008 \
  -e DATABASE_URL="postgresql://..." \
  -e REDIS_HOST="redis" \
  azora/content-generation-service
```

## Environment Variables

```env
DATABASE_URL=postgresql://username:password@localhost:5432/content_generation
REDIS_HOST=localhost
REDIS_PORT=6379
PORT=3008
NODE_ENV=production
```

## Dependencies

- **AI Model Service**: For constitutional model selection
- **OpenAI Service**: For content generation
- **User Service**: For learner profile data
- **Redis**: For job queues
- **PostgreSQL**: For data persistence

## Monitoring

The service provides comprehensive monitoring:

- Health checks and service status
- Queue depth and processing metrics
- Content generation success rates
- Constitutional compliance monitoring
- Performance and usage analytics

## Security

- Input validation and sanitization
- Rate limiting and abuse prevention
- User authentication and authorization
- Content safety filtering
- Audit logging for all operations

This service enables Azora OS to provide personalized, high-quality educational content at scale while maintaining constitutional AI principles and ethical standards.