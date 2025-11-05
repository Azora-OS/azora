/* 
AZORA PROPRIETARY LICENSE 
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved. 

See LICENSE file for details. 
*/ 

/**
 * 🎥 VIDEO LEARNING PLATFORM - AZORA SAPIENS EDUCATION
 *
 * Advanced video learning platform with interactive features
 */

'use client';

import {
  Award,
  BookOpen,
  Clock,
  Maximize2,
  MessageCircle,
  Pause,
  Play,
  Share,
  ThumbsUp,
  Users,
  Volume2,
  VolumeX,
} from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { Immersive3DCard } from '../immersive/Immersive3DCard';
import { OrganicButton } from '../organism/OrganicButton';

interface VideoChapter {
  id: string;
  title: string;
  duration: string;
  timestamp: number;
  completed: boolean;
}

interface VideoLearningPlatformProps {
  videoId: string;
  title: string;
  description: string;
  duration: string;
  instructor: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'divine';
  onProgress?: (progress: number) => void;
  onComplete?: () => void;
}

export const VideoLearningPlatform: React.FC<VideoLearningPlatformProps> = ({
  title,
  description,
  duration,
  instructor,
  level,
  onProgress,
  onComplete,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(80);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeChapter, setActiveChapter] = useState(0);
  const [showChapters, setShowChapters] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const chapters: VideoChapter[] = [
    {
      id: 'ch1',
      title: 'Introduction',
      duration: '02:30',
      timestamp: 0,
      completed: false,
    },
    {
      id: 'ch2',
      title: 'Core Concepts',
      duration: '08:45',
      timestamp: 150,
      completed: false,
    },
    {
      id: 'ch3',
      title: 'Practical Application',
      duration: '12:20',
      timestamp: 675,
      completed: false,
    },
    {
      id: 'ch4',
      title: 'Advanced Techniques',
      duration: '09:15',
      timestamp: 1415,
      completed: false,
    },
    {
      id: 'ch5',
      title: 'Summary & Q&A',
      duration: '04:30',
      timestamp: 1970,
      completed: false,
    },
  ];

  const totalTime = 2240; // Total video duration in seconds

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateTime = () => {
      setCurrentTime(video.currentTime);
      const progress = (video.currentTime / totalTime) * 100;
      onProgress?.(progress);

      // Update active chapter based on current time
      const currentChapter = chapters.findIndex((chapter, index) => {
        const nextChapter = chapters[index + 1];
        return (
          video.currentTime >= chapter.timestamp &&
          (!nextChapter || video.currentTime < nextChapter.timestamp)
        );
      });

      if (currentChapter !== -1 && currentChapter !== activeChapter) {
        setActiveChapter(currentChapter);
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
      onComplete?.();
    };

    video.addEventListener('timeupdate', updateTime);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('timeupdate', updateTime);
      video.removeEventListener('ended', handleEnded);
    };
  }, [totalTime, chapters, activeChapter, onProgress, onComplete]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseInt(e.target.value);
    setVolume(newVolume);
    const video = videoRef.current;
    if (video) {
      video.volume = newVolume / 100;
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const newTime = percent * totalTime;

    const video = videoRef.current;
    if (video) {
      video.currentTime = newTime;
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}`;
  };

  const progress = (currentTime / totalTime) * 100;

  const seekToChapter = (chapter: VideoChapter) => {
    const video = videoRef.current;
    if (video) {
      video.currentTime = chapter.timestamp;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Main Video Player */}
      <div className="lg:col-span-3">
        <Immersive3DCard
          variant="divine"
          depth="extreme"
          float={true}
          tilt={true}
          glow={true}
          className="w-full"
        >
          {/* Video Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
              <div className="flex flex-wrap items-center gap-3">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    level === 'beginner'
                      ? 'bg-blue-500/20 text-blue-300'
                      : level === 'intermediate'
                      ? 'bg-yellow-500/20 text-yellow-300'
                      : level === 'advanced'
                      ? 'bg-purple-500/20 text-purple-300'
                      : 'bg-gold-500/20 text-gold-300'
                  }`}
                >
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </span>
                <span className="text-white/60 text-sm flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  {duration}
                </span>
                <span className="text-white/60 text-sm flex items-center">
                  <Users className="w-4 h-4 mr-1" />
                  24.5K learners
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 mt-3 md:mt-0">
              <OrganicButton variant="cosmic" size="sm" className="px-4 py-2">
                <Award className="w-4 h-4 mr-2" />
                Certificate
              </OrganicButton>
            </div>
          </div>

          {/* Video Container */}
          <div
            ref={containerRef}
            className="relative rounded-2xl overflow-hidden bg-black mb-4"
            style={{ aspectRatio: '16/9' }}
          >
            {/* Video Placeholder with Living Organism Visualization */}
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#0a0a1a] to-[#1a0a2e]">
              {/* Neural network pattern */}
              <div className="absolute inset-0 opacity-20">
                {[...Array(100)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute rounded-full bg-[#FFD700]"
                    style={{
                      width: `${Math.random() * 6 + 2}px`,
                      height: `${Math.random() * 6 + 2}px`,
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                      opacity: 0.2 + Math.random() * 0.3,
                      animation: `pulse ${3 + Math.random() * 4}s infinite`,
                    }}
                  />
                ))}
              </div>

              {/* Connection lines */}
              <svg className="absolute inset-0 w-full h-full">
                {[...Array(30)].map((_, i) => (
                  <line
                    key={i}
                    x1={`${Math.random() * 100}%`}
                    y1={`${Math.random() * 100}%`}
                    x2={`${Math.random() * 100}%`}
                    y2={`${Math.random() * 100}%`}
                    stroke="url(#videoGradient)"
                    strokeWidth="1"
                    opacity="0.2"
                  />
                ))}
                <defs>
                  <linearGradient
                    id="videoGradient"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="#FFD700" />
                    <stop offset="50%" stopColor="#87CEEB" />
                    <stop offset="100%" stopColor="#9400D3" />
                  </linearGradient>
                </defs>
              </svg>

              {/* Central Visualization */}
              <div className="relative z-10 text-center">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#FFD700] to-[#FF8C00] opacity-80 animate-pulse mb-6 mx-auto" />
                <h3 className="text-2xl font-bold text-white mb-2">{title}</h3>
                <p className="text-white/70 mb-6">{description}</p>
                <OrganicButton
                  variant="divine"
                  size="lg"
                  className="px-8 py-4 text-lg"
                  onClick={togglePlay}
                >
                  <Play className="w-6 h-6 mr-2" />
                  Play Video
                </OrganicButton>
              </div>
            </div>

            {/* Video Controls Overlay */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
              {/* Progress Bar */}
              <div
                className="h-2 bg-black/30 rounded-full mb-3 cursor-pointer"
                onClick={handleProgressClick}
              >
                <div
                  className="h-full bg-gradient-to-r from-[#FFD700] to-[#FF8C00] rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>

              {/* Time and Controls */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button
                    onClick={togglePlay}
                    className="text-white hover:text-[#FFD700] transition-colors"
                  >
                    {isPlaying ? (
                      <Pause className="w-6 h-6" />
                    ) : (
                      <Play className="w-6 h-6" />
                    )}
                  </button>

                  <button
                    onClick={toggleMute}
                    className="text-white hover:text-[#FFD700] transition-colors"
                  >
                    {isMuted ? (
                      <VolumeX className="w-6 h-6" />
                    ) : (
                      <Volume2 className="w-6 h-6" />
                    )}
                  </button>

                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={volume}
                    onChange={handleVolumeChange}
                    className="w-20 accent-[#FFD700]"
                  />

                  <span className="text-white text-sm">
                    {formatTime(currentTime)} / {formatTime(totalTime)}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowChapters(!showChapters)}
                    className="text-white hover:text-[#FFD700] transition-colors"
                  >
                    <BookOpen className="w-6 h-6" />
                  </button>

                  <button
                    onClick={() => setIsFullscreen(!isFullscreen)}
                    className="text-white hover:text-[#FFD700] transition-colors"
                  >
                    <Maximize2 className="w-6 h-6" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Video Description */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#FFD700] to-[#FF8C00] flex items-center justify-center">
                <span className="text-black font-bold text-lg">
                  {instructor
                    .split(' ')
                    .map(n => n[0])
                    .join('')}
                </span>
              </div>
              <div>
                <h3 className="text-white font-semibold">{instructor}</h3>
                <p className="text-white/60 text-sm">Senior AI Educator</p>
              </div>
            </div>

            <p className="text-white/80 mb-4">{description}</p>

            <div className="flex flex-wrap gap-3">
              <OrganicButton variant="neural" size="sm" className="px-4 py-2">
                <ThumbsUp className="w-4 h-4 mr-2" />
                Like
              </OrganicButton>

              <OrganicButton variant="cosmic" size="sm" className="px-4 py-2">
                <MessageCircle className="w-4 h-4 mr-2" />
                Comment
              </OrganicButton>

              <OrganicButton variant="divine" size="sm" className="px-4 py-2">
                <Share className="w-4 h-4 mr-2" />
                Share
              </OrganicButton>
            </div>
          </div>
        </Immersive3DCard>
      </div>

      {/* Chapters Sidebar */}
      <div className="lg:col-span-1">
        <Immersive3DCard
          variant="glass"
          depth="medium"
          float={true}
          tilt={true}
          glow={true}
          className="w-full h-full"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-white">Chapters</h3>
            <button
              onClick={() => setShowChapters(!showChapters)}
              className="text-white/60 hover:text-white transition-colors"
            >
              {showChapters ? 'Hide' : 'Show'}
            </button>
          </div>

          {showChapters && (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {chapters.map((chapter, index) => (
                <div
                  key={chapter.id}
                  className={`p-3 rounded-xl cursor-pointer transition-all ${
                    index === activeChapter
                      ? 'bg-[#FFD700]/20 border border-[#FFD700]/30'
                      : 'bg-black/20 hover:bg-black/30'
                  }`}
                  onClick={() => seekToChapter(chapter)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="text-white font-semibold text-sm mb-1">
                        {chapter.title}
                      </h4>
                      <p className="text-white/60 text-xs">
                        {chapter.duration}
                      </p>
                    </div>
                    <div className="flex items-center">
                      {chapter.completed ? (
                        <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                          <span className="text-xs text-black">✓</span>
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full border border-white/30" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Additional Resources */}
          <div className="mt-6 pt-4 border-t border-[#FFD700]/20">
            <h4 className="text-white font-semibold mb-3">Resources</h4>
            <div className="space-y-2">
              {[
                { name: 'Course Notes', type: 'PDF' },
                { name: 'Practice Exercises', type: 'ZIP' },
                { name: 'Additional Reading', type: 'LINK' },
              ].map((resource, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 rounded-lg bg-black/20 hover:bg-black/30 transition-colors cursor-pointer"
                >
                  <span className="text-white/80 text-sm">{resource.name}</span>
                  <span className="text-[#FFD700] text-xs font-semibold">
                    {resource.type}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Immersive3DCard>
      </div>

      {/* Custom CSS Animations */}
      <style jsx>{`
        @keyframes pulse {
          0%,
          100% {
            opacity: 0.2;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>
    </div>
  );
};

