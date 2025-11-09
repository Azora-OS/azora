/*
AZORA PROPRIETARY LICENSE
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved.

SPARK COMPLETION PANEL - UI component for code completion
*/

'use client'

import React, { useState, useEffect } from 'react'
import { Sparkles, Zap, Check, X, ChevronDown } from 'lucide-react'
import { Button } from '../ui/button'
import { Card } from '../ui/card'

/**
 * ✨ SPARK COMPLETION PANEL
 * 
 * Displays code completion suggestions from Spark
 * 
 * @ubuntu Individual completion → Collective code quality
 */
export interface SparkCompletion {
  completion: string
  alternatives: string[]
  confidence: number
  explanation?: string
}

interface SparkCompletionPanelProps {
  completion: SparkCompletion | null
  onAccept: (completion: string) => void
  onReject: () => void
  onSelectAlternative?: (alternative: string) => void
  isLoading?: boolean
}

export function SparkCompletionPanel({
  completion,
  onAccept,
  onReject,
  onSelectAlternative,
  isLoading = false,
}: SparkCompletionPanelProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [showAlternatives, setShowAlternatives] = useState(false)

  if (!completion && !isLoading) {
    return null
  }

  if (isLoading) {
    return (
      <Card className="p-4 border-[var(--sapphire-500)] bg-[var(--sapphire-50)] dark:bg-[var(--sapphire-950)]">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[var(--sapphire-500)] animate-pulse" />
          <span className="text-sm text-[var(--sapphire-700)] dark:text-[var(--sapphire-300)]">
            Spark is thinking...
          </span>
        </div>
      </Card>
    )
  }

  const suggestions = [completion!.completion, ...completion!.alternatives]
  const selected = suggestions[selectedIndex]

  return (
    <Card className="p-4 border-[var(--sapphire-500)] bg-[var(--sapphire-50)] dark:bg-[var(--sapphire-950)] shadow-lg glow-sapphire-thought">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-[var(--sapphire-500)]" />
            <span className="text-sm font-medium text-[var(--sapphire-700)] dark:text-[var(--sapphire-300)]">
              Spark Suggestion
            </span>
            <span className="text-xs text-[var(--sapphire-600)] dark:text-[var(--sapphire-400)]">
              {Math.round(completion!.confidence * 100)}% confidence
            </span>
          </div>

          <div className="bg-background rounded-md p-3 mb-2 font-mono text-sm border border-[var(--sapphire-200)] dark:border-[var(--sapphire-800)]">
            {selected}
          </div>

          {completion!.alternatives.length > 0 && (
            <div className="mb-2">
              <button
                onClick={() => setShowAlternatives(!showAlternatives)}
                className="flex items-center gap-1 text-xs text-[var(--sapphire-600)] dark:text-[var(--sapphire-400)] hover:text-[var(--sapphire-700)] dark:hover:text-[var(--sapphire-300)]"
              >
                <ChevronDown
                  className={`w-3 h-3 transition-transform ${showAlternatives ? 'rotate-180' : ''}`}
                />
                {completion!.alternatives.length} alternatives
              </button>

              {showAlternatives && (
                <div className="mt-2 space-y-1">
                  {completion!.alternatives.map((alt, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setSelectedIndex(idx + 1)
                        setShowAlternatives(false)
                      }}
                      className={`w-full text-left px-2 py-1 rounded text-xs font-mono bg-background border transition-colors ${
                        selectedIndex === idx + 1
                          ? 'border-[var(--sapphire-500)] bg-[var(--sapphire-100)] dark:bg-[var(--sapphire-900)]'
                          : 'border-transparent hover:border-[var(--sapphire-300)] dark:hover:border-[var(--sapphire-700)]'
                      }`}
                    >
                      {alt.substring(0, 60)}...
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {completion!.explanation && (
            <p className="text-xs text-muted-foreground mt-2">
              {completion!.explanation}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <Button
            onClick={() => onAccept(selected)}
            size="sm"
            className="bg-[var(--sapphire-500)] hover:bg-[var(--sapphire-600)] text-white"
          >
            <Check className="w-3 h-3 mr-1" />
            Accept
          </Button>
          <Button
            onClick={onReject}
            size="sm"
            variant="outline"
            className="border-[var(--sapphire-300)] dark:border-[var(--sapphire-700)]"
          >
            <X className="w-3 h-3 mr-1" />
            Reject
          </Button>
        </div>
      </div>
    </Card>
  )
}
