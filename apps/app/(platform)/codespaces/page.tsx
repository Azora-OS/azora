'use client';

import { useState, useEffect } from 'react';
import { Code, Play, Terminal, GitBranch, Users, Zap, Sparkles } from 'lucide-react';
import { AzoraLogo } from '@/apps/azora-ui/components/branding';
import { PremiumCard, PremiumCardHeader, PremiumCardTitle, PremiumCardContent, PremiumCardFooter } from '@/apps/azora-ui/components/ui/card-premium';
import { PremiumButton } from '@/apps/azora-ui/components/ui/button-premium';
import { PremiumHeader } from '@/apps/azora-ui/components/layout/premium-header';

export default function CodespacesPage() {
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/codespaces/workspaces')
      .then(res => res.json())
      .then(data => setWorkspaces(data.workspaces || []))
      .catch(() => setWorkspaces([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen">
      {/* 💎 PREMIUM HEADER */}
      <PremiumHeader variant="glass" showLogo={true} />

      <div className="container mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="mb-12 text-center">
          <div className="flex items-center justify-center gap-4 mb-6">
            <Code className="w-12 h-12 text-premium-sapphire-500 glow-premium-sapphire" />
            <h1 className="text-6xl font-bold brand-gradient-triunity">
              Azora Codespaces
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Cloud development environments powered by Constitutional AI and Spark
          </p>
        </div>

        {/* 💎 PREMIUM ACTION CARDS */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <PremiumCard variant="glassSapphire" glow="sapphire" className="cursor-pointer group">
            <PremiumCardHeader>
              <div className="flex items-center gap-4 mb-2">
                <div className="w-12 h-12 rounded-xl gradient-premium-sapphire flex items-center justify-center glow-premium-sapphire">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <PremiumCardTitle>New Workspace</PremiumCardTitle>
              </div>
            </PremiumCardHeader>
            <PremiumCardContent>
              <p className="text-muted-foreground">
                Create a cloud development environment instantly
              </p>
            </PremiumCardContent>
            <PremiumCardFooter>
              <PremiumButton variant="premium" className="w-full" size="lg">
                Create Workspace
              </PremiumButton>
            </PremiumCardFooter>
          </PremiumCard>
          
          <PremiumCard variant="glassEmerald" glow="emerald" className="cursor-pointer group">
            <PremiumCardHeader>
              <div className="flex items-center gap-4 mb-2">
                <div className="w-12 h-12 rounded-xl gradient-premium-emerald flex items-center justify-center glow-premium-emerald">
                  <GitBranch className="w-6 h-6 text-white" />
                </div>
                <PremiumCardTitle>From Repository</PremiumCardTitle>
              </div>
            </PremiumCardHeader>
            <PremiumCardContent>
              <p className="text-muted-foreground">
                Clone and launch from any Git repository
              </p>
            </PremiumCardContent>
            <PremiumCardFooter>
              <PremiumButton variant="education" className="w-full" size="lg">
                Clone Repo
              </PremiumButton>
            </PremiumCardFooter>
          </PremiumCard>
          
          <PremiumCard variant="glassRuby" glow="ruby" className="cursor-pointer group">
            <PremiumCardHeader>
              <div className="flex items-center gap-4 mb-2">
                <div className="w-12 h-12 rounded-xl gradient-premium-ruby flex items-center justify-center glow-premium-ruby">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <PremiumCardTitle>Team Workspace</PremiumCardTitle>
              </div>
            </PremiumCardHeader>
            <PremiumCardContent>
              <p className="text-muted-foreground">
                Collaborative coding with real-time sync
              </p>
            </PremiumCardContent>
            <PremiumCardFooter>
              <PremiumButton variant="finance" className="w-full" size="lg">
                Start Collaboration
              </PremiumButton>
            </PremiumCardFooter>
          </PremiumCard>
        </div>

        {/* 💎 PREMIUM WORKSPACES LIST */}
        <PremiumCard variant="glass" glow="sapphire">
          <PremiumCardHeader>
            <div className="flex items-center gap-3">
              <Sparkles className="w-6 h-6 text-premium-sapphire-500" />
              <PremiumCardTitle>Your Workspaces</PremiumCardTitle>
            </div>
          </PremiumCardHeader>
          <PremiumCardContent>
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-premium-sapphire-500 mb-4"></div>
                <p className="text-muted-foreground">Loading workspaces...</p>
              </div>
            ) : workspaces.length === 0 ? (
              <div className="text-center py-12">
                <Terminal className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground text-lg mb-4">No workspaces yet</p>
                <p className="text-muted-foreground">Create your first workspace to get started!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {workspaces.map((ws: any) => (
                  <PremiumCard 
                    key={ws.id} 
                    variant="glass" 
                    className="hover:border-premium-sapphire-500/50 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-1">{ws.name}</h3>
                        <p className="text-sm text-muted-foreground">{ws.repository || 'Local workspace'}</p>
                      </div>
                      <PremiumButton variant="premium" size="sm" className="ml-4">
                        <Play className="w-4 h-4 mr-2" />
                        Open
                      </PremiumButton>
                    </div>
                  </PremiumCard>
                ))}
              </div>
            )}
          </PremiumCardContent>
        </PremiumCard>

        {/* Spark Integration Notice */}
        <PremiumCard variant="glassEmerald" className="mt-8">
          <PremiumCardContent>
            <div className="flex items-start gap-4">
              <Sparkles className="w-6 h-6 text-premium-emerald-500 mt-1" />
              <div>
                <h3 className="font-semibold mb-2">Spark AI Integration</h3>
                <p className="text-sm text-muted-foreground">
                  Your workspaces are enhanced with Spark AI for intelligent code completion, 
                  codebase search, and AI-powered assistance. Experience GitHub Copilot-level 
                  features powered by Elara AI.
                </p>
              </div>
            </div>
          </PremiumCardContent>
        </PremiumCard>
      </div>
    </div>
  );
}
