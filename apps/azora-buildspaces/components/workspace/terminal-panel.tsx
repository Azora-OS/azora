"use client"

import { useState, useRef, useEffect } from "react"
import { X, TerminalIcon } from "lucide-react"
import { Button } from "@/components/ui/button"

interface TerminalPanelProps {
  onClose: () => void
}

export function TerminalPanel({ onClose }: TerminalPanelProps) {
  const [history, setHistory] = useState<string[]>([
    "Welcome to BuildSpaces Terminal",
    "Type 'help' for available commands",
    "",
  ])
  const [input, setInput] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)
  const terminalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    terminalRef.current?.scrollTo(0, terminalRef.current.scrollHeight)
  }, [history])

  const handleCommand = (cmd: string) => {
    const newHistory = [...history, `$ ${cmd}`]

    switch (cmd.toLowerCase()) {
      case "help":
        newHistory.push("Available commands: help, clear, ls, npm run dev, npm run build")
        break
      case "clear":
        setHistory([])
        setInput("")
        return
      case "ls":
        newHistory.push("app/  components/  lib/  public/  package.json  tailwind.config.js")
        break
      case "npm run dev":
        newHistory.push("Starting development server...")
        newHistory.push("  ▲ Next.js 15.0.0")
        newHistory.push("  - Local: http://localhost:3000")
        newHistory.push("")
        newHistory.push("✓ Ready in 1.2s")
        break
      case "npm run build":
        newHistory.push("Creating optimized production build...")
        newHistory.push("✓ Compiled successfully")
        break
      default:
        newHistory.push(`Command not found: ${cmd}`)
    }

    newHistory.push("")
    setHistory(newHistory)
    setInput("")
  }

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-muted/30">
        <div className="flex items-center gap-2 text-sm">
          <TerminalIcon className="w-4 h-4 text-muted-foreground" />
          <span className="text-foreground font-medium">Terminal</span>
        </div>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClose}>
          <X className="w-3 h-3" />
        </Button>
      </div>

      {/* Terminal Content */}
      <div
        ref={terminalRef}
        className="flex-1 overflow-auto p-4 font-mono text-sm cursor-text"
        onClick={() => inputRef.current?.focus()}
      >
        {history.map((line, i) => (
          <div key={i} className={line.startsWith("$") ? "text-primary" : "text-muted-foreground"}>
            {line || "\u00A0"}
          </div>
        ))}
        <div className="flex items-center gap-2">
          <span className="text-primary">$</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && input.trim()) {
                handleCommand(input.trim())
              }
            }}
            className="flex-1 bg-transparent outline-none text-foreground"
            autoFocus
          />
        </div>
      </div>
    </div>
  )
}
