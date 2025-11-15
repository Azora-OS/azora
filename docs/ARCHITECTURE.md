# Azora OS Architecture

## System Overview

Azora OS is a microservices-based Constitutional AI Operating System built on Ubuntu philosophy.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Client Layer                          │
│  Web Apps │ Mobile Apps │ Desktop │ IDE Extensions      │
└─────────────────────────────────────────────────────────┘
                           │
┌─────────────────────────────────────────────────────────┐
│                   API Gateway (Port 4000)                │
│  Routing │ Auth │ Rate Limiting │ Load Balancing        │
└─────────────────────────────────────────────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
┌───────────────┐  ┌───────────────┐  ┌───────────────┐
│   Education   │  │    Finance    │  │  Marketplace  │
│   Services    │  │   Services    │  │   Services    │
│  (Port 4002)  │  │  (Port 4003)  │  │  (Port 4004)  │
└───────────────┘  └───────────────┘  └───────────────┘
        │                  │                  │
┌─────────────────────────────────────────────────────────┐
│              Infrastructure Layer                        │
│  PostgreSQL │ Redis │ Prometheus │ Grafana             │
└─────────────────────────────────────────────────────────┘
```

## Core Components

### 1. API Gateway
**Purpose:** Single entry point for all client requests

**Responsibilities:**
- Request routing
- Authentication/Authorization
- Rate limiting
- Load balancing
- Request/response transformation

**Technology:** Node.js, Express, http-proxy-middleware

### 2. Auth Service (Port 4001)
**Purpose:** Identity and access management

**Features:**
- User registration/login
- JWT token generation
- OAuth (Google)
- MFA (TOTP)
- Session management

**Database:** PostgreSQL (azora_auth)

### 3. Education Service (Port 4002)
**Purpose:** Learning management system

**Features:**
- Course management
- Enrollment
- Progress tracking
- AI tutoring (Elara)
- Assessments

**Database:** PostgreSQL (azora_education)

### 4. Finance Service (Port 4003)
**Purpose:** Financial operations

**Features:**
- Wallet management
- Transactions
- Mining (Proof-of-Knowledge)
- Payment processing (Stripe)
- Token economics

**Database:** PostgreSQL (azora_mint)

### 5. Marketplace Service (Port 4004)
**Purpose:** Skills and job marketplace

**Features:**
- Job postings
- Skill matching
- Applications
- Escrow
- Ratings/reviews

**Database:** PostgreSQL (azora_forge)

## Data Flow

### Authentication Flow
```
Client → API Gateway → Auth Service → Database
                    ← JWT Token ←
```

### Course Enrollment Flow
```
Client → API Gateway → Education Service → Database
                                        → Event Bus (Nexus)
                                        → Finance Service (AZR reward)
```

### Payment Flow
```
Client → API Gateway → Finance Service → Stripe API
                                      → Database
                                      → Event Bus
```

## Security Architecture

### Defense in Depth
1. **Network Layer:** Firewall, DDoS protection
2. **Application Layer:** CORS, Helmet, Rate limiting
3. **Authentication:** JWT, MFA, OAuth
4. **Authorization:** RBAC, Resource-based
5. **Data Layer:** Encryption, Access controls

### Security Middleware Stack
```typescript
app.use(corsMiddleware);        // CORS protection
app.use(helmetMiddleware);      // Security headers
app.use(rateLimitMiddleware);   // Rate limiting
app.use(authMiddleware);        // Authentication
app.use(rbacMiddleware);        // Authorization
```

## Database Architecture

### Database per Service Pattern
Each service has its own database for:
- Independence
- Scalability
- Fault isolation

### Schema Design
- Normalized for consistency
- Indexed for performance
- Partitioned for scale

## Caching Strategy

### Redis Cache
- Session storage
- API response caching
- Rate limit counters
- Real-time data

### Cache Invalidation
- Time-based (TTL)
- Event-based
- Manual purge

## Event-Driven Architecture

### Event Bus (Nexus)
**Purpose:** Asynchronous communication between services

**Events:**
- `user.registered`
- `course.enrolled`
- `payment.completed`
- `job.applied`

**Technology:** Redis Pub/Sub, Bull Queue

## Monitoring & Observability

### Metrics (Prometheus)
- Request rate
- Response time
- Error rate
- Resource usage

### Logging (Winston)
- Structured JSON logs
- Log levels (error, warn, info, debug)
- Centralized collection

### Tracing
- Request ID propagation
- Distributed tracing
- Performance profiling

## Scalability

### Horizontal Scaling
- Stateless services
- Load balancing
- Auto-scaling (Kubernetes)

### Vertical Scaling
- Resource optimization
- Database tuning
- Caching

### Database Scaling
- Read replicas
- Connection pooling
- Query optimization

## Deployment Architecture

### Environments
- **Development:** Local Docker
- **Staging:** AWS ECS
- **Production:** AWS EKS (Kubernetes)

### CI/CD Pipeline
```
GitHub → Actions → Build → Test → Deploy
                         → Security Scan
                         → Quality Gates
```

## Technology Stack

### Backend
- **Runtime:** Node.js 20
- **Framework:** Express 5
- **Language:** TypeScript 5
- **ORM:** Prisma 5
- **Database:** PostgreSQL 15
- **Cache:** Redis 7

### Frontend
- **Framework:** React 18, Next.js 14
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS
- **State:** Zustand

### Infrastructure
- **Containers:** Docker
- **Orchestration:** Kubernetes
- **CI/CD:** GitHub Actions
- **Monitoring:** Prometheus, Grafana
- **Cloud:** AWS

## Design Patterns

### Microservices Patterns
- API Gateway
- Database per Service
- Event Sourcing
- CQRS (planned)

### Resilience Patterns
- Circuit Breaker
- Retry with Backoff
- Timeout
- Bulkhead

### Security Patterns
- Defense in Depth
- Least Privilege
- Zero Trust

## Performance Targets

| Metric | Target | Current |
|--------|--------|---------|
| API Response | <100ms | 85ms |
| Database Query | <50ms | 42ms |
| Page Load | <2s | 1.8s |
| Uptime | 99.9% | 99.9% |

## Future Architecture

### Planned Enhancements
- GraphQL API
- gRPC for inter-service communication
- Event Sourcing
- CQRS
- Service Mesh (Istio)
- Multi-region deployment

## References

- [API Documentation](./API-DOCUMENTATION.md)
- [Database Guide](./DATABASE-GUIDE.md)
- [Security Policy](./SECURITY-POLICY.md)
- [Deployment Guide](./deployment/)
