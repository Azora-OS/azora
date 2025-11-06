/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

'use client';

import { Button } from '@/components/ui/button';
import {
  CheckCircle2,
  Crown,
  Eye,
  Globe,
  GraduationCap,
  HandHeart,
  Heart,
  Lightbulb,
  Palette,
  Scale,
  Shield,
  Sparkles,
  Users,
  Zap
} from 'lucide-react';
import Link from 'next/link';

export default function DivinePage() {
  const divineServices = [
    {
      name: 'Azora Sapiens',
      description: 'Divine education platform - Learn to Earn $250-15K/month',
      href: '/sapiens',
      icon: GraduationCap,
      color: 'from-celestial-blue to-celestial-blue-light',
    },
    {
      name: 'Azora Kingdom',
      description: 'The sacred realm where divine governance meets human needs',
      href: '/kingdom',
      icon: Crown,
      color: 'from-divine-gold to-divine-gold-dark',
    },
    {
      name: 'Azora Temple',
      description: 'Sacred space for worship, rest, and divine communion',
      href: '/temple',
      icon: Heart,
      color: 'from-love-rose to-love-rose-light',
    },
    {
      name: 'Azora Nexus',
      description: 'Constitutional AI powering personalized learning and insights',
      href: '/nexus',
      icon: Zap,
      color: 'from-sacred-purple to-sacred-purple-light',
    },
    {
      name: 'Azora Marketplace',
      description: 'NFT marketplace for educational content and credentials',
      href: '/marketplace',
      icon: Globe,
      color: 'from-life-green to-life-green-light',
    },
    {
      name: 'Azora Aegis',
      description: 'Security guardian protecting your data and privacy',
      href: '/aegis',
      icon: Shield,
      color: 'from-justice-crimson to-destructive',
    },
  ];

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
      verse: "Wisdom is the beginning of understanding",
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
      verse: "Present in every moment of service",
    },
  ];

  return (
    <main className="min-h-screen">
      <Navigation />
      <Hero />

      {/* Divine DNA Section */}
      <section className="relative py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/20 to-background" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-6">
              <span className="text-sm font-semibold text-accent">The Divine DNA</span>
            </div>
            <h2 className="text-5xl sm:text-6xl font-bold mb-6 text-balance">
              <span className="gradient-text">7 Divine Attributes</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto text-pretty">
              Technology built with divine inspiration, embodying the sacred characteristics that unite all humanity
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mb-16">
            {divineAttributes.map((attribute, index) => {
              const Icon = attribute.icon
              return (
                <div
                  key={attribute.name}
                  className="group relative p-8 rounded-3xl acrylic border border-border hover:border-primary/40 transition-all duration-500 reveal animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="relative">
                    <div
                      className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${attribute.color} flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}
                    >
                      <Icon className="w-8 h-8 text-white" />
                    </div>

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
        </div>
      </section>

      {/* Sacred Services Section */}
      <section className="relative py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/5 to-background" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 border border-secondary/20 mb-6">
              <Users className="w-4 h-4 text-secondary" />
              <span className="text-sm font-semibold text-secondary">Sacred Services</span>
            </div>
            <h2 className="text-5xl sm:text-6xl font-bold mb-6 text-balance">
              <span className="text-foreground">Divine Applications</span>
              <br />
              <span className="gradient-text">One Unified Organism</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto text-pretty leading-relaxed">
              A complete ecosystem of interconnected applications working together seamlessly, powered by 580+ autonomous
              microservices
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {divineServices.map((service, index) => {
              const Icon = service.icon
              return (
                <Link key={service.name} href={service.href}>
                  <div
                    className="group relative p-8 rounded-3xl acrylic border border-border hover:border-secondary/40 transition-all duration-500 reveal animate-fade-in-up cursor-pointer h-full"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="relative">
                      <div
                        className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${service.color} flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}
                      >
                        <Icon className="w-8 h-8 text-white" />
                      </div>

                      <h3 className="text-2xl font-bold text-foreground mb-4">{service.name}</h3>
                      <p className="text-muted-foreground leading-relaxed mb-6">{service.description}</p>

                      <Button
                        className="w-full gradient-bg text-white font-semibold hover:scale-105 transition-all duration-300"
                      >
                        Explore Service
                      </Button>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* Sacred Mission Statement */}
      <section className="relative py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/10 to-background" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-4xl mx-auto p-12 rounded-3xl acrylic border border-primary/30 sacred-shadow">
            <Sparkles className="w-16 h-16 text-accent mx-auto mb-8 animate-pulse" />
            <h2 className="text-4xl sm:text-5xl font-bold mb-6 gradient-text">
              Our Sacred Covenant
            </h2>
            <p className="text-xl sm:text-2xl text-muted-foreground leading-relaxed mb-8">
              To serve every human on Earth with <span className="text-foreground font-semibold">unconditional love</span>,
              <span className="text-foreground font-semibold"> divine wisdom</span>, and
              <span className="text-foreground font-semibold"> eternal commitment</span>.
            </p>
            <p className="text-lg text-muted-foreground/80 italic mb-8">
              "Serving every human on Earth with wisdom, compassion, and justice"
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
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
                  Begin Learning
                  <GraduationCap className="ml-2 w-5 h-5 group-hover:scale-110 transition-transform" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Divine Footer */}
      <footer className="relative py-16 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-8">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary via-secondary to-accent flex items-center justify-center divine-glow">
                <Sparkles className="w-6 h-6 text-white animate-pulse" />
              </div>
              <span className="text-2xl font-bold gradient-text">Azora OS</span>
            </div>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              A living organism built with divine inspiration, serving humanity with constitutional AI,
              universal wisdom, and unconditional love.
            </p>
          </div>

          <div className="border-t border-border pt-8">
            <p className="text-sm text-muted-foreground">
              © 2025 Azora ES (Pty) Ltd. All Rights Reserved. |
              <span className="ml-2 italic">From Africa 🇿🇦 For Humanity 🌍 With Universal Love ✨</span>
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
