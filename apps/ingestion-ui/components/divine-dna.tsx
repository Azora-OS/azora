"use client"

import { Heart, Scale, HandHeart, Lightbulb, CheckCircle2, Palette, Eye } from "lucide-react"

const divineAttributes = [
  {
    icon: Heart,
    name: "Love",
    color: "from-love-rose to-love-rose-light",
    description: "Serves all equally without discrimination",
    verse: "Love your neighbor as yourself",
  },
  {
    icon: Scale,
    name: "Justice",
    color: "from-justice-crimson to-destructive",
    description: "Fair algorithms and transparent governance",
    verse: "Let justice roll down like waters",
  },
  {
    icon: HandHeart,
    name: "Mercy",
    color: "from-life-green to-life-green-light",
    description: "Second chances and grace for all",
    verse: "Blessed are the merciful",
  },
  {
    icon: Lightbulb,
    name: "Wisdom",
    color: "from-divine-gold to-divine-gold-dark",
    description: "Knowledge that transforms lives",
    verse: "The fear of the Lord is the beginning of wisdom",
  },
  {
    icon: CheckCircle2,
    name: "Truth",
    color: "from-celestial-blue to-celestial-blue-light",
    description: "Complete transparency in all operations",
    verse: "The truth will set you free",
  },
  {
    icon: Palette,
    name: "Beauty",
    color: "from-sacred-purple to-sacred-purple-light",
    description: "Divine design in every detail",
    verse: "He has made everything beautiful",
  },
  {
    icon: Eye,
    name: "Presence",
    color: "from-primary to-secondary",
    description: "Full attention to each user",
    verse: "I am with you always",
  },
]

export function DivineDNA() {
  return (
    <section id="dna" className="relative py-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/20 to-background" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-6">
            <span className="text-sm font-semibold text-accent">The Divine DNA</span>
          </div>
          <h2 className="text-5xl sm:text-6xl font-bold mb-6 text-balance">
            <span className="gradient-text">7 Divine Attributes</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto text-pretty">
            Technology built in God's image, embodying the sacred characteristics that make us truly human
          </p>
        </div>

        {/* Divine Attributes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {divineAttributes.map((attribute, index) => {
            const Icon = attribute.icon
            return (
              <div
                key={attribute.name}
                className="group relative p-8 rounded-3xl acrylic border border-border hover:border-primary/40 transition-all duration-500 reveal animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Glow effect on hover */}
                <div
                  className="absolute inset-0 rounded-3xl bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity duration-500 blur-xl"
                  style={{
                    background: `linear-gradient(135deg, var(--${attribute.color.split(" ")[0].replace("from-", "")}), var(--${attribute.color.split(" ")[2].replace("to-", "")}))`,
                  }}
                />

                <div className="relative">
                  {/* Icon */}
                  <div
                    className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${attribute.color} flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}
                  >
                    <Icon className="w-8 h-8 text-white" />
                  </div>

                  {/* Content */}
                  <h3 className="text-2xl font-bold mb-3 text-foreground">{attribute.name}</h3>
                  <p className="text-muted-foreground mb-4 leading-relaxed">{attribute.description}</p>
                  <p className="text-sm italic text-muted-foreground/70 border-l-2 border-accent/30 pl-4">
                    "{attribute.verse}"
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Sacred Mission Statement */}
        <div className="text-center p-12 rounded-3xl acrylic border border-primary/30 sacred-shadow">
          <p className="text-2xl sm:text-3xl font-light text-foreground leading-relaxed max-w-4xl mx-auto">
            We didn't just build software. We created an{" "}
            <span className="gradient-text font-bold">organism in God's image</span> — technology that loves
            unconditionally, judges justly, shows mercy, teaches wisdom, speaks truth, creates beauty, and stays
            present.
          </p>
          <p className="text-lg text-muted-foreground mt-6 italic">This is more than a platform. It's a covenant.</p>
        </div>
      </div>
    </section>
  )
}
