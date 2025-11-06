/* 
AZORA PROPRIETARY LICENSE 
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved. 

See LICENSE file for details. 
*/ 

/**
 * 🎥 UNIFIED VIDEO PLATFORM - AZORA SAPIENS EDUCATION
 *
 * Advanced video learning platform with integration across multiple platforms:
 * - YouTube (Educational content, tutorials)
 * - Microsoft Learn (Certifications, training)
 * - Google Cloud Training (Courses, certifications)
 * - Other educational platforms
 */

'use client';

import {
  Award,
  BookOpen,
  Clock,
  Copy,
  Loader2,
  Maximize2,
  MessageCircle,
  Minimize2,
  Pause,
  Play,
  Search,
  Send,
  Share,
  Sparkles,
  ThumbsDown,
  ThumbsUp,
  Users,
  Volume2,
  VolumeX,
} from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { Immersive3DCard } from '../immersive/Immersive3DCard';
import { OrganicButton } from '../organism/OrganicButton';

interface VideoContent {
  id: string;
  platform: 'youtube' | 'microsoft' | 'google' | 'other';
  title: string;
  description: string;
  duration: string;
  thumbnailUrl: string;
  url: string;
  embedUrl: string;
  publishDate: string;
  viewCount?: number;
  likeCount?: number;
  category: string;
  tags: string[];
  author: string;
  authorUrl?: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  azrReward?: number;
  contentType:
    | 'tutorial'
    | 'lecture'
    | 'demo'
    | 'course'
    | 'certification'
    | 'other';
}

interface VideoProgress {
  userId: string;
  videoId: string;
  platform: string;
  progress: number; // 0-100%
  completed: boolean;
  completionDate?: Date;
  quizScore?: number;
  notes?: string;
}

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  loading?: boolean;
}

interface UnifiedVideoPlatformProps {
  userId: string;
  onVideoSelect?: (video: VideoContent) => void;
  onProgressUpdate?: (progress: VideoProgress) => void;
}

export const UnifiedVideoPlatform: React.FC<UnifiedVideoPlatformProps> = ({
  userId,
  onVideoSelect,
}) => {
  const [videos, setVideos] = useState<VideoContent[]>([]);
  const [filteredVideos, setFilteredVideos] = useState<VideoContent[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<VideoContent | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(80);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [chatExpanded, setChatExpanded] = useState(true);
  const [chatMessage, setChatMessage] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content:
        "👋 Hi! I'm Elara, your AI learning assistant. I'm here to help you with any questions about this video or related topics. What would you like to know?",
      timestamp: new Date(),
    },
  ]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Mock data for demonstration
  useEffect(() => {
    const mockVideos: VideoContent[] = [
      {
        id: 'yt-sample-001',
        platform: 'youtube',
        title: 'Introduction to Azora OS Quantum Architecture',
        description:
          'Learn about the revolutionary quantum-secure architecture of Azora OS and how it protects your data.',
        duration: '15:30',
        thumbnailUrl: '/branding/videos/azora-os-brand-video.html',
        url: 'https://www.youtube.com/watch?v=sample1',
        embedUrl: 'https://www.youtube.com/embed/sample1',
        publishDate: '2025-01-15',
        viewCount: 12500,
        likeCount: 890,
        category: 'Technology',
        tags: ['quantum', 'security', 'architecture', 'introduction'],
        author: 'Azora OS Team',
        difficulty: 'beginner',
        azrReward: 5,
        contentType: 'tutorial',
      },
      {
        id: 'ms-sample-001',
        platform: 'microsoft',
        title: 'Microsoft Azure Fundamentals for Azora Developers',
        description:
          'Master Azure integration with Azora OS for scalable cloud deployments.',
        duration: '42:15',
        thumbnailUrl: '/branding/videos/elara-ai-video.html',
        url: 'https://learn.microsoft.com/sample1',
        embedUrl: 'https://learn.microsoft.com/embed/sample1',
        publishDate: '2025-02-20',
        viewCount: 8700,
        likeCount: 620,
        category: 'Cloud Computing',
        tags: ['azure', 'cloud', 'integration', 'microsoft'],
        author: 'Microsoft Learn',
        difficulty: 'intermediate',
        azrReward: 10,
        contentType: 'course',
      },
      {
        id: 'gc-sample-001',
        platform: 'google',
        title: 'Google Cloud AI Integration with Azora OS',
        description:
          'Learn how to leverage Google Cloud AI services within the Azora OS ecosystem.',
        duration: '35:45',
        thumbnailUrl: '/branding/videos/what-is-azora-os-video.html',
        url: 'https://cloud.google.com/training/sample1',
        embedUrl: 'https://cloud.google.com/training/embed/sample1',
        publishDate: '2025-03-10',
        viewCount: 9200,
        likeCount: 750,
        category: 'Artificial Intelligence',
        tags: ['ai', 'google cloud', 'machine learning', 'vertex ai'],
        author: 'Google Cloud Training',
        difficulty: 'advanced',
        azrReward: 15,
        contentType: 'certification',
      },
      {
        id: 'yt-sample-002',
        platform: 'youtube',
        title: 'Advanced Quantum Cryptography Techniques',
        description:
          'Deep dive into quantum cryptography and its applications in Azora OS.',
        duration: '28:42',
        thumbnailUrl: '/branding/videos/15-second-teaser.html',
        url: 'https://www.youtube.com/watch?v=sample2',
        embedUrl: 'https://www.youtube.com/embed/sample2',
        publishDate: '2025-04-01',
        viewCount: 15600,
        likeCount: 1200,
        category: 'Security',
        tags: ['quantum', 'cryptography', 'security'],
        author: 'Azora Security Team',
        difficulty: 'advanced',
        azrReward: 12,
        contentType: 'tutorial',
      },
      {
        id: 'ms-sample-002',
        platform: 'microsoft',
        title: 'Microsoft 365 Integration with Azora OS',
        description:
          'Learn how to seamlessly integrate Microsoft 365 with Azora OS for enhanced productivity.',
        duration: '32:18',
        thumbnailUrl: '/branding/videos/record-video.html',
        url: 'https://learn.microsoft.com/sample2',
        embedUrl: 'https://learn.microsoft.com/embed/sample2',
        publishDate: '2025-04-05',
        viewCount: 7800,
        likeCount: 540,
        category: 'Productivity',
        tags: ['microsoft 365', 'integration', 'productivity'],
        author: 'Microsoft Learn',
        difficulty: 'intermediate',
        azrReward: 8,
        contentType: 'course',
      },
    ];

    setVideos(mockVideos);
    setFilteredVideos(mockVideos);
  }, []);

  // Scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

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

  const handleVideoSelect = (video: VideoContent) => {
    setSelectedVideo(video);
    onVideoSelect?.(video);

    // Add a welcome message when a new video is selected
    setChatMessages([
      ...chatMessages,
      {
        role: 'assistant',
        content: `I see you've selected "${video.title}". I'm ready to help you learn about this topic. Ask me anything!`,
        timestamp: new Date(),
      },
    ]);
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'youtube':
        return (
          <div className="w-6 h-6 rounded-full bg-red-600 flex items-center justify-center">
            <span className="text-white text-xs font-bold">YT</span>
          </div>
        );
      case 'microsoft':
        return (
          <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center">
            <span className="text-white text-xs font-bold">MS</span>
          </div>
        );
      case 'google':
        return (
          <div className="w-6 h-6 rounded-full bg-green-600 flex items-center justify-center">
            <span className="text-white text-xs font-bold">GC</span>
          </div>
        );
      default:
        return (
          <div className="w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center">
            <span className="text-white text-xs font-bold">OT</span>
          </div>
        );
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-500/20 text-green-300';
      case 'intermediate':
        return 'bg-yellow-500/20 text-yellow-300';
      case 'advanced':
        return 'bg-purple-500/20 text-purple-300';
      case 'expert':
        return 'bg-red-500/20 text-red-300';
      default:
        return 'bg-blue-500/20 text-blue-300';
    }
  };

  // Handle sending a message to Elara
  const handleSendChatMessage = async () => {
    if (!chatMessage.trim() || isChatLoading) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: chatMessage,
      timestamp: new Date(),
    };

    setChatMessages(prev => [...prev, userMessage]);
    setChatMessage('');
    setIsChatLoading(true);

    // Add loading message
    const loadingMessage: ChatMessage = {
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      loading: true,
    };
    setChatMessages(prev => [...prev, loadingMessage]);

    try {
      // Simulate API call to Elara - in a real implementation, this would connect to the actual Elara service
      const response = await getElaraResponse(chatMessage, selectedVideo);

      // Remove loading message and add response
      setChatMessages(prev => {
        const newMessages = [...prev];
        newMessages.pop(); // Remove loading message
        newMessages.push({
          role: 'assistant',
          content: response,
          timestamp: new Date(),
        });
        return newMessages;
      });
    } catch (error) {
      setChatMessages(prev => {
        const newMessages = [...prev];
        newMessages.pop();
        newMessages.push({
          role: 'assistant',
          content: `Error: ${
            error instanceof Error
              ? error.message
              : 'Failed to get response from Elara'
          }`,
          timestamp: new Date(),
        });
        return newMessages;
      });
    } finally {
      setIsChatLoading(false);
    }
  };

  // Simulate Elara AI response
  const getElaraResponse = async (
    userMessage: string,
    video: VideoContent | null
  ): Promise<string> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Generate context-aware response
    const lowerMessage = userMessage.toLowerCase();

    if (video) {
      if (
        lowerMessage.includes('explain') ||
        lowerMessage.includes('what is') ||
        lowerMessage.includes('define')
      ) {
        return `Based on the video "${video.title}", I can explain that concept in detail. ${video.description}. Would you like me to dive deeper into any specific aspect?`;
      } else if (
        lowerMessage.includes('how') ||
        lowerMessage.includes('steps') ||
        lowerMessage.includes('process')
      ) {
        return `To understand how this works in the context of "${
          video.title
        }", you should focus on the key concepts presented. The video covers: ${video.tags.join(
          ', '
        )}. Try pausing at the 5-minute mark to practice what you've learned.`;
      } else if (
        lowerMessage.includes('example') ||
        lowerMessage.includes('demo')
      ) {
        return `Here's a practical example related to "${video.title}": You can apply these concepts by creating a small project that demonstrates ${video.category} principles. Would you like me to suggest a project idea?`;
      } else if (
        lowerMessage.includes('quiz') ||
        lowerMessage.includes('test') ||
        lowerMessage.includes('question')
      ) {
        return `Great! Let's test your knowledge. Here's a question about "${video.title}": What is the main benefit of ${video.category} as discussed in this video? Think about it, then check your understanding against the video content.`;
      } else if (
        lowerMessage.includes('summary') ||
        lowerMessage.includes('recap')
      ) {
        return `Here's a summary of "${video.title}": This ${
          video.contentType
        } covers ${video.category} concepts at a ${
          video.difficulty
        } level. Key topics include ${video.tags
          .slice(0, 3)
          .join(', ')}. You can earn ${
          video.azrReward || 0
        } AZR by completing this content.`;
      }
    }

    // General responses
    if (
      lowerMessage.includes('hello') ||
      lowerMessage.includes('hi') ||
      lowerMessage.includes('hey')
    ) {
      return "Hello! I'm Elara, your AI learning assistant. I'm here to help you with any questions about the video content or related topics. What would you like to learn about?";
    } else if (lowerMessage.includes('thank')) {
      return "You're welcome! I'm glad I could help. Is there anything else you'd like to know about this topic?";
    } else if (
      lowerMessage.includes('bye') ||
      lowerMessage.includes('goodbye')
    ) {
      return 'Goodbye! Feel free to come back anytime if you have more questions. Happy learning!';
    }

    // Default response
    return (
      `I understand you're asking about: "${userMessage}". As your AI learning assistant, I can help you with:\n\n` +
      `📘 Explanations of concepts\n` +
      `🔍 Clarifications on difficult topics\n` +
      `💡 Practical examples and applications\n` +
      `📝 Summaries of key points\n` +
      `❓ Quiz questions to test your knowledge\n\n` +
      `What specific aspect would you like to explore further?`
    );
  };

  // Handle feedback for chat messages
  const handleChatFeedback = (messageIndex: number, positive: boolean) => {
    // In a real implementation, this would send feedback to Elara
    console.log(
      `Feedback for message ${messageIndex}: ${
        positive ? 'positive' : 'negative'
      }`
    );
  };

  // Handle copying text from chat
  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Video List and Filters */}
      <div className="lg:col-span-1">
        <Immersive3DCard
          variant="glass"
          depth="medium"
          float={true}
          tilt={true}
          glow={true}
          className="w-full h-full"
        >
          {/* Search and Filters */}
          <div className="mb-6">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 w-4 h-4" />
              <input
                type="text"
                placeholder="Search videos..."
                className="w-full bg-black/30 border border-[#FFD700]/30 rounded-lg py-2 pl-10 pr-4 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#FFD700]"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-white/80 text-xs mb-1">
                  Platform
                </label>
                <select
                  className="w-full bg-black/30 border border-[#FFD700]/30 rounded-lg py-2 px-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#FFD700]"
                  value={selectedPlatform}
                  onChange={e => setSelectedPlatform(e.target.value)}
                >
                  <option value="all">All Platforms</option>
                  <option value="youtube">YouTube</option>
                  <option value="microsoft">Microsoft</option>
                  <option value="google">Google</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-white/80 text-xs mb-1">
                  Level
                </label>
                <select
                  className="w-full bg-black/30 border border-[#FFD700]/30 rounded-lg py-2 px-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#FFD700]"
                  value={selectedDifficulty}
                  onChange={e => setSelectedDifficulty(e.target.value)}
                >
                  <option value="all">All Levels</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                  <option value="expert">Expert</option>
                </select>
              </div>
            </div>

            <div className="mt-3">
              <label className="block text-white/80 text-xs mb-1">
                Category
              </label>
              <select
                className="w-full bg-black/30 border border-[#FFD700]/30 rounded-lg py-2 px-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#FFD700]"
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
              >
                <option value="all">All Categories</option>
                <option value="Technology">Technology</option>
                <option value="Cloud Computing">Cloud Computing</option>
                <option value="Artificial Intelligence">AI</option>
                <option value="Security">Security</option>
                <option value="Productivity">Productivity</option>
              </select>
            </div>
          </div>

          {/* Video List */}
          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
            {filteredVideos.map(video => (
              <div
                key={video.id}
                className={`p-3 rounded-xl cursor-pointer transition-all ${
                  selectedVideo?.id === video.id
                    ? 'bg-[#FFD700]/20 border border-[#FFD700]/30'
                    : 'bg-black/20 hover:bg-black/30'
                }`}
                onClick={() => handleVideoSelect(video)}
              >
                <div className="flex gap-3">
                  <div className="relative flex-shrink-0">
                    <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-[#0a0a1a] to-[#1a0a2e] flex items-center justify-center">
                      {getPlatformIcon(video.platform)}
                    </div>
                    <div className="absolute bottom-1 right-1 bg-black/70 rounded px-1 text-[8px] text-white">
                      {video.duration}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="text-white font-semibold text-sm mb-1 truncate">
                      {video.title}
                    </h4>
                    <p className="text-white/60 text-xs mb-2 line-clamp-2">
                      {video.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span
                        className={`px-2 py-1 rounded-full text-[8px] font-semibold ${getDifficultyColor(
                          video.difficulty
                        )}`}
                      >
                        {video.difficulty}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-white/50 text-xs">
                          {video.viewCount?.toLocaleString()} views
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Immersive3DCard>
      </div>

      {/* Main Video Player and Elara Chat */}
      <div className="lg:col-span-3">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 h-full">
          {/* Video Player */}
          <div className="xl:col-span-2">
            <Immersive3DCard
              variant="divine"
              depth="extreme"
              float={true}
              tilt={true}
              glow={true}
              className="w-full h-full"
            >
              {selectedVideo ? (
                <>
                  {/* Video Header */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                    <div className="mb-4 md:mb-0">
                      <div className="flex items-center gap-2 mb-2">
                        {getPlatformIcon(selectedVideo.platform)}
                        <h2 className="text-2xl font-bold text-white">
                          {selectedVideo.title}
                        </h2>
                      </div>
                      <div className="flex flex-wrap items-center gap-3">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${getDifficultyColor(
                            selectedVideo.difficulty
                          )}`}
                        >
                          {selectedVideo.difficulty.charAt(0).toUpperCase() +
                            selectedVideo.difficulty.slice(1)}
                        </span>
                        <span className="text-white/60 text-sm flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {selectedVideo.duration}
                        </span>
                        <span className="text-white/60 text-sm flex items-center">
                          <Users className="w-4 h-4 mr-1" />
                          {selectedVideo.viewCount?.toLocaleString()} learners
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <OrganicButton
                        variant="cosmic"
                        size="sm"
                        className="px-4 py-2"
                      >
                        <Award className="w-4 h-4 mr-2" />
                        {selectedVideo.azrReward} AZR
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
                              animation: `pulse ${
                                3 + Math.random() * 4
                              }s infinite`,
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
                        <h3 className="text-2xl font-bold text-white mb-2">
                          {selectedVideo.title}
                        </h3>
                        <p className="text-white/70 mb-6">
                          {selectedVideo.description}
                        </p>
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
                            00:00 / {selectedVideo.duration}
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => {}}
                            className="text-white hover:text-[#FFD700] transition-colors"
                          >
                            <BookOpen className="w-6 h-6" />
                          </button>

                          <button
                            onClick={() => {}}
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
                          {selectedVideo.author
                            .split(' ')
                            .map(n => n[0])
                            .join('')}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-white font-semibold">
                          {selectedVideo.author}
                        </h3>
                        <p className="text-white/60 text-sm">
                          Content Provider
                        </p>
                      </div>
                    </div>

                    <p className="text-white/80 mb-4">
                      {selectedVideo.description}
                    </p>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {selectedVideo.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-[#FFD700]/20 text-[#FFD700] rounded-full text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <OrganicButton
                        variant="neural"
                        size="sm"
                        className="px-4 py-2"
                      >
                        <ThumbsUp className="w-4 h-4 mr-2" />
                        Like
                      </OrganicButton>

                      <OrganicButton
                        variant="cosmic"
                        size="sm"
                        className="px-4 py-2"
                      >
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Comment
                      </OrganicButton>

                      <OrganicButton
                        variant="divine"
                        size="sm"
                        className="px-4 py-2"
                      >
                        <Share className="w-4 h-4 mr-2" />
                        Share
                      </OrganicButton>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-20">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#0a0a1a] to-[#1a0a2e] border-2 border-[#FFD700]/30 flex items-center justify-center mb-6">
                    <Play className="w-12 h-12 text-[#FFD700]" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">
                    Select a Video
                  </h3>
                  <p className="text-white/70 text-center max-w-md">
                    Choose from our extensive library of educational content
                    across multiple platforms
                  </p>
                </div>
              )}
            </Immersive3DCard>
          </div>

          {/* Elara AI Chat Panel */}
          <div className="xl:col-span-1">
            <Immersive3DCard
              variant="glass"
              depth="medium"
              float={true}
              tilt={true}
              glow={true}
              className="w-full h-full flex flex-col"
            >
              {/* Chat Header */}
              <div className="h-12 border-b border-[#FFD700]/30 flex items-center justify-between px-4 bg-black/20">
                {chatExpanded && (
                  <>
                    <div className="flex items-center space-x-2">
                      <div className="relative">
                        <Sparkles className="w-5 h-5 text-[#FFD700] animate-pulse" />
                        <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full border-2 border-black/50"></div>
                      </div>
                      <span className="font-semibold text-sm text-white">
                        Elara AI Assistant
                      </span>
                    </div>
                    <button
                      onClick={() => setChatExpanded(false)}
                      className="text-white/60 hover:text-white transition-colors"
                    >
                      <Minimize2 className="w-4 h-4" />
                    </button>
                  </>
                )}
                {!chatExpanded && (
                  <button
                    onClick={() => setChatExpanded(true)}
                    className="w-full flex justify-center text-[#FFD700] hover:text-[#FFA500] transition-colors"
                  >
                    <Sparkles className="w-5 h-5" />
                  </button>
                )}
              </div>

              {chatExpanded && (
                <>
                  {/* Chat Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-black/10 to-black/30">
                    {chatMessages.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`flex ${
                          msg.role === 'user' ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <div
                          className={`max-w-[90%] rounded-lg px-4 py-3 ${
                            msg.role === 'user'
                              ? 'bg-[#FFD700] text-black'
                              : 'bg-black/40 text-white border border-[#FFD700]/20'
                          }`}
                        >
                          {msg.loading ? (
                            <div className="flex items-center space-x-2">
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span className="text-sm">
                                Elara is thinking...
                              </span>
                            </div>
                          ) : (
                            <>
                              <div className="text-sm whitespace-pre-wrap">
                                {msg.content}
                              </div>

                              {/* Feedback buttons for assistant messages */}
                              {msg.role === 'assistant' && !msg.loading && (
                                <div className="flex items-center space-x-2 mt-2 pt-2 border-t border-[#FFD700]/10">
                                  <button
                                    onClick={() =>
                                      handleChatFeedback(idx, true)
                                    }
                                    className="p-1 hover:bg-black/20 rounded"
                                    title="Helpful"
                                  >
                                    <ThumbsUp className="w-3 h-3" />
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleChatFeedback(idx, false)
                                    }
                                    className="p-1 hover:bg-black/20 rounded"
                                    title="Not helpful"
                                  >
                                    <ThumbsDown className="w-3 h-3" />
                                  </button>
                                  <button
                                    onClick={() => handleCopyText(msg.content)}
                                    className="p-1 hover:bg-black/20 rounded ml-auto"
                                    title="Copy"
                                  >
                                    <Copy className="w-3 h-3" />
                                  </button>
                                  <span className="text-xs text-white/50 ml-auto">
                                    {msg.timestamp.toLocaleTimeString([], {
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })}
                                  </span>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Quick Actions */}
                  <div className="px-4 py-2 border-t border-[#FFD700]/30 bg-black/20">
                    <div className="flex items-center space-x-1 overflow-x-auto pb-2">
                      <button
                        className="px-3 py-1.5 bg-black/40 rounded-lg text-xs whitespace-nowrap hover:bg-black/60 transition-colors flex items-center space-x-1"
                        onClick={() => {
                          setChatMessage(
                            'Can you explain the main concepts in this video?'
                          );
                          setTimeout(() => handleSendChatMessage(), 100);
                        }}
                      >
                        <BookOpen className="w-3 h-3" />
                        <span>Explain</span>
                      </button>
                      <button
                        className="px-3 py-1.5 bg-black/40 rounded-lg text-xs whitespace-nowrap hover:bg-black/60 transition-colors flex items-center space-x-1"
                        onClick={() => {
                          setChatMessage(
                            'What are the key takeaways from this video?'
                          );
                          setTimeout(() => handleSendChatMessage(), 100);
                        }}
                      >
                        <Award className="w-3 h-3" />
                        <span>Summary</span>
                      </button>
                      <button
                        className="px-3 py-1.5 bg-black/40 rounded-lg text-xs whitespace-nowrap hover:bg-black/60 transition-colors flex items-center space-x-1"
                        onClick={() => {
                          setChatMessage(
                            'Can you give me a quiz question about this topic?'
                          );
                          setTimeout(() => handleSendChatMessage(), 100);
                        }}
                      >
                        <MessageCircle className="w-3 h-3" />
                        <span>Quiz</span>
                      </button>
                    </div>
                  </div>

                  {/* Chat Input */}
                  <div className="p-4 border-t border-[#FFD700]/30 bg-black/20">
                    <div className="flex space-x-2">
                      <textarea
                        value={chatMessage}
                        onChange={e => setChatMessage(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendChatMessage();
                          }
                        }}
                        placeholder="Ask Elara about this video..."
                        className="flex-1 px-3 py-2 bg-black/40 border border-[#FFD700]/30 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FFD700] resize-none min-h-[40px] max-h-[120px] text-white placeholder-white/50"
                        rows={1}
                        disabled={!selectedVideo}
                      />
                      <button
                        onClick={handleSendChatMessage}
                        disabled={
                          !chatMessage.trim() || isChatLoading || !selectedVideo
                        }
                        className="p-2 bg-[#FFD700] text-black rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="mt-2 text-xs text-white/60">
                      {selectedVideo
                        ? 'Ask questions about the video content'
                        : 'Select a video to start chatting with Elara'}
                    </div>
                  </div>
                </>
              )}
            </Immersive3DCard>
          </div>
        </div>
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

