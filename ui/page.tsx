import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Bell, Settings, Wallet, Shield, TrendingUp, Users, Globe, ArrowRight, BookOpen, Zap } from "lucide-react"

export default function StudentDashboard() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/30 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo and Title */}
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-foreground">Azora Sapiens University</h1>
              </div>
            </div>

            {/* Student Profile and Actions */}
            <div className="flex items-center gap-4">
              {/* Aegis Health Indicator */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-success/10 border border-success/30">
                <Shield className="h-4 w-4 text-success glow-green" />
                <span className="text-sm font-medium text-success">Aegis Nominal</span>
              </div>

              {/* Quick Actions */}
              <Button variant="ghost" size="icon" className="relative">
                <Wallet className="h-5 w-5 text-primary" />
              </Button>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 h-2 w-2 bg-primary rounded-full glow-cyan" />
              </Button>
              <Button variant="ghost" size="icon">
                <Settings className="h-5 w-5" />
              </Button>

              {/* Student Profile */}
              <div className="flex items-center gap-3 pl-4 border-l border-border">
                <div className="text-right">
                  <p className="text-sm font-medium">Welcome,</p>
                  <p className="text-sm text-primary">Alex Chen</p>
                </div>
                <Avatar className="h-10 w-10 border-2 border-primary/30">
                  <AvatarImage src="/diverse-students-studying.png" />
                  <AvatarFallback className="bg-primary/20 text-primary">AC</AvatarFallback>
                </Avatar>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Dashboard Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - 2/3 width */}
          <div className="lg:col-span-2 space-y-6">
            {/* Ascension Protocol Progress */}
            <Card className="p-6 bg-card/50 backdrop-blur border-border/50">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold mb-1">Ascension Protocol</h2>
                  <p className="text-sm text-muted-foreground">Your journey to mastery</p>
                </div>
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                  Active
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Circular Progress */}
                <div className="flex flex-col items-center justify-center">
                  <div className="relative w-48 h-48">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle
                        cx="96"
                        cy="96"
                        r="88"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        className="text-muted/20"
                      />
                      <circle
                        cx="96"
                        cy="96"
                        r="88"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        strokeDasharray={`${2 * Math.PI * 88}`}
                        strokeDashoffset={`${2 * Math.PI * 88 * (1 - 0.73)}`}
                        className="text-primary glow-cyan transition-all duration-1000"
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-5xl font-bold text-primary text-glow-cyan">73%</span>
                      <span className="text-sm text-muted-foreground mt-1">Complete</span>
                    </div>
                  </div>
                </div>

                {/* Weekly Learning Momentum */}
                <div className="flex flex-col justify-center">
                  <h3 className="text-lg font-semibold mb-4">Weekly Learning Momentum</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Modules Completed</span>
                      <span className="font-semibold text-primary">12</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Hours Invested</span>
                      <span className="font-semibold text-accent">28.5</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Streak</span>
                      <span className="font-semibold text-success">14 days</span>
                    </div>
                    <div className="mt-4 h-20 flex items-end gap-1">
                      {[40, 65, 45, 80, 70, 85, 95].map((height, i) => (
                        <div key={i} className="flex-1 bg-primary/20 rounded-t" style={{ height: `${height}%` }}>
                          <div className="w-full bg-primary rounded-t glow-cyan" style={{ height: "100%" }} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Global Knowledge Network */}
            <Card className="p-6 bg-card/50 backdrop-blur border-border/50">
              <div className="mb-4">
                <h2 className="text-2xl font-bold mb-1">Global Knowledge Network</h2>
                <p className="text-sm text-muted-foreground">Interconnected domains of learning across 195 nations</p>
              </div>

              <div className="relative h-80 bg-secondary/30 rounded-lg overflow-hidden">
                {/* Enhanced Network Visualization */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <Globe className="h-40 w-40 text-primary/20 animate-spin-slow" style={{ animationDuration: "30s" }} />
                </div>

                {/* International Knowledge Hubs */}
                {/* Africa Hub */}
                <div className="absolute top-1/4 left-1/4 transform -translate-x-1/2 -translate-y-1/2">
                  <div className="px-4 py-2 rounded-full bg-primary/20 border-2 border-primary/50 text-xs font-medium text-primary glow-cyan shadow-lg">
                    <div className="flex items-center gap-1">
                      <Globe className="h-3 w-3" />
                      Africa Hub
                    </div>
                    <div className="text-[10px] opacity-80">47 nodes active</div>
                  </div>
                </div>

                {/* Asia-Pacific Hub */}
                <div className="absolute top-1/5 right-1/5 transform translate-x-1/2 -translate-y-1/2">
                  <div className="px-4 py-2 rounded-full bg-accent/20 border-2 border-accent/50 text-xs font-medium text-accent shadow-lg">
                    <div className="flex items-center gap-1">
                      <Globe className="h-3 w-3" />
                      Asia-Pacific
                    </div>
                    <div className="text-[10px] opacity-80">89 nodes active</div>
                  </div>
                </div>

                {/* Europe Hub */}
                <div className="absolute top-1/6 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <div className="px-4 py-2 rounded-full bg-chart-1/20 border-2 border-chart-1/50 text-xs font-medium text-chart-1 shadow-lg">
                    <div className="flex items-center gap-1">
                      <Globe className="h-3 w-3" />
                      Europe Hub
                    </div>
                    <div className="text-[10px] opacity-80">34 nodes active</div>
                  </div>
                </div>

                {/* Americas Hub */}
                <div className="absolute bottom-1/4 left-1/5 transform -translate-x-1/2 translate-y-1/2">
                  <div className="px-4 py-2 rounded-full bg-chart-2/20 border-2 border-chart-2/50 text-xs font-medium text-chart-2 shadow-lg">
                    <div className="flex items-center gap-1">
                      <Globe className="h-3 w-3" />
                      Americas Hub
                    </div>
                    <div className="text-[10px] opacity-80">25 nodes active</div>
                  </div>
                </div>

                {/* Knowledge Exchange Connections */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                  <defs>
                    <linearGradient id="connectionGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="rgb(59, 130, 246)" stopOpacity="0.3" />
                      <stop offset="50%" stopColor="rgb(147, 51, 234)" stopOpacity="0.6" />
                      <stop offset="100%" stopColor="rgb(59, 130, 246)" stopOpacity="0.3" />
                    </linearGradient>
                  </defs>
                  {/* Africa to Asia-Pacific */}
                  <path d="M 120 120 Q 200 100 280 140" stroke="url(#connectionGradient)" strokeWidth="2" fill="none" className="animate-pulse" />
                  {/* Africa to Europe */}
                  <path d="M 120 120 Q 180 80 240 100" stroke="url(#connectionGradient)" strokeWidth="2" fill="none" className="animate-pulse" />
                  {/* Africa to Americas */}
                  <path d="M 120 120 Q 100 160 140 200" stroke="url(#connectionGradient)" strokeWidth="2" fill="none" className="animate-pulse" />
                  {/* Europe to Asia-Pacific */}
                  <path d="M 240 100 Q 280 90 300 120" stroke="url(#connectionGradient)" strokeWidth="2" fill="none" className="animate-pulse" />
                  {/* Americas to Europe */}
                  <path d="M 140 200 Q 180 160 240 140" stroke="url(#connectionGradient)" strokeWidth="2" fill="none" className="animate-pulse" />
                </svg>

                {/* Cross-Cultural Knowledge Nodes */}
                <div className="absolute top-1/2 left-1/3 transform -translate-x-1/2 -translate-y-1/2">
                  <div className="px-3 py-1.5 rounded-full bg-success/20 border border-success/50 text-xs font-medium text-success glow-green">
                    Ubuntu Philosophy
                  </div>
                </div>
                <div className="absolute top-2/3 right-1/3 transform translate-x-1/2 translate-y-1/2">
                  <div className="px-3 py-1.5 rounded-full bg-warning/20 border border-warning/50 text-xs font-medium text-warning">
                    Confucian Ethics
                  </div>
                </div>
                <div className="absolute bottom-1/3 left-1/2 transform -translate-x-1/2 translate-y-1/2">
                  <div className="px-3 py-1.5 rounded-full bg-destructive/20 border border-destructive/50 text-xs font-medium text-destructive">
                    Indigenous Wisdom
                  </div>
                </div>
                <div className="absolute top-1/3 right-1/4 transform translate-x-1/2 -translate-y-1/2">
                  <div className="px-3 py-1.5 rounded-full bg-purple-500/20 border border-purple-500/50 text-xs font-medium text-purple-500">
                    Islamic Philosophy
                  </div>
                </div>
              </div>

              {/* Network Stats */}
              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-lg font-bold text-primary">195</div>
                  <div className="text-xs text-muted-foreground">Nations Connected</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-accent">12,847</div>
                  <div className="text-xs text-muted-foreground">Active Learners</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-success">47</div>
                  <div className="text-xs text-muted-foreground">Knowledge Domains</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-warning">98.7%</div>
                  <div className="text-xs text-muted-foreground">Network Health</div>
                </div>
              </div>
            </Card>

            {/* Cohort Genesis Challenge */}
            <Card className="p-6 bg-card/50 backdrop-blur border-border/50">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold mb-1">Cohort Genesis Challenge</h2>
                  <p className="text-sm text-muted-foreground">Collaborative learning in action</p>
                </div>
                <Users className="h-6 w-6 text-primary" />
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-secondary/50 border border-border/50">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold mb-1">AI Ethics Framework Design</h3>
                      <p className="text-sm text-muted-foreground">Design a constitutional AI governance model</p>
                    </div>
                    <Badge className="bg-primary/20 text-primary border-primary/30">In Progress</Badge>
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex -space-x-2">
                      {[1, 2, 3, 4].map((i) => (
                        <Avatar key={i} className="h-8 w-8 border-2 border-card">
                          <AvatarImage src={`/diverse-students-studying.png?height=32&width=32&query=student${i}`} />
                          <AvatarFallback className="bg-primary/20 text-xs">S{i}</AvatarFallback>
                        </Avatar>
                      ))}
                    </div>
                    <span className="text-sm text-muted-foreground">+2 more</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-semibold text-primary">68%</span>
                  </div>
                  <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary glow-cyan" style={{ width: "68%" }} />
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column - 1/3 width */}
          <div className="space-y-6">
            {/* Proof-of-Knowledge Balance */}
            <Card className="p-6 bg-gradient-to-br from-primary/10 to-accent/10 backdrop-blur border-primary/30 glow-cyan">
              <div className="flex items-center gap-2 mb-4">
                <Wallet className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-bold">Proof-of-Knowledge Balance</h2>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-4xl font-bold text-primary text-glow-cyan">125.75</span>
                  <span className="text-xl text-muted-foreground">aZAR</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <TrendingUp className="h-4 w-4 text-success" />
                  <span className="text-success font-medium">+12.5 aZAR this week</span>
                </div>
              </div>

              {/* Mini Trend Graph */}
              <div className="h-16 flex items-end gap-1 mb-4">
                {[30, 45, 40, 60, 55, 70, 65, 80, 75, 85, 90, 95].map((height, i) => (
                  <div key={i} className="flex-1 bg-primary/10 rounded-t" style={{ height: `${height}%` }}>
                    <div className="w-full bg-primary/50 rounded-t" style={{ height: "100%" }} />
                  </div>
                ))}
              </div>

              <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground glow-cyan">
                View Wallet
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Card>

            {/* Continue Your Journey */}
            <Card className="p-6 bg-card/50 backdrop-blur border-border/50">
              <div className="flex items-center gap-2 mb-4">
                <Zap className="h-5 w-5 text-accent" />
                <h2 className="text-lg font-bold">Continue Your Journey</h2>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-secondary/50 border border-border/50">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="h-12 w-12 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <BookOpen className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold mb-1 truncate">First Principles of AI & Ethics</h3>
                      <p className="text-sm text-muted-foreground">Module 4: Constitutional AI Design</p>
                    </div>
                  </div>
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-semibold text-accent">45%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-accent" style={{ width: "45%" }} />
                    </div>
                  </div>
                  <Button className="w-full bg-transparent" variant="outline">
                    Resume Learning
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>

                <div className="p-4 rounded-lg bg-secondary/30 border border-border/30">
                  <h3 className="font-semibold mb-2 text-sm">Next Up</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <div className="h-2 w-2 rounded-full bg-primary" />
                      <span className="text-muted-foreground">Socratic Session: Ethics in Practice</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <div className="h-2 w-2 rounded-full bg-accent" />
                      <span className="text-muted-foreground">Assessment: Module 4 Final</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Quick Stats */}
            <Card className="p-6 bg-card/50 backdrop-blur border-border/50">
              <h2 className="text-lg font-bold mb-4">Quick Stats</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total Modules</span>
                  <span className="font-semibold text-primary">47</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Completed</span>
                  <span className="font-semibold text-success">34</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">In Progress</span>
                  <span className="font-semibold text-accent">3</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total aZAR Earned</span>
                  <span className="font-semibold text-primary">125.75</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
