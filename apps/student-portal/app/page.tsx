import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { GraduationCap, DollarSign, TrendingUp, Users, Award, BookOpen, Target, Zap } from "lucide-react"

const stats = [
  { label: "190M+", description: "Student Capacity", icon: Users },
  { label: "20", description: "Institutions", icon: BookOpen },
  { label: "15%", description: "APY Staking", icon: TrendingUp },
  { label: "0.1%", description: "Transaction Fee", icon: Zap },
]

const features = [
  {
    title: "Learn & Earn",
    description: "20 institutions from K-12 to PhD with paid learning opportunities",
    icon: GraduationCap,
  },
  {
    title: "Financial Freedom",
    description: "Get paid while you study and graduate with savings",
    icon: DollarSign,
  },
  {
    title: "Career Acceleration",
    description: "AI-powered career guidance and job placement assistance",
    icon: Target,
  },
  {
    title: "Blockchain Credentials",
    description: "Immutable, verifiable certificates on the Azora blockchain",
    icon: Award,
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src="/packages/public/branding/logo-primary.svg"
                alt="Azora"
                className="h-8 w-auto"
              />
              <span className="text-xl font-bold text-foreground">Student Portal</span>
            </div>
            <div className="hidden gap-8 md:flex">
              <a href="/courses" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Courses
              </a>
              <a href="/careers" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Careers
              </a>
              <a href="/wallet" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Wallet
              </a>
              <a href="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                About
              </a>
            </div>
            <div className="flex gap-3">
              <Button variant="ghost" size="sm" asChild>
                <a href="/login">Sign In</a>
              </Button>
              <Button size="sm" asChild>
                <a href="/register">Get Started</a>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-background via-background to-background px-4 py-20 sm:px-6 lg:px-8">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-azora-purple/10 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-azora-violet/10 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-8 items-center">
            <div className="flex flex-col gap-6">
              <div className="space-y-4">
                <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl text-balance">
                  Learn. <span className="bg-gradient-to-r from-azora-purple to-azora-violet bg-clip-text text-transparent">Earn.</span> Prosper.
                </h1>
                <p className="text-xl text-muted-foreground text-balance">
                  The World's First Constitutional AI Operating System for Education.
                  Master skills, earn rewards, and build your future with Azora.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="bg-gradient-to-r from-azora-purple to-azora-violet hover:from-azora-purple/90 hover:to-azora-violet/90" asChild>
                  <a href="/register">Start Learning Free</a>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <a href="/login">Sign In</a>
                </Button>
              </div>
            </div>

            <div className="relative">
              <div className="aspect-square rounded-2xl bg-gradient-to-br from-azora-purple/20 to-azora-violet/20 p-8">
                <div className="h-full w-full rounded-xl bg-gradient-to-br from-azora-purple to-azora-violet flex items-center justify-center">
                  <GraduationCap className="h-24 w-24 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Why Choose Azora Education?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Experience the future of learning with our comprehensive educational ecosystem
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-azora-purple to-azora-violet flex items-center justify-center">
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-foreground">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-gradient-to-r from-azora-purple to-azora-violet px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="h-16 w-16 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
                    <stat.icon className="h-8 w-8 text-white" />
                  </div>
                </div>
                <div className="text-4xl font-bold text-white mb-2">{stat.label}</div>
                <div className="text-white/80">{stat.description}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center space-y-8">
          <div className="space-y-4">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Ready to Transform Your Future?
            </h2>
            <p className="text-xl text-muted-foreground">
              Join millions of learners worldwide in the Azora educational revolution
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-gradient-to-r from-azora-purple to-azora-violet hover:from-azora-purple/90 hover:to-azora-violet/90" asChild>
              <a href="/register">Start Your Journey</a>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <a href="/courses">Browse Courses</a>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/50 px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 md:grid-cols-4">
            <div className="space-y-4">
              <img
                src="/packages/public/branding/logo-primary.svg"
                alt="Azora"
                className="h-8 w-auto"
              />
              <p className="text-sm text-muted-foreground">
                The World's First Constitutional AI Operating System for Education
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-4">Platform</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="/courses" className="hover:text-foreground transition-colors">Courses</a></li>
                <li><a href="/careers" className="hover:text-foreground transition-colors">Careers</a></li>
                <li><a href="/wallet" className="hover:text-foreground transition-colors">Wallet</a></li>
                <li><a href="/certificates" className="hover:text-foreground transition-colors">Certificates</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-4">Support</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="/help" className="hover:text-foreground transition-colors">Help Center</a></li>
                <li><a href="/contact" className="hover:text-foreground transition-colors">Contact</a></li>
                <li><a href="/status" className="hover:text-foreground transition-colors">System Status</a></li>
                <li><a href="/feedback" className="hover:text-foreground transition-colors">Feedback</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="/privacy" className="hover:text-foreground transition-colors">Privacy</a></li>
                <li><a href="/terms" className="hover:text-foreground transition-colors">Terms</a></li>
                <li><a href="/compliance" className="hover:text-foreground transition-colors">Compliance</a></li>
                <li><a href="/security" className="hover:text-foreground transition-colors">Security</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © 2025 Azora Education. All rights reserved.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <span className="sr-only">Twitter</span>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8.29 20c7.547 0 11.674-6.155 11.674-11.501 0-.175 0-.349-.012-.523A8.335 8.335 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-7.094 3.742 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.273 5.477A4.073 4.073 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <span className="sr-only">GitHub</span>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.868-.013-1.703-2.782.603-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.547 2.914 1.186.092-.923.35-1.546.636-1.903-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.268.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.379.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.194 22 16.44 22 12.017 22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}