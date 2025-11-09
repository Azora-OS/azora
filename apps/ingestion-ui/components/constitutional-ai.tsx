"use client"

import { Shield, Eye, Zap, Lock, Activity, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"

const features = [
  {
    icon: Shield,
    title: "Constitutional Governance",
    description: "Every decision guided by transparent, ethical principles encoded in our AI constitution",
  },
  {
    icon: Eye,
    title: "Complete Transparency",
    description: "Open-source governance policies. No black boxes. Every algorithm is auditable and explainable",
  },
  {
    icon: Zap,
    title: "Self-Healing System",
    description: "Elara Ω monitors and fixes issues autonomously every 2 minutes, ensuring 99.99% uptime",
  },
  {
    icon: Lock,
    title: "Zero-Trust Security",
    description: "Enterprise-grade security with SOC 2, ISO 27001, and GDPR compliance built-in",
  },
  {
    icon: Activity,
    title: "Living Organism",
    description: "580+ autonomous services working together as a unified, breathing ecosystem",
  },
  {
    icon: CheckCircle2,
    title: "Ethical by Design",
    description: "AI that prioritizes human dignity, privacy, and empowerment over profit extraction",
  },
]

export function ConstitutionalAI() {
  return (
    <section id="ai" className="relative py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <Shield className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-primary">Elara Ω Guardian</span>
          </div>
          <h2 className="text-5xl sm:text-6xl font-bold mb-6 text-balance">
            <span className="text-foreground">Constitutional AI</span>
            <br />
            <span className="gradient-text">With a Conscience</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto text-pretty leading-relaxed">
            Meet Elara Ω — our Constitutional AI Guardian that ensures every action aligns with divine principles,
            ethical governance, and human dignity
          </p>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20">
          <div className="text-center p-6 rounded-2xl glass-medium border border-border/50 shadow-premium-md hover:shadow-premium-lg hover:scale-[1.02] transition-all duration-300">
            <div className="text-4xl font-bold gradient-text mb-2">580+</div>
            <div className="text-sm text-muted-foreground">Autonomous Services</div>
          </div>
          <div className="text-center p-6 rounded-2xl glass-medium border border-border/50 shadow-premium-md hover:shadow-premium-lg hover:scale-[1.02] transition-all duration-300">
            <div className="text-4xl font-bold gradient-text mb-2">99.99%</div>
            <div className="text-sm text-muted-foreground">Uptime Guarantee</div>
          </div>
          <div className="text-center p-6 rounded-2xl glass-medium border border-border/50 shadow-premium-md hover:shadow-premium-lg hover:scale-[1.02] transition-all duration-300">
            <div className="text-4xl font-bold gradient-text mb-2">2 min</div>
            <div className="text-sm text-muted-foreground">Self-Healing Cycle</div>
          </div>
          <div className="text-center p-6 rounded-2xl glass-medium border border-border/50 shadow-premium-md hover:shadow-premium-lg hover:scale-[1.02] transition-all duration-300">
            <div className="text-4xl font-bold gradient-text mb-2">100%</div>
            <div className="text-sm text-muted-foreground">Transparent</div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div
                key={feature.title}
                className="group p-8 rounded-3xl acrylic border border-border hover:border-primary/40 transition-all duration-500 reveal animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-foreground">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            )
          })}
        </div>

        {/* CTA Section */}
        <div className="text-center p-12 rounded-3xl bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 border border-primary/20">
          <h3 className="text-3xl font-bold mb-4 text-foreground">Experience Ethical AI</h3>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands who trust Azora OS for education, enterprise management, and economic empowerment
          </p>
          <Button
            size="lg"
            className="gradient-bg text-white font-semibold px-8 h-14 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
          >
            Read the Constitution
          </Button>
        </div>
      </div>
    </section>
  )
}
