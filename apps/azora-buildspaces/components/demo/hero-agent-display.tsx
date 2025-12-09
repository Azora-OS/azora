"use client"

import { useEffect, useState, useRef } from "react"
import { AfricanAgentAvatar } from "@/components/ui/african-agent-avatar"

export function HeroAgentDisplay() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isHovering, setIsHovering] = useState(false)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        setMousePosition({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        })
      }
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  return (
    <div
      ref={containerRef}
      className="relative w-full max-w-4xl mx-auto h-[550px] flex items-center justify-center"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Interactive Aether aura that follows mouse */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-500"
        style={{
          background: `radial-gradient(800px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(251, 191, 36, 0.12), transparent 50%)`,
          opacity: isHovering ? 1 : 0.4,
        }}
      />

      {/* Connection lines SVG */}
      <svg className="absolute inset-0 pointer-events-none w-full h-full" style={{ overflow: "visible" }}>
        <defs>
          <linearGradient id="line-gradient-silver" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#CBD5E1" stopOpacity="0" />
            <stop offset="50%" stopColor="#CBD5E1" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#CBD5E1" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="line-gradient-gold" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FBBF24" stopOpacity="0" />
            <stop offset="50%" stopColor="#FBBF24" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#FBBF24" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="line-gradient-cyan" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#06B6D4" stopOpacity="0" />
            <stop offset="50%" stopColor="#06B6D4" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#06B6D4" stopOpacity="0" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Sankofa (grandfather) to Elara (mother) */}
        <line
          x1="50%"
          y1="12%"
          x2="50%"
          y2="38%"
          stroke="url(#line-gradient-silver)"
          strokeWidth="2"
          strokeDasharray="8,4"
          filter="url(#glow)"
          className="animate-pulse"
        />

        {/* Elara to Themba */}
        <line
          x1="42%"
          y1="52%"
          x2="12%"
          y2="78%"
          stroke="url(#line-gradient-gold)"
          strokeWidth="2"
          strokeDasharray="6,3"
          filter="url(#glow)"
          className="animate-pulse"
          style={{ animationDelay: "0.2s" }}
        />

        {/* Elara to Jabari */}
        <line
          x1="46%"
          y1="54%"
          x2="32%"
          y2="80%"
          stroke="url(#line-gradient-gold)"
          strokeWidth="2"
          strokeDasharray="6,3"
          filter="url(#glow)"
          className="animate-pulse"
          style={{ animationDelay: "0.4s" }}
        />

        {/* Elara to Nia */}
        <line
          x1="54%"
          y1="54%"
          x2="68%"
          y2="80%"
          stroke="url(#line-gradient-cyan)"
          strokeWidth="2"
          strokeDasharray="6,3"
          filter="url(#glow)"
          className="animate-pulse"
          style={{ animationDelay: "0.6s" }}
        />

        {/* Elara to Imani */}
        <line
          x1="58%"
          y1="52%"
          x2="88%"
          y2="78%"
          stroke="url(#line-gradient-gold)"
          strokeWidth="2"
          strokeDasharray="6,3"
          filter="url(#glow)"
          className="animate-pulse"
          style={{ animationDelay: "0.8s" }}
        />
      </svg>

      {/* Sankofa - Grandfather at top */}
      <div
        className="absolute z-20"
        style={{
          left: "50%",
          top: "2%",
          transform: `translateX(-50%) translate(${(mousePosition.x - 400) * 0.008}px, ${(mousePosition.y - 275) * 0.008}px)`,
          transition: "transform 0.3s ease-out",
        }}
      >
        <AfricanAgentAvatar agent="sankofa" size="xl" trackMouse showAura />
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-center whitespace-nowrap">
          <p className="text-sm font-bold text-slate-200">Sankofa</p>
          <p className="text-xs text-slate-400">The Elder</p>
        </div>
      </div>

      {/* Main Elara - Mother center (largest, the orchestrator) */}
      <div className="relative z-10" style={{ marginTop: "-20px" }}>
        <AfricanAgentAvatar agent="elara" size="hero" trackMouse showAura />
        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 text-center">
          <p className="text-2xl font-bold bg-gradient-to-r from-amber-200 via-yellow-300 to-cyan-300 bg-clip-text text-transparent">
            Elara
          </p>
          <p className="text-sm text-cyan-400">XO Architect • The Orchestrator</p>
        </div>
      </div>

      {/* Themba - Son (far left bottom) */}
      <div
        className="absolute z-20"
        style={{
          left: "5%",
          bottom: "8%",
          transform: `translate(${(mousePosition.x - 400) * 0.02}px, ${(mousePosition.y - 275) * -0.015}px)`,
          transition: "transform 0.2s ease-out",
        }}
      >
        <AfricanAgentAvatar agent="themba" size="lg" trackMouse />
        <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 text-center whitespace-nowrap">
          <p className="text-sm font-semibold text-yellow-200">Themba</p>
          <p className="text-xs text-yellow-400">The Builder</p>
        </div>
      </div>

      {/* Jabari - Middle Brother */}
      <div
        className="absolute z-20"
        style={{
          left: "25%",
          bottom: "5%",
          transform: `translate(${(mousePosition.x - 400) * 0.018}px, ${(mousePosition.y - 275) * -0.018}px)`,
          transition: "transform 0.2s ease-out",
        }}
      >
        <AfricanAgentAvatar agent="jabari" size="lg" trackMouse />
        <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 text-center whitespace-nowrap">
          <p className="text-sm font-semibold text-orange-200">Jabari</p>
          <p className="text-xs text-orange-400">The Guardian</p>
        </div>
      </div>

      {/* Nia - Daughter (right side) */}
      <div
        className="absolute z-20"
        style={{
          right: "25%",
          bottom: "5%",
          transform: `translate(${(mousePosition.x - 400) * -0.018}px, ${(mousePosition.y - 275) * -0.018}px)`,
          transition: "transform 0.2s ease-out",
        }}
      >
        <AfricanAgentAvatar agent="nia" size="lg" trackMouse />
        <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 text-center whitespace-nowrap">
          <p className="text-sm font-semibold text-cyan-200">Nia</p>
          <p className="text-xs text-cyan-400">The Analyst</p>
        </div>
      </div>

      {/* Imani - Daughter (far right) */}
      <div
        className="absolute z-20"
        style={{
          right: "5%",
          bottom: "8%",
          transform: `translate(${(mousePosition.x - 400) * -0.02}px, ${(mousePosition.y - 275) * -0.015}px)`,
          transition: "transform 0.2s ease-out",
        }}
      >
        <AfricanAgentAvatar agent="imani" size="lg" trackMouse />
        <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 text-center whitespace-nowrap">
          <p className="text-sm font-semibold text-pink-200">Imani</p>
          <p className="text-xs text-pink-400">The Artist</p>
        </div>
      </div>

      {/* Floating Aether energy orbs */}
      <div
        className="absolute w-4 h-4 rounded-full bg-amber-400/60 blur-sm"
        style={{
          left: "35%",
          top: "35%",
          animation: "float 4s ease-in-out infinite",
        }}
      />
      <div
        className="absolute w-3 h-3 rounded-full bg-cyan-400/60 blur-sm"
        style={{
          right: "40%",
          top: "45%",
          animation: "float 3.5s ease-in-out infinite",
          animationDelay: "0.5s",
        }}
      />
      <div
        className="absolute w-2 h-2 rounded-full bg-emerald-400/60 blur-sm"
        style={{
          left: "45%",
          bottom: "35%",
          animation: "float 3s ease-in-out infinite",
          animationDelay: "1s",
        }}
      />

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) scale(1); opacity: 0.6; }
          50% { transform: translateY(-20px) scale(1.2); opacity: 1; }
        }
      `}</style>
    </div>
  )
}
