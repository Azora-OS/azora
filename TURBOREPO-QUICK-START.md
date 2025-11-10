# 🚀 TURBOREPO QUICK START GUIDE

**For:** Azora OS Development Team  
**Status:** Ready for Implementation

---

## ⚡ Quick Commands

### Installation

```bash
# Install Turborepo (already in package.json)
npm install

# Verify installation
npx turbo --version
```

### Basic Usage

```bash
# Build all apps and services
npm run build
# or
turbo build

# Run dev mode for all
npm run dev
# or
turbo dev

# Run tests
npm run test:turbo
# or
turbo test

# Lint all
npm run lint
# or
turbo lint

# Type check all
npm run type-check
# or
turbo type-check
```

### Filtering (Work on Specific Packages)

```bash
# Build only a specific app
turbo build --filter=@azora/app

# Build app and its dependencies
turbo build --filter=@azora/app...

# Build app and dependents
turbo build --filter=...@azora/app

# Build multiple packages
turbo build --filter=@azora/app --filter=@azora/api-gateway
```

### Cache Management

```bash
# Clear cache
npm run clean
# or
turbo clean

# See what's cached
turbo build --dry-run

# Force rebuild (ignore cache)
turbo build --force
```

---

## 📋 Migration Checklist

### For Each App/Service

1. **Update `package.json`**
   ```json
   {
     "scripts": {
       "build": "next build",  // or appropriate build command
       "dev": "next dev",
       "lint": "next lint",
       "type-check": "tsc --noEmit"
     }
   }
   ```

2. **Test Build**
   ```bash
   turbo build --filter=your-package-name
   ```

3. **Verify Cache**
   ```bash
   # Run twice - second should be instant
   turbo build --filter=your-package-name
   turbo build --filter=your-package-name
   ```

---

## 🎯 Common Workflows

### Development

```bash
# Start all dev servers
turbo dev

# Start specific app
turbo dev --filter=@azora/app

# Start app + dependencies
turbo dev --filter=@azora/app...
```

### Building for Production

```bash
# Build everything
turbo build

# Build specific app
turbo build --filter=@azora/app

# Build with dependencies
turbo build --filter=@azora/app...
```

### Testing

```bash
# Run all tests
turbo test

# Run tests for specific package
turbo test --filter=@azora/app

# Run tests with coverage
turbo test --filter=@azora/app -- --coverage
```

---

## 🔧 Troubleshooting

### Cache Not Working

```bash
# Clear cache and rebuild
turbo clean
turbo build
```

### Build Failing

```bash
# See detailed output
turbo build --verbose

# See what would run
turbo build --dry-run
```

### Dependencies Not Building

```bash
# Build dependencies first
turbo build --filter=...@azora/app
```

---

## 📚 Resources

- **Turborepo Docs:** https://turbo.build/repo/docs
- **Integration Plan:** `TURBOREPO-INTEGRATION-PLAN.md`
- **Architect Decisions:** `ARCHITECT-DECISIONS-PACKAGE-CDN-BUILD.md`

---

**"Ngiyakwazi ngoba sikwazi" - I can because we can**
