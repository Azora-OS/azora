# 🔒 AZORA OS - TLS/mTLS CONFIGURATION GUIDE

**Layer:** 1 - Security Foundation  
**Status:** Configuration Guide

---

## 📋 TLS CERTIFICATE GENERATION

### Development Certificates (Self-Signed)

```bash
# Create certificates directory
mkdir -p infrastructure/certs/dev

# Generate CA (Certificate Authority)
openssl genrsa -out infrastructure/certs/dev/ca-key.pem 4096
openssl req -new -x509 -days 365 -key infrastructure/certs/dev/ca-key.pem \
  -sha256 -out infrastructure/certs/dev/ca.pem \
  -subj "/C=ZA/ST=Gauteng/L=Johannesburg/O=Azora/CN=Azora-CA"

# Generate server certificate
openssl genrsa -out infrastructure/certs/dev/server-key.pem 4096
openssl req -subj "/C=ZA/ST=Gauteng/L=Johannesburg/O=Azora/CN=localhost" \
  -sha256 -new -key infrastructure/certs/dev/server-key.pem \
  -out infrastructure/certs/dev/server.csr

# Create server certificate extensions
echo "subjectAltName = DNS:localhost,IP:127.0.0.1" > infrastructure/certs/dev/server-extfile.cnf

# Sign server certificate
openssl x509 -req -days 365 -sha256 \
  -in infrastructure/certs/dev/server.csr \
  -CA infrastructure/certs/dev/ca.pem \
  -CAkey infrastructure/certs/dev/ca-key.pem \
  -CAcreateserial \
  -out infrastructure/certs/dev/server-cert.pem \
  -extfile infrastructure/certs/dev/server-extfile.cnf

# Generate client certificate (for mTLS)
openssl genrsa -out infrastructure/certs/dev/client-key.pem 4096
openssl req -subj "/C=ZA/ST=Gauteng/L=Johannesburg/O=Azora/CN=azora-client" \
  -sha256 -new -key infrastructure/certs/dev/client-key.pem \
  -out infrastructure/certs/dev/client.csr

# Sign client certificate
openssl x509 -req -days 365 -sha256 \
  -in infrastructure/certs/dev/client.csr \
  -CA infrastructure/certs/dev/ca.pem \
  -CAkey infrastructure/certs/dev/ca-key.pem \
  -CAcreateserial \
  -out infrastructure/certs/dev/client-cert.pem
```

---

## 📋 SERVICE TLS CONFIGURATION

### Express.js Service (Example)

```typescript
// services/api-gateway/src/server.ts
import https from 'https';
import fs from 'fs';
import path from 'path';

const tlsOptions = {
  key: fs.readFileSync(path.join(__dirname, '../../infrastructure/certs/dev/server-key.pem')),
  cert: fs.readFileSync(path.join(__dirname, '../../infrastructure/certs/dev/server-cert.pem')),
  ca: fs.readFileSync(path.join(__dirname, '../../infrastructure/certs/dev/ca.pem')),
  requestCert: true, // Enable mTLS
  rejectUnauthorized: true, // Reject clients without valid cert
};

const server = https.createServer(tlsOptions, app);
```

### Environment Variables

```bash
# TLS Configuration
TLS_ENABLED=true
TLS_KEY_PATH=infrastructure/certs/dev/server-key.pem
TLS_CERT_PATH=infrastructure/certs/dev/server-cert.pem
TLS_CA_PATH=infrastructure/certs/dev/ca.pem
MTLS_ENABLED=true
```

---

## 📋 mTLS CLIENT CONFIGURATION

### Service-to-Service Communication

```typescript
// packages/shared/http-client.ts
import https from 'https';
import fs from 'fs';
import path from 'path';

export function createSecureClient() {
  const tlsOptions = {
    key: fs.readFileSync(process.env.TLS_CLIENT_KEY_PATH || 'infrastructure/certs/dev/client-key.pem'),
    cert: fs.readFileSync(process.env.TLS_CLIENT_CERT_PATH || 'infrastructure/certs/dev/client-cert.pem'),
    ca: fs.readFileSync(process.env.TLS_CA_PATH || 'infrastructure/certs/dev/ca.pem'),
  };

  return https.Agent(tlsOptions);
}
```

---

## 📋 TLS MIDDLEWARE

### Express TLS Middleware

```typescript
// middleware/tls-validator.ts
import { Request, Response, NextFunction } from 'express';

export function validateTLS(req: Request, res: Response, next: NextFunction) {
  if (process.env.TLS_ENABLED !== 'true') {
    return next(); // Skip in development
  }

  // Check if request is over HTTPS
  if (!req.secure && req.headers['x-forwarded-proto'] !== 'https') {
    return res.status(403).json({
      success: false,
      error: 'HTTPS required',
    });
  }

  // Validate client certificate (mTLS)
  if (process.env.MTLS_ENABLED === 'true') {
    const cert = (req as any).socket.getPeerCertificate();
    if (!cert || !cert.subject) {
      return res.status(403).json({
        success: false,
        error: 'Client certificate required',
      });
    }
  }

  next();
}
```

---

## ✅ TLS VALIDATION CHECKLIST

- [ ] Certificates generated
- [ ] TLS configured for all services
- [ ] mTLS configured for service-to-service
- [ ] TLS middleware added
- [ ] Environment variables set
- [ ] TLS connections tested

---

**"TLS/mTLS configuration ready. Security foundation solid."**

---

*Part of Layer 1 - Security Foundation*
