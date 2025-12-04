"use client"

import { motion } from "framer-motion"
import { ArrowRight, Play, Sparkles, Terminal, GitBranch, Bot, Code2, Palette, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Background Effects */}
      <div className="absolute inset-0 gradient-mesh" />
      <div className="absolute inset-0 grid-pattern opacity-30" />

      {/* Animated Orbs */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY }}
        className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl"
      />
      <motion.div
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{ duration: 10, repeat: Number.POSITIVE_INFINITY }}
        className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl"
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center space-y-8">
          {/* Badge */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium">
              <Sparkles className="w-4 h-4" />
              <span>Powered by Constitutional AI</span>
            </span>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-balance"
          >
            <span className="text-foreground">Build with </span>
            <span className="bg-gradient-to-r from-primary via-emerald-400 to-primary bg-clip-text text-transparent">
              AI Agents
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="max-w-2xl mx-auto text-lg sm:text-xl text-muted-foreground text-pretty"
          >
            Elara orchestrates specialized AI agents to transform your vision into production-ready code. From concept
            to deployment in minutes, not months.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-wrap items-center justify-center gap-4"
          >
            <Link href="/code-chamber">
              <Button
                size="lg"
                className="bg-primary text-primary-foreground hover:bg-primary/90 glow-primary h-12 px-8 text-base"
              >
                Start Building
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              className="h-12 px-8 text-base border-border hover:bg-muted bg-transparent"
            >
              <Play className="w-5 h-5 mr-2" />
              Watch Demo
            </Button>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="pt-8 flex flex-wrap items-center justify-center gap-8 text-sm text-muted-foreground"
          >
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span>99.9% Uptime</span>
            </div>
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4" />
              <span>10M+ Lines Generated</span>
            </div>
            <div className="flex items-center gap-2">
              <GitBranch className="w-4 h-4" />
              <span>Git Integrated</span>
            </div>
          </motion.div>
        </div>

        {/* Hero Visual - Enhanced IDE Preview */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="mt-16 relative"
        >
          <div className="relative rounded-xl border border-border bg-card/50 backdrop-blur-sm overflow-hidden shadow-2xl">
            {/* Window Chrome */}
            <div className="flex items-center gap-2 px-4 py-3 bg-muted/50 border-b border-border">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
              </div>
              <div className="flex-1 text-center">
                <span className="text-xs text-muted-foreground font-mono">buildspaces.azora.dev — Code Chamber</span>
              </div>
            </div>

            {/* IDE Preview */}
            <div className="grid grid-cols-12 min-h-[400px] lg:min-h-[500px]">
              {/* Activity Bar */}
              <div className="col-span-1 border-r border-border bg-sidebar-background p-2 hidden lg:flex flex-col items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-background" />
                </div>
                <div className="w-8 h-8 rounded-lg bg-muted/50 flex items-center justify-center text-muted-foreground">
                  <Code2 className="w-4 h-4" />
                </div>
                <div className="w-8 h-8 rounded-lg bg-muted/50 flex items-center justify-center text-muted-foreground">
                  <GitBranch className="w-4 h-4" />
                </div>
              </div>

              {/* Sidebar */}
              <div className="col-span-3 lg:col-span-2 border-r border-border bg-sidebar-background p-3 hidden sm:block">
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    Explorer
                  </div>
                  {["src", "components", "lib", "app"].map((folder) => (
                    <div
                      key={folder}
                      className="flex items-center gap-2 px-2 py-1.5 rounded text-sm text-sidebar-foreground hover:bg-sidebar-accent cursor-pointer"
                    >
                      <span className="text-primary">▼</span>
                      <span>{folder}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Editor */}
              <div className="col-span-12 sm:col-span-5 lg:col-span-6 bg-background">
                <div className="flex items-center border-b border-border">
                  <div className="px-4 py-2 text-sm bg-muted border-r border-border text-foreground">page.tsx</div>
                  <div className="px-4 py-2 text-sm text-muted-foreground">layout.tsx</div>
                </div>
                <div className="p-4 font-mono text-sm">
                  <div className="space-y-1">
                    <div>
                      <span className="text-accent">export</span> <span className="text-primary">function</span>{" "}
                      <span className="text-foreground">Dashboard</span>() {"{"}
                    </div>
                    <div className="pl-4">
                      <span className="text-accent">return</span> (
                    </div>
                    <div className="pl-8">
                      <span className="text-muted-foreground">{"<"}</span>
                      <span className="text-primary">div</span> <span className="text-accent">className</span>=
                      <span className="text-emerald-400">{'"flex"'}</span>
                      <span className="text-muted-foreground">{">"}</span>
                    </div>
                    <div className="pl-12 text-muted-foreground">{"// Elara is generating..."}</div>
                    <div className="pl-12 flex items-center gap-2">
                      <span className="inline-block w-2 h-4 bg-primary animate-pulse" />
                    </div>
                    <div className="pl-8">
                      <span className="text-muted-foreground">{"</"}</span>
                      <span className="text-primary">div</span>
                      <span className="text-muted-foreground">{">"}</span>
                    </div>
                    <div className="pl-4">)</div>
                    <div>{"}"}</div>
                  </div>
                </div>
              </div>

              {/* Command Desk Panel */}
              <div className="col-span-12 sm:col-span-4 lg:col-span-3 border-l border-border bg-card/50 p-4 hidden sm:block">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                    <Bot className="w-4 h-4 text-background" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold">Elara</div>
                    <div className="text-xs text-primary">XO Architect</div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="p-3 rounded-lg bg-muted/50 text-xs text-muted-foreground">
                    <span className="text-primary font-medium">Building:</span> Dashboard with analytics charts and user
                    metrics
                  </div>

                  {/* Agent Activity */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs">
                      <div className="w-5 h-5 rounded bg-gradient-to-br from-accent to-purple-400 flex items-center justify-center">
                        <Code2 className="w-3 h-3 text-background" />
                      </div>
                      <span className="text-muted-foreground">Sankofa generating components...</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <div className="w-5 h-5 rounded bg-gradient-to-br from-amber-500 to-orange-400 flex items-center justify-center">
                        <Terminal className="w-3 h-3 text-background" />
                      </div>
                      <span className="text-muted-foreground">Themba setting up API routes...</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <div className="w-5 h-5 rounded bg-gradient-to-br from-pink-500 to-rose-400 flex items-center justify-center">
                        <Palette className="w-3 h-3 text-background" />
                      </div>
                      <span className="text-muted-foreground">Naledi applying styles...</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <div className="w-5 h-5 rounded bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
                        <Shield className="w-3 h-3 text-background" />
                      </div>
                      <span className="text-muted-foreground">Jabari security scan queued</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Decorative Glow */}
          <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-3/4 h-40 bg-primary/20 rounded-full blur-3xl" />
        </motion.div>
      </div>
    </section>
  )
}
