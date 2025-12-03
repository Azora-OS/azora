'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Target, 
  Heart, 
  Zap, 
  Shield, 
  Globe, 
  Award,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
  Filter,
  Search
} from 'lucide-react';
import { AppLayout } from '../../components/AppLayout';
import { AccessibleCard, GradientText, Button } from '../../components';

interface UbuntuProject {
  id: string;
  name: string;
  description: string;
  ubuntuScore: number;
  communityImpact: 'high' | 'medium' | 'low';
  status: 'planning' | 'active' | 'review' | 'completed';
  progress: number;
  team: Array<{
    name: string;
    role: string;
    avatar: string;
    ubuntuContribution: number;
  }>;
  ubuntuValues: string[];
  startDate: string;
  deadline: string;
  collectiveBenefit: string;
  milestones: Array<{
    title: string;
    completed: boolean;
    dueDate: string;
  }>;
}

export default function UbuntuProjectsPage() {
  const [projects, setProjects] = useState<UbuntuProject[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'ubuntuScore' | 'progress' | 'deadline'>('ubuntuScore');

  useEffect(() => {
    // Mock Ubuntu projects data
    const mockProjects: UbuntuProject[] = [
      {
        id: '1',
        name: 'Community Learning Hub',
        description: 'Building a free educational platform for underserved communities',
        ubuntuScore: 95,
        communityImpact: 'high',
        status: 'active',
        progress: 72,
        team: [
          { name: 'Thabo', role: 'Lead Developer', avatar: '👨‍💻', ubuntuContribution: 92 },
          { name: 'Naledi', role: 'UX Designer', avatar: '👩‍🎨', ubuntuContribution: 88 },
          { name: 'Kwame', role: 'Community Lead', avatar: '👨‍🏫', ubuntuContribution: 95 }
        ],
        ubuntuValues: ['Education', 'Community', 'Equality'],
        startDate: '2024-01-15',
        deadline: '2024-06-30',
        collectiveBenefit: '500+ students with free access to quality education',
        milestones: [
          { title: 'Platform Architecture', completed: true, dueDate: '2024-02-01' },
          { title: 'Core Features', completed: true, dueDate: '2024-03-15' },
          { title: 'Community Testing', completed: false, dueDate: '2024-05-01' },
          { title: 'Launch & Scale', completed: false, dueDate: '2024-06-30' }
        ]
      },
      {
        id: '2',
        name: 'Ubuntu Marketplace',
        description: 'Connecting local artisans with global markets through fair trade',
        ubuntuScore: 88,
        communityImpact: 'high',
        status: 'active',
        progress: 45,
        team: [
          { name: 'Amara', role: 'Product Manager', avatar: '👩‍💼', ubuntuContribution: 90 },
          { name: 'Chidi', role: 'Backend Developer', avatar: '👨‍💻', ubuntuContribution: 85 },
          { name: 'Zara', role: 'Marketing', avatar: '👩‍📱', ubuntuContribution: 87 }
        ],
        ubuntuValues: ['Fair Trade', 'Economic Empowerment', 'Community'],
        startDate: '2024-02-01',
        deadline: '2024-08-15',
        collectiveBenefit: '100+ artisans earning sustainable income',
        milestones: [
          { title: 'Market Research', completed: true, dueDate: '2024-02-28' },
          { title: 'Platform Development', completed: false, dueDate: '2024-05-01' },
          { title: 'Pilot Program', completed: false, dueDate: '2024-07-01' },
          { title: 'Full Launch', completed: false, dueDate: '2024-08-15' }
        ]
      },
      {
        id: '3',
        name: 'Digital Health Initiative',
        description: 'Telemedicine platform for rural healthcare access',
        ubuntuScore: 92,
        communityImpact: 'high',
        status: 'planning',
        progress: 15,
        team: [
          { name: 'Dr. Moyo', role: 'Medical Director', avatar: '👨‍⚕️', ubuntuContribution: 94 },
          { name: 'Lena', role: 'Tech Lead', avatar: '👩‍💻', ubuntuContribution: 89 },
          { name: 'Sam', role: 'Healthcare Advocate', avatar: '👩‍⚕️', ubuntuContribution: 91 }
        ],
        ubuntuValues: ['Healthcare Access', 'Technology', 'Community Service'],
        startDate: '2024-03-01',
        deadline: '2024-12-31',
        collectiveBenefit: 'Rural communities with accessible healthcare',
        milestones: [
          { title: 'Requirements Gathering', completed: true, dueDate: '2024-03-15' },
          { title: 'Platform Design', completed: false, dueDate: '2024-05-01' },
          { title: 'Development Phase', completed: false, dueDate: '2024-09-01' },
          { title: 'Pilot Testing', completed: false, dueDate: '2024-11-01' }
        ]
      }
    ];
    setProjects(mockProjects);
  }, []);

  const filteredProjects = projects.filter(project => {
    const matchesFilter = filterStatus === 'all' || project.status === filterStatus;
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const sortedProjects = [...filteredProjects].sort((a, b) => {
    switch (sortBy) {
      case 'ubuntuScore':
        return b.ubuntuScore - a.ubuntuScore;
      case 'progress':
        return b.progress - a.progress;
      case 'deadline':
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      default:
        return 0;
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-500 bg-green-500/20 border-green-500/30';
      case 'planning': return 'text-blue-500 bg-blue-500/20 border-blue-500/30';
      case 'review': return 'text-orange-500 bg-orange-500/20 border-orange-500/30';
      case 'completed': return 'text-purple-500 bg-purple-500/20 border-purple-500/30';
      default: return 'text-gray-500 bg-gray-500/20 border-gray-500/30';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-red-500 bg-red-500/20';
      case 'medium': return 'text-yellow-500 bg-yellow-500/20';
      case 'low': return 'text-green-500 bg-green-500/20';
      default: return 'text-gray-500 bg-gray-500/20';
    }
  };

  return (
    <AppLayout
      headerActions={
        <div className="flex gap-2">
          <Button size="sm" variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            New Ubuntu Project
          </Button>
          <Button size="sm">
            <Users className="w-4 h-4 mr-2" />
            Community View
          </Button>
        </div>
      }
    >
      <div className="max-w-7xl mx-auto py-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-4xl font-bold mb-2">
            <GradientText>Ubuntu Projects</GradientText>
          </h1>
          <p className="text-muted-foreground mb-4">
            Projects that embody the Ubuntu philosophy: "I am because we are"
          </p>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-red-500" />
              <span>Collective Impact</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-500" />
              <span>Community First</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-green-500" />
              <span>Ubuntu Values</span>
            </div>
          </div>
        </motion.div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <AccessibleCard className="glass-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Projects</p>
                <p className="text-2xl font-bold">{projects.filter(p => p.status === 'active').length}</p>
              </div>
              <Zap className="w-8 h-8 text-yellow-500" />
            </div>
          </AccessibleCard>
          <AccessibleCard className="glass-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Ubuntu Score</p>
                <p className="text-2xl font-bold">
                  {Math.round(projects.reduce((acc, p) => acc + p.ubuntuScore, 0) / projects.length)}
                </p>
              </div>
              <Heart className="w-8 h-8 text-red-500" />
            </div>
          </AccessibleCard>
          <AccessibleCard className="glass-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Community Members</p>
                <p className="text-2xl font-bold">
                  {projects.reduce((acc, p) => acc + p.team.length, 0)}
                </p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </AccessibleCard>
          <AccessibleCard className="glass-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Collective Benefit</p>
                <p className="text-2xl font-bold">1000+</p>
              </div>
              <Globe className="w-8 h-8 text-green-500" />
            </div>
          </AccessibleCard>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search Ubuntu projects..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <select
              className="px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="planning">Planning</option>
              <option value="active">Active</option>
              <option value="review">Review</option>
              <option value="completed">Completed</option>
            </select>
            <select
              className="px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
            >
              <option value="ubuntuScore">Ubuntu Score</option>
              <option value="progress">Progress</option>
              <option value="deadline">Deadline</option>
            </select>
          </div>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {sortedProjects.map((project) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <AccessibleCard className="glass-card p-6 hover:bg-card/50 transition-all cursor-pointer">
                {/* Project Header */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2">{project.name}</h3>
                    <p className="text-muted-foreground text-sm mb-3">{project.description}</p>
                    <div className="flex gap-2 flex-wrap">
                      <span className={`px-2 py-1 rounded-full text-xs border ${getStatusColor(project.status)}`}>
                        {project.status}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs ${getImpactColor(project.communityImpact)}`}>
                        {project.communityImpact} impact
                      </span>
                      <span className="px-2 py-1 rounded-full text-xs bg-purple-500/20 text-purple-500">
                        Ubuntu {project.ubuntuScore}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Progress */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Progress</span>
                    <span>{project.progress}%</span>
                  </div>
                  <div className="w-full bg-border rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-primary to-purple-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                </div>

                {/* Ubuntu Values */}
                <div className="mb-4">
                  <p className="text-sm font-medium mb-2">Ubuntu Values:</p>
                  <div className="flex gap-2 flex-wrap">
                    {project.ubuntuValues.map((value, index) => (
                      <span key={index} className="px-2 py-1 bg-blue-500/20 text-blue-500 rounded text-xs">
                        {value}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Team */}
                <div className="mb-4">
                  <p className="text-sm font-medium mb-2">Ubuntu Team:</p>
                  <div className="flex -space-x-2">
                    {project.team.map((member, index) => (
                      <div key={index} className="relative group">
                        <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm border-2 border-background">
                          {member.avatar}
                        </div>
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-background border border-border rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                          <div className="font-medium">{member.name}</div>
                          <div className="text-muted-foreground">{member.role}</div>
                          <div className="text-green-500">Ubuntu {member.ubuntuContribution}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Collective Benefit */}
                <div className="mb-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Heart className="w-4 h-4 text-green-500" />
                    <span className="text-sm font-medium text-green-500">Collective Benefit</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{project.collectiveBenefit}</p>
                </div>

                {/* Milestones */}
                <div className="mb-4">
                  <p className="text-sm font-medium mb-2">Milestones:</p>
                  <div className="space-y-1">
                    {project.milestones.slice(0, 3).map((milestone, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        {milestone.completed ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <Clock className="w-4 h-4 text-muted-foreground" />
                        )}
                        <span className={milestone.completed ? 'text-muted-foreground line-through' : ''}>
                          {milestone.title}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button size="sm" className="flex-1">
                    <Users className="w-4 h-4 mr-2" />
                    Join Ubuntu Team
                  </Button>
                  <Button size="sm" variant="outline">
                    <Heart className="w-4 h-4 mr-2" />
                    Support
                  </Button>
                </div>
              </AccessibleCard>
            </motion.div>
          ))}
        </div>

        {/* Ubuntu Philosophy Card */}
        <AccessibleCard className="glass-card p-6 mt-8">
          <div className="flex items-center gap-3 mb-4">
            <Heart className="w-6 h-6 text-red-500" />
            <h3 className="text-lg font-bold">Ubuntu Project Philosophy</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <h4 className="font-medium mb-2">"I am because we are"</h4>
              <p className="text-sm text-muted-foreground">
                Our success is measured by collective wellbeing, not individual achievement.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Community First</h4>
              <p className="text-sm text-muted-foreground">
                Every project must contribute to the benefit of the community.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Shared Success</h4>
              <p className="text-sm text-muted-foreground">
                When one project succeeds, the entire community grows stronger.
              </p>
            </div>
          </div>
        </AccessibleCard>
      </div>
    </AppLayout>
  );
}
