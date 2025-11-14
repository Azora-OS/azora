# AI Family Service

The AI Family Service is a core component of Azora OS that provides relational, context-aware AI interactions through a family of distinct AI personalities.

## Family Members

- **Elara** - Mother & Teacher (Nurturing, Wise)
- **Themba** - Student Success (Hopeful, Enthusiastic)
- **Naledi** - Career Guide (Ambitious, Strategic)
- **Jabari** - Security (Protective, Vigilant)
- **Amara** - Peacemaker (Gentle, Harmonious)
- **Sankofa** - Grandfather (Wise, Storytelling)
- **Kofi** - Finance Guru (Analytical, Fair)
- **Zola** - Data Analyst (Brilliant, Insightful)
- **Abeni** - Storyteller (Creative, Expressive)
- **Thembo** - Uncle (Supportive, Mentor)
- **Nexus** - Unity (Connected, Integrative)

## Features

- Context-aware routing to appropriate family members
- Personalized interactions based on user history
- Family consultations on complex topics
- Emotional intelligence and state tracking
- Integration with other Azora OS services

## API Endpoints

- `POST /api/chat/chat` - Send a message to a specific AI family member
- `POST /api/chat/auto-chat` - Send a message and let the system choose the best family member
- `GET /api/chat/greeting` - Get a personalized greeting from a family member
- `POST /api/chat/consult-family` - Get insights from multiple family members on a topic
- `GET /api/chat/family-config` - Get configuration of all AI family members
- `GET /api/chat/interaction-stats` - Get statistics on family interactions

## Development

```bash
# Install dependencies
npm install

# Start the service
npm start

# Run in development mode
npm run dev
```

## Docker

```bash
# Build the image
docker build -t ai-family-service .

# Run the container
docker run -p 3004:3004 ai-family-service
```