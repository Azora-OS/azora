"use client"

import { GraduationCap, Building2, ShoppingBag, CreditCard, Brain, Blocks } from "lucide-react"
import { Card } from "@/components/ui/card"

const features = [
  {
    icon: GraduationCap,
    title: "Sapiens",
    subtitle: "Learn-to-Earn Platform",
    description: "Solve real problems and get paid. Earn $250-15,000/month while learning valuable skills.",
    color: "from-primary to-secondary",
  },
  {
    icon: Building2,
    title: "Campus",
    subtitle: "Enterprise ERP/SIS",
    description: "Complete student and course management system with analytics, reporting, and multi-tenant support.",
    color: "from-secondary to-accent",
  },
  {
    icon: ShoppingBag,
    title: "Marketplace",
    subtitle: "NFT Marketplace",
    description: "Buy, sell, and mint educational NFT certificates. Multi-chain support with auction system.",
    color: "from-accent to-tertiary",
  },
  {
    icon: CreditCard,
    title: "Pay",
    subtitle: "Payment System",
    description: "Seamless payments with credit cards, cryptocurrency, and bank transfers. Multi-currency support.",
    color: "from-tertiary to-success",
  },
  {
    icon: Brain,
    title: "Genome",
    subtitle: "AI Systems",
    description: "Advanced AI tutoring, content generation, and personalized recommendations powered by 16 AI agents.",
    color: "from-success to-warning",
  },
  {
    icon: Blocks,
    title: "Blockchain",
    subtitle: "Decentralized Credentials",
    description: "Secure, verifiable credentials on blockchain. DAO governance with $LEARN and $AZR tokens.",
    color: "from-warning to-primary",
  },
]

export function Features() {
  return (
    <section id="features" className="py-32 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-balance">
            Complete <span className="gradient-text">Ecosystem</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
            Everything you need for modern education - from learning to earning, enterprise management to blockchain
            credentials.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="p-6 reveal hover:elevation-3 transition-all duration-300 animate-fade-in border-border/50"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div
                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4`}
              >
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-1">{feature.title}</h3>
              <p className="text-sm text-primary font-medium mb-3">{feature.subtitle}</p>
              <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
