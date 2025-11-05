/*
AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

CREATIVE EARNING HUB
Mint, Sell, Earn - Transform Your Work into Multiple Income Streams

"Give, and it will be given to you. Good measure, pressed down, shaken together, running over." - Luke 6:38
*/

'use client';

import React, { useState } from 'react';
import {
  DollarSign,
  Coins,
  Zap,
  TrendingUp,
  Package,
  Award,
  Sparkles,
  FileCode,
  Palette,
  BookOpen,
  Database,
  Music,
  ImageIcon,
  Rocket,
  Users,
  Target,
  Gift,
  Crown,
} from 'lucide-react';
import { PremiumBadge, PremiumCourseBadge } from '@/components/education/PremiumBadge';

export default function CreativeEarningHub() {
  const [activeTab, setActiveTab] = useState<'overview' | 'mint' | 'marketplace' | 'tokens' | 'passive' | 'quests'>('overview');
  const [tokens, setTokens] = useState(2847);
  const [monthlyPassive, setMonthlyPassive] = useState(437);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-950 via-blue-950 to-indigo-950 text-white">
      {/* Header */}
      <header className="border-b border-purple-500/30 backdrop-blur-md bg-black/20">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-yellow-500 to-amber-500 flex items-center justify-center">
                <DollarSign className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-amber-400 bg-clip-text text-transparent">
                  Creative Earning Hub
                </h1>
                <p className="text-purple-300">Mint. Sell. Earn More. 💎</p>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="hidden md:grid grid-cols-3 gap-4">
              <QuickStat icon={<Coins className="w-5 h-5" />} label="$LEARN Tokens" value={tokens.toLocaleString()} color="yellow" />
              <QuickStat icon={<TrendingUp className="w-5 h-5" />} label="Total Earned" value="$3,847" color="green" />
              <QuickStat icon={<Zap className="w-5 h-5" />} label="Passive/Month" value={`$${monthlyPassive}`} color="purple" premium />
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex space-x-2 mt-6 overflow-x-auto">
            {[
              { id: 'overview', label: 'Overview', icon: Target },
              { id: 'mint', label: 'Mint NFTs', icon: Sparkles },
              { id: 'marketplace', label: 'Marketplace', icon: Package },
              { id: 'tokens', label: 'Tokens', icon: Coins },
              { id: 'passive', label: 'Passive Income', icon: Rocket },
              { id: 'quests', label: 'Quests', icon: Award },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={`px-6 py-3 rounded-lg flex items-center space-x-2 transition-all whitespace-nowrap ${
                  activeTab === id
                    ? 'bg-purple-600 shadow-lg scale-105'
                    : 'bg-purple-900/30 hover:bg-purple-800/50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="font-semibold text-sm">{label}</span>
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {activeTab === 'overview' && <OverviewView tokens={tokens} passive={monthlyPassive} />}
        {activeTab === 'mint' && <MintView />}
        {activeTab === 'marketplace' && <MarketplaceView />}
        {activeTab === 'tokens' && <TokensView tokens={tokens} />}
        {activeTab === 'passive' && <PassiveIncomeView />}
        {activeTab === 'quests' && <QuestsView setTokens={setTokens} />}
      </main>
    </div>
  );
}

// ============================================================================
// VIEWS
// ============================================================================

function OverviewView({ tokens, passive }: { tokens: number; passive: number }) {
  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-yellow-900/30 to-amber-900/30 rounded-3xl p-8 border border-yellow-500/30">
        <h2 className="text-3xl font-bold mb-4">💰 Multiple Income Streams Unlocked!</h2>
        <p className="text-xl text-yellow-100 mb-6">
          Transform your work into valuable assets. Mint NFTs, sell digital products, earn tokens, and build passive income!
        </p>
        
        {/* Income Breakdown */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <IncomeCard label="Active Earnings" value="$2,150" subtitle="This Month" color="green" />
          <IncomeCard label="Passive Income" value={`$${passive}`} subtitle="Monthly" color="purple" />
          <IncomeCard label="NFT Royalties" value="$87" subtitle="Ongoing" color="blue" />
          <IncomeCard label="Token Value" value={`$${(tokens * 0.10).toFixed(0)}`} subtitle={`${tokens} $LEARN`} color="yellow" />
        </div>
      </div>

      {/* Earning Strategies */}
      <div>
        <h3 className="text-2xl font-bold mb-6">🚀 Your Active Income Streams</h3>
        <div className="grid md:grid-cols-3 gap-6">
          <StrategyCard
            icon={<Sparkles className="w-8 h-8" />}
            title="NFT Minting"
            description="3 projects minted, 12 sales"
            earning="$847"
            color="from-purple-600 to-pink-600"
          />
          <StrategyCard
            icon={<Package className="w-8 h-8" />}
            title="Digital Products"
            description="5 templates selling"
            earning="$1,203"
            color="from-blue-600 to-cyan-600"
          />
          <StrategyCard
            icon={<Coins className="w-8 h-8" />}
            title="Token Rewards"
            description={`${tokens} tokens earned`}
            earning={`$${(tokens * 0.10).toFixed(0)}`}
            color="from-yellow-600 to-amber-600"
          />
        </div>
      </div>

      {/* Growth Chart */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 border border-purple-500/20">
        <h3 className="text-2xl font-bold mb-6">📈 Earning Growth Trajectory</h3>
        <div className="space-y-4">
          <GrowthBar month="Month 1" amount={260} max={6000} />
          <GrowthBar month="Month 3" amount={850} max={6000} />
          <GrowthBar month="Month 6" amount={1575} max={6000} />
          <GrowthBar month="Month 12" amount={5750} max={6000} highlight />
        </div>
        <p className="text-sm text-gray-400 mt-4">
          💡 Projected earnings based on current activity and market trends
        </p>
      </div>

      {/* Next Actions */}
      <div>
        <h3 className="text-2xl font-bold mb-6">🎯 Maximize Your Earnings</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <ActionCard
            icon={<Sparkles className="w-6 h-6" />}
            title="Mint Your Latest Project"
            description="Turn your e-commerce app into an NFT"
            potential="+$200-500"
            cta="Mint Now"
          />
          <ActionCard
            icon={<BookOpen className="w-6 h-6" />}
            title="Create Tutorial Course"
            description="Teach others what you learned"
            potential="+$300-1000/month"
            cta="Start Creating"
          />
          <ActionCard
            icon={<Rocket className="w-6 h-6" />}
            title="Build API Service"
            description="Turn your code into a service"
            potential="+$500-2000/month"
            cta="Build Service"
          />
          <ActionCard
            icon={<Award className="w-6 h-6" />}
            title="Complete Daily Quest"
            description="Earn bonus tokens today!"
            potential="+200 $LEARN"
            cta="View Quests"
          />
        </div>
      </div>
    </div>
  );
}

function MintView() {
  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-4xl font-bold mb-4">💎 NFT Minting Center</h2>
        <p className="text-xl text-purple-300">
          Transform your projects into valuable NFTs. Earn from sales + lifetime royalties!
        </p>
      </div>

      {/* Mintable Projects */}
      <div>
        <h3 className="text-2xl font-bold mb-6">✨ Ready to Mint</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <MintableProject
            icon={<FileCode className="w-12 h-12" />}
            title="E-Commerce Platform Template"
            type="Code Project"
            description="Full-stack Next.js e-commerce with Stripe integration"
            potential="$200-500"
            quality="🟢 Excellent (95%)"
          />
          <MintableProject
            icon={<Palette className="w-12 h-12" />}
            title="UI Component Library"
            type="Design System"
            description="50+ React components with Tailwind CSS"
            potential="$100-300"
            quality="🟢 Excellent (92%)"
          />
          <MintableProject
            icon={<Database className="w-12 h-12" />}
            title="Analytics Dashboard"
            type="Data Visualization"
            description="Real-time analytics with Chart.js"
            potential="$150-400"
            quality="🟡 Good (85%)"
          />
          <MintableProject
            icon={<Music className="w-12 h-12" />}
            title="Background Music Pack"
            type="Audio Assets"
            description="10 royalty-free ambient tracks"
            potential="$50-150"
            quality="🟢 Excellent (90%)"
          />
        </div>
      </div>

      {/* Minting Process */}
      <div className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 rounded-2xl p-8 border border-purple-500/20">
        <h3 className="text-2xl font-bold mb-6">🎨 How NFT Minting Works</h3>
        <div className="grid md:grid-cols-4 gap-6">
          <ProcessStep number="1" title="Select Project" description="Choose completed work to mint" />
          <ProcessStep number="2" title="Add Metadata" description="Title, description, preview" />
          <ProcessStep number="3" title="Set Price & Editions" description="1/1, 1/10, or unlimited" />
          <ProcessStep number="4" title="Mint & List" description="On-chain + marketplace" />
        </div>
        
        <div className="mt-6 bg-blue-900/30 rounded-xl p-4">
          <p className="text-blue-200 text-sm">
            💡 <strong>Earnings:</strong> Initial sale price + 10% royalty on all future resales = passive income forever!
          </p>
        </div>
      </div>

      {/* Your NFT Collection */}
      <div>
        <h3 className="text-2xl font-bold mb-6">🖼️ Your Minted NFTs</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3].map((i) => (
            <NFTCard key={i} />
          ))}
          <button className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 border-2 border-dashed border-purple-500/30 rounded-xl p-8 flex flex-col items-center justify-center hover:border-purple-500/50 transition-all">
            <Sparkles className="w-12 h-12 text-purple-400 mb-2" />
            <span className="font-semibold">Mint New NFT</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function MarketplaceView() {
  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-4xl font-bold mb-4">🏪 Creative Assets Marketplace</h2>
        <p className="text-xl text-purple-300">
          Sell templates, components, courses, and more. Build once, sell forever!
        </p>
      </div>

      {/* Product Categories */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <CategoryCard icon={<FileCode className="w-6 h-6" />} label="Code Templates" count={12} />
        <CategoryCard icon={<Palette className="w-6 h-6" />} label="UI Components" count={8} />
        <CategoryCard icon={<BookOpen className="w-6 h-6" />} label="Courses" count={3} />
        <CategoryCard icon={<ImageIcon className="w-6 h-6" />} label="Design Assets" count={15} />
        <CategoryCard icon={<Database className="w-6 h-6" />} label="Data Products" count={5} />
        <CategoryCard icon={<Music className="w-6 h-6" />} label="Audio" count={4} />
      </div>

      {/* Your Products */}
      <div>
        <h3 className="text-2xl font-bold mb-6">📦 Your Products</h3>
        <div className="grid md:grid-cols-3 gap-6">
          <ProductCard
            title="Next.js SaaS Starter"
            category="Code Template"
            price="$99"
            sales={23}
            revenue="$2,277"
            rating={4.8}
          />
          <ProductCard
            title="React Component Library"
            category="UI Components"
            price="$49"
            sales={47}
            revenue="$2,303"
            rating={4.9}
          />
          <ProductCard
            title="Full Stack Course"
            category="Educational"
            price="$199"
            sales={12}
            revenue="$2,388"
            rating={5.0}
          />
        </div>
      </div>

      {/* Upload New Product */}
      <div className="bg-gradient-to-r from-green-900/30 to-emerald-900/30 rounded-2xl p-8 border border-green-500/30">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold mb-2">🚀 List New Product</h3>
            <p className="text-green-200">
              Upload your creation and start earning passive income today!
            </p>
          </div>
          <button className="bg-green-600 hover:bg-green-500 px-8 py-4 rounded-xl font-bold text-lg">
            Upload Product
          </button>
        </div>
      </div>
    </div>
  );
}

function TokensView({ tokens }: { tokens: number }) {
  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-yellow-900/30 to-amber-900/30 rounded-3xl p-8 border border-yellow-500/30">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-4xl font-bold mb-2">🪙 $LEARN Token Dashboard</h2>
            <p className="text-xl text-yellow-200">
              Earn tokens for everything you do. Trade for cash or platform perks!
            </p>
          </div>
          <div className="text-right">
            <div className="text-5xl font-bold text-yellow-400">{tokens.toLocaleString()}</div>
            <div className="text-sm text-yellow-300">$LEARN Tokens</div>
            <div className="text-lg text-yellow-200">${(tokens * 0.10).toFixed(2)} USD</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-3 gap-4">
          <button className="bg-green-600 hover:bg-green-500 px-6 py-3 rounded-lg font-semibold">
            💵 Convert to Cash
          </button>
          <button className="bg-purple-600 hover:bg-purple-500 px-6 py-3 rounded-lg font-semibold">
            🎁 Unlock Premium
          </button>
          <button className="bg-blue-600 hover:bg-blue-500 px-6 py-3 rounded-lg font-semibold">
            📊 Stake for Rewards
          </button>
        </div>
      </div>

      {/* Earning Methods */}
      <div>
        <h3 className="text-2xl font-bold mb-6">💰 How to Earn More Tokens</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <TokenEarningMethod icon={<BookOpen />} activity="Complete Lessons" reward="10 tokens each" />
          <TokenEarningMethod icon={<FileCode />} activity="Build Projects" reward="100-1000 tokens" />
          <TokenEarningMethod icon={<Users />} activity="Help Students" reward="20 tokens each" />
          <TokenEarningMethod icon={<BookOpen />} activity="Create Tutorial" reward="100 tokens" />
          <TokenEarningMethod icon={<Award />} activity="Daily Streak" reward="5 tokens/day" />
          <TokenEarningMethod icon={<Crown />} activity="Top Leaderboard" reward="5000 tokens" />
        </div>
      </div>

      {/* Earning History */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 border border-purple-500/20">
        <h3 className="text-xl font-bold mb-4">📊 Recent Earnings</h3>
        <div className="space-y-3">
          <EarningHistoryItem activity="Completed Python Course" tokens={100} time="2 hours ago" />
          <EarningHistoryItem activity="Built E-Commerce Project" tokens={500} time="1 day ago" />
          <EarningHistoryItem activity="Helped 3 Students" tokens={60} time="1 day ago" />
          <EarningHistoryItem activity="7-Day Streak Bonus" tokens={35} time="Today" />
          <EarningHistoryItem activity="Created Tutorial" tokens={100} time="2 days ago" />
        </div>
      </div>
    </div>
  );
}

function PassiveIncomeView() {
  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-4xl font-bold mb-4">🚀 Passive Income Streams</h2>
        <p className="text-xl text-purple-300">
          Build it once, earn forever. Your work continues paying you!
        </p>
      </div>

      {/* Monthly Passive Income */}
      <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-3xl p-8 border border-purple-500/30">
        <div className="text-center mb-6">
          <div className="text-6xl font-bold text-purple-300 mb-2">$437</div>
          <div className="text-xl text-purple-400">Monthly Passive Income</div>
          <div className="text-sm text-purple-500">Without doing any new work!</div>
        </div>

        {/* Breakdown */}
        <div className="grid md:grid-cols-4 gap-4">
          <PassiveStream source="Template Sales" amount="$180" />
          <PassiveStream source="NFT Royalties" amount="$87" />
          <PassiveStream source="Course Subscriptions" amount="$120" />
          <PassiveStream source="API Service" amount="$50" />
        </div>
      </div>

      {/* Setup New Passive Income */}
      <div>
        <h3 className="text-2xl font-bold mb-6">🎯 Build New Passive Income</h3>
        <div className="grid md:grid-cols-3 gap-6">
          <PassiveOpportunity
            icon={<Package />}
            title="Template Licensing"
            description="Create reusable templates"
            potential="$200-800/month"
            difficulty="Medium"
            time="2 weeks"
          />
          <PassiveOpportunity
            icon={<Rocket />}
            title="API-as-a-Service"
            description="Build useful API service"
            potential="$500-3000/month"
            difficulty="Advanced"
            time="1 month"
          />
          <PassiveOpportunity
            icon={<BookOpen />}
            title="Subscription Newsletter"
            description="Premium content series"
            potential="$300-2000/month"
            difficulty="Easy"
            time="Ongoing"
          />
        </div>
      </div>

      {/* Compound Growth Projection */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 border border-green-500/20">
        <h3 className="text-2xl font-bold mb-6">📈 Passive Income Growth Projection</h3>
        <div className="space-y-4">
          <ProjectionBar month="Month 3" amount={150} />
          <ProjectionBar month="Month 6" amount={437} highlight />
          <ProjectionBar month="Month 12" amount={1200} />
          <ProjectionBar month="Month 24" amount={3500} />
        </div>
        <p className="text-sm text-gray-400 mt-4">
          💡 As you add more passive income streams, your monthly earnings compound!
        </p>
      </div>
    </div>
  );
}

function QuestsView({ setTokens }: { setTokens: (fn: (prev: number) => number) => void }) {
  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-4xl font-bold mb-4">🎮 Daily Quests & Challenges</h2>
        <p className="text-xl text-purple-300">
          Complete quests to earn bonus tokens and unlock achievements!
        </p>
      </div>

      {/* Daily Quests */}
      <div>
        <h3 className="text-2xl font-bold mb-6">⚡ Daily Quests (Resets in 8h 23m)</h3>
        <div className="grid md:grid-cols-3 gap-6">
          <QuestCard
            difficulty="Easy"
            title="Morning Learner"
            description="Complete 1 lesson"
            reward="10 tokens"
            progress={0}
            total={1}
            setTokens={setTokens}
          />
          <QuestCard
            difficulty="Medium"
            title="Community Helper"
            description="Help 3 students"
            reward="50 tokens"
            progress={1}
            total={3}
            setTokens={setTokens}
          />
          <QuestCard
            difficulty="Hard"
            title="Project Builder"
            description="Build & deploy mini-project"
            reward="200 tokens"
            progress={0}
            total={1}
            setTokens={setTokens}
          />
        </div>
      </div>

      {/* Weekly Missions */}
      <div>
        <h3 className="text-2xl font-bold mb-6">🔥 Weekly Missions (Resets in 4 days)</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <MissionCard
            title="Client Project Champion"
            description="Complete a full client project"
            reward="500 tokens + Featured Showcase"
            progress={65}
            daysLeft={4}
          />
          <MissionCard
            title="Knowledge Sharer"
            description="Create 1 tutorial or course"
            reward="300 tokens + Creator Badge"
            progress={40}
            daysLeft={4}
          />
        </div>
      </div>

      {/* Achievement Gallery */}
      <div>
        <h3 className="text-2xl font-bold mb-6">🏆 Achievement NFT Badges</h3>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <AchievementBadge icon="🎓" title="First Lesson" earned={true} />
          <AchievementBadge icon="💰" title="First $1" earned={true} />
          <AchievementBadge icon="🔥" title="7-Day Streak" earned={true} />
          <AchievementBadge icon="🚀" title="First Project" earned={true} />
          <AchievementBadge icon="👥" title="Helper" earned={true} />
          <AchievementBadge icon="💎" title="First NFT" earned={false} />
          <AchievementBadge icon="📚" title="Course Creator" earned={false} />
          <AchievementBadge icon="🌟" title="Top 100" earned={false} />
        </div>
      </div>

      {/* Leaderboard Preview */}
      <div className="bg-gradient-to-r from-yellow-900/30 to-amber-900/30 rounded-2xl p-6 border border-yellow-500/30">
        <h3 className="text-2xl font-bold mb-4">👑 Monthly Leaderboard</h3>
        <div className="space-y-3">
          <LeaderboardEntry rank={1} name="Alex K." tokens={15847} prize="$500 + Champion NFT" />
          <LeaderboardEntry rank={2} name="Sarah M." tokens={12403} prize="$200 + Elite NFT" />
          <LeaderboardEntry rank={3} name="David L." tokens={10982} prize="$200 + Elite NFT" />
          <LeaderboardEntry rank={47} name="You" tokens={2847} prize="Keep climbing!" highlight />
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// COMPONENTS
// ============================================================================

function QuickStat({ icon, label, value, color, premium }: any) {
  const colors = {
    yellow: 'from-yellow-600 to-amber-600',
    green: 'from-green-600 to-emerald-600',
    purple: 'from-purple-600 to-pink-600',
  };

  return (
    <div className={`relative bg-gradient-to-br ${colors[color as keyof typeof colors]} rounded-xl p-4`}>
      {premium && (
        <div className="absolute -top-2 -right-2">
          <PremiumBadge variant="gold" size="sm" />
        </div>
      )}
      <div className="flex items-center space-x-2 mb-1">{icon}</div>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs opacity-90">{label}</div>
    </div>
  );
}

function IncomeCard({ label, value, subtitle, color }: any) {
  const colors = {
    green: 'from-green-900/50 to-emerald-900/50 border-green-500/30',
    purple: 'from-purple-900/50 to-pink-900/50 border-purple-500/30',
    blue: 'from-blue-900/50 to-cyan-900/50 border-blue-500/30',
    yellow: 'from-yellow-900/50 to-amber-900/50 border-yellow-500/30',
  };

  return (
    <div className={`bg-gradient-to-br ${colors[color as keyof typeof colors]} border rounded-xl p-4`}>
      <div className="text-sm opacity-75 mb-1">{label}</div>
      <div className="text-3xl font-bold mb-1">{value}</div>
      <div className="text-xs opacity-60">{subtitle}</div>
    </div>
  );
}

function StrategyCard({ icon, title, description, earning, color }: any) {
  return (
    <div className={`bg-gradient-to-br ${color} rounded-2xl p-6`}>
      <div className="mb-4">{icon}</div>
      <h4 className="text-xl font-bold mb-2">{title}</h4>
      <p className="text-sm opacity-90 mb-4">{description}</p>
      <div className="text-3xl font-bold">{earning}</div>
    </div>
  );
}

function GrowthBar({ month, amount, max, highlight }: any) {
  const percentage = (amount / max) * 100;
  
  return (
    <div>
      <div className="flex justify-between mb-2">
        <span className={highlight ? 'font-bold text-green-400' : ''}>{month}</span>
        <span className={highlight ? 'font-bold text-green-400' : ''}>${amount}</span>
      </div>
      <div className="bg-gray-800 rounded-full h-3">
        <div 
          className={`h-3 rounded-full ${highlight ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-purple-500'}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

function ActionCard({ icon, title, description, potential, cta }: any) {
  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 border border-purple-500/20 hover:border-purple-500/50 transition-all">
      <div className="flex items-start space-x-4">
        <div className="bg-purple-600 rounded-lg p-3">{icon}</div>
        <div className="flex-1">
          <h4 className="font-bold mb-1">{title}</h4>
          <p className="text-sm text-gray-400 mb-2">{description}</p>
          <div className="text-green-400 font-bold mb-3">{potential}</div>
          <button className="bg-purple-600 hover:bg-purple-500 px-4 py-2 rounded-lg text-sm font-semibold w-full">
            {cta}
          </button>
        </div>
      </div>
    </div>
  );
}

function MintableProject({ icon, title, type, description, potential, quality }: any) {
  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 border border-purple-500/20">
      <div className="flex items-start justify-between mb-4">
        <div className="bg-purple-900/50 rounded-xl p-4">{icon}</div>
        <span className="text-xs bg-green-600 px-3 py-1 rounded-full">{quality}</span>
      </div>
      <div className="text-xs text-purple-400 mb-1">{type}</div>
      <h4 className="font-bold text-lg mb-2">{title}</h4>
      <p className="text-sm text-gray-400 mb-4">{description}</p>
      <div className="flex items-center justify-between">
        <span className="text-green-400 font-bold">{potential}</span>
        <button className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-2 rounded-lg font-semibold">
          Mint NFT
        </button>
      </div>
    </div>
  );
}

function ProcessStep({ number, title, description }: any) {
  return (
    <div className="text-center">
      <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-3">
        {number}
      </div>
      <h4 className="font-bold mb-1">{title}</h4>
      <p className="text-sm text-gray-400">{description}</p>
    </div>
  );
}

function NFTCard() {
  return (
    <div className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 rounded-xl overflow-hidden border border-purple-500/20">
      <div className="h-40 bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center">
        <Sparkles className="w-16 h-16 opacity-50" />
      </div>
      <div className="p-4">
        <h5 className="font-bold mb-1">Project NFT</h5>
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">12 sales</span>
          <span className="text-green-400">$847</span>
        </div>
      </div>
    </div>
  );
}

function CategoryCard({ icon, label, count }: any) {
  return (
    <button className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-4 border border-purple-500/20 hover:border-purple-500/50 transition-all text-center">
      <div className="flex justify-center mb-2">{icon}</div>
      <div className="font-semibold text-sm">{label}</div>
      <div className="text-xs text-gray-400">{count} products</div>
    </button>
  );
}

function ProductCard({ title, category, price, sales, revenue, rating }: any) {
  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 border border-green-500/20">
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="text-xs text-purple-400 mb-1">{category}</div>
          <h4 className="font-bold">{title}</h4>
        </div>
        <div className="flex items-center space-x-1">
          <span className="text-yellow-400">⭐</span>
          <span className="text-sm font-bold">{rating}</span>
        </div>
      </div>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-400">Price:</span>
          <span className="font-bold">{price}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Sales:</span>
          <span className="font-bold">{sales}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Revenue:</span>
          <span className="font-bold text-green-400">{revenue}</span>
        </div>
      </div>
    </div>
  );
}

function TokenEarningMethod({ icon, activity, reward }: any) {
  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-4 border border-yellow-500/20 flex items-center space-x-4">
      <div className="bg-yellow-600 rounded-lg p-3">{icon}</div>
      <div className="flex-1">
        <h5 className="font-semibold">{activity}</h5>
        <p className="text-sm text-yellow-400">{reward}</p>
      </div>
    </div>
  );
}

function EarningHistoryItem({ activity, tokens, time }: any) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-800">
      <div>
        <p className="font-semibold">{activity}</p>
        <p className="text-xs text-gray-500">{time}</p>
      </div>
      <div className="text-green-400 font-bold">+{tokens} tokens</div>
    </div>
  );
}

function PassiveStream({ source, amount }: any) {
  return (
    <div className="bg-black/30 rounded-xl p-4 text-center">
      <div className="text-2xl font-bold text-purple-300 mb-1">{amount}</div>
      <div className="text-xs text-purple-400">{source}</div>
    </div>
  );
}

function PassiveOpportunity({ icon, title, description, potential, difficulty, time }: any) {
  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 border border-purple-500/20">
      <div className="bg-purple-900/50 rounded-xl p-4 mb-4 flex justify-center">
        {React.cloneElement(icon, { className: 'w-12 h-12' })}
      </div>
      <h4 className="font-bold text-lg mb-2">{title}</h4>
      <p className="text-sm text-gray-400 mb-4">{description}</p>
      <div className="space-y-2 text-sm mb-4">
        <div className="flex justify-between">
          <span className="text-gray-500">Potential:</span>
          <span className="text-green-400 font-bold">{potential}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Difficulty:</span>
          <span>{difficulty}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Time:</span>
          <span>{time}</span>
        </div>
      </div>
      <button className="w-full bg-purple-600 hover:bg-purple-500 py-2 rounded-lg font-semibold">
        Get Started
      </button>
    </div>
  );
}

function ProjectionBar({ month, amount, highlight }: any) {
  const max = 4000;
  const percentage = (amount / max) * 100;
  
  return (
    <div>
      <div className="flex justify-between mb-2">
        <span className={highlight ? 'font-bold text-purple-400' : ''}>{month}</span>
        <span className={highlight ? 'font-bold text-purple-400' : ''}>${amount}/month</span>
      </div>
      <div className="bg-gray-800 rounded-full h-3">
        <div 
          className={`h-3 rounded-full ${highlight ? 'bg-gradient-to-r from-purple-500 to-pink-500' : 'bg-purple-700'}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

function QuestCard({ difficulty, title, description, reward, progress, total, setTokens }: any) {
  const colors = {
    Easy: 'from-green-600 to-emerald-600',
    Medium: 'from-yellow-600 to-orange-600',
    Hard: 'from-red-600 to-rose-600',
  };

  const complete = () => {
    const tokenAmount = parseInt(reward);
    setTokens((prev: number) => prev + tokenAmount);
  };

  return (
    <div className={`bg-gradient-to-br ${colors[difficulty as keyof typeof colors]} rounded-xl p-6`}>
      <div className="text-xs font-semibold mb-2 opacity-75">{difficulty}</div>
      <h4 className="font-bold text-lg mb-2">{title}</h4>
      <p className="text-sm opacity-90 mb-4">{description}</p>
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-1">
          <span>Progress</span>
          <span>{progress}/{total}</span>
        </div>
        <div className="bg-black/30 rounded-full h-2">
          <div className="bg-white h-2 rounded-full" style={{ width: `${(progress / total) * 100}%` }} />
        </div>
      </div>
      <div className="flex items-center justify-between">
        <span className="font-bold">{reward}</span>
        <button 
          onClick={complete}
          className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg font-semibold disabled:opacity-50"
          disabled={progress < total}
        >
          {progress >= total ? 'Claim' : 'In Progress'}
        </button>
      </div>
    </div>
  );
}

function MissionCard({ title, description, reward, progress, daysLeft }: any) {
  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 border border-orange-500/30">
      <h4 className="font-bold text-lg mb-2">{title}</h4>
      <p className="text-sm text-gray-400 mb-4">{description}</p>
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-1">
          <span>Progress</span>
          <span>{progress}%</span>
        </div>
        <div className="bg-gray-800 rounded-full h-2">
          <div className="bg-orange-500 h-2 rounded-full" style={{ width: `${progress}%` }} />
        </div>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-orange-400 font-bold">{reward}</span>
        <span className="text-gray-500">{daysLeft} days left</span>
      </div>
    </div>
  );
}

function AchievementBadge({ icon, title, earned }: any) {
  return (
    <div className={`rounded-xl p-4 text-center ${earned ? 'bg-gradient-to-br from-yellow-600 to-amber-600' : 'bg-gray-800 opacity-40'}`}>
      <div className="text-4xl mb-2">{icon}</div>
      <div className="text-xs font-semibold">{title}</div>
    </div>
  );
}

function LeaderboardEntry({ rank, name, tokens, prize, highlight }: any) {
  return (
    <div className={`flex items-center justify-between p-4 rounded-lg ${highlight ? 'bg-purple-900/50 border border-purple-500' : 'bg-black/30'}`}>
      <div className="flex items-center space-x-4">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${rank <= 3 ? 'bg-yellow-600' : 'bg-gray-700'}`}>
          #{rank}
        </div>
        <div>
          <div className="font-bold">{name}</div>
          <div className="text-sm text-gray-400">{tokens.toLocaleString()} tokens</div>
        </div>
      </div>
      <div className="text-sm text-green-400">{prize}</div>
    </div>
  );
}
