import { Navbar } from "@/components/features/navbar"
import { Footer } from "@/components/features/footer"
import { AetherBackground } from "@/components/ui/aether-background"
import { Button } from "@/components/ui/button"
import { AfricanAgentAvatar } from "@/components/ui/african-agent-avatar"
import { agentStyles } from "@/components/ui/agent-styles"
import { ArrowRight, Brain, Cpu, MessageSquare, Settings, Workflow, Gauge, Shield } from "lucide-react"

export default function AIStudioPage() {
  return (
    <div className="min-h-screen bg-[#0d1117] text-white">
      <Navbar />

      <main>
        {/* Hero */}
        <section className="relative py-20 overflow-hidden">
          <AetherBackground intensity="medium" />

          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-pink-500/10 border border-pink-500/20 px-4 py-2 mb-6">
              <Brain className="h-4 w-4 text-pink-400" />
              <span className="text-sm text-pink-400">AI Studio</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              <span className="text-white">Orchestrate AI</span>
              <br />
              <span className="bg-gradient-to-r from-pink-400 via-rose-400 to-red-400 bg-clip-text text-transparent">
                your way
              </span>
            </h1>

            <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-8">
              Manage context, coordinate agents, and optimize model usage. The control center for all AI operations in
              BuildSpaces.
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <Button className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-3">
                Open AI Studio <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button variant="outline" className="border-white/20 hover:bg-white/5 px-6 py-3 bg-transparent">
                Configure Models
              </Button>
            </div>
          </div>
        </section>

        {/* Agent Orchestra */}
        <section className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="rounded-xl border border-white/10 bg-[#0d1117] overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-2 bg-[#161b22] border-b border-white/10">
                <div className="flex items-center gap-3">
                  <Brain className="h-5 w-5 text-pink-400" />
                  <span className="text-sm font-medium">Agent Orchestra</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" /> All agents online
                  </span>
                </div>
              </div>

              <div className="p-8">
                {/* Central Orchestrator */}
                <div className="flex flex-col items-center mb-8">
                  <AfricanAgentAvatar agent="elara" size="2xl" />
                  <h3 className="mt-4 text-xl font-bold">Elara</h3>
                  <p className="text-emerald-400">XO Architect - Orchestrating</p>
                </div>

                {/* Agent Circle */}
                <div className="relative max-w-3xl mx-auto">
                  <div className="flex flex-wrap justify-center gap-8">
                    {(["sankofa", "themba", "jabari", "nia", "imani"] as const).map((agent) => {
                      const style = agentStyles[agent]
                      return (
                        <div key={agent} className="flex flex-col items-center">
                          <AfricanAgentAvatar agent={agent} size="lg" />
                          <p className="mt-2 font-medium">{style.name}</p>
                          <p className={`text-xs bg-gradient-to-r ${style.gradient} bg-clip-text text-transparent`}>
                            {style.description}
                          </p>
                          <span className="mt-1 text-xs text-emerald-400">Ready</span>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-4 gap-4 mt-8 pt-8 border-t border-white/10">
                  {[
                    { label: "Tokens Used", value: "124,892", icon: Cpu },
                    { label: "Tasks Today", value: "47", icon: Workflow },
                    { label: "Avg Response", value: "1.2s", icon: Gauge },
                    { label: "Constitution", value: "100%", icon: Shield },
                  ].map((stat, i) => (
                    <div key={i} className="text-center">
                      <stat.icon className="h-5 w-5 mx-auto mb-2 text-gray-500" />
                      <div className="text-2xl font-bold text-white">{stat.value}</div>
                      <div className="text-xs text-gray-500">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  icon: Workflow,
                  title: "Agent Orchestration",
                  description: "Elara coordinates all agents, routing tasks to the right specialist.",
                },
                {
                  icon: MessageSquare,
                  title: "Context Management",
                  description: "Intelligent context windows that keep conversations coherent and efficient.",
                },
                {
                  icon: Cpu,
                  title: "Multi-Model Support",
                  description: "Use GPT-4, Claude, or local models. Automatic fallback and cost optimization.",
                },
                {
                  icon: Gauge,
                  title: "Token Tracking",
                  description: "Real-time usage monitoring with cost estimates and budget alerts.",
                },
                {
                  icon: Shield,
                  title: "Constitutional AI",
                  description: "All outputs verified against your rules for safe, reliable assistance.",
                },
                {
                  icon: Settings,
                  title: "Custom Agents",
                  description: "Create specialized agents for your specific workflows and domains.",
                },
              ].map((feature, i) => (
                <div
                  key={i}
                  className="rounded-xl bg-white/5 border border-white/10 p-6 hover:border-pink-500/50 transition-colors"
                >
                  <feature.icon className="h-8 w-8 text-pink-400 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-400">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
