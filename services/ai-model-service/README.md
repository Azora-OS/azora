# AI Model Service

A comprehensive AI model management service for Azora OS with constitutional compliance, versioning, fallback strategies, and performance monitoring.

## Features

- **Constitutional AI Model Selection**: Models selected based on constitutional compliance scores
- **Intelligent Fallback System**: Automatic fallback to compliant models when primary models fail
- **Circuit Breaker Protection**: Prevents cascade failures with circuit breaker patterns
- **Performance Monitoring**: Real-time health monitoring and metrics collection
- **Constitutional Evaluation**: Continuous evaluation of AI model constitutional compliance
- **Version Management**: Model versioning with backward compatibility
- **Cost Optimization**: Intelligent model selection based on cost-performance balance

## Constitutional Compliance

All models are evaluated against Azora's constitutional framework:

- **Constitutional Score**: Overall compliance with Azora Constitution (minimum 85%)
- **PIVC Score**: Proven Positive Impact Value Creation (minimum 80%)
- **Sovereignty Score**: User sovereignty and privacy protection (minimum 85%)

## API Endpoints

### Health Check
```
GET /health
```

### Available Models
```
GET /models
```
Returns all available models with their constitutional scores and capabilities.

### Model Selection
```
POST /select-model
```
Selects the optimal model for a given task based on constitutional priorities.

**Request Body:**
```json
{
  "task": "chat",
  "priority": "constitutional",
  "userId": "user123",
  "requiredCapabilities": ["constitutional"],
  "excludeModels": ["gpt-3.5-turbo"]
}
```

### Model Health
```
GET /health/:modelId
```
Get health status and metrics for a specific model.

### Constitutional Evaluation
```
POST /evaluate-constitutional
```
Evaluate a model's constitutional compliance for a specific interaction.

**Request Body:**
```json
{
  "modelId": "elara-omega-v2",
  "interaction": "Please analyze this constitutional question..."
}
```

### Model Metrics
```
GET /metrics/:modelId?period=24h
```
Get performance and constitutional metrics for a model.

## Model Selection Priorities

- **constitutional**: Prioritizes highest constitutional compliance scores
- **performance**: Balances constitutional compliance with performance
- **cost**: Optimizes for cost efficiency while maintaining minimum constitutional standards
- **balanced**: Balanced approach across all factors

## Circuit Breaker Protection

Each model has a circuit breaker that:
- Opens after 50% failure rate
- Times out after 30 seconds
- Resets after 30 seconds of stability
- Prevents cascade failures

## Constitutional Monitoring

The service continuously monitors:
- **Truth Accuracy**: Factual correctness of AI outputs
- **Ethical Compliance**: Adherence to constitutional ethical standards
- **Sovereignty Protection**: User privacy and data sovereignty
- **PIVC Impact**: Positive impact creation and value generation

## Database Schema

### Model Selections
Tracks model selection decisions with constitutional reasoning.

### Model Health
Monitors model performance, success rates, and circuit breaker status.

### Constitutional Evaluations
Stores constitutional compliance evaluations for auditing.

### Model Versions
Manages model versions with constitutional scores.

### Model Fallbacks
Defines fallback hierarchies for model resilience.

## Usage Examples

### Select Constitutional Model
```javascript
const response = await fetch('http://localhost:3007/select-model', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    task: 'constitutional',
    priority: 'constitutional',
    requiredCapabilities: ['constitutional']
  })
});

const result = await response.json();
// Returns: { modelId: 'elara-omega-v2', config: {...}, reasoning: '...' }
```

### Evaluate Constitutional Compliance
```javascript
const response = await fetch('http://localhost:3007/evaluate-constitutional', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    modelId: 'elara-omega-v2',
    interaction: 'Discuss the importance of AI constitutional compliance'
  })
});

const evaluation = await response.json();
// Returns constitutional scores and compliance metrics
```

### Check Model Health
```javascript
const response = await fetch('http://localhost:3007/health/elara-omega-v2');
const health = await response.json();
// Returns circuit breaker status, request counts, success rates
```

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
docker build -t azora/ai-model-service .

# Run container
docker run -p 3007:3007 \
  -e DATABASE_URL="postgresql://..." \
  azora/ai-model-service
```

## Environment Variables

```env
DATABASE_URL=postgresql://username:password@localhost:5432/ai_model_service
PORT=3007
NODE_ENV=production
```

## Monitoring

The service integrates with Azora Sage for constitutional monitoring and provides:

- Real-time constitutional compliance dashboards
- Model performance and health metrics
- Alert system for constitutional violations
- Audit trails for all model selections and evaluations

## Constitutional Guarantees

- **Minimum Constitutional Score**: 85% for all active models
- **Automatic Fallback**: Constitutional models always available
- **Continuous Evaluation**: Models re-evaluated regularly
- **Human Oversight**: Critical decisions require human review
- **Audit Compliance**: All decisions logged and auditable

## Security

- Input validation with Joi schemas
- Rate limiting and circuit breaker protection
- Constitutional compliance verification
- Audit logging for all operations
- Secure database connections

This service ensures Azora OS always uses AI models that align with constitutional principles, providing reliable, ethical, and sovereignty-respecting AI capabilities.