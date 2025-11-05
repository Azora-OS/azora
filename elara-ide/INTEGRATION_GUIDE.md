# Elara IDE Integration Guide

## Overview

Elara IDE is an AI-powered development environment integrated with the Azora OS ecosystem. This guide explains how it integrates with the main project.

## Integration Points

### 1. Core Integration (`core/elara-ide-core.ts`)

The core IDE module integrates with:

- **Genome Logger** (`genome/utils/logger`)
  ```typescript
  import { logger } from '../../genome/utils/logger';
  ```

- **Elara Core** (`genome/agent-tools/elara-core`)
  ```typescript
  import { elara } from '../../genome/agent-tools/elara-core';
  ```

- **Elara Family Coordinator** (`elara-family/core/family-coordinator`)
  ```typescript
  import { elaraFamilyCoordinator } from '../elara-family/core/family-coordinator';
  ```

### 2. Project Structure

```
elara-ide/
├── app/                    # Next.js app directory
│   ├── layout.tsx          # Root layout with theme
│   ├── page.tsx            # Main IDE interface
│   └── globals.css         # Global styles
├── components/              # React components
│   ├── code-editor.tsx     # Monaco editor integration
│   ├── elara-assistant.tsx # AI chat interface
│   ├── file-explorer.tsx   # File tree
│   ├── sidebar.tsx         # Tool sidebar
│   ├── terminal-panel.tsx  # Integrated terminal
│   └── theme-provider.tsx  # Theme management
├── core/
│   └── elara-ide-core.ts   # Core IDE logic & integrations
├── package.json            # Dependencies
└── next.config.ts          # Next.js configuration
```

### 3. Dependencies

#### Production Dependencies
- **Next.js 16.0.1**: React framework
- **Monaco Editor**: VS Code-powered editor
- **Radix UI**: Accessible components
- **Framer Motion**: Animations
- **Tailwind CSS v4**: Styling

#### Dev Dependencies
- **TypeScript 5.9.3**: Type safety
- **ESLint**: Code linting
- **Prettier**: Code formatting

### 4. Port Configuration

Elara IDE runs on **port 3002** by default:
```bash
npm run dev  # Starts on http://localhost:3002
```

### 5. Shared Utilities Integration

To use shared utilities from the main project:

```typescript
// Logger (if needed in components)
import { log } from '../../lib/logger.js';

// Environment validation
import { getEnv } from '../../lib/env-validation.js';
```

### 6. Starting Elara IDE

#### From Main Project
```bash
npm run elara:ide:start
```

#### From Elara IDE Directory
```bash
cd elara-ide
npm install
npm run dev
```

### 7. Configuration Files

- **`.prettierrc`**: Code formatting rules
- **`.eslintrc.json`**: Linting rules (extends Next.js config)
- **`tsconfig.json`**: TypeScript configuration
- **`next.config.ts`**: Next.js configuration
- **`tailwind.config.ts`**: Tailwind CSS configuration

### 8. Build & Deploy

```bash
# Build for production
npm run build

# Start production server
npm start

# Deploy to Vercel
vercel --prod
```

### 9. Integration Checklist

- ✅ Core IDE logic integrated with Elara
- ✅ Logger integration from genome
- ✅ Elara Family coordinator connected
- ✅ Next.js 16.0.1 upgraded
- ✅ Dependencies aligned with main project
- ✅ TypeScript configuration optimized
- ✅ Prettier & ESLint configured
- ✅ Port 3002 configured
- ⚠️ Consider integrating centralized logger (`lib/logger.ts`) for consistency

### 10. Missing Components Check

Run the setup check script:
```powershell
powershell -ExecutionPolicy Bypass -File scripts/check-elara-ide-setup.ps1
```

This will verify:
- Dependencies installed
- Configuration files present
- Source files structure
- Integration points working

### 11. Future Enhancements

Consider integrating:
1. Centralized logger from `lib/logger.ts` instead of genome logger
2. Environment validation from `lib/env-validation.ts`
3. Security middleware if adding API routes
4. Swagger docs if adding REST endpoints

---

**Status**: ✅ Integrated and Upgraded
**Last Updated**: After full upgrade and integration

