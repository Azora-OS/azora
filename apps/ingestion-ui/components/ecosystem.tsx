"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Server, Cpu, Database, Shield, Zap, Globe } from "lucide-react"

const ecosystemData = [
  {
    category: "Backend (Organs)",
    icon: Server,
    count: "113+",
    items: ["Core Services", "Educational APIs", "Financial Systems", "Communication", "Analytics", "AI Services"],
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    category: "AI (Genome)",
    icon: Cpu,
    count: "50+",
    items: ["ELARA AI", "16 AI Agents", "NLP & Vision", "Auto Grading", "Recommendations", "Research Agents"],
    color: "text-secondary",
    bgColor: "bg-secondary/10",
  },
  {
    category: "Blockchain",
    icon: Database,
    count: "4",
    items: ["NFT Minting", "$LEARN Token", "$AZR Token", "DAO Governance", "Multi-chain", "Smart Contracts"],
    color: "text-accent",
    bgColor: "bg-accent/10",
  },
  {
    category: "Security",
    icon: Shield,
    count: "99.99%",
    items: ["End-to-End Encryption", "DDoS Protection", "OAuth & JWT", "GDPR Compliant", "SOC 2", "ISO 27001"],
    color: "text-success",
    bgColor: "bg-success/10",
  },
  {
    category: "Performance",
    icon: Zap,
    count: "<100ms",
    items: ["Global CDN", "Redis Cache", "Load Balancing", "Auto Scaling", "Edge Computing", "Optimized APIs"],
    color: "text-warning",
    bgColor: "bg-warning/10",
  },
  {
    category: "Global Reach",
    icon: Globe,
    count: "40+",
    items: ["Languages", "RTL Support", "Multi-currency", "Local CDN", "1M+ Users", "Worldwide Access"],
    color: "text-tertiary",
    bgColor: "bg-tertiary/10",
  },
]

export function Ecosystem() {
  return (
    <section id="ecosystem" className="py-32 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-balance">
            Powerful <span className="gradient-text">Infrastructure</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
            Built on enterprise-grade architecture with 113+ microservices, advanced AI, and blockchain technology.
          </p>
        </div>

        {/* Ecosystem Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ecosystemData.map((item, index) => (
            <Card
              key={index}
              className="p-6 reveal hover:elevation-3 transition-all duration-300 animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl ${item.bgColor} flex items-center justify-center`}>
                  <item.icon className={`w-6 h-6 ${item.color}`} />
                </div>
                <Badge variant="secondary" className="text-xs font-mono">
                  {item.count}
                </Badge>
              </div>
              <h3 className="text-lg font-bold mb-4">{item.category}</h3>
              <div className="flex flex-wrap gap-2">
                {item.items.map((tag, tagIndex) => (
                  <Badge key={tagIndex} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
