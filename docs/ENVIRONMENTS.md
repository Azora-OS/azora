# 🌍 Environment Configuration Guide

Complete guide to environment variables and configuration across all Azora OS services.

---

## 📋 Environment Overview

### Environments
- **Development** - Local development
- **Test** - Automated testing
- **Staging** - Pre-production testing
- **Production** - Live system

---

## 🔧 Global Variables

### Required for All Services
```bash
# Node Environment
NODE_ENV=development|test|staging|production

# Service Configuration
PORT=4000
HOST=localhost

# Database
DATABASE_URL=postgresql://user:password@host:5432/dbname

# Redis
REDIS_URL=redis://localhost:6379

# Security
JWT_SECRET=your-secret-key-min-32-chars
ENCRYPTION_KEY=your-encryption-key-32-chars

# Logging
LOG_LEVEL=info|debug|warn|error
```

---

## 🔐 Auth Service (Port 4001)

```bash
# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/azora_auth

# JWT Configuration
JWT_SECRET=your-jwt-secret-key
JWT_EXPIRES_IN=7d
REFRESH_TOKEN_EXPIRES_IN=30d

# OAuth - Google
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:4001/auth/google/callback

# MFA
MFA_ISSUER=Azora OS
MFA_WINDOW=1

# Rate Limiting
RATE_LIMIT_WINDOW=15m
RATE_LIMIT_MAX=100

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

---

## 🎓 Education Service (Port 4002)

```bash
# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/azora_education

# AI Integration
OPENAI_API_KEY=sk-your-openai-key
OPENAI_MODEL=gpt-4
OPENAI_MAX_TOKENS=2000

# File Storage
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
AWS_S3_BUCKET=azora-education
AWS_REGION=us-east-1

# Video Processing
VIDEO_UPLOAD_MAX_SIZE=500MB
VIDEO_ALLOWED_FORMATS=mp4,webm,mov

# Course Settings
MAX_STUDENTS_PER_COURSE=1000
COURSE_COMPLETION_THRESHOLD=80
```

---

## 💰 Mint Service (Port 4003)

```bash
# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/azora_mint

# Stripe
STRIPE_SECRET_KEY=sk_test_your-stripe-key
STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret

# Token Economics
AZR_INITIAL_SUPPLY=1000000000
AZR_MINING_RATE=10
AZR_DAILY_LIMIT=1000
UBI_DAILY_AMOUNT=10

# Blockchain
BLOCKCHAIN_NETWORK=testnet|mainnet
BLOCKCHAIN_RPC_URL=https://rpc.example.com
PRIVATE_KEY=your-private-key

# Banking
BANK_API_KEY=your-bank-api-key
BANK_API_SECRET=your-bank-secret
```

---

## 🔨 Forge Service (Port 4004)

```bash
# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/azora_forge

# AI Matching
OPENAI_API_KEY=sk-your-openai-key
MATCHING_THRESHOLD=0.8

# Escrow
ESCROW_FEE_PERCENTAGE=2.5
ESCROW_RELEASE_DELAY=7d

# Job Settings
MAX_APPLICATIONS_PER_JOB=100
JOB_EXPIRY_DAYS=30
```

---

## 🤖 AI Family Service (Port 4005)

```bash
# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/azora_family

# OpenAI
OPENAI_API_KEY=sk-your-openai-key
OPENAI_MODEL=gpt-4
OPENAI_TEMPERATURE=0.7

# Personality Engine
PERSONALITY_CACHE_TTL=3600
MAX_CONVERSATION_HISTORY=50
```

---

## 🌐 API Gateway (Port 4000)

```bash
# Service URLs
AUTH_SERVICE_URL=http://localhost:4001
EDUCATION_SERVICE_URL=http://localhost:4002
MINT_SERVICE_URL=http://localhost:4003
FORGE_SERVICE_URL=http://localhost:4004
FAMILY_SERVICE_URL=http://localhost:4005

# CORS
CORS_ORIGIN=http://localhost:3000,http://localhost:3001
CORS_CREDENTIALS=true

# Rate Limiting
RATE_LIMIT_WINDOW=15m
RATE_LIMIT_MAX=1000

# Circuit Breaker
CIRCUIT_BREAKER_THRESHOLD=5
CIRCUIT_BREAKER_TIMEOUT=60000
```

---

## 📊 Monitoring

```bash
# Prometheus
PROMETHEUS_PORT=9090
METRICS_ENABLED=true

# Grafana
GRAFANA_PORT=3000
GRAFANA_ADMIN_PASSWORD=admin

# Logging
LOG_LEVEL=info
LOG_FORMAT=json
LOG_FILE=logs/app.log
```

---

## 🔒 Security Best Practices

### Never Commit Secrets
```bash
# ❌ Bad
JWT_SECRET=my-secret-123

# ✅ Good - Use environment variables
JWT_SECRET=${JWT_SECRET}
```

### Use Strong Secrets
```bash
# Generate secure random string
openssl rand -base64 32
```

### Rotate Secrets Regularly
- JWT secrets: Every 90 days
- API keys: Every 180 days
- Database passwords: Every 365 days

---

## 📝 Environment Files

### .env.example (Template)
```bash
# Copy this file to .env and fill in values
NODE_ENV=development
DATABASE_URL=postgresql://postgres:password@localhost:5432/azora
JWT_SECRET=change-me-to-secure-random-string
```

### .env.development
```bash
NODE_ENV=development
DATABASE_URL=postgresql://postgres:dev@localhost:5432/azora_dev
LOG_LEVEL=debug
```

### .env.test
```bash
NODE_ENV=test
DATABASE_URL=postgresql://postgres:test@localhost:5432/azora_test
LOG_LEVEL=error
```

### .env.production
```bash
NODE_ENV=production
DATABASE_URL=${DATABASE_URL}
JWT_SECRET=${JWT_SECRET}
LOG_LEVEL=info
```

---

## 🚀 Deployment

### AWS Secrets Manager
```bash
# Store secret
aws secretsmanager create-secret \
  --name azora/production/jwt-secret \
  --secret-string "your-secret-value"

# Retrieve secret
aws secretsmanager get-secret-value \
  --secret-id azora/production/jwt-secret
```

### Docker Environment
```yaml
# docker-compose.yml
services:
  api-gateway:
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - JWT_SECRET=${JWT_SECRET}
```

### Kubernetes Secrets
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: azora-secrets
type: Opaque
data:
  jwt-secret: base64-encoded-value
  database-url: base64-encoded-value
```

---

## ✅ Validation Checklist

- [ ] All required variables set
- [ ] Secrets are secure (32+ chars)
- [ ] No secrets in git
- [ ] .env in .gitignore
- [ ] Production secrets in vault
- [ ] Environment-specific configs
- [ ] Database URLs correct
- [ ] API keys valid
- [ ] CORS origins configured
- [ ] Monitoring enabled

---

**Keep your secrets safe! 🔒**
