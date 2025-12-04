"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Code2, Shield, Database, Sparkles, ChevronRight, Palette } from "lucide-react"

const agents = [
  {
    id: "elara",
    name: "Elara",
    role: "XO Architect",
    description:
      "The orchestrator. Elara breaks down your vision into actionable tasks, delegates to specialized agents, and ensures everything comes together perfectly.",
    icon: Sparkles,
    color: "from-primary to-emerald-400",
    capabilities: ["Task Planning", "Agent Coordination", "Quality Assurance", "Context Management"],
    quote: "I see your vision. Let me coordinate the team to bring it to life.",
  },
  {
    id: "sankofa",
    name: "Sankofa",
    role: "Code Architect",
    description:
      "Master of code generation. Sankofa writes clean, maintainable code following best practices and your project's conventions.",
    icon: Code2,
    color: "from-accent to-purple-400",
    capabilities: ["React/Next.js", "TypeScript", "API Development", "Code Refactoring"],
    quote: "Clean code is not written by following rules. It's written by caring.",
  },
  {
    id: "themba",
    name: "Themba",
    role: "System Builder",
    description:
      "Infrastructure specialist. Themba handles databases, deployments, CI/CD pipelines, and all the ops work.",
    icon: Database,
    color: "from-amber-500 to-orange-400",
    capabilities: ["Database Design", "Docker/K8s", "CI/CD Pipelines", "Cloud Deployment"],
    quote: "A strong foundation makes everything possible.",
  },
  {
    id: "jabari",
    name: "Jabari",
    role: "Security Guardian",
    description:
      "Security first. Jabari reviews code for vulnerabilities, implements auth, and ensures your app is bulletproof.",
    icon: Shield,
    color: "from-blue-500 to-cyan-400",
    capabilities: ["Security Audits", "Authentication", "Encryption", "Compliance"],
    quote: "Security is not a feature. It's the foundation.",
  },
  {
    id: "naledi",
    name: "Naledi",
    role: "Design Lead",
    description:
      "Visual excellence personified. Naledi crafts stunning UI/UX designs, creates wireframes, and ensures every pixel is perfect.",
    icon: Palette,
    color: "from-pink-500 to-rose-400",
    capabilities: ["UI/UX Design", "Wireframing", "Design Systems", "Accessibility"],
    quote: "Great design is invisible. It just feels right.",
  },
]

export function AgentsSection() {
  const [activeAgent, setActiveAgent] = useState(agents[0])

  return (
    <section id="agents" className="relative py-32 overflow-hidden bg-muted/30">
      <div className="absolute inset-0 grid-pattern opacity-20" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="text-primary text-sm font-semibold tracking-wider uppercase">The AI Family</span>
          <h2 className="mt-4 text-4xl sm:text-5xl font-bold tracking-tight text-balance">
            Meet your{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              AI development team
            </span>
          </h2>
          <p className="mt-6 text-lg text-muted-foreground text-pretty">
            Each agent is a specialist in their domain. Together, they form an unstoppable force that turns your ideas
            into production-ready applications.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Agent Selector */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-3"
          >
            {agents.map((agent) => (
              <motion.button
                key={agent.id}
                onClick={() => setActiveAgent(agent)}
                className={`w-full text-left p-4 rounded-xl border transition-all duration-300 ${
                  activeAgent.id === agent.id
                    ? "border-primary bg-primary/10"
                    : "border-border bg-card/50 hover:border-muted-foreground/30"
                }`}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${agent.color} flex items-center justify-center shrink-0`}
                  >
                    <agent.icon className="w-6 h-6 text-background" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground">{agent.name}</span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full bg-gradient-to-r ${agent.color} text-background font-medium`}
                      >
                        {agent.role}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground truncate mt-0.5">{agent.description.slice(0, 60)}...</p>
                  </div>
                  <ChevronRight
                    className={`w-5 h-5 transition-transform ${activeAgent.id === agent.id ? "rotate-90 text-primary" : "text-muted-foreground"}`}
                  />
                </div>
              </motion.button>
            ))}
          </motion.div>

          {/* Agent Detail Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:sticky lg:top-24"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={activeAgent.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="relative rounded-2xl border border-border bg-card/80 backdrop-blur-sm p-8 overflow-hidden"
              >
                {/* Background Gradient */}
                <div
                  className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-br ${activeAgent.color} opacity-10 blur-3xl`}
                />

                <div className="relative z-10">
                  {/* Header */}
                  <div className="flex items-center gap-4 mb-6">
                    <div
                      className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${activeAgent.color} flex items-center justify-center`}
                    >
                      <activeAgent.icon className="w-8 h-8 text-background" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-foreground">{activeAgent.name}</h3>
                      <p
                        className={`text-sm font-medium bg-gradient-to-r ${activeAgent.color} bg-clip-text text-transparent`}
                      >
                        {activeAgent.role}
                      </p>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-muted-foreground mb-6 leading-relaxed">{activeAgent.description}</p>

                  {/* Quote */}
                  <blockquote className="border-l-2 border-primary pl-4 mb-6 italic text-foreground/80">
                    "{activeAgent.quote}"
                  </blockquote>

                  {/* Capabilities */}
                  <div>
                    <h4 className="text-sm font-semibold text-foreground mb-3">Capabilities</h4>
                    <div className="flex flex-wrap gap-2">
                      {activeAgent.capabilities.map((cap) => (
                        <span
                          key={cap}
                          className="px-3 py-1.5 text-xs font-medium rounded-full bg-muted text-foreground"
                        >
                          {cap}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
