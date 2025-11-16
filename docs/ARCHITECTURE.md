# Azora OS Architecture

## Overview

Azora OS is a comprehensive, cloud-native education and financial platform built with microservices architecture. It combines AI-powered learning, blockchain-based credentials, and integrated financial services into a unified ecosystem.

**Architecture Pattern**: Event-driven microservices with API Gateway  
**Deployment**: Containerized (Docker) on Kubernetes  
**Data Strategy**: Polyglot persistence (PostgreSQL, Redis, MongoDB)  
**Communication**: REST APIs, WebSockets, Event Bus (RabbitMQ/Kafka)

---

## System Architecture

### High-Level Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Client Applications                       │
│  ┌──────────────┬──────────────┬──────────────┬────────────┐ │
│  │ Web Portal   │ Mobile Apps  │ Admin Panel  │ Dev Portal │ │
│  └──────────────┴──────────────┴──────────────┴────────────┘ │
└────────────────────────┬────────────────────────────────────┘
                         │
                    ┌────▼─────┐
                    │ CDN/Cache │
                    └────┬─────┘
                         │
        ┌────────────────▼────────────────┐
        │      API Gateway (Kong)         │
        │  ┌─────────────────────────────┐│
        │  │ Rate Limiting, Auth, Routing││
        │  └─────────────────────────────┘│
        └────────────────┬────────────────┘
                         │
        ┌────────────────┴────────────────┐
        │    Microservices Cluster        │
        │  ┌──────────────────────────┐   │
        │  │ Auth Service             │   │
        │  │ Education Service        │   │
        │  │ Assessment Service       │   │
        │  │ AI/Sapiens Service       │   │
        │  │ Financial Service (Mint) │   │
        │  │ Payment Service          │   │
        │  │ Classroom Service        │   │
        │  │ Study Spaces Service     │   │
        │  └──────────────────────────┘   │
        └────────────────┬────────────────┘
                         │
        ┌────────────────┴────────────────┐
        │    Data & Infrastructure Layer   │
        │  ┌──────────────────────────┐   │
        │  │ PostgreSQL (Primary DB)  │   │
        │  │ Redis (Cache/Sessions)   │   │
        │  │ MongoDB (Documents)      │   │
        │  │ Event Bus (RabbitMQ)     │   │
        │  │ Blockchain (Polygon)     │   │
        │  └──────────────────────────┘   │
        └────────────────┬────────────────┘
                         │
        ┌────────────────┴────────────────┐
        │   Observability & Monitoring    │
        │  ┌──────────────────────────┐   │
        │  │ Prometheus (Metrics)     │   │
        │  │ Loki (Logs)              │   │
        │  │ Jaeger (Traces)          │   │
        │  │ Grafana (Dashboards)     │   │
        │  │ Alertmanager (Alerts)    │   │
        │  └──────────────────────────┘   │
        └─────────────────────────────────┘
```

---

## Core Services

### 1. API Gateway
**Purpose**: Single entry point, routing, rate limiting, authentication  
**Technology**: Kong/Express.js  
**Responsibilities**:
- Request routing to appropriate services
- Rate limiting (4 tiers: free, pro, enterprise, admin)
- JWT token validation
- CORS handling
- Request/response logging
- API versioning

**Key Endpoints**:
- `/api/v1/auth/*` → Auth Service
- `/api/v1/education/*` → Education Service
- `/api/v1/assessment/*` → Assessment Service
- `/api/v1/ai/*` → AI/Sapiens Service
- `/api/v1/financial/*` → Financial Service
- `/api/v1/payments/*` → Payment Service

---

### 2. Authentication Service
**Purpose**: User identity, JWT tokens, OAuth integration  
**Technology**: Node.js + Express, Passport.js, JWT  
**Key Features**:
- Email/password authentication
- OAuth (Google, GitHub, Apple)
- Multi-factor authentication (TOTP)
- Session management
- Token refresh mechanism
- Role-based access control (RBAC)

**Database Schema**:
```
Users
├── id (UUID)
├── email (unique)
├── password_hash
├── mfa_enabled
├── roles (array)
├── created_at
└── updated_at

Sessions
├── id (UUID)
├── user_id (FK)
├── token
├── expires_at
└── created_at
```

---

### 3. Education Service
**Purpose**: Course management, content delivery, progress tracking  
**Technology**: Node.js + Express, PostgreSQL  
**Key Features**:
- Course creation and management
- Lesson organization
- Content delivery (video, text, interactive)
- Progress tracking
- Completion certificates
- Learning paths

**Database Schema**:
```
Courses
├── id (UUID)
├── title
├── description
├── instructor_id (FK)
├── category
├── level (beginner/intermediate/advanced)
├── created_at
└── updated_at

Lessons
├── id (UUID)
├── course_id (FK)
├── title
├── content
├── order
└── duration_minutes

Enrollments
├── id (UUID)
├── user_id (FK)
├── course_id (FK)
├── progress_percent
├── completed_at
└── enrolled_at
```

---

### 4. Assessment Service
**Purpose**: Quiz creation, auto-grading, performance analytics  
**Technology**: Node.js + Express, PostgreSQL  
**Key Features**:
- Quiz/test creation
- Multiple question types (MCQ, essay, code)
- Auto-grading for objective questions
- Performance analytics
- Adaptive testing
- Question bank management

**Database Schema**:
```
Quizzes
├── id (UUID)
├── course_id (FK)
├── title
├── passing_score
├── time_limit_minutes
└── created_at

Questions
├── id (UUID)
├── quiz_id (FK)
├── type (mcq/essay/code)
├── content
├── options (JSON)
├── correct_answer
└── points

Submissions
├── id (UUID)
├── quiz_id (FK)
├── user_id (FK)
├── answers (JSON)
├── score
├── submitted_at
└── graded_at
```

---

### 5. AI/Sapiens Service
**Purpose**: AI-powered learning assistance, personalization  
**Technology**: Node.js + Express, OpenAI API, LangChain  
**Key Features**:
- 11 distinct AI personalities
- Context-aware responses
- Learning path generation
- Adaptive difficulty
- Real-time assistance
- Content recommendations

**AI Personalities**:
1. **Mentor** - Guides learning with questions
2. **Tutor** - Explains concepts clearly
3. **Coach** - Motivates and encourages
4. **Socratic** - Uses questioning method
5. **Storyteller** - Uses narratives
6. **Analyst** - Data-driven insights
7. **Creator** - Encourages creativity
8. **Challenger** - Pushes boundaries
9. **Supporter** - Empathetic listener
10. **Expert** - Deep technical knowledge
11. **Facilitator** - Connects learners

---

### 6. Financial Service (Azora Mint)
**Purpose**: Payments, withdrawals, blockchain integration  
**Technology**: Node.js + Express, Stripe, Web3.js, PostgreSQL  
**Key Features**:
- Payment processing (Stripe)
- Withdrawal management
- Bank verification
- KYC/AML compliance
- Fraud detection
- Blockchain integration (Polygon)
- NFT certificate minting

**Database Schema**:
```
Wallets
├── id (UUID)
├── user_id (FK)
├── balance
├── currency
├── blockchain_address
└── created_at

Transactions
├── id (UUID)
├── wallet_id (FK)
├── type (deposit/withdrawal/transfer)
├── amount
├── status (pending/completed/failed)
├── stripe_id
├── blockchain_tx_hash
└── created_at

Withdrawals
├── id (UUID)
├── wallet_id (FK)
├── amount
├── bank_account_id (FK)
├── status (pending/approved/rejected)
├── kyc_verified
├── created_at
└── processed_at
```

---

### 7. Payment Service
**Purpose**: Subscription management, invoicing, billing  
**Technology**: Node.js + Express, Stripe, PostgreSQL  
**Key Features**:
- Subscription plans
- Invoice generation
- Payment history
- Refund processing
- Multi-currency support
- Payment analytics

---

### 8. Classroom Service
**Purpose**: Live virtual classrooms, real-time collaboration  
**Technology**: Node.js + Express, WebRTC, Socket.io  
**Key Features**:
- Video conferencing
- Screen sharing
- Interactive whiteboard
- Breakout rooms
- Recording
- Chat system
- Attendance tracking

---

## Data Layer

### Database Strategy

**PostgreSQL (Primary)**
- User data, courses, enrollments
- Transactions, payments
- Assessments, submissions
- Audit logs

**Redis (Cache & Sessions)**
- Session storage
- Rate limiting counters
- Cache layer for frequently accessed data
- Real-time notifications

**MongoDB (Documents)**
- Course content (rich media)
- User profiles (flexible schema)
- Analytics events
- Logs (structured)

**Blockchain (Polygon)**
- NFT certificates
- Credential verification
- Immutable records

---

### Data Flow

```
Client Request
    ↓
API Gateway (validation, auth)
    ↓
Service (business logic)
    ↓
Database Layer
├── PostgreSQL (transactional)
├── Redis (cache)
├── MongoDB (documents)
└── Blockchain (credentials)
    ↓
Response to Client
```

---

## Communication Patterns

### Synchronous (REST/HTTP)
- Client to API Gateway
- Service to Service (internal)
- External API calls (Stripe, OpenAI)

### Asynchronous (Event Bus)
- Service-to-service events
- User notifications
- Analytics events
- Audit logging

**Event Types**:
- `user.created`
- `course.enrolled`
- `assessment.completed`
- `payment.processed`
- `withdrawal.requested`
- `certificate.minted`

---

## Security Architecture

### Authentication & Authorization
- **JWT Tokens**: Stateless authentication
- **RBAC**: Role-based access control
- **OAuth**: Third-party integrations
- **MFA**: Multi-factor authentication

### Data Protection
- **Encryption in Transit**: TLS 1.3
- **Encryption at Rest**: AES-256
- **Secrets Management**: Environment variables + Vault
- **PII Masking**: In logs and backups

### API Security
- **Rate Limiting**: Per-user, per-IP
- **CORS**: Whitelist origins
- **CSRF Protection**: Token validation
- **Input Validation**: Zod schemas
- **SQL Injection Prevention**: Parameterized queries

---

## Deployment Architecture

### Containerization
- **Docker**: All services containerized
- **Image Registry**: Docker Hub / ECR
- **Base Images**: Node.js 20 LTS

### Orchestration
- **Kubernetes**: Container orchestration
- **Helm**: Package management
- **Namespaces**: dev, staging, production

### Infrastructure
- **Cloud Provider**: AWS / GCP / Azure
- **Load Balancing**: Nginx / AWS ALB
- **Auto-scaling**: Based on CPU/memory
- **Storage**: Persistent volumes for databases

---

## Observability

### Metrics (Prometheus)
- Request latency (p50, p95, p99)
- Error rates
- Throughput
- Resource utilization
- Business metrics (enrollments, payments)

### Logging (Loki + Winston)
- Structured JSON logs
- Log levels: debug, info, warn, error
- Correlation IDs for tracing
- Centralized log aggregation

### Tracing (Jaeger + OpenTelemetry)
- Distributed tracing
- Service dependencies
- Performance bottlenecks
- Error tracking

### Alerting (Alertmanager)
- High error rates (>5%)
- High latency (>1s)
- Service down
- Database issues
- Payment failures

---

## Scalability Considerations

### Horizontal Scaling
- Stateless services (scale independently)
- Load balancing across instances
- Database read replicas
- Cache distribution (Redis Cluster)

### Vertical Scaling
- Increase CPU/memory per instance
- Database optimization (indexing)
- Query optimization

### Performance Optimization
- API response caching
- Database query optimization
- CDN for static assets
- Lazy loading for content
- Compression (gzip)

---

## Disaster Recovery

### Backup Strategy
- **Database**: Daily snapshots, 30-day retention
- **Code**: Git repository (GitHub)
- **Configuration**: Version controlled
- **Secrets**: Encrypted backup

### Recovery Procedures
- **RTO** (Recovery Time Objective): 1 hour
- **RPO** (Recovery Point Objective): 15 minutes
- **Failover**: Automated to standby region
- **Testing**: Monthly DR drills

---

## Development Workflow

### Branching Strategy
- `main`: Production-ready code
- `develop`: Integration branch
- `feature/*`: Feature branches
- `hotfix/*`: Emergency fixes

### CI/CD Pipeline
1. Code push to feature branch
2. Automated tests (unit, integration, E2E)
3. Code quality checks (ESLint, SonarQube)
4. Security scanning (OWASP, dependency check)
5. Build Docker image
6. Push to registry
7. Deploy to staging
8. Manual approval
9. Deploy to production

### Code Review
- Minimum 2 approvals
- All tests passing
- No security issues
- Documentation updated

---

## Technology Stack Summary

| Layer | Technology |
|-------|-----------|
| **Frontend** | React, Next.js, Vite |
| **Backend** | Node.js, Express.js |
| **Language** | TypeScript |
| **Database** | PostgreSQL, Redis, MongoDB |
| **Blockchain** | Polygon, Web3.js |
| **AI** | OpenAI API, LangChain |
| **Payments** | Stripe |
| **Real-time** | WebSocket, Socket.io |
| **Messaging** | RabbitMQ / Kafka |
| **Containerization** | Docker, Kubernetes |
| **Monitoring** | Prometheus, Loki, Jaeger, Grafana |
| **CI/CD** | GitHub Actions |
| **IaC** | Terraform |

---

## Key Design Principles

1. **Microservices**: Independent, scalable services
2. **API-First**: Everything accessible via APIs
3. **Event-Driven**: Asynchronous communication
4. **Stateless**: Easy horizontal scaling
5. **Security-First**: Security at every layer
6. **Observable**: Comprehensive monitoring
7. **Resilient**: Graceful degradation
8. **Automated**: CI/CD, infrastructure as code

---

## Future Enhancements

- **GraphQL**: Alternative to REST
- **Service Mesh**: Istio for advanced networking
- **Machine Learning**: Predictive analytics
- **Multi-region**: Global distribution
- **Blockchain**: More chains (Ethereum, Solana)
- **Mobile**: Native iOS/Android apps
- **AR/VR**: Immersive learning experiences

