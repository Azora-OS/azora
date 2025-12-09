import { Button } from "@/components/ui/button"
import { Check, Loader2, CircleDot, Sparkles } from "lucide-react"

const tasks = [
  { status: "done", text: "Create a dashboard with user analytics" },
  { status: "done", text: "Add authentication with social login" },
  { status: "progress", text: "Build a real-time notification system", agent: "Elara is coordinating agents..." },
  { status: "pending", text: "Deploy to production", number: 4 },
]

export function AgentsSection() {
  return (
    <section id="ai-agents" className="border-t border-white/5 bg-[#0d1117] px-4 py-24">
      <div className="mx-auto max-w-7xl">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Content */}
          <div>
            {/* Badge */}
            <span className="mb-4 inline-block rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1 text-sm text-emerald-400">
              AI Agents
            </span>

            <h2 className="mb-4 text-4xl font-bold text-white sm:text-5xl">
              Your code&apos;s favorite{" "}
              <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                coding agents
              </span>
            </h2>

            <p className="mb-8 text-lg text-gray-400">
              From clearing your backlog to reviewing code, let BuildSpaces agents handle the busywork so you can focus
              on what&apos;s next.
            </p>

            <div className="flex flex-wrap gap-4">
              <Button className="bg-white text-black hover:bg-gray-200">Get started for free</Button>
              <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 bg-transparent">
                See plans & pricing
              </Button>
            </div>
          </div>

          {/* Demo Card */}
          <div className="relative">
            <div className="overflow-hidden rounded-xl border border-white/10 bg-[#161b22] shadow-2xl">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500">
                    <Sparkles className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">BuildSpaces Workspace</h3>
                    <p className="text-sm text-gray-400">Elara is ready to build</p>
                  </div>
                </div>
                <Button size="sm" className="bg-emerald-500 text-white hover:bg-emerald-600">
                  <span className="mr-2">▶</span> Live Demo
                </Button>
              </div>

              {/* Tasks */}
              <div className="space-y-3 p-6">
                {tasks.map((task, i) => (
                  <div
                    key={i}
                    className={`flex items-start gap-3 rounded-lg p-4 ${
                      task.status === "progress" ? "border border-emerald-500/30 bg-emerald-500/5" : "bg-[#0d1117]"
                    }`}
                  >
                    {task.status === "done" && (
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500">
                        <Check className="h-4 w-4 text-white" />
                      </div>
                    )}
                    {task.status === "progress" && (
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20">
                        <Loader2 className="h-4 w-4 animate-spin text-emerald-400" />
                      </div>
                    )}
                    {task.status === "pending" && (
                      <div className="flex h-6 w-6 items-center justify-center rounded-full border border-white/20 text-xs text-gray-400">
                        {task.number}
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="text-sm text-white">{task.text}</p>
                      {task.agent && (
                        <p className="mt-1 flex items-center gap-1 text-xs text-emerald-400">
                          <CircleDot className="h-3 w-3" />
                          {task.agent}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Input */}
              <div className="border-t border-white/10 p-4">
                <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-[#0d1117] px-4 py-3">
                  <input type="checkbox" className="h-4 w-4 rounded border-white/20 bg-transparent" />
                  <span className="flex-1 text-sm text-gray-500">Describe what you want to build...</span>
                  <Button size="sm" className="bg-emerald-500 text-white hover:bg-emerald-600">
                    <span>→</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
