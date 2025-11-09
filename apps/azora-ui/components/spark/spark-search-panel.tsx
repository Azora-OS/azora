/*
AZORA PROPRIETARY LICENSE
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved.

SPARK SEARCH PANEL - UI component for codebase search
*/

'use client'

import React, { useState } from 'react'
import { Search, FileText, Code, Sparkles } from 'lucide-react'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { Card } from '../ui/card'

/**
 * 🔍 SPARK SEARCH PANEL
 * 
 * Codebase search interface (like GitHub Spark)
 * 
 * @ubuntu Individual search → Collective knowledge discovery
 */
export interface SparkSearchResult {
  file: string
  content: string
  relevance: number
  line?: number
  context?: string
}

interface SparkSearchPanelProps {
  onSearch: (query: string, options?: SearchOptions) => Promise<SparkSearchResult[]>
  onSelectResult?: (result: SparkSearchResult) => void
}

interface SearchOptions {
  language?: string
  type?: 'code' | 'documentation' | 'all'
  limit?: number
}

export function SparkSearchPanel({
  onSearch,
  onSelectResult,
}: SparkSearchPanelProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SparkSearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [options, setOptions] = useState<SearchOptions>({
    type: 'all',
    limit: 20,
  })

  const handleSearch = async () => {
    if (!query.trim()) return

    setIsSearching(true)
    try {
      const searchResults = await onSearch(query, options)
      setResults(searchResults)
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setIsSearching(false)
    }
  }

  return (
    <div className="space-y-4">
      <Card className="p-4 border-[var(--sapphire-500)] bg-[var(--sapphire-50)] dark:bg-[var(--sapphire-950)]">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-[var(--sapphire-500)]" />
          <h3 className="font-semibold text-[var(--sapphire-700)] dark:text-[var(--sapphire-300)]">
            Spark Search
          </h3>
        </div>

        <div className="flex gap-2 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search codebase..."
              className="pl-10"
            />
          </div>
          <Button
            onClick={handleSearch}
            disabled={isSearching || !query.trim()}
            className="bg-[var(--sapphire-500)] hover:bg-[var(--sapphire-600)]"
          >
            {isSearching ? 'Searching...' : 'Search'}
          </Button>
        </div>

        <div className="flex gap-2 text-sm">
          <select
            value={options.type}
            onChange={(e) =>
              setOptions({ ...options, type: e.target.value as any })
            }
            className="px-3 py-1 rounded border bg-background"
          >
            <option value="all">All</option>
            <option value="code">Code</option>
            <option value="documentation">Documentation</option>
          </select>

          <input
            type="text"
            placeholder="Language (e.g., typescript)"
            value={options.language || ''}
            onChange={(e) =>
              setOptions({ ...options, language: e.target.value || undefined })
            }
            className="px-3 py-1 rounded border bg-background flex-1"
          />
        </div>
      </Card>

      {results.length > 0 && (
        <div className="space-y-2">
          <div className="text-sm text-muted-foreground">
            Found {results.length} results
          </div>

          {results.map((result, idx) => (
            <Card
              key={idx}
              className="p-3 border-[var(--sapphire-200)] dark:border-[var(--sapphire-800)] hover:border-[var(--sapphire-500)] cursor-pointer transition-colors"
              onClick={() => onSelectResult?.(result)}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <FileText className="w-4 h-4 text-[var(--sapphire-500)]" />
                    <span className="font-mono text-sm font-medium">
                      {result.file}
                    </span>
                    {result.line && (
                      <span className="text-xs text-muted-foreground">
                        :{result.line}
                      </span>
                    )}
                    <span className="text-xs text-[var(--sapphire-600)] dark:text-[var(--sapphire-400)]">
                      {Math.round(result.relevance * 100)}% match
                    </span>
                  </div>

                  <div className="bg-muted rounded p-2 font-mono text-xs mb-1">
                    {result.content}
                  </div>

                  {result.context && (
                    <div className="text-xs text-muted-foreground">
                      {result.context.substring(0, 100)}...
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
