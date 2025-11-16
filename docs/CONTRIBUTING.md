# Contributing to Azora OS

**Ubuntu Philosophy**: *"My contribution strengthens our foundation"*

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/azora-os.git`
3. Install dependencies: `npm install`
4. Create a branch: `git checkout -b feat/your-feature`

## Commit Message Format

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting
- `refactor`: Code restructuring
- `test`: Adding tests
- `chore`: Maintenance
- `ubuntu`: Ubuntu philosophy integration

### Scopes
- `education`, `finance`, `marketplace`, `security`, `infrastructure`, `ai-family`, `governance`, `docs`, `deps`

### Examples
```bash
feat(education): add AI tutor chat interface

Implements real-time chat with Elara AI tutor
Includes message history and context awareness

Closes #123
```

## Code Standards

### Quality Requirements
- Test coverage ≥ 80%
- All tests passing
- ESLint passing
- Prettier formatted
- TypeScript strict mode

### Before Submitting
```bash
npm run lint
npm run format
npm run test
npm run build
```

## Pull Request Process

1. Update documentation
2. Add tests for new features
3. Ensure CI passes
4. Request review from maintainers
5. Address feedback
6. Squash commits if requested

## Ubuntu Guidelines

- **Think Collectively**: How does this benefit all users?
- **Document Thoroughly**: Help others understand your work
- **Test Rigorously**: Protect the community from bugs
- **Review Kindly**: Constructive feedback strengthens us all

## Questions?

- Discord: https://discord.gg/azora
- Email: dev@azora.world
