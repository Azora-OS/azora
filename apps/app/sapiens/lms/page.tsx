/*
AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

SAPIENS ADVANCED LMS - Learning Management System
With Elara AI Guardian + Immediate Economic Integration

"Whatever you do, work heartily, as for the Lord and not for men." - Colossians 3:23
*/

'use client';

import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  BookOpen,
  Code2,
  DollarSign,
  Briefcase,
  Trophy,
  Users,
  MessageSquare,
  Play,
  Pause,
  Check,
  Sparkles,
  TrendingUp,
  Target,
  Zap,
  Clock,
  Crown,
} from 'lucide-react';
import { useMyCourses, useMe, usePIVCLeaderboard, useCourses, useMentors, useStudyGroups } from './hooks';
import { PremiumBadge, PremiumCourseBadge } from '@/components/education/PremiumBadge';
import { PremiumFeatures } from '@/components/education/PremiumFeatures';


export default function SapiensAdvancedLMS() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'learn' | 'earn' | 'build' | 'community' | 'premium'>('dashboard');
  const [elaraChat, setElaraChat] = useState('');
  const [showElara, setShowElara] = useState(true);
  const { user, loading: userLoading } = useMe();
  const { courses, loading: coursesLoading } = useMyCourses();
  const { leaderboard, loading: leaderboardLoading } = usePIVCLeaderboard('monthly');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-blue-950 text-white">
      {/* Top Navigation */}
      <header className="border-b border-purple-500/30 backdrop-blur-md bg-black/20 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <GraduationCap className="w-10 h-10 text-purple-400" />
              <div>
                <h1 className="text-2xl font-bold">SAPIENS LMS</h1>
                <p className="text-xs text-purple-300">Learn. Earn. Build.</p>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="hidden md:flex items-center space-x-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">$347</div>
                <div className="text-xs text-green-300">Earned This Month</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">87%</div>
                <div className="text-xs text-blue-300">Course Progress</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400">12</div>
                <div className="text-xs text-yellow-300">Day Streak 🔥</div>
              </div>
            </div>

            {/* User */}
            <div className="flex items-center space-x-3">
              <PremiumBadge variant="gold" size="md" />
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center font-bold relative">
                {user ? `${user.profile.firstName.charAt(0)}${user.profile.lastName.charAt(0)}` : '...'}
                <div className="absolute -top-1 -right-1">
                  <Crown className="w-4 h-4 text-yellow-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex space-x-1 mt-4 overflow-x-auto">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: Target },
              { id: 'learn', label: 'Learn', icon: BookOpen },
              { id: 'earn', label: 'Earn', icon: DollarSign },
              { id: 'build', label: 'Build', icon: Code2 },
              { id: 'community', label: 'Community', icon: Users },
              { id: 'premium', label: 'Premium', icon: Crown, premium: true },
            ].map(({ id, label, icon: Icon, premium }: any) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={`px-6 py-3 rounded-t-lg flex items-center space-x-2 transition-all relative ${
                  activeTab === id
                    ? premium
                      ? 'bg-gradient-to-r from-yellow-900/50 to-amber-900/50 border-t-2 border-yellow-400'
                      : 'bg-purple-900/50 border-t-2 border-purple-400'
                    : 'hover:bg-purple-900/30'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="font-semibold text-sm">{label}</span>
                {premium && <Sparkles className="w-3 h-3 text-yellow-400 animate-pulse" />}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Layout with Elara Sidebar */}
      <div className="flex min-h-[calc(100vh-180px)]">
        {/* Main Content */}
        <main className={`flex-1 p-6 ${showElara ? 'mr-96' : ''} transition-all`}>
          {activeTab === 'dashboard' && <DashboardView user={user} courses={courses} leaderboard={leaderboard} />}
          {activeTab === 'learn' && <LearnView courses={courses} />}
          {activeTab === 'earn' && <EarnView />}
          {activeTab === 'build' && <BuildView />}
          {activeTab === 'community' && <CommunityView />}
          {activeTab === 'premium' && <PremiumFeatures />}
        </main>

        {/* Elara Guardian Sidebar */}
        {showElara && (
          <aside className="fixed right-0 top-[180px] bottom-0 w-96 border-l border-purple-500/30 bg-gradient-to-br from-purple-950/90 to-blue-950/90 backdrop-blur-lg flex flex-col">
            {/* Elara Header */}
            <div className="p-6 border-b border-purple-500/30">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold">Elara Guardian</h3>
                    <p className="text-xs text-purple-300">Your AI Learning Guide</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowElara(false)}
                  className="text-purple-400 hover:text-purple-300"
                >
                  ✕
                </button>
              </div>
              <p className="text-sm text-purple-200">
                I'm here to guide you every step of the way! Ask me anything, and I'll help you learn, earn, and build! 💜
              </p>
            </div>

            {/* Elara Chat */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {/* Elara Messages */}
              <div className="bg-purple-900/30 rounded-xl p-4">
                <p className="text-sm text-purple-200 mb-2">
                  🎉 <strong>Congratulations!</strong> You just completed "Introduction to Python"!
                </p>
                <p className="text-sm text-purple-300">
                  Ready for your first earning project? I found a perfect match: Build a simple calculator for a client ($15).
                </p>
                <button className="mt-2 bg-green-600 hover:bg-green-500 px-4 py-2 rounded-lg text-sm w-full">
                  Start Earning Project →
                </button>
              </div>

              <div className="bg-blue-900/30 rounded-xl p-4">
                <p className="text-sm text-blue-200 mb-2">
                  💡 <strong>Learning Tip:</strong>
                </p>
                <p className="text-sm text-blue-300">
                  You've been practicing loops for 20 minutes. Let's apply them to a real project! Want to build a countdown timer?
                </p>
                <div className="flex space-x-2 mt-2">
                  <button className="flex-1 bg-blue-600 hover:bg-blue-500 px-3 py-2 rounded-lg text-sm">
                    Yes, Let's Build!
                  </button>
                  <button className="flex-1 bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded-lg text-sm">
                    More Practice
                  </button>
                </div>
              </div>

              <div className="bg-yellow-900/30 rounded-xl p-4">
                <p className="text-sm text-yellow-200 mb-2">
                  ⚠️ <strong>Heads Up:</strong>
                </p>
                <p className="text-sm text-yellow-300">
                  Your client project is due in 2 days. You're 60% done. Need help finishing strong?
                </p>
                <button className="mt-2 bg-yellow-600 hover:bg-yellow-500 px-4 py-2 rounded-lg text-sm w-full">
                  Get Help Now
                </button>
              </div>
            </div>

            {/* Elara Input */}
            <div className="p-4 border-t border-purple-500/30">
              <div className="relative">
                <input
                  type="text"
                  value={elaraChat}
                  onChange={(e) => setElaraChat(e.target.value)}
                  placeholder="Ask Elara anything..."
                  className="w-full bg-purple-900/30 border border-purple-500/30 rounded-lg px-4 py-3 pr-12 focus:outline-none focus:border-purple-400"
                />
                <button className="absolute right-2 top-1/2 -translate-y-1/2 bg-purple-600 hover:bg-purple-500 rounded-lg p-2">
                  <MessageSquare className="w-5 h-5" />
                </button>
              </div>
              <p className="text-xs text-purple-400 mt-2">
                Elara responds instantly with personalized guidance! 🤖✨
              </p>
            </div>
          </aside>
        )}

        {/* Show Elara Button (when hidden) */}
        {!showElara && (
          <button
            onClick={() => setShowElara(true)}
            className="fixed right-6 bottom-6 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full p-4 shadow-lg hover:scale-110 transition-transform z-50"
          >
            <Sparkles className="w-6 h-6" />
          </button>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// VIEW COMPONENTS
// ============================================================================

function DashboardView({ user, courses, leaderboard }) {
  return (
    <div className="space-y-6">
      {/* Premium Banner */}
      <div className="bg-gradient-to-r from-yellow-900/30 to-amber-900/30 rounded-3xl p-6 border-2 border-yellow-500/50 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-4 -mr-4">
          <div className="w-32 h-32 bg-yellow-500/20 rounded-full blur-3xl"></div>
        </div>
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Crown className="w-6 h-6 text-yellow-400 animate-pulse" />
              <h2 className="text-2xl font-bold text-yellow-200">Premium Learning Experience</h2>
            </div>
            <p className="text-yellow-100 mb-4">
              Unlock advanced AI tutoring, exclusive content, and priority support
            </p>
            <div className="flex gap-3">
              <button className="bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 px-6 py-2 rounded-lg font-semibold text-white transition-all">
                Upgrade Now
              </button>
              <button className="bg-yellow-900/50 hover:bg-yellow-900/70 px-6 py-2 rounded-lg font-semibold text-yellow-200 transition-all">
                View Features
              </button>
            </div>
          </div>
          <div className="hidden md:block">
            <PremiumBadge variant="gold" size="lg" />
          </div>
        </div>
      </div>

      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 rounded-3xl p-8 border border-purple-500/30">
        <h2 className="text-3xl font-bold mb-2">Welcome back, {user ? user.profile.firstName : 'Student'}! 👋</h2>
        <p className="text-purple-300 mb-4">
          You're making amazing progress! Keep learning and earning! 🚀
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard icon={<TrendingUp className="w-6 h-6" />} label="Skills Mastered" value="7" color="green" />
          <StatCard icon={<DollarSign className="w-6 h-6" />} label="Total Earned" value="$1,234" color="blue" />
          <StatCard icon={<Code2 className="w-6 h-6" />} label="Projects Built" value="15" color="purple" />
          <StatCard icon={<Trophy className="w-6 h-6" />} label="Achievements" value="23" color="yellow" premium />
        </div>
      </div>

      {/* Current Learning Path */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 rounded-2xl p-6 border border-blue-500/20">
          <h3 className="text-xl font-bold mb-4 flex items-center space-x-2">
            <BookOpen className="w-6 h-6 text-blue-400" />
            <span>Active Course</span>
          </h3>
          {courses && courses.length > 0 ? (
            <div className="bg-black/30 rounded-xl p-4 mb-4">
              <h4 className="font-bold mb-2">{courses[0].title}</h4>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Progress</span>
                <span className="text-sm font-bold text-green-400">{courses[0].progress || 0}%</span>
              </div>
              <div className="bg-gray-800 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: `${courses[0].progress || 0}%` }}></div>
              </div>
            </div>
          ) : (
            <div className="text-center p-8">No active courses.</div>
          )}
          <button className="w-full bg-blue-600 hover:bg-blue-500 px-6 py-3 rounded-lg font-semibold flex items-center justify-center space-x-2">
            <Play className="w-5 h-5" />
            <span>Continue Learning</span>
          </button>
        </div>

        <div className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 rounded-2xl p-6 border border-green-500/20">
          <h3 className="text-xl font-bold mb-4 flex items-center space-x-2">
            <Briefcase className="w-6 h-6 text-green-400" />
            <span>Active Earning Project</span>
          </h3>
          <div className="bg-black/30 rounded-xl p-4 mb-4">
            <h4 className="font-bold mb-2">E-Commerce Website for Local Shop</h4>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-400">Payment</span>
              <span className="text-xl font-bold text-green-400">$450</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-yellow-300">
              <Clock className="w-4 h-4" />
              <span>Due in 3 days</span>
            </div>
          </div>
          <button className="w-full bg-green-600 hover:bg-green-500 px-6 py-3 rounded-lg font-semibold">
            Continue Building →
          </button>
        </div>
      </div>

      {/* Leaderboard */}
      <Leaderboard leaderboard={leaderboard} />

      {/* Opportunities Feed */}
      <div>
        <h3 className="text-2xl font-bold mb-4">🚀 New Earning Opportunities</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <OpportunityCard
            title="Landing Page Design"
            payment="$75"
            difficulty="Beginner"
            time="2-3 hours"
            skills={['HTML', 'CSS']}
          />
          <OpportunityCard
            title="Python Data Analysis"
            payment="$150"
            difficulty="Intermediate"
            time="1 day"
            skills={['Python', 'Pandas']}
          />
          <OpportunityCard
            title="Mobile App UI/UX"
            payment="$300"
            difficulty="Advanced"
            time="3-5 days"
            skills={['Figma', 'React Native']}
          />
        </div>
      </div>
    </div>
  );
}

function Leaderboard({ leaderboard }) {
  if (!leaderboard) {
    return (
      <div className="bg-gradient-to-br from-purple-900/40 to-blue-900/40 rounded-2xl p-6 border border-purple-500/20">
        <h3 className="text-xl font-bold mb-4">PIVC Leaderboard</h3>
        <div className="text-center p-4">Loading leaderboard...</div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-purple-900/40 to-blue-900/40 rounded-2xl p-6 border border-purple-500/20">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold">PIVC Leaderboard</h3>
        <button className="text-sm text-purple-300 hover:text-purple-200">View All</button>
      </div>
      <div className="space-y-3">
        {leaderboard.slice(0, 5).map((entry, index) => (
          <div key={entry.user.id} className="flex items-center justify-between bg-black/20 p-3 rounded-lg">
            <div className="flex items-center space-x-3">
              <span className={`font-bold w-6 text-center ${index < 3 ? 'text-yellow-400' : 'text-gray-400'}`}>{entry.rank}</span>
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center font-bold text-sm">
                {entry.user.profile.firstName.charAt(0)}{entry.user.profile.lastName.charAt(0)}
              </div>
              <span className="font-semibold">{entry.user.profile.firstName} {entry.user.profile.lastName}</span>
            </div>
            <span className="font-bold text-green-400">{entry.score} PIVC</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function LearnView() {
  const { courses, loading, error } = useCourses({ limit: 10, offset: 0 });

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
      </div>
    );
  }

  if (error) {
    return <div className="text-center py-12 text-red-500">Error loading courses. Please try again later.</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold mb-2">Course Catalog</h2>
        <p className="text-lg text-gray-400">Expand your knowledge and skills with our curated courses.</p>
      </div>

      {courses && courses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-400">No courses available at the moment. Please check back later.</p>
        </div>
      )}
    </div>
  );
};

function CourseCard({ course }: { course: any }) {
  const isPremium = course.premium || Math.random() > 0.7; // Random premium for demo
  
  return (
    <div className="bg-gradient-to-br from-purple-900/50 to-blue-900/50 rounded-2xl p-6 border border-purple-500/20 flex flex-col justify-between relative">
      {isPremium && (
        <div className="absolute top-4 right-4">
          <PremiumCourseBadge level="basic" />
        </div>
      )}
      <div>
        <h4 className="text-lg font-bold mb-2 flex items-center gap-2">
          {course.title}
          {isPremium && <Crown className="w-4 h-4 text-yellow-400" />}
        </h4>
        <p className="text-sm text-purple-300 mb-4">{course.description}</p>
        {isPremium && (
          <div className="mb-4 flex items-center gap-2 text-xs text-yellow-400">
            <Sparkles className="w-3 h-3" />
            <span>Premium Content</span>
          </div>
        )}
      </div>
      <button className={`px-4 py-2 rounded-lg w-full mt-4 font-semibold ${
        isPremium 
          ? 'bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-white' 
          : 'bg-purple-600 hover:bg-purple-500'
      }`}>
        {isPremium ? 'Unlock Premium Course' : 'View Course'}
      </button>
    </div>
  );
}

function EarnView() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">💰 Earning Dashboard</h2>
        <div className="text-right">
          <div className="text-3xl font-bold text-green-400">$1,234.50</div>
          <div className="text-sm text-green-300">Total Earned</div>
        </div>
      </div>

      {/* Earning Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-green-900/30 rounded-xl p-4 border border-green-500/20">
          <div className="text-2xl font-bold text-green-400">$347</div>
          <div className="text-sm text-green-300">This Month</div>
        </div>
        <div className="bg-blue-900/30 rounded-xl p-4 border border-blue-500/20">
          <div className="text-2xl font-bold text-blue-400">15</div>
          <div className="text-sm text-blue-300">Projects Completed</div>
        </div>
        <div className="bg-yellow-900/30 rounded-xl p-4 border border-yellow-500/20">
          <div className="text-2xl font-bold text-yellow-400">4.9</div>
          <div className="text-sm text-yellow-300">Client Rating</div>
        </div>
        <div className="bg-purple-900/30 rounded-xl p-4 border border-purple-500/20">
          <div className="text-2xl font-bold text-purple-400">$850</div>
          <div className="text-sm text-purple-300">In Progress</div>
        </div>
      </div>

      {/* Available Projects */}
      <div>
        <h3 className="text-2xl font-bold mb-4">Available Projects</h3>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <ProjectCard key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

function BuildView() {
  const { portfolio, loading, error } = useMyPortfolio();

  if (error) {
    return <div className="text-center py-12 text-red-500">Error loading portfolio. Please try again later.</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold mb-2">My Portfolio</h2>
        <p className="text-lg text-gray-400">Showcasing your completed projects and skills.</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(3)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : portfolio && portfolio.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {portfolio.map((project) => (
            <PortfolioItemCard key={project.id} project={project} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-400">You haven't completed any projects yet. Finish a project to add it to your portfolio.</p>
        </div>
      )}
    </div>
  );
}

const StudyGroupCard = ({ group }: { group: any }) => (
  <div className="bg-black/30 rounded-lg p-4">
    <div className="flex items-center justify-between">
      <div>
        <h4 className="font-bold">{group.name}</h4>
        <p className="text-sm text-gray-400">{group.members.length} members</p>
      </div>
      <button className="bg-purple-600 hover:bg-purple-500 px-4 py-2 rounded-lg text-sm">
        Join Session
      </button>
    </div>
  </div>
);

const MentorCard = ({ mentor }: { mentor: any }) => (
  <div className="bg-black/30 rounded-lg p-4">
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center font-bold">
          {mentor.profile.firstName.charAt(0)}{mentor.profile.lastName.charAt(0)}
        </div>
        <div>
          <h4 className="font-bold">{mentor.profile.firstName} {mentor.profile.lastName}</h4>
          <p className="text-sm text-gray-400">{mentor.profile.tagline || 'Expert'}</p>
        </div>
      </div>
      <button className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg text-sm">
        Book Session
      </button>
    </div>
  </div>
);

function CommunityView() {
  const { leaderboard, loading, error, fetchMore } = useLeaderboard({ limit: 10 });
  const { mentors, loading: mentorsLoading, error: mentorsError } = useMentors();
  const { studyGroups, loading: studyGroupsLoading, error: studyGroupsError } = useStudyGroups();

  if (error || mentorsError || studyGroupsError) {
    return <div className="text-center py-12 text-red-500">Error loading community data. Please try again later.</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold mb-2">🏆 PIVC Leaderboard</h2>
        <p className="text-lg text-gray-400">See who is making the biggest impact in the Azora ecosystem.</p>
      </div>

      {loading && (!leaderboard || leaderboard.length === 0) ? (
        <LeaderboardSkeleton />
      ) : (
        <div className="bg-gradient-to-br from-purple-900/50 to-blue-900/50 rounded-2xl p-6 border border-purple-500/20">
          <div className="space-y-3">
            {leaderboard.map((entry, index) => (
              <div key={entry.user.id} className="flex items-center justify-between bg-black/20 p-3 rounded-lg hover:bg-black/40 transition-colors">
                <div className="flex items-center space-x-4">
                  <span className={`font-bold w-8 text-center text-lg ${index < 3 ? 'text-yellow-300' : 'text-gray-400'}`}>{entry.rank}</span>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center font-bold text-sm">
                    {entry.user.profile.firstName.charAt(0)}{entry.user.profile.lastName.charAt(0)}
                  </div>
                  <span className="font-semibold text-white">{entry.user.profile.firstName} {entry.user.profile.lastName}</span>
                </div>
                <span className="font-bold text-green-400 text-lg">{entry.score} PIVC</span>
              </div>
            ))}
          </div>
          <button onClick={() => fetchMore()} className="w-full mt-6 bg-purple-600 hover:bg-purple-500 px-6 py-3 rounded-lg font-semibold transition-all">
            {loading ? 'Loading...' : 'Load More'}
          </button>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-8">
        {/* Mentors Section */}
        <div className="space-y-4">
          <h3 className="text-2xl font-bold">🤝 Connect with Mentors</h3>
          {mentorsLoading ? (
            <div className="grid grid-cols-1 gap-4">
              {[...Array(3)].map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {mentors.map((mentor) => <MentorCard key={mentor.id} mentor={mentor} />)}
            </div>
          )}
        </div>

        {/* Study Groups Section */}
        <div className="space-y-4">
          <h3 className="text-2xl font-bold">📚 Join a Study Group</h3>
          {studyGroupsLoading ? (
            <div className="grid grid-cols-1 gap-4">
              {[...Array(2)].map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {studyGroups.map((group) => <StudyGroupCard key={group.id} group={group} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const LeaderboardSkeleton = () => (
  <div className="bg-gradient-to-br from-purple-900/50 to-blue-900/50 rounded-2xl p-6 border border-purple-500/20 animate-pulse">
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center justify-between bg-black/20 p-3 rounded-lg">
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 bg-gray-700/50 rounded-full"></div>
            <div className="w-32 h-6 bg-gray-700/50 rounded"></div>
          </div>
          <div className="w-24 h-6 bg-gray-700/50 rounded"></div>
        </div>
      ))}
    </div>
    <div className="w-full mt-6 h-12 bg-gray-700/50 rounded-lg"></div>
  </div>
);

const SkeletonCard = () => (
  <div className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 rounded-2xl p-6 border border-purple-500/20 animate-pulse">
    <div className="h-8 bg-gray-700/50 rounded w-3/4 mb-4"></div>
    <div className="h-4 bg-gray-700/50 rounded w-full mb-2"></div>
    <div className="h-4 bg-gray-700/50 rounded w-5/6 mb-6"></div>
    <div className="h-10 bg-gray-700/50 rounded w-full"></div>
  </div>
);

// ============================================================================
// COMPONENT LIBRARY
// ============================================================================

function StatCard({ icon, label, value, color, premium }: any) {
  const colors = {
    green: 'from-green-600 to-emerald-600',
    blue: 'from-blue-600 to-cyan-600',
    purple: 'from-purple-600 to-pink-600',
    yellow: 'from-yellow-600 to-amber-600',
  };

  return (
    <div className={`relative bg-gradient-to-br ${colors[color as keyof typeof colors]} rounded-xl p-4`}>
      {premium && (
        <div className="absolute -top-2 -right-2">
          <PremiumBadge variant="gold" size="sm" />
        </div>
      )}
      <div className="flex items-center space-x-2 mb-2">{icon}</div>
      <div className="text-3xl font-bold">{value}</div>
      <div className="text-sm opacity-90">{label}</div>
    </div>
  );
}

function OpportunityCard({ title, payment, difficulty, time, skills }: any) {
  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 border border-purple-500/20 hover:border-purple-500/50 transition-all hover:scale-105">
      <h4 className="font-bold mb-2">{title}</h4>
      <div className="text-2xl font-bold text-green-400 mb-3">{payment}</div>
      <div className="space-y-2 text-sm text-gray-400 mb-4">
        <div>📊 {difficulty}</div>
        <div>⏱️ {time}</div>
      </div>
      <div className="flex flex-wrap gap-2 mb-4">
        {skills.map((skill: string) => (
          <span key={skill} className="bg-purple-600/30 px-2 py-1 rounded text-xs">
            {skill}
          </span>
        ))}
      </div>
      <button className="w-full bg-green-600 hover:bg-green-500 py-2 rounded-lg font-semibold">
        Apply Now
      </button>
    </div>
  );
}

function ProjectCard() {
  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 border border-green-500/20 hover:border-green-500/50 transition-all">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h4 className="font-bold text-lg mb-1">Build E-Commerce Dashboard</h4>
          <p className="text-sm text-gray-400">React + Node.js backend needed</p>
        </div>
        <div className="text-2xl font-bold text-green-400">$450</div>
      </div>
      <div className="flex items-center space-x-4 text-sm text-gray-400 mb-4">
        <span>⏱️ 5-7 days</span>
        <span>📊 Intermediate</span>
        <span>⭐ 4.8 client rating</span>
      </div>
      <div className="flex space-x-2">
        <button className="flex-1 bg-green-600 hover:bg-green-500 py-2 rounded-lg font-semibold">
          Apply
        </button>
        <button className="px-4 bg-gray-700 hover:bg-gray-600 rounded-lg">
          Details
        </button>
      </div>
    </div>
  );
}

function PortfolioProject() {
  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl overflow-hidden border border-purple-500/20 hover:border-purple-500/50 transition-all hover:scale-105">
      <div className="h-40 bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center">
        <Code2 className="w-16 h-16 opacity-50" />
      </div>
      <div className="p-4">
        <h4 className="font-bold mb-2">E-Commerce Platform</h4>
        <p className="text-sm text-gray-400 mb-3">Full-stack web application with payment integration</p>
        <div className="flex items-center justify-between">
          <span className="text-sm text-green-400">Earned: $450</span>
          <button className="bg-purple-600 hover:bg-purple-500 px-3 py-1 rounded text-sm">
            View Live
          </button>
        </div>
      </div>
    </div>
  );
}
