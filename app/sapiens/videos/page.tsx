/* 
AZORA PROPRIETARY LICENSE 
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved. 

See LICENSE file for details. 
*/ 

/**
 * 🎥 VIDEO LEARNING PLATFORM - AZORA SAPIENS EDUCATION
 *
 * Unified video learning platform with integration across multiple platforms
 */

'use client';

import { UnifiedVideoPlatform } from '@/components/learning/UnifiedVideoPlatform';
import { DivineThrone } from '@/components/divine/DivineThrone';
import { Immersive3DCard } from '@/components/immersive/Immersive3DCard';
import { OrganicButton } from '@/components/organism/OrganicButton';
import { BookOpen, Home } from 'lucide-react';
import Link from 'next/link';
import { VideoContent } from '@/services/unified-video-platform';

export default function VideoLearningPage() {
  // In a real application, this would come from authentication context
  const userId = 'current-user-id'; // Placeholder for demo purposes

  const handleVideoSelect = (video: VideoContent) => {
    console.log('Selected video:', video);
  };

  return (
    <DivineThrone
      title="Video Learning"
      subtitle="Unified educational content from multiple platforms"
      showParticles={true}
      showSacredGeometry={true}
    >
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-transparent bg-clip-text">
              Video Learning Platform
            </h1>
            <p className="text-xl text-white/80">
              Access educational content from YouTube, Microsoft Learn, Google Cloud Training, and other platforms
            </p>
          </div>

          <div className="flex gap-3 mt-4 md:mt-0">
            <Link href="/sapiens">
              <OrganicButton variant="cosmic" size="md" className="px-6 py-3">
                <BookOpen className="w-5 h-5 mr-2" />
                All Courses
              </OrganicButton>
            </Link>
            <Link href="/">
              <OrganicButton variant="neural" size="md" className="px-6 py-3">
                <Home className="w-5 h-5 mr-2" />
                Home
              </OrganicButton>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Immersive3DCard
            variant="glass"
            depth="medium"
            float={true}
            tilt={true}
            glow={true}
            className="p-6 text-center"
          >
            <div className="text-3xl font-bold text-[#FFD700] mb-2">1000+</div>
            <div className="text-white/80">Videos Available</div>
          </Immersive3DCard>

          <Immersive3DCard
            variant="glass"
            depth="medium"
            float={true}
            tilt={true}
            glow={true}
            className="p-6 text-center"
          >
            <div className="text-3xl font-bold text-[#87CEEB] mb-2">15+</div>
            <div className="text-white/80">Platforms Integrated</div>
          </Immersive3DCard>

          <Immersive3DCard
            variant="glass"
            depth="medium"
            float={true}
            tilt={true}
            glow={true}
            className="p-6 text-center"
          >
            <div className="text-3xl font-bold text-[#9400D3] mb-2">∞</div>
            <div className="text-white/80">Learning Possibilities</div>
          </Immersive3DCard>
        </div>

        {/* Video Platform */}
        <Immersive3DCard
          variant="divine"
          depth="extreme"
          float={true}
          tilt={true}
          glow={true}
          className="p-6"
        >
          <UnifiedVideoPlatform
            userId={userId}
            onVideoSelect={handleVideoSelect}
          />
        </Immersive3DCard>

        {/* Platform Information */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { name: 'YouTube', color: 'bg-red-600', count: '500+' },
            { name: 'Microsoft Learn', color: 'bg-blue-600', count: '200+' },
            { name: 'Google Cloud', color: 'bg-green-600', count: '150+' },
            { name: 'Other Platforms', color: 'bg-purple-600', count: '150+' },
          ].map((platform, index) => (
            <Immersive3DCard
              key={index}
              variant="crystal"
              depth="medium"
              float={true}
              tilt={true}
              glow={true}
              className="p-6 text-center"
            >
              <div className={`w-12 h-12 ${platform.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                <span className="text-white font-bold text-sm">{platform.name.charAt(0)}</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{platform.name}</h3>
              <p className="text-white/80">{platform.count} videos</p>
            </Immersive3DCard>
          ))}
        </div>
      </div>
    </DivineThrone>
  );
}

