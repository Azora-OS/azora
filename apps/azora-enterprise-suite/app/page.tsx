'use client';

import React from 'react';
import { AppLayout, SignatureStamp, UbuntuPhilosophyCard } from '@azora/shared-design';
import {
  LayoutDashboard,
  Users,
  Settings,
  BarChart,
  CreditCard,
  FileText,
  Plug
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function EnterpriseHome() {
  const router = useRouter();

  const modules = [
    {
      title: 'Analytics',
      description: 'Real-time performance metrics and insights',
      icon: BarChart,
      path: '/admin/analytics',
      color: 'text-blue-400',
      bg: 'bg-blue-500/10'
    },
    {
      title: 'Team Management',
      description: 'Manage users, roles, and permissions',
      icon: Users,
      path: '/admin/users',
      color: 'text-purple-400',
      bg: 'bg-purple-500/10'
    },
    {
      title: 'Billing & Finance',
      description: 'Invoices, subscriptions, and payment methods',
      icon: CreditCard,
      path: '/admin/billing',
      color: 'text-green-400',
      bg: 'bg-green-500/10'
    },
    {
      title: 'Reports',
      description: 'Generate and export detailed reports',
      icon: FileText,
      path: '/admin/reports',
      color: 'text-orange-400',
      bg: 'bg-orange-500/10'
    },
    {
      title: 'Integrations',
      description: 'Connect with third-party tools and services',
      icon: Plug,
      path: '/admin/integrations',
      color: 'text-pink-400',
      bg: 'bg-pink-500/10'
    },
    {
      title: 'Settings',
      description: 'Global configuration and preferences',
      icon: Settings,
      path: '/admin/settings',
      color: 'text-gray-400',
      bg: 'bg-gray-500/10'
    }
  ];

  return (
    <AppLayout appName="Enterprise Suite" userName="Admin User">
      <div className="max-w-7xl mx-auto py-8 px-4">
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-4">Enterprise Dashboard</h1>
          <p className="text-xl text-muted-foreground">
            Manage your organization's resources and settings from a central command center.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {modules.map((module) => (
            <div
              key={module.title}
              onClick={() => router.push(module.path)}
              className="group relative overflow-hidden rounded-xl border border-border/50 bg-card/50 p-6 hover:border-primary/50 transition-all cursor-pointer hover:shadow-lg hover:shadow-primary/5"
            >
              <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br from-transparent via-transparent to-${module.color.split('-')[1]}-500/5`} />

              <div className="relative z-10 flex items-start justify-between mb-4">
                <div className={`p-3 rounded-lg ${module.bg}`}>
                  <module.icon className={`w-6 h-6 ${module.color}`} />
                </div>
              </div>

              <div className="relative z-10">
                <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                  {module.title}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {module.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mb-8">
          <UbuntuPhilosophyCard
            collaborationScore={87}
            communityImpact={85}
            knowledgeSharing={89}
          />
        </div>

        <div className="flex justify-center">
          <SignatureStamp appName="Enterprise Suite" department="Azora Core" />
        </div>
      </div>
    </AppLayout>
  );
}
