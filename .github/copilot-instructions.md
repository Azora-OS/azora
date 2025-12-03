# Azora OS - AI Coding Assistant Instructions

## Project Overview

Azora OS is a comprehensive Ubuntu-powered ecosystem combining AI-enhanced learning, collaborative tools, and blockchain verification. The platform follows Ubuntu philosophy ("I can because we can") with Constitutional AI principles ensuring ethical, transparent, and fair technology.

### Architecture

**Monorepo Structure:**
- `apps/` - Frontend applications (Next.js 16, React 19, TypeScript)
  - `azora-sapiens/` - Main education platform with Elara Canvas tools
  - `azora-sapiens-mobile/` - React Native mobile app
  - `azora-master/` - Master platform interface
- `services/` - Backend microservices (Express.js, Node.js, TypeScript)
  - `azora-api-gateway/` - API routing and authentication
  - `azora-education/` - Course and learning management
  - `azora-blockchain/` - Blockchain integration and smart contracts
  - `azora-auth/` - User authentication and authorization
  - `azora-treasury/` - Financial management and CitadelFund
  - 50+ additional services for AI, payments, marketplace, etc.
- `packages/` - Shared libraries and design system
- `prisma/` - Database schema and migrations
- `contracts/` - Smart contracts (Solidity)

**Key Technologies:**
- **Frontend**: Next.js 16, React 19, TypeScript 5, Tailwind CSS, Framer Motion
- **Backend**: Node.js 20, Express.js, TypeScript, Prisma ORM
- **Database**: PostgreSQL with Prisma
- **Blockchain**: Ethereum/Polygon, Web3.js/Ethers.js, Solidity
- **AI**: Constitutional AI framework, OpenAI/Anthropic integration
- **Testing**: Jest, Playwright, K6 load testing
- **Deployment**: Docker, Railway, Kubernetes

### Core Principles

1. **Ubuntu Philosophy**: All code must prioritize community benefit and collective success
2. **Constitutional AI**: Ethical guardrails, transparency, fairness, and accountability
3. **Antifragile Architecture**: Self-healing systems with Chaos Monkey and Phoenix Server
4. **Proof-of-Value Mining**: Token rewards for contributions (code, content, community)
5. **Blockchain Integration**: Immutable records, NFT certificates, decentralized finance

## Development Workflow

### Getting Started
```bash
# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Configure: DATABASE_URL, JWT_SECRET, STRIPE_API_KEY, BLOCKCHAIN_RPC_URL

# Start development
npm run dev  # Starts core services and apps

# Run tests
npm test
npm run test:coverage

# Load testing
npm run load:test
```

### Service Development
Each service follows this structure:
```
services/[service-name]/
├── src/
│   ├── controllers/     # API endpoints
│   ├── services/        # Business logic
│   ├── models/          # Data models/types
│   ├── middleware/      # Express middleware
│   └── utils/           # Helper functions
├── __tests__/           # Unit tests
├── package.json
└── README.md
```

### Database Operations
```bash
# Generate Prisma client
npx prisma generate

# Create migration
npx prisma migrate dev --name descriptive-name

# Reset database
npx prisma migrate reset

# Seed data
npx prisma db seed
```

### Testing Requirements
- **Unit Tests**: Jest with 80%+ coverage
- **Integration Tests**: API endpoint testing
- **E2E Tests**: Playwright for critical user flows
- **Load Tests**: K6 for performance validation
- **Constitutional AI Tests**: Ethical compliance validation

## Coding Standards

### TypeScript/JavaScript
```typescript
// ✅ Preferred patterns
interface UserProfile {
  id: string;
  ubuntuPrinciples: UbuntuPrinciple[];
  constitutionalScore: number;
}

async function validateUbuntuAlignment(action: UserAction): Promise<boolean> {
  const principles = await getUbuntuPrinciples();
  return principles.every(p => 
    action.alignsWith(p.principle)
  );
}

// ❌ Avoid
function validate(action) {  // Missing types
  return getPrinciples().then(p =>  // Promise chains over async/await
    p.every(principle => action.alignsWith(principle))
  );
}
```

### Key Conventions
- **Async/Await**: Always prefer over Promise chains
- **Type Safety**: No `any` types, proper interfaces
- **Error Handling**: Try/catch with specific error types
- **Naming**: PascalCase for classes/interfaces, camelCase for functions/variables
- **Documentation**: JSDoc for all public APIs
- **Ubuntu Integration**: Include Ubuntu philosophy comments where relevant

### Constitutional AI Compliance
All AI-related code must:
```typescript
// Validate actions against Ubuntu principles
const validation = await constitutionalAI.validateAction(action, {
  principles: ['community-benefit', 'fairness', 'transparency'],
  vetoThreshold: 0.8
});

if (!validation.approved) {
  throw new ConstitutionalViolationError(validation.reason);
}
```

## Common Patterns

### API Endpoints
```typescript
// Controller pattern
export class EducationController {
  @route('GET', '/courses')
  @authenticate()
  @ubuntuRateLimit()
  async getCourses(req: Request, res: Response) {
    const courses = await this.educationService.getCourses(req.user.id);
    res.json(courses);
  }
}
```

### Service Layer
```typescript
// Business logic with Ubuntu integration
export class EducationService {
  async enrollInCourse(userId: string, courseId: string) {
    // Validate Ubuntu alignment
    const alignment = await this.ubuntuService.checkAlignment(userId, 'learning');
    
    if (alignment.score < 0.7) {
      throw new UbuntuAlignmentError('Learning benefits community');
    }

    // Enroll and reward
    const enrollment = await this.enrollmentRepo.create({ userId, courseId });
    await this.tokenService.rewardValue(userId, 'learning', 10);
    
    return enrollment;
  }
}
```

### Database Models
```typescript
// Prisma schema pattern
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  ubuntuScore Float  @default(0.0)
  constitutionalCompliance Json?
  createdAt DateTime @default(now())
  
  @@map("users")
}
```

### Blockchain Integration
```typescript
// Smart contract interaction
export class BlockchainService {
  async mintCertificate(userId: string, courseId: string) {
    const contract = this.getCertificateContract();
    const tx = await contract.mint(userId, courseId, {
      gasLimit: 200000
    });
    
    await tx.wait();
    return tx.hash;
  }
}
```

## Critical Workflows

### Adding a New Service
1. Create service directory structure
2. Implement basic health endpoint (`GET /health`)
3. Add to API gateway routing
4. Create database migrations if needed
5. Add authentication middleware
6. Implement Ubuntu rate limiting
7. Add comprehensive tests
8. Update documentation

### Implementing AI Features
1. Wrap with Constitutional AI validation
2. Add bias detection and fairness checks
3. Implement transparency logging
4. Include self-critique mechanisms
5. Add veto capabilities for harmful outputs
6. Test ethical boundaries thoroughly

### Financial Operations
1. All transactions must route through CitadelFund (10% to public goods)
2. Implement Proof-of-Value mining rewards
3. Use blockchain for immutable records
4. Add Constitutional AI oversight for fairness
5. Include Ubuntu benefit calculations

### Deployment Process
```bash
# Pre-deployment checks
npm run deploy:pre-check

# Build and deploy
npm run deploy:production

# Post-deployment validation
npm run deploy:post-check

# Load testing
npm run validate:load
```

## Integration Points

### External Services
- **Stripe**: Payment processing with CitadelFund integration
- **Blockchain RPC**: Ethereum/Polygon node connections
- **AI APIs**: OpenAI/Anthropic with Constitutional AI wrappers
- **Email/SMS**: SendGrid/Twilio for notifications
- **File Storage**: AWS S3/Google Cloud Storage
- **Search**: Elasticsearch for course/job discovery

### Cross-Service Communication
- **API Gateway**: All external requests route through gateway
- **Event Bus**: Redis-based pub/sub for service communication
- **Service Mesh**: Mutual TLS and observability
- **Database**: Shared PostgreSQL with Prisma
- **Cache**: Redis for performance optimization

### Security Considerations
- JWT authentication with refresh tokens
- Ubuntu-aware rate limiting
- Input validation and sanitization
- Constitutional AI security monitoring
- Blockchain-based audit trails
- GDPR compliance for data handling

## Common Pitfalls to Avoid

1. **Missing Ubuntu Integration**: All user-facing features must demonstrate community benefit
2. **Constitutional AI Bypass**: Never implement AI features without ethical guardrails
3. **Blockchain Disconnection**: Financial operations must have on-chain records
4. **Test Coverage Gaps**: New code without tests breaks the antifragile architecture
5. **Documentation Debt**: Undocumented code cannot be maintained by the community
6. **Performance Regressions**: Changes must maintain sub-200ms API response times

## Getting Help

- **README.md**: Platform overview and getting started
- **API-SPECIFICATIONS.md**: Complete API documentation
- **SERVICES-IMPLEMENTATION-CHECKLIST.md**: Service development guide
- **QUICK-START-GUIDE.md**: Development setup and workflows
- **MASTER-IMPLEMENTATION-PLAN.md**: Architecture and implementation roadmap
- **CONTRIBUTING.md**: Development standards and contribution process

Remember: Every line of code should advance Ubuntu philosophy and Constitutional AI principles. Build for collective success, not individual gain.</content>
<parameter name="filePath">c:\Users\Azora Sapiens\Documents\azora\.github\copilot-instructions.md