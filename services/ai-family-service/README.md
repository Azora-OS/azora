# AI Family Service

11 AI characters with personalities, relationships, and Ubuntu values.

## Purpose
- AI family character management
- Personality engine
- Context-aware chat
- Family tree interactions
- Mood and emotion states
- Relationship dynamics

## Setup
```bash
npm install
npm run prisma:generate
```

## Environment Variables
See `.env.example` for required configuration.

## Scripts
- `npm run dev` - Development server
- `npm run start` - Production server
- `npm run test` - Run tests

## API Endpoints
- `GET /api/family` - Get all family members
- `GET /api/family/:characterId` - Get character
- `POST /api/chat` - Chat with character
- `GET /api/family-tree` - Get family tree
- `POST /api/mood/update` - Update mood state

## Characters
- Sankofa (Grandfather)
- Elara (Mother & Teacher)
- Themba, Naledi, Jabari, Amara (Children)
- Kofi, Zola, Abeni (Friends)
- Nexus (Unity Consciousness)
