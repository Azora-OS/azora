import { Navbar } from "@/components/features/navbar"
import { Footer } from "@/components/features/footer"
import { AetherBackground } from "@/components/ui/aether-background"
import { Button } from "@/components/ui/button"
import { AfricanAgentAvatar } from "@/components/ui/african-agent-avatar"
import { ArrowRight, Terminal, Check, AlertTriangle, Shield, Zap, Command, History, Sparkles } from "lucide-react"

const commands = [
  { cmd: "/generate", desc: "Generate code from description", agent: "sankofa" as const },
  { cmd: "/test", desc: "Run tests on file or project", agent: "sankofa" as const },
  { cmd: "/deploy", desc: "Deploy to staging or production", agent: "themba" as const },
  { cmd: "/security", desc: "Run security audit", agent: "jabari" as const },
  { cmd: "/analyze", desc: "Analyze data or query", agent: "nia" as const },
  { cmd: "/design", desc: "Get UI/UX feedback", agent: "imani" as const },
]

export default function CommandDeskPage() {
  return (
    <div className="min-h-screen bg-[#0d1117] text-white">
      <Navbar />

      <main>
        {/* Hero */}
        <section className="relative py-20 overflow-hidden">
          <AetherBackground intensity="medium" />

          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/10 border border-amber-500/20 px-4 py-2 mb-6">
              <Terminal className="h-4 w-4 text-amber-400" />
              <span className="text-sm text-amber-400">Command Desk</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              <span className="text-white">Your terminal{"'s"}</span>
              <br />
              <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
                new sidekick
              </span>
            </h1>

            <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-8">
              Slash commands that route to the right agent. Constitutional AI verification on every action. Full control
              at your fingertips.
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <Button className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-3">
                Install CLI <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button variant="outline" className="border-white/20 hover:bg-white/5 px-6 py-3 bg-transparent">
                View Commands
              </Button>
            </div>
          </div>
        </section>

        {/* Terminal Demo */}
        <section className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <div className="rounded-xl border border-white/10 bg-[#0d1117] overflow-hidden shadow-2xl">
              {/* Terminal header */}
              <div className="flex items-center gap-2 px-4 py-3 bg-[#161b22] border-b border-white/10">
                <div className="flex gap-2">
                  <div className="h-3 w-3 rounded-full bg-red-500" />
                  <div className="h-3 w-3 rounded-full bg-yellow-500" />
                  <div className="h-3 w-3 rounded-full bg-green-500" />
                </div>
                <span className="ml-4 text-sm text-gray-400">buildspaces ~ Command Desk</span>
              </div>

              {/* Terminal content */}
              <div className="p-4 font-mono text-sm space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-emerald-400">$</span>
                  <span className="text-amber-400">/generate</span>
                  <span className="text-white">{'"Create a user authentication system with OAuth"'}</span>
                </div>

                <div className="pl-4 space-y-2">
                  <div className="flex items-center gap-2 text-gray-400">
                    <AfricanAgentAvatar agent="elara" size="sm" showAura={false} />
                    <span>Routing to Sankofa...</span>
                  </div>

                  <div className="flex items-center gap-2 text-gray-400">
                    <Shield className="h-4 w-4 text-emerald-400" />
                    <span className="text-emerald-400">Constitutional check: PASSED</span>
                  </div>

                  <div className="flex items-center gap-2 text-gray-400">
                    <AfricanAgentAvatar agent="sankofa" size="sm" showAura={false} />
                    <span>Generating authentication module...</span>
                  </div>

                  <div className="flex items-center gap-2 text-emerald-400">
                    <Check className="h-4 w-4" />
                    <span>Created 5 files in src/auth/</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-4">
                  <span className="text-emerald-400">$</span>
                  <span className="text-amber-400">/security</span>
                  <span className="text-white">src/auth/</span>
                </div>

                <div className="pl-4 space-y-2">
                  <div className="flex items-center gap-2 text-gray-400">
                    <AfricanAgentAvatar agent="jabari" size="sm" showAura={false} />
                    <span>Running security audit...</span>
                  </div>

                  <div className="flex items-center gap-2 text-emerald-400">
                    <Check className="h-4 w-4" />
                    <span>No vulnerabilities found</span>
                  </div>

                  <div className="flex items-center gap-2 text-amber-400">
                    <AlertTriangle className="h-4 w-4" />
                    <span>Suggestion: Add rate limiting to login endpoint</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-4">
                  <span className="text-emerald-400">$</span>
                  <span className="animate-pulse">_</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Commands Grid */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <h2 className="text-3xl font-bold text-center mb-12">Available Commands</h2>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {commands.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 rounded-xl bg-white/5 border border-white/10 p-4 hover:border-amber-500/50 transition-colors"
                >
                  <AfricanAgentAvatar agent={item.agent} size="md" showAura={false} />
                  <div>
                    <code className="text-amber-400 font-mono">{item.cmd}</code>
                    <p className="text-sm text-gray-400">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-transparent via-white/5 to-transparent">
          <div className="mx-auto max-w-7xl">
            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  icon: Command,
                  title: "Slash Commands",
                  description: "Intuitive command interface that routes to the right agent automatically.",
                },
                {
                  icon: Shield,
                  title: "Constitutional Gates",
                  description: "Every action verified against your rules before execution.",
                },
                {
                  icon: History,
                  title: "Command History",
                  description: "Full audit log of all commands with undo capabilities.",
                },
                {
                  icon: Zap,
                  title: "Auto-complete",
                  description: "Smart suggestions based on context and past usage.",
                },
                {
                  icon: Sparkles,
                  title: "Natural Language",
                  description: 'Just describe what you want. "Make the button blue" works.',
                },
                {
                  icon: Terminal,
                  title: "Shell Integration",
                  description: "Works in your existing terminal with zero configuration.",
                },
              ].map((feature, i) => (
                <div
                  key={i}
                  className="rounded-xl bg-white/5 border border-white/10 p-6 hover:border-amber-500/50 transition-colors"
                >
                  <feature.icon className="h-8 w-8 text-amber-400 mb-4" />
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
