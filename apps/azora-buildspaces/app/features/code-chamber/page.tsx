import { Navbar } from "@/components/features/navbar"
import { Footer } from "@/components/features/footer"
import { CodeChamber } from "@/components/workbench/code-chamber"
import { AetherBackground } from "@/components/ui/aether-background"
import { Button } from "@/components/ui/button"
import { ArrowRight, Code2, Terminal, GitBranch, Zap, Users, Shield } from "lucide-react"

export default function CodeChamberPage() {
  return (
    <div className="min-h-screen bg-[#0d1117] text-white">
      <Navbar />

      <main>
        {/* Hero Section */}
        <section className="relative py-20 overflow-hidden">
          <AetherBackground intensity="medium" />

          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 mb-6">
              <Code2 className="h-4 w-4 text-emerald-400" />
              <span className="text-sm text-emerald-400">Code Chamber</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-balance">
              <span className="text-white">Your cloud IDE,</span>
              <br />
              <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
                powered by AI
              </span>
            </h1>

            <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-8">
              A full-featured development environment in your browser. Code, test, and deploy with AI assistance from
              Elara and the agent team.
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <Button className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3">
                Launch Code Chamber <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="border-white/20 text-white hover:bg-white/5 px-6 py-3 bg-transparent"
              >
                View Documentation
              </Button>
            </div>
          </div>
        </section>

        {/* Live Demo */}
        <section className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <CodeChamber />
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <h2 className="text-3xl font-bold text-center mb-12">Everything you need to build</h2>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  icon: Code2,
                  title: "Monaco Editor",
                  description:
                    "Full VSCode-like editing experience with IntelliSense and syntax highlighting for 50+ languages.",
                },
                {
                  icon: Terminal,
                  title: "Integrated Terminal",
                  description: "Run commands, install packages, and execute scripts directly in your browser.",
                },
                {
                  icon: GitBranch,
                  title: "Git Integration",
                  description: "Commit, push, pull, and manage branches without leaving the editor.",
                },
                {
                  icon: Zap,
                  title: "Live Preview",
                  description: "See your changes instantly with hot module replacement and fast refresh.",
                },
                {
                  icon: Users,
                  title: "Real-time Collaboration",
                  description: "Pair program with teammates using shared cursors and live editing.",
                },
                {
                  icon: Shield,
                  title: "Secure Environment",
                  description: "Isolated containers with enterprise-grade security and compliance.",
                },
              ].map((feature, i) => (
                <div
                  key={i}
                  className="rounded-xl bg-white/5 border border-white/10 p-6 hover:border-emerald-500/50 transition-colors"
                >
                  <feature.icon className="h-8 w-8 text-emerald-400 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-400">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="text-3xl font-bold mb-6">Ready to start building?</h2>
            <p className="text-gray-400 mb-8">Join thousands of developers who ship faster with BuildSpaces.</p>
            <Button className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-4 text-lg">
              Get Started Free <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
