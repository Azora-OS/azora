'use client'

import { useState, useCallback } from 'react'
import { Navbar } from '@/components/features/navbar'
import { Footer } from '@/components/features/footer'
import { CodeEditor } from '@/components/features/code-chamber/editor'
import { TerminalPanel } from '@/components/features/code-chamber/terminal'
import { GitIntegration } from '@/components/features/code-chamber/git-integration'
import { Code2, Terminal, GitBranch, Users, Wand2 } from 'lucide-react'
import Link from 'next/link'

type EditorMode = 'single' | 'collaborative'
type TabType = 'editor' | 'terminal' | 'git' | 'ai-assistant'

export default function CodeChamberPage() {
  const [editorMode, setEditorMode] = useState<EditorMode>('single')
  const [activeTab, setActiveTab] = useState<TabType>('editor')
  const [code, setCode] = useState('// Welcome to BuildSpaces Code Chamber\n// Start coding with AI-powered assistance\n\nfunction helloWorld() {\n  console.log("🚀 BuildSpaces Ready!");\n}\n\nhelloWorld();')
  const [userId, setUserId] = useState<string>('')
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      setUserId('user-' + Math.random().toString(36).substr(2, 9))
    })
    return () => cancelAnimationFrame(id)
  }, [])
  const [projectId] = useState('demo-project-001')

  const handleAIAssist = useCallback(() => {
    setActiveTab('ai-assistant')
    alert('🤖 AI Assistant would generate code suggestions based on context')
  }, [])

  return (
    <div className="min-h-screen bg-[#0d1117] text-white flex flex-col">
      <Navbar />

      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6">
        <div className="mx-auto max-w-7xl h-full">
          {/* Header */}
          <div className="mb-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">Code Chamber</h1>
                <p className="text-gray-400">
                  Cloud IDE with Monaco editor, real-time collaboration, terminal, Git integration, and AI assistance
                </p>
              </div>
              <Link href="/features" className="text-emerald-400 hover:text-emerald-300">
                ← Back to features
              </Link>
            </div>

            {/* Mode selector */}
            <div className="flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-lg">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-300">Editor Mode:</span>
                <select
                  value={editorMode}
                  onChange={(e) => setEditorMode(e.target.value as EditorMode)}
                  className="px-3 py-1 bg-[#1e1e1e] border border-white/20 rounded text-sm text-white focus:outline-none focus:border-white/40"
                >
                  <option value="single">Single Player</option>
                  <option value="collaborative">Collaborative (Real-time)</option>
                </select>
              </div>

              {editorMode === 'collaborative' && (
                <div className="flex items-center gap-2 text-xs text-emerald-400">
                  <Users className="w-4 h-4" />
                  Real-time sync enabled
                </div>
              )}
            </div>
          </div>

          {/* Main IDE Layout */}
          <div className="grid grid-cols-4 gap-4 h-[calc(100vh-350px)]">
            {/* Editor Panel (3 columns) */}
            <div className="col-span-3 flex flex-col gap-4">
              {/* Tabs */}
              <div className="flex gap-2 border-b border-white/10">
                <button
                  onClick={() => setActiveTab('editor')}
                  className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'editor'
                      ? 'border-emerald-500 text-emerald-400'
                      : 'border-transparent text-gray-400 hover:text-white'
                  }`}
                >
                  <Code2 className="w-4 h-4" />
                  Editor
                </button>
                <button
                  onClick={() => setActiveTab('terminal')}
                  className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'terminal'
                      ? 'border-emerald-500 text-emerald-400'
                      : 'border-transparent text-gray-400 hover:text-white'
                  }`}
                >
                  <Terminal className="w-4 h-4" />
                  Terminal
                </button>
                <button
                  onClick={() => setActiveTab('git')}
                  className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'git'
                      ? 'border-emerald-500 text-emerald-400'
                      : 'border-transparent text-gray-400 hover:text-white'
                  }`}
                >
                  <GitBranch className="w-4 h-4" />
                  Git
                </button>
                <button
                  onClick={handleAIAssist}
                  className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'ai-assistant'
                      ? 'border-emerald-500 text-emerald-400'
                      : 'border-transparent text-gray-400 hover:text-white'
                  }`}
                >
                  <Wand2 className="w-4 h-4" />
                  AI Assistant
                </button>
              </div>

              {/* Content Area */}
              <div className="flex-1 overflow-hidden">
                {activeTab === 'editor' && (
                  <div className="h-full">
                    {editorMode === 'single' ? (
                      <CodeEditor
                        language="javascript"
                        defaultValue={code}
                        onChange={setCode}
                        theme="vs-dark"
                      />
                    ) : (
                      <div className="h-full bg-[#1e1e1e] rounded-lg border border-white/10 p-6 flex items-center justify-center">
                        <div className="text-center space-y-4">
                          <p className="text-gray-400">
                            Collaborative editing coming soon!<br />
                            <span className="text-sm">Powered by Yjs + WebSocket</span>
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'terminal' && (
                  <TerminalPanel />
                )}

                {activeTab === 'git' && (
                  <div className="h-full overflow-auto">
                    <GitIntegration projectId={projectId} />
                  </div>
                )}

                {activeTab === 'ai-assistant' && (
                  <div className="h-full bg-[#1e1e1e] rounded-lg border border-white/10 p-6 flex items-center justify-center">
                    <div className="text-center space-y-4">
                      <Wand2 className="w-12 h-12 text-emerald-400 mx-auto" />
                      <h3 className="text-lg font-semibold text-white">AI Assistant Ready</h3>
                      <p className="text-gray-400 max-w-md">
                        The AI assistant uses your code context to suggest improvements, generate tests, optimize performance,
                        and provide real-time pair programming support.
                      </p>
                      <button className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded font-medium text-white">
                        Get Code Suggestions
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar (1 column) */}
            <div className="col-span-1 flex flex-col gap-4 overflow-y-auto">
              {/* File Explorer */}
              <div className="bg-white/5 rounded-lg border border-white/10 p-4 space-y-2">
                <h3 className="text-sm font-semibold text-white mb-3">Files</h3>
                <div className="space-y-1 text-xs">
                  <div className="p-2 rounded hover:bg-white/10 cursor-pointer text-gray-300">
                    📄 index.js
                  </div>
                  <div className="p-2 rounded hover:bg-white/10 cursor-pointer text-gray-300">
                    📦 package.json
                  </div>
                  <div className="p-2 rounded hover:bg-white/10 cursor-pointer text-gray-300">
                    ⚙️ tsconfig.json
                  </div>
                  <div className="p-2 rounded hover:bg-white/10 cursor-pointer text-gray-300">
                    📋 README.md
                  </div>
                </div>
              </div>

              {/* Project Info */}
              <div className="bg-white/5 rounded-lg border border-white/10 p-4 space-y-3 text-xs">
                <div>
                  <p className="text-gray-400 mb-1">Project</p>
                  <p className="text-white font-mono">{projectId}</p>
                </div>
                <div>
                  <p className="text-gray-400 mb-1">Branch</p>
                  <p className="text-emerald-400 font-mono">main</p>
                </div>
                <div>
                  <p className="text-gray-400 mb-1">Language</p>
                  <p className="text-white">JavaScript</p>
                </div>
              </div>

              {/* AI Agent Status */}
              <div className="bg-emerald-500/10 rounded-lg border border-emerald-500/30 p-4 space-y-2">
                <h4 className="text-sm font-semibold text-emerald-300">Agent Status</h4>
                <div className="space-y-1 text-xs text-emerald-200">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-400" />
                    Sankofa (Code Review)
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-400" />
                    Themba (Testing)
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-400" />
                    Jabari (Security)
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
