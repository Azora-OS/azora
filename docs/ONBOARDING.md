# 🚀 Developer Onboarding Guide

Welcome to Azora OS! This guide will get you up and running in 30 minutes.

---

## 📋 Prerequisites

### Required Software
- **Node.js:** 20.x or higher
- **npm:** 10.x or higher
- **PostgreSQL:** 15.x
- **Redis:** 7.x
- **Git:** Latest version
- **Docker:** (Optional but recommended)

### Accounts Needed
- GitHub account (for code access)
- AWS account (for deployment)
- Stripe account (for payments)
- OpenAI API key (for AI features)

---

## ⚡ Quick Start (5 minutes)

### 1. Clone Repository
```bash
git clone https://github.com/Sizwe780/azora-os.git
cd azora-os
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Environment
```bash
cp .env.example .env
# Edit .env with your values
```

### 4. Setup Databases
```bash
npm run db:setup
npm run db:migrate
npm run db:seed
```

### 5. Start Development
```bash
npm run dev
```

**Done!** Services running at:
- API Gateway: http://localhost:4000
- Auth Service: http://localhost:4001
- Education: http://localhost:4002
- Mint: http://localhost:4003
- Forge: http://localhost:4004

---

## 🏗️ Project Structure

```
azora/
├── apps/                   # Frontend applications
│   ├── student-portal/    # Student UI
│   ├── enterprise-ui/     # Business UI
│   └── marketplace-ui/    # Job marketplace
├── services/              # Backend microservices
│   ├── api-gateway/       # API Gateway
│   ├── auth-service/      # Authentication
│   ├── azora-education/   # Education LMS
│   ├── azora-mint/        # Finance & tokens
│   └── azora-forge/       # Job marketplace
├── packages/              # Shared libraries
│   ├── test-utils/        # Testing utilities
│   └── ui/                # UI components
├── docs/                  # Documentation
├── tests/                 # Test suites
└── scripts/               # Utility scripts
```

---

## 🔧 Development Workflow

### Daily Workflow
1. **Pull latest changes**
   ```bash
   git pull origin develop
   ```

2. **Create feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make changes and test**
   ```bash
   npm run dev          # Start services
   npm test             # Run tests
   npm run lint         # Check code quality
   ```

4. **Commit and push**
   ```bash
   git add .
   git commit -m "feat: your feature description"
   git push origin feature/your-feature-name
   ```

5. **Create Pull Request**
   - Go to GitHub
   - Create PR to `develop` branch
   - Request review
   - Wait for CI to pass

### Commit Message Convention
```
feat: Add new feature
fix: Fix bug
docs: Update documentation
test: Add tests
refactor: Refactor code
style: Format code
chore: Update dependencies
```

---

## 🧪 Testing

### Run Tests
```bash
npm test                    # All tests
npm run test:unit          # Unit tests
npm run test:integration   # Integration tests
npm run test:e2e          # E2E tests
npm run test:watch        # Watch mode
```

### Write Tests
```typescript
import { describe, it, expect } from '@jest/globals';
import { userFactory } from '@azora/test-utils';

describe('Feature', () => {
  it('should work correctly', () => {
    const user = userFactory.build();
    expect(user.email).toBeDefined();
  });
});
```

---

## 🗄️ Database

### Common Commands
```bash
npm run db:migrate         # Run migrations
npm run db:seed           # Seed data
npm run db:studio         # Open Prisma Studio
npm run db:reset          # Reset database
```

### Create Migration
```bash
cd services/your-service
npx prisma migrate dev --name your_migration_name
```

---

## 🐛 Debugging

### VS Code Launch Config
```json
{
  "type": "node",
  "request": "launch",
  "name": "Debug Service",
  "program": "${workspaceFolder}/services/your-service/index.js",
  "env": {
    "NODE_ENV": "development"
  }
}
```

### Debug Tests
```bash
node --inspect-brk node_modules/.bin/jest --runInBand
```

### View Logs
```bash
# Service logs
tail -f services/api-gateway/logs/app.log

# Docker logs
docker logs -f azora-gateway
```

---

## 📚 Key Resources

### Documentation
- [Architecture](./ARCHITECTURE.md)
- [API Documentation](./API-DOCUMENTATION.md)
- [Testing Guide](./TESTING-GUIDE.md)
- [Deployment Guide](./deployment/)

### Tools
- [Prisma Studio](http://localhost:5555) - Database GUI
- [Redis Commander](http://localhost:8081) - Redis GUI
- [Grafana](http://localhost:3000) - Metrics dashboard

### Communication
- **Slack:** #azora-dev
- **GitHub:** Issues and PRs
- **Email:** dev@azora.world

---

## 🎓 Learning Path

### Week 1: Setup & Basics
- [ ] Complete this onboarding
- [ ] Run all services locally
- [ ] Explore codebase
- [ ] Read architecture docs
- [ ] Fix a "good first issue"

### Week 2: Deep Dive
- [ ] Understand service architecture
- [ ] Learn database schema
- [ ] Write your first test
- [ ] Review PRs
- [ ] Implement small feature

### Week 3: Contribution
- [ ] Pick a feature from backlog
- [ ] Design and implement
- [ ] Write comprehensive tests
- [ ] Document your work
- [ ] Deploy to staging

### Month 1 Goal
- Comfortable with codebase
- Can work independently
- Contributing regularly
- Helping other developers

---

## 🤝 Team Practices

### Code Review
- All code must be reviewed
- At least one approval required
- CI must pass
- No merge conflicts

### Testing
- 80%+ coverage required
- All tests must pass
- Write tests first (TDD)
- Test edge cases

### Documentation
- Update docs with code changes
- Add inline comments for complex logic
- Keep README current
- Document breaking changes

---

## 🚨 Common Issues

### Port Already in Use
```bash
# Find process
lsof -i :4000

# Kill process
kill -9 <PID>
```

### Database Connection Failed
```bash
# Check PostgreSQL is running
pg_isready

# Restart PostgreSQL
brew services restart postgresql
```

### Redis Connection Failed
```bash
# Check Redis is running
redis-cli ping

# Start Redis
redis-server
```

### Module Not Found
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

---

## 🎯 Your First Task

Ready to contribute? Here's your first task:

1. **Find a "good first issue"** on GitHub
2. **Assign it to yourself**
3. **Create a branch**
4. **Implement the fix**
5. **Write tests**
6. **Create a PR**
7. **Get it merged!**

---

## 📞 Getting Help

### Stuck? Ask for help!
- **Slack:** #azora-dev-help
- **GitHub:** Comment on your issue
- **Email:** dev-support@azora.world
- **Pair Programming:** Schedule with mentor

### Office Hours
- **Daily Standup:** 9:00 AM
- **Code Review:** 2:00 PM
- **Tech Talk:** Friday 4:00 PM

---

## ✅ Onboarding Checklist

- [ ] Repository cloned
- [ ] Dependencies installed
- [ ] Environment configured
- [ ] Databases setup
- [ ] Services running locally
- [ ] Tests passing
- [ ] VS Code configured
- [ ] GitHub access confirmed
- [ ] Slack joined
- [ ] First PR created
- [ ] Code review completed
- [ ] Documentation read

---

**Welcome to the team! Let's build something amazing together! 🚀**
