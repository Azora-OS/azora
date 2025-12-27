"use client"

import { useState } from "react"

interface MiniMapProps {
  code: string
}

export function MiniMap({ code }: MiniMapProps) {
  const lines = code.split("\n")
  const [viewportTop, setViewportTop] = useState(0)

  return (
    <div className="w-24 bg-muted/20 border-l border-border overflow-hidden hidden xl:block relative">
      {/* Mini code representation */}
      <div className="p-2 text-[2px] font-mono leading-[3px] text-muted-foreground/40 select-none overflow-hidden">
        {lines.map((line, i) => (
          <div key={i} className="truncate h-[3px]">
            {line.split("").map((char, j) => (
              <span
                key={j}
                className={`inline-block w-[1px] h-[2px] ${char !== " " ? "bg-muted-foreground/30" : ""}`}
              />
            ))}
          </div>
        ))}

        {/* Generate more visual lines for longer code representation */}
        {Array.from({ length: 50 }).map((_, i) => (
          <div key={`extra-${i}`} className="flex gap-[1px] h-[3px]">
            {Array.from({ length: (i % 30) + 5 }).map((_, j) => (
              <span key={j} className="inline-block w-[1px] h-[2px] bg-muted-foreground/20" />
            ))}
          </div>
        ))}
      </div>

      {/* Viewport indicator */}
      <div
        className="absolute left-0 right-0 bg-primary/10 border-y border-primary/30 pointer-events-none transition-all"
        style={{
          top: `${viewportTop}%`,
          height: "30%",
        }}
      />

      {/* Scroll area for interaction */}
      <div
        className="absolute inset-0 cursor-pointer"
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect()
          const y = ((e.clientY - rect.top) / rect.height) * 100
          setViewportTop(Math.max(0, Math.min(70, y - 15)))
        }}
      />
    </div>
  )
}
