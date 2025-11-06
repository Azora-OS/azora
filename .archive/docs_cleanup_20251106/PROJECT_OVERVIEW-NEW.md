# Azora OS Project Overview

This document provides a technical overview of the Azora OS project, its components, and how to run them.

## Core Applications

### 1. Main Application (`app/`)
The primary user interface for the Azora OS platform, built with Next.js and React.

**Location:** `app/`
**Technologies:** Next.js, React, TypeScript, Tailwind CSS
**How to run:**
```bash
cd app
npm run dev
```

### 2. Azora UI Component Library (`azora-ui/`)
A shared UI component library used across the platform.

**Location:** `azora-ui/`
**Technologies:** React, TypeScript, Tailwind CSS
**Note:** This is a component library and not a standalone application.

### 3. Services (`services/`)
Microservices that provide backend functionality for the platform.

**Location:** `services/`
**Key Services:**
- Authentication Service
- Course Management Service
- Payment Processing Service
- AI Tutor Service
- Compliance Monitoring Service

**How to run individual services:**
```bash
cd services/[service-name]
npm start
```

## Development Setup

### Prerequisites
- Node.js 18+
- npm or yarn
- PostgreSQL database
- Supabase account (for development)

### Installation
1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables in `.env.local`
4. Start the development server:
   ```bash
   npm run dev
   ```

## Testing

The project includes comprehensive tests to ensure functionality and compliance.

### Running Tests
```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### Test Categories
- **Unit Tests:** Component and function testing
- **Integration Tests:** Service interaction testing
- **Compliance Tests:** GDPR, security, and regulatory compliance
- **Performance Tests:** Load and stress testing

## Deployment

### Vercel Deployment
The frontend is deployed on Vercel. Connect your GitHub repository to Vercel for automatic deployments.

### Self-Hosted Deployment
For self-hosted deployments:
1. Build the application:
   ```bash
   npm run build
   ```
2. Start the production server:
   ```bash
   npm run start
   ```

## Architecture

The system follows a microservices architecture with:
- Frontend applications consuming REST/GraphQL APIs
- Independent backend services
- Shared database layer
- AI and blockchain integration layers

## Contributing

See [CONTRIBUTING.md](./docs/CONTRIBUTING.md) for guidelines on how to contribute to the project.