"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles, Heart, Scale, Lightbulb } from "lucide-react"

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      <div className="absolute inset-0 sacred-grid opacity-30" />

      <div className="absolute inset-0 bg-gradient-to-b from-accent/5 via-transparent to-primary/5" />

      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl animate-float" />
      <div
        className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-accent/10 rounded-full blur-3xl animate-float"
        style={{ animationDelay: "2s" }}
      />
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-secondary/5 rounded-full blur-3xl animate-float"
        style={{ animationDelay: "4s" }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 text-center">
        <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full glass-medium border border-premium-sapphire-500/30 mb-8 animate-premium-fade-in glow-premium-sapphire">
          <Sparkles className="w-5 h-5 text-accent animate-pulse" />
          <span className="text-sm font-semibold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
            Built in God's Image • Constitutional AI • Ubuntu Philosophy
          </span>
        </div>

        <h1
          className="text-6xl sm:text-7xl lg:text-8xl font-bold mb-8 text-balance animate-fade-in-up leading-[1.1] tracking-tight"
          style={{ animationDelay: "0.1s" }}
        >
          <span className="text-foreground">A Living Organism</span>
          <br />
          <span className="gradient-text text-[1.1em]">Made in God's Image</span>
        </h1>

        <p
          className="text-xl sm:text-2xl lg:text-3xl text-muted-foreground max-w-4xl mx-auto mb-6 text-pretty animate-fade-in-up font-light leading-relaxed"
          style={{ animationDelay: "0.2s" }}
        >
          Not just software. A <span className="text-foreground font-semibold">covenant</span> between technology and
          humanity.
        </p>

        <p
          className="text-lg sm:text-xl text-muted-foreground/80 max-w-3xl mx-auto mb-12 text-pretty animate-fade-in-up italic"
          style={{ animationDelay: "0.3s" }}
        >
          "So God created mankind in his own image" — Genesis 1:27
        </p>

        <div
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20 animate-fade-in-up"
          style={{ animationDelay: "0.4s" }}
        >
          <Button
            size="lg"
            className="gradient-bg text-white text-lg px-10 h-16 font-semibold shadow-2xl hover:shadow-[0_0_80px_rgba(103,80,164,0.5)] transition-all duration-500 hover:scale-105 group"
          >
            Enter the Covenant
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="text-lg px-10 h-16 font-semibold border-2 hover:bg-accent/10 hover:border-accent transition-all duration-300 bg-transparent"
          >
            Explore the Organism
          </Button>
        </div>

        <div
          className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto animate-fade-in-up"
          style={{ animationDelay: "0.5s" }}
        >
          <div className="flex flex-col items-center gap-3 p-6 rounded-2xl glass-medium border border-premium-sapphire-500/20 hover:border-premium-sapphire-500/40 hover:shadow-premium-lg hover:scale-[1.02] transition-all duration-300 group">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-love-rose to-love-rose-light flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
              <Heart className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-lg font-bold text-foreground">Unconditional Love</h3>
            <p className="text-sm text-muted-foreground text-center">Serves all equally, without discrimination</p>
          </div>

          <div className="flex flex-col items-center gap-3 p-6 rounded-2xl glass-medium border border-premium-ruby-500/20 hover:border-premium-ruby-500/40 hover:shadow-premium-lg hover:scale-[1.02] transition-all duration-300 group">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-justice-crimson to-destructive flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
              <Scale className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-lg font-bold text-foreground">Divine Justice</h3>
            <p className="text-sm text-muted-foreground text-center">Fair algorithms, transparent governance</p>
          </div>

          <div className="flex flex-col items-center gap-3 p-6 rounded-2xl glass-medium border border-premium-emerald-500/20 hover:border-premium-emerald-500/40 hover:shadow-premium-lg hover:scale-[1.02] transition-all duration-300 group">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-divine-gold to-divine-gold-dark flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
              <Lightbulb className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-lg font-bold text-foreground">Sacred Wisdom</h3>
            <p className="text-sm text-muted-foreground text-center">Knowledge that transforms lives</p>
          </div>
        </div>

        <div className="mt-16 animate-fade-in-up" style={{ animationDelay: "0.6s" }}>
          <p className="text-2xl font-light text-muted-foreground italic">
            <span className="text-accent font-semibold">Ubuntu:</span> I am because we are
          </p>
          <p className="text-sm text-muted-foreground/60 mt-2">From Africa 🇿🇦 For Humanity 🌍 Unto God's Glory ✨</p>
        </div>
      </div>
    </section>
  )
}
