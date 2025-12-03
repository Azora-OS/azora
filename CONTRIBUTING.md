# Contributing to Azora

> Thank you for your interest in contributing to the Azora ecosystem!

**Ubuntu Philosophy**: "My contribution strengthens our collective success"

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Testing Requirements](#testing-requirements)
- [Pull Request Process](#pull-request-process)
- [Documentation](#documentation)

## Code of Conduct

The Azora project adheres to Ubuntu philosophy: "I am because we are." We expect all contributors to:

- **Be Respectful**: Treat all community members with respect
- **Be Collaborative**: Work together towards collective success
- **Be Inclusive**: Welcome contributors of all backgrounds
- **Be Constructive**: Provide helpful, actionable feedback
- **Be Ethical**: Uphold Constitutional AI principles

See [CODE_OF_CONDUCT.md](docs/CODE_OF_CONDUCT.md) for details.

## Getting Started

### Prerequisites

- **Node.js**: 20.x or higher
- **npm**: 9.x or higher
- **PostgreSQL**: 14.x or higher
- **Docker**: 24.x or higher (optional, for containerized development)
- **Git**: 2.40.x or higher

### Fork and Clone

```bash
# Fork the repository on GitHub
# Then clone your fork
git clone https://github.com/YOUR_USERNAME/azora-os.git
cd azora-os

# Add upstream remote
git remote add upstream https://github.com/Sizwe780/azora-os.git
```

## Development Setup

### Install Dependencies

```bash
# Install all dependencies
npm install

# Install dependencies for specific service
cd services/ai-orchestrator
npm install
```

### Environment Configuration

```bash
# Copy example environment file
cp .env.example .env

# Edit .env with your configuration
# Required variables:
# - DATABASE_URL
# - JWT_SECRET
# - STRIPE_SECRET_KEY (for payment services)
```

### Hooks and local checks

Run the following to install Husky hooks and enable local secret scanning and other pre-commit checks:

```bash
# Install Husky hooks (if not set up automatically)
npm run hooks:install

# Optional: scan staged files for secrets before you commit
npm run precommit:scan

# Optional: generate TODO report
npm run scan:todos
```

### Database Setup

```bash
# Create database
createdb azora_dev

# Run migrations
npm run db:migrate

# Seed development data
npm run db:seed
```

### Start Development Services

```bash
# Start all services
npm run start:all

# Or start specific service groups
npm run start:core          # Core services only
npm run start:education     # Education services
npm run start:antifragile   # Chaos Monkey + Phoenix
```

## Development Workflow

### 1. Create a Branch

```bash
# Update your local main branch
git checkout main
git pull upstream main

# Create a feature branch
git checkout -b feature/your-feature-name

# Or for bug fixes
git checkout -b fix/bug-description
```

### Branch Naming Convention

- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `test/` - Test additions/updates
- `chore/` - Maintenance tasks

### 2. Make Changes

Follow our [Coding Standards](#coding-standards) and ensure:

- Code is well-documented
- Tests are included
- Linting passes
- Type checking passes
- Constitutional AI principles are upheld

### 3. Commit Changes

We use [Conventional Commits](https://www.conventionalcommits.org/):

```bash
# Format: <type>(<scope>): <description>

git commit -m "feat(ai-orchestrator): add model performance tracking"
git commit -m "fix(auth): resolve token refresh race condition"
git commit -m "docs(readme): update installation instructions"
```

**Commit Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Test additions/updates
- `chore`: Maintenance tasks
- `perf`: Performance improvements

### 4. Push Changes

```bash
git push origin feature/your-feature-name
```

### 5. Create Pull Request

1. Go to GitHub and create a Pull Request
2. Fill out the PR template
3. Link related issues
4. Request reviews from maintainers

## Coding Standards

### TypeScript/JavaScript

#### Style Guide

```typescript
// ✅ Good
interface User {
  id: string;
  email: string;
  name: string;
}

async function getUserById(id: string): Promise<User> {
  const user = await db.user.findUnique({ where: { id } });
  if (!user) {
    throw new Error('User not found');
  }
  return user;
}

// ❌ Bad
async function getUser(id) {
  return await db.user.findUnique({ where: { id } });
}
```

#### Best Practices

1. **Use TypeScript**: All new code should be TypeScript
2. **Type Safety**: Avoid `any`, use proper types
3. **Async/Await**: Prefer async/await over promises
4. **Error Handling**: Always handle errors properly
5. **Const by Default**: Use `const` unless reassignment needed
6. **Destructuring**: Use object/array destructuring
7. **Arrow Functions**: Prefer arrow functions for callbacks

### Code Organization

```typescript
// File structure for a service
services/
├── my-service/
│   ├── src/
│   │   ├── controllers/      # Request handlers
│   │   ├── services/         # Business logic
│   │   ├── models/           # Data models
│   │   ├── middleware/       # Express middleware
│   │   ├── utils/            # Utility functions
│   │   └── index.ts          # Entry point
│   ├── __tests__/            # Unit tests
│   ├── tests/                # Integration tests
│   ├── package.json
│   ├── tsconfig.json
│   └── README.md
```

### Naming Conventions

- **Files**: `kebab-case.ts`
- **Classes**: `PascalCase`
- **Functions**: `camelCase`
- **Constants**: `UPPER_SNAKE_CASE`
- **Interfaces**: `PascalCase` (no `I` prefix)
- **Types**: `PascalCase`

### Documentation

```typescript
/**
 * Registers a new AI model in the orchestrator
 * 
 * @param model - The model configuration
 * @returns The registered model with assigned ID
 * @throws {ValidationError} If model configuration is invalid
 * 
 * @example
 * ```typescript
 * const model = await registerModel({
 *   name: 'GPT-4',
 *   type: 'language',
 *   version: '1.0.0'
 * });
 * ```
 */
async function registerModel(model: ModelConfig): Promise<RegisteredModel> {
  // Implementation
}
```

### Linting

```bash
# Run ESLint
npm run lint

# Fix auto-fixable issues
npm run lint:fix

# Run Prettier
npm run format

# Check formatting
npm run format:check
```

### Type Checking

```bash
# Run TypeScript compiler
npm run typecheck

# Watch mode
npm run typecheck:watch
```

## Testing Requirements

### Test Coverage

All contributions must include tests:

- **New Features**: Minimum 80% coverage
- **Bug Fixes**: Test that reproduces the bug
- **Refactoring**: Maintain existing coverage

### Writing Tests

```typescript
// Unit test example
describe('ModelManager', () => {
  describe('registerModel', () => {
    it('should register a valid model', async () => {
      const model = {
        name: 'Test Model',
        type: 'language',
        version: '1.0.0'
      };

      const result = await modelManager.registerModel(model);

      expect(result).toHaveProperty('id');
      expect(result.status).toBe('active');
    });

    it('should reject invalid model', async () => {
      const invalidModel = { name: 'Invalid' };

      await expect(
        modelManager.registerModel(invalidModel)
      ).rejects.toThrow('Invalid model configuration');
    });
  });
});
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests for specific service
cd services/ai-orchestrator
npm test

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test:watch
```

See [TESTING.md](docs/TESTING.md) for comprehensive testing guide.

## Pull Request Process

### PR Checklist

Before submitting a PR, ensure:

- [ ] Code follows style guidelines
- [ ] Tests are included and passing
- [ ] Documentation is updated
- [ ] Commit messages follow conventions
- [ ] Branch is up to date with main
- [ ] No merge conflicts
- [ ] Linting passes
- [ ] Type checking passes
- [ ] Constitutional AI compliance verified

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
Describe testing performed

## Checklist
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] Linting passes
- [ ] Type checking passes

## Related Issues
Closes #123
```

### Review Process

1. **Automated Checks**: CI/CD pipeline runs automatically
2. **Code Review**: At least one maintainer review required
3. **Testing**: All tests must pass
4. **Documentation**: Documentation must be updated
5. **Approval**: Maintainer approval required
6. **Merge**: Squash and merge to main

### Review Timeline

- **Initial Review**: Within 2 business days
- **Follow-up**: Within 1 business day
- **Merge**: After approval and passing checks

## Documentation

### Service Documentation

Every service must have a comprehensive README:

```markdown
# Service Name

> Brief description

## Overview
What the service does

## API Endpoints
Complete endpoint documentation

## Configuration
Environment variables

## Dependencies
What it depends on

## Development
How to run locally

## Testing
How to test

## Deployment
How to deploy
```

See [ai-orchestrator/README.md](services/ai-orchestrator/README.md) for example.

### API Documentation

Document all API endpoints:

```typescript
/**
 * @route POST /api/models
 * @description Register a new AI model
 * @access Private
 * 
 * @body {Object} model - Model configuration
 * @body {string} model.name - Model name
 * @body {string} model.type - Model type (language|vision|code)
 * @body {string} model.version - Model version
 * 
 * @returns {Object} 201 - Registered model
 * @returns {Object} 400 - Validation error
 * @returns {Object} 500 - Server error
 */
```

### Updating Documentation

- Update relevant README files
- Update API documentation
- Update architecture diagrams if needed
- Update CHANGELOG.md

## Constitutional AI Compliance

All contributions must comply with Constitutional AI principles:

### Ethical Guidelines

1. **Fairness**: No discriminatory code or algorithms
2. **Transparency**: Code must be explainable
3. **Privacy**: Protect user data
4. **Accountability**: Clear ownership and responsibility
5. **Safety**: No harmful functionality

### Constitutional Review

Before submitting:

```bash
# Run constitutional AI check
npm run constitutional:check

# Review ethics report
npm run constitutional:report
```

## Ubuntu Tokenomics

Contributors are rewarded through Proof-of-Value mining:

- **Code Contributions**: Earn AZR tokens
- **Documentation**: Earn AZR tokens
- **Bug Reports**: Earn AZR tokens
- **Reviews**: Earn AZR tokens

See [UBUNTU-PHILOSOPHY.md](docs/UBUNTU-PHILOSOPHY.md) for details.

## Getting Help

- **Documentation**: Check [docs/](docs/)
- **Issues**: Search [GitHub Issues](https://github.com/Sizwe780/azora-os/issues)
- **Discord**: Join our [Discord community](https://discord.gg/azora)
- **Email**: dev@azora.world

## Recognition

Contributors are recognized in:

- [CONTRIBUTORS.md](CONTRIBUTORS.md)
- Monthly contributor highlights
- Ubuntu token rewards
- Special badges and roles

## License

By contributing, you agree that your contributions will be licensed under the same license as the project.

---

**Thank you for contributing to Azora!**

*"My contribution enables our collective success"* - Ubuntu Philosophy
