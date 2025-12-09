import { Navbar } from "@/components/features/navbar"
import { Footer } from "@/components/features/footer"
import { AetherBackground } from "@/components/ui/aether-background"
import { AfricanAgentAvatar } from "@/components/ui/african-agent-avatar"
import { agentStyles } from "@/components/ui/agent-styles"
import { HeroAgentDisplay } from "@/components/demo/hero-agent-display"
import { LiveOrchestrationDemo } from "@/components/demo/live-orchestration"
import { Button } from "@/components/ui/button"
import { ArrowRight, Check, Sparkles, Shield, Zap, Brain, Code2, Database, Palette, Lock } from "lucide-react"

const agents = [
  {
    key: "elara" as const,
    capabilities: ["Project orchestration", "Context management", "Multi-agent coordination", "Strategic planning"],
    icon: Brain,
  },
  {
    key: "sankofa" as const,
    capabilities: ["React & Next.js", "Node.js backends", "Full-stack generation", "Code review & refactoring"],
    icon: Code2,
  },
  {
    key: "themba" as const,
    capabilities: ["Infrastructure design", "DevOps automation", "Deployment strategies", "Scaling optimization"],
    icon: Zap,
  },
  {
    key: "jabari" as const,
    capabilities: ["Vulnerability scanning", "Penetration testing", "OWASP compliance", "Security audits"],
    icon: Lock,
  },
  {
    key: "nia" as const,
    capabilities: ["SQL optimization", "Data analysis", "ML recommendations", "Analytics setup"],
    icon: Database,
  },
  {
    key: "imani" as const,
    capabilities: ["UI/UX feedback", "Design systems", "Animation guidance", "Brand consistency"],
    icon: Palette,
  },
]

export default function AgentsPage() {
  return (
    <div className="min-h-screen bg-[#0d1117] text-white">
      <Navbar />

      <main>
        {/* Hero with mouse-tracking agents */}
        <section className="relative py-24 overflow-hidden">
          <AetherBackground intensity="high" />

          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 mb-6">
                <Sparkles className="h-4 w-4 text-emerald-400" />
                <span className="text-sm text-emerald-400">AI Agents</span>
              </div>

              <h1 className="text-5xl md:text-7xl font-bold mb-6">
                <span className="text-white">{"Your code's favorite"}</span>
                <br />
                <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
                  coding agents
                </span>
              </h1>

              <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-4">
                African Android humanoids powered by Constitutional AI. Watch them follow your cursor and work together
                to build your vision.
              </p>
            </div>

            {/* Hero agent display with mouse tracking */}
            <HeroAgentDisplay />

            <div className="flex flex-wrap justify-center gap-4 mt-8">
              <Button className="bg-emerald-500 hover:bg-emerald-600 px-6 py-3">
                Get started for free <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button variant="outline" className="border-white/20 hover:bg-white/5 px-6 py-3 bg-transparent">
                See plans & pricing
              </Button>
            </div>
          </div>
        </section>

        {/* Constitutional AI Banner */}
        <section className="py-8 px-4 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-cyan-500/10 border-y border-white/10">
          <div className="mx-auto max-w-7xl flex items-center justify-center gap-4 text-center">
            <Shield className="h-6 w-6 text-emerald-400" />
            <p className="text-gray-300">
              <span className="font-semibold text-white">Powered by Constitutional AI</span> — Safe, reliable, and
              aligned with your values
            </p>
          </div>
        </section>

        {/* Live Orchestration Demo */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-transparent via-emerald-500/5 to-transparent">
          <div className="mx-auto max-w-7xl">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">Watch Agents Build in Real-Time</h2>
              <p className="text-gray-400 max-w-2xl mx-auto">
                See how Elara orchestrates the team to build a full-stack dashboard. Click start and watch the magic
                happen.
              </p>
            </div>

            <LiveOrchestrationDemo />
          </div>
        </section>

        {/* Agents Grid */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">Meet the Team</h2>
              <p className="text-gray-400 max-w-2xl mx-auto">
                Each agent is specialized for specific tasks, working together under {"Elara's"} orchestration.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {agents.map(({ key, capabilities, icon: Icon }) => {
                const style = agentStyles[key]
                return (
                  <div
                    key={key}
                    className="group relative rounded-2xl bg-white/5 border border-white/10 p-8 hover:border-white/20 transition-all"
                  >
                    <div className="flex items-start gap-4 mb-6">
                      <AfricanAgentAvatar agent={key} size="xl" trackMouse />
                      <div>
                        <h3 className="text-2xl font-bold">{style.name}</h3>
                        <p
                          className={`text-sm bg-gradient-to-r ${style.gradient} bg-clip-text text-transparent font-medium`}
                        >
                          {style.description}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {capabilities.map((cap, i) => (
                        <div key={i} className="flex items-center gap-2 text-gray-400">
                          <Check className="h-4 w-4 text-emerald-400" />
                          <span>{cap}</span>
                        </div>
                      ))}
                    </div>

                    <div
                      className={`absolute top-4 right-4 p-2 rounded-lg bg-gradient-to-br ${style.gradient} opacity-20`}
                    >
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-transparent via-white/5 to-transparent">
          <div className="mx-auto max-w-7xl">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">How Agents Work</h2>
              <p className="text-gray-400 max-w-2xl mx-auto">
                Elara coordinates the team, routing your requests to the right specialist and ensuring quality through
                Constitutional AI verification.
              </p>
            </div>

            <div className="grid md:grid-cols-4 gap-8">
              {[
                { step: "1", title: "You Ask", desc: "Describe what you want to build or fix" },
                { step: "2", title: "Elara Plans", desc: "Orchestrator breaks down the task" },
                { step: "3", title: "Agents Execute", desc: "Specialists work on their parts" },
                { step: "4", title: "Verified Delivery", desc: "Constitutional AI checks the output" },
              ].map((item, i) => (
                <div key={i} className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 text-xl font-bold mb-4">
                    {item.step}
                  </div>
                  <h3 className="font-semibold mb-2">{item.title}</h3>
                  <p className="text-gray-400 text-sm">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to work with AI agents?</h2>
            <p className="text-gray-400 mb-8">Start building faster with your AI team today.</p>
            <Button className="bg-emerald-500 hover:bg-emerald-600 px-8 py-4 text-lg">
              Get Started Free <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
