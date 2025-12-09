import { Navbar } from "@/components/features/navbar"
import { Footer } from "@/components/features/footer"
import { AetherBackground } from "@/components/ui/aether-background"
import { AfricanAgentAvatar } from "@/components/ui/african-agent-avatar"
import { agentStyles } from "@/components/ui/agent-styles"
import { Button } from "@/components/ui/button"
import { CitadelLogo } from "@/components/ui/citadel-logo"
import Link from "next/link"
import {
  Code2,
  FileText,
  Palette,
  Brain,
  Terminal,
  Wrench,
  Users,
  ArrowRight,
  Sparkles,
  ChevronRight,
} from "lucide-react"
import { LiveOrchestrationDemo } from "@/components/demo/live-orchestration"

const features = [
  {
    icon: Code2,
    title: "Code Chamber",
    description: "Full-stack cloud IDE with Monaco editor, integrated terminal, and AI pair programming.",
    href: "/features/code-chamber",
    color: "emerald",
    gradient: "from-emerald-500 to-teal-500",
  },
  {
    icon: FileText,
    title: "Spec Chamber",
    description: "Define requirements in YAML/JSON with real-time validation and test generation.",
    href: "/features/spec-chamber",
    color: "blue",
    gradient: "from-blue-500 to-indigo-500",
  },
  {
    icon: Palette,
    title: "Design Studio",
    description: "Import Figma designs, auto-generate React components with accessibility built-in.",
    href: "/features/design-studio",
    color: "purple",
    gradient: "from-purple-500 to-pink-500",
  },
  {
    icon: Brain,
    title: "AI Studio",
    description: "Orchestrate AI agents with context management and multi-model support.",
    href: "/features/ai-studio",
    color: "pink",
    gradient: "from-pink-500 to-rose-500",
  },
  {
    icon: Terminal,
    title: "Command Desk",
    description: "Slash-command interface for agent control with Constitutional AI verification.",
    href: "/features/command-desk",
    color: "amber",
    gradient: "from-amber-500 to-orange-500",
  },
  {
    icon: Wrench,
    title: "Maker Lab",
    description: "Full-stack scaffolding with database design, API generation, and one-click deploy.",
    href: "/features/maker-lab",
    color: "rose",
    gradient: "from-rose-500 to-red-500",
  },
  {
    icon: Users,
    title: "Collaboration Pod",
    description: "Real-time pair programming with video, voice, and shared editing.",
    href: "/features/collaboration-pod",
    color: "cyan",
    gradient: "from-cyan-500 to-blue-500",
  },
]

const agents = [
  { key: "elara" as const, role: "Orchestrates all agents and manages your project context" },
  { key: "sankofa" as const, role: "Generates production-ready code across all frameworks" },
  { key: "themba" as const, role: "Designs infrastructure and handles DevOps automation" },
  { key: "jabari" as const, role: "Scans for vulnerabilities and ensures security compliance" },
  { key: "nia" as const, role: "Analyzes data and generates optimized database queries" },
  { key: "imani" as const, role: "Provides UI/UX feedback and creative direction" },
]

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-[#0d1117] text-white">
      <Navbar />

      <main>
        {/* Hero Section */}
        <section className="relative py-24 overflow-hidden">
          <AetherBackground intensity="high" />

          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {/* Sub-navigation */}
            <nav className="flex items-center justify-center gap-1 mb-12 flex-wrap">
              <Link href="/features" className="px-4 py-2 text-sm font-medium text-white border-b-2 border-emerald-500">
                Features
              </Link>
              <span className="text-gray-600 px-2">/</span>
              {["Code Chamber", "Agents", "CLI", "For Business", "Tutorials", "Plans & Pricing"].map((item) => (
                <Link
                  key={item}
                  href={`/features/${item.toLowerCase().replace(/ & /g, "-").replace(/ /g, "-")}`}
                  className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
                >
                  {item}
                </Link>
              ))}
            </nav>

            <div className="text-center">
              <h1 className="text-5xl md:text-7xl font-bold mb-6 text-balance">
                <span className="text-white">The tools you need to build</span>
                <br />
                <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
                  what you want
                </span>
              </h1>

              <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-12">
                Seven interconnected rooms. One unified platform. Powered by Constitutional AI and African-inspired
                excellence.
              </p>
            </div>
          </div>
        </section>

        {/* Quick Feature Cards */}
        <section className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="grid md:grid-cols-2 gap-6">
              {/* AI Agents Card */}
              <Link
                href="/features/agents"
                className="group relative rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 p-8 hover:border-emerald-500/50 transition-all overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex -space-x-4">
                      {(["elara", "sankofa", "themba"] as const).map((agent) => (
                        <AfricanAgentAvatar key={agent} agent={agent} size="lg" showAura={false} />
                      ))}
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Meet the AI Agents</h3>
                  <p className="text-gray-400 mb-4">
                    African Android humanoids powered by Constitutional AI. Each specialized for different tasks.
                  </p>
                  <span className="text-emerald-400 flex items-center gap-1 text-sm font-medium group-hover:gap-2 transition-all">
                    Learn more <ChevronRight className="h-4 w-4" />
                  </span>
                </div>
              </Link>

              {/* The 7 Rooms Card */}
              <Link
                href="#rooms"
                className="group relative rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 p-8 hover:border-emerald-500/50 transition-all overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative">
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="h-10 w-10 text-amber-400" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">The 7 Rooms</h3>
                  <p className="text-gray-400 mb-4">
                    Code Chamber, Spec Chamber, Design Studio, AI Studio, Command Desk, Maker Lab, and Collaboration
                    Pod.
                  </p>
                  <span className="text-amber-400 flex items-center gap-1 text-sm font-medium group-hover:gap-2 transition-all">
                    Explore rooms <ChevronRight className="h-4 w-4" />
                  </span>
                </div>
              </Link>
            </div>
          </div>
        </section>

        {/* Live Demo Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-transparent via-emerald-500/5 to-transparent">
          <div className="mx-auto max-w-7xl">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">
                From <span className="text-emerald-400">idea</span> to{" "}
                <span className="text-emerald-400">production</span> in minutes
              </h2>
              <p className="text-gray-400 max-w-2xl mx-auto">
                Just describe what you want to build. Elara and the team handle the rest.
              </p>
            </div>

            <LiveOrchestrationDemo />
          </div>
        </section>

        {/* The 7 Rooms Section */}
        <section id="rooms" className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">The 7 Rooms</h2>
              <p className="text-gray-400 max-w-2xl mx-auto">
                Each room is a specialized environment designed for a specific phase of development. Together, they form
                the complete BuildSpaces experience.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, i) => (
                <Link
                  key={feature.title}
                  href={feature.href}
                  className="group relative rounded-xl bg-white/5 border border-white/10 p-6 hover:border-white/20 transition-all hover:transform hover:scale-[1.02]"
                >
                  <div
                    className={`absolute inset-0 rounded-xl bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-1 transition-opacity`}
                  />
                  <div className="relative">
                    <div
                      className={`inline-flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-br ${feature.gradient} mb-4`}
                    >
                      <feature.icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2 group-hover:text-emerald-400 transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-gray-400 text-sm">{feature.description}</p>
                    <div className="mt-4 flex items-center gap-1 text-sm text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      Learn more <ArrowRight className="h-4 w-4" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* AI Agents Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-transparent via-emerald-500/5 to-transparent">
          <div className="mx-auto max-w-7xl">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">Your AI Agent Team</h2>
              <p className="text-gray-400 max-w-2xl mx-auto">
                African Android humanoids, each with specialized skills. Move your mouse and watch them follow.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {agents.map(({ key, role }) => {
                const style = agentStyles[key]
                return (
                  <div
                    key={key}
                    className="flex flex-col items-center text-center p-6 rounded-xl bg-white/5 border border-white/10"
                  >
                    <AfricanAgentAvatar agent={key} size="xl" trackMouse />
                    <h3 className="mt-4 text-lg font-semibold">{style.name}</h3>
                    <p
                      className={`text-sm bg-gradient-to-r ${style.gradient} bg-clip-text text-transparent font-medium`}
                    >
                      {style.description}
                    </p>
                    <p className="mt-2 text-gray-400 text-sm">{role}</p>
                  </div>
                )
              })}
            </div>

            <div className="mt-12 text-center">
              <Button asChild className="bg-emerald-500 hover:bg-emerald-600">
                <Link href="/features/agents">
                  Meet all agents <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="grid md:grid-cols-4 gap-8 text-center">
              {[
                { value: "99.9%", label: "Uptime" },
                { value: "10M+", label: "Lines Generated" },
                { value: "50+", label: "Languages Supported" },
                { value: "24/7", label: "AI Assistance" },
              ].map((stat, i) => (
                <div key={i}>
                  <div className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                    {stat.value}
                  </div>
                  <div className="text-gray-400 mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <div className="relative rounded-2xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30 p-12 text-center overflow-hidden">
              <div className="absolute inset-0 bg-[url('/abstract-geometric-pattern.png')] opacity-5" />
              <div className="relative">
                <CitadelLogo size="lg" className="mx-auto mb-6" />
                <h2 className="text-3xl font-bold mb-4">Ready to enter the Citadel?</h2>
                <p className="text-gray-400 mb-8 max-w-xl mx-auto">
                  Join thousands of developers building the future with AI-powered development tools.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <Button className="bg-emerald-500 hover:bg-emerald-600 px-8 py-3 text-lg">
                    Get Started Free <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                  <Button
                    variant="outline"
                    className="border-white/20 hover:bg-white/5 px-8 py-3 text-lg bg-transparent"
                  >
                    Contact Sales
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
