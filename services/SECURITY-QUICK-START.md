# 🛡️ Azora Security Services - Quick Start

**Secure your application in 5 minutes!**

---

## ⚡ Quick Setup

### 1. Environment
```bash
# .env
JWT_SECRET=your-secret-key-here
ENCRYPTION_KEY=your-encryption-key-here
RATE_LIMIT_MAX=100
```

### 2. Install
```bash
cd services
npm install jsonwebtoken crypto
```

### 3. Use Security Middleware
```typescript
import { securityMiddleware } from './azora-aegis/src/security-middleware'
import express from 'express'

const app = express()

// Apply security
app.use(securityMiddleware.securityHeaders.bind(securityMiddleware))
app.use(securityMiddleware.rateLimit.bind(securityMiddleware))
app.use(securityMiddleware.validateInput.bind(securityMiddleware))

// Protected route
app.post('/api/protected',
  securityMiddleware.authenticate.bind(securityMiddleware),
  (req, res) => {
    res.json({ message: 'Secure!' })
  }
)
```

---

## 🔐 Common Use Cases

### 1. User Authentication
```typescript
import { securityMiddleware } from './azora-aegis/src/security-middleware'

// Generate token
const token = securityMiddleware.generateToken({
  userId: 'user123',
  email: 'user@example.com'
})

// Verify token
try {
  const decoded = securityMiddleware.verifyToken(token)
  console.log('User:', decoded.userId)
} catch (error) {
  console.log('Invalid token')
}
```

### 2. KYC Verification
```typescript
import { kycAmlService } from './kyc-aml-service/kyc-aml-complete'

const result = await kycAmlService.verifyKYC({
  userId: 'user123',
  name: 'John Doe',
  idNumber: '9001015009087',
  dateOfBirth: '1990-01-01',
  address: '123 Main St',
  country: 'South Africa',
  documentType: 'id',
  documentNumber: '9001015009087'
})

if (result.approved) {
  console.log('✅ KYC approved')
} else {
  console.log('❌ KYC rejected:', result.reason)
}
```

### 3. Transaction Monitoring
```typescript
import { kycAmlService } from './kyc-aml-service/kyc-aml-complete'

const amlCheck = await kycAmlService.checkTransaction({
  userId: 'user123',
  amount: 15000,
  currency: 'AZR',
  type: 'withdrawal',
  ip: '192.168.1.1'
})

if (amlCheck.flagged) {
  console.log('🚨 Transaction flagged - Risk score:', amlCheck.riskScore)
} else {
  console.log('✅ Transaction approved')
}
```

### 4. Audit Logging
```typescript
import { auditLoggingService } from './audit-logging-service/audit-complete'

await auditLoggingService.log({
  userId: 'user123',
  action: 'LOGIN',
  resource: 'auth',
  method: 'POST',
  ip: '192.168.1.1',
  userAgent: 'Mozilla/5.0...',
  status: 'success',
  details: { timestamp: Date.now() }
})

// Verify integrity
const isValid = auditLoggingService.verifyIntegrity()
console.log('Audit integrity:', isValid ? '✅' : '❌')
```

### 5. Data Encryption
```typescript
import { securityMiddleware } from './azora-aegis/src/security-middleware'

// Encrypt sensitive data
const encrypted = securityMiddleware.encrypt('sensitive data')
console.log('Encrypted:', encrypted)

// Decrypt
const decrypted = securityMiddleware.decrypt(encrypted)
console.log('Decrypted:', decrypted)
```

---

## 🚨 Security Events

### Listen to Events
```typescript
import { securityService } from './security-service/security-complete'

securityService.on('critical-event', (event) => {
  console.log('🚨 CRITICAL:', event)
  // Send alert to admin
})

securityService.on('threat-detected', (threat) => {
  console.log('⚠️ THREAT:', threat)
  // Block IP, notify security team
})
```

---

## 📊 Security Dashboard

```typescript
import { securityIntegration } from './security-integration-service'

const dashboard = await securityIntegration.getSecurityDashboard()

console.log('Security Status:')
console.log('- Events (24h):', dashboard.security.events24h)
console.log('- Critical Events:', dashboard.security.criticalEvents24h)
console.log('- Threats (24h):', dashboard.security.threats24h)
console.log('- Blocked IPs:', dashboard.security.blockedIPs)
console.log('- Audit Integrity:', dashboard.audit.integrityVerified ? '✅' : '❌')
```

---

## 🔍 Compliance Report

```typescript
import { securityIntegration } from './security-integration-service'

const startDate = new Date('2025-01-01')
const endDate = new Date('2025-01-31')

const report = await securityIntegration.generateComplianceReport(startDate, endDate)

console.log('Compliance Report:')
console.log('- Total Logs:', report.audit.totalLogs)
console.log('- Failed Actions:', report.audit.failedActions)
console.log('- Compliance Score:', report.audit.complianceScore + '%')
console.log('- High Threats:', report.security.highSeverityThreats)
```

---

## 🛡️ Best Practices

### 1. Always Use HTTPS
```typescript
// In production
const https = require('https')
const fs = require('fs')

const options = {
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem')
}

https.createServer(options, app).listen(443)
```

### 2. Rate Limit All Endpoints
```typescript
app.use(securityMiddleware.rateLimit.bind(securityMiddleware))
```

### 3. Validate All Input
```typescript
app.use(securityMiddleware.validateInput.bind(securityMiddleware))
```

### 4. Log Everything
```typescript
app.use(securityMiddleware.auditLog.bind(securityMiddleware))
```

### 5. Monitor Continuously
```typescript
setInterval(async () => {
  const dashboard = await securityIntegration.getSecurityDashboard()
  if (dashboard.security.criticalEvents24h > 0) {
    // Alert admin
  }
}, 60000) // Every minute
```

---

## 🚀 Production Checklist

- [ ] Set strong JWT_SECRET
- [ ] Set strong ENCRYPTION_KEY
- [ ] Enable HTTPS
- [ ] Configure rate limits
- [ ] Set up monitoring alerts
- [ ] Enable audit logging
- [ ] Configure KYC/AML thresholds
- [ ] Test security middleware
- [ ] Review security headers
- [ ] Set up backup systems

---

## 📞 Support

- **Docs:** `TIER-5-SECURITY-COMPLETION-REPORT.md`
- **Discord:** https://discord.gg/azora
- **Email:** security@azora.world

---

**From Africa, For Humanity, Towards Infinity** 🚀

*Azora ES - Where Security Meets Innovation*
