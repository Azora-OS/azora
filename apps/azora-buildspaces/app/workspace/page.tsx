"use client"

import { useState, useEffect } from "react"
import { WorkspaceHeader } from "@/components/workspace/workspace-header"
import { WorkspaceSidebar } from "@/components/workspace/workspace-sidebar"
import { CodeChamber } from "@/components/workspace/code-chamber"
import { SpecChamber } from "@/components/workspace/spec-chamber"
import { DesignStudio } from "@/components/workspace/design-studio"
import { CommandDesk } from "@/components/workspace/command-desk"
import { TerminalPanel } from "@/components/workspace/terminal-panel"
import { PreviewPanel } from "@/components/workspace/preview-panel"
import { KnowledgeOcean } from "@/components/workspace/knowledge-ocean"
import { ActivityBar } from "@/components/workspace/room-bar"
import { StatusBar } from "@/components/workspace/status-bar"
import { AIAssistantPanel } from "@/components/workspace/ai-assistant-panel"
import { TaskBoard } from "@/components/workspace/task-board"
import { Onboarding } from "@/components/workspace/onboarding"
import { AgentActivityFeed } from "@/components/workspace/agent-activity-feed"
import { AIStudio } from "@/components/workspace/ai-studio"
import MakerLab from "@/components/rooms/maker-lab"
import InnovationTheater from "@/components/rooms/innovation-theater"
import CollaborationPod from "@/components/rooms/collaboration-pod"

type RoomType =
  | "code-chamber"
  | "spec-chamber"
  | "design-studio"
  | "ai-studio"
  | "command-desk"
  | "maker-lab"
  | "collaboration-pod"
  | "innovation-theater"
  | "deep-focus"
  | "knowledge-ocean"
  | "task-board"

export default function WorkspacePage() {
  const [activeRoom, setActiveRoom] = useState<RoomType>("code-chamber")
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [aiPanelOpen, setAiPanelOpen] = useState(false)
  const [terminalOpen, setTerminalOpen] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [knowledgeOceanOpen, setKnowledgeOceanOpen] = useState(false)
  const [activeFile, setActiveFile] = useState("app/page.tsx")
  const [currentProject, setCurrentProject] = useState<string | null>(null)
  const [showOnboarding, setShowOnboarding] = useState(false)

  const rooms = [
    { id: "code-chamber", name: "Code Chamber", icon: "💻" },
    { id: "spec-chamber", name: "Spec Chamber", icon: "📋" },
    { id: "design-studio", name: "Design Studio", icon: "🎨" },
    { id: "ai-studio", name: "AI Studio", icon: "🤖" },
    { id: "command-desk", name: "Command Desk", icon: "⚡" },
    { id: "maker-lab", name: "Maker Lab", icon: "🔧" },
    { id: "collaboration-pod", name: "Collaboration Pod", icon: "👥" },
    { id: "innovation-theater", name: "Innovation Theater", icon: "🎭" },
    { id: "deep-focus", name: "Deep Focus", icon: "🎯" },
    { id: "knowledge-ocean", name: "Knowledge Ocean", icon: "🌊" },
    { id: "task-board", name: "Task Board", icon: "📊" },
  ]

  // Show onboarding on first visit
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      const hasSeenOnboarding = localStorage.getItem('buildspaces-onboarding-seen')
      if (!hasSeenOnboarding && !currentProject) {
        setShowOnboarding(true)
        localStorage.setItem('buildspaces-onboarding-seen', 'true')
      }
    })
    return () => cancelAnimationFrame(id)
  }, [currentProject])

  const renderActiveRoom = () => {
    switch (activeRoom) {
      case "code-chamber":
        return <CodeChamber id="code-chamber" />
      case "spec-chamber":
        return <SpecChamber />
      case "design-studio":
        return <DesignStudio />
      case "ai-studio":
        return <AIStudio />
      case "command-desk":
        return <CommandDesk />
      case "maker-lab":
        return <MakerLab />
      case "collaboration-pod":
        return <CollaborationPod />
      case "innovation-theater":
        return <InnovationTheater />
      case "deep-focus":
        return (
          <div className="flex items-center justify-center h-full text-gray-400">
            <div className="text-center">
              <div className="text-6xl mb-4">🎯</div>
              <h2 className="text-2xl font-bold mb-2">Deep Focus</h2>
              <p>Distraction-free coding environment coming soon!</p>
            </div>
          </div>
        )
      case "knowledge-ocean":
        return <KnowledgeOcean />
      case "task-board":
        return <TaskBoard />
    }
  }

  return (
    <div className="h-screen flex flex-col bg-[#0d1117] text-white">
      <WorkspaceHeader
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        onToggleAI={() => setAiPanelOpen(!aiPanelOpen)}
        onToggleTerminal={() => setTerminalOpen(!terminalOpen)}
        onTogglePreview={() => setPreviewOpen(!previewOpen)}
        onToggleKnowledge={() => setKnowledgeOceanOpen(!knowledgeOceanOpen)}
        previewOpen={previewOpen}
        knowledgeOceanOpen={knowledgeOceanOpen}
        currentProject={currentProject}
        activeRoom={activeRoom}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Activity Bar */}
        <ActivityBar
          activeRoom={activeRoom}
          onRoomChange={setActiveRoom}
          rooms={rooms}
        />

        {/* Sidebar */}
        {sidebarOpen && (
          <WorkspaceSidebar
            activeFile={activeFile}
            onFileSelect={setActiveFile}
            activePanel="files"
          />
        )}

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {renderActiveRoom()}

          {/* Terminal Panel */}
          {terminalOpen && (
            <div className="border-t border-border">
              <TerminalPanel />
            </div>
          )}
        </div>

        {/* Preview Panel */}
        {previewOpen && <PreviewPanel />}

        {/* Knowledge Ocean */}
        {knowledgeOceanOpen && <KnowledgeOcean />}

        {/* AI Assistant Panel */}
        {aiPanelOpen && <AIAssistantPanel />}
      </div>

      <StatusBar activeFile={activeFile} agentCount={5} activeAgents={2} />

      {/* Onboarding */}
      {showOnboarding && (
        <Onboarding onComplete={() => setShowOnboarding(false)} />
      )}
    </div>
  )
}