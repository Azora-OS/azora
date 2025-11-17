'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@azora/ui';
import { UbuntuGem } from '@azora/ui';
import { ubuntuAPI } from '../lib/api';

interface DashboardData {
  courses: any[];
  balance: number;
  philosophy: any;
}

export function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [courses, wallet, philosophy] = await Promise.all([
        ubuntuAPI.getCourses(),
        ubuntuAPI.getWalletBalance(),
        ubuntuAPI.getPhilosophy()
      ]);

      setData({
        courses: courses.courses || [],
        balance: wallet.balance || 0,
        philosophy
      });
    } catch (error) {
      console.error('Ubuntu dashboard error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <UbuntuGem size="xl" animated />
        <span className="ml-4 text-ubuntu-sapphire">Loading Ubuntu Dashboard...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-ubuntu-sapphire/5 to-ubuntu-emerald/5">
      <div className="container mx-auto px-4 py-8">
        {/* Ubuntu Header */}
        <div className="flex items-center mb-8">
          <UbuntuGem size="lg" />
          <div className="ml-4">
            <h1 className="text-3xl font-bold text-ubuntu-sapphire">
              Ubuntu Student Portal
            </h1>
            <p className="text-ubuntu-emerald">
              {data?.philosophy?.philosophy || 'Loading Ubuntu wisdom...'}
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-ubuntu-sapphire mb-2">
              AZR Balance
            </h3>
            <p className="text-3xl font-bold text-ubuntu-emerald">
              {data?.balance?.toFixed(2) || '0.00'} AZR
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-ubuntu-sapphire mb-2">
              Active Courses
            </h3>
            <p className="text-3xl font-bold text-ubuntu-emerald">
              {data?.courses?.length || 0}
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-ubuntu-sapphire mb-2">
              Ubuntu Level
            </h3>
            <p className="text-3xl font-bold text-ubuntu-emerald">
              Beginner
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h3 className="text-xl font-semibold text-ubuntu-sapphire mb-4">
            Ubuntu Quick Actions
          </h3>
          <div className="flex flex-wrap gap-4">
            <Button 
              variant="default"
              ubuntu="Start learning with Ubuntu AI"
            >
              Start Learning
            </Button>
            <Button 
              variant="secondary"
              ubuntu="Begin Ubuntu knowledge mining"
              onClick={() => ubuntuAPI.startMining()}
            >
              Start Mining
            </Button>
            <Button 
              variant="outline"
              ubuntu="Explore Ubuntu marketplace"
            >
              Explore Marketplace
            </Button>
          </div>
        </div>

        {/* Ubuntu Principles */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-semibold text-ubuntu-sapphire mb-4">
            Ubuntu Principles
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data?.philosophy?.principles?.map((principle: string, index: number) => (
              <div key={index} className="flex items-center p-3 bg-ubuntu-sapphire/5 rounded-lg">
                <UbuntuGem size="sm" className="mr-3" />
                <span className="text-ubuntu-sapphire">{principle}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}