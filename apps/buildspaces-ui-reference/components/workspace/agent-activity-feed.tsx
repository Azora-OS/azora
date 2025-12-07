"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Bot, Code2, Database, Sparkles, X, Check, Loader2 } from "lucide-react"

interface Activity {
  id: string
  agent: string
  action: string
  status: "active" | "complete" | "pending"
  icon: any
  color: string
}

const mockActivities: Activity[] = [
  {
    id: "1",
    agent: "Elara",
    action: "Coordinating build task",
    status: "complete",
    icon: Sparkles,
    color: "from-primary to-emerald-400",
  },
  {
    id: "2",
    agent: "Sankofa",
    action: "Generating component code",
    status: "active",
    icon: Code2,
    color: "from-accent to-purple-400",
  },
  {
    id: "3",
    agent: "Themba",
    action: "Setting up API routes",
    status: "pending",
    icon: Database,
    color: "from-amber-500 to-orange-400",
  },
]

export function AgentActivityFeed() {
  const [activities, setActivities] = useState<Activity[]>(mockActivities)
  const [isMinimized, setIsMinimized] = useState(false)

  // Simulate activity updates
  useEffect(() => {
    const interval = setInterval(() => {
      setActivities((prev) => {
        const updated = [...prev]
        const activeIndex = updated.findIndex((a) => a.status === "active")
        if (activeIndex !== -1) {
          updated[activeIndex].status = "complete"
          const pendingIndex = updated.findIndex((a) => a.status === "pending")
          if (pendingIndex !== -1) {
            updated[pendingIndex].status = "active"
          }
        }
        return updated
      })
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  if (isMinimized) {
    return (
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        onClick={() => setIsMinimized(false)}
        className="fixed bottom-4 right-4 z-50 w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg glow-primary"
      >
        <Bot className="w-6 h-6 text-background" />
      </motion.button>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-4 right-4 z-50 w-80 rounded-xl border border-border bg-card/95 backdrop-blur-sm shadow-2xl overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="text-sm font-medium text-foreground">Agent Activity</span>
        </div>
        <button onClick={() => setIsMinimized(true)} className="p-1 rounded hover:bg-muted transition-colors">
          <X className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      {/* Activities */}
      <div className="p-3 space-y-2 max-h-64 overflow-auto">
        <AnimatePresence mode="popLayout">
          {activities.map((activity) => (
            <motion.div
              key={activity.id}
              layout
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex items-center gap-3 p-2 rounded-lg bg-muted/50"
            >
              <div
                className={`w-8 h-8 rounded-lg bg-gradient-to-br ${activity.color} flex items-center justify-center shrink-0`}
              >
                <activity.icon className="w-4 h-4 text-background" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-foreground">{activity.agent}</div>
                <div className="text-xs text-muted-foreground truncate">{activity.action}</div>
              </div>
              <div className="shrink-0">
                {activity.status === "complete" && <Check className="w-4 h-4 text-primary" />}
                {activity.status === "active" && <Loader2 className="w-4 h-4 text-accent animate-spin" />}
                {activity.status === "pending" && (
                  <div className="w-4 h-4 rounded-full border-2 border-muted-foreground/30" />
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
