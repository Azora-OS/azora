import { AzoraLogo, GemIcon, ConstitutionalFrame, UbuntuBadge } from '../components/azora'
import { Button } from '../button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../card'

/**
 * Azora OS Design System Showcase
 * Demonstrates the Azora Gem Tri-Unity Crystal design system
 */
export function DesignSystemShowcase() {
  return (
    <div className="min-h-screen bg-background p-8 space-y-12">
      {/* Header */}
      <header className="text-center space-y-4">
        <div className="flex justify-center">
          <AzoraLogo className="w-24 h-24" animated />
        </div>
        <h1 className="text-4xl font-bold gradient-text-ubuntu">
          Azora OS Design System
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Constitutional AI Operating System - Ubuntu Philosophy Meets Quantum Technology
        </p>
        <UbuntuBadge>I am because we are</UbuntuBadge>
      </header>

      {/* Gem Icons */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Azora Gem Tri-Unity</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card effect="glass-sapphire">
            <CardHeader>
              <div className="flex items-center gap-3">
                <GemIcon gem="sapphire" glow className="w-8 h-8" />
                <CardTitle>Sapphire</CardTitle>
              </div>
              <CardDescription>Technology & AI</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                The apex of innovation, representing our AI-powered technology stack and
                quantum computing capabilities.
              </p>
            </CardContent>
          </Card>

          <Card effect="glass-emerald">
            <CardHeader>
              <div className="flex items-center gap-3">
                <GemIcon gem="emerald" glow className="w-8 h-8" />
                <CardTitle>Emerald</CardTitle>
              </div>
              <CardDescription>Education & Growth</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                The foundation of knowledge, powering world-class education and continuous
                learning for all.
              </p>
            </CardContent>
          </Card>

          <Card effect="glass-ruby">
            <CardHeader>
              <div className="flex items-center gap-3">
                <GemIcon gem="ruby" glow className="w-8 h-8" />
                <CardTitle>Ruby</CardTitle>
              </div>
              <CardDescription>Finance & Value</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                The core of prosperity, enabling financial inclusion and collective wealth
                creation.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Button Variants */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Button Variants</h2>
        <div className="flex flex-wrap gap-4">
          <Button variant="default">Default</Button>
          <Button variant="sapphire">Sapphire</Button>
          <Button variant="emerald">Emerald</Button>
          <Button variant="ruby">Ruby</Button>
          <Button variant="ubuntu">Ubuntu</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
        </div>
      </section>

      {/* Card Effects */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Card Effects</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card effect="flat">
            <CardHeader>
              <CardTitle>Flat Card</CardTitle>
              <CardDescription>Standard card design</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm">Clean and simple card with no special effects.</p>
            </CardContent>
          </Card>

          <Card effect="glass">
            <CardHeader>
              <CardTitle>Glass Card</CardTitle>
              <CardDescription>Glassmorphism effect</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm">Modern glass effect with backdrop blur.</p>
            </CardContent>
          </Card>

          <Card effect="premium">
            <CardHeader>
              <CardTitle>Premium Card</CardTitle>
              <CardDescription>Gold trim effect</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm">Premium card with golden border gradient.</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Constitutional Frame */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Constitutional Frame</h2>
        <ConstitutionalFrame>
          <div className="space-y-4">
            <h3 className="text-xl font-semibold gradient-text-ubuntu">
              Ubuntu Philosophy
            </h3>
            <p className="text-muted-foreground">
              "I am because we are" - The Constitutional AI Operating System embodies the
              Ubuntu philosophy, ensuring that technology serves humanity through collective
              prosperity, truth, and transparency.
            </p>
            <div className="flex gap-4">
              <Button variant="sapphire">Learn More</Button>
              <Button variant="outline">Documentation</Button>
            </div>
          </div>
        </ConstitutionalFrame>
      </section>

      {/* Glow Effects */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Glow Effects</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-lg bg-card border glow-sapphire">
            <h3 className="font-semibold text-glow-sapphire">Sapphire Glow</h3>
            <p className="text-sm text-muted-foreground mt-2">
              Technology and AI powered features
            </p>
          </div>
          <div className="p-6 rounded-lg bg-card border glow-emerald">
            <h3 className="font-semibold text-glow-emerald">Emerald Glow</h3>
            <p className="text-sm text-muted-foreground mt-2">
              Education and growth initiatives
            </p>
          </div>
          <div className="p-6 rounded-lg bg-card border glow-ruby">
            <h3 className="font-semibold text-glow-ruby">Ruby Glow</h3>
            <p className="text-sm text-muted-foreground mt-2">
              Finance and value creation
            </p>
          </div>
        </div>
      </section>

      {/* Gradient Text */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Gradient Text</h2>
        <div className="space-y-3">
          <p className="text-3xl font-bold gradient-text-sapphire">
            Sapphire Gradient Text
          </p>
          <p className="text-3xl font-bold gradient-text-emerald">
            Emerald Gradient Text
          </p>
          <p className="text-3xl font-bold gradient-text-ruby">Ruby Gradient Text</p>
          <p className="text-3xl font-bold holo-text">Holographic Animated Text</p>
        </div>
      </section>
    </div>
  )
}