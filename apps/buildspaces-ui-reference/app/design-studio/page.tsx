"use client"

import { useState, useRef } from "react"
import { motion } from "framer-motion"
import {
  Palette,
  Layers,
  ImageIcon,
  Type,
  Square,
  Circle,
  ZoomIn,
  ZoomOut,
  Undo,
  Redo,
  Share2,
  Settings,
  Grid,
  Eye,
  EyeOff,
  Wand2,
  Send,
  Loader2,
  ArrowLeft,
  MousePointer,
  Hand,
  Pencil,
  Trash2,
  Copy,
  Lock,
  Unlock,
  Sparkles,
  LayoutGrid,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import Link from "next/link"
import { Textarea } from "@/components/ui/textarea"

interface DesignElement {
  id: string
  type: "rectangle" | "circle" | "text" | "image" | "frame"
  x: number
  y: number
  width: number
  height: number
  fill: string
  stroke?: string
  label?: string
  locked?: boolean
  visible?: boolean
  rotation?: number
}

interface AIMessage {
  id: string
  role: "user" | "assistant"
  content: string
  suggestions?: string[]
}

export default function DesignStudioPage() {
  const [selectedTool, setSelectedTool] = useState<string>("select")
  const [selectedElement, setSelectedElement] = useState<string | null>("1")
  const [zoom, setZoom] = useState(100)
  const [showGrid, setShowGrid] = useState(true)
  const [aiInput, setAiInput] = useState("")
  const [aiMessages, setAiMessages] = useState<AIMessage[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "Hi! I'm Naledi, your Design Lead. I can help you create wireframes, mockups, and visual designs. Describe what you want to create and I'll help bring it to life.\n\nTry: \"Create a modern SaaS landing page with hero, features, and pricing sections\"",
      suggestions: ["Create a dashboard layout", "Design a login page", "Make a pricing table"],
    },
  ])
  const [isAiTyping, setIsAiTyping] = useState(false)
  const canvasRef = useRef<HTMLDivElement>(null)

  const [elements, setElements] = useState<DesignElement[]>([
    {
      id: "1",
      type: "frame",
      x: 50,
      y: 50,
      width: 350,
      height: 220,
      fill: "rgba(16, 185, 129, 0.05)",
      stroke: "rgba(16, 185, 129, 0.3)",
      label: "Hero Section",
    },
    {
      id: "2",
      type: "rectangle",
      x: 50,
      y: 300,
      width: 110,
      height: 80,
      fill: "rgba(139, 92, 246, 0.1)",
      stroke: "rgba(139, 92, 246, 0.3)",
      label: "Feature 1",
    },
    {
      id: "3",
      type: "rectangle",
      x: 170,
      y: 300,
      width: 110,
      height: 80,
      fill: "rgba(139, 92, 246, 0.1)",
      stroke: "rgba(139, 92, 246, 0.3)",
      label: "Feature 2",
    },
    {
      id: "4",
      type: "rectangle",
      x: 290,
      y: 300,
      width: 110,
      height: 80,
      fill: "rgba(139, 92, 246, 0.1)",
      stroke: "rgba(139, 92, 246, 0.3)",
      label: "Feature 3",
    },
    {
      id: "5",
      type: "text",
      x: 120,
      y: 100,
      width: 210,
      height: 50,
      fill: "transparent",
      label: "Welcome Headline",
    },
    {
      id: "6",
      type: "rectangle",
      x: 150,
      y: 180,
      width: 100,
      height: 40,
      fill: "rgba(16, 185, 129, 0.2)",
      stroke: "rgba(16, 185, 129, 0.5)",
      label: "CTA Button",
    },
  ])

  const tools = [
    { id: "select", icon: MousePointer, label: "Select (V)" },
    { id: "move", icon: Hand, label: "Pan (H)" },
    { id: "frame", icon: LayoutGrid, label: "Frame (F)" },
    { id: "rectangle", icon: Square, label: "Rectangle (R)" },
    { id: "circle", icon: Circle, label: "Circle (O)" },
    { id: "text", icon: Type, label: "Text (T)" },
    { id: "draw", icon: Pencil, label: "Draw (P)" },
  ]

  const handleAiSend = () => {
    if (!aiInput.trim()) return

    const userMessage: AIMessage = {
      id: Date.now().toString(),
      role: "user",
      content: aiInput,
    }
    setAiMessages((prev) => [...prev, userMessage])
    setAiInput("")
    setIsAiTyping(true)

    setTimeout(() => {
      const aiResponse: AIMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          "I've analyzed your request. Here's what I'm proposing:\n\n**Layout Structure:**\n- Full-width hero with gradient background\n- 3-column feature grid with icon cards\n- Social proof section with testimonials\n- CTA footer with email capture\n\n**Color Palette:** Emerald primary (#10B981) with purple accents (#8B5CF6) on dark background.\n\n**Typography:** Inter for body, bold weights for headlines.\n\nShall I generate the wireframe on the canvas?",
        suggestions: ["Generate wireframe", "Adjust colors", "Add more sections"],
      }
      setAiMessages((prev) => [...prev, aiResponse])
      setIsAiTyping(false)
    }, 2000)
  }

  const selectedEl = elements.find((el) => el.id === selectedElement)

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* Header */}
      <header className="h-12 border-b border-border bg-background/95 backdrop-blur-sm flex items-center justify-between px-3 shrink-0">
        <div className="flex items-center gap-3">
          <Link
            href="/workspace"
            className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm hidden sm:inline">Workspace</span>
          </Link>

          <div className="h-5 w-px bg-border" />

          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-pink-500 to-rose-400 flex items-center justify-center">
              <Palette className="w-4 h-4 text-background" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-sm font-semibold leading-none">Design Studio</h1>
              <p className="text-[10px] text-muted-foreground">Landing Page Wireframe</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <div className="flex items-center gap-0.5 p-0.5 rounded-lg bg-muted">
            <Button variant="ghost" size="icon" className="h-7 w-7">
              <Undo className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7">
              <Redo className="w-4 h-4" />
            </Button>
          </div>

          <div className="h-5 w-px bg-border mx-1" />

          <div className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-lg bg-muted">
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setZoom(Math.max(25, zoom - 25))}>
              <ZoomOut className="w-3.5 h-3.5" />
            </Button>
            <span className="text-xs font-medium w-10 text-center">{zoom}%</span>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setZoom(Math.min(200, zoom + 25))}>
              <ZoomIn className="w-3.5 h-3.5" />
            </Button>
          </div>

          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setShowGrid(!showGrid)}>
            <Grid className={`w-4 h-4 ${showGrid ? "text-primary" : ""}`} />
          </Button>

          <div className="h-5 w-px bg-border mx-1 hidden sm:block" />

          <Button variant="outline" size="sm" className="hidden sm:flex h-8 bg-transparent">
            <Share2 className="w-4 h-4 mr-1.5" />
            Share
          </Button>

          <Button size="sm" className="h-8 bg-pink-500 hover:bg-pink-500/90 text-white">
            <Sparkles className="w-4 h-4 mr-1.5" />
            Generate Code
          </Button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Tools */}
        <div className="w-12 border-r border-border bg-muted/30 flex flex-col items-center py-2 gap-0.5 shrink-0">
          {tools.map((tool) => (
            <Button
              key={tool.id}
              variant="ghost"
              size="icon"
              className={`h-9 w-9 ${selectedTool === tool.id ? "bg-pink-500/20 text-pink-500" : "text-muted-foreground hover:text-foreground"}`}
              onClick={() => setSelectedTool(tool.id)}
              title={tool.label}
            >
              <tool.icon className="w-4 h-4" />
            </Button>
          ))}

          <div className="h-px w-6 bg-border my-2" />

          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-muted-foreground hover:text-foreground"
            title="Add Image"
          >
            <ImageIcon className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-muted-foreground hover:text-foreground"
            title="Components"
          >
            <Layers className="w-4 h-4" />
          </Button>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <div ref={canvasRef} className="flex-1 relative overflow-auto bg-[#0a0a0f]">
            {/* Grid Background */}
            {showGrid && (
              <div
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage: `
                    linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
                  `,
                  backgroundSize: "20px 20px",
                }}
              />
            )}

            {/* Canvas */}
            <div
              className="absolute inset-0 flex items-center justify-center p-8"
              style={{ transform: `scale(${zoom / 100})`, transformOrigin: "center center" }}
            >
              <div className="w-[450px] h-[500px] bg-card rounded-xl border border-border shadow-2xl relative">
                {/* Canvas Header */}
                <div className="absolute -top-8 left-0 text-xs text-muted-foreground">Desktop • 450 x 500</div>

                {elements.map((el) => (
                  <motion.div
                    key={el.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: el.visible === false ? 0.3 : 1, scale: 1 }}
                    className={`absolute rounded-lg cursor-pointer transition-all ${
                      selectedElement === el.id
                        ? "ring-2 ring-pink-500 ring-offset-2 ring-offset-card"
                        : "hover:ring-1 hover:ring-pink-500/50"
                    } ${el.type === "frame" ? "border-dashed border-2" : "border"}`}
                    style={{
                      left: el.x,
                      top: el.y,
                      width: el.width,
                      height: el.height,
                      backgroundColor: el.fill,
                      borderColor: el.stroke || "transparent",
                      transform: el.rotation ? `rotate(${el.rotation}deg)` : undefined,
                    }}
                    onClick={() => setSelectedElement(el.id)}
                  >
                    {el.label && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-[10px] font-medium text-muted-foreground bg-card/80 px-2 py-0.5 rounded">
                          {el.label}
                        </span>
                      </div>
                    )}

                    {/* Resize Handles */}
                    {selectedElement === el.id && (
                      <>
                        <div className="absolute -top-1 -left-1 w-2 h-2 bg-pink-500 rounded-sm cursor-nw-resize" />
                        <div className="absolute -top-1 -right-1 w-2 h-2 bg-pink-500 rounded-sm cursor-ne-resize" />
                        <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-pink-500 rounded-sm cursor-sw-resize" />
                        <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-pink-500 rounded-sm cursor-se-resize" />
                        <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-pink-500 rounded-sm cursor-n-resize" />
                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-pink-500 rounded-sm cursor-s-resize" />
                      </>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - AI Assistant + Properties */}
        <div className="w-80 border-l border-border bg-card flex flex-col shrink-0">
          <Tabs defaultValue="ai" className="flex-1 flex flex-col">
            <TabsList className="w-full justify-start rounded-none border-b border-border bg-transparent h-10 p-0 px-2">
              <TabsTrigger
                value="ai"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-pink-500 data-[state=active]:bg-transparent text-xs"
              >
                <Wand2 className="w-3.5 h-3.5 mr-1.5" />
                Naledi AI
              </TabsTrigger>
              <TabsTrigger
                value="properties"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-pink-500 data-[state=active]:bg-transparent text-xs"
              >
                <Settings className="w-3.5 h-3.5 mr-1.5" />
                Properties
              </TabsTrigger>
              <TabsTrigger
                value="layers"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-pink-500 data-[state=active]:bg-transparent text-xs"
              >
                <Layers className="w-3.5 h-3.5 mr-1.5" />
                Layers
              </TabsTrigger>
            </TabsList>

            <TabsContent value="ai" className="flex-1 flex flex-col mt-0 overflow-hidden">
              {/* AI Messages */}
              <div className="flex-1 overflow-auto p-3 space-y-3">
                {aiMessages.map((msg) => (
                  <div key={msg.id} className={`flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                        msg.role === "user" ? "bg-muted" : "bg-gradient-to-br from-pink-500 to-rose-400"
                      }`}
                    >
                      {msg.role === "user" ? (
                        <span className="text-[10px] font-bold">U</span>
                      ) : (
                        <Palette className="w-3.5 h-3.5 text-background" />
                      )}
                    </div>
                    <div className={`flex-1 max-w-[85%] ${msg.role === "user" ? "text-right" : ""}`}>
                      {msg.role === "assistant" && (
                        <span className="text-[10px] text-pink-500 font-medium">Naledi</span>
                      )}
                      <div
                        className={`mt-1 p-2.5 rounded-xl text-xs ${
                          msg.role === "user" ? "bg-pink-500 text-white ml-auto" : "bg-muted text-foreground"
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                      </div>

                      {/* Quick Suggestions */}
                      {msg.suggestions && msg.suggestions.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {msg.suggestions.map((suggestion, i) => (
                            <button
                              key={i}
                              onClick={() => setAiInput(suggestion)}
                              className="px-2 py-1 rounded-lg bg-pink-500/10 text-pink-500 text-[10px] hover:bg-pink-500/20 transition-colors"
                            >
                              {suggestion}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {isAiTyping && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin text-pink-500" />
                    <span className="text-xs">Naledi is designing...</span>
                  </div>
                )}
              </div>

              {/* AI Input */}
              <div className="p-3 border-t border-border">
                <div className="flex items-end gap-2">
                  <Textarea
                    value={aiInput}
                    onChange={(e) => setAiInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault()
                        handleAiSend()
                      }
                    }}
                    placeholder="Describe your design vision..."
                    className="min-h-[60px] max-h-24 resize-none bg-muted border-border text-xs"
                    rows={2}
                  />
                  <Button
                    onClick={handleAiSend}
                    size="icon"
                    className="h-9 w-9 shrink-0 bg-gradient-to-br from-pink-500 to-rose-400 text-white"
                    disabled={!aiInput.trim() || isAiTyping}
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="properties" className="flex-1 overflow-auto p-3 mt-0">
              {selectedEl ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium">{selectedEl.label || `Element`}</span>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-6 w-6">
                        {selectedEl.locked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                      </Button>
                      <Button variant="ghost" size="icon" className="h-6 w-6">
                        {selectedEl.visible === false ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      </Button>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                      Position
                    </label>
                    <div className="grid grid-cols-2 gap-2 mt-1.5">
                      <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-muted">
                        <span className="text-[10px] text-muted-foreground">X</span>
                        <input
                          type="number"
                          className="flex-1 bg-transparent text-xs focus:outline-none w-full"
                          value={selectedEl.x}
                          readOnly
                        />
                      </div>
                      <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-muted">
                        <span className="text-[10px] text-muted-foreground">Y</span>
                        <input
                          type="number"
                          className="flex-1 bg-transparent text-xs focus:outline-none w-full"
                          value={selectedEl.y}
                          readOnly
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                      Size
                    </label>
                    <div className="grid grid-cols-2 gap-2 mt-1.5">
                      <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-muted">
                        <span className="text-[10px] text-muted-foreground">W</span>
                        <input
                          type="number"
                          className="flex-1 bg-transparent text-xs focus:outline-none w-full"
                          value={selectedEl.width}
                          readOnly
                        />
                      </div>
                      <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-muted">
                        <span className="text-[10px] text-muted-foreground">H</span>
                        <input
                          type="number"
                          className="flex-1 bg-transparent text-xs focus:outline-none w-full"
                          value={selectedEl.height}
                          readOnly
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                      Fill
                    </label>
                    <div className="flex items-center gap-2 mt-1.5">
                      <div
                        className="w-8 h-8 rounded-lg border border-border"
                        style={{ backgroundColor: selectedEl.fill }}
                      />
                      <input
                        type="text"
                        className="flex-1 px-2 py-1.5 rounded-lg bg-muted text-xs focus:outline-none font-mono"
                        value={selectedEl.fill}
                        readOnly
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                      Corner Radius
                    </label>
                    <Slider defaultValue={[8]} max={50} step={1} className="mt-2" />
                  </div>

                  <div className="pt-2 flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1 h-8 text-xs bg-transparent">
                      <Copy className="w-3 h-3 mr-1.5" />
                      Duplicate
                    </Button>
                    <Button variant="outline" size="sm" className="h-8 text-xs text-destructive bg-transparent">
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  <Square className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p className="text-xs">Select an element to edit</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="layers" className="flex-1 overflow-auto p-3 mt-0">
              <div className="space-y-1">
                {elements.map((el, i) => (
                  <button
                    key={el.id}
                    onClick={() => setSelectedElement(el.id)}
                    className={`w-full flex items-center gap-2 p-2 rounded-lg transition-colors ${
                      selectedElement === el.id ? "bg-pink-500/10 text-pink-500" : "hover:bg-muted"
                    }`}
                  >
                    {el.type === "frame" ? (
                      <LayoutGrid className="w-3.5 h-3.5" />
                    ) : el.type === "text" ? (
                      <Type className="w-3.5 h-3.5" />
                    ) : (
                      <Square className="w-3.5 h-3.5" />
                    )}
                    <span className="text-xs flex-1 text-left truncate">{el.label || `Element ${i + 1}`}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5 opacity-50 hover:opacity-100"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Eye className="w-3 h-3" />
                    </Button>
                  </button>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
