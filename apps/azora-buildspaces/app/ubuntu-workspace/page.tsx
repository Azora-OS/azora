'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  MessageSquare, 
  Video, 
  Share, 
  Heart, 
  Zap, 
  Brain,
  Lightbulb,
  Award,
  Target,
  Clock,
  Mic,
  MicOff,
  VideoOff,
  Settings,
  Plus,
  Search,
  Filter
} from 'lucide-react';
import { AppLayout } from '../../components/AppLayout';
import { AccessibleCard, GradientText, Button } from '../../components';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar: string;
  status: 'online' | 'busy' | 'away' | 'offline';
  ubuntuScore: number;
  currentActivity?: string;
  isSpeaking?: boolean;
  isMuted?: boolean;
  videoOn?: boolean;
}

interface UbuntuIdea {
  id: string;
  title: string;
  description: string;
  author: string;
  timestamp: string;
  ubuntuScore: number;
  category: 'innovation' | 'community' | 'efficiency' | 'learning';
  votes: number;
  comments: number;
  status: 'active' | 'developing' | 'implemented';
}

interface WorkspaceSession {
  id: string;
  name: string;
  description: string;
  participants: TeamMember[];
  ubuntuScore: number;
  startTime: string;
  duration: string;
  status: 'active' | 'scheduled' | 'ended';
  purpose: string;
}

export default function UbuntuWorkspacePage() {
  const [activeSession, setActiveSession] = useState<WorkspaceSession | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [ideas, setIdeas] = useState<UbuntuIdea[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [newIdea, setNewIdea] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Mock team members data
    const mockTeamMembers: TeamMember[] = [
      {
        id: '1',
        name: 'Thabo Mokoena',
        role: 'Ubuntu Facilitator',
        avatar: '👨‍🏫',
        status: 'online',
        ubuntuScore: 95,
        currentActivity: 'Leading Ubuntu principles discussion',
        isSpeaking: false,
        isMuted: false,
        videoOn: true
      },
      {
        id: '2',
        name: 'Naledi Khumalo',
        role: 'Innovation Lead',
        avatar: '👩‍💡',
        status: 'online',
        ubuntuScore: 92,
        currentActivity: 'Brainstorming community solutions',
        isSpeaking: true,
        isMuted: false,
        videoOn: true
      },
      {
        id: '3',
        name: 'Kwame Asante',
        role: 'Technical Architect',
        avatar: '👨‍💻',
        status: 'busy',
        ubuntuScore: 88,
        currentActivity: 'Designing scalable infrastructure',
        isSpeaking: false,
        isMuted: true,
        videoOn: false
      },
      {
        id: '4',
        name: 'Amara Okonkwo',
        role: 'Community Builder',
        avatar: '👩‍🤝',
        status: 'online',
        ubuntuScore: 94,
        currentActivity: 'Connecting community stakeholders',
        isSpeaking: false,
        isMuted: false,
        videoOn: true
      }
    ];

    const mockIdeas: UbuntuIdea[] = [
      {
        id: '1',
        title: 'Ubuntu Learning Circles',
        description: 'Create peer-to-peer learning groups where knowledge is shared freely, embodying the principle that "I am because we are"',
        author: 'Naledi Khumalo',
        timestamp: '10 minutes ago',
        ubuntuScore: 96,
        category: 'learning',
        votes: 12,
        comments: 5,
        status: 'active'
      },
      {
        id: '2',
        title: 'Community Resource Pool',
        description: 'A shared platform where community members can pool resources, tools, and skills for collective benefit',
        author: 'Thabo Mokoena',
        timestamp: '25 minutes ago',
        ubuntuScore: 91,
        category: 'community',
        votes: 8,
        comments: 3,
        status: 'developing'
      },
      {
        id: '3',
        title: 'Ubuntu Marketplace Integration',
        description: 'Connect local artisans directly with global markets, ensuring fair trade and community prosperity',
        author: 'Amara Okonkwo',
        timestamp: '1 hour ago',
        ubuntuScore: 89,
        category: 'innovation',
        votes: 15,
        comments: 7,
        status: 'active'
      }
    ];

    const mockSession: WorkspaceSession = {
      id: '1',
      name: 'Ubuntu Innovation Sprint',
      description: 'Collaborative session to develop community-focused solutions',
      participants: mockTeamMembers,
      ubuntuScore: 92,
      startTime: new Date().toISOString(),
      duration: '2h 15m',
      status: 'active',
      purpose: 'Design solutions that embody Ubuntu principles for community wellbeing'
    };

    setTeamMembers(mockTeamMembers);
    setIdeas(mockIdeas);
    setActiveSession(mockSession);
  }, []);

  const filteredIdeas = ideas.filter(idea => {
    const matchesCategory = selectedCategory === 'all' || idea.category === selectedCategory;
    const matchesSearch = idea.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         idea.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'busy': return 'bg-orange-500';
      case 'away': return 'bg-yellow-500';
      case 'offline': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'innovation': return 'bg-purple-500/20 text-purple-500 border-purple-500/30';
      case 'community': return 'bg-blue-500/20 text-blue-500 border-blue-500/30';
      case 'efficiency': return 'bg-green-500/20 text-green-500 border-green-500/30';
      case 'learning': return 'bg-orange-500/20 text-orange-500 border-orange-500/30';
      default: return 'bg-gray-500/20 text-gray-500 border-gray-500/30';
    }
  };

  const submitIdea = () => {
    if (newIdea.trim()) {
      const newUbuntuIdea: UbuntuIdea = {
        id: Date.now().toString(),
        title: newIdea.split('.')[0] || 'New Ubuntu Idea',
        description: newIdea,
        author: 'You',
        timestamp: 'Just now',
        ubuntuScore: 85,
        category: 'innovation',
        votes: 0,
        comments: 0,
        status: 'active'
      };
      setIdeas([newUbuntuIdea, ...ideas]);
      setNewIdea('');
    }
  };

  return (
    <AppLayout
      headerActions={
        <div className="flex gap-2">
          <Button size="sm" variant="outline">
            <Settings className="w-4 h-4 mr-2" />
            Workspace Settings
          </Button>
          <Button size="sm">
            <Plus className="w-4 h-4 mr-2" />
            New Session
          </Button>
        </div>
      }
    >
      <div className="max-w-7xl mx-auto py-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-4xl font-bold mb-2">
            <GradientText>Ubuntu Workspace</GradientText>
          </h1>
          <p className="text-muted-foreground mb-4">
            Collaborative environment where Ubuntu principles drive innovation and community success
          </p>
          
          {activeSession && (
            <AccessibleCard className="glass-card p-4 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold mb-1">{activeSession.name}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{activeSession.description}</p>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      <span>{activeSession.participants.length} participants</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Heart className="w-4 h-4 text-red-500" />
                      <span>Ubuntu Score: {activeSession.ubuntuScore}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>{activeSession.duration}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={isMuted ? "destructive" : "default"}
                    onClick={() => setIsMuted(!isMuted)}
                  >
                    {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </Button>
                  <Button
                    size="sm"
                    variant={isVideoOn ? "default" : "destructive"}
                    onClick={() => setIsVideoOn(!isVideoOn)}
                  >
                    {isVideoOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
                  </Button>
                  <Button size="sm" variant="outline">
                    <Share className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                </div>
              </div>
            </AccessibleCard>
          )}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Ubuntu Ideas Board */}
            <AccessibleCard className="glass-card p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-yellow-500" />
                  Ubuntu Ideas Board
                </h2>
                <div className="flex gap-2">
                  <select
                    className="px-3 py-1 rounded-lg border border-border bg-background text-sm"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  >
                    <option value="all">All Categories</option>
                    <option value="innovation">Innovation</option>
                    <option value="community">Community</option>
                    <option value="efficiency">Efficiency</option>
                    <option value="learning">Learning</option>
                  </select>
                </div>
              </div>

              {/* Add New Idea */}
              <div className="mb-6">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Share your Ubuntu idea with the community..."
                    className="flex-1 px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    value={newIdea}
                    onChange={(e) => setNewIdea(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && submitIdea()}
                  />
                  <Button onClick={submitIdea} disabled={!newIdea.trim()}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Ideas List */}
              <div className="space-y-4">
                {filteredIdeas.map((idea) => (
                  <motion.div
                    key={idea.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-4 rounded-lg border border-border hover:bg-card/50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="font-bold mb-1">{idea.title}</h3>
                        <p className="text-sm text-muted-foreground mb-2">{idea.description}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>{idea.author}</span>
                          <span>{idea.timestamp}</span>
                          <span className={`px-2 py-1 rounded-full border ${getCategoryColor(idea.category)}`}>
                            {idea.category}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2 ml-4">
                        <div className="flex items-center gap-1">
                          <Heart className="w-4 h-4 text-red-500" />
                          <span className="text-sm font-medium">{idea.ubuntuScore}</span>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs ${
                          idea.status === 'active' ? 'bg-green-500/20 text-green-500' :
                          idea.status === 'developing' ? 'bg-blue-500/20 text-blue-500' :
                          'bg-purple-500/20 text-purple-500'
                        }`}>
                          {idea.status}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 pt-2 border-t border-border">
                      <button className="flex items-center gap-1 text-sm hover:text-primary">
                        <Heart className="w-4 h-4" />
                        <span>{idea.votes}</span>
                      </button>
                      <button className="flex items-center gap-1 text-sm hover:text-primary">
                        <MessageSquare className="w-4 h-4" />
                        <span>{idea.comments}</span>
                      </button>
                      <button className="flex items-center gap-1 text-sm hover:text-primary">
                        <Share className="w-4 h-4" />
                        Share
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </AccessibleCard>

            {/* Ubuntu Principles Discussion */}
            <AccessibleCard className="glass-card p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Brain className="w-5 h-5 text-purple-500" />
                Ubuntu Principles Discussion
              </h2>
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/30">
                  <h3 className="font-medium mb-2">Today's Focus: Collective Responsibility</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    How can we ensure our projects create shared value for the entire community?
                  </p>
                  <div className="flex gap-2">
                    <Button size="sm">Join Discussion</Button>
                    <Button size="sm" variant="outline">View Notes</Button>
                  </div>
                </div>
              </div>
            </AccessibleCard>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Active Team Members */}
            <AccessibleCard className="glass-card p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-500" />
                Ubuntu Team
              </h2>
              <div className="space-y-3">
                {teamMembers.map((member) => (
                  <div key={member.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-card/50 transition-colors">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-lg">
                        {member.avatar}
                      </div>
                      <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full ${getStatusColor(member.status)} border-2 border-background`} />
                      {member.isSpeaking && (
                        <div className="absolute top-0 left-0 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm truncate">{member.name}</span>
                        {member.isMuted && <MicOff className="w-3 h-3 text-red-500" />}
                        {!member.videoOn && <VideoOff className="w-3 h-3 text-red-500" />}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">{member.role}</div>
                      <div className="text-xs text-muted-foreground truncate">{member.currentActivity}</div>
                      <div className="flex items-center gap-1 mt-1">
                        <Heart className="w-3 h-3 text-red-500" />
                        <span className="text-xs font-medium">{member.ubuntuScore}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </AccessibleCard>

            {/* Ubuntu Goals */}
            <AccessibleCard className="glass-card p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-green-500" />
                Ubuntu Goals
              </h2>
              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/30">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">Community Impact</span>
                    <span className="text-xs text-green-500">75%</span>
                  </div>
                  <div className="w-full bg-border rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '75%' }} />
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">Knowledge Sharing</span>
                    <span className="text-xs text-blue-500">60%</span>
                  </div>
                  <div className="w-full bg-border rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '60%' }} />
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/30">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">Innovation</span>
                    <span className="text-xs text-purple-500">85%</span>
                  </div>
                  <div className="w-full bg-border rounded-full h-2">
                    <div className="bg-purple-500 h-2 rounded-full" style={{ width: '85%' }} />
                  </div>
                </div>
              </div>
            </AccessibleCard>

            {/* Ubuntu Quote */}
            <AccessibleCard className="glass-card p-6">
              <div className="text-center">
                <Heart className="w-8 h-8 text-red-500 mx-auto mb-3" />
                <blockquote className="text-lg font-medium mb-2 italic">
                  "I am because we are"
                </blockquote>
                <p className="text-sm text-muted-foreground">
                  Our strength comes from our unity. Our success is shared by all.
                </p>
              </div>
            </AccessibleCard>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
