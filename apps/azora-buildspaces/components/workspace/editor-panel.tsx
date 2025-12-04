"use client"
import { useState, useEffect } from "react"
import { X, FileCode, ChevronRight, Bot } from "lucide-react"
import dynamic from "next/dynamic"
import { motion, AnimatePresence } from "framer-motion"

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false })

interface EditorPanelProps {
  activeFile: string
  openFiles: string[]
  onFileSelect: (file: string) => void
  onCloseFile: (file: string) => void
}

const fileContents: Record<string, string> = {
  "page.tsx": `"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Sparkles, ArrowRight } from 'lucide-react'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary">
            <Sparkles className="w-4 h-4" />
            <span>AI-Powered Development</span>
          </div>
          
          <h1 className="text-5xl font-bold tracking-tight">
            Welcome to <span className="text-primary">BuildSpaces</span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Build production-ready applications with AI agents
            that understand your vision and execute flawlessly.
          </p>
          
          <div className="flex items-center justify-center gap-4">
            <Button size="lg" className="gap-2">
              Get Started
              <ArrowRight className="w-4 h-4" />
            </Button>
            <Button size="lg" variant="outline">
              Watch Demo
            </Button>
          </div>
        </div>
        
        {/* Features Grid */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <Card key={i} className="p-6">
              <feature.icon className="w-10 h-10 text-primary mb-4" />
              <h3 className="text-lg font-semibold">{feature.title}</h3>
              <p className="text-muted-foreground mt-2">
                {feature.description}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </main>
  )
}

const features = [
  {
    icon: Sparkles,
    title: "AI Agents",
    description: "Multiple specialized agents working together"
  },
  // ... more features
]`,
  "layout.tsx": `import type { Metadata } from "next"
import { Inter, JetBrains_Mono } from 'next/font/google'
import "./globals.css"

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter"
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono"
})

export const metadata: Metadata = {
  title: "Azora BuildSpaces",
  description: "AI-Powered Development Platform",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={\`\${inter.variable} \${jetbrainsMono.variable} font-sans antialiased\`}>
        {children}
      </body>
    </html>
  )
}`,
  "globals.css": `@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 220 16% 4%;
    --foreground: 210 20% 98%;
    --primary: 165 80% 50%;
    --accent: 270 70% 60%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}`,
}

export function EditorPanel({ activeFile, openFiles, onFileSelect, onCloseFile }: EditorPanelProps) {
  const [code, setCode] = useState(fileContents[activeFile] || "// Empty file")
  const [isAiTyping, setIsAiTyping] = useState(false)
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null)

  useEffect(() => {
    setCode(fileContents[activeFile] || "// Empty file")
  }, [activeFile])

  // Simulate AI typing suggestion
  useEffect(() => {
    const timer = setTimeout(() => {
      if (activeFile === "page.tsx") {
        setIsAiTyping(true)
        setTimeout(() => {
          setAiSuggestion("// Elara suggests: Add loading state for better UX")
          setIsAiTyping(false)
        }, 2000)
      }
    }, 5000)
    return () => clearTimeout(timer)
  }, [activeFile])

  const getFileIcon = (name: string) => {
    if (name.endsWith(".tsx")) return "text-blue-400"
    if (name.endsWith(".ts")) return "text-blue-500"
    if (name.endsWith(".css")) return "text-pink-400"
    return "text-muted-foreground"
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-background">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1 px-4 py-1 text-xs text-muted-foreground border-b border-border bg-muted/20">
        <span>app</span>
        <ChevronRight className="w-3 h-3" />
        <span className="text-foreground">{activeFile}</span>
      </div>

      {/* Tabs */}
      <div className="flex items-center border-b border-border bg-muted/30 overflow-x-auto">
        {openFiles.map((tab) => (
          <button
            key={tab}
            onClick={() => onFileSelect(tab)}
            className={`group flex items-center gap-2 px-4 py-2 text-sm border-r border-border transition-colors ${
              activeFile === tab
                ? "bg-background text-foreground border-t-2 border-t-primary -mb-px"
                : "text-muted-foreground hover:text-foreground hover:bg-background/50"
            }`}
          >
            <FileCode className={`w-4 h-4 ${getFileIcon(tab)}`} />
            <span>{tab}</span>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onCloseFile(tab)
              }}
              className="ml-1 p-0.5 rounded hover:bg-muted opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-3 h-3" />
            </button>
          </button>
        ))}
      </div>

      {/* AI Suggestion Banner */}
      <AnimatePresence>
        {(isAiTyping || aiSuggestion) && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-b border-primary/20 bg-primary/5 overflow-hidden"
          >
            <div className="px-4 py-2 flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-emerald-400 flex items-center justify-center">
                <Bot className="w-3 h-3 text-background" />
              </div>
              {isAiTyping ? (
                <div className="flex items-center gap-2 text-sm text-primary">
                  <span>Elara is analyzing</span>
                  <span className="flex gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" />
                    <span
                      className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    />
                    <span
                      className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    />
                  </span>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-between">
                  <span className="text-sm text-foreground">{aiSuggestion}</span>
                  <div className="flex items-center gap-2">
                    <button className="px-2 py-1 rounded text-xs bg-primary text-primary-foreground hover:bg-primary/90">
                      Accept
                    </button>
                    <button
                      className="px-2 py-1 rounded text-xs text-muted-foreground hover:text-foreground"
                      onClick={() => setAiSuggestion(null)}
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Editor */}
      <div className="flex-1 min-h-0">
        <MonacoEditor
          height="100%"
          language={activeFile.endsWith(".css") ? "css" : "typescript"}
          theme="vs-dark"
          value={code}
          onChange={(value) => setCode(value || "")}
          options={{
            minimap: { enabled: false },
            fontSize: 13,
            lineNumbers: "on",
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            wordWrap: "on",
            padding: { top: 16 },
            fontFamily: "var(--font-jetbrains-mono), monospace",
            cursorBlinking: "smooth",
            smoothScrolling: true,
            renderLineHighlight: "all",
            bracketPairColorization: { enabled: true },
          }}
        />
      </div>
    </div>
  )
}
