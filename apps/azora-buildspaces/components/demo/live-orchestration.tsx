"use client"

import { useState, useEffect, useRef } from "react"
import { AfricanAgentAvatar, agentStyles } from "@/components/ui/african-agent-avatar"
import { Button } from "@/components/ui/button"
import { Play, Eye, Check, Loader2, ExternalLink, RotateCcw } from "lucide-react"

interface Task {
  id: number
  title: string
  agent: keyof typeof agentStyles
  status: "pending" | "in-progress" | "complete"
}

const demoTasks: Task[] = [
  { id: 1, title: "Create dashboard layout with sidebar navigation", agent: "elara", status: "pending" },
  { id: 2, title: "Build user analytics chart components", agent: "sankofa", status: "pending" },
  { id: 3, title: "Set up authentication with social login", agent: "jabari", status: "pending" },
  { id: 4, title: "Configure database schema and API routes", agent: "themba", status: "pending" },
  { id: 5, title: "Apply design system and polish UI", agent: "imani", status: "pending" },
]

const codeSnippets = [
  `// app/dashboard/page.tsx`,
  `import { DashboardLayout } from "@/components/dashboard-layout"`,
  `import { AnalyticsChart } from "@/components/analytics-chart"`,
  `import { UserStats } from "@/components/user-stats"`,
  `import { getSession } from "@/lib/auth"`,
  ``,
  `export default async function DashboardPage() {`,
  `  const session = await getSession()`,
  `  `,
  `  return (`,
  `    <DashboardLayout user={session.user}>`,
  `      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">`,
  `        <UserStats />`,
  `        <AnalyticsChart type="visitors" />`,
  `        <AnalyticsChart type="revenue" />`,
  `      </div>`,
  `      <RecentActivity />`,
  `    </DashboardLayout>`,
  `  )`,
  `}`,
]

export function LiveOrchestrationDemo() {
  const [tasks, setTasks] = useState<Task[]>(demoTasks)
  const [isRunning, setIsRunning] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0)
  const [codeLines, setCodeLines] = useState<string[]>([])
  const [activeTypingLine, setActiveTypingLine] = useState("")
  const codeRef = useRef<HTMLDivElement>(null)
  const tasksRef = useRef(tasks.length)

  useEffect(() => {
    tasksRef.current = tasks.length
  }, [tasks.length])

  useEffect(() => {
    if (!isRunning) return
    if (currentTaskIndex >= tasksRef.current) {
      const id = requestAnimationFrame(() => setIsRunning(false))
      return () => cancelAnimationFrame(id)
    }

    // Mark current task as in-progress
    const rafId = requestAnimationFrame(() => setTasks((prev) => prev.map((t, i) => (i === currentTaskIndex ? { ...t, status: "in-progress" } : t))))

    // Ensure we cancel the rAF if effect cleans up early
    const cleanupRaf = () => cancelAnimationFrame(rafId)

    // Type out code for first task
    if (currentTaskIndex === 0 && codeLines.length < codeSnippets.length) {
      const typeCode = async () => {
        for (let lineIdx = codeLines.length; lineIdx < codeSnippets.length; lineIdx++) {
          const line = codeSnippets[lineIdx]
          // Type each character
          for (let charIdx = 0; charIdx <= line.length; charIdx++) {
            await new Promise((r) => setTimeout(r, 15))
            setActiveTypingLine(line.substring(0, charIdx))
          }
          setCodeLines((prev) => [...prev, line])
          setActiveTypingLine("")
          if (codeRef.current) {
            codeRef.current.scrollTop = codeRef.current.scrollHeight
          }
        }
      }
      typeCode()
    }

    // Complete task after delay
    const timer = setTimeout(
      () => {
        setTasks((prev) => prev.map((t, i) => (i === currentTaskIndex ? { ...t, status: "complete" } : t)))
        setCurrentTaskIndex((prev) => prev + 1)
      },
      currentTaskIndex === 0 ? 4000 : 2000,
    )

    return () => {
      clearTimeout(timer)
      cleanupRaf()
    }
  }, [isRunning, currentTaskIndex, codeLines.length])

  const startDemo = () => {
    setTasks(demoTasks.map((t) => ({ ...t, status: "pending" })))
    setCodeLines([])
    setActiveTypingLine("")
    setCurrentTaskIndex(0)
    setIsRunning(true)
    setShowPreview(false)
  }

  const allComplete = tasks.every((t) => t.status === "complete")

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <AfricanAgentAvatar agent="elara" size="lg" trackMouse />
          <div>
            <h3 className="text-xl font-bold text-white">BuildSpaces Workspace</h3>
            <p className="text-sm text-gray-400">
              {isRunning ? "Elara is orchestrating the team..." : "Elara is ready to build"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {allComplete && !showPreview && (
            <Button onClick={() => setShowPreview(true)} className="bg-emerald-500 hover:bg-emerald-600">
              <Eye className="mr-2 h-4 w-4" /> Preview App
            </Button>
          )}
          <Button
            onClick={startDemo}
            disabled={isRunning}
            variant={isRunning ? "outline" : "default"}
            className={isRunning ? "bg-transparent border-emerald-500/50" : "bg-emerald-500 hover:bg-emerald-600"}
          >
            {isRunning ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Building...
              </>
            ) : allComplete ? (
              <>
                <RotateCcw className="mr-2 h-4 w-4" /> Restart Demo
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" /> Start Demo
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Task list */}
        <div className="rounded-xl bg-[#161b22] border border-white/10 overflow-hidden">
          <div className="px-4 py-3 border-b border-white/10 bg-white/5 flex items-center justify-between">
            <h4 className="font-semibold text-white">Agent Tasks</h4>
            <span className="text-xs text-gray-500">
              {tasks.filter((t) => t.status === "complete").length}/{tasks.length} complete
            </span>
          </div>
          <div className="p-4 space-y-3">
            {tasks.map((task, i) => {
              const style = agentStyles[task.agent]
              return (
                <div
                  key={task.id}
                  className={`flex items-center gap-4 p-3 rounded-lg transition-all duration-300 ${
                    task.status === "in-progress"
                      ? "bg-emerald-500/10 border border-emerald-500/30 shadow-lg shadow-emerald-500/10"
                      : task.status === "complete"
                        ? "bg-white/5 border border-white/10"
                        : "bg-white/[0.02] border border-transparent"
                  }`}
                >
                  {/* Status indicator */}
                  <div className="flex-shrink-0">
                    {task.status === "complete" ? (
                      <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center">
                        <Check className="h-5 w-5 text-white" />
                      </div>
                    ) : task.status === "in-progress" ? (
                      <AfricanAgentAvatar agent={task.agent} size="sm" showAura />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-gray-500 text-sm font-medium">
                        {i + 1}
                      </div>
                    )}
                  </div>

                  {/* Task info */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${task.status === "pending" ? "text-gray-500" : "text-white"}`}>
                      {task.title}
                    </p>
                    {task.status === "in-progress" && (
                      <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        {style.name} is working...
                      </p>
                    )}
                  </div>

                  {/* Agent badge */}
                  <div
                    className={`px-2.5 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${style.gradient} bg-clip-text text-transparent border border-white/10`}
                  >
                    {style.name}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Code output / Preview */}
        <div className="rounded-xl bg-[#161b22] border border-white/10 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-white/5">
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
              </div>
              <span className="text-sm text-gray-400 ml-2">
                {showPreview ? "preview.buildspaces.dev" : "dashboard/page.tsx"}
              </span>
            </div>
            {showPreview && (
              <Button size="sm" variant="ghost" className="h-7 text-xs text-gray-400 hover:text-white">
                <ExternalLink className="h-3 w-3 mr-1" /> Open
              </Button>
            )}
          </div>

          {showPreview ? (
            // Live preview mockup
            <div className="p-4 h-[400px] bg-[#0d1117]">
              <div className="h-full rounded-lg bg-gradient-to-br from-[#1a1f2e] to-[#0d1117] border border-white/10 overflow-hidden">
                <div className="flex h-full">
                  {/* Sidebar */}
                  <div className="w-16 bg-white/5 border-r border-white/10 p-3 space-y-4">
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                      <div className="w-5 h-5 rounded bg-emerald-500" />
                    </div>
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 transition-colors" />
                    ))}
                  </div>
                  {/* Main content */}
                  <div className="flex-1 p-4 overflow-hidden">
                    <div className="flex items-center justify-between mb-4">
                      <div className="h-6 w-32 bg-white/10 rounded" />
                      <div className="flex gap-2">
                        <div className="h-8 w-20 bg-white/10 rounded" />
                        <div className="h-8 w-24 bg-emerald-500/30 rounded" />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      {[
                        { color: "emerald", value: "2,845" },
                        { color: "amber", value: "$12.4k" },
                        { color: "cyan", value: "94.2%" },
                      ].map((stat, i) => (
                        <div key={i} className="h-24 rounded-lg bg-white/5 p-3">
                          <div className="h-3 w-16 bg-white/10 rounded mb-2" />
                          <div className={`text-xl font-bold text-${stat.color}-400`}>{stat.value}</div>
                        </div>
                      ))}
                    </div>
                    <div className="h-44 rounded-lg bg-white/5 p-4">
                      <div className="h-3 w-24 bg-white/10 rounded mb-4" />
                      <div className="h-28 bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-cyan-500/20 rounded flex items-end p-2 gap-1">
                        {[60, 80, 45, 90, 70, 85, 50, 75, 65, 95, 55, 88].map((h, i) => (
                          <div
                            key={i}
                            className="flex-1 bg-emerald-500 rounded-t transition-all duration-500"
                            style={{ height: `${h}%` }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Code view with typing effect
            <div
              ref={codeRef}
              className="p-4 h-[400px] overflow-auto font-mono text-sm bg-[#0d1117]"
              style={{ scrollBehavior: "smooth" }}
            >
              {codeLines.length === 0 && !activeTypingLine ? (
                <div className="text-gray-500 flex items-center justify-center h-full">
                  <p>Click Start Demo to watch agents generate code...</p>
                </div>
              ) : (
                <pre className="text-gray-300">
                  {codeLines.map((line, i) => (
                    <div key={i} className="flex hover:bg-white/5 -mx-4 px-4">
                      <span className="w-8 text-gray-600 select-none text-right pr-4">{i + 1}</span>
                      <code
                        dangerouslySetInnerHTML={{
                          __html: highlightCode(line),
                        }}
                      />
                    </div>
                  ))}
                  {activeTypingLine && (
                    <div className="flex hover:bg-white/5 -mx-4 px-4">
                      <span className="w-8 text-gray-600 select-none text-right pr-4">{codeLines.length + 1}</span>
                      <code
                        dangerouslySetInnerHTML={{
                          __html: highlightCode(activeTypingLine),
                        }}
                      />
                      <span className="inline-block w-2 h-4 bg-emerald-500 animate-pulse ml-0.5" />
                    </div>
                  )}
                </pre>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Enhanced syntax highlighting
function highlightCode(line: string): string {
  return line
    .replace(/(import|export|default|async|const|return|from|function)/g, '<span class="text-pink-400">$1</span>')
    .replace(/(".*?"|'.*?'|`.*?`)/g, '<span class="text-emerald-400">$1</span>')
    .replace(/(await|new|typeof|instanceof)/g, '<span class="text-cyan-400">$1</span>')
    .replace(/(\{|\}|$$|$$|\[|\])/g, '<span class="text-yellow-300">$1</span>')
    .replace(/(\/\/.*)/g, '<span class="text-gray-500">$1</span>')
    .replace(/(&lt;[A-Z][a-zA-Z]*)/g, '<span class="text-blue-400">$1</span>')
    .replace(/(className)/g, '<span class="text-amber-400">$1</span>')
}
