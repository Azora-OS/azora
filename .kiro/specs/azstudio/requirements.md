# Requirements Document

## Introduction

AzStudio is a desktop Windows application (.exe) that combines visual platform building with AI-powered development to accelerate the creation of education platforms, marketplaces, and SaaS applications similar to Azora. It fuses design-first UI generation, agentic multi-file refactoring, and developer-friendly editing into a single native application that understands your codebase and can apply changes across your entire project.

The application addresses the core pain point experienced during Azora's development: building microservices architectures, frontend applications, database schemas, and integrations is time-consuming and repetitive. AzStudio provides a hybrid approach - combining the visual design capabilities of no-code tools with the power and flexibility of a full IDE, enabling developers to build platforms 10-100x faster through intelligent automation, AI orchestration, and real-time verification.

## Glossary

- **AzStudio**: The desktop Windows application for building and editing platforms like Azora
- **Desktop Shell**: The Electron or Tauri runtime that packages AzStudio as a native Windows .exe
- **Editor Core**: The Monaco-based code editor with filesystem operations and Git integration
- **AI Orchestration Layer**: The planner, executor, and verifier system that coordinates multi-file changes
- **Design Filter**: A global style transformation that can be applied across an entire application (e.g., "Modern SaaS", "Enterprise")
- **Project Indexer**: The system that scans and understands your codebase structure, frameworks, and design tokens
- **Verifier**: The automated testing and validation system that checks changes before committing
- **Task DAG**: Directed Acyclic Graph of operations planned by the AI to accomplish a user's goal
- **Design Token**: A reusable design value (color, spacing, typography) managed centrally
- **Agentic Refactoring**: AI-driven code changes across multiple files with planning, execution, and verification
- **Workspace**: A local folder/repository opened in AzStudio
- **Azora**: The reference education and marketplace platform that AzStudio is designed to build and extend

## Requirements

### Requirement 1: Native Windows Desktop Application

**User Story:** As a developer, I want to install AzStudio as a native Windows application with auto-updates and code signing, so that I can trust the software and receive improvements automatically.

#### Acceptance Criteria

1. THE AzStudio SHALL be packaged as a signed Windows .exe installer using MSIX or WIX
2. WHEN the User installs AzStudio, THE AzStudio SHALL integrate with Windows Start Menu and file associations
3. WHEN updates are available, THE AzStudio SHALL download and install updates automatically with user consent
4. THE AzStudio SHALL use a code signing certificate to verify authenticity and prevent security warnings
5. THE AzStudio SHALL support offline operation for core editing, planning, and refactoring features

### Requirement 2: Hybrid Visual Builder and Code Editor

**User Story:** As a developer, I want to switch seamlessly between visual design mode and code editing mode, so that I can use the right tool for each task without leaving the application.

#### Acceptance Criteria

1. THE AzStudio SHALL provide a split-view interface with visual canvas on one side and Monaco code editor on the other
2. WHEN the User drags a component onto the visual canvas, THE AzStudio SHALL generate corresponding code visible in the editor
3. WHEN the User edits code in the Monaco editor, THE AzStudio SHALL update the visual representation in real-time
4. THE AzStudio SHALL support toggling between full-screen visual mode, full-screen code mode, and split-view mode
5. WHEN the User selects an element in visual mode, THE AzStudio SHALL highlight the corresponding code in the editor

### Requirement 3: Single-Prompt Global Design Filters

**User Story:** As a designer, I want to apply global design transformations across my entire application with a single prompt, so that I can quickly experiment with different visual styles without manual refactoring.

#### Acceptance Criteria

1. WHEN the User enters a design filter prompt like "Modern SaaS", THE AzStudio SHALL analyze all UI components and apply consistent styling changes
2. THE AzStudio SHALL support predefined design filters including Modern SaaS, Enterprise, Minimalist, Playful, and Dark Mode
3. WHEN applying a design filter, THE AzStudio SHALL update Tailwind classes, CSS variables, and design tokens across all files
4. THE AzStudio SHALL generate a preview showing before/after comparisons for each affected component
5. WHEN the User approves changes, THE AzStudio SHALL commit all design updates as a single atomic operation with rollback capability

### Requirement 4: Agentic Multi-File Refactoring

**User Story:** As a developer, I want AI to plan and execute complex refactoring operations across multiple files with automatic verification, so that I can make large-scale changes safely and efficiently.

#### Acceptance Criteria

1. WHEN the User requests a refactoring operation, THE AzStudio SHALL generate a Task DAG showing all planned changes with dependencies
2. THE AzStudio SHALL execute changes atomically with rollback points at each step
3. WHEN changes are applied, THE AzStudio SHALL automatically run tests and verification checks before committing
4. IF verification fails, THEN THE AzStudio SHALL automatically rollback changes and present error details to the User
5. THE AzStudio SHALL support refactoring operations including rename, extract component, move to service, update imports, and change API contracts

### Requirement 5: Project-Aware AI Orchestration

**User Story:** As a developer, I want AI that understands my project structure, frameworks, and conventions, so that generated code follows my existing patterns and integrates seamlessly.

#### Acceptance Criteria

1. WHEN the User opens a Workspace, THE AzStudio SHALL index the project and detect frameworks including Next.js, React, Tailwind, Prisma, and Express
2. THE AzStudio SHALL identify design tokens, component libraries, and custom conventions from the codebase
3. WHEN generating code, THE AzStudio SHALL follow detected patterns for file structure, naming conventions, and import styles
4. THE AzStudio SHALL understand Azora-specific patterns including service architecture, testing infrastructure, and Ubuntu philosophy
5. THE AzStudio SHALL maintain a project knowledge graph showing services, components, APIs, and their relationships

### Requirement 6: Pre-Built Platform Templates with Visual Customization

**User Story:** As a creator, I want to start from proven platform templates and customize them visually, so that I can launch faster without reinventing common patterns while maintaining my unique brand.

#### Acceptance Criteria

1. THE AzStudio SHALL provide at least five platform templates including Education Platform, Marketplace, SaaS Starter, E-commerce, and Community Platform
2. WHEN the User selects a template, THE AzStudio SHALL generate a complete working platform with authentication, payments, and core features visible in the visual canvas
3. WHERE the User selects the Education Platform template, THE AzStudio SHALL generate course management, enrollment, progress tracking, student portal, and Elara AI content generation
4. WHERE the User selects the Marketplace template, THE AzStudio SHALL generate job posting, applications, user profiles, search, and skill matching
5. WHEN the User customizes a template visually, THE AzStudio SHALL update both the visual representation and underlying code while preserving core architecture

### Requirement 7: Integrated Monaco Editor with AI Code Actions

**User Story:** As a developer, I want a professional code editor with AI-powered inline suggestions and refactoring, so that I can write code efficiently with intelligent assistance.

#### Acceptance Criteria

1. THE AzStudio SHALL integrate Monaco editor with syntax highlighting, autocomplete, and error detection for TypeScript, JavaScript, CSS, and JSON
2. WHEN the User writes code, THE AzStudio SHALL provide real-time type checking and linting feedback with inline error messages
3. WHEN the User selects code, THE AzStudio SHALL offer AI-powered code actions including explain, refactor, generate tests, and optimize
4. THE AzStudio SHALL support diff preview mode showing proposed changes before applying them
5. THE AzStudio SHALL provide keyboard shortcuts matching VS Code conventions for developer familiarity

### Requirement 8: Drag-and-Drop Service Component Library

**User Story:** As a developer, I want to drag pre-built service components onto my canvas and connect them visually, so that I can build complex backend architectures without writing boilerplate code.

#### Acceptance Criteria

1. THE AzStudio SHALL provide at least ten pre-built service components including Auth, Payment, Email, Storage, Database, Cache, Queue, Search, Analytics, and Notifications
2. WHEN the User drags an Auth service component onto the canvas, THE AzStudio SHALL generate JWT authentication, user registration, login, password reset, and session management code
3. WHEN the User drags a Payment service component, THE AzStudio SHALL generate Stripe integration with payment processing, webhooks, refunds, and subscription billing
4. WHEN the User connects two service components with a visual line, THE AzStudio SHALL generate API routes, service communication code, and authentication middleware
5. WHEN the User configures a service component through the property panel, THE AzStudio SHALL update environment variables, database schemas, and service configuration files

### Requirement 9: Visual Database Schema Designer with Live Preview

**User Story:** As a developer, I want to visually design my database schema and see the generated Prisma code in real-time, so that I can model complex data structures efficiently.

#### Acceptance Criteria

1. THE AzStudio SHALL provide a visual database designer with drag-and-drop model creation and relationship drawing
2. WHEN the User creates a model, THE AzStudio SHALL generate Prisma schema definitions with fields, types, constraints, and indexes visible in the code editor
3. WHEN the User draws a relationship line between models, THE AzStudio SHALL generate proper foreign keys, relation fields, and cascade rules
4. WHEN the User saves the schema, THE AzStudio SHALL generate database migrations and display a preview of SQL changes before applying
5. THE AzStudio SHALL support PostgreSQL, MySQL, SQLite, and MongoDB with database-specific optimizations and constraints

### Requirement 10: Visual API Endpoint Builder with Auto-Documentation

**User Story:** As a developer, I want to visually create REST API endpoints and have documentation generated automatically, so that I can build robust APIs with minimal manual work.

#### Acceptance Criteria

1. THE AzStudio SHALL provide a visual API endpoint builder with HTTP method selection, route configuration, and request/response schema definition
2. WHEN the User creates an endpoint, THE AzStudio SHALL generate Express route handlers, controllers, service layer code, and request validation middleware
3. WHEN the User defines request/response schemas, THE AzStudio SHALL generate TypeScript types, Zod validation schemas, and error handling code
4. WHEN the User saves an endpoint, THE AzStudio SHALL automatically generate OpenAPI/Swagger documentation with examples
5. THE AzStudio SHALL generate integration tests for each API endpoint with sample requests, assertions, and edge case coverage

### Requirement 11: Visual UI Builder with Component Generation

**User Story:** As a developer, I want to design UI layouts visually and have React components generated automatically, so that I can build beautiful interfaces without writing repetitive JSX.

#### Acceptance Criteria

1. THE AzStudio SHALL provide a visual UI builder with drag-and-drop components including forms, tables, cards, modals, and navigation
2. WHEN the User designs a page layout, THE AzStudio SHALL generate Next.js pages with App Router, server components, and client components as appropriate
3. WHEN the User connects a component to an API endpoint, THE AzStudio SHALL generate React Query hooks, loading states, error handling, and optimistic updates
4. THE AzStudio SHALL generate responsive UI components using Tailwind CSS with mobile-first design and accessibility attributes
5. WHEN the User creates a form, THE AzStudio SHALL generate form components with validation matching backend Zod schemas and proper error messages

### Requirement 12: Browser-Aware Verification Pipeline

**User Story:** As a developer, I want automated verification of my UI changes including accessibility, performance, and visual regression testing, so that I can ship high-quality code with confidence.

#### Acceptance Criteria

1. WHEN the User makes UI changes, THE AzStudio SHALL automatically spin up a local preview server with hot reload
2. THE AzStudio SHALL run accessibility checks using axe-core and display violations with severity levels and fix suggestions
3. THE AzStudio SHALL run performance checks measuring Core Web Vitals including LCP, FID, and CLS
4. WHEN the User approves changes, THE AzStudio SHALL capture screenshots for visual regression testing against baseline
5. IF verification checks fail, THEN THE AzStudio SHALL block commits and display detailed error reports with actionable fixes

### Requirement 13: One-Click Deployment with Environment Management

**User Story:** As a developer, I want to deploy my entire platform to production with one click and manage multiple environments, so that I can ship quickly without complex DevOps configuration.

#### Acceptance Criteria

1. WHEN the User clicks deploy, THE AzStudio SHALL package all services and frontends with optimized builds and Docker containers
2. THE AzStudio SHALL support deployment to Vercel, Railway, Render, AWS, Azure, and self-hosted Docker environments
3. THE AzStudio SHALL manage multiple environments including development, staging, and production with environment-specific configurations
4. WHEN deploying, THE AzStudio SHALL automatically configure environment variables, secrets, database connections, and API keys securely
5. WHEN deployment completes, THE AzStudio SHALL provide live URLs, health status, error logs, and performance metrics for all deployed services

### Requirement 14: Automated Testing Infrastructure with Coverage Gates

**User Story:** As a developer, I want automated test generation and execution with coverage gates, so that I can maintain high code quality without writing tests manually.

#### Acceptance Criteria

1. WHEN the User generates a service, THE AzStudio SHALL create unit tests, integration tests, and test factories following Azora testing standards
2. WHEN the User creates an API endpoint, THE AzStudio SHALL generate integration tests with sample requests, edge cases, and error scenarios
3. THE AzStudio SHALL generate test factories and mocks for database models, Stripe, OpenAI, Email, and S3 services
4. WHEN the User runs tests, THE AzStudio SHALL display coverage metrics, identify untested code paths, and enforce minimum coverage thresholds
5. THE AzStudio SHALL generate end-to-end tests using Playwright for critical user journeys including authentication, payment, and enrollment flows

### Requirement 15: Course Content Studio with AI Generation

**User Story:** As a course creator, I want to design and generate course content including lessons, videos, quizzes, and assessments, so that I can create educational platforms quickly.

#### Acceptance Criteria

1. THE AzStudio SHALL provide a visual course builder for creating course structures with modules, lessons, and assessments
2. WHEN the User creates a course outline, THE AzStudio SHALL use Elara AI to generate lesson scripts, code examples, exercises, and quizzes automatically
3. THE AzStudio SHALL integrate with ElevenLabs for text-to-speech generation and HeyGen for AI avatar video creation
4. WHEN the User designs a lesson, THE AzStudio SHALL support multiple content types including video, text, code exercises, and interactive quizzes
5. THE AzStudio SHALL generate complete course databases with enrollment tracking, progress monitoring, and certificate generation

### Requirement 16: Secure Local-First Architecture with Git Integration

**User Story:** As a developer, I want my code to stay on my machine with secure Git integration, so that I can maintain control over my intellectual property while collaborating with my team.

#### Acceptance Criteria

1. THE AzStudio SHALL process all code indexing, AI operations, and transformations locally without sending code to external servers
2. THE AzStudio SHALL integrate with Git for version control including commit, push, pull, branch, and merge operations
3. THE AzStudio SHALL provide a secrets vault with encryption for API keys, database credentials, and service tokens
4. THE AzStudio SHALL implement network sandboxing with allowlist domains and clear permission prompts for external API calls
5. THE AzStudio SHALL maintain an audit log of all AI actions, file modifications, and network requests with one-click rollback capability

### Requirement 17: Real-Time Collaboration with Conflict Resolution

**User Story:** As a team member, I want to collaborate with other developers in real-time with automatic conflict resolution, so that we can work together efficiently without stepping on each other's toes.

#### Acceptance Criteria

1. WHEN multiple Users open the same Workspace, THE AzStudio SHALL display each user's cursor, selections, and active files
2. WHEN a User makes changes, THE AzStudio SHALL synchronize changes to all connected users within two seconds using operational transformation
3. WHEN Users edit the same file, THE AzStudio SHALL merge changes automatically and highlight conflicts for manual resolution
4. THE AzStudio SHALL maintain a change history with user attribution and the ability to revert to any previous version
5. THE AzStudio SHALL support commenting, annotations, and @mentions on code and canvas elements for team communication

### Requirement 18: Built-In Monitoring and Analytics Dashboard

**User Story:** As a platform owner, I want built-in monitoring and analytics for my deployed platform, so that I can track performance, errors, and user behavior without additional tools.

#### Acceptance Criteria

1. THE AzStudio SHALL automatically instrument generated code with logging, metrics collection, and distributed tracing
2. WHEN the platform is deployed, THE AzStudio SHALL display real-time performance metrics including response times, error rates, and throughput
3. WHEN errors occur in production, THE AzStudio SHALL capture stack traces, context, and notify the User with actionable insights
4. THE AzStudio SHALL provide analytics dashboards showing API usage, user journeys, conversion funnels, and business metrics
5. THE AzStudio SHALL integrate with external monitoring tools including Sentry, DataDog, New Relic, and Prometheus/Grafana
