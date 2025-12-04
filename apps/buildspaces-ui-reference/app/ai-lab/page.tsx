"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  Brain,
  Sparkles,
  Settings,
  Play,
  Pause,
  RefreshCw,
  ArrowLeft,
  Code2,
  Database,
  Shield,
  Palette,
  MessageSquare,
  Clock,
  CheckCircle2,
  TrendingUp,
  Users,
  Target,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"

interface Agent {
  id: string
  name: string
  role: string
  icon: any
  color: string
  status: "active" | "idle" | "processing"
  tasksCompleted: number
  successRate: number
  avgResponseTime: string
  currentTask?: string
}

interface SystemMetric {
  label: string
  value: string | number
  change: number
  icon: any
}

const agents: Agent[] = [
  {
    id: "elara",
    name: "Elara",
    role: "XO Architect",
    icon: Sparkles,
    color: "from-primary to-emerald-400",
    status: "active",
    tasksCompleted: 1247,
    successRate: 98.5,
    avgResponseTime: "1.2s",
    currentTask: "Coordinating auth implementation",
  },
  {
    id: "sankofa",
    name: "Sankofa",
    role: "Code Specialist",
    icon: Code2,
    color: "from-accent to-purple-400",
    status: "processing",
    tasksCompleted: 892,
    successRate: 96.2,
    avgResponseTime: "2.1s",
    currentTask: "Generating component code",
  },
  {
    id: "themba",
    name: "Themba",
    role: "Backend Engineer",
    icon: Database,
    color: "from-amber-500 to-orange-400",
    status: "active",
    tasksCompleted: 654,
    successRate: 97.8,
    avgResponseTime: "1.8s",
    currentTask: "Setting up API routes",
  },
  {
    id: "jabari",
    name: "Jabari",
    role: "Security Guardian",
    icon: Shield,
    color: "from-blue-500 to-cyan-400",
    status: "idle",
    tasksCompleted: 423,
    successRate: 99.1,
    avgResponseTime: "0.9s",
  },
  {
    id: "naledi",
    name: "Naledi",
    role: "Design Lead",
    icon: Palette,
    color: "from-pink-500 to-rose-400",
    status: "idle",
    tasksCompleted: 567,
    successRate: 95.4,
    avgResponseTime: "2.4s",
  },
]

const systemMetrics: SystemMetric[] = [
  { label: "Total Tasks", value: "3,783", change: 12.5, icon: CheckCircle2 },
  { label: "Success Rate", value: "97.4%", change: 2.1, icon: Target },
  { label: "Avg Response", value: "1.7s", change: -8.3, icon: Clock },
  { label: "Active Users", value: "24", change: 18.2, icon: Users },
]

const recentActivity = [
  { id: "1", agent: "Elara", action: "Delegated task to Sankofa", time: "2s ago", status: "success" },
  { id: "2", agent: "Sankofa", action: "Generated LoginForm component", time: "15s ago", status: "success" },
  { id: "3", agent: "Themba", action: "Created /api/auth/login route", time: "32s ago", status: "success" },
  { id: "4", agent: "Jabari", action: "Security scan completed", time: "1m ago", status: "warning" },
  { id: "5", agent: "Elara", action: "Updated project context", time: "2m ago", status: "success" },
]

export default function AILabPage() {
  const [selectedAgent, setSelectedAgent] = useState<string | null>("elara")
  const [isSystemPaused, setIsSystemPaused] = useState(false)

  const selected = agents.find((a) => a.id === selectedAgent)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="h-16 border-b border-border bg-background/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="h-full max-w-7xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/workspace"
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">Back</span>
            </Link>

            <div className="h-6 w-px bg-border" />

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Brain className="w-5 h-5 text-background" />
              </div>
              <div>
                <h1 className="text-lg font-bold">AI Lab</h1>
                <p className="text-xs text-muted-foreground">Agent Management & Analytics</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted">
              <div className={`w-2 h-2 rounded-full ${isSystemPaused ? "bg-amber-500" : "bg-primary animate-pulse"}`} />
              <span className="text-sm font-medium">{isSystemPaused ? "Paused" : "Running"}</span>
            </div>

            <Button variant="outline" size="sm" onClick={() => setIsSystemPaused(!isSystemPaused)}>
              {isSystemPaused ? <Play className="w-4 h-4 mr-1.5" /> : <Pause className="w-4 h-4 mr-1.5" />}
              {isSystemPaused ? "Resume" : "Pause"}
            </Button>

            <Button size="sm">
              <Settings className="w-4 h-4 mr-1.5" />
              Configure
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* System Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {systemMetrics.map((metric) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-xl border border-border bg-card"
            >
              <div className="flex items-center justify-between">
                <metric.icon className="w-5 h-5 text-muted-foreground" />
                <span
                  className={`text-xs font-medium flex items-center gap-1 ${
                    metric.change > 0 ? "text-primary" : "text-amber-500"
                  }`}
                >
                  <TrendingUp className={`w-3 h-3 ${metric.change < 0 ? "rotate-180" : ""}`} />
                  {Math.abs(metric.change)}%
                </span>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-bold">{metric.value}</div>
                <div className="text-xs text-muted-foreground">{metric.label}</div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Agent Grid */}
          <div className="lg:col-span-2">
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="p-4 border-b border-border flex items-center justify-between">
                <h2 className="font-semibold">AI Agent Fleet</h2>
                <Button variant="ghost" size="sm">
                  <RefreshCw className="w-4 h-4 mr-1.5" />
                  Refresh
                </Button>
              </div>

              <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                {agents.map((agent) => (
                  <motion.button
                    key={agent.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedAgent(agent.id)}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      selectedAgent === agent.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50 bg-background"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-12 h-12 rounded-xl bg-gradient-to-br ${agent.color} flex items-center justify-center`}
                      >
                        <agent.icon className="w-6 h-6 text-background" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{agent.name}</span>
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                              agent.status === "active"
                                ? "bg-primary/20 text-primary"
                                : agent.status === "processing"
                                  ? "bg-accent/20 text-accent"
                                  : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {agent.status}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground">{agent.role}</div>

                        {agent.currentTask && (
                          <div className="mt-2 text-xs text-foreground bg-muted/50 px-2 py-1 rounded truncate">
                            {agent.currentTask}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                      <div>
                        <div className="text-sm font-bold">{agent.tasksCompleted}</div>
                        <div className="text-[10px] text-muted-foreground">Tasks</div>
                      </div>
                      <div>
                        <div className="text-sm font-bold text-primary">{agent.successRate}%</div>
                        <div className="text-[10px] text-muted-foreground">Success</div>
                      </div>
                      <div>
                        <div className="text-sm font-bold">{agent.avgResponseTime}</div>
                        <div className="text-[10px] text-muted-foreground">Avg Time</div>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Selected Agent Details */}
            {selected && (
              <motion.div
                key={selected.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="rounded-xl border border-border bg-card overflow-hidden"
              >
                <div className={`h-24 bg-gradient-to-br ${selected.color} relative overflow-hidden`}>
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                  <div className="absolute bottom-4 left-4 flex items-center gap-3">
                    <div className="w-14 h-14 rounded-xl bg-background/20 backdrop-blur-sm flex items-center justify-center">
                      <selected.icon className="w-7 h-7 text-background" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-background">{selected.name}</h3>
                      <p className="text-sm text-background/80">{selected.role}</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg bg-muted/50">
                      <div className="text-xs text-muted-foreground">Status</div>
                      <div className="text-sm font-medium capitalize flex items-center gap-2">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            selected.status === "active"
                              ? "bg-primary animate-pulse"
                              : selected.status === "processing"
                                ? "bg-accent animate-pulse"
                                : "bg-muted-foreground"
                          }`}
                        />
                        {selected.status}
                      </div>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/50">
                      <div className="text-xs text-muted-foreground">Response Time</div>
                      <div className="text-sm font-medium">{selected.avgResponseTime}</div>
                    </div>
                  </div>

                  {selected.currentTask && (
                    <div>
                      <div className="text-xs text-muted-foreground mb-2">Current Task</div>
                      <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                        <div className="text-sm">{selected.currentTask}</div>
                        <Progress value={45} className="h-1 mt-2" />
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1">
                      <MessageSquare className="w-4 h-4 mr-1.5" />
                      Chat
                    </Button>
                    <Button size="sm" variant="outline">
                      <Settings className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Recent Activity */}
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="p-4 border-b border-border">
                <h3 className="font-semibold">Recent Activity</h3>
              </div>
              <div className="divide-y divide-border">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="p-3 flex items-center gap-3">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        activity.status === "success" ? "bg-primary" : "bg-amber-500"
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm truncate">
                        <span className="font-medium">{activity.agent}</span>
                        <span className="text-muted-foreground"> {activity.action}</span>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0">{activity.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
