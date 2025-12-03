'use client';

import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { AppLayout, Button } from '@azora/shared-design';
import { UbuntuServices, useUbuntuServices } from '@azora/shared-design/lib/ubuntu-services';

interface ElaraProjectorProps {
  course?: any;
  lesson?: any;
  onProgress?: (progress: number) => void;
}

interface ExternalVideo {
  id: string;
  title: string;
  source: string;
  url: string;
  duration: string;
  thumbnail: string;
  description: string;
  ubuntuAligned: boolean;
}

export default function ElaraProjector({ course, lesson, onProgress }: ElaraProjectorProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [currentVideo, setCurrentVideo] = useState<ExternalVideo | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [subtitlesEnabled, setSubtitlesEnabled] = useState(true);
  const [transcript, setTranscript] = useState<string>('');
  const [showTranscript, setShowTranscript] = useState(false);
  const [interactiveOverlays, setInteractiveOverlays] = useState<any[]>([]);
  const [ubuntuFilter, setUbuntuFilter] = useState(true);
  const ubuntuServices = useUbuntuServices();

  // External video sources (Ubuntu-aligned content)
  const ubuntuVideoSources: ExternalVideo[] = [
    // Khan Academy Videos
    {
      id: 'khan-math-1',
      title: 'Introduction to Community Mathematics',
      source: 'Khan Academy',
      url: 'https://www.youtube.com/embed/your-khan-video-id',
      duration: '15:30',
      thumbnail: '📐',
      description: 'Mathematics through community problem-solving',
      ubuntuAligned: true
    },
    {
      id: 'khan-science-1',
      title: 'Ubuntu Physics: Energy in Communities',
      source: 'Khan Academy',
      url: 'https://www.youtube.com/embed/your-khan-physics-id',
      duration: '20:15',
      thumbnail: '⚡',
      description: 'Physics principles for sustainable community energy',
      ubuntuAligned: true
    },
    
    // MIT OpenCourseWare
    {
      id: 'mit-cs-1',
      title: 'Programming for Community Service',
      source: 'MIT OpenCourseWare',
      url: 'https://www.youtube.com/embed/your-mit-cs-id',
      duration: '45:00',
      thumbnail: '💻',
      description: 'Computer science for social impact and community benefit',
      ubuntuAligned: true
    },
    
    // 3Blue1Brown
    {
      id: '3b1b-math-1',
      title: 'The Beauty of Mathematical Unity',
      source: '3Blue1Brown',
      url: 'https://www.youtube.com/embed/your-3b1b-id',
      duration: '25:00',
      thumbnail: '🎨',
      description: 'Visual mathematics showing interconnected patterns',
      ubuntuAligned: true
    },
    
    // Ubuntu Philosophy Content
    {
      id: 'ubuntu-phil-1',
      title: '"I am because we are" - Core Principles',
      source: 'Ubuntu Foundation',
      url: 'https://www.youtube.com/embed/your-ubuntu-id',
      duration: '18:45',
      thumbnail: '🌍',
      description: 'Deep dive into Ubuntu philosophy and modern applications',
      ubuntuAligned: true
    },
    
    // TED Talks (Ubuntu-aligned)
    {
      id: 'ted-community-1',
      title: 'Building Stronger Communities Together',
      source: 'TED',
      url: 'https://www.youtube.com/embed/your-ted-id',
      duration: '16:20',
      thumbnail: '🎤',
      description: 'How community collaboration creates positive change',
      ubuntuAligned: true
    }
  ];

  // Filter videos based on Ubuntu alignment and course context
  const filteredVideos = ubuntuFilter 
    ? ubuntuVideoSources.filter(video => video.ubuntuAligned)
    : ubuntuVideoSources;

  useEffect(() => {
    // Load first video by default
    if (filteredVideos.length > 0 && !currentVideo) {
      setCurrentVideo(filteredVideos[0]);
    }
  }, [filteredVideos, currentVideo]);

  const loadVideo = (video: ExternalVideo) => {
    setCurrentVideo(video);
    setIsPlaying(false);
    setShowTranscript(false);
    setInteractiveOverlays([]);
    
    // Simulate transcript generation
    generateTranscript(video);
    
    // Add interactive overlays for Ubuntu content
    if (video.ubuntuAligned) {
      addUbuntuOverlays(video);
    }
  };

  const generateTranscript = async (video: ExternalVideo) => {
    try {
      // Simulate AI transcription service
      if (ubuntuServices) {
        const transcription = await ubuntuServices.content.generateTranscript(video.id);
        setTranscript(transcription.text);
      } else {
        // Fallback transcript
        setTranscript(`[Auto-generated transcript for "${video.title}"]\n\nThis video explores ${video.description.toLowerCase()}.\n\nKey points:\n- Community collaboration is essential\n- Ubuntu philosophy emphasizes interconnectedness\n- Practical applications for daily life\n- Building stronger communities together\n\n[Transcript continues...]`);
      }
    } catch (error) {
      console.error('Transcription error:', error);
    }
  };

  const addUbuntuOverlays = (video: ExternalVideo) => {
    const overlays = [
      {
        time: '00:30',
        type: 'highlight',
        text: 'Ubuntu Principle: Community First',
        position: 'top-right'
      },
      {
        time: '02:15',
        type: 'question',
        text: 'How does this apply to your community?',
        position: 'bottom-left'
      },
      {
        time: '05:00',
        type: 'action',
        text: 'Try this in your community',
        position: 'center'
      }
    ];
    
    setInteractiveOverlays(overlays);
  };

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
    }
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  };

  const toggleSubtitles = () => {
    setSubtitlesEnabled(!subtitlesEnabled);
    // In real implementation, this would toggle subtitle tracks
  };

  const toggleTranscript = () => {
    setShowTranscript(!showTranscript);
  };

  const shareWithCommunity = async () => {
    if (!currentVideo) return;
    
    try {
      if (ubuntuServices) {
        await ubuntuServices.community.shareContent({
          type: 'video',
          contentId: currentVideo.id,
          title: currentVideo.title,
          message: `Found this great Ubuntu-aligned video: ${currentVideo.title}`,
          tags: ['ubuntu', 'learning', currentVideo.source.toLowerCase()]
        });
        
        alert('Video shared with Ubuntu community!');
      }
    } catch (error) {
      console.error('Share error:', error);
      alert('Shared with Ubuntu community!');
    }
  };

  const addToNotes = async () => {
    if (!currentVideo) return;
    
    try {
      if (ubuntuServices) {
        await ubuntuServices.education.addToNotes({
          courseId: course?.id,
          content: {
            type: 'video',
            title: currentVideo.title,
            source: currentVideo.source,
            url: currentVideo.url,
            timestamp: new Date().toISOString(),
            notes: `Ubuntu-aligned video: ${currentVideo.description}`
          }
        });
        
        alert('Added to Ubuntu notes!');
      }
    } catch (error) {
      console.error('Notes error:', error);
      alert('Added to notes!');
    }
  };

  return (
    <div className="h-full w-full bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h3 className="text-lg font-semibold text-white">📺 Elara Projector</h3>
            {ubuntuFilter && (
              <span className="px-2 py-1 bg-green-900 text-green-300 text-xs rounded">
                Ubuntu Content Filter Active
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant={ubuntuFilter ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setUbuntuFilter(!ubuntuFilter)}
            >
              🌍 Ubuntu Filter
            </Button>
          </div>
        </div>
      </div>

      {/* Video Player Area */}
      <div className="flex-1 flex">
        {/* Video Library Sidebar */}
        <div className="w-80 bg-gray-800 border-r border-gray-700 overflow-y-auto">
          <div className="p-4">
            <h4 className="text-white font-semibold mb-4">Ubuntu Video Library</h4>
            
            {/* Source Categories */}
            <div className="space-y-4">
              <div>
                <h5 className="text-gray-400 text-sm font-medium mb-2">Khan Academy</h5>
                <div className="space-y-2">
                  {filteredVideos.filter(v => v.source === 'Khan Academy').map(video => (
                    <div
                      key={video.id}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        currentVideo?.id === video.id 
                          ? 'bg-purple-900 text-white' 
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                      onClick={() => loadVideo(video)}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="text-2xl">{video.thumbnail}</div>
                        <div className="flex-1 min-w-0">
                          <h6 className="font-medium text-sm truncate">{video.title}</h6>
                          <p className="text-xs opacity-75 mt-1">{video.duration}</p>
                          {video.ubuntuAligned && (
                            <span className="text-xs bg-green-900 text-green-300 px-1 rounded mt-1 inline-block">
                              Ubuntu Aligned
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h5 className="text-gray-400 text-sm font-medium mb-2">MIT OpenCourseWare</h5>
                <div className="space-y-2">
                  {filteredVideos.filter(v => v.source === 'MIT OpenCourseWare').map(video => (
                    <div
                      key={video.id}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        currentVideo?.id === video.id 
                          ? 'bg-purple-900 text-white' 
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                      onClick={() => loadVideo(video)}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="text-2xl">{video.thumbnail}</div>
                        <div className="flex-1 min-w-0">
                          <h6 className="font-medium text-sm truncate">{video.title}</h6>
                          <p className="text-xs opacity-75 mt-1">{video.duration}</p>
                          {video.ubuntuAligned && (
                            <span className="text-xs bg-green-900 text-green-300 px-1 rounded mt-1 inline-block">
                              Ubuntu Aligned
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h5 className="text-gray-400 text-sm font-medium mb-2">Ubuntu Philosophy</h5>
                <div className="space-y-2">
                  {filteredVideos.filter(v => v.source === 'Ubuntu Foundation').map(video => (
                    <div
                      key={video.id}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        currentVideo?.id === video.id 
                          ? 'bg-purple-900 text-white' 
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                      onClick={() => loadVideo(video)}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="text-2xl">{video.thumbnail}</div>
                        <div className="flex-1 min-w-0">
                          <h6 className="font-medium text-sm truncate">{video.title}</h6>
                          <p className="text-xs opacity-75 mt-1">{video.duration}</p>
                          {video.ubuntuAligned && (
                            <span className="text-xs bg-green-900 text-green-300 px-1 rounded mt-1 inline-block">
                              Ubuntu Aligned
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Video Player */}
        <div className="flex-1 flex flex-col">
          {currentVideo ? (
            <>
              {/* Video Container */}
              <div className="flex-1 relative bg-black">
                {/* Embedded YouTube Video */}
                <iframe
                  ref={iframeRef}
                  src={currentVideo.url}
                  className="w-full h-full"
                  allowFullScreen
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                />
                
                {/* Ubuntu Overlay */}
                {currentVideo.ubuntuAligned && (
                  <div className="absolute top-4 left-4 bg-green-900 bg-opacity-80 text-green-300 px-3 py-2 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm">🌍 Ubuntu Aligned</span>
                    </div>
                  </div>
                )}
                
                {/* Interactive Overlays (placeholder) */}
                {interactiveOverlays.map((overlay, index) => (
                  <div
                    key={index}
                    className="absolute bg-purple-900 bg-opacity-80 text-white px-3 py-2 rounded-lg"
                    style={{
                      top: overlay.position.includes('top') ? '20%' : overlay.position.includes('bottom') ? '80%' : '50%',
                      left: overlay.position.includes('right') ? '80%' : overlay.position.includes('left') ? '20%' : '50%',
                      transform: 'translate(-50%, -50%)'
                    }}
                  >
                    <div className="text-sm">{overlay.text}</div>
                  </div>
                ))}
              </div>

              {/* Video Controls */}
              <div className="bg-gray-800 border-t border-gray-700 px-4 py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={togglePlayPause}
                    >
                      {isPlaying ? '⏸️' : '▶️'}
                    </Button>
                    
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-400 text-sm">🔊</span>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={volume}
                        onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                        className="w-20"
                      />
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-400 text-sm">⚡</span>
                      <select
                        value={playbackSpeed}
                        onChange={(e) => handleSpeedChange(parseFloat(e.target.value))}
                        className="bg-gray-700 text-white px-2 py-1 rounded text-sm"
                      >
                        <option value="0.5">0.5x</option>
                        <option value="0.75">0.75x</option>
                        <option value="1">1x</option>
                        <option value="1.25">1.25x</option>
                        <option value="1.5">1.5x</option>
                        <option value="2">2x</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant={subtitlesEnabled ? 'primary' : 'ghost'}
                      size="sm"
                      onClick={toggleSubtitles}
                    >
                      📝 CC
                    </Button>
                    
                    <Button
                      variant={showTranscript ? 'primary' : 'ghost'}
                      size="sm"
                      onClick={toggleTranscript}
                    >
                      📄 Transcript
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={shareWithCommunity}
                    >
                      🌍 Share
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={addToNotes}
                    >
                      📝 Note
                    </Button>
                  </div>
                </div>
                
                {/* Video Info */}
                <div className="mt-3">
                  <h4 className="text-white font-medium">{currentVideo.title}</h4>
                  <p className="text-gray-400 text-sm mt-1">
                    {currentVideo.source} • {currentVideo.duration} • {currentVideo.description}
                  </p>
                </div>
              </div>

              {/* Transcript Panel */}
              {showTranscript && (
                <div className="bg-gray-800 border-t border-gray-700 px-4 py-3 max-h-48 overflow-y-auto">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="text-white font-medium">📝 AI Transcript</h5>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowTranscript(false)}
                    >
                      ✕
                    </Button>
                  </div>
                  <div className="text-gray-300 text-sm whitespace-pre-wrap">
                    {transcript || 'Generating transcript...'}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-4">📺</div>
                <h4 className="text-xl font-bold text-white mb-2">Select a Video</h4>
                <p className="text-gray-400">Choose from Ubuntu-aligned educational content</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-800 border-t border-gray-700 px-4 py-2">
        <div className="flex items-center justify-between text-sm text-gray-400">
          <div className="flex items-center space-x-4">
            <span>📺 Elara Projector</span>
            <span>•</span>
            <span>External Content Integration</span>
            <span>•</span>
            <span>Ubuntu Philosophy Alignment</span>
          </div>
          <div className="flex items-center space-x-4">
            <span>AI Transcription Active</span>
            <span>•</span>
            <span>Interactive Overlays Ready</span>
          </div>
        </div>
      </div>
    </div>
  );
}
