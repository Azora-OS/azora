# Project Structure

## Root Directory Organization

### Core Application

- **`app/`** - Next.js App Router pages and layouts
- **`components/`** - Reusable React components
- **`lib/`** - Shared utilities and configurations
- **`public/`** - Static assets

### Azora OS Architecture

- **`agents/`** - Autonomous AI agents for orchestration and research
- **`organs/`** - Specialized system services (microservices architecture)
- **`genome/`** - Core system DNA and identity components
- **`core/`** - Fundamental system engines and implementations

### Development & Operations

- **`scripts/`** - Build and deployment scripts
- **`config/`** - Configuration files and templates
- **`infrastructure/`** - DevOps, monitoring, and scaling configurations
- **`deploy/`** - Deployment scripts and Docker configurations

### Documentation & Assets

- **`docs/`** - Project documentation
- **`assets/`** - Media files, branding, and marketing materials
- **`branding/`** - Brand guidelines and visual assets

### Specialized Modules

- **`api/`** - API services and endpoints
- **`services/`** - Business logic services
- **`types/`** - TypeScript type definitions
- **`hooks/`** - Custom React hooks

## Key Architectural Patterns

### Organism-Based Services

Each "organ" in `/organs/` follows a standard structure:

```
organs/organ-name/
├── README.md          # Organ documentation
├── package.json       # Dependencies and scripts
├── index.js          # Main entry point
└── [implementation files]
```

### Agent System

AI agents in `/agents/` handle:

- Research and development
- System orchestration
- Constitutional compliance
- Autonomous operations

### Path Aliases

TypeScript path mapping provides clean imports:

- `@/*` - Root directory
- `@/components/*` - Components
- `@/lib/*` - Libraries
- `@/types/*` - Type definitions
- `@/core/*` - Core systems
- `@/agents/*` - AI agents
- `@/organs/*` - System organs
- `@/genome/*` - System DNA

### Configuration Files

- **`.env*`** - Environment variables (multiple environments)
- **`tsconfig.json`** - TypeScript configuration with strict settings
- **`next.config.js`** - Next.js configuration
- **`tailwind.config.ts`** - Tailwind CSS configuration
- **`components.json`** - shadcn/ui component configuration

### Launcher System

Multiple launcher entry points (now in `tools/launchers/`):

- **`tools/launchers/elara-launcher-cli.ts`** - Main CLI launcher
- **`launch/azora-launch.ts`** - Service launcher
- **`genome/elara-master-launcher.ts`** - Master orchestrator

## Naming Conventions

- **Files**: kebab-case for most files, PascalCase for React components
- **Directories**: kebab-case or single words
- **Components**: PascalCase
- **Services/Organs**: kebab-case directories
- **Scripts**: descriptive names with action verbs

## License Headers

All source files include Azora proprietary license header:

```typescript
/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/
```
