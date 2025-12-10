"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { WorkspaceHeader } from "@/components/workspace/workspace-header"
import { WorkspaceSidebar } from "@/components/workspace/workspace-sidebar"
import { EditorPanel } from "@/components/workspace/editor-panel"
import { CommandDesk } from "@/components/workspace/command-desk"
import { TerminalPanel } from "@/components/workspace/terminal-panel"
import { PreviewPanel } from "@/components/workspace/preview-panel"
import { KnowledgeOcean } from "@/components/workspace/knowledge-ocean"
import { ActivityBar } from "@/components/workspace/activity-bar"
import { StatusBar } from "@/components/workspace/status-bar"
import { MiniMap } from "@/components/workspace/mini-map"

export default function CodeChamberPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [commandDeskOpen, setCommandDeskOpen] = useState(true)
  const [terminalOpen, setTerminalOpen] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(true)
  const [knowledgeOceanOpen, setKnowledgeOceanOpen] = useState(false)
  const [activeFile, setActiveFile] = useState("page.tsx")
  const [activeRightPanel, setActiveRightPanel] = useState<"command" | "knowledge">("command")
  const [activeLeftPanel, setActiveLeftPanel] = useState<"files" | "search" | "git" | "extensions">("files")
  const [openFiles, setOpenFiles] = useState(["page.tsx", "layout.tsx"])
  const [agentActivity, setAgentActivity] = useState<{ agent: string; action: string; time: string }[]>([
    { agent: "Elara", action: "Analyzing project structure", time: "2s ago" },
    { agent: "Sankofa", action: "Ready for tasks", time: "5s ago" },
    { agent: "Themba", action: "API routes initialized", time: "10s ago" },
  ])

  useEffect(() => {
    const activities = [
      { agent: "Elara", action: "Coordinating component generation" },
      { agent: "Sankofa", action: "Writing React components" },
      { agent: "Themba", action: "Setting up database schema" },
      { agent: "Jabari", action: "Running security scan" },
      { agent: "Naledi", action: "Optimizing UI patterns" },
    ]

    const interval = setInterval(() => {
      const randomActivity = activities[Math.floor(Math.random() * activities.length)]
      setAgentActivity((prev) => [
        { ...randomActivity, time: "just now" },
        ...prev
          .slice(0, 4)
          .map((a) => ({ ...a, time: a.time === "just now" ? "2s ago" : a.time === "2s ago" ? "5s ago" : "10s ago" })),
      ])
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      <WorkspaceHeader
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        onToggleAI={() => setCommandDeskOpen(!commandDeskOpen)}
        onToggleTerminal={() => setTerminalOpen(!terminalOpen)}
        onTogglePreview={() => setPreviewOpen(!previewOpen)}
        onToggleKnowledge={() => {
          setKnowledgeOceanOpen(!knowledgeOceanOpen)
          setActiveRightPanel("knowledge")
        }}
        previewOpen={previewOpen}
        knowledgeOceanOpen={knowledgeOceanOpen}
        agentActivity={agentActivity}
      />

      <div className="flex-1 flex overflow-hidden">
        <ActivityBar
          activePanel={activeLeftPanel}
          onPanelChange={setActiveLeftPanel}
          sidebarOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        />

        <AnimatePresence mode="wait">
          {sidebarOpen && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 280, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="border-r border-border bg-sidebar-background overflow-hidden"
            >
              <WorkspaceSidebar
                activeFile={activeFile}
                onFileSelect={(file) => {
                  setActiveFile(file)
                  if (!openFiles.includes(file)) {
                    setOpenFiles([...openFiles, file])
                  }
                }}
                activePanel={activeLeftPanel}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex-1 flex min-h-0">
            <div className="flex-1 min-w-0 flex">
              <div className="flex-1">
                <EditorPanel
                  activeFile={activeFile}
                  openFiles={openFiles}
                  onFileSelect={setActiveFile}
                  onCloseFile={(file) => {
                    const newFiles = openFiles.filter((f) => f !== file)
                    setOpenFiles(newFiles)
                    if (activeFile === file && newFiles.length > 0) {
                      setActiveFile(newFiles[0])
                    }
                  }}
                />
              </div>
              <MiniMap
                code={`export function Dashboard() {\n  return (\n    <div className="flex">\n      // Content\n    </div>\n  )\n}`}
              />
            </div>

            <AnimatePresence mode="wait">
              {previewOpen && (
                <motion.div
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 480, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="border-l border-border overflow-hidden"
                >
                  <PreviewPanel />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <AnimatePresence mode="wait">
            {terminalOpen && (
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: 220 }}
                exit={{ height: 0 }}
                transition={{ duration: 0.2 }}
                className="border-t border-border overflow-hidden"
              >
                <TerminalPanel onClose={() => setTerminalOpen(false)} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <AnimatePresence mode="wait">
          {(commandDeskOpen || knowledgeOceanOpen) && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 420, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="border-l border-border bg-card overflow-hidden flex flex-col"
            >
              {activeRightPanel === "command" ? (
                <CommandDesk onSwitchToKnowledge={() => setActiveRightPanel("knowledge")} />
              ) : (
                <KnowledgeOcean onSwitchToCommand={() => setActiveRightPanel("command")} />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <StatusBar activeFile={activeFile} agentCount={5} activeAgents={3} />
    </div>
  )
}
