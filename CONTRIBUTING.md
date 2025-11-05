<!--
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.

Document ID: AZORA-ROOT-DOC-NINGNIW9
Version: 1.0
Date: 2025-11-03
Author: Azora OS Team

This document is proprietary intellectual property of Azora ES (Pty) Ltd.
Unauthorized reproduction, distribution, or modification is prohibited.
-->

# 🤝 Contributing to Azora OS

Thank you for your interest in contributing to Azora OS! We welcome contributions from everyone, regardless of experience level.

---

## 📖 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Setup](#development-setup)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Community](#community)

---

## 📜 Code of Conduct

### Our Pledge

We pledge to make participation in Azora OS a harassment-free experience for everyone, regardless of:

- Age, body size, disability, ethnicity
- Gender identity and expression
- Level of experience
- Nationality, personal appearance, race
- Religion, or sexual identity and orientation

### Our Standards

**Positive behavior includes:**
- Using welcoming and inclusive language
- Being respectful of differing viewpoints
- Gracefully accepting constructive criticism
- Focusing on what is best for the community
- Showing empathy towards other community members

**Unacceptable behavior includes:**
- Trolling, insulting/derogatory comments
- Public or private harassment
- Publishing others' private information
- Other conduct which could reasonably be considered inappropriate

### Our Responsibilities

Project maintainers are responsible for clarifying standards and taking appropriate action in response to unacceptable behavior.

---

## 🎯 How Can I Contribute?

### 1. Reporting Bugs

**Before submitting a bug report:**
- Check the [existing issues](https://github.com/Azora-OS-AI/azora-os/issues)
- Use the latest version
- Try to reproduce the issue

**Bug Report Template:**
```markdown
**Description:** Clear description of the bug

**Steps to Reproduce:**
1. Go to '...'
2. Click on '....'
3. See error

**Expected Behavior:** What should happen

**Actual Behavior:** What actually happens

**Environment:**
- OS: [e.g., Ubuntu 22.04]
- Browser: [e.g., Chrome 120]
- Node version: [e.g., 18.17.0]

**Screenshots:** If applicable

**Additional Context:** Any other relevant information
```

### 2. Suggesting Features

**Feature Request Template:**
```markdown
**Feature Name:** Clear, descriptive title

**Problem:** What problem does this solve?

**Proposed Solution:** How should it work?

**Alternatives Considered:** Other approaches you've thought about

**Additional Context:** Mockups, examples, etc.
```

### 3. Contributing Code

We welcome code contributions! Here's how:

**Good First Issues:**
- Look for issues labeled `good first issue`
- These are great for newcomers
- Ask questions if needed!

**Areas of Contribution:**
- 🐛 Bug fixes
- ✨ New features
- 📝 Documentation
- 🌍 Translations
- 🎨 UI/UX improvements
- 🧪 Tests
- ♿ Accessibility enhancements

---

## 💻 Development Setup

### Prerequisites

- **Node.js** 18+ and npm 9+
- **Git** 2.34+
- **Code Editor** (VS Code recommended)

### Setup Steps

```bash
# 1. Fork the repository on GitHub

# 2. Clone your fork
git clone https://github.com/YOUR_USERNAME/azora-os.git
cd azora-os

# 3. Add upstream remote
git remote add upstream https://github.com/Azora-OS-AI/azora-os.git

# 4. Install dependencies
npm install

# 5. Create a feature branch
git checkout -b feature/your-feature-name

# 6. Start development server
npm run dev

# Visit http://localhost:3000
```

### Keeping Your Fork Updated

```bash
# Fetch upstream changes
git fetch upstream

# Merge upstream main into your main
git checkout main
git merge upstream/main

# Push to your fork
git push origin main
```

---

## 📏 Coding Standards

### TypeScript

- **Use TypeScript** for all new code
- **Define types/interfaces** for all props and functions
- **Avoid `any`** - use proper types
- **Use const** over let when possible

**Example:**
```typescript
// ✅ Good
interface UserProps {
  name: string;
  email: string;
  age: number;
}

const User: React.FC<UserProps> = ({ name, email, age }) => {
  return <div>{name}</div>;
};

// ❌ Bad
const User = (props: any) => {
  return <div>{props.name}</div>;
};
```

### React Components

- **Functional components** with hooks
- **Props interface** above component
- **Descriptive names** in PascalCase
- **Single responsibility** per component

**Example:**
```typescript
interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
}

export function Button({ 
  label, 
  onClick, 
  variant = 'primary',
  disabled = false 
}: ButtonProps) {
  return (
    <button 
      onClick={onClick}
      disabled={disabled}
      className={`btn btn-${variant}`}
    >
      {label}
    </button>
  );
}
```

### File Naming

- **Components:** PascalCase (`Button.tsx`, `UserProfile.tsx`)
- **Utilities:** camelCase (`formatDate.ts`, `apiClient.ts`)
- **Pages:** kebab-case (`user-profile.tsx`, `about-us.tsx`)
- **Tests:** Same as file + `.test.ts` (`Button.test.tsx`)

### Code Style

```typescript
// ✅ Good: Clear, readable, typed
async function fetchUserData(userId: string): Promise<User> {
  try {
    const response = await fetch(`/api/users/${userId}`);
    if (!response.ok) throw new Error('Failed to fetch');
    return await response.json();
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
}

// ❌ Bad: No types, poor error handling
async function fetchUserData(userId) {
  const response = await fetch(`/api/users/${userId}`);
  return await response.json();
}
```

### Linting & Formatting

```bash
# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format

# Type check
npm run type-check
```

**Automated Checks:**
- ESLint runs on commit (via Husky)
- Prettier formats on save
- TypeScript checks before build

---

## 📝 Commit Guidelines

We follow **Conventional Commits** for clear, automated versioning.

### Commit Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

| Type | Description | Example |
|------|-------------|---------|
| `feat` | New feature | `feat(auth): Add Google OAuth login` |
| `fix` | Bug fix | `fix(ui): Resolve button alignment issue` |
| `docs` | Documentation | `docs(readme): Update installation steps` |
| `style` | Formatting (no code change) | `style(button): Format button component` |
| `refactor` | Code restructuring | `refactor(api): Simplify user endpoint` |
| `test` | Add/update tests | `test(auth): Add login flow tests` |
| `chore` | Maintenance | `chore(deps): Update Next.js to 14.2.5` |
| `perf` | Performance improvement | `perf(images): Optimize image loading` |

### Scope

Optional but recommended: `auth`, `ui`, `api`, `docs`, etc.

### Examples

```bash
# ✅ Good commits
feat(education): Add K-12 interactive simulations
fix(auth): Resolve session timeout issue
docs(api): Add authentication endpoint documentation
refactor(components): Extract Button variants to separate file
test(auth): Add unit tests for login validation

# ❌ Bad commits
update stuff
fix bug
changes
WIP
```

### Commit Best Practices

- **Keep commits focused** - one logical change per commit
- **Write clear messages** - explain "why" not just "what"
- **Use present tense** - "Add feature" not "Added feature"
- **Reference issues** - `Closes #123` in footer

---

## 🔄 Pull Request Process

### Before Submitting

**Checklist:**
- [ ] Code follows our style guide
- [ ] All tests pass (`npm test`)
- [ ] Linting passes (`npm run lint`)
- [ ] Type checking passes (`npm run type-check`)
- [ ] Documentation updated (if needed)
- [ ] Commit messages follow convention
- [ ] Branch is up to date with main

### Creating a Pull Request

1. **Push your branch** to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```

2. **Open a PR** on GitHub

3. **Fill out the template:**
   ```markdown
   ## Description
   Clear description of changes

   ## Type of Change
   - [ ] Bug fix
   - [ ] New feature
   - [ ] Breaking change
   - [ ] Documentation update

   ## Testing
   How has this been tested?

   ## Screenshots
   If applicable

   ## Checklist
   - [ ] Code follows style guide
   - [ ] Tests added/updated
   - [ ] Documentation updated
   - [ ] All checks passing
   ```

### Review Process

1. **Automated checks** run (CI/CD)
2. **Maintainers review** your code
3. **Feedback addressed** (if any)
4. **Approval** from maintainer(s)
5. **Merge** into main

### After Merge

- Your contribution is in the main branch! 🎉
- Delete your feature branch
- Update your fork
- Consider tackling another issue!

---

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test Button.test.tsx
```

### Writing Tests

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders with correct label', () => {
    render(<Button label="Click me" onClick={() => {}} />);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button label="Click" onClick={handleClick} />);
    
    fireEvent.click(screen.getByText('Click'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled when disabled prop is true', () => {
    render(<Button label="Click" onClick={() => {}} disabled />);
    expect(screen.getByText('Click')).toBeDisabled();
  });
});
```

---

## 🌍 Translation

Help us serve everyone by translating Azora OS!

### Process

1. Check if your language exists in `/locales`
2. If not, copy `/locales/en.json` to `/locales/YOUR_LANG.json`
3. Translate all strings
4. Test the translation
5. Submit a PR

**Translation Guidelines:**
- Keep the same keys
- Maintain formatting placeholders (`{name}`, `{count}`, etc.)
- Use culturally appropriate phrases
- Test thoroughly

---

## 💬 Community

### Communication Channels

- **GitHub Issues** - Bug reports, feature requests
- **GitHub Discussions** - General questions, ideas
- **Discord** - Real-time chat (coming soon)
- **Twitter** - Updates and announcements

### Getting Help

**Stuck? Don't worry!**
- Check the [documentation](./docs)
- Search [existing issues](https://github.com/Azora-OS-AI/azora-os/issues)
- Ask in GitHub Discussions
- Reach out to maintainers

**We're here to help! Everyone was a beginner once.** 🌱

---

## 🏆 Recognition

### Contributors

All contributors are listed in our [CONTRIBUTORS.md](./CONTRIBUTORS.md) and in GitHub's contributors graph.

### Special Recognition

- **Top Contributors** featured in README
- **Significant Features** mentioned in CHANGELOG
- **Community Champions** invited to maintainer team

---

## 📄 License

By contributing to Azora OS, you agree that your contributions will be licensed under the Azora Proprietary License.

---

## 🙏 Thank You!

Your contributions make Azora OS possible. Whether you:

- Fix a typo
- Translate a page
- Add a feature
- Report a bug
- Share the project

**You are helping serve 8 billion humans! Thank you!** 🌍

---

**From Africa 🇿🇦 For Humanity 🌍 Unto God's Glory ✨**

**Together, we build. Together, we serve. Together, we thrive.**

**AMEN! 🙏**
