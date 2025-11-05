# Technology Stack

## Core Framework

- **Next.js 14.2.5**: React-based web framework with App Router
- **React 18.3.1**: UI library with React DOM
- **TypeScript 5.2.2**: Strict typing with comprehensive configuration
- **Node.js >=18.0.0**: Runtime environment

## Styling & UI

- **Tailwind CSS 3.3.3**: Utility-first CSS framework
- **shadcn/ui**: Component library (New York style)
- **Lucide React**: Icon library
- **CSS Variables**: Design system with HSL color tokens

## Development Tools

- **tsx**: TypeScript execution for scripts and launchers
- **ESLint**: Code linting with TypeScript rules
- **Prettier**: Code formatting
- **Husky**: Git hooks for quality control

## Testing

- **Jest 29.7.0**: Testing framework
- **Testing Library**: React component testing
- **Playwright**: End-to-end testing

## Cloud Services

- **Supabase**: Database and authentication
- **Google Cloud**: AI Platform, BigQuery, Storage, Vision API
- **Azure**: Identity services
- **Firebase**: Admin SDK

## Build System

- **SWC**: Fast compilation and minification
- **Webpack**: Module bundling (via Next.js)
- **PostCSS**: CSS processing
- **Autoprefixer**: CSS vendor prefixes

## Common Commands

### Development

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Azora OS Launchers

```bash
npm run launch       # Launch all Azora OS services
npm run launch:status # Check service status
npm run launch:stop # Stop all services
```

### Elara AI System

```bash
npm run elara:launch        # Launch Elara AI
npm run elara:launch:status # Check Elara status
npm run elara:launch:stop   # Stop Elara services
```

### Testing

```bash
npm test            # Run Jest tests
npm run test:watch  # Run tests in watch mode
npm run test:coverage # Run tests with coverage
```

### Specialized Scripts

```bash
npm run organism:activate    # Activate organism systems
npm run constitutional:launch # Launch constitutional AI
npm run video:demo          # Demo video platform
npm run repo:organize       # Organize repository structure
```

## TypeScript Configuration

- **Strict mode**: All strict checks enabled
- **Path mapping**: Extensive alias system (@/, @/components/, etc.)
- **ES2022 target**: Modern JavaScript features
- **Bundler resolution**: Optimized for Next.js
