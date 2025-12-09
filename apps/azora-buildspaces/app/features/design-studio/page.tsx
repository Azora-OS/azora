import { Navbar } from "@/components/features/navbar"
import { Footer } from "@/components/features/footer"
import { AetherBackground } from "@/components/ui/aether-background"
import { Button } from "@/components/ui/button"
import { AfricanAgentAvatar } from "@/components/ui/african-agent-avatar"
import {
  ArrowRight,
  Palette,
  Figma,
  Accessibility,
  Layers,
  Paintbrush,
  Smartphone,
  Monitor,
  Code2,
  Eye,
} from "lucide-react"

export default function DesignStudioPage() {
  return (
    <div className="min-h-screen bg-[#0d1117] text-white">
      <Navbar />

      <main>
        {/* Hero */}
        <section className="relative py-20 overflow-hidden">
          <AetherBackground intensity="medium" />

          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-purple-500/10 border border-purple-500/20 px-4 py-2 mb-6">
              <Palette className="h-4 w-4 text-purple-400" />
              <span className="text-sm text-purple-400">Design Studio</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              <span className="text-white">From Figma to</span>
              <br />
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-rose-400 bg-clip-text text-transparent">
                production code
              </span>
            </h1>

            <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-8">
              Import your Figma designs and automatically generate accessible, responsive React components with Tailwind
              CSS.
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <Button className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3">
                Open Design Studio <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button variant="outline" className="border-white/20 hover:bg-white/5 px-6 py-3 bg-transparent">
                Connect Figma
              </Button>
            </div>
          </div>
        </section>

        {/* Design Preview */}
        <section className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="rounded-xl border border-white/10 bg-[#0d1117] overflow-hidden">
              {/* Toolbar */}
              <div className="flex items-center justify-between px-4 py-2 bg-[#161b22] border-b border-white/10">
                <div className="flex items-center gap-3">
                  <Figma className="h-5 w-5 text-purple-400" />
                  <span className="text-sm font-medium">Dashboard Components</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" className="h-7 text-gray-400 hover:text-white">
                    <Monitor className="h-4 w-4 mr-1" /> Desktop
                  </Button>
                  <Button variant="ghost" size="sm" className="h-7 text-gray-400 hover:text-white">
                    <Smartphone className="h-4 w-4 mr-1" /> Mobile
                  </Button>
                  <Button variant="ghost" size="sm" className="h-7 text-gray-400 hover:text-white">
                    <Accessibility className="h-4 w-4 mr-1" /> A11y Check
                  </Button>
                </div>
              </div>

              <div className="flex">
                {/* Design Preview */}
                <div className="flex-1 p-8 bg-[#1e2228] min-h-[500px]">
                  <div className="max-w-md mx-auto space-y-4">
                    {/* Card Component Preview */}
                    <div className="rounded-xl bg-white/5 border border-white/10 p-6">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500" />
                        <div>
                          <div className="h-4 w-32 bg-white/20 rounded" />
                          <div className="h-3 w-24 bg-white/10 rounded mt-2" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="h-3 w-full bg-white/10 rounded" />
                        <div className="h-3 w-4/5 bg-white/10 rounded" />
                        <div className="h-3 w-3/5 bg-white/10 rounded" />
                      </div>
                      <div className="flex gap-2 mt-4">
                        <div className="h-8 w-20 bg-purple-500/50 rounded-lg" />
                        <div className="h-8 w-20 bg-white/10 rounded-lg" />
                      </div>
                    </div>

                    {/* Stats Component Preview */}
                    <div className="grid grid-cols-3 gap-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="rounded-lg bg-white/5 border border-white/10 p-4">
                          <div className="h-3 w-12 bg-white/10 rounded mb-2" />
                          <div className="h-6 w-16 bg-white/20 rounded" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Properties Panel */}
                <div className="w-80 bg-[#0d1117] border-l border-white/10 p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <AfricanAgentAvatar agent="imani" size="sm" />
                    <div>
                      <p className="text-sm font-medium">Design Analysis</p>
                      <p className="text-xs text-gray-500">by Imani</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="text-xs uppercase tracking-wider text-gray-500 mb-2">Components Detected</h4>
                      <div className="space-y-2">
                        {["UserCard", "StatWidget", "ActionButton"].map((comp) => (
                          <div
                            key={comp}
                            className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/5 text-sm"
                          >
                            <span>{comp}</span>
                            <Code2 className="h-4 w-4 text-purple-400" />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xs uppercase tracking-wider text-gray-500 mb-2">Accessibility</h4>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-emerald-400 text-sm">
                          <Accessibility className="h-4 w-4" />
                          Color contrast: Pass
                        </div>
                        <div className="flex items-center gap-2 text-emerald-400 text-sm">
                          <Accessibility className="h-4 w-4" />
                          Touch targets: 48px+
                        </div>
                      </div>
                    </div>

                    <Button className="w-full bg-purple-500 hover:bg-purple-600">
                      <Code2 className="h-4 w-4 mr-2" /> Generate Components
                    </Button>
                  </div>
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
                  icon: Figma,
                  title: "Figma Import",
                  description: "Connect your Figma account and import designs directly into the studio.",
                },
                {
                  icon: Layers,
                  title: "Component Extraction",
                  description: "Automatically detect and extract reusable components from your designs.",
                },
                {
                  icon: Code2,
                  title: "React Generation",
                  description: "Generate clean, typed React components with proper props and structure.",
                },
                {
                  icon: Paintbrush,
                  title: "Tailwind CSS",
                  description: "All styles are converted to utility-first Tailwind classes.",
                },
                {
                  icon: Accessibility,
                  title: "A11y Built-in",
                  description: "Automatic WCAG 2.1 compliance checking and ARIA attributes.",
                },
                {
                  icon: Eye,
                  title: "Live Preview",
                  description: "See your generated components in action before exporting.",
                },
              ].map((feature, i) => (
                <div
                  key={i}
                  className="rounded-xl bg-white/5 border border-white/10 p-6 hover:border-purple-500/50 transition-colors"
                >
                  <feature.icon className="h-8 w-8 text-purple-400 mb-4" />
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
