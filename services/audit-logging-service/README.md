# Audit Logging Service

The Audit Logging Service is a centralized service for tracking and monitoring all security events, user actions, system events, and data access within the Azora OS ecosystem.

## Features

- Security event logging with severity classification
- User action tracking
- System event monitoring
- Data access logging
- Filtering and querying capabilities
- Security statistics and reporting
- Log retention management

## API Endpoints

### Log Security Event
```
POST /api/audit/security
```
Body:
```json
{
  "userId": "user123",
  "action": "login_success",
  "resource": "auth_service",
  "details": {
    "ipAddress": "192.168.1.1",
    "userAgent": "Mozilla/5.0..."
  }
}
```

### Log User Action
```
POST /api/audit/user-action
```
Body:
```json
{
  "userId": "user123",
  "action": "course_enrollment",
  "resource": "course_algebra_101",
  "details": {
    "enrollmentId": "enroll789"
  }
}
```

### Log System Event
```
POST /api/audit/system
```
Body:
```json
{
  "service": "payment_service",
  "action": "startup",
  "details": {
    "version": "1.2.3"
  }
}
```

### Log Data Access
```
POST /api/audit/data-access
```
Body:
```json
{
  "userId": "user123",
  "action": "read",
  "resource": "user_profile_456",
  "details": {
    "fields": ["name", "email"]
  }
}
```

### Get Audit Logs
```
GET /api/audit/logs?type=security&userId=user123&page=1&limit=50
```

### Get Security Statistics
```
GET /api/audit/security/stats
```

### Clear Old Logs
```
DELETE /api/audit/logs/old?days=90
```

## Environment Variables

- `PORT` - Port to run the service on (default: 3005)

## Installation

```bash
npm install
npm start
```

## Docker

```bash
docker build -t audit-logging-service .
docker run -p 3005:3005 audit-logging-service
```
