# Premium Service Implementation Template

This document defines the standard for implementing premium services in the Azora ecosystem.

## Service Structure

```
service-name/
├── Dockerfile
├── README.md
├── server.js
├── healthcheck.js
├── jest.config.js
├── package.json
├── index.js
└── __tests__/
    └── service-name.test.js
```

## Required Components

### 1. package.json
- All required dependencies listed
- Proper scripts for start, dev, test, and health
- Correct versioning and metadata

### 2. index.js (Main Service Implementation)
- Express.js application with proper middleware
- Environment variable configuration
- Comprehensive logging with Winston
- UUID generation for unique identifiers
- In-memory data structures (Map) for storage
- Complete API endpoints with:
  - Proper HTTP status codes
  - Error handling and validation
  - Consistent response format
  - Input sanitization
- Health check endpoint
- 404 and error handling middleware

### 3. server.js
- Entry point that imports and starts the application
- Simple console log to indicate service startup

### 4. Dockerfile
- Node.js 20-alpine base image
- Proper working directory setup
- Dependency installation with npm ci
- Non-root user creation for security
- Exposed port matching service configuration
- Health check implementation
- Proper CMD instruction

### 5. healthcheck.js
- Simple HTTP request to /health endpoint
- Proper exit codes for success/failure
- Error handling

### 6. jest.config.js
- Proper test environment configuration
- Test file matching patterns
- Coverage configuration
- Timeout settings

### 7. README.md
- Service description and features
- Complete API endpoint documentation
- Installation and usage instructions
- Environment variable documentation
- Contributing guidelines
- License information

### 8. __tests__/service-name.test.js
- Comprehensive test coverage for all endpoints
- Health check testing
- Positive and negative test cases
- Proper test structure with describe/it blocks
- Mock data where appropriate
- Assertions for expected responses

## Implementation Standards

### Code Quality
- Consistent code formatting
- Proper error handling with try/catch blocks
- Meaningful variable and function names
- Comprehensive logging
- Input validation on all endpoints
- Proper HTTP status codes
- Consistent response format

### Security
- Helmet middleware for HTTP header security
- CORS configuration
- Compression middleware
- Input sanitization
- Non-root user in Docker container

### Performance
- Compression middleware
- Efficient data structures
- Proper error handling to prevent crashes

### Monitoring
- Winston logging with appropriate levels
- Health check endpoint
- Docker health check

## API Design Principles

### Endpoint Structure
- RESTful resource naming
- Consistent path parameter usage
- Proper HTTP method usage (GET, POST, PUT, DELETE)
- Query parameter handling

### Response Format
```json
{
  "success": true,
  "data": {},
  "count": 0
}
```

### Error Format
```json
{
  "error": "Error message"
}
```

## Testing Requirements

### Test Coverage
- Health check endpoint
- All GET endpoints with and without data
- All POST endpoints with valid and invalid data
- All PUT endpoints with valid and invalid data
- Error cases (404, 400, 500)
- Edge cases

### Test Structure
- Proper setup and teardown
- Mock data where needed
- Clear test descriptions
- Appropriate assertions

## Documentation Standards

### README.md Requirements
- Clear service description
- Feature list
- Complete API documentation
- Installation instructions
- Environment variables
- Contributing guidelines
- License information

## Deployment Standards

### Docker Standards
- Multi-stage builds for production
- Non-root user
- Proper health checks
- Security best practices
- Efficient layering

## Quality Assurance Checklist

Before considering a service complete, ensure all of the following are implemented:

- [ ] Proper package.json with all dependencies
- [ ] Complete index.js implementation with all required features
- [ ] server.js entry point
- [ ] Dockerfile with health checks
- [ ] healthcheck.js script
- [ ] jest.config.js test configuration
- [ ] Comprehensive README.md documentation
- [ ] Full test suite with good coverage
- [ ] All endpoints implemented with proper error handling
- [ ] Consistent response format across all endpoints
- [ ] Proper logging throughout the application
- [ ] Input validation on all endpoints
- [ ] Security middleware implementation
- [ ] Health check endpoint
- [ ] 404 and error handling middleware
- [ ] All tests passing
- [ ] No linter errors
- [ ] Proper file structure
- [ ] Docker container builds successfully
- [ ] Health check passes in container

This template ensures that all premium services in the Azora ecosystem meet the highest standards of quality, security, and maintainability.