# Apps Directory

User-facing applications for Azora OS.

## Applications

### Main Applications
- **app/** - Main Next.js application (platform UI)
- **azora-ui/** - Core Azora UI application
- **azora-mint/** - Cryptocurrency mining & wallet
- **azora-ide/** - Integrated development environment

### Specialized UIs
- **cloud-ui/** - Cloud management interface
- **enterprise-ui/** - Enterprise administration
- **dev-ui/** - Developer tools interface
- **learn-ui/** - Learning platform UI
- **ingestion-ui/** - Data ingestion interface
- **compliance-ui/** - Compliance monitoring
- **marketplace-ui/** - Marketplace application
- **pay-ui/** - Payment & billing interface

### Utilities
- **onboarding-wizard/** - User onboarding flow
- **mobile/** - Mobile applications (iOS/Android)
- **electron/** - Desktop application
- **web/** - Web platform
- **routes/** - Routing configurations

## Development

```bash
# Start an app
cd apps/azora-ui
npm install
npm run dev
```

## Structure

Each app follows a consistent structure:
```
app-name/
├── src/
├── public/
├── package.json
├── tsconfig.json
└── README.md
```
