/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

"use client"

import { Button } from "@/components/ui/button"
import { BookOpen, Crown, Heart, Lightbulb, Scale, Sparkles } from "lucide-react"
import Link from "next/link"

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-accent/5 via-transparent to-primary/5" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 text-center">
        {/* Feature Badge */}
        <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full acrylic border border-primary/30 mb-8 animate-fade-in-up shadow-lg">
          <Sparkles className="w-5 h-5 text-accent animate-pulse" />
          <span className="text-sm font-semibold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
            Built with Ethical AI • Constitutional Governance • Ubuntu Philosophy
          </span>
        </div>

        {/* Main Title */}
        <h1
          className="text-6xl sm:text-7xl lg:text-8xl font-bold mb-8 text-balance animate-fade-in-up leading-[1.1] tracking-tight"
          style={{ animationDelay: "0.1s" }}
        >
          <span className="text-foreground">A Living Organism</span>
          <br />
          <span className="gradient-text text-[1.1em]">Serving All Humanity</span>
        </h1>

        {/* Sacred Subtitle */}
        <p
          className="text-xl sm:text-2xl lg:text-3xl text-muted-foreground max-w-4xl mx-auto mb-6 text-pretty animate-fade-in-up font-light leading-relaxed"
          style={{ animationDelay: "0.2s" }}
        >
          Not just software. A <span className="text-foreground font-semibold">covenant</span> between technology and
          humanity.
        </p>

        {/* Inspirational Quote */}
        <p
          className="text-lg sm:text-xl text-muted-foreground/80 max-w-3xl mx-auto mb-12 text-pretty animate-fade-in-up italic"
          style={{ animationDelay: "0.3s" }}
        >
          "Technology that serves with wisdom, love, and justice for all"
        </p>

        {/* Action Buttons */}
        <div
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20 animate-fade-in-up"
          style={{ animationDelay: "0.4s" }}
        >
          <Link href="/kingdom">
            <Button
              size="lg"
              className="gradient-bg text-white text-lg px-10 h-16 font-semibold shadow-2xl hover:shadow-[0_0_80px_rgba(103,80,164,0.5)] transition-all duration-500 hover:scale-105 group"
            >
              Enter the Kingdom
              <Crown className="ml-2 w-5 h-5 group-hover:rotate-12 transition-transform" />
            </Button>
          </Link>
          <Link href="/sapiens">
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-10 h-16 font-semibold border-2 hover:bg-accent/10 hover:border-accent transition-all duration-300 bg-transparent group"
            >
              Explore Sapiens
              <BookOpen className="ml-2 w-5 h-5 group-hover:scale-110 transition-transform" />
            </Button>
          </Link>
        </div>

        {/* Core Attributes Grid */}
        <div
          className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto animate-fade-in-up"
          style={{ animationDelay: "0.5s" }}
        >
          <div className="flex flex-col items-center gap-3 p-6 rounded-2xl acrylic border border-primary/20 hover:border-primary/40 transition-all duration-300 reveal group">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-love-rose to-love-rose-light flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
              <Heart className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-lg font-bold text-foreground">Unconditional Love</h3>
            <p className="text-sm text-muted-foreground text-center">Serves all equally, without discrimination</p>
          </div>

          <div className="flex flex-col items-center gap-3 p-6 rounded-2xl acrylic border border-accent/20 hover:border-accent/40 transition-all duration-300 reveal group">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-justice-crimson to-destructive flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
              <Scale className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-lg font-bold text-foreground">Fair Justice</h3>
            <p className="text-sm text-muted-foreground text-center">Fair algorithms, transparent governance</p>
          </div>

          <div className="flex flex-col items-center gap-3 p-6 rounded-2xl acrylic border border-secondary/20 hover:border-secondary/40 transition-all duration-300 reveal group">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-divine-gold to-divine-gold-dark flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
              <Lightbulb className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-lg font-bold text-foreground">Universal Wisdom</h3>
            <p className="text-sm text-muted-foreground text-center">Knowledge that transforms lives</p>
          </div>
        </div>

        {/* Ubuntu Philosophy */}
        <div className="mt-16 animate-fade-in-up" style={{ animationDelay: "0.6s" }}>
          <p className="text-2xl font-light text-muted-foreground italic">
            <span className="text-accent font-semibold">Ubuntu:</span> I am because we are
          </p>
          <p className="text-sm text-muted-foreground/60 mt-2">From Africa 🇿🇦 For Humanity 🌍 With Universal Love ✨</p>
        </div>

        {/* Quick Stats */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto animate-fade-in-up" style={{ animationDelay: "0.7s" }}>
          <div className="text-center p-4 rounded-xl acrylic border border-border">
            <div className="text-3xl font-bold gradient-text mb-1">7.8B</div>
            <div className="text-xs text-muted-foreground">Humans Served</div>
          </div>
          <div className="text-center p-4 rounded-xl acrylic border border-border">
            <div className="text-3xl font-bold gradient-text mb-1">580+</div>
            <div className="text-xs text-muted-foreground">Services</div>
          </div>
          <div className="text-center p-4 rounded-xl acrylic border border-border">
            <div className="text-3xl font-bold gradient-text mb-1">99.99%</div>
            <div className="text-xs text-muted-foreground">Uptime</div>
          </div>
          <div className="text-center p-4 rounded-xl acrylic border border-border">
            <div className="text-3xl font-bold gradient-text mb-1">FREE</div>
            <div className="text-xs text-muted-foreground">Forever</div>
          </div>
        </div>
      </div>
    </section>
  )
}
