'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { AppLayout, Button } from '@azora/shared-design';
import { UbuntuServices, useUbuntuServices } from '@azora/shared-design/lib/ubuntu-services';

// WebRTC types
interface PeerConnection {
  id: string;
  name: string;
  role: 'teacher' | 'student' | 'mentor';
  stream?: MediaStream;
  connection?: RTCPeerConnection;
  isOnline: boolean;
  ubuntuScore: number;
}

interface UbuntuRoom {
  id: string;
  name: string;
  type: 'study' | 'discussion' | 'workshop' | 'mentorship';
  participants: PeerConnection[];
  maxParticipants: number;
  ubuntuTheme: string;
  isRecording: boolean;
}

interface SharedCanvas {
  id: string;
  elements: any[];
  version: number;
  lastModified: string;
  collaborators: string[];
  ubuntuTemplate?: string;
}

interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  content: string;
  timestamp: string;
  ubuntuWisdom?: string;
  messageType: 'text' | 'system' | 'ubuntu-wisdom';
}

export default function WebRTCCollaboration() {
  const [isConnected, setIsConnected] = useState(false);
  const [currentRoom, setCurrentRoom] = useState<UbuntuRoom | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [peers, setPeers] = useState<PeerConnection[]>([]);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [sharedCanvas, setSharedCanvas] = useState<SharedCanvas | null>(null);
  const [ubuntuReactions, setUbuntuReactions] = useState<string[]>([]);
  const [breakoutRooms, setBreakoutRooms] = useState<UbuntuRoom[]>([]);
  const ubuntuServices = useUbuntuServices();

  // Video refs
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideosRef = useRef<{ [key: string]: HTMLVideoElement }>({});
  const screenShareRef = useRef<HTMLVideoElement>(null);

  // Ubuntu room themes
  const ubuntuThemes = [
    { id: 'community-circle', name: 'Community Circle', description: 'Ubuntu unity and connection' },
    { id: 'knowledge-web', name: 'Knowledge Web', description: 'Interconnected learning' },
    { id: 'growth-spiral', name: 'Growth Spiral', description: 'Continuous development' },
    { id: 'harmony-grid', name: 'Harmony Grid', description: 'Balanced collaboration' },
    { id: 'ubuntu-tree', name: 'Ubuntu Tree', description: 'Growing together' }
  ];

  // Ubuntu reactions
  const ubuntuReactionEmojis = ['🌍', '🤝', '💚', '🙏', '🌟', '🎯', '🧠', '❤️'];

  useEffect(() => {
    initializeWebRTC();
    return () => {
      cleanupWebRTC();
    };
  }, []);

  const initializeWebRTC = async () => {
    try {
      // Get local media stream
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      
      setLocalStream(stream);
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      
      // Initialize Ubuntu WebRTC service
      if (ubuntuServices) {
        await ubuntuServices.collaboration.initializeWebRTC({
          userId: 'demo-student-001',
          userName: 'Ubuntu Learner',
          ubuntuMode: true,
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' }
          ]
        });
      }
      
      console.log('Ubuntu WebRTC initialized');
    } catch (error) {
      console.error('WebRTC initialization error:', error);
    }
  };

  const cleanupWebRTC = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    
    peers.forEach(peer => {
      if (peer.stream) {
        peer.stream.getTracks().forEach(track => track.stop());
      }
      if (peer.connection) {
        peer.connection.close();
      }
    });
  };

  const joinUbuntuRoom = async (roomType: 'study' | 'discussion' | 'workshop' | 'mentorship') => {
    try {
      if (!localStream) return;

      // Create Ubuntu room
      const room: UbuntuRoom = {
        id: `ubuntu-room-${Date.now()}`,
        name: `Ubuntu ${roomType.charAt(0).toUpperCase() + roomType.slice(1)} Room`,
        type: roomType,
        participants: [],
        maxParticipants: roomType === 'mentorship' ? 3 : 12,
        ubuntuTheme: ubuntuThemes[0].id,
        isRecording: false
      };

      // Join room through Ubuntu services
      if (ubuntuServices) {
        const joinedRoom = await ubuntuServices.collaboration.joinWebRTCRoom({
          roomId: room.id,
          roomType: roomType,
          stream: localStream,
          ubuntuFeatures: {
            spatialAudio: true,
            ubuntuReactions: true,
            collaborativeCanvas: true,
            breakoutRooms: roomType === 'workshop'
          }
        });
        
        setCurrentRoom(joinedRoom);
        setIsConnected(true);
        
        // Add system message
        const systemMessage: ChatMessage = {
          id: `system-${Date.now()}`,
          userId: 'system',
          userName: 'Ubuntu System',
          content: `Welcome to the Ubuntu ${roomType} room! Remember: "I am because we are"`,
          timestamp: new Date().toISOString(),
          messageType: 'system'
        };
        
        setChatMessages([systemMessage]);
        
        // Simulate other participants joining
        setTimeout(() => simulateParticipantsJoining(room), 1000);
        
      } else {
        // Mock room creation
        setCurrentRoom(room);
        setIsConnected(true);
        simulateParticipantsJoining(room);
      }
      
    } catch (error) {
      console.error('Room join error:', error);
    }
  };

  const simulateParticipantsJoining = (room: UbuntuRoom) => {
    const mockParticipants: PeerConnection[] = [
      {
        id: 'ubuntu-teacher-001',
        name: 'Ubuntu Teacher',
        role: 'teacher',
        isOnline: true,
        ubuntuScore: 95
      },
      {
        id: 'ubuntu-student-002',
        name: 'Community Student',
        role: 'student',
        isOnline: true,
        ubuntuScore: 85
      },
      {
        id: 'ubuntu-mentor-003',
        name: 'Ubuntu Mentor',
        role: 'mentor',
        isOnline: true,
        ubuntuScore: 90
      }
    ];

    // Add participants one by one
    mockParticipants.forEach((participant, index) => {
      setTimeout(() => {
        setPeers(prev => [...prev, participant]);
        
        const joinMessage: ChatMessage = {
          id: `join-${participant.id}`,
          userId: participant.id,
          userName: participant.name,
          content: `${participant.name} joined the Ubuntu room`,
          timestamp: new Date().toISOString(),
          messageType: 'system'
        };
        
        setChatMessages(prev => [...prev, joinMessage]);
      }, (index + 1) * 1500);
    });
  };

  const toggleAudio = () => {
    if (localStream) {
      const audioTracks = localStream.getAudioTracks();
      audioTracks.forEach(track => {
        track.enabled = !isAudioEnabled;
      });
      setIsAudioEnabled(!isAudioEnabled);
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      const videoTracks = localStream.getVideoTracks();
      videoTracks.forEach(track => {
        track.enabled = !isVideoEnabled;
      });
      setIsVideoEnabled(!isVideoEnabled);
    }
  };

  const startScreenShare = async () => {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true
      });
      
      if (screenShareRef.current) {
        screenShareRef.current.srcObject = screenStream;
      }
      
      setIsScreenSharing(true);
      
      // Add system message
      const shareMessage: ChatMessage = {
        id: 'screen-share',
        userId: 'system',
        userName: 'Ubuntu System',
        content: 'Screen sharing started - Ubuntu collaboration enhanced!',
        timestamp: new Date().toISOString(),
        messageType: 'system'
      };
      
      setChatMessages(prev => [...prev, shareMessage]);
      
      // Stop screen share when ended
      screenStream.getVideoTracks()[0].addEventListener('ended', () => {
        setIsScreenSharing(false);
        if (screenShareRef.current) {
          screenShareRef.current.srcObject = null;
        }
      });
      
    } catch (error) {
      console.error('Screen share error:', error);
    }
  };

  const sendMessage = () => {
    if (!messageInput.trim()) return;

    const message: ChatMessage = {
      id: `msg-${Date.now()}`,
      userId: 'demo-student-001',
      userName: 'Ubuntu Learner',
      content: messageInput,
      timestamp: new Date().toISOString(),
      messageType: 'text',
      ubuntuWisdom: Math.random() > 0.7 ? getRandomUbuntuWisdom() : undefined
    };

    setChatMessages(prev => [...prev, message]);
    setMessageInput('');

    // Simulate response
    if (messageInput.toLowerCase().includes('ubuntu') || messageInput.toLowerCase().includes('community')) {
      setTimeout(() => {
        const response: ChatMessage = {
          id: `response-${Date.now()}`,
          userId: 'ubuntu-teacher-001',
          userName: 'Ubuntu Teacher',
          content: 'Beautiful Ubuntu thinking! Remember that "I am because we are" guides all our learning together.',
          timestamp: new Date().toISOString(),
          messageType: 'text',
          ubuntuWisdom: 'Your Ubuntu wisdom strengthens our entire community.'
        };
        setChatMessages(prev => [...prev, response]);
      }, 2000);
    }
  };

  const sendUbuntuReaction = (emoji: string) => {
    setUbuntuReactions(prev => [...prev, emoji]);
    
    // Remove reaction after 3 seconds
    setTimeout(() => {
      setUbuntuReactions(prev => prev.filter(r => r !== emoji));
    }, 3000);

    // Add reaction message
    const reactionMessage: ChatMessage = {
      id: `reaction-${Date.now()}`,
      userId: 'demo-student-001',
      userName: 'Ubuntu Learner',
      content: `Sent Ubuntu reaction: ${emoji}`,
      timestamp: new Date().toISOString(),
      messageType: 'text'
    };
    
    setChatMessages(prev => [...prev, reactionMessage]);
  };

  const createBreakoutRoom = () => {
    if (!currentRoom || peers.length < 4) return;

    const newRoom: UbuntuRoom = {
      id: `breakout-${Date.now()}`,
      name: 'Ubuntu Breakout Discussion',
      type: 'discussion',
      participants: peers.slice(0, 3),
      maxParticipants: 4,
      ubuntuTheme: 'knowledge-web',
      isRecording: false
    };

    setBreakoutRooms(prev => [...prev, newRoom]);

    const breakoutMessage: ChatMessage = {
      id: 'breakout-created',
      userId: 'system',
      userName: 'Ubuntu System',
      content: 'Breakout room created for focused Ubuntu discussion!',
      timestamp: new Date().toISOString(),
      messageType: 'system'
    };

    setChatMessages(prev => [...prev, breakoutMessage]);
  };

  const startCollaborativeCanvas = () => {
    const canvas: SharedCanvas = {
      id: `canvas-${Date.now()}`,
      elements: [],
      version: 1,
      lastModified: new Date().toISOString(),
      collaborators: ['demo-student-001'],
      ubuntuTemplate: 'community-circle'
    };

    setSharedCanvas(canvas);

    const canvasMessage: ChatMessage = {
      id: 'canvas-started',
      userId: 'system',
      userName: 'Ubuntu System',
      content: 'Collaborative Ubuntu canvas started! Let\'s create together.',
      timestamp: new Date().toISOString(),
      messageType: 'system'
    };

    setChatMessages(prev => [...prev, canvasMessage]);
  };

  const getRandomUbuntuWisdom = (): string => {
    const wisdom = [
      "I am because we are - our humanity is interconnected",
      "Alone we can do so little; together we can do so much",
      "The best way to predict the future is to create it together",
      "Knowledge is only meaningful when shared with the community",
      "Your success lifts the entire community",
      "We rise by lifting others"
    ];
    
    return wisdom[Math.floor(Math.random() * wisdom.length)];
  };

  const leaveRoom = () => {
    cleanupWebRTC();
    setIsConnected(false);
    setCurrentRoom(null);
    setPeers([]);
    setChatMessages([]);
    setSharedCanvas(null);
    setBreakoutRooms([]);
  };

  return (
    <div className="h-full w-full bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h3 className="text-lg font-semibold text-white">🌐 Ubuntu WebRTC Collaboration</h3>
            {isConnected && currentRoom && (
              <>
                <span className="px-2 py-1 bg-green-900 text-green-300 text-xs rounded">
                  Connected
                </span>
                <span className="px-2 py-1 bg-purple-900 text-purple-300 text-xs rounded">
                  {currentRoom.name}
                </span>
                <span className="px-2 py-1 bg-blue-900 text-blue-300 text-xs rounded">
                  {peers.length + 1} participants
                </span>
              </>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {isConnected ? (
              <Button variant="ghost" size="sm" onClick={leaveRoom}>
                🚪 Leave Room
              </Button>
            ) : (
              <div className="flex items-center space-x-2">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => joinUbuntuRoom('study')}
                >
                  📚 Study Room
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => joinUbuntuRoom('discussion')}
                >
                  💬 Discussion
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => joinUbuntuRoom('workshop')}
                >
                  🛠️ Workshop
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => joinUbuntuRoom('mentorship')}
                >
                  🧑‍🏫 Mentorship
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {!isConnected ? (
        /* Room Selection */
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-2xl">
            <div className="text-6xl mb-4">🌐</div>
            <h3 className="text-2xl font-bold text-white mb-4">Ubuntu WebRTC Collaboration</h3>
            <p className="text-gray-400 mb-8">
              Connect with Ubuntu learners through real-time video, audio, and collaborative tools. 
              Experience "I am because we are" through live interaction.
            </p>
            
            <div className="grid grid-cols-2 gap-4 mb-8">
              {ubuntuThemes.map((theme) => (
                <div key={theme.id} className="bg-gray-800 rounded-lg p-4">
                  <h4 className="text-white font-medium mb-2">{theme.name}</h4>
                  <p className="text-gray-400 text-sm">{theme.description}</p>
                </div>
              ))}
            </div>
            
            <div className="text-gray-400 text-sm">
              <p>🌍 Ubuntu philosophy guides all interactions</p>
              <p>🤝 Real-time collaboration with community members</p>
              <p>🎯 Focus on collective learning and growth</p>
            </div>
          </div>
        </div>
      ) : (
        /* Collaboration Interface */
        <div className="flex-1 flex">
          {/* Video Grid */}
          <div className="flex-1 p-4">
            <div className="grid grid-cols-2 gap-4 h-full">
              {/* Local Video */}
              <div className="relative bg-gray-800 rounded-lg overflow-hidden">
                <video
                  ref={localVideoRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 px-2 py-1 rounded">
                  <span className="text-white text-sm">You (Ubuntu Learner)</span>
                </div>
                <div className="absolute top-2 right-2 flex space-x-1">
                  {!isAudioEnabled && (
                    <span className="bg-red-500 text-white text-xs px-1 rounded">🔇</span>
                  )}
                  {!isVideoEnabled && (
                    <span className="bg-red-500 text-white text-xs px-1 rounded">📹</span>
                  )}
                </div>
              </div>

              {/* Remote Videos */}
              {peers.slice(0, 3).map((peer, index) => (
                <div key={peer.id} className="relative bg-gray-800 rounded-lg overflow-hidden">
                  <div className="w-full h-full flex items-center justify-center bg-gray-700">
                    <div className="text-center">
                      <div className="text-4xl mb-2">👤</div>
                      <div className="text-white font-medium">{peer.name}</div>
                      <div className="text-gray-400 text-sm">{peer.role}</div>
                      <div className="text-green-400 text-sm">Ubuntu Score: {peer.ubuntuScore}%</div>
                    </div>
                  </div>
                  <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 px-2 py-1 rounded">
                    <span className="text-white text-sm">{peer.name}</span>
                  </div>
                </div>
              ))}

              {/* Screen Share */}
              {isScreenSharing && (
                <div className="relative bg-gray-800 rounded-lg overflow-hidden">
                  <video
                    ref={screenShareRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 px-2 py-1 rounded">
                    <span className="text-white text-sm">🖥️ Screen Share</span>
                  </div>
                </div>
              )}

              {/* Ubuntu Reactions Overlay */}
              {ubuntuReactions.length > 0 && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className="text-6xl animate-bounce">
                    {ubuntuReactions[ubuntuReactions.length - 1]}
                  </div>
                </div>
              )}
            </div>

            {/* Video Controls */}
            <div className="mt-4 flex items-center justify-center space-x-2">
              <Button
                variant={isAudioEnabled ? 'primary' : 'ghost'}
                size="sm"
                onClick={toggleAudio}
              >
                {isAudioEnabled ? '🎤' : '🔇'} Audio
              </Button>
              <Button
                variant={isVideoEnabled ? 'primary' : 'ghost'}
                size="sm"
                onClick={toggleVideo}
              >
                {isVideoEnabled ? '📹' : '📵'} Video
              </Button>
              <Button
                variant={isScreenSharing ? 'primary' : 'ghost'}
                size="sm"
                onClick={startScreenShare}
              >
                🖥️ Share Screen
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={createBreakoutRoom}
                disabled={peers.length < 4}
              >
                🚪 Breakout Room
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={startCollaborativeCanvas}
              >
                🎨 Canvas
              </Button>
            </div>

            {/* Ubuntu Reactions */}
            <div className="mt-4 flex items-center justify-center space-x-2">
              <span className="text-gray-400 text-sm mr-2">Ubuntu Reactions:</span>
              {ubuntuReactionEmojis.map((emoji) => (
                <button
                  key={emoji}
                  className="text-2xl hover:scale-125 transition-transform"
                  onClick={() => sendUbuntuReaction(emoji)}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Chat Sidebar */}
          <div className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col">
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-700">
              <h4 className="text-white font-semibold">Ubuntu Chat</h4>
              <p className="text-gray-400 text-sm">Community conversation</p>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {chatMessages.map((message) => (
                <div
                  key={message.id}
                  className={`${
                    message.userId === 'demo-student-001'
                      ? 'text-right'
                      : message.messageType === 'system'
                      ? 'text-center'
                      : 'text-left'
                  }`}
                >
                  <div
                    className={`inline-block px-3 py-2 rounded-lg max-w-xs ${
                      message.userId === 'demo-student-001'
                        ? 'bg-purple-900 text-white'
                        : message.messageType === 'system'
                        ? 'bg-gray-700 text-gray-300 text-sm'
                        : 'bg-gray-700 text-white'
                    }`}
                  >
                    {message.messageType !== 'system' && (
                      <div className="font-medium text-xs mb-1 opacity-75">
                        {message.userName}
                      </div>
                    )}
                    <div className="text-sm">{message.content}</div>
                    {message.ubuntuWisdom && (
                      <div className="mt-2 pt-2 border-t border-gray-600">
                        <div className="text-xs text-green-400 italic">
                          🌍 {message.ubuntuWisdom}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-700">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Share Ubuntu thoughts..."
                  className="flex-1 bg-gray-700 text-white px-3 py-2 rounded text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <Button variant="primary" size="sm" onClick={sendMessage}>
                  Send
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="bg-gray-800 border-t border-gray-700 px-4 py-2">
        <div className="flex items-center justify-between text-sm text-gray-400">
          <div className="flex items-center space-x-4">
            <span>🌐 Ubuntu WebRTC</span>
            <span>•</span>
            <span>Real-time Collaboration</span>
            <span>•</span>
            <span>Ubuntu Philosophy Integration</span>
          </div>
          <div className="flex items-center space-x-4">
            <span>WebRTC Active</span>
            <span>•</span>
            <span>Community Connected</span>
          </div>
        </div>
      </div>
    </div>
  );
}
