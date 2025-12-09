"use client"

import { Navbar } from "@/components/features/navbar"
import { Footer } from "@/components/features/footer"
import { AetherBackground } from "@/components/ui/aether-background"
import { Button } from "@/components/ui/button"
import { AfricanAgentAvatar } from "@/components/ui/african-agent-avatar"
import {
  ArrowRight,
  Users,
  Video,
  MessageSquare,
  GitPullRequest,
  MousePointer2,
  Share2,
  Mic,
  MonitorPlay,
  UserPlus,
} from "lucide-react"

export default function CollaborationPodPage() {
  return (
    <div className="min-h-screen bg-[#0d1117] text-white">
      <Navbar />

      <main>
        {/* Hero */}
        <section className="relative py-20 overflow-hidden">
          <AetherBackground intensity="medium" />

          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 px-4 py-2 mb-6">
              <Users className="h-4 w-4 text-cyan-400" />
              <span className="text-sm text-cyan-400">Collaboration Pod</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              <span className="text-white">Build together,</span>
              <br />
              <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">
                ship faster
              </span>
            </h1>

            <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-8">
              Real-time pair programming with live cursors, voice chat, and integrated code review. Collaboration that
              feels like {"you're"} in the same room.
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <Button className="bg-cyan-500 hover:bg-cyan-600 text-white px-6 py-3">
                Start a Session <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button variant="outline" className="border-white/20 hover:bg-white/5 px-6 py-3 bg-transparent">
                Invite Team
              </Button>
            </div>
          </div>
        </section>

        {/* Live Session Demo */}
        <section className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="rounded-xl border border-white/10 bg-[#0d1117] overflow-hidden">
              {/* Session Header */}
              <div className="flex items-center justify-between px-4 py-3 bg-[#161b22] border-b border-white/10">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-sm font-medium">Live Session</span>
                  </div>
                  <span className="text-xs text-gray-500">auth-refactor-sprint</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" className="h-8 text-gray-400 hover:text-white">
                    <Mic className="h-4 w-4 mr-1" /> Unmuted
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 text-gray-400 hover:text-white">
                    <Video className="h-4 w-4 mr-1" /> Video
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 text-gray-400 hover:text-white">
                    <MonitorPlay className="h-4 w-4 mr-1" /> Share
                  </Button>
                  <Button size="sm" className="h-8 bg-cyan-500 hover:bg-cyan-600">
                    <UserPlus className="h-4 w-4 mr-1" /> Invite
                  </Button>
                </div>
              </div>

              <div className="flex">
                {/* Code Area with Live Cursors */}
                <div className="flex-1 p-4 bg-[#1e2228] min-h-[400px] relative">
                  <div className="font-mono text-sm space-y-1">
                    {[
                      "import { useState } from 'react'",
                      "import { auth } from '@/lib/auth'",
                      "",
                      "export function LoginForm() {",
                      "  const [email, setEmail] = useState('')",
                      "  const [password, setPassword] = useState('')",
                      "",
                      "  const handleSubmit = async (e) => {",
                      "    e.preventDefault()",
                      "    await auth.signIn({ email, password })",
                      "  }",
                      "",
                      "  return (",
                      "    <form onSubmit={handleSubmit}>",
                      "      {/* Form fields */}",
                      "    </form>",
                      "  )",
                      "}",
                    ].map((line, i) => (
                      <div key={i} className="flex hover:bg-white/5 relative">
                        <span className="w-8 text-right pr-4 text-gray-600 select-none">{i + 1}</span>
                        <code className="text-gray-300">{line}</code>
                        {/* Live cursor indicator */}
                        {i === 9 && (
                          <div className="absolute left-40 top-0 flex items-center gap-1">
                            <div className="w-0.5 h-5 bg-cyan-400 animate-pulse" />
                            <span className="text-[10px] bg-cyan-500 text-white px-1 rounded">Sarah</span>
                          </div>
                        )}
                        {i === 5 && (
                          <div className="absolute left-64 top-0 flex items-center gap-1">
                            <div className="w-0.5 h-5 bg-amber-400 animate-pulse" />
                            <span className="text-[10px] bg-amber-500 text-white px-1 rounded">Mike</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Participants Panel */}
                <div className="w-72 bg-[#0d1117] border-l border-white/10 p-4">
                  <h4 className="text-sm font-medium mb-4">Participants (3)</h4>

                  <div className="space-y-4">
                    {[
                      { name: "You", status: "editing", color: "emerald" },
                      { name: "Sarah Chen", status: "editing line 10", color: "cyan" },
                      { name: "Mike Johnson", status: "viewing", color: "amber" },
                    ].map((user, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div
                          className={`h-8 w-8 rounded-full bg-${user.color}-500/20 border-2 border-${user.color}-500 flex items-center justify-center text-xs font-medium`}
                        >
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{user.name}</p>
                          <p className="text-xs text-gray-500">{user.status}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 pt-4 border-t border-white/10">
                    <h4 className="text-sm font-medium mb-3">AI Assistant</h4>
                    <div className="flex items-center gap-2">
                      <AfricanAgentAvatar agent="elara" size="sm" />
                      <div>
                        <p className="text-sm">Elara</p>
                        <p className="text-xs text-emerald-400">Watching session</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-white/10">
                    <h4 className="text-sm font-medium mb-3">Chat</h4>
                    <div className="space-y-2 text-sm">
                      <div className="bg-white/5 rounded-lg p-2">
                        <span className="text-cyan-400">Sarah:</span> Should we add error handling here?
                      </div>
                      <div className="bg-white/5 rounded-lg p-2">
                        <span className="text-emerald-400">You:</span> Good idea, adding try-catch
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
                  icon: MousePointer2,
                  title: "Live Cursors",
                  description: "See where your teammates are working in real-time with colored cursors.",
                },
                {
                  icon: Video,
                  title: "Video & Voice",
                  description: "Built-in video conferencing without leaving your code.",
                },
                {
                  icon: MessageSquare,
                  title: "Inline Comments",
                  description: "Leave comments on specific lines for async code review.",
                },
                {
                  icon: GitPullRequest,
                  title: "Review Workflow",
                  description: "Request changes, approve, and merge without context switching.",
                },
                {
                  icon: Share2,
                  title: "Screen Share",
                  description: "Share your screen or specific application windows.",
                },
                {
                  icon: Users,
                  title: "Team Presence",
                  description: "See who's online and what they're working on across your org.",
                },
              ].map((feature, i) => (
                <div
                  key={i}
                  className="rounded-xl bg-white/5 border border-white/10 p-6 hover:border-cyan-500/50 transition-colors"
                >
                  <feature.icon className="h-8 w-8 text-cyan-400 mb-4" />
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
