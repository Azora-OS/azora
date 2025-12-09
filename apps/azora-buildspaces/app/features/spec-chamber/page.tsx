import { Navbar } from "@/components/features/navbar"
import { Footer } from "@/components/features/footer"
import { AetherBackground } from "@/components/ui/aether-background"
import { Button } from "@/components/ui/button"
import { AfricanAgentAvatar } from "@/components/ui/african-agent-avatar"
import { ArrowRight, FileText, Check, AlertCircle, Code2, TestTube, BookOpen, Zap } from "lucide-react"

const specExample = `# User Authentication Spec
version: "1.0"
name: user-auth-module

requirements:
  - id: AUTH-001
    title: User Registration
    description: Users can create accounts with email/password
    acceptance:
      - Valid email format required
      - Password minimum 8 characters
      - Email confirmation sent
    priority: high

  - id: AUTH-002
    title: Login Flow
    description: Secure login with rate limiting
    acceptance:
      - Support email/password login
      - Rate limit: 5 attempts per minute
      - JWT token returned on success
    priority: high

  - id: AUTH-003
    title: Password Reset
    description: Self-service password reset
    acceptance:
      - Reset link expires in 1 hour
      - Invalidate previous tokens
    priority: medium

tests:
  - spec: AUTH-001
    cases:
      - input: { email: "test@example.com", password: "secure123" }
        expected: { success: true, emailSent: true }
      - input: { email: "invalid", password: "123" }
        expected: { success: false, errors: ["invalid_email", "weak_password"] }`

export default function SpecChamberPage() {
  return (
    <div className="min-h-screen bg-[#0d1117] text-white">
      <Navbar />

      <main>
        {/* Hero */}
        <section className="relative py-20 overflow-hidden">
          <AetherBackground intensity="medium" />

          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/10 border border-blue-500/20 px-4 py-2 mb-6">
              <FileText className="h-4 w-4 text-blue-400" />
              <span className="text-sm text-blue-400">Spec Chamber</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              <span className="text-white">Define it right,</span>
              <br />
              <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-violet-400 bg-clip-text text-transparent">
                build it once
              </span>
            </h1>

            <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-8">
              Write specifications in YAML or JSON. Get real-time validation, automatic test generation, and AI-powered
              completeness checking.
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <Button className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3">
                Open Spec Chamber <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button variant="outline" className="border-white/20 hover:bg-white/5 px-6 py-3 bg-transparent">
                View Examples
              </Button>
            </div>
          </div>
        </section>

        {/* Live Demo */}
        <section className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="rounded-xl border border-white/10 bg-[#0d1117] overflow-hidden">
              {/* Toolbar */}
              <div className="flex items-center justify-between px-4 py-2 bg-[#161b22] border-b border-white/10">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-blue-400" />
                  <span className="text-sm font-medium">auth-spec.yaml</span>
                  <span className="text-xs text-emerald-400 flex items-center gap-1">
                    <Check className="h-3 w-3" /> Valid
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" className="h-7 text-gray-400 hover:text-white">
                    <TestTube className="h-4 w-4 mr-1" /> Generate Tests
                  </Button>
                  <Button variant="ghost" size="sm" className="h-7 text-gray-400 hover:text-white">
                    <Code2 className="h-4 w-4 mr-1" /> Generate Code
                  </Button>
                </div>
              </div>

              <div className="flex">
                {/* Editor */}
                <div className="flex-1 p-4 font-mono text-sm overflow-auto max-h-[500px] bg-[#1e2228]">
                  <pre className="text-gray-300">
                    {specExample.split("\n").map((line, i) => (
                      <div key={i} className="flex hover:bg-white/5">
                        <span className="w-8 text-right pr-4 text-gray-600 select-none">{i + 1}</span>
                        <code
                          className={
                            line.startsWith("#")
                              ? "text-gray-500"
                              : line.includes(":")
                                ? "text-blue-400"
                                : line.trim().startsWith("-")
                                  ? "text-emerald-400"
                                  : "text-gray-300"
                          }
                        >
                          {line}
                        </code>
                      </div>
                    ))}
                  </pre>
                </div>

                {/* Validation Panel */}
                <div className="w-80 bg-[#0d1117] border-l border-white/10 p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <AfricanAgentAvatar agent="elara" size="sm" />
                    <div>
                      <p className="text-sm font-medium">Spec Analysis</p>
                      <p className="text-xs text-gray-500">by Elara</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3">
                      <div className="flex items-center gap-2 text-emerald-400 text-sm font-medium">
                        <Check className="h-4 w-4" /> Valid Syntax
                      </div>
                    </div>

                    <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3">
                      <div className="flex items-center gap-2 text-emerald-400 text-sm font-medium">
                        <Check className="h-4 w-4" /> 3 Requirements Found
                      </div>
                      <p className="text-xs text-gray-400 mt-1">All have acceptance criteria</p>
                    </div>

                    <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-3">
                      <div className="flex items-center gap-2 text-amber-400 text-sm font-medium">
                        <AlertCircle className="h-4 w-4" /> Suggestion
                      </div>
                      <p className="text-xs text-gray-400 mt-1">Consider adding error handling specs for AUTH-002</p>
                    </div>

                    <div className="rounded-lg bg-white/5 border border-white/10 p-3">
                      <p className="text-xs text-gray-400">Coverage: 85%</p>
                      <div className="mt-2 h-2 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full w-[85%] bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full" />
                      </div>
                    </div>
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
                  icon: FileText,
                  title: "YAML/JSON Specs",
                  description: "Write requirements in familiar formats with syntax highlighting and auto-completion.",
                },
                {
                  icon: Check,
                  title: "Real-time Validation",
                  description: "Instant feedback on spec syntax, completeness, and logical consistency.",
                },
                {
                  icon: TestTube,
                  title: "Test Generation",
                  description: "Automatically generate test cases from acceptance criteria.",
                },
                {
                  icon: Code2,
                  title: "Code Generation",
                  description: "Transform specs into boilerplate code with proper types and structure.",
                },
                {
                  icon: BookOpen,
                  title: "Documentation",
                  description: "Auto-generate beautiful documentation from your specifications.",
                },
                {
                  icon: Zap,
                  title: "AI Completeness",
                  description: "Elara suggests missing requirements and edge cases.",
                },
              ].map((feature, i) => (
                <div
                  key={i}
                  className="rounded-xl bg-white/5 border border-white/10 p-6 hover:border-blue-500/50 transition-colors"
                >
                  <feature.icon className="h-8 w-8 text-blue-400 mb-4" />
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
