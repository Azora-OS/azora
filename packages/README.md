# Packages Directory

Shared libraries and components used across Azora OS applications and services.

## Packages

### UI Packages
- **components/** - Reusable React components
- **ui-framework/** - Shared UI framework
- **ui/** - UI utilities and helpers
- **azorahub/** - Azora Hub design system

### Development Packages
- **types/** - Shared TypeScript type definitions
- **lib/** - Utility functions and helpers
- **hooks/** - Shared React hooks
- **constants/** - Application constants

### Platform Packages
- **contracts/** - Blockchain smart contracts
- **javascript/** - JavaScript utilities
- **python/** - Python packages

### Assets
- **assets/** - Shared assets (images, fonts, icons)
- **public/** - Public static files
- **pic/** - Graphics and illustrations

## Usage

Import shared packages in your application:

```typescript
// Import types
import { User, Course } from '@azora/types';

// Import components
import { Button, Card } from '@azora/components';

// Import hooks
import { useAuth, useUser } from '@azora/hooks';

// Import utilities
import { formatDate, validateEmail } from '@azora/lib';
```

## Development

```bash
# Build a package
cd packages/components
npm run build

# Test a package
npm run test

# Link locally
npm link
```

## Package Structure

Each package follows a consistent structure:
```
package-name/
├── src/
├── dist/
├── package.json
├── tsconfig.json
├── README.md
└── tests/
```

## Publishing

Packages are published to npm under the `@azora` scope:
```bash
npm publish --access public
```
