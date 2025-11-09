"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Search, Globe, Award, TrendingUp, Users, CheckCircle, Zap, Shield } from "lucide-react"
import { AzoraLogo } from "@/components/azora-logo"

const stats = [
  { label: "100+", description: "Initial Qualifications", icon: Award },
  { label: "180+", description: "Countries Covered", icon: Globe },
  { label: "25+", description: "Categories", icon: TrendingUp },
  { label: "50K+", description: "Expandable To", icon: Zap },
]

const features = [
  {
    title: "Global Qualifications Database",
    description: "Search and discover 100,000+ qualifications across all fields and countries",
    icon: Search,
  },
  {
    title: "Blockchain Verification",
    description: "Immutable proof of your achievements verified on blockchain",
    icon: Shield,
  },
  {
    title: "Earn AZR Rewards",
    description: "Get rewarded with AZR tokens for completing and verifying qualifications",
    icon: Award,
  },
  {
    title: "Personalized Pathways",
    description: "AI-powered recommendations for your ideal career and learning journey",
    icon: TrendingUp,
  },
  {
    title: "Global Recognition",
    description: "Your credentials recognized internationally by employers and institutions",
    icon: CheckCircle,
  },
  {
    title: "Community Learning",
    description: "Connect with educators and learners worldwide in a thriving ecosystem",
    icon: Users,
  },
]

const categories = [
  "Academic Education",
  "Technology & IT",
  "Business & Finance",
  "Healthcare",
  "Legal",
  "Engineering",
  "Languages",
  "Trade Certifications",
]

export default function Home() {
  const [email, setEmail] = useState("")

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <AzoraLogo className="h-10 w-10" />
              <span className="text-xl font-bold text-foreground">Azora OS</span>
            </div>
            <div className="hidden gap-8 md:flex">
              <Link href="/explore" className="text-sm text-muted-foreground hover:text-foreground">
                Explore
              </Link>
              <Link href="/educators" className="text-sm text-muted-foreground hover:text-foreground">
                For Educators
              </Link>
              <Link href="/employers" className="text-sm text-muted-foreground hover:text-foreground">
                For Employers
              </Link>
              <Link href="/about" className="text-sm text-muted-foreground hover:text-foreground">
                About
              </Link>
            </div>
            <div className="flex gap-3">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login">Sign In</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/signup">Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-background via-background to-background px-4 py-20 sm:px-6 lg:px-8">
        {/* Decorative background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-blue-500/10 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-purple-500/10 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-8 items-center">
            {/* Left Content */}
            <div className="flex flex-col gap-6">
              <div className="space-y-4">
                <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl text-balance">
                  Constitutional AI
                  <span className="bg-gradient-to-r from-[#667eea] to-[#764ba2] bg-clip-text text-transparent">
                    {" "}
                    Operating System
                  </span>
                </h1>
                <p className="text-lg text-muted-foreground sm:text-xl text-pretty max-w-lg">
                  World's first Constitutional AI OS. Transform education, finance, and technology through Ubuntu philosophy. Earn AZR while learning.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button size="lg" asChild>
                  <Link href="/explore">Explore Qualifications</Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link href="/learn-more">Learn More</Link>
                </Button>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-4 pt-8">
                {stats.map((stat) => {
                  const Icon = stat.icon
                  return (
                    <div key={stat.label} className="flex flex-col gap-2 rounded-lg border border-border bg-card p-4">
                      <div className="flex items-center gap-2">
                        <Icon className="h-5 w-5 text-[#667eea]" />
                        <span className="font-bold text-lg text-foreground">{stat.label}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">{stat.description}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Right Illustration Area */}
            <div className="relative h-96 sm:h-full">
              <div className="absolute inset-0 rounded-2xl border border-border bg-gradient-to-br from-blue-500/5 to-purple-500/5 p-8 flex flex-col items-center justify-center gap-8">
                <div className="space-y-4 text-center">
                  <h3 className="text-2xl font-bold text-foreground">Global Learning Ecosystem</h3>
                  <p className="text-muted-foreground">
                    Connect with millions of learners, educators, and institutions worldwide
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4 w-full">
                  {["Students", "Educators", "Employers", "Institutions"].map((role) => (
                    <div key={role} className="rounded-lg bg-background border border-border p-4 text-center">
                      <div className="font-semibold text-foreground text-sm">{role}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="border-t border-border bg-background px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl mb-4">
              Empowering Global Education
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to discover, learn, verify, and advance your career on a global stage
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon
              return (
                <Card
                  key={feature.title}
                  className="flex flex-col gap-4 border-border p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-[#667eea]/10 to-[#764ba2]/10">
                    <Icon className="h-6 w-6 text-[#667eea]" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm flex-1">{feature.description}</p>
                  <Link href="#" className="text-sm font-medium text-[#667eea] hover:text-[#764ba2]">
                    Learn more →
                  </Link>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="border-t border-border bg-gradient-to-b from-background to-background px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl mb-4">
              Explore 25+ Categories
            </h2>
            <p className="text-lg text-muted-foreground">
              From academic degrees to professional certifications and trade skills
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((category) => (
              <Link
                key={category}
                href={`/explore?category=${encodeURIComponent(category)}`}
                className="group rounded-lg border border-border bg-card p-6 hover:border-[#667eea] hover:bg-[#667eea]/5 transition-all"
              >
                <span className="font-medium text-foreground group-hover:text-[#667eea] transition-colors">
                  {category}
                </span>
                <span className="text-muted-foreground text-sm ml-2 group-hover:text-foreground">→</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-border bg-background px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl mb-4">
            Ready to Transform Your Future?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join millions of learners accessing global qualifications with blockchain verification and AZR rewards
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button size="lg" asChild>
              <Link href="/signup">Get Started Free</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/demo">Watch Demo</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-background px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 md:grid-cols-4 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#667eea] to-[#764ba2]">
                  <Globe className="h-5 w-5 text-white" />
                </div>
                <span className="font-bold text-foreground">Azora OS</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Constitutional AI Operating System - Ubuntu Philosophy Meets Quantum Technology
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Product</h4>
              <ul className="space-y-2">
                {["Explore", "Dashboard", "Marketplace", "Verify"].map((item) => (
                  <li key={item}>
                    <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Resources</h4>
              <ul className="space-y-2">
                {["Documentation", "API Docs", "Pricing", "Blog"].map((item) => (
                  <li key={item}>
                    <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Company</h4>
              <ul className="space-y-2">
                {["About", "Privacy", "Terms", "Contact"].map((item) => (
                  <li key={item}>
                    <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="border-t border-border pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <AzoraLogo className="h-6 w-6" />
              <p className="text-sm text-muted-foreground">© 2025 Azora ES (Pty) Ltd. All rights reserved.</p>
            </div>
            <div className="flex gap-4">
              <Link href="#" className="text-muted-foreground hover:text-foreground">
                <span className="sr-only">Twitter</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8.29 20c7.547 0 11.674-6.155 11.674-11.501 0-.175 0-.349-.012-.523A8.335 8.335 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-7.094 3.742 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.273 5.477A4.073 4.073 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-foreground">
                <span className="sr-only">GitHub</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path
                    fillRule="evenodd"
                    d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.868-.013-1.703-2.782.603-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.547 2.914 1.186.092-.923.35-1.546.636-1.903-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.268.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.379.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.194 22 16.44 22 12.017 22 6.484 17.522 2 12 2z"
                    clipRule="evenodd"
                  />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
