import { useState } from 'react'
import { AppShell, Header, Sidebar, SidebarSection, SidebarItem } from '../components/layout'
import { Button, Badge, ThemeToggle, UbuntuBadge } from '../index'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../card'
import { StatsCard, FeatureCard, GradientText, GlassCard } from '../components/ui'
import { AzoraLogo, GemIcon } from '../components/azora'
import { 
  Home, 
  BookOpen, 
  DollarSign, 
  ShoppingBag, 
  TrendingUp,
  Users,
  Award,
  Sparkles
} from 'lucide-react'

/**
 * MigratedApp - Complete example of a migrated application
 * Shows before/after comparison and best practices
 */
export function MigratedApp() {
  const [activeTab, setActiveTab] = useState<'education' | 'finance' | 'marketplace'>('education')

  return (
    <div className="theme-education">
      <div className="app-themed">
        <AppShell
          gemTheme="emerald"
          header={
            <Header
              title="Azora Education"
              logo
              actions={
                <>
                  <ThemeToggle />
                  <Button variant="emerald">Enroll Now</Button>
                </>
              }
              navigation={
                <>
                  <button
                    onClick={() => setActiveTab('education')}
                    className={`text-sm font-medium transition-colors ${
                      activeTab === 'education' ? 'text-emerald' : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Education
                  </button>
                  <button
                    onClick={() => setActiveTab('finance')}
                    className={`text-sm font-medium transition-colors ${
                      activeTab === 'finance' ? 'text-ruby' : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Finance
                  </button>
                  <button
                    onClick={() => setActiveTab('marketplace')}
                    className={`text-sm font-medium transition-colors ${
                      activeTab === 'marketplace' ? 'text-sapphire' : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Marketplace
                  </button>
                </>
              }
            />
          }
          sidebar={
            <Sidebar variant="glass">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <AzoraLogo className="w-8 h-8" />
                  <UbuntuBadge>I am because we are</UbuntuBadge>
                </div>
                
                <SidebarSection title="Main">
                  <SidebarItem
                    icon={<Home className="w-4 h-4" />}
                    label="Dashboard"
                    active
                  />
                  <SidebarItem
                    icon={<BookOpen className="w-4 h-4" />}
                    label="My Courses"
                  />
                  <SidebarItem
                    icon={<Award className="w-4 h-4" />}
                    label="Achievements"
                  />
                </SidebarSection>
                
                <SidebarSection title="Community">
                  <SidebarItem
                    icon={<Users className="w-4 h-4" />}
                    label="Study Groups"
                  />
                  <SidebarItem
                    icon={<Sparkles className="w-4 h-4" />}
                    label="AI Tutor"
                  />
                </SidebarSection>
              </div>
            </Sidebar>
          }
        >
          <div className="space-y-8">
            {/* Hero Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <GemIcon gem="emerald" glow className="w-12 h-12" />
                <div>
                  <GradientText variant="emerald" as="h1" className="text-4xl font-bold">
                    Welcome Back, Student!
                  </GradientText>
                  <p className="text-muted-foreground text-lg">
                    Continue your learning journey with Constitutional AI
                  </p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <Badge variant="emerald">Active Learner</Badge>
                <Badge variant="sapphire">AI-Powered</Badge>
                <Badge variant="ubuntu">Ubuntu Community</Badge>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatsCard
                title="Courses Completed"
                value="12"
                trend="up"
                trendValue="+3 this month"
                description="Keep learning!"
                gem="emerald"
                icon={<BookOpen className="w-5 h-5" />}
              />
              <StatsCard
                title="Study Hours"
                value="156"
                trend="up"
                trendValue="+24 hrs"
                description="this week"
                gem="sapphire"
                icon={<TrendingUp className="w-5 h-5" />}
              />
              <StatsCard
                title="Achievements"
                value="28"
                trend="up"
                trendValue="+5 new"
                description="badges earned"
                icon={<Award className="w-5 h-5" />}
              />
              <StatsCard
                title="Rewards Earned"
                value="$450"
                trend="up"
                trendValue="+$120"
                description="this month"
                gem="ruby"
                icon={<DollarSign className="w-5 h-5" />}
              />
            </div>

            {/* Active Courses */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold">Active Courses</h2>
                <Button variant="outline">View All</Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <GlassCard gem="emerald" hover>
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="p-2 rounded-lg bg-gradient-emerald">
                        <BookOpen className="w-6 h-6 text-emerald" />
                      </div>
                      <Badge variant="emerald">75% Complete</Badge>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">Mathematics 101</h3>
                      <p className="text-sm text-muted-foreground">
                        Advanced calculus and algebra
                      </p>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-emerald h-2 rounded-full" style={{ width: '75%' }} />
                    </div>
                    <Button variant="emerald" className="w-full">
                      Continue Learning
                    </Button>
                  </div>
                </GlassCard>

                <GlassCard gem="sapphire" hover>
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="p-2 rounded-lg bg-gradient-sapphire">
                        <Sparkles className="w-6 h-6 text-sapphire" />
                      </div>
                      <Badge variant="sapphire">AI-Enhanced</Badge>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">Computer Science</h3>
                      <p className="text-sm text-muted-foreground">
                        Programming with AI assistance
                      </p>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-sapphire h-2 rounded-full" style={{ width: '45%' }} />
                    </div>
                    <Button variant="sapphire" className="w-full">
                      Continue Learning
                    </Button>
                  </div>
                </GlassCard>

                <GlassCard gem="default" hover>
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="p-2 rounded-lg bg-muted">
                        <Users className="w-6 h-6" />
                      </div>
                      <Badge variant="outline">New</Badge>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">Ubuntu Philosophy</h3>
                      <p className="text-sm text-muted-foreground">
                        Community and collective growth
                      </p>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full" style={{ width: '10%' }} />
                    </div>
                    <Button variant="outline" className="w-full">
                      Start Course
                    </Button>
                  </div>
                </GlassCard>
              </div>
            </div>

            {/* Features */}
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">Why Azora Education?</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FeatureCard
                  title="AI-Powered Learning"
                  description="Get personalized learning paths powered by Constitutional AI that adapts to your pace and style."
                  gem="sapphire"
                />
                
                <FeatureCard
                  title="Earn While Learning"
                  description="Receive rewards for your achievements and contribute to the Ubuntu community."
                  gem="ruby"
                />
                
                <FeatureCard
                  title="World-Class Content"
                  description="Access Department of Education compliant courses designed by expert educators."
                  gem="emerald"
                />
              </div>
            </div>

            {/* Call to Action */}
            <Card effect="premium" className="p-8">
              <div className="text-center space-y-4">
                <GradientText variant="ubuntu" as="h2" className="text-3xl font-bold">
                  Ready to Level Up?
                </GradientText>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Join thousands of students learning with Constitutional AI. 
                  Experience the Ubuntu philosophy in education.
                </p>
                <div className="flex gap-4 justify-center">
                  <Button variant="emerald" size="lg">
                    <BookOpen className="w-5 h-5 mr-2" />
                    Browse Courses
                  </Button>
                  <Button variant="outline" size="lg">
                    Learn More
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </AppShell>
      </div>
    </div>
  )
}