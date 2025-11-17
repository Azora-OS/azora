# Premium Service Development Format for Amazon Q Agents

This document defines the comprehensive format and task structure for implementing premium services in the Azora ecosystem. Amazon Q agents should follow this format to ensure consistent, high-quality service implementations.

## Service Development Task Structure

Each premium service implementation should be broken down into the following tasks:

### 1. Service Planning and Design
- [ ] Define service purpose and core functionality
- [ ] Identify target users and use cases
- [ ] Design API endpoints and data models
- [ ] Determine integration points with other services
- [ ] Plan security and authentication requirements
- [ ] Define performance and scalability requirements

### 2. Core Implementation
- [ ] Create service directory structure
- [ ] Implement main service logic in index.js
- [ ] Set up Express.js application with middleware
- [ ] Implement environment variable configuration
- [ ] Add Winston logging with appropriate levels
- [ ] Implement in-memory data structures or database connections
- [ ] Create complete API endpoints with proper error handling
- [ ] Add input validation and sanitization
- [ ] Implement authentication and authorization middleware
- [ ] Add health check endpoint

### 3. Advanced Features Implementation
- [ ] Implement service-specific business logic
- [ ] Add integration with shared services (logging, middleware, etc.)
- [ ] Implement data persistence (if required)
- [ ] Add real-time capabilities (if required)
- [ ] Implement caching mechanisms (if required)
- [ ] Add notification systems (if required)

### 4. Quality Assurance
- [ ] Write comprehensive unit tests
- [ ] Implement integration tests
- [ ] Add performance tests (if required)
- [ ] Conduct security review
- [ ] Verify error handling and edge cases
- [ ] Test all API endpoints with positive and negative cases

### 5. Documentation and Deployment
- [ ] Create comprehensive README.md
- [ ] Document all API endpoints
- [ ] Provide installation and setup instructions
- [ ] Document environment variables
- [ ] Create Dockerfile for containerization
- [ ] Implement health check script
- [ ] Create deployment configuration files

## Required Service Components

### 1. Directory Structure
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

### 2. package.json Requirements
- All required dependencies listed with specific versions
- Proper scripts for start, dev, test, and health
- Correct versioning following semantic versioning
- Service metadata including name, description, and author
- License information

### 3. index.js (Main Service Implementation)
- Express.js application with proper middleware configuration
- Environment variable configuration using dotenv
- Comprehensive logging with Winston
- UUID generation for unique identifiers
- Data storage implementation (in-memory Maps/Sets or database connections)
- Complete API endpoints with:
  - Proper HTTP status codes
  - Error handling with try/catch blocks
  - Consistent response format
  - Input validation and sanitization
- Health check endpoint at `/health`
- 404 and error handling middleware
- Service startup logging

### 4. server.js
- Entry point that imports and starts the application
- Simple console log to indicate service startup
- Port configuration from environment variables

### 5. Dockerfile
- Node.js 20-alpine base image
- Proper working directory setup
- Dependency installation with npm ci
- Non-root user creation for security
- Exposed port matching service configuration
- Health check implementation
- Proper CMD instruction

### 6. healthcheck.js
- Simple HTTP request to /health endpoint
- Proper exit codes for success/failure
- Error handling with appropriate logging

### 7. jest.config.js
- Proper test environment configuration
- Test file matching patterns
- Coverage configuration
- Timeout settings appropriate for the service

### 8. README.md
- Service description and features
- Complete API endpoint documentation with examples
- Installation and usage instructions
- Environment variable documentation
- Contributing guidelines
- License information

### 9. __tests__/service-name.test.js
- Comprehensive test coverage for all endpoints
- Health check endpoint testing
- Positive and negative test cases
- Proper test structure with describe/it blocks
- Mock data where appropriate
- Assertions for expected responses and side effects

## Implementation Standards

### Code Quality
- Consistent code formatting following project standards
- Proper error handling with try/catch blocks
- Meaningful variable and function names
- Comprehensive logging at appropriate levels
- Input validation on all endpoints
- Proper HTTP status codes
- Consistent response format across all endpoints

### Security
- Helmet middleware for HTTP header security
- CORS configuration
- Compression middleware
- Input sanitization
- Authentication and authorization middleware
- Non-root user in Docker container
- Rate limiting for API endpoints
- Secure environment variable handling

### Performance
- Compression middleware for response compression
- Efficient data structures for storage and retrieval
- Proper error handling to prevent crashes
- Caching mechanisms where appropriate
- Database connection pooling (if applicable)

### Monitoring
- Winston logging with appropriate levels (info, warn, error)
- Health check endpoint
- Docker health check
- Request logging middleware
- Performance metrics collection (if required)

## API Design Principles

### Endpoint Structure
- RESTful resource naming conventions
- Consistent path parameter usage
- Proper HTTP method usage (GET, POST, PUT, DELETE)
- Query parameter handling for filtering and pagination
- Versioning in API paths (if required)

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
- All DELETE endpoints
- Error cases (404, 400, 500)
- Edge cases and boundary conditions
- Authentication and authorization tests

### Test Structure
- Proper setup and teardown for each test suite
- Mock data where needed
- Clear test descriptions
- Appropriate assertions for expected outcomes
- Test isolation to prevent side effects

## Documentation Standards

### README.md Requirements
- Clear service description with value proposition
- Feature list with brief explanations
- Complete API documentation with examples
- Installation instructions with prerequisites
- Environment variables with descriptions and default values
- Contributing guidelines
- License information
- Contact information for maintainers

## Deployment Standards

### Docker Standards
- Multi-stage builds for production optimization
- Non-root user for security
- Proper health checks
- Security best practices
- Efficient layering to minimize image size

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

This format ensures that all premium services in the Azora ecosystem meet the highest standards of quality, security, and maintainability.