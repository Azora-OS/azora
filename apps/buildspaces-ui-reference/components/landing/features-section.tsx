"use client"

import { motion } from "framer-motion"
import { Code2, GitBranch, Database, Shield, Bot, Workflow } from "lucide-react"

const features = [
  {
    icon: Bot,
    title: "Multi-Agent Architecture",
    description:
      "Specialized AI agents work in parallel - Sankofa for code, Themba for infrastructure, Jabari for security.",
    color: "from-primary to-emerald-400",
  },
  {
    icon: Workflow,
    title: "Elara Orchestration",
    description: "XO Architect breaks down complex tasks and delegates to the right agents automatically.",
    color: "from-accent to-purple-400",
  },
  {
    icon: Code2,
    title: "Full-Stack Generation",
    description: "Generate React, Next.js, APIs, databases, and deployment configs from natural language.",
    color: "from-primary to-cyan-400",
  },
  {
    icon: GitBranch,
    title: "Git Integration",
    description: "Automatic commits, branch management, and pull request creation built-in.",
    color: "from-amber-500 to-orange-400",
  },
  {
    icon: Database,
    title: "Database Designer",
    description: "Visual schema design with Prisma generation and automatic migrations.",
    color: "from-pink-500 to-rose-400",
  },
  {
    icon: Shield,
    title: "Constitutional AI",
    description: "Every action validated against ethical guidelines. Safe, secure, responsible AI.",
    color: "from-blue-500 to-indigo-400",
  },
]

export function FeaturesSection() {
  return (
    <section id="features" className="relative py-32 overflow-hidden">
      <div className="absolute inset-0 gradient-mesh opacity-50" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-20"
        >
          <span className="text-primary text-sm font-semibold tracking-wider uppercase">Capabilities</span>
          <h2 className="mt-4 text-4xl sm:text-5xl font-bold tracking-tight text-balance">
            Everything you need to{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">build faster</span>
          </h2>
          <p className="mt-6 text-lg text-muted-foreground text-pretty">
            A complete development platform powered by AI agents that understand context, follow best practices, and
            ship production-ready code.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group relative"
            >
              <div className="relative h-full p-6 rounded-2xl border border-border bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-all duration-300 hover:border-primary/30">
                {/* Icon */}
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                >
                  <feature.icon className="w-6 h-6 text-background" />
                </div>

                {/* Content */}
                <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>

                {/* Hover Glow */}
                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                  <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${feature.color} opacity-5`} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8"
        >
          {[
            { value: "100x", label: "Faster Development" },
            { value: "10M+", label: "Lines Generated" },
            { value: "99.9%", label: "Uptime" },
            { value: "50+", label: "Integrations" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                {stat.value}
              </div>
              <div className="mt-2 text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
