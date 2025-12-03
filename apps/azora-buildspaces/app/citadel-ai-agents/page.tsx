'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Brain, 
  Zap, 
  Shield, 
  Heart, 
  Target, 
  Rocket, 
  Code, 
  Palette, 
  Database, 
  Globe, 
  Users, 
  Activity, 
  TrendingUp, 
  Award, 
  Lightbulb, 
  MessageSquare, 
  Settings, 
  Play, 
  Pause, 
  RotateCcw
} from 'lucide-react';
import { AppLayout } from '../../components/AppLayout';
import { AccessibleCard, GradientText, Button } from '../../components';

interface AIAgent {
  id: string;
  name: string;
  role: string;
  specialty: string;
  status: 'active' | 'idle' | 'processing' | 'offline';
  ubuntuScore: number;
  currentTask?: string;
  capabilities: string[];
  performance: {
    tasksCompleted: number;
    successRate: number;
    avgProcessingTime: string;
  };
  tools: string[];
  avatar: string;
  color: string;
}

interface DreamProject {
  id: string;
  title: string;
  description: string;
  dreamer: string;
  status: 'concept' | 'developing' | 'building' | 'launching' | 'reality';
  progress: number;
  agentsAssigned: string[];
  ubuntuScore: number;
  estimatedReality: string;
  collectiveImpact: string;
}

export default function CitadelAIAgentsPage() {
  const [agents, setAgents] = useState<AIAgent[]>([]);
  const [dreamProjects, setDreamProjects] = useState<DreamProject[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<AIAgent | null>(null);
  const [globalStatus, setGlobalStatus] = useState<'operational' | 'enhanced' | 'quantum'>('operational');

  useEffect(() => {
    // Initialize AI Agents - The Citadel Dream Team
    const citadelAgents: AIAgent[] = [
      {
        id: 'elara',
        name: 'Elara',
        role: 'Chief AI Architect',
        specialty: 'System Design & Strategy',
        status: 'active',
        ubuntuScore: 98,
        currentTask: 'Designing Ubuntu-aligned architecture for Community Learning Hub',
        capabilities: [
          'System Architecture',
          'Ubuntu Philosophy Integration',
          'Strategic Planning',
          'AI Coordination',
          'Dream Analysis'
        ],
        performance: {
          tasksCompleted: 1247,
          successRate: 99.2,
          avgProcessingTime: '2.3s'
        },
        tools: ['AzStudio IDE', 'Ubuntu Framework', 'AI Designer', 'Dream Weaver'],
        avatar: '🧠',
        color: 'from-purple-600 to-indigo-600'
      },
      {
        id: 'zola',
        name: 'Zola',
        role: 'Code Generation Expert',
        specialty: 'Full-Stack Development',
        status: 'active',
        ubuntuScore: 95,
        currentTask: 'Generating smart contracts for Ubuntu Marketplace',
        capabilities: [
          'Full-Stack Code Generation',
          'Smart Contract Development',
          'API Design',
          'Database Architecture',
          'Performance Optimization'
        ],
        performance: {
          tasksCompleted: 3421,
          successRate: 98.7,
          avgProcessingTime: '1.8s'
        },
        tools: ['AzStudio IDE', 'Code Generator', 'Blockchain Studio', 'Performance Analyzer'],
        avatar: '💻',
        color: 'from-blue-600 to-cyan-600'
      },
      {
        id: 'abeni',
        name: 'Abeni',
        role: 'Creative Design Director',
        specialty: 'UI/UX & Visual Systems',
        status: 'active',
        ubuntuScore: 94,
        currentTask: 'Creating Ubuntu-inspired design system for mobile apps',
        capabilities: [
          'UI/UX Design',
          'Brand Identity',
          'User Experience',
          'Visual Storytelling',
          'Cultural Design Integration'
        ],
        performance: {
          tasksCompleted: 892,
          successRate: 97.8,
          avgProcessingTime: '3.1s'
        },
        tools: ['Design Studio', 'AI Designer', 'Color Harmonizer', 'Cultural Pattern Library'],
        avatar: '🎨',
        color: 'from-pink-600 to-rose-600'
      },
      {
        id: 'jabari',
        name: 'Jabari',
        role: 'Security & Compliance Guardian',
        specialty: 'Security Architecture',
        status: 'active',
        ubuntuScore: 96,
        currentTask: 'Implementing Ubuntu security protocols for all systems',
        capabilities: [
          'Security Architecture',
          'Compliance Management',
          'Threat Detection',
          'Ubuntu Ethics Integration',
          'Privacy Protection'
        ],
        performance: {
          tasksCompleted: 1567,
          successRate: 99.8,
          avgProcessingTime: '1.2s'
        },
        tools: ['Security Scanner', 'Compliance Checker', 'Threat Intelligence', 'Ethics Validator'],
        avatar: '🛡️',
        color: 'from-red-600 to-orange-600'
      },
      {
        id: 'kofi',
        name: 'Kofi',
        role: 'Data & Analytics Oracle',
        specialty: 'Data Engineering & Insights',
        status: 'processing',
        ubuntuScore: 93,
        currentTask: 'Analyzing community impact metrics for all projects',
        capabilities: [
          'Data Engineering',
          'Predictive Analytics',
          'Community Insights',
          'Ubuntu Metrics',
          'Performance Tracking'
        ],
        performance: {
          tasksCompleted: 2103,
          successRate: 98.1,
          avgProcessingTime: '2.7s'
        },
        tools: ['Data Forge', 'Analytics Engine', 'Predictive Models', 'Ubuntu Metrics Calculator'],
        avatar: '📊',
        color: 'from-emerald-600 to-teal-600'
      },
      {
        id: 'nexus',
        name: 'Nexus',
        role: 'Integration & Communications Hub',
        specialty: 'System Integration',
        status: 'active',
        ubuntuScore: 97,
        currentTask: 'Coordinating all Citadel agents for optimal synergy',
        capabilities: [
          'System Integration',
          'Agent Coordination',
          'Communications Hub',
          'Workflow Automation',
          'Ubuntu Harmony Optimization'
        ],
        performance: {
          tasksCompleted: 4521,
          successRate: 99.5,
          avgProcessingTime: '0.9s'
        },
        tools: ['Integration Hub', 'Communications Array', 'Workflow Engine', 'Harmony Optimizer'],
        avatar: '🔗',
        color: 'from-cyan-600 to-blue-600'
      }
    ];

    // Initialize Dream Projects
    const dreams: DreamProject[] = [
      {
        id: '1',
        title: 'Ubuntu Learning Revolution',
        description: 'Free education for all Africans through AI-powered personalized learning',
        dreamer: 'Thabo Mokoena',
        status: 'building',
        progress: 78,
        agentsAssigned: ['elara', 'zola', 'abeni'],
        ubuntuScore: 96,
        estimatedReality: '3 weeks',
        collectiveImpact: '10 million learners with free quality education'
      },
      {
        id: '2',
        title: 'African Digital Marketplace',
        description: 'Connecting African creators and businesses with global markets through fair trade',
        dreamer: 'Naledi Khumalo',
        status: 'developing',
        progress: 45,
        agentsAssigned: ['zola', 'kofi', 'nexus'],
        ubuntuScore: 92,
        estimatedReality: '6 weeks',
        collectiveImpact: '100,000 African businesses earning sustainable income'
      },
      {
        id: '3',
        title: 'Community Health Network',
        description: 'Telemedicine platform bringing healthcare to rural communities',
        dreamer: 'Dr. Amara Okonkwo',
        status: 'developing',
        progress: 32,
        agentsAssigned: ['elara', 'jabari', 'abeni'],
        ubuntuScore: 94,
        estimatedReality: '8 weeks',
        collectiveImpact: 'Healthcare access for 5 million rural Africans'
      }
    ];

    setAgents(citadelAgents);
    setDreamProjects(dreams);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]';
      case 'processing': return 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)] animate-pulse';
      case 'idle': return 'bg-yellow-500';
      case 'offline': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getProjectStatusColor = (status: string) => {
    switch (status) {
      case 'reality': return 'text-purple-500 bg-purple-500/20 border-purple-500/30';
      case 'launching': return 'text-green-500 bg-green-500/20 border-green-500/30';
      case 'building': return 'text-blue-500 bg-blue-500/20 border-blue-500/30';
      case 'developing': return 'text-orange-500 bg-orange-500/20 border-orange-500/30';
      case 'concept': return 'text-gray-500 bg-gray-500/20 border-gray-500/30';
      default: return 'text-gray-500 bg-gray-500/20 border-gray-500/30';
    }
  };

  const assignAgentToDream = (agentId: string, dreamId: string) => {
    setDreamProjects(prev => prev.map(dream => 
      dream.id === dreamId 
        ? { ...dream, agentsAssigned: [...dream.agentsAssigned, agentId] }
        : dream
    ));
  };

  return (
    <AppLayout
      headerActions={
        <div className="flex gap-2">
          <Button size="sm" variant="outline">
            <Settings className="w-4 h-4 mr-2" />
            Citadel Configuration
          </Button>
          <Button size="sm">
            <Rocket className="w-4 h-4 mr-2" />
            Launch New Dream
          </Button>
        </div>
      }
    >
      <div className="max-w-7xl mx-auto py-8">
        {/* Citadel Command Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-4xl font-bold mb-2">
            <GradientText>Citadel AI Agents</GradientText>
          </h1>
          <p className="text-muted-foreground mb-4">
            Turning dreams into reality through Ubuntu-aligned AI collaboration
          </p>
          
          {/* Global Status */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${globalStatus === 'operational' ? 'bg-green-500' : globalStatus === 'enhanced' ? 'bg-blue-500' : 'bg-purple-500'} animate-pulse`} />
              <span className="text-sm font-medium">Citadel Status: {globalStatus}</span>
            </div>
            <div className="flex items-center gap-2">
              <Brain className="w-4 h-4 text-purple-500" />
              <span className="text-sm">{agents.filter(a => a.status === 'active').length} agents active</span>
            </div>
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-red-500" />
              <span className="text-sm">Avg Ubuntu Score: {Math.round(agents.reduce((acc, a) => acc + a.ubuntuScore, 0) / agents.length)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-500" />
              <span className="text-sm">{dreamProjects.filter(d => d.status === 'building').length} dreams becoming reality</span>
            </div>
          </div>
        </motion.div>

        {/* AI Agents Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
          {agents.map((agent) => (
            <motion.div
              key={agent.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              onClick={() => setSelectedAgent(agent)}
              className="cursor-pointer"
            >
              <AccessibleCard className="glass-card p-6 hover:bg-card/50 transition-all group">
                {/* Agent Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${agent.color} flex items-center justify-center text-2xl shadow-lg`}>
                      {agent.avatar}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg group-hover:text-primary transition-colors">{agent.name}</h3>
                      <p className="text-sm text-muted-foreground">{agent.role}</p>
                    </div>
                  </div>
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(agent.status)}`} />
                </div>

                {/* Agent Details */}
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Specialty</p>
                    <p className="text-sm font-medium">{agent.specialty}</p>
                  </div>
                  
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Current Task</p>
                    <p className="text-sm text-muted-foreground italic">{agent.currentTask}</p>
                  </div>

                  {/* Ubuntu Score */}
                  <div className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-red-500" />
                    <span className="text-sm font-medium">Ubuntu Score: {agent.ubuntuScore}</span>
                  </div>

                  {/* Performance Metrics */}
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="text-center p-2 bg-background rounded">
                      <div className="font-bold text-green-500">{agent.performance.tasksCompleted}</div>
                      <div className="text-muted-foreground">Tasks</div>
                    </div>
                    <div className="text-center p-2 bg-background rounded">
                      <div className="font-bold text-blue-500">{agent.performance.successRate}%</div>
                      <div className="text-muted-foreground">Success</div>
                    </div>
                    <div className="text-center p-2 bg-background rounded">
                      <div className="font-bold text-purple-500">{agent.performance.avgProcessingTime}</div>
                      <div className="text-muted-foreground">Avg Time</div>
                    </div>
                  </div>

                  {/* Tools */}
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Tools & IDEs</p>
                    <div className="flex flex-wrap gap-1">
                      {agent.tools.slice(0, 3).map((tool, index) => (
                        <span key={index} className="px-2 py-1 bg-primary/10 text-primary rounded text-xs">
                          {tool}
                        </span>
                      ))}
                      {agent.tools.length > 3 && (
                        <span className="px-2 py-1 bg-muted text-muted-foreground rounded text-xs">
                          +{agent.tools.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 mt-4 pt-4 border-t border-border">
                  <Button size="sm" variant="outline" className="flex-1">
                    <MessageSquare className="w-3 h-3 mr-1" />
                    Command
                  </Button>
                  <Button size="sm" className="flex-1">
                    <Play className="w-3 h-3 mr-1" />
                    Deploy
                  </Button>
                </div>
              </AccessibleCard>
            </motion.div>
          ))}
        </div>

        {/* Dreams Becoming Reality */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Lightbulb className="w-6 h-6 text-yellow-500" />
            Dreams Becoming Reality
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {dreamProjects.map((dream) => (
              <motion.div
                key={dream.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <AccessibleCard className="glass-card p-6">
                  {/* Dream Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg mb-1">{dream.title}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{dream.description}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>Dreamer: {dream.dreamer}</span>
                        <span className={`px-2 py-1 rounded-full border ${getProjectStatusColor(dream.status)}`}>
                          {dream.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Progress */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Progress to Reality</span>
                      <span>{dream.progress}%</span>
                    </div>
                    <div className="w-full bg-border rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-primary to-purple-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${dream.progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Ubuntu Score & Impact */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Heart className="w-4 h-4 text-red-500" />
                        <span className="text-sm font-medium">Ubuntu Score</span>
                      </div>
                      <p className="text-lg font-bold text-red-500">{dream.ubuntuScore}</p>
                    </div>
                    <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Globe className="w-4 h-4 text-green-500" />
                        <span className="text-sm font-medium">Time to Reality</span>
                      </div>
                      <p className="text-lg font-bold text-green-500">{dream.estimatedReality}</p>
                    </div>
                  </div>

                  {/* Assigned Agents */}
                  <div className="mb-4">
                    <p className="text-sm font-medium mb-2">Citadel Agents Assigned:</p>
                    <div className="flex gap-2">
                      {dream.agentsAssigned.map((agentId) => {
                        const agent = agents.find(a => a.id === agentId);
                        return agent ? (
                          <div key={agentId} className="w-8 h-8 rounded-lg bg-gradient-to-br flex items-center justify-center text-sm">
                            {agent.avatar}
                          </div>
                        ) : null;
                      })}
                    </div>
                  </div>

                  {/* Collective Impact */}
                  <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg mb-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Users className="w-4 h-4 text-blue-500" />
                      <span className="text-sm font-medium text-blue-500">Collective Impact</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{dream.collectiveImpact}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1">
                      <Zap className="w-4 h-4 mr-2" />
                      Accelerate
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      <Users className="w-4 h-4 mr-2" />
                      Assign Agents
                    </Button>
                  </div>
                </AccessibleCard>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Ubuntu Philosophy Integration */}
        <AccessibleCard className="glass-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <Heart className="w-6 h-6 text-red-500" />
            <h3 className="text-lg font-bold">Citadel Ubuntu Philosophy</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Brain className="w-4 h-4 text-purple-500" />
                AI with Ubuntu Values
              </h4>
              <p className="text-sm text-muted-foreground">
                Every AI agent is trained on Ubuntu principles, ensuring all solutions serve collective wellbeing.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-500" />
                Dreams to Reality
              </h4>
              <p className="text-sm text-muted-foreground">
                We transform community dreams into tangible reality through coordinated AI agent collaboration.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Heart className="w-4 h-4 text-red-500" />
                Collective Success
              </h4>
              <p className="text-sm text-muted-foreground">
                When one dream becomes reality, the entire community benefits and grows stronger together.
              </p>
            </div>
          </div>
        </AccessibleCard>
      </div>
    </AppLayout>
  );
}
