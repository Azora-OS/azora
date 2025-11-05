/**
 * AZORA OS - Unified Video Platform Demo Script
 *
 * This script demonstrates how to use the Unified Video Platform Service
 */

// Import the service
import { elaraIntegration } from '../services/elara-integration-service';
import {
  createUnifiedVideoPlatformService,
  defaultVideoPlatformConfig,
} from '../services/unified-video-platform';

// Create service instance
const videoService = createUnifiedVideoPlatformService(
  defaultVideoPlatformConfig
);

// Demo function
async function demo() {
  console.log('🚀 Azora OS Unified Video Platform Demo');
  console.log('=====================================\n');

  try {
    // Register a demo user with Elara
    console.log('👤 Registering demo user with Elara AI...');
    elaraIntegration.registerUser({
      id: 'demo-user',
      email: 'demo@azora.world',
      name: 'Demo User',
      role: 'student',
      company: 'Azora OS',
      location: 'Global',
      preferences: {
        learningStyle: 'visual',
        communicationPreference: 'email',
        interests: ['technology', 'ai', 'education'],
        goals: ['master quantum computing', 'become ai developer'],
        skillLevel: 'intermediate',
      },
    });
    console.log('✅ User registered with Elara AI\n');

    // Get all content
    console.log('📚 Getting all video content...');
    const allContent = videoService.getAllContent();
    console.log(`Found ${allContent.length} videos\n`);

    // Display first few videos
    console.log('🎥 Sample Videos:');
    allContent.slice(0, 3).forEach((video, index) => {
      console.log(`${index + 1}. ${video.title} (${video.platform})`);
      console.log(`   Duration: ${video.duration}`);
      console.log(`   Category: ${video.category}`);
      console.log(`   Difficulty: ${video.difficulty}`);
      if (video.azrReward) {
        console.log(`   AZR Reward: ${video.azrReward}`);
      }
      console.log('');
    });

    // Filter by platform
    console.log('🔍 Filtering by platform (YouTube)...');
    const youtubeContent = videoService.getAllContent({ platform: 'youtube' });
    console.log(`Found ${youtubeContent.length} YouTube videos\n`);

    // Filter by category
    console.log('🔍 Filtering by category (Technology)...');
    const techContent = videoService.getAllContent({ category: 'Technology' });
    console.log(`Found ${techContent.length} technology videos\n`);

    // Track user progress
    console.log('📊 Tracking user progress...');
    if (allContent.length > 0) {
      const firstVideo = allContent[0];
      if (firstVideo) {
        await videoService.trackProgress({
          userId: 'demo-user',
          videoId: firstVideo.id,
          platform: firstVideo.platform,
          progress: 75,
          completed: false,
        });
        console.log(`Tracked progress for ${firstVideo.title}\n`);
      }
    }

    // Get user progress
    console.log('📈 Getting user progress...');
    const userProgress = videoService.getUserProgress('demo-user');
    console.log(`User has progress on ${userProgress.length} videos\n`);

    // Get recommendations
    console.log('💡 Getting recommendations...');
    const recommendations = videoService.getRecommendations('demo-user');
    console.log(`Generated ${recommendations.length} recommendations\n`);

    // Sync content (this will log to Elara)
    console.log('🔄 Syncing content with external platforms...');
    await videoService.syncContent();
    console.log('✅ Content sync completed\n');

    // Get health status
    console.log('🏥 Checking service health...');
    const health = await videoService.getHealthStatus();
    console.log(`Service Status: ${health.status}`);
    console.log(`Content Count: ${health.contentCount}`);
    console.log(`User Count: ${health.userCount}\n`);

    console.log('✅ Demo completed successfully!');
    console.log(
      '✨ Elara AI is now integrated with the video learning platform!'
    );
    console.log(
      '   Users can interact with Elara while watching videos for personalized assistance.'
    );
  } catch (error) {
    console.error('❌ Demo failed:', (error as Error).message);
    process.exit(1);
  }
}

// Run demo
// @ts-expect-error: Module check for CommonJS compatibility
if (typeof require !== 'undefined' && require.main === module) {
  demo();
}

export { demo };
