# Azora OS Services

This directory contains all the core business services for Azora OS, organized as a monorepo.

## Unified Video Platform Service

The Unified Video Platform Service provides comprehensive integration with multiple video platforms including:

- **YouTube**: Educational content, tutorials, and learning videos
- **Microsoft Learn**: Training courses and certifications
- **Google Cloud Training**: Cloud computing courses and certifications
- **Other Platforms**: Extensible architecture for additional platforms

### Features

1. **Multi-Platform Integration**: Access content from multiple platforms through a single interface
2. **Content Management**: Unified content library with metadata and categorization
3. **User Progress Tracking**: Track progress across all platforms
4. **Recommendations**: AI-powered content recommendations
5. **AZR Rewards**: Earn AZR tokens for completing educational content
6. **Search & Filtering**: Advanced search and filtering capabilities

### Installation

The service is automatically included in the Azora OS monorepo. To enable specific platform integrations, configure the appropriate environment variables in your `.env.local` file.

### Configuration

```env
# YouTube Configuration
YOUTUBE_API_KEY=your_youtube_api_key
YOUTUBE_CHANNEL_ID=your_channel_id
YOUTUBE_PLAYLIST_ID=your_playlist_id

# Microsoft Learn Configuration
MICROSOFT_LEARN_ENABLED=true
MICROSOFT365_TENANT_ID=your_tenant_id
MICROSOFT365_CLIENT_ID=your_client_id
MICROSOFT365_CLIENT_SECRET=your_client_secret

# Google Cloud Training Configuration
GOOGLE_CLOUD_TRAINING_ENABLED=true
GOOGLE_CLOUD_PROJECT_ID=your_project_id
GOOGLE_CLOUD_CREDENTIALS=your_credentials_json
```

### Usage

#### In Node.js/TypeScript Applications

```typescript
import {
  createUnifiedVideoPlatformService,
  defaultVideoPlatformConfig,
} from './unified-video-platform';

// Create service instance
const videoService = createUnifiedVideoPlatformService({
  ...defaultVideoPlatformConfig,
  youtube: {
    apiKey: process.env.YOUTUBE_API_KEY,
    channelId: process.env.YOUTUBE_CHANNEL_ID,
  },
});

// Fetch all content
const allContent = videoService.getAllContent();

// Get content by platform
const youtubeContent = videoService.getAllContent({ platform: 'youtube' });

// Track user progress
await videoService.trackProgress({
  userId: 'user123',
  videoId: 'video456',
  platform: 'youtube',
  progress: 75,
  completed: false,
});

// Get recommendations
const recommendations = videoService.getRecommendations('user123');
```

#### In API Routes

```typescript
// api/video-platform.ts
import { NextApiRequest, NextApiResponse } from 'next';
import {
  createUnifiedVideoPlatformService,
  defaultVideoPlatformConfig,
} from '../services/unified-video-platform';

const videoPlatformService = createUnifiedVideoPlatformService(
  defaultVideoPlatformConfig
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Implementation details...
}
```

#### In React Components

```tsx
// components/learning/UnifiedVideoPlatform.tsx
import { useUnifiedVideoPlatform } from '../../hooks/useUnifiedVideoPlatform';

export const UnifiedVideoPlatform = ({ userId, onVideoSelect }) => {
  // Component implementation...
};
```

### API Endpoints

#### GET /api/video-platform

- `action=list` - Get all video content
- `action=get&videoId={id}` - Get specific video by ID
- `action=progress&userId={id}` - Get user progress
- `action=recommendations&userId={id}` - Get recommendations
- `action=health` - Get service health status

#### POST /api/video-platform

- `action=track-progress` - Track user progress
- `action=sync` - Sync content from all platforms

### Extending to New Platforms

To add support for a new platform:

1. Create a new integration service in the `services` directory
2. Add platform configuration to `VideoPlatformConfig` interface
3. Implement platform-specific methods in `UnifiedVideoPlatformService`
4. Update the React component to display platform-specific content
5. Add platform-specific styling and icons

### AZR Rewards System

Users can earn AZR tokens for completing educational content:

- **Tutorials**: 5 AZR
- **Courses**: 10-20 AZR
- **Certifications**: 25-50 AZR
- **Quizzes**: Bonus AZR for high scores

### Development

To run tests:

```bash
npm test unified-video-platform
```

### Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write tests
5. Submit a pull request

### License

See LICENSE file for details.
