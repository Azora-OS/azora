# Project Marketplace Service

The Project Marketplace Service connects project owners with freelancers and manages project collaborations.

## Features

- Project listing and management
- Freelancer matching
- Project submission
- Health monitoring

## Endpoints

- `GET /health` - Service health check
- `GET /api/projects` - Get projects
- `POST /api/projects` - Submit new project
- `GET /api/match/:projectId` - Get freelancer matches for project

## Environment Variables

- `PORT` - Service port (default: 3023)

## Getting Started

1. Install dependencies: `npm install`
2. Start the service: `npm start`
3. Check health: `npm run health`