# Tamper-Proof Data Service

The Tamper-Proof Data Service provides secure storage and verification of sensitive data within the Azora OS ecosystem. It ensures data integrity through cryptographic hashing and digital signatures.

## Features

- Secure data storage with cryptographic hashing
- Digital signature verification
- Data integrity checking
- Audit trail tracking
- User-specific data management
- RESTful API for integration

## API Endpoints

### Store Data
```
POST /api/tamper-proof/data
```
Body:
```json
{
  "userId": "user123",
  "dataType": "user_profile",
  "data": {
    "name": "John Doe",
    "email": "john@example.com"
  },
  "metadata": {
    "source": "web_app"
  }
}
```

### Retrieve Data
```
GET /api/tamper-proof/data/:id?userId=user123
```

### Update Data
```
PUT /api/tamper-proof/data/:id
```
Body:
```json
{
  "userId": "user123",
  "data": {
    "name": "John Doe",
    "email": "john.doe@example.com"
  },
  "metadata": {
    "updatedBy": "user"
  }
}
```

### Delete Data
```
DELETE /api/tamper-proof/data/:id
```
Body:
```json
{
  "userId": "user123"
}
```

### List User Data
```
GET /api/tamper-proof/data/user/:userId
```

### Verify All User Data
```
GET /api/tamper-proof/data/user/:userId/verify
```

### Get Audit Trail
```
GET /api/tamper-proof/data/:id/audit-trail
```

## Security

The service uses SHA-256 hashing and HMAC signatures to ensure data integrity. In production, this would be enhanced with proper cryptographic keys and certificate management.

## Environment Variables

- `PORT` - Port to run the service on (default: 3006)
- `SIGNATURE_SECRET` - Secret key for digital signatures (default: 'azora-tamper-proof-secret')

## Installation

```bash
npm install
npm start
```

## Docker

```bash
docker build -t tamper-proof-data-service .
docker run -p 3006:3006 tamper-proof-data-service
```
