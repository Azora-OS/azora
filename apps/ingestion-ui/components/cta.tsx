"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, Github, BookOpen } from "lucide-react"

export function CTA() {
  return (
    <section className="py-32 bg-background relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-3xl" />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-4xl sm:text-5xl font-bold mb-6 text-balance">
          Ready to Transform <span className="gradient-text">Education?</span>
        </h2>
        <p className="text-xl text-muted-foreground mb-12 text-pretty max-w-2xl mx-auto">
          Join thousands of learners earning while they learn. Start your journey with Azora Living today.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button size="lg" className="gradient-bg text-primary-foreground text-lg px-8 h-14 glow">
            Get Started Free
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
          <Button size="lg" variant="outline" className="text-lg px-8 h-14 bg-transparent">
            <BookOpen className="mr-2 w-5 h-5" />
            Read Documentation
          </Button>
          <Button size="lg" variant="outline" className="text-lg px-8 h-14 bg-transparent">
            <Github className="mr-2 w-5 h-5" />
            View on GitHub
          </Button>
        </div>

        {/* Trust Indicators */}
        <div className="mt-16 pt-16 border-t border-border">
          <p className="text-sm text-muted-foreground mb-6">Trusted by leading institutions worldwide</p>
          <div className="flex flex-wrap items-center justify-center gap-8 opacity-50">
            <div className="text-2xl font-bold">Stanford</div>
            <div className="text-2xl font-bold">MIT</div>
            <div className="text-2xl font-bold">Harvard</div>
            <div className="text-2xl font-bold">Oxford</div>
            <div className="text-2xl font-bold">Cambridge</div>
          </div>
        </div>
      </div>
    </section>
  )
}
