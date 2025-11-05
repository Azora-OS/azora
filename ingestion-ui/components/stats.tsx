"use client"

import { Users, Code, Cpu, Award } from "lucide-react"

const stats = [
  {
    icon: Users,
    value: "1M+",
    label: "Active Learners",
    color: "text-primary",
  },
  {
    icon: Code,
    value: "113+",
    label: "Microservices",
    color: "text-secondary",
  },
  {
    icon: Cpu,
    value: "16",
    label: "AI Agents",
    color: "text-accent",
  },
  {
    icon: Award,
    value: "10",
    label: "Applications",
    color: "text-success",
  },
]

export function Stats() {
  return (
    <section className="py-20 border-y border-border bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-card border border-border elevation-1 mb-4">
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div className="text-4xl font-bold mb-2 gradient-text">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
