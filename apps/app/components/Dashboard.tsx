'use client';
import { useEffect, useState } from 'react';
import { AzoraLogo } from '@/apps/azora-ui/components/branding';
import { PremiumCard, PremiumCardHeader, PremiumCardTitle, PremiumCardContent, PremiumCardFooter } from '@/apps/azora-ui/components/ui/card-premium';
import { PremiumButton } from '@/apps/azora-ui/components/ui/button-premium';
import { PremiumHeader } from '@/apps/azora-ui/components/layout/premium-header';
import { BookOpen, Wallet, ShoppingBag, Activity } from 'lucide-react';

export function Dashboard() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, []);

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.reload();
  };

  if (!user) return null;

  return (
    <div className="min-h-screen">
      {/* 💎 PREMIUM HEADER */}
      <PremiumHeader 
        variant="glass"
        showLogo={true}
        logoSize="md"
      />

      <div className="container mx-auto px-6 py-12">
        {/* Welcome Section */}
        <div className="mb-12 text-center">
          <h1 className="text-5xl font-bold mb-4 brand-gradient-triunity">
            Welcome back, {user.name || user.email}
          </h1>
          <p className="text-xl text-muted-foreground">
            Your Azora OS workspace is ready
          </p>
        </div>

        {/* 💎 PREMIUM SERVICE CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Education Card */}
          <PremiumCard variant="glass" glow="emerald" className="group">
            <PremiumCardHeader>
              <div className="flex items-center gap-4 mb-2">
                <div className="w-12 h-12 rounded-xl gradient-premium-emerald flex items-center justify-center glow-premium-emerald">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <PremiumCardTitle>Education</PremiumCardTitle>
              </div>
            </PremiumCardHeader>
            <PremiumCardContent>
              <p className="text-muted-foreground mb-4">
                Access courses, learning materials, and educational resources
              </p>
            </PremiumCardContent>
            <PremiumCardFooter>
              <PremiumButton variant="education" className="w-full" size="lg">
                View Courses
              </PremiumButton>
            </PremiumCardFooter>
          </PremiumCard>

          {/* Mint Card */}
          <PremiumCard variant="glass" glow="ruby" className="group">
            <PremiumCardHeader>
              <div className="flex items-center gap-4 mb-2">
                <div className="w-12 h-12 rounded-xl gradient-premium-ruby flex items-center justify-center glow-premium-ruby">
                  <Wallet className="w-6 h-6 text-white" />
                </div>
                <PremiumCardTitle>Mint</PremiumCardTitle>
              </div>
            </PremiumCardHeader>
            <PremiumCardContent>
              <p className="text-muted-foreground mb-4">
                Financial services, payments, and wallet management
              </p>
            </PremiumCardContent>
            <PremiumCardFooter>
              <PremiumButton variant="finance" className="w-full" size="lg">
                Open Wallet
              </PremiumButton>
            </PremiumCardFooter>
          </PremiumCard>

          {/* Forge Card */}
          <PremiumCard variant="glass" glow="sapphire" className="group">
            <PremiumCardHeader>
              <div className="flex items-center gap-4 mb-2">
                <div className="w-12 h-12 rounded-xl gradient-premium-sapphire flex items-center justify-center glow-premium-sapphire">
                  <ShoppingBag className="w-6 h-6 text-white" />
                </div>
                <PremiumCardTitle>Forge</PremiumCardTitle>
              </div>
            </PremiumCardHeader>
            <PremiumCardContent>
              <p className="text-muted-foreground mb-4">
                Marketplace, services, and collaborative tools
              </p>
            </PremiumCardContent>
            <PremiumCardFooter>
              <PremiumButton variant="premium" className="w-full" size="lg">
                Browse Market
              </PremiumButton>
            </PremiumCardFooter>
          </PremiumCard>
        </div>

        {/* Recent Activity */}
        <PremiumCard variant="glass" className="mb-8">
          <PremiumCardHeader>
            <div className="flex items-center gap-3">
              <Activity className="w-6 h-6 text-premium-sapphire-500" />
              <PremiumCardTitle>Recent Activity</PremiumCardTitle>
            </div>
          </PremiumCardHeader>
          <PremiumCardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 glass-light rounded-xl">
                <div className="w-10 h-10 rounded-lg gradient-premium-emerald flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Started new course</p>
                  <p className="text-sm text-muted-foreground">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 glass-light rounded-xl">
                <div className="w-10 h-10 rounded-lg gradient-premium-ruby flex items-center justify-center">
                  <Wallet className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Transaction completed</p>
                  <p className="text-sm text-muted-foreground">5 hours ago</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 glass-light rounded-xl">
                <div className="w-10 h-10 rounded-lg gradient-premium-sapphire flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Service purchased</p>
                  <p className="text-sm text-muted-foreground">1 day ago</p>
                </div>
              </div>
            </div>
          </PremiumCardContent>
        </PremiumCard>
      </div>
    </div>
  );
}
