# Shield Service

The Shield Service is a security monitoring and threat detection service for the Azora OS ecosystem. It provides real-time analysis of incoming requests, identifies potential security threats, and implements protective measures.

## Features

- Real-time request analysis for security threats
- Threat pattern detection (SQL injection, XSS, etc.)
- Rate limiting and IP blocking
- Security event logging and monitoring
- Threat statistics and reporting
- RESTful API for integration

## Threat Detection

The service detects common security threats including:
- SQL Injection attacks
- Cross-Site Scripting (XSS)
- Path traversal attempts
- Command injection attempts
- Rate limiting violations

## API Endpoints

### Analyze Request
```
POST /api/shield/analyze
```
Body:
```json
{
  "ip": "192.168.1.100",
  "method": "GET",
  "url": "/api/users",
  "query": {
    "id": "123"
  },
  "headers": {
    "user-agent": "Mozilla/5.0...",
    "authorization": "Bearer token123"
  }
}
```

### Get Security Events
```
GET /api/shield/events?ip=192.168.1.100&minRiskScore=5&page=1&limit=50
```

### Block IP Address
```
POST /api/shield/block-ip
```
Body:
```json
{
  "ip": "192.168.1.100"
}
```

### Unblock IP Address
```
POST /api/shield/unblock-ip
```
Body:
```json
{
  "ip": "192.168.1.100"
}
```

### Check IP Status
```
GET /api/shield/ip-status/192.168.1.100
```

### Get Threat Statistics
```
GET /api/shield/stats
```

### Clear Old Events
```
DELETE /api/shield/events/old?days=30
```

## Environment Variables

- `PORT` - Port to run the service on (default: 3007)

## Installation

```bash
npm install
npm start
```

## Docker

```bash
docker build -t shield-service .
docker run -p 3007:3007 shield-service
```
