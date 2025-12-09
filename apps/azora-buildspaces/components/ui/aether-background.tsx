"use client"

import { useEffect, useRef, useState } from "react"

export function AetherBackground({
  intensity = "medium",
  showParticles = true,
  showAurora = true,
  followMouse = false,
}: {
  intensity?: "low" | "medium" | "high"
  showParticles?: boolean
  showAurora?: boolean
  followMouse?: boolean
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

  const opacities = {
    low: { primary: 0.05, secondary: 0.03 },
    medium: { primary: 0.1, secondary: 0.05 },
    high: { primary: 0.2, secondary: 0.1 },
  }

  // Mouse tracking for interactive glow
  useEffect(() => {
    if (!followMouse) return

    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY })
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [followMouse])

  // Particle animation
  useEffect(() => {
    if (!showParticles || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    const particles: {
      x: number
      y: number
      vx: number
      vy: number
      size: number
      color: string
      alpha: number
      pulseSpeed: number
      pulseOffset: number
    }[] = []

    // African mineral & sunset inspired colors
    const colors = [
      "#10B981", // Emerald/Aether
      "#14B8A6", // Teal
      "#F59E0B", // Amber/Gold
      "#FBBF24", // Yellow Gold
      "#FB923C", // Orange Sunset
      "#06B6D4", // Cyan
    ]

    const particleCount = intensity === "high" ? 80 : intensity === "medium" ? 50 : 30

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        size: Math.random() * 2 + 1,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: Math.random() * 0.4 + 0.1,
        pulseSpeed: Math.random() * 0.02 + 0.01,
        pulseOffset: Math.random() * Math.PI * 2,
      })
    }

    let animationId: number
    let time = 0

    const animate = () => {
      time += 1
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      particles.forEach((p) => {
        p.x += p.vx
        p.y += p.vy

        if (p.x < 0 || p.x > canvas.width) p.vx *= -1
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1

        // Pulsing effect
        const pulse = Math.sin(time * p.pulseSpeed + p.pulseOffset) * 0.3 + 0.7

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size * pulse, 0, Math.PI * 2)
        ctx.fillStyle = p.color
        ctx.globalAlpha = p.alpha * pulse
        ctx.fill()

        // Glow effect
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size * 3 * pulse, 0, Math.PI * 2)
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 3 * pulse)
        gradient.addColorStop(0, p.color + "40")
        gradient.addColorStop(1, "transparent")
        ctx.fillStyle = gradient
        ctx.globalAlpha = p.alpha * 0.5
        ctx.fill()
      })

      // Draw connections
      ctx.globalAlpha = 0.08
      particles.forEach((p1, i) => {
        particles.slice(i + 1).forEach((p2) => {
          const dx = p1.x - p2.x
          const dy = p1.y - p2.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 120) {
            ctx.beginPath()
            ctx.moveTo(p1.x, p1.y)
            ctx.lineTo(p2.x, p2.y)
            const gradient = ctx.createLinearGradient(p1.x, p1.y, p2.x, p2.y)
            gradient.addColorStop(0, p1.color)
            gradient.addColorStop(1, p2.color)
            ctx.strokeStyle = gradient
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        })
      })

      animationId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener("resize", resizeCanvas)
      cancelAnimationFrame(animationId)
    }
  }, [showParticles, intensity])

  const o = opacities[intensity]

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Particle canvas */}
      {showParticles && <canvas ref={canvasRef} className="absolute inset-0" />}

      {/* Mouse-following glow */}
      {followMouse && (
        <div
          className="absolute w-[600px] h-[600px] rounded-full pointer-events-none transition-all duration-300 ease-out"
          style={{
            left: mousePos.x - 300,
            top: mousePos.y - 300,
            background: `radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, transparent 70%)`,
          }}
        />
      )}

      {/* Aurora effects */}
      {showAurora && (
        <>
          {/* Primary Aether glow - top center */}
          <div
            className="absolute left-1/2 -top-40 h-[800px] w-[1200px] -translate-x-1/2 rounded-full blur-3xl"
            style={{
              background: `radial-gradient(ellipse, rgba(16, 185, 129, ${o.primary}) 0%, rgba(20, 184, 166, ${o.primary * 0.5}) 40%, transparent 70%)`,
              animation: "aether-pulse 4s ease-in-out infinite",
            }}
          />

          {/* African sunset glow - left side */}
          <div
            className="absolute -left-60 top-1/4 h-[500px] w-[600px] rounded-full blur-3xl"
            style={{
              background: `radial-gradient(ellipse, rgba(245, 158, 11, ${o.secondary * 1.5}) 0%, rgba(249, 115, 22, ${o.secondary}) 50%, transparent 70%)`,
              animation: "aether-float 8s ease-in-out infinite",
            }}
          />

          {/* Gold mineral glow - right side */}
          <div
            className="absolute -right-60 top-1/3 h-[450px] w-[550px] rounded-full blur-3xl"
            style={{
              background: `radial-gradient(ellipse, rgba(251, 191, 36, ${o.secondary * 1.2}) 0%, rgba(234, 179, 8, ${o.secondary}) 50%, transparent 70%)`,
              animation: "aether-float 10s ease-in-out infinite reverse",
            }}
          />

          {/* Tanzanite/Indigo glow - bottom left */}
          <div
            className="absolute left-1/4 -bottom-40 h-[400px] w-[500px] rounded-full blur-3xl"
            style={{
              background: `radial-gradient(ellipse, rgba(99, 102, 241, ${o.secondary}) 0%, rgba(139, 92, 246, ${o.secondary * 0.5}) 50%, transparent 70%)`,
              animation: "aether-float 12s ease-in-out infinite",
            }}
          />

          {/* Ruby/Rose glow - bottom right */}
          <div
            className="absolute right-1/4 -bottom-20 h-[350px] w-[450px] rounded-full blur-3xl"
            style={{
              background: `radial-gradient(ellipse, rgba(244, 63, 94, ${o.secondary * 0.8}) 0%, rgba(251, 113, 133, ${o.secondary * 0.4}) 50%, transparent 70%)`,
              animation: "aether-float 9s ease-in-out infinite reverse",
            }}
          />

          {/* Titanium/Silver accent - center bottom */}
          <div
            className="absolute left-1/2 -translate-x-1/2 bottom-0 h-[200px] w-[800px] rounded-full blur-3xl"
            style={{
              background: `radial-gradient(ellipse, rgba(148, 163, 184, ${o.secondary * 0.5}) 0%, transparent 70%)`,
              animation: "aether-pulse 6s ease-in-out infinite",
            }}
          />
        </>
      )}
    </div>
  )
}
