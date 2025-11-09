"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Menu, X, Sparkles } from "lucide-react"

export function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "glass-medium backdrop-blur-xl shadow-premium-md" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-primary via-secondary to-accent flex items-center justify-center divine-glow">
              <Sparkles className="w-6 h-6 text-white animate-pulse" />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold gradient-text tracking-tight">Azora OS</span>
              <span className="text-xs text-muted-foreground -mt-1">Constitutional AI</span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <a
              href="#dna"
              className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors hover:scale-105 transform duration-200"
            >
              Divine DNA
            </a>
            <a
              href="#ai"
              className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors hover:scale-105 transform duration-200"
            >
              Constitutional AI
            </a>
            <a
              href="#ecosystem"
              className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors hover:scale-105 transform duration-200"
            >
              Ecosystem
            </a>
            <a
              href="#ubuntu"
              className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors hover:scale-105 transform duration-200"
            >
              Ubuntu
            </a>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Button variant="ghost" size="sm" className="hover:bg-muted/50">
              Sign In
            </Button>
            <Button
              size="sm"
              className="gradient-bg text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              Enter the Covenant
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden acrylic border-t border-border">
          <div className="px-4 py-4 space-y-3">
            <a
              href="#dna"
              className="block py-2 text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
            >
              Divine DNA
            </a>
            <a
              href="#ai"
              className="block py-2 text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
            >
              Constitutional AI
            </a>
            <a
              href="#ecosystem"
              className="block py-2 text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
            >
              Ecosystem
            </a>
            <a
              href="#ubuntu"
              className="block py-2 text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
            >
              Ubuntu
            </a>
            <div className="pt-3 space-y-2">
              <Button variant="ghost" size="sm" className="w-full">
                Sign In
              </Button>
              <Button size="sm" className="w-full gradient-bg text-white font-semibold">
                Enter the Covenant
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
