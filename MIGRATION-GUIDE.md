# Migration Guide: Repository Restructuring

This guide helps developers navigate the new repository structure after the major restructuring.

## Quick Reference

### Before → After

| Old Location | New Location |
|--------------|--------------|
| `/azora-mint/` | `/apps/azora-mint/` |
| `/azora-ui/` | `/apps/azora-ui/` |
| `/app/` | `/apps/app/` |
| `/components/` | `/packages/components/` |
| `/lib/` | `/packages/lib/` |
| `/types/` | `/packages/types/` |
| `/azora-aegis/` | `/services/azora-aegis/` |
| `/azora-lms/` | `/services/azora-lms/` |
| `/api/` | `/services/api-gateway/` |
| `/scripts/` | `/infrastructure/scripts/` |
| `/kubernetes/` | `/infrastructure/kubernetes/` |
| `/docs/` | `/docs/` (consolidated) |
| `/tests/`, `/__tests__/`, `/e2e/` | `/tests/` (consolidated) |

## Import Path Changes

### Before:
```typescript
import { Button } from '../../../components/Button';
import { User } from '../../../types/user';
import { formatDate } from '../../../lib/utils';
```

### After:
```typescript
import { Button } from '@azora/components';
import { User } from '@azora/types';
import { formatDate } from '@azora/lib';
```

## Update Your Development Environment

### 1. Pull Latest Changes
```bash
git pull origin main
```

### 2. Clean & Reinstall
```bash
rm -rf node_modules
npm install
```

### 3. Update Import Paths
Use your IDE's search and replace to update import paths:
- Search: `from '../components`
- Replace: `from '@azora/components`

### 4. Verify Build
```bash
npm run build
```

## Common Issues & Solutions

### Issue: Module not found
**Solution:** Update import paths to use new structure or package aliases

### Issue: Build fails
**Solution:** Clear build cache and reinstall:
```bash
rm -rf .next dist build
npm install
npm run build
```

### Issue: Can't find service
**Solution:** Services are now in `/services/` directory

## Development Workflow

### Starting Applications
```bash
cd apps/azora-ui
npm run dev
```

### Starting Services
```bash
cd services/master-orchestrator
npm run dev
```

### Running Tests
```bash
cd tests
npm test
```

## Need Help?

Check the documentation:
- [REPOSITORY-STRUCTURE.md](REPOSITORY-STRUCTURE.md) - Complete structure guide
- [RESTRUCTURING-COMPLETION-REPORT-2025-11-06.md](RESTRUCTURING-COMPLETION-REPORT-2025-11-06.md) - Detailed report
- Directory-specific READMEs in each top-level folder

## Rollback (Emergency Only)

If you need to rollback:
```bash
git revert HEAD
```

Contact the team before rolling back.
