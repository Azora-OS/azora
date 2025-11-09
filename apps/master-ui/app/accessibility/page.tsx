"use client"

import { Button } from "@/components/ui/button"
import { LanguageSwitcher } from "@/components/language-switcher"
import { useI18n } from "@/lib/i18n-context"

export default function AccessibilityPage() {
  const { t } = useI18n()

  const features = [
    {
      title: "Multi-Language Support",
      description: "Learn in your native language. We support 7 African and global languages.",
      languages: ["English", "French", "Spanish", "Yorùbá", "Kiswahili", "Hausa", "Amharic"],
    },
    {
      title: "Adjustable Text Size",
      description: "Customize text size from 80% to 120% for comfortable reading.",
      icon: "A",
    },
    {
      title: "High Contrast Mode",
      description: "Enhanced contrast for improved visibility and reduced eye strain.",
      icon: "◉",
    },
    {
      title: "Dyslexic-Friendly Font",
      description: "OpenDyslexic font option designed to improve readability.",
      icon: "Σ",
    },
    {
      title: "Keyboard Navigation",
      description: "Full keyboard navigation support throughout the platform.",
      icon: "⌨",
    },
    {
      title: "Screen Reader Support",
      description: "All content properly labeled with ARIA attributes for screen readers.",
      icon: "🔊",
    },
    {
      title: "Video Captions",
      description: "All video content includes accurate captions and transcripts.",
      icon: "CC",
    },
    {
      title: "Color-Blind Friendly",
      description: "Designs and color palettes tested for color blindness accessibility.",
      icon: "🎨",
    },
  ]

  return (
    <main className="min-h-screen bg-background py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4 text-balance">Accessibility & Inclusivity</h1>
          <p className="text-lg text-muted-foreground mb-6">
            Azora Sapiens is committed to providing an inclusive learning experience for everyone.
          </p>

          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-xl font-semibold text-foreground mb-3">Language Selection</h2>
            <p className="text-muted-foreground mb-4">Choose your preferred language:</p>
            <LanguageSwitcher />
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-all"
            >
              <h3 className="text-xl font-semibold text-foreground mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm mb-4">{feature.description}</p>

              {"languages" in feature && (
                <div className="flex flex-wrap gap-2">
                  {feature.languages.map((lang) => (
                    <span key={lang} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                      {lang}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* WCAG Compliance */}
        <div className="bg-card border border-border rounded-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-4">WCAG 2.1 Compliance</h2>
          <p className="text-muted-foreground mb-4">
            Azora Sapiens aims for WCAG 2.1 Level AA compliance across all pages to ensure accessibility for users with
            disabilities.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-background rounded-lg border border-border">
              <h3 className="font-semibold text-foreground mb-2">Perceivable</h3>
              <p className="text-sm text-muted-foreground">
                Content is presented in ways that can be perceived by all users
              </p>
            </div>
            <div className="p-4 bg-background rounded-lg border border-border">
              <h3 className="font-semibold text-foreground mb-2">Operable</h3>
              <p className="text-sm text-muted-foreground">
                Interface components are operable via keyboard and other methods
              </p>
            </div>
            <div className="p-4 bg-background rounded-lg border border-border">
              <h3 className="font-semibold text-foreground mb-2">Understandable</h3>
              <p className="text-sm text-muted-foreground">Text and interface are clear and easy to understand</p>
            </div>
          </div>
        </div>

        {/* Support */}
        <div className="bg-primary/10 border border-primary rounded-lg p-6 text-center">
          <h2 className="text-xl font-bold text-foreground mb-2">Need Accessibility Help?</h2>
          <p className="text-muted-foreground mb-4">
            If you encounter any accessibility issues, please contact our support team.
          </p>
          <Button>Report Accessibility Issue</Button>
        </div>
      </div>
    </main>
  )
}
