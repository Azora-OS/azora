# Service Documentation Template

> Use this template to create comprehensive README files for all Azora services

## Template Structure

```markdown
# [Service Name]

> **[Brief Description]** - [One-line purpose]

[![Status](https://img.shields.io/badge/status-production-success.svg)](../../docs/STATUS-DASHBOARD.md)
[![Port](https://img.shields.io/badge/port-[PORT]-blue.svg)](#configuration)
[![Tests](https://img.shields.io/badge/tests-passing-brightgreen.svg)](#testing)

## Overview

[Detailed description of what the service does, its role in the ecosystem, and key responsibilities]

### Key Features

- **[Feature 1]**: [Description]
- **[Feature 2]**: [Description]
- **[Feature 3]**: [Description]
- **[Feature 4]**: [Description]

## Architecture

\`\`\`mermaid
graph TB
    Client[Client] --> Service[This Service]
    Service --> Dependency1[Dependency 1]
    Service --> Dependency2[Dependency 2]
    Service --> DB[(Database)]
\`\`\`

## API Endpoints

### [Endpoint Category 1]

#### \`[METHOD] /api/[endpoint]\`
[Description of what this endpoint does]

**Request Body:**
\`\`\`json
{
  "field1": "value1",
  "field2": "value2"
}
\`\`\`

**Response (Success):**
\`\`\`json
{
  "success": true,
  "data": {
    "id": "123",
    "field": "value"
  }
}
\`\`\`

**Response (Error):**
\`\`\`json
{
  "error": "Error message",
  "code": "ERROR_CODE"
}
\`\`\`

### [Endpoint Category 2]

[Repeat for each endpoint]

### Health Check

#### \`GET /health\`
Service health check endpoint.

**Response:**
\`\`\`json
{
  "status": "healthy",
  "service": "[service-name]",
  "timestamp": "2025-11-25T18:00:00.000Z"
}
\`\`\`

## Configuration

### Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| \`PORT\` | Service port | \`[PORT]\` | No |
| \`NODE_ENV\` | Environment | \`development\` | No |
| \`DATABASE_URL\` | Database connection string | - | Yes |
| \`[OTHER_VAR]\` | [Description] | - | Yes/No |

### Example \`.env\` File

\`\`\`bash
PORT=[PORT]
NODE_ENV=production
DATABASE_URL=postgresql://user:password@localhost:5432/azora
[OTHER_VAR]=value
\`\`\`

## Database Schema

[If applicable, describe the database schema]

\`\`\`prisma
model [ModelName] {
  id        String   @id @default(uuid())
  field1    String
  field2    Int
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
\`\`\`

## Dependencies

### Core Services
- **[service-1]**: [Purpose]
- **[service-2]**: [Purpose]

### External Dependencies
- [Technology] [Version]+
- [Technology] [Version]+

## Development

### Local Setup

\`\`\`bash
# Install dependencies
npm install

# [If applicable] Generate Prisma client
npm run prisma:generate

# [If applicable] Run database migrations
npm run prisma:migrate

# Start development server
npm run dev
\`\`\`

### Running Tests

\`\`\`bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage
\`\`\`

## Testing

### Test Coverage
- **Lines**: [X]%
- **Functions**: [X]%
- **Branches**: [X]%

### Test Scenarios
- ✅ [Test scenario 1]
- ✅ [Test scenario 2]
- ✅ [Test scenario 3]

## Deployment

### Docker

\`\`\`bash
# Build image
docker build -t azora/[service-name]:latest .

# Run container
docker run -p [PORT]:[PORT] \\
  -e DATABASE_URL=postgresql://... \\
  azora/[service-name]:latest
\`\`\`

### Docker Compose

\`\`\`yaml
services:
  [service-name]:
    build: .
    ports:
      - "[PORT]:[PORT]"
    environment:
      - DATABASE_URL=\${DATABASE_URL}
    depends_on:
      - postgres
\`\`\`

## Monitoring

### Health Checks
- Endpoint: \`GET /health\`
- Interval: 30 seconds
- Timeout: 5 seconds

### Metrics
- [Metric 1]: [Description]
- [Metric 2]: [Description]
- [Metric 3]: [Description]

### Logging
Uses Winston for structured logging:
- **info**: General operational messages
- **warn**: Non-critical issues
- **error**: Critical failures

## Troubleshooting

### Common Issues

**[Issue 1]**
- [Symptom]
- [Solution]

**[Issue 2]**
- [Symptom]
- [Solution]

## Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md) for development guidelines.

## License

Proprietary - Azora ES (Pty) Ltd

---

**Ubuntu Philosophy**: "[Service-specific Ubuntu message]"
```

## Quick Start Guide

### 1. Copy Template

```bash
# Copy template to your service directory
cp docs/templates/SERVICE-README-TEMPLATE.md services/your-service/README.md
```

### 2. Fill in Placeholders

Replace all placeholders in square brackets:
- `[Service Name]` - e.g., "AI Orchestrator Service"
- `[Brief Description]` - e.g., "AI coordination hub"
- `[PORT]` - e.g., "3014"
- `[METHOD]` - e.g., "GET", "POST", "PUT", "DELETE"
- `[endpoint]` - e.g., "models", "users", "transactions"

### 3. Add Service-Specific Content

- Document all API endpoints
- Add architecture diagrams
- List all environment variables
- Include database schema (if applicable)
- Add troubleshooting tips

### 4. Review Checklist

- [ ] All API endpoints documented
- [ ] Environment variables listed
- [ ] Architecture diagram included
- [ ] Test coverage documented
- [ ] Deployment instructions included
- [ ] Troubleshooting section filled
- [ ] Ubuntu philosophy message added

## Examples

See these services for reference:
- [ai-orchestrator](../../services/ai-orchestrator/README.md) - Complex service with many endpoints
- [azora-auth](../../services/azora-auth/README.md) - Simple authentication service
- [chaos-monkey](../../services/chaos-monkey/README.md) - Infrastructure service
- [phoenix-server](../../services/phoenix-server/README.md) - Recovery service

## Tips

1. **Be Comprehensive**: Include all necessary information
2. **Be Clear**: Use simple, direct language
3. **Be Consistent**: Follow the template structure
4. **Be Visual**: Add diagrams where helpful
5. **Be Practical**: Include real examples
6. **Be Updated**: Keep documentation current

## Automation

### Generate README from Code

```bash
# Auto-generate README skeleton
npm run docs:generate -- --service=your-service

# This will:
# - Scan package.json for metadata
# - Extract API endpoints from code
# - Generate environment variables list
# - Create basic README structure
```

### Validate README

```bash
# Check if README follows template
npm run docs:validate -- --service=your-service

# This will check for:
# - Required sections
# - Proper formatting
# - Valid links
# - Complete API documentation
```

---

**Documentation Philosophy**: "Clear documentation enables rapid onboarding and confident development"
