# Personalization Engine Service

AI-powered personalization and recommendation engine for Azora OS, providing adaptive learning experiences, personalized content recommendations, and intelligent user profiling.

## Features

- **User Profiling**: Comprehensive learner profiling with personality vectors, skill assessments, and preference analysis
- **Multi-Algorithm Recommendations**: Content-based, collaborative filtering, trending, and sequential recommendations
- **Adaptive Learning Paths**: Personalized curriculum creation with difficulty scaling and pace adjustment
- **Real-time Interaction Tracking**: Engagement scoring, sentiment analysis, and behavioral analytics
- **Achievement System**: Gamified learning with unlockable achievements and progress tracking
- **Constitutional AI Integration**: Ethical AI recommendations aligned with Azora's constitutional framework
- **Machine Learning Models**: Collaborative filtering, content-based filtering, and hybrid recommendation systems

## Core Components

### User Profiling Engine
- **Personality Analysis**: Learning style assessment (visual, auditory, kinesthetic)
- **Skill Vector Generation**: Multi-dimensional skill assessment and tracking
- **Preference Learning**: Dynamic preference vector updates based on interactions
- **Behavioral Analytics**: Engagement scoring and interaction pattern analysis

### Recommendation Algorithms

#### Content-Based Filtering
- TF-IDF analysis of user interests and content topics
- Cosine similarity for content matching
- Personalized content recommendations based on user profile

#### Collaborative Filtering
- User similarity analysis using interaction patterns
- Matrix factorization for recommendation generation
- Similar user behavior prediction

#### Trending & Sequential
- Real-time trending content identification
- Learning path progression recommendations
- Context-aware next-best-content suggestions

### Adaptive Learning Paths
- **Personalized Curriculum**: Custom module ordering based on learning style
- **Difficulty Scaling**: Adaptive difficulty adjustment based on user performance
- **Pace Optimization**: Time estimation and scheduling based on user preferences
- **Progress Tracking**: Real-time progress monitoring and milestone achievements

### Achievement System
- **Completion Badges**: Course and module completion achievements
- **Streak Rewards**: Consistent learning streak tracking
- **Skill Mastery**: Competency-based achievement unlocking
- **Social Recognition**: Community and peer achievement sharing

## API Endpoints

### User Profiling
```
POST /api/profile
```
Create or update user profile with learning preferences and demographics.

**Request Body:**
```json
{
  "userId": "user123",
  "age": 25,
  "learningStyle": "VISUAL",
  "experienceLevel": "INTERMEDIATE",
  "preferredPace": "MODERATE",
  "interests": ["AI", "Web Development", "Data Science"],
  "careerGoals": ["Become a full-stack developer"],
  "learningObjectives": ["Master React", "Learn machine learning"]
}
```

```
GET /api/profile/:userId
```
Retrieve comprehensive user profile with analytics and recent activity.

### Interaction Tracking
```
POST /api/interactions
```
Track user interactions for personalization and analytics.

**Request Body:**
```json
{
  "userId": "user123",
  "interactionType": "COMPLETE",
  "contentType": "LESSON",
  "contentId": "lesson456",
  "timeSpent": 1800,
  "completionRate": 0.95,
  "rating": 5,
  "feedback": "Excellent lesson with great examples",
  "clicksCount": 15,
  "scrollDepth": 0.85
}
```

### Recommendations
```
GET /api/recommendations/:userId?limit=10&type=content_based
```
Get personalized content recommendations.

**Query Parameters:**
- `limit`: Number of recommendations (default: 10)
- `type`: Recommendation type (content_based, collaborative, trending, sequential)
- `context`: Additional context for contextual recommendations

**Response:**
```json
[
  {
    "type": "CONTENT_BASED",
    "contentId": "content123",
    "contentType": "LESSON",
    "title": "Advanced React Patterns",
    "relevanceScore": 0.89,
    "confidenceScore": 0.76,
    "reason": "Based on your interest in React and previous interactions"
  }
]
```

```
POST /api/recommendations/:userId/feedback
```
Record user feedback on recommendations for model improvement.

### Learning Paths
```
POST /api/learning-paths
```
Create personalized learning path.

**Request Body:**
```json
{
  "userId": "user123",
  "title": "Full-Stack Web Development",
  "topic": "Web Development",
  "level": "INTERMEDIATE",
  "modules": [
    {
      "id": "module1",
      "title": "React Fundamentals",
      "type": "LESSON",
      "duration": 3600,
      "prerequisites": []
    }
  ],
  "estimatedDuration": 28800
}
```

```
PUT /api/learning-paths/:pathId/progress
```
Update learning path progress.

### Achievements
```
GET /api/achievements/:userId
```
Get user achievements and progress.

```
POST /api/achievements/:userId/:achievementId/claim
```
Claim unlocked achievement.

### Analytics
```
GET /api/analytics?period=7d&metric=engagement
```
Get personalization analytics and metrics.

**Query Parameters:**
- `period`: Time period (1d, 7d, 30d, 90d)
- `metric`: Specific metric (users, engagement, recommendations, learning_paths)

## Machine Learning Models

### Collaborative Filtering Model
- **Algorithm**: Matrix Factorization with SVD
- **Input**: User-item interaction matrix
- **Output**: Predicted user preferences for unseen items
- **Training**: Daily retraining with new interaction data

### Content-Based Model
- **Algorithm**: TF-IDF + Cosine Similarity
- **Features**: Content topics, user interests, skill requirements
- **Similarity Measures**: Topic overlap, skill alignment, difficulty matching

### Hybrid Model
- **Algorithm**: Weighted combination of collaborative and content-based
- **Weight Optimization**: Dynamic weighting based on user behavior
- **Fallback Strategy**: Content-based when collaborative data is sparse

## Data Processing Pipeline

### Real-time Processing
1. **Interaction Ingestion**: Raw interaction data collection
2. **Feature Extraction**: Engagement scoring, sentiment analysis, behavioral metrics
3. **Real-time Updates**: User profile and preference vector updates
4. **Recommendation Generation**: Immediate recommendation updates

### Batch Processing
1. **Model Retraining**: Daily model updates with accumulated data
2. **Similarity Computation**: Content and user similarity matrix updates
3. **Analytics Aggregation**: Daily and weekly metric calculations
4. **Performance Evaluation**: Model accuracy and effectiveness assessment

## Personalization Algorithms

### User Similarity Calculation
```javascript
// Cosine similarity between user vectors
cosineSimilarity = (vecA, vecB) => {
  const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
  return dotProduct / (magnitudeA * magnitudeB);
};
```

### Content Recommendation Scoring
```javascript
// Multi-factor recommendation scoring
recommendationScore = (
  relevanceWeight * contentRelevance +
  collaborativeWeight * userSimilarity +
  trendingWeight * popularityScore +
  contextualWeight * contextMatch
);
```

### Adaptive Difficulty Scaling
```javascript
// Dynamic difficulty adjustment
adaptiveDifficulty = baseDifficulty * (
  1 +
  performanceFactor * (targetPerformance - actualPerformance) +
  timeFactor * (estimatedTime - actualTime) +
  engagementFactor * engagementScore
);
```

## Queue System

The service uses Redis-backed queues for:

- **Recommendation Queue**: Async recommendation generation
- **Analytics Queue**: Background analytics processing
- **Model Training Queue**: Scheduled model retraining jobs
- **Notification Queue**: Achievement and milestone notifications

## Caching Strategy

### Multi-level Caching
- **Memory Cache**: Node-cache for frequently accessed profiles and recommendations
- **Redis Cache**: Distributed caching for user sessions and computed recommendations
- **Database Cache**: Query result caching for analytics and historical data

### Cache Invalidation
- **Time-based**: Automatic expiration based on data freshness requirements
- **Event-based**: Invalidation on profile updates and new interactions
- **LRU Policy**: Least recently used eviction for memory constraints

## Monitoring & Analytics

### Real-time Metrics
- **User Engagement**: Session duration, interaction frequency, completion rates
- **Recommendation Performance**: Click-through rates, conversion rates, user satisfaction
- **System Performance**: Response times, queue depths, error rates
- **Model Accuracy**: Precision, recall, F1-score for recommendation models

### Business Intelligence
- **Learning Analytics**: Skill progression, learning path completion, knowledge gaps
- **User Segmentation**: Clustering based on behavior patterns and preferences
- **Content Performance**: Popular topics, engagement by content type, difficulty analysis
- **Personalization Effectiveness**: A/B testing results, recommendation impact analysis

## Security & Privacy

### Data Protection
- **PII Handling**: Secure storage and processing of personal information
- **Anonymization**: Data anonymization for analytics and model training
- **Consent Management**: User preference and data usage consent tracking
- **Audit Logging**: Comprehensive logging of all personalization activities

### Ethical AI
- **Bias Detection**: Regular audits for recommendation bias and fairness
- **Transparency**: Explainable AI with recommendation reasoning
- **User Control**: Opt-out options and preference override capabilities
- **Constitutional Compliance**: Alignment with Azora's AI ethics framework

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
docker build -t azora/personalization-engine .

# Run container
docker run -p 3009:3009 \
  -e DATABASE_URL="postgresql://..." \
  -e REDIS_HOST="redis" \
  azora/personalization-engine
```

## Environment Variables

```env
DATABASE_URL=postgresql://username:password@localhost:5432/personalization
REDIS_HOST=localhost
REDIS_PORT=6379
PORT=3009
NODE_ENV=production

# AI Model Configuration
OPENAI_API_KEY=your_openai_key
AI_MODEL_SERVICE_URL=http://ai-model-service:3006

# Queue Configuration
RECOMMENDATION_QUEUE_CONCURRENCY=5
ANALYTICS_QUEUE_CONCURRENCY=3
```

## Dependencies

- **AI Model Service**: Constitutional AI model selection and validation
- **OpenAI Service**: Content generation and analysis
- **Content Generation Service**: Educational content creation
- **User Service**: User profile and authentication data
- **Redis**: Caching and job queues
- **PostgreSQL**: Primary data storage

## Performance Optimization

### Database Optimization
- **Indexing Strategy**: Optimized indexes for recommendation queries
- **Query Caching**: Prepared statements and result caching
- **Connection Pooling**: Efficient database connection management

### Algorithm Optimization
- **Approximate Methods**: Fast approximate similarity for real-time recommendations
- **Incremental Updates**: Progressive model updates instead of full retraining
- **Parallel Processing**: Multi-threaded recommendation generation

### Scalability Features
- **Horizontal Scaling**: Stateless service design for easy scaling
- **Load Balancing**: Distributed recommendation processing
- **Data Partitioning**: User-based data partitioning for performance

This personalization engine enables Azora OS to deliver truly personalized learning experiences, adapting to each user's unique needs, preferences, and learning journey while maintaining ethical AI standards and constitutional compliance.