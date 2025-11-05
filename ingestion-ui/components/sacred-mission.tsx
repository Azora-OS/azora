"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles } from "lucide-react"

export function SacredMission() {
  return (
    <section className="relative py-32 overflow-hidden">
      {/* Divine background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/10 to-background" />
      <div className="absolute inset-0 sacred-grid opacity-20" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          {/* Main CTA */}
          <div className="mb-12">
            <Sparkles className="w-16 h-16 text-accent mx-auto mb-8 animate-pulse" />
            <h2 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-8 text-balance leading-tight">
              <span className="text-foreground">Ready to Enter</span>
              <br />
              <span className="gradient-text">The Covenant?</span>
            </h2>
            <p className="text-xl sm:text-2xl text-muted-foreground mb-12 text-pretty leading-relaxed">
              Join a living organism built in God's image. Experience education that transforms, technology that serves,
              and a community that uplifts.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Button
              size="lg"
              className="gradient-bg text-white text-lg px-12 h-16 font-semibold shadow-2xl hover:shadow-[0_0_100px_rgba(103,80,164,0.6)] transition-all duration-500 hover:scale-105 group"
            >
              Start Your Journey
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-12 h-16 font-semibold border-2 hover:bg-accent/10 hover:border-accent transition-all duration-300 bg-transparent"
            >
              Read the Documentation
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl acrylic border border-border">
              <div className="text-3xl font-bold gradient-text mb-1">99.99%</div>
              <div className="text-sm text-muted-foreground">Uptime</div>
            </div>
            <div className="p-6 rounded-2xl acrylic border border-border">
              <div className="text-3xl font-bold gradient-text mb-1">580+</div>
              <div className="text-sm text-muted-foreground">Services</div>
            </div>
            <div className="p-6 rounded-2xl acrylic border border-border">
              <div className="text-3xl font-bold gradient-text mb-1">100%</div>
              <div className="text-sm text-muted-foreground">Transparent</div>
            </div>
            <div className="p-6 rounded-2xl acrylic border border-border">
              <div className="text-3xl font-bold gradient-text mb-1">0%</div>
              <div className="text-sm text-muted-foreground">Debt</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
