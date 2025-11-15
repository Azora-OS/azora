import { AppShell, Header, Sidebar, SidebarSection, SidebarItem } from '../components/layout'
import { Button } from '../button'
import { UbuntuBadge } from '../components/azora'
import { StatsCard, FeatureCard, GradientText } from '../components/ui'
import { 
  Home, 
  BookOpen, 
  DollarSign, 
  ShoppingBag, 
  Settings,
  Bell,
  User
} from 'lucide-react'

/**
 * Layout Example - Demonstrates AppShell, Header, and Sidebar usage
 */
export function LayoutExample() {
  return (
    <AppShell
      gemTheme="ubuntu"
      header={
        <Header
          title="Azora Education"
          actions={
            <>
              <Button variant="ghost" size="icon">
                <Bell className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <User className="w-5 h-5" />
              </Button>
              <Button variant="emerald">Get Started</Button>
            </>
          }
          navigation={
            <>
              <a href="#" className="text-sm font-medium hover:text-primary">Dashboard</a>
              <a href="#" className="text-sm font-medium hover:text-primary">Courses</a>
              <a href="#" className="text-sm font-medium hover:text-primary">Progress</a>
              <a href="#" className="text-sm font-medium hover:text-primary">Community</a>
            </>
          }
        />
      }
      sidebar={
        <Sidebar variant="glass">
          <div className="mb-4">
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
              label="Education"
            />
            <SidebarItem 
              icon={<DollarSign className="w-4 h-4" />}
              label="Finance"
            />
            <SidebarItem 
              icon={<ShoppingBag className="w-4 h-4" />}
              label="Marketplace"
            />
          </SidebarSection>
          
          <SidebarSection title="Settings">
            <SidebarItem 
              icon={<Settings className="w-4 h-4" />}
              label="Preferences"
            />
          </SidebarSection>
        </Sidebar>
      }
    >
      <div className="space-y-8">
        {/* Page Header */}
        <div className="space-y-2">
          <GradientText variant="ubuntu" as="h1" className="text-4xl font-bold">
            Welcome to Azora Education
          </GradientText>
          <p className="text-muted-foreground text-lg">
            World-class education powered by Constitutional AI
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Active Students"
            value="1,250+"
            trend="up"
            trendValue="+12%"
            description="vs last month"
            gem="emerald"
            icon={<BookOpen className="w-5 h-5" />}
          />
          <StatsCard
            title="Courses"
            value="450+"
            trend="up"
            trendValue="+8%"
            description="new this month"
            gem="sapphire"
            icon={<BookOpen className="w-5 h-5" />}
          />
          <StatsCard
            title="Success Rate"
            value="94%"
            trend="up"
            trendValue="+2%"
            description="completion rate"
            gem="emerald"
            icon={<BookOpen className="w-5 h-5" />}
          />
          <StatsCard
            title="Revenue"
            value="$125K"
            trend="up"
            trendValue="+15%"
            description="this quarter"
            gem="ruby"
            icon={<DollarSign className="w-5 h-5" />}
          />
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FeatureCard
            title="AI-Powered Learning"
            description="Personalized education paths powered by Constitutional AI"
            gem="sapphire"
          >
            <Button variant="sapphire" className="w-full">
              Explore AI Features
            </Button>
          </FeatureCard>

          <FeatureCard
            title="World-Class Curriculum"
            description="Department of Education compliant courses for all levels"
            gem="emerald"
          >
            <Button variant="emerald" className="w-full">
              Browse Courses
            </Button>
          </FeatureCard>

          <FeatureCard
            title="Earn While Learning"
            description="Get rewarded for your educational achievements"
            gem="ruby"
          >
            <Button variant="ruby" className="w-full">
              View Rewards
            </Button>
          </FeatureCard>
        </div>
      </div>
    </AppShell>
  )
}