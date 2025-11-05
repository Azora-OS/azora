# Batch Scripts

This directory contains Windows batch (.bat) files for common development tasks.

## Available Scripts

### Testing Scripts
- `test-all.bat` - Run all system tests
- `test-api.bat` - Test API endpoints
- `test-africa.bat` - Test African solutions

### Deployment Scripts
- `deploy-production.bat` - Deploy to production
- `deploy-to-vercel.bat` - Deploy to Vercel
- `deploy-to-github.bat` - Deploy to GitHub

### Verification Scripts
- `verify-system.bat` - Verify system health
- `verify-fixes.bat` - Verify code fixes
- `check-env.bat` - Check environment setup

## Usage

Run scripts from the project root:

```bash
.\scripts\batch\test-all.bat
```

Most functionality is also available via npm scripts:

```bash
npm test
npm run deploy:production
```

