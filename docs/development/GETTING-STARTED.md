# 🚀 Getting Started with Azora Development

Welcome! This guide will help you set up your development environment and make your first contribution to Azora.

---

## 📋 Prerequisites

Before you begin, ensure you have:

```bash
✅ Node.js 20+ (https://nodejs.org/)
✅ PostgreSQL 14+ (https://www.postgresql.org/)
✅ Redis 7+ (https://redis.io/)
✅ Git (https://git-scm.com/)
✅ A code editor (VS Code recommended)
```

---

## 🔧 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/azora/azora-os.git
cd azora-os
```

### 2. Install Dependencies

```bash
# Install root dependencies
npm install

# Install service dependencies (optional, for specific service)
cd services/azora-mint
npm install
```

### 3. Set Up Environment

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your configuration
nano .env  # or use your preferred editor
```

**Required Environment Variables:**
```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/azora
REDIS_URL=redis://localhost:6379

# Authentication
JWT_SECRET=your-secret-key-here

# APIs (optional for development)
OPENAI_API_KEY=sk-...
STRIPE_SECRET_KEY=sk_test_...
```

### 4. Initialize Database

```bash
# Run migrations
npm run db:migrate

# Seed database (optional)
npm run db:seed
```

### 5. Start Development

```bash
# Start all services
npm run dev:all

# Or start specific services
npm run dev:mint          # Finance service
npm run dev:education     # Education service
npm run dev:forge         # Marketplace service
```

---

## 📁 Repository Structure

```
azora-os/
├── services/           # Backend microservices
│   ├── shared/         # Shared utilities
│   ├── azora-mint/     # Finance core
│   ├── azora-education/# Education core
│   └── ...
├── apps/               # Frontend applications
│   ├── student-portal/ # Main student app
│   ├── job-board/      # Jobs app
│   └── ...
├── packages/           # Shared packages
├── contracts/          # Smart contracts
├── docs/               # Documentation
└── tests/              # E2E tests
```

---

## 🛠️ Development Workflow

### 1. Create a Feature Branch

```bash
git checkout -b feature/your-feature-name
```

### 2. Make Your Changes

Edit code, add tests, update documentation.

### 3. Run Tests

```bash
# Run all tests
npm test

# Run tests for specific service
npm test services/azora-mint

# Run with coverage
npm run test:coverage
```

### 4. Lint Your Code

```bash
# Check code quality
npm run lint

# Auto-fix issues
npm run lint:fix
```

### 5. Commit Your Changes

```bash
git add .
git commit -m "feat: add amazing feature"

# Follow conventional commits:
# feat: new feature
# fix: bug fix
# docs: documentation
# test: tests
# refactor: code refactoring
```

### 6. Push and Create PR

```bash
git push origin feature/your-feature-name

# Then create a Pull Request on GitHub
```

---

## 🧪 Testing

### Unit Tests

```bash
# Run unit tests
npm run test:unit

# Watch mode
npm run test:watch
```

### Integration Tests

```bash
npm run test:integration
```

### E2E Tests

```bash
npm run test:e2e
```

---

## 📝 Code Standards

### TypeScript

- ✅ Use TypeScript strict mode
- ✅ No `any` types (use proper types)
- ✅ Interface over type for objects

### Logging

```typescript
// ❌ DON'T
console.log('User created');

// ✅ DO
import { Logger } from '@azora/shared/utils/logger';
const logger = new Logger('UserService');
logger.info('User created', { userId: user.id });
```

### Error Handling

```typescript
// ❌ DON'T
throw new Error('User not found');

// ✅ DO
import { NotFoundError } from '@azora/shared/utils/errors';
throw new NotFoundError('User', userId);
```

See [CODE-STANDARDS.md](./CODE-STANDARDS.md) for complete guidelines.

---

## 🐛 Debugging

### VS Code Configuration

Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Mint Service",
      "program": "${workspaceFolder}/services/azora-mint/src/index.ts",
      "runtimeArgs": ["-r", "ts-node/register"],
      "env": {
        "NODE_ENV": "development"
      }
    }
  ]
}
```

### Logs

```bash
# View logs for specific service
npm run logs:mint

# View all logs
npm run logs:all
```

---

## 🔐 Security

- ✅ Never commit API keys or secrets
- ✅ Use `.env` for sensitive data
- ✅ Run `npm audit` before committing
- ✅ Follow security best practices

---

## 📚 Learning Resources

- **Architecture:** [../architecture/](../architecture/)
- **API Docs:** Auto-generated at `http://localhost:3000/api-docs`
- **Database Schema:** See `services/*/migrations/`
- **Code Examples:** See `examples/` directory

---

## 🆘 Common Issues

### Issue: Port already in use

```bash
# Kill process on port 3000
npx kill-port 3000
```

### Issue: Database connection failed

```bash
# Check PostgreSQL is running
pg_ctl status

# Restart PostgreSQL
brew services restart postgresql  # macOS
sudo service postgresql restart   # Linux
```

### Issue: Redis connection failed

```bash
# Check Redis is running
redis-cli ping

# Start Redis
redis-server
```

---

## 🎯 What to Work On

### Good First Issues

Check GitHub for issues labeled `good-first-issue`:
- Bug fixes
- Documentation improvements
- Test additions
- UI enhancements

### High Priority

- Add missing tests (target: 80% coverage)
- Improve documentation
- Performance optimizations
- Security enhancements

---

## 💬 Getting Help

- **Discord:** #development channel
- **GitHub Discussions:** Ask questions
- **Weekly Sync:** Join our weekly dev sync (Mondays 10am UTC)

---

## ✅ Checklist

Before submitting your PR:

- [ ] Code follows style guidelines
- [ ] Tests added for new features
- [ ] All tests passing
- [ ] Lint checks passing
- [ ] Documentation updated
- [ ] No console.log in code
- [ ] Environment variables documented
- [ ] Commit messages follow convention

---

**Happy Coding!** 🚀

**Questions?** Reach out on Discord or open a GitHub Discussion.
