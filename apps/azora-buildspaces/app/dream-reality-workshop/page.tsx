'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  Rocket, 
  Heart, 
  Brain, 
  Target, 
  Users, 
  Clock, 
  TrendingUp, 
  Award, 
  Lightbulb, 
  MessageSquare, 
  Send, 
  Plus, 
  Zap, 
  Globe, 
  Star, 
  CheckCircle, 
  AlertCircle, 
  Play
} from 'lucide-react';
import { AppLayout } from '../../components/AppLayout';
import { AccessibleCard, GradientText, Button } from '../../components';

interface DreamSubmission {
  id: string;
  title: string;
  description: string;
  dreamer: string;
  email: string;
  ubuntuAlignment: number;
  communityImpact: 'local' | 'regional' | 'continental' | 'global';
  category: 'education' | 'healthcare' | 'business' | 'technology' | 'community' | 'arts';
  urgency: 'low' | 'medium' | 'high' | 'critical';
  resources: string[];
  timeline: string;
  submittedAt: string;
  status: 'submitted' | 'analyzing' | 'planning' | 'building' | 'testing' | 'launching' | 'reality';
  citadelAssessment?: {
    feasibility: number;
    ubuntuScore: number;
    estimatedTimeline: string;
    requiredAgents: string[];
    potentialImpact: string;
  };
}

interface CitadelTransformation {
  dreamId: string;
  stage: string;
  agent: string;
  action: string;
  timestamp: string;
  progress: number;
}

export default function DreamRealityWorkshopPage() {
  const [dreams, setDreams] = useState<DreamSubmission[]>([]);
  const [transformations, setTransformations] = useState<CitadelTransformation[]>([]);
  const [newDream, setNewDream] = useState({
    title: '',
    description: '',
    dreamer: '',
    email: '',
    category: 'community' as const,
    urgency: 'medium' as const,
    communityImpact: 'local' as const,
    resources: '',
    timeline: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDream, setSelectedDream] = useState<DreamSubmission | null>(null);

  useEffect(() => {
    // Mock existing dreams
    const existingDreams: DreamSubmission[] = [
      {
        id: '1',
        title: 'Digital Library for Rural Schools',
        description: 'Create an offline-capable digital library system that can work in areas with limited internet connectivity, providing access to thousands of educational resources for rural African schools.',
        dreamer: 'Grace Mwangi',
        email: 'grace.mwangi@school.edu',
        ubuntuAlignment: 95,
        communityImpact: 'continental',
        category: 'education',
        urgency: 'high',
        resources: ['Content partnerships', 'offline technology', 'teacher training'],
        timeline: '6-12 months',
        submittedAt: '2024-01-15T10:30:00Z',
        status: 'building',
        citadelAssessment: {
          feasibility: 92,
          ubuntuScore: 96,
          estimatedTimeline: '8 months',
          requiredAgents: ['elara', 'zola', 'abeni', 'kofi'],
          potentialImpact: '10 million students across Africa with access to quality education'
        }
      },
      {
        id: '2',
        title: 'Ubuntu Marketplace for Artisans',
        description: 'Connect traditional African artisans directly with global markets, eliminating middlemen and ensuring fair prices while preserving cultural heritage and traditional crafts.',
        dreamer: 'Kofi Osei',
        email: 'kofi.osei@crafts.co',
        ubuntuAlignment: 92,
        communityImpact: 'global',
        category: 'business',
        urgency: 'medium',
        resources: ['Mobile app development', 'payment integration', 'logistics network'],
        timeline: '4-6 months',
        submittedAt: '2024-01-18T14:20:00Z',
        status: 'planning',
        citadelAssessment: {
          feasibility: 88,
          ubuntuScore: 94,
          estimatedTimeline: '5 months',
          requiredAgents: ['zola', 'nexus', 'kofi'],
          potentialImpact: '50,000 artisans earning sustainable income globally'
        }
      },
      {
        id: '3',
        title: 'Community Health Monitoring Network',
        description: 'AI-powered system for monitoring community health trends, predicting outbreaks, and coordinating response efforts in underserved areas using mobile technology and community health workers.',
        dreamer: 'Dr. Amina Diallo',
        email: 'amina.diallo@health.org',
        ubuntuAlignment: 98,
        communityImpact: 'regional',
        category: 'healthcare',
        urgency: 'critical',
        resources: ['Medical partnerships', 'AI development', 'community health worker network'],
        timeline: '3-4 months',
        submittedAt: '2024-01-20T09:15:00Z',
        status: 'analyzing',
        citadelAssessment: {
          feasibility: 95,
          ubuntuScore: 97,
          estimatedTimeline: '3.5 months',
          requiredAgents: ['elara', 'jabari', 'kofi', 'nexus'],
          potentialImpact: 'Early detection of health crises affecting millions'
        }
      }
    ];

    // Mock transformation timeline
    const mockTransformations: CitadelTransformation[] = [
      {
        dreamId: '1',
        stage: 'analysis',
        agent: 'Elara',
        action: 'Analyzing Ubuntu alignment and community impact',
        timestamp: '2024-01-15T11:00:00Z',
        progress: 100
      },
      {
        dreamId: '1',
        stage: 'architecture',
        agent: 'Elara',
        action: 'Designing scalable offline-first architecture',
        timestamp: '2024-01-15T14:30:00Z',
        progress: 85
      },
      {
        dreamId: '1',
        stage: 'development',
        agent: 'Zola',
        action: 'Generating core library management system',
        timestamp: '2024-01-16T09:00:00Z',
        progress: 60
      },
      {
        dreamId: '2',
        stage: 'analysis',
        agent: 'Nexus',
        action: 'Evaluating marketplace integration requirements',
        timestamp: '2024-01-18T15:00:00Z',
        progress: 100
      },
      {
        dreamId: '3',
        stage: 'analysis',
        agent: 'Jabari',
        action: 'Assessing healthcare data privacy and security requirements',
        timestamp: '2024-01-20T10:00:00Z',
        progress: 45
      }
    ];

    setDreams(existingDreams);
    setTransformations(mockTransformations);
  }, []);

  const submitDream = async () => {
    if (!newDream.title || !newDream.description || !newDream.dreamer || !newDream.email) {
      alert('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    // Simulate submission processing
    await new Promise(resolve => setTimeout(resolve, 2000));

    const dream: DreamSubmission = {
      id: Date.now().toString(),
      ...newDream,
      resources: newDream.resources.split(',').map(r => r.trim()).filter(r => r),
      submittedAt: new Date().toISOString(),
      status: 'submitted',
      ubuntuAlignment: Math.floor(Math.random() * 20) + 80 // Random Ubuntu score 80-100
    };

    setDreams([dream, ...dreams]);
    
    // Reset form
    setNewDream({
      title: '',
      description: '',
      dreamer: '',
      email: '',
      category: 'community',
      urgency: 'medium',
      communityImpact: 'local',
      resources: '',
      timeline: ''
    });

    setIsSubmitting(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'reality': return 'text-purple-500 bg-purple-500/20 border-purple-500/30';
      case 'launching': return 'text-green-500 bg-green-500/20 border-green-500/30';
      case 'testing': return 'text-blue-500 bg-blue-500/20 border-blue-500/30';
      case 'building': return 'text-orange-500 bg-orange-500/20 border-orange-500/30';
      case 'planning': return 'text-yellow-500 bg-yellow-500/20 border-yellow-500/30';
      case 'analyzing': return 'text-cyan-500 bg-cyan-500/20 border-cyan-500/30';
      case 'submitted': return 'text-gray-500 bg-gray-500/20 border-gray-500/30';
      default: return 'text-gray-500 bg-gray-500/20 border-gray-500/30';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'global': return 'text-purple-500 bg-purple-500/20';
      case 'continental': return 'text-blue-500 bg-blue-500/20';
      case 'regional': return 'text-green-500 bg-green-500/20';
      case 'local': return 'text-orange-500 bg-orange-500/20';
      default: return 'text-gray-500 bg-gray-500/20';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'education': return '📚';
      case 'healthcare': return '🏥';
      case 'business': return '💼';
      case 'technology': return '💻';
      case 'community': return '🤝';
      case 'arts': return '🎨';
      default: return '💡';
    }
  };

  return (
    <AppLayout
      headerActions={
        <div className="flex gap-2">
          <Button size="sm" variant="outline">
            <TrendingUp className="w-4 h-4 mr-2" />
            Impact Dashboard
          </Button>
          <Button size="sm">
            <Rocket className="w-4 h-4 mr-2" />
            Submit Your Dream
          </Button>
        </div>
      }
    >
      <div className="max-w-7xl mx-auto py-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-4xl font-bold mb-2">
            <GradientText>Dream Reality Workshop</GradientText>
          </h1>
          <p className="text-muted-foreground mb-4">
            Submit your dreams and watch the Citadel AI agents transform them into reality
          </p>
          
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg border border-purple-500/30">
              <Sparkles className="w-8 h-8 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">{dreams.length}</p>
                <p className="text-sm text-muted-foreground">Dreams Submitted</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-lg border border-blue-500/30">
              <Brain className="w-8 h-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{dreams.filter(d => d.status !== 'submitted').length}</p>
                <p className="text-sm text-muted-foreground">In Transformation</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-lg border border-green-500/30">
              <CheckCircle className="w-8 h-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{dreams.filter(d => d.status === 'reality').length}</p>
                <p className="text-sm text-muted-foreground">Became Reality</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-red-500/10 to-orange-500/10 rounded-lg border border-red-500/30">
              <Heart className="w-8 h-8 text-red-500" />
              <div>
                <p className="text-2xl font-bold">
                  {dreams.length > 0 ? Math.round(dreams.reduce((acc, d) => acc + d.ubuntuAlignment, 0) / dreams.length) : 0}
                </p>
                <p className="text-sm text-muted-foreground">Avg Ubuntu Score</p>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Dream Submission Form */}
          <div className="lg:col-span-1">
            <AccessibleCard className="glass-card p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-500" />
                Submit Your Dream
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Dream Title *</label>
                  <input
                    type="text"
                    placeholder="What's your big dream?"
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    value={newDream.title}
                    onChange={(e) => setNewDream({...newDream, title: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Description *</label>
                  <textarea
                    placeholder="Describe your dream in detail..."
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary h-24 resize-none"
                    value={newDream.description}
                    onChange={(e) => setNewDream({...newDream, description: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Your Name *</label>
                    <input
                      type="text"
                      placeholder="Dreamer's name"
                      className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                      value={newDream.dreamer}
                      onChange={(e) => setNewDream({...newDream, dreamer: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Email *</label>
                    <input
                      type="email"
                      placeholder="your@email.com"
                      className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                      value={newDream.email}
                      onChange={(e) => setNewDream({...newDream, email: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Category</label>
                    <select
                      className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                      value={newDream.category}
                      onChange={(e) => setNewDream({...newDream, category: e.target.value as any})}
                    >
                      <option value="education">Education</option>
                      <option value="healthcare">Healthcare</option>
                      <option value="business">Business</option>
                      <option value="technology">Technology</option>
                      <option value="community">Community</option>
                      <option value="arts">Arts</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Urgency</label>
                    <select
                      className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                      value={newDream.urgency}
                      onChange={(e) => setNewDream({...newDream, urgency: e.target.value as any})}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Community Impact</label>
                  <select
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    value={newDream.communityImpact}
                    onChange={(e) => setNewDream({...newDream, communityImpact: e.target.value as any})}
                  >
                    <option value="local">Local Community</option>
                    <option value="regional">Regional</option>
                    <option value="continental">Continental</option>
                    <option value="global">Global</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Resources Needed</label>
                  <input
                    type="text"
                    placeholder="e.g., funding, partnerships, technology"
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    value={newDream.resources}
                    onChange={(e) => setNewDream({...newDream, resources: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Timeline</label>
                  <input
                    type="text"
                    placeholder="e.g., 3-6 months, 1 year"
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    value={newDream.timeline}
                    onChange={(e) => setNewDream({...newDream, timeline: e.target.value})}
                  />
                </div>

                <Button 
                  onClick={submitDream} 
                  disabled={isSubmitting}
                  className="w-full"
                >
                  {isSubmitting ? (
                    <>
                      <Brain className="w-4 h-4 mr-2 animate-pulse" />
                      Citadel is analyzing...
                    </>
                  ) : (
                    <>
                      <Rocket className="w-4 h-4 mr-2" />
                      Submit Dream to Citadel
                    </>
                  )}
                </Button>
              </div>
            </AccessibleCard>

            {/* Ubuntu Philosophy */}
            <AccessibleCard className="glass-card p-6 mt-6">
              <div className="text-center">
                <Heart className="w-8 h-8 text-red-500 mx-auto mb-3" />
                <h3 className="font-bold mb-2">Ubuntu Dream Philosophy</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  "A person is a person through other persons"
                </p>
                <p className="text-xs text-muted-foreground">
                  Your dream becomes reality when it serves the collective wellbeing of the community.
                </p>
              </div>
            </AccessibleCard>
          </div>

          {/* Dreams in Transformation */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-500" />
              Dreams in Transformation
            </h2>

            <div className="space-y-6">
              {dreams.map((dream) => (
                <motion.div
                  key={dream.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <AccessibleCard className="glass-card p-6">
                    {/* Dream Header */}
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-2xl">
                          {getCategoryIcon(dream.category)}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-bold mb-1">{dream.title}</h3>
                          <p className="text-sm text-muted-foreground mb-2">{dream.description}</p>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span>by {dream.dreamer}</span>
                            <span className={`px-2 py-1 rounded-full border ${getStatusColor(dream.status)}`}>
                              {dream.status}
                            </span>
                            <span className={`px-2 py-1 rounded-full ${getImpactColor(dream.communityImpact)}`}>
                              {dream.communityImpact} impact
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Ubuntu Score */}
                    <div className="flex items-center gap-2 mb-4">
                      <Heart className="w-4 h-4 text-red-500" />
                      <span className="text-sm font-medium">Ubuntu Alignment: {dream.ubuntuAlignment}%</span>
                      <div className="flex-1 bg-border rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-red-500 to-pink-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${dream.ubuntuAlignment}%` }}
                        />
                      </div>
                    </div>

                    {/* Citadel Assessment */}
                    {dream.citadelAssessment && (
                      <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg mb-4">
                        <h4 className="font-medium mb-2 flex items-center gap-2">
                          <Brain className="w-4 h-4 text-blue-500" />
                          Citadel Assessment
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Feasibility:</span>
                            <span className="ml-2 font-medium text-green-500">{dream.citadelAssessment.feasibility}%</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Ubuntu Score:</span>
                            <span className="ml-2 font-medium text-red-500">{dream.citadelAssessment.ubuntuScore}%</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Timeline:</span>
                            <span className="ml-2 font-medium">{dream.citadelAssessment.estimatedTimeline}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Agents:</span>
                            <span className="ml-2 font-medium">{dream.citadelAssessment.requiredAgents.length}</span>
                          </div>
                        </div>
                        <div className="mt-2">
                          <span className="text-muted-foreground">Potential Impact:</span>
                          <p className="text-sm mt-1">{dream.citadelAssessment.potentialImpact}</p>
                        </div>
                      </div>
                    )}

                    {/* Transformation Progress */}
                    {dream.status !== 'submitted' && (
                      <div className="mb-4">
                        <h4 className="font-medium mb-2 flex items-center gap-2">
                          <Zap className="w-4 h-4 text-yellow-500" />
                          Transformation Progress
                        </h4>
                        <div className="space-y-2">
                          {transformations
                            .filter(t => t.dreamId === dream.id)
                            .map((transformation, index) => (
                              <div key={index} className="flex items-center gap-3 p-2 bg-background rounded-lg">
                                <div className="w-2 h-2 rounded-full bg-blue-500" />
                                <div className="flex-1">
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">{transformation.agent}</span>
                                    <span className="text-xs text-muted-foreground">
                                      {new Date(transformation.timestamp).toLocaleString()}
                                    </span>
                                  </div>
                                  <p className="text-xs text-muted-foreground">{transformation.action}</p>
                                </div>
                                <div className="text-xs font-medium text-blue-500">{transformation.progress}%</div>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        <MessageSquare className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                      {dream.status === 'reality' ? (
                        <Button size="sm" className="flex-1">
                          <Star className="w-4 h-4 mr-2" />
                          Celebrate Success
                        </Button>
                      ) : (
                        <Button size="sm" className="flex-1">
                          <Play className="w-4 h-4 mr-2" />
                          Track Progress
                        </Button>
                      )}
                    </div>
                  </AccessibleCard>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
