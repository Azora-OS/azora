"use client"

import { GraduationCap, Building2, ShoppingBag, Wallet, Brain, Shield, Sparkles, Network } from "lucide-react"

const applications = [
  {
    icon: GraduationCap,
    name: "Sapiens",
    tagline: "Learn to Earn",
    description: "Adaptive learning platform where education pays you $250-15K/month",
    color: "from-celestial-blue to-celestial-blue-light",
  },
  {
    icon: Building2,
    name: "Campus",
    tagline: "Enterprise ERP/SIS",
    description: "Complete institutional management for schools and universities",
    color: "from-sacred-purple to-sacred-purple-light",
  },
  {
    icon: ShoppingBag,
    name: "Marketplace",
    tagline: "NFT & Commerce",
    description: "Decentralized marketplace for educational content and credentials",
    color: "from-divine-gold to-divine-gold-dark",
  },
  {
    icon: Wallet,
    name: "Pay",
    tagline: "Financial Freedom",
    description: "Integrated payment system with crypto and fiat support",
    color: "from-life-green to-life-green-light",
  },
  {
    icon: Brain,
    name: "Genome AI",
    tagline: "Intelligence Layer",
    description: "Constitutional AI powering personalized learning and insights",
    color: "from-love-rose to-love-rose-light",
  },
  {
    icon: Shield,
    name: "Aegis",
    tagline: "Security Guardian",
    description: "Zero-trust security protecting your data and privacy",
    color: "from-justice-crimson to-destructive",
  },
]

export function LivingEcosystem() {
  return (
    <section id="ecosystem" className="relative py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/5 to-background" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 border border-secondary/20 mb-6">
            <Network className="w-4 h-4 text-secondary" />
            <span className="text-sm font-semibold text-secondary">Living Ecosystem</span>
          </div>
          <h2 className="text-5xl sm:text-6xl font-bold mb-6 text-balance">
            <span className="text-foreground">10 Applications</span>
            <br />
            <span className="gradient-text">One Unified Organism</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto text-pretty leading-relaxed">
            A complete ecosystem of interconnected applications working together seamlessly, powered by 580+ autonomous
            microservices
          </p>
        </div>

        {/* Applications Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {applications.map((app, index) => {
            const Icon = app.icon
            return (
              <div
                key={app.name}
                className="group relative p-8 rounded-3xl acrylic border border-border hover:border-secondary/40 transition-all duration-500 reveal animate-fade-in-up cursor-pointer"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Hover glow */}
                <div
                  className="absolute inset-0 rounded-3xl bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity duration-500 blur-xl"
                  style={{
                    background: `linear-gradient(135deg, var(--${app.color.split(" ")[0].replace("from-", "")}), var(--${app.color.split(" ")[2].replace("to-", "")}))`,
                  }}
                />

                <div className="relative">
                  {/* Icon */}
                  <div
                    className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${app.color} flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}
                  >
                    <Icon className="w-8 h-8 text-white" />
                  </div>

                  {/* Content */}
                  <div className="mb-4">
                    <h3 className="text-2xl font-bold text-foreground mb-1">{app.name}</h3>
                    <p className="text-sm font-semibold text-muted-foreground">{app.tagline}</p>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">{app.description}</p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Microservices Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="p-10 rounded-3xl acrylic border border-border">
            <Sparkles className="w-12 h-12 text-accent mb-6" />
            <h3 className="text-3xl font-bold mb-4 text-foreground">580+ Microservices</h3>
            <p className="text-lg text-muted-foreground leading-relaxed mb-6">
              A sophisticated network of autonomous services working in harmony, each specialized and optimized for
              specific tasks
            </p>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-accent mt-2" />
                <span>Real-time collaboration and synchronization</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-accent mt-2" />
                <span>Distributed computing for maximum performance</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-accent mt-2" />
                <span>Self-healing and auto-scaling infrastructure</span>
              </li>
            </ul>
          </div>

          <div className="p-10 rounded-3xl bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 border border-primary/20">
            <Network className="w-12 h-12 text-primary mb-6" />
            <h3 className="text-3xl font-bold mb-4 text-foreground">Unified Experience</h3>
            <p className="text-lg text-muted-foreground leading-relaxed mb-6">
              Despite the complexity, users experience a seamless, intuitive interface that feels like a single,
              cohesive application
            </p>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                <span>Single sign-on across all applications</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                <span>Shared data and insights across platforms</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                <span>Consistent design language and experience</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
