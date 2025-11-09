/*
AZORA PROPRIETARY LICENSE
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved.

SPARK CHAT PANEL - UI component for AI chat
*/

'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Send, Sparkles, User, Bot, Code2 } from 'lucide-react'
import { Button } from '../ui/button'
import { Card } from '../ui/card'
import { Input } from '../ui/input'

/**
 * 💬 SPARK CHAT PANEL
 * 
 * AI chat interface (like ChatGPT in IDE)
 * 
 * @ubuntu Individual questions → Collective understanding
 */
export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  codeExamples?: string[]
  suggestions?: string[]
}

interface SparkChatPanelProps {
  onSendMessage: (
    message: string,
    context?: ChatContext
  ) => Promise<ChatResponse>
  selectedCode?: string
  fileContext?: string
}

interface ChatContext {
  selectedCode?: string
  fileContext?: string
  conversationHistory?: ChatMessage[]
}

interface ChatResponse {
  response: string
  suggestions?: string[]
  codeExamples?: string[]
}

export function SparkChatPanel({
  onSendMessage,
  selectedCode,
  fileContext,
}: SparkChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: ChatMessage = {
      role: 'user',
      content: input,
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await onSendMessage(input, {
        selectedCode,
        fileContext,
        conversationHistory: messages,
      })

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: response.response,
        suggestions: response.suggestions,
        codeExamples: response.codeExamples,
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error('Chat error:', error)
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="flex flex-col h-full border-[var(--sapphire-500)] bg-[var(--sapphire-50)] dark:bg-[var(--sapphire-950)]">
      <div className="p-4 border-b border-[var(--sapphire-200)] dark:border-[var(--sapphire-800)]">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-[var(--sapphire-500)]" />
          <h3 className="font-semibold text-[var(--sapphire-700)] dark:text-[var(--sapphire-300)]">
            Spark Chat
          </h3>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-muted-foreground py-8">
            <Sparkles className="w-12 h-12 mx-auto mb-4 text-[var(--sapphire-500)] opacity-50" />
            <p>Ask Spark anything about your code</p>
            <p className="text-sm mt-2">
              Try: "How do I implement authentication?"
            </p>
          </div>
        )}

        {messages.map((message, idx) => (
          <div
            key={idx}
            className={`flex gap-3 ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {message.role === 'assistant' && (
              <div className="w-8 h-8 rounded-full bg-[var(--sapphire-500)] flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-white" />
              </div>
            )}

            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.role === 'user'
                  ? 'bg-[var(--sapphire-500)] text-white'
                  : 'bg-background border border-[var(--sapphire-200)] dark:border-[var(--sapphire-800)]'
              }`}
            >
              <div className="whitespace-pre-wrap">{message.content}</div>

              {message.codeExamples && message.codeExamples.length > 0 && (
                <div className="mt-3 space-y-2">
                  {message.codeExamples.map((code, codeIdx) => (
                    <div
                      key={codeIdx}
                      className="bg-muted rounded p-2 font-mono text-xs overflow-x-auto"
                    >
                      <Code2 className="w-3 h-3 inline mr-1" />
                      <pre>{code}</pre>
                    </div>
                  ))}
                </div>
              )}

              {message.suggestions && message.suggestions.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {message.suggestions.map((suggestion, sugIdx) => (
                    <button
                      key={sugIdx}
                      onClick={() => setInput(suggestion)}
                      className="text-xs px-2 py-1 rounded bg-[var(--sapphire-100)] dark:bg-[var(--sapphire-900)] text-[var(--sapphire-700)] dark:text-[var(--sapphire-300)] hover:bg-[var(--sapphire-200)] dark:hover:bg-[var(--sapphire-800)]"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {message.role === 'user' && (
              <div className="w-8 h-8 rounded-full bg-[var(--sapphire-300)] dark:bg-[var(--sapphire-700)] flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 text-white" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 rounded-full bg-[var(--sapphire-500)] flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="bg-background border border-[var(--sapphire-200)] dark:border-[var(--sapphire-800)] rounded-lg p-3">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-[var(--sapphire-500)] rounded-full animate-bounce" />
                <div
                  className="w-2 h-2 bg-[var(--sapphire-500)] rounded-full animate-bounce"
                  style={{ animationDelay: '0.1s' }}
                />
                <div
                  className="w-2 h-2 bg-[var(--sapphire-500)] rounded-full animate-bounce"
                  style={{ animationDelay: '0.2s' }}
                />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-[var(--sapphire-200)] dark:border-[var(--sapphire-800)]">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="Ask Spark..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="bg-[var(--sapphire-500)] hover:bg-[var(--sapphire-600)]"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  )
}
