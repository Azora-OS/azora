# 🛡️ Security Headers - Azora OS

## Helmet.js Configuration

All services use Helmet.js for security headers.

### Headers Applied:

#### Content-Security-Policy (CSP)
```
default-src 'self'
style-src 'self' 'unsafe-inline'
script-src 'self'
img-src 'self' data: https:
```

**Purpose:** Prevents XSS attacks by controlling resource loading

#### Strict-Transport-Security (HSTS)
```
max-age=31536000
includeSubDomains
preload
```

**Purpose:** Forces HTTPS connections

#### X-Content-Type-Options
```
nosniff
```

**Purpose:** Prevents MIME-type sniffing

#### X-Frame-Options
```
SAMEORIGIN
```

**Purpose:** Prevents clickjacking

#### X-XSS-Protection
```
1; mode=block
```

**Purpose:** Enables browser XSS protection

---

## CORS Configuration

```typescript
{
  origin: process.env.CORS_ORIGIN,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}
```

**Environment Variables:**
- `CORS_ORIGIN` - Allowed origin (e.g., https://azora.world)

---

## Rate Limiting

### Default Limits:
- **API Gateway:** 200 requests / 15 minutes
- **Auth Service:** 20 requests / 15 minutes
- **Other Services:** 100 requests / 15 minutes

### Headers:
- `RateLimit-Limit` - Max requests
- `RateLimit-Remaining` - Remaining requests
- `RateLimit-Reset` - Reset time

---

## Testing Headers

```bash
curl -I https://api.azora.world/health
```

Expected headers:
- `Strict-Transport-Security`
- `X-Content-Type-Options`
- `X-Frame-Options`
- `Content-Security-Policy`
