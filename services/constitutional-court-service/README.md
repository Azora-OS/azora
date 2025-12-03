# Constitutional Court Service

A constitutional compliance and case management service for the Azora ecosystem.

## Features

- **Case Management**: Create, track, and manage constitutional cases
- **Compliance Checking**: Verify actions against constitutional principles
- **Violation Tracking**: Record and monitor constitutional violations
- **Status Tracking**: Monitor the progress of cases
- **RESTful API**: Well-documented API endpoints for all constitutional functions

## API Endpoints

### Health & Info
- `GET /health` - Service health check

### Cases
- `GET /api/cases` - Get all constitutional cases
- `GET /api/cases/:caseId` - Get specific case
- `POST /api/cases` - File a new constitutional case
- `PUT /api/cases/:caseId` - Update case status

### Compliance
- `POST /api/compliance/check` - Check constitutional compliance
- `GET /api/compliance/violations` - Get all violations
- `GET /api/compliance/violations/:violationId` - Get specific violation

## Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the service:
   ```bash
   npm start
   ```

3. For development:
   ```bash
   npm run dev
   ```

## Environment Variables

Create a `.env` file with the following variables:

```
PORT=3025
LOG_LEVEL=info
```

## Case Status Types

The service supports the following case status types:

1. **Open**: Case has been filed and is under review
2. **In Progress**: Case is actively being investigated
3. **Resolved**: Case has been resolved
4. **Closed**: Case has been closed

## Priority Levels

The service supports the following priority levels:

1. **High**: Urgent cases requiring immediate attention
2. **Medium**: Important cases requiring timely attention
3. **Low**: Routine cases that can be addressed in due course

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

PROPRIETARY