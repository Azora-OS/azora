"use client"

import { Users, Globe, Heart, Sparkles } from "lucide-react"

export function Ubuntu() {
  return (
    <section id="ubuntu" className="relative py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-accent/5 to-background" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          {/* Main Content */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-6">
              <Heart className="w-4 h-4 text-accent" />
              <span className="text-sm font-semibold text-accent">Ubuntu Philosophy</span>
            </div>

            <h2 className="text-6xl sm:text-7xl font-bold mb-8 text-balance leading-tight">
              <span className="gradient-text">I Am Because We Are</span>
            </h2>

            <p className="text-2xl sm:text-3xl text-muted-foreground mb-8 text-pretty font-light leading-relaxed">
              Ubuntu — the ancient African philosophy that recognizes our shared humanity and interconnectedness
            </p>
          </div>

          {/* Ubuntu Principles */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="text-center p-8 rounded-3xl acrylic border border-border hover:border-accent/40 transition-all duration-300">
              <Users className="w-12 h-12 text-accent mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-3 text-foreground">Community First</h3>
              <p className="text-muted-foreground leading-relaxed">
                Your success is our success. We rise together, not at each other's expense
              </p>
            </div>

            <div className="text-center p-8 rounded-3xl acrylic border border-border hover:border-accent/40 transition-all duration-300">
              <Globe className="w-12 h-12 text-accent mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-3 text-foreground">Global Impact</h3>
              <p className="text-muted-foreground leading-relaxed">
                Built in Africa, for humanity. Technology that serves the many, not the few
              </p>
            </div>

            <div className="text-center p-8 rounded-3xl acrylic border border-border hover:border-accent/40 transition-all duration-300">
              <Sparkles className="w-12 h-12 text-accent mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-3 text-foreground">Shared Prosperity</h3>
              <p className="text-muted-foreground leading-relaxed">
                Wealth creation that lifts everyone. Education that pays, not costs
              </p>
            </div>
          </div>

          {/* Quote Section */}
          <div className="p-12 rounded-3xl bg-gradient-to-br from-accent/10 via-primary/10 to-secondary/10 border border-accent/20 text-center">
            <blockquote className="text-3xl sm:text-4xl font-light text-foreground leading-relaxed mb-6 italic">
              "A person is a person through other people. We affirm our humanity when we acknowledge that of others."
            </blockquote>
            <p className="text-lg text-muted-foreground">— Ubuntu Proverb</p>
          </div>

          {/* Mission Statement */}
          <div className="mt-16 text-center">
            <p className="text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
              From <span className="font-semibold text-foreground">Africa 🇿🇦</span> For{" "}
              <span className="font-semibold text-foreground">Humanity 🌍</span> Unto{" "}
              <span className="font-semibold gradient-text">God's Glory ✨</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
