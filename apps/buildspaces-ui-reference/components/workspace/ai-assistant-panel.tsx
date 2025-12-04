"use client"

import { useState, useRef, useEffect } from "react"
import { Send, Sparkles, Bot, User, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  agent?: string
  timestamp: Date
}

const initialMessages: Message[] = [
  {
    id: "1",
    role: "assistant",
    content:
      "Hello! I'm Elara, your XO Architect. I coordinate our AI team to bring your vision to life. What would you like to build today?",
    agent: "Elara",
    timestamp: new Date(),
  },
]

export function AIAssistantPanel() {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async () => {
    if (!input.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsTyping(true)

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          "I'll coordinate the team to help you with that. Let me delegate this task to our specialized agents:\n\n**Sankofa** will handle the component structure\n**Themba** will set up the backend infrastructure\n\nGenerating your solution now...",
        agent: "Elara",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, aiResponse])
      setIsTyping(false)
    }, 1500)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-background" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Elara</h3>
            <p className="text-xs text-primary">XO Architect • Online</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-auto p-4 space-y-4">
        <AnimatePresence mode="popLayout">
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`flex gap-3 ${message.role === "user" ? "flex-row-reverse" : ""}`}
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  message.role === "user" ? "bg-muted" : "bg-gradient-to-br from-primary to-accent"
                }`}
              >
                {message.role === "user" ? (
                  <User className="w-4 h-4 text-foreground" />
                ) : (
                  <Bot className="w-4 h-4 text-background" />
                )}
              </div>
              <div className={`flex-1 max-w-[85%] ${message.role === "user" ? "text-right" : ""}`}>
                {message.agent && <span className="text-xs text-primary font-medium">{message.agent}</span>}
                <div
                  className={`mt-1 p-3 rounded-xl text-sm ${
                    message.role === "user" ? "bg-primary text-primary-foreground ml-auto" : "bg-muted text-foreground"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isTyping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 text-muted-foreground"
          >
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">Elara is thinking...</span>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask Elara anything..."
            className="flex-1 px-4 py-2.5 rounded-xl bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
          />
          <Button
            onClick={handleSend}
            size="icon"
            className="h-10 w-10 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
