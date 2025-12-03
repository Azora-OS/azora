# Knowledge Ocean - Data Loading Script

This script loads knowledge from various sources into the Knowledge Ocean.

## Data Sources

### 1. Curriculum Knowledge
- Located in: `docs/knowledge-ocean/`
- Includes: AI history, cloud computing, cryptography, databases, hardware, internet, LLMs, OS, programming languages

### 2. Azora System Knowledge
- Located in: `services/azora-sapiens/src/routes/chatRoutes.ts`
- Includes: Self-awareness, Ubuntu principles, AI research, creator vision, system architecture

### 3. General Knowledge
- Common facts (presidents, capitals, basic science)
- Current events (via web search fallback)

### 4. Code Completion
- Programming patterns
- Common algorithms
- Framework-specific knowledge

## Usage

```typescript
import { knowledgeOcean } from '@azora/shared-api';

// Try to answer from local knowledge
const answer = knowledgeOcean.tryAnswer("Who is the president of USA?");

// If null, falls back to external AI or web search
if (!answer) {
  // Use external AI
}
```

## Adding New Knowledge

```typescript
knowledgeOcean.addKnowledge({
  id: 'unique-id',
  category: 'general',
  title: 'Topic Title',
  content: 'Detailed explanation...',
  keywords: ['keyword1', 'keyword2'],
  examples: ['Example 1', 'Example 2'],
  lastUpdated: new Date().toISOString()
});
```

## Knowledge Categories

- `curriculum` - School subjects (math, science, etc.)
- `system` - Azora platform knowledge
- `general` - General world knowledge
- `computation` - Calculator and code completion
