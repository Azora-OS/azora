# 🚀 Azora OS - Deployment Guide

## Overview

Azora OS is a complete full-stack platform featuring AI-powered services, NFT minting, learning management, and payment processing. This guide covers deployment for both development and production environments.

## Prerequisites

- **Docker & Docker Compose** (required)
- **Node.js 18+** (for development)
- **Git** (for cloning)

### API Keys Required

Create a `.env` file with the following keys:

```bash
# OpenAI API Key (for AI features)
OPENAI_API_KEY=your-openai-api-key-here

# Stripe Keys (for payment processing)
STRIPE_SECRET_KEY=your-stripe-secret-key-here
STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret-here
```

## Quick Start

### One-Command Deployment

**Linux/Mac:**
```bash
./scripts/deploy.sh
```

**Windows:**
```cmd
scripts\deploy-windows.bat
```

This will:
- ✅ Check prerequisites
- ✅ Setup databases
- ✅ Configure Nginx
- ✅ Build all services
- ✅ Run database migrations
- ✅ Start all services
- ✅ Run health checks

### Development Setup

```bash
./scripts/setup-dev.sh
```

Then use these commands:

```bash
# Start all backend services
npm run dev:services

# Start frontend in development mode
npm run dev:frontend

# Start everything
npm run dev:all
```

## Architecture

```
┌─────────────────┐    ┌─────────────────┐
│   Frontend      │────│   API Gateway   │
│   (Next.js)     │    │   (Express)     │
└─────────────────┘    └─────────────────┘
                              │
                    ┌─────────┼─────────┐
                    │         │         │
            ┌───────▼───┐ ┌───▼───┐ ┌───▼───┐
            │ Auth      │ │ Mint  │ │ LMS   │
            │ Service   │ │ Service│ │ Service│
            └───────────┘ └───────┘ └───────┘
                    │         │         │
            ┌───────▼───┐ ┌───▼───┐ ┌───▼───┐
            │ Forge     │ │ Nexus │ │ Education│
            │ Service   │ │ Service│ │ Service │
            └───────────┘ └───────┘ └───────┘
                              │
                       ┌──────▼──────┐
                       │ Payments    │
                       │ Service     │
                       └─────────────┘
                              │
                       ┌──────▼──────┐
                       │ PostgreSQL  │
                       │ Redis       │
                       └─────────────┘
```

## Services

| Service | Port | Description |
|---------|------|-------------|
| **API Gateway** | 4000 | Service orchestration & routing |
| **Auth Service** | 3001 | User authentication & JWT |
| **Mint Service** | 3002 | NFT creation & management |
| **LMS Service** | 3003 | Learning management system |
| **Forge Service** | 3004 | AI content generation |
| **Nexus Service** | 3005 | AI agent orchestration |
| **Education Service** | 3007 | Curriculum & assessments |
| **Payments Service** | 3008 | Payment processing & subscriptions |
| **Frontend** | 3000 | Next.js application |

## Database Schema

Each service has its own PostgreSQL database:

- `azora_auth` - User management
- `azora_mint` - NFT collections and tokens
- `azora_lms` - Courses, lessons, enrollments
- `azora_forge` - AI-generated content
- `azora_nexus` - AI agents and conversations
- `azora_education` - Curriculum and assessments
- `azora_payments` - Payments and subscriptions

## API Endpoints

### Authentication
```
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/profile
GET  /api/auth/verify
```

### NFT Minting
```
GET  /api/mint/collections
POST /api/mint/collections
POST /api/mint/nfts
POST /api/mint/nfts/:id/mint
```

### Learning Management
```
GET  /api/lms/courses
POST /api/lms/courses
POST /api/lms/courses/:id/enroll
GET  /api/lms/students/:id/enrollments
```

### AI Content Generation
```
POST /api/forge/generate/text
POST /api/forge/generate/image
GET  /api/forge/projects
```

### AI Agents
```
GET  /api/nexus/agents
POST /api/nexus/conversations
POST /api/nexus/conversations/:id/messages
```

### Education
```
GET  /api/education/curricula
POST /api/education/assessments
POST /api/education/certifications
```

### Payments
```
POST /api/payments/create-payment-intent
POST /api/payments/create-subscription
GET  /api/payments/users/:id/payments
```

## Development

### Running Individual Services

```bash
# Start specific service
cd services/auth-service
npm run dev

# Start database only
docker-compose up -d database redis
```

### Testing

```bash
# Run all tests
npm test

# Run specific service tests
cd services/auth-service
npm test
```

### Database Management

```bash
# Run migrations for all services
npm run db:migrate

# Generate Prisma client
npm run db:generate

# Reset database
npm run db:reset
```

## Production Deployment

### Environment Variables

Create production `.env` file:

```bash
# Production Configuration
NODE_ENV=production
DATABASE_URL=postgresql://user:password@prod-db:5432/azora_prod

# Security
JWT_SECRET=your-production-jwt-secret
OPENAI_API_KEY=your-production-openai-key
STRIPE_SECRET_KEY=your-production-stripe-secret
STRIPE_WEBHOOK_SECRET=your-production-webhook-secret

# Service URLs
AUTH_URL=https://auth.yourdomain.com
MINT_URL=https://mint.yourdomain.com
# ... etc
```

### SSL Configuration

1. Obtain SSL certificates (Let's Encrypt recommended)
2. Update `nginx/ssl/` directory
3. Modify `nginx/nginx.conf` for production

### Scaling

```yaml
# docker-compose.prod.yml
version: '3.8'
services:
  api-gateway:
    deploy:
      replicas: 3
      resources:
        limits:
          cpus: '1.0'
          memory: 1G

  # Add load balancer, monitoring, etc.
```

### Monitoring

```bash
# Health checks
curl http://localhost:4000/health

# Logs
docker-compose logs -f api-gateway

# Metrics (add Prometheus/Grafana)
```

## Troubleshooting

### Common Issues

1. **Port conflicts**: Change ports in `docker-compose.yml`
2. **Database connection**: Check PostgreSQL logs
3. **API key errors**: Verify `.env` file
4. **Memory issues**: Increase Docker memory limit

### Logs

```bash
# View all logs
docker-compose logs

# View specific service logs
docker-compose logs auth-service

# Follow logs
docker-compose logs -f api-gateway
```

### Reset Everything

```bash
# Stop and remove everything
docker-compose down -v --remove-orphans

# Clean up
docker system prune -a
```

## Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Run tests: `npm test`
5. Submit pull request

## License

PROPRIETARY - Azora ES (Pty) Ltd

## Support

For support, contact the Azora development team.