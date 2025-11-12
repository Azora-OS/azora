"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

export function AccessibilityToolbar() {
  const [fontSize, setFontSize] = useState(100)
  const [highContrast, setHighContrast] = useState(false)
  const [dyslexicFont, setDyslexicFont] = useState(false)
  const [showToolbar, setShowToolbar] = useState(false)

  const handleFontSize = (change: number) => {
    const newSize = Math.max(80, Math.min(120, fontSize + change))
    setFontSize(newSize)
    document.documentElement.style.fontSize = (16 * newSize) / 100 + "px"
  }

  const toggleHighContrast = () => {
    setHighContrast(!highContrast)
    document.documentElement.classList.toggle("high-contrast", !highContrast)
  }

  const toggleDyslexicFont = () => {
    setDyslexicFont(!dyslexicFont)
    document.documentElement.classList.toggle("dyslexic-font", !dyslexicFont)
  }

  return (
    <div className="fixed bottom-6 right-6 z-40">
      {showToolbar && (
        <div className="mb-4 bg-card border border-border rounded-lg p-4 shadow-lg max-w-xs">
          <h3 className="font-semibold text-foreground mb-3 text-sm">Accessibility Options</h3>

          {/* Font Size */}
          <div className="mb-3">
            <p className="text-xs font-medium text-foreground mb-2">Text Size: {fontSize}%</p>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => handleFontSize(-10)} aria-label="Decrease text size">
                A−
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleFontSize(10)} aria-label="Increase text size">
                A+
              </Button>
            </div>
          </div>

          {/* High Contrast */}
          <button
            onClick={toggleHighContrast}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors mb-2 ${
              highContrast ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
            aria-pressed={highContrast}
            aria-label="Toggle high contrast mode"
          >
            <input type="checkbox" checked={highContrast} onChange={() => {}} aria-hidden="true" className="sr-only" />
            <span>High Contrast</span>
          </button>

          {/* Dyslexic Font */}
          <button
            onClick={toggleDyslexicFont}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
              dyslexicFont ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
            aria-pressed={dyslexicFont}
            aria-label="Toggle dyslexic-friendly font"
          >
            <input type="checkbox" checked={dyslexicFont} onChange={() => {}} aria-hidden="true" className="sr-only" />
            <span>Dyslexic Font</span>
          </button>
        </div>
      )}

      {/* Toggle Button */}
      <Button
        onClick={() => setShowToolbar(!showToolbar)}
        size="lg"
        className="rounded-full shadow-lg w-14 h-14 flex items-center justify-center"
        aria-label="Toggle accessibility toolbar"
        aria-expanded={showToolbar}
      >
        <span className="text-xl">♿</span>
      </Button>
    </div>
  )
}
