"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Play, MessageSquare, Send, Bot, Sparkles, Check } from "lucide-react"
import { Button } from "@/components/ui/button"

const demoSteps = [
  { prompt: "Create a dashboard with user analytics", status: "complete" },
  { prompt: "Add authentication with social login", status: "complete" },
  { prompt: "Build a real-time notification system", status: "active" },
  { prompt: "Deploy to production", status: "pending" },
]

export function DemoSection() {
  const [inputValue, setInputValue] = useState("")

  return (
    <section className="relative py-32 overflow-hidden">
      <div className="absolute inset-0 gradient-mesh opacity-30" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="text-primary text-sm font-semibold tracking-wider uppercase">See it in Action</span>
          <h2 className="mt-4 text-4xl sm:text-5xl font-bold tracking-tight text-balance">
            From idea to{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">production</span> in
            minutes
          </h2>
          <p className="mt-6 text-lg text-muted-foreground text-pretty">
            Just describe what you want to build. Elara and the team handle the rest.
          </p>
        </motion.div>

        {/* Demo Interface */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto"
        >
          <div className="rounded-2xl border border-border bg-card/80 backdrop-blur-sm overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-background" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">BuildSpaces Workspace</h3>
                  <p className="text-xs text-muted-foreground">Elara is ready to build</p>
                </div>
              </div>
              <Button variant="outline" size="sm">
                <Play className="w-4 h-4 mr-2" />
                Live Demo
              </Button>
            </div>

            {/* Chat Area */}
            <div className="p-6 space-y-4 min-h-[300px] bg-background/50">
              {demoSteps.map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="flex gap-4"
                >
                  {/* Status Indicator */}
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                      step.status === "complete"
                        ? "bg-primary text-primary-foreground"
                        : step.status === "active"
                          ? "bg-accent text-accent-foreground animate-pulse"
                          : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {step.status === "complete" ? (
                      <Check className="w-4 h-4" />
                    ) : step.status === "active" ? (
                      <Bot className="w-4 h-4" />
                    ) : (
                      <span className="text-xs">{index + 1}</span>
                    )}
                  </div>

                  {/* Message */}
                  <div
                    className={`flex-1 p-4 rounded-xl ${
                      step.status === "complete"
                        ? "bg-primary/10 border border-primary/20"
                        : step.status === "active"
                          ? "bg-accent/10 border border-accent/20"
                          : "bg-muted/50 border border-border"
                    }`}
                  >
                    <p className={`text-sm ${step.status === "pending" ? "text-muted-foreground" : "text-foreground"}`}>
                      {step.prompt}
                    </p>
                    {step.status === "active" && (
                      <div className="flex items-center gap-2 mt-2 text-xs text-accent">
                        <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                        Elara is coordinating agents...
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Input Area */}
            <div className="px-6 py-4 border-t border-border bg-muted/30">
              <div className="flex items-center gap-3">
                <div className="flex-1 relative">
                  <MessageSquare className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Describe what you want to build..."
                    className="w-full pl-12 pr-4 py-3 rounded-xl bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                  />
                </div>
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90 h-12 px-6">
                  <Send className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
