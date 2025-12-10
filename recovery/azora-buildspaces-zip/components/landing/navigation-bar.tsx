"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, X, Sparkles, ArrowRight, ChevronDown, Code2, Palette, Brain, Database } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export function NavigationBar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const navLinks = [
    { label: "Features", href: "#features" },
    { label: "Agents", href: "#agents" },
    { label: "Pricing", href: "#pricing" },
  ]

  const productLinks = [
    {
      label: "Code Chamber",
      href: "/code-chamber",
      description: "Cloud IDE with AI agents",
      icon: Code2,
      color: "text-primary",
    },
    {
      label: "Design Studio",
      href: "/design-studio",
      description: "Visual design tools",
      icon: Palette,
      color: "text-pink-500",
    },
    { label: "AI Lab", href: "/ai-lab", description: "Agent management", icon: Brain, color: "text-accent" },
    {
      label: "Data Forge",
      href: "/data-forge",
      description: "Database management",
      icon: Database,
      color: "text-amber-500",
    },
  ]

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled ? "bg-background/80 backdrop-blur-xl border-b border-border" : "bg-transparent"
        }`}
      >
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center overflow-hidden">
                <Sparkles className="w-5 h-5 text-background" />
                <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/20" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold tracking-tight text-foreground">BuildSpaces</span>
                <span className="text-[10px] text-muted-foreground -mt-1 tracking-widest uppercase">by Azora</span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted flex items-center gap-1">
                    Products
                    <ChevronDown className="w-3 h-3" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-72">
                  {productLinks.map((link) => (
                    <DropdownMenuItem key={link.label} asChild>
                      <Link href={link.href} className="flex items-start gap-3 py-3">
                        <div className={`mt-0.5 ${link.color}`}>
                          <link.icon className="w-5 h-5" />
                        </div>
                        <div className="flex flex-col items-start">
                          <span className="font-medium">{link.label}</span>
                          <span className="text-xs text-muted-foreground">{link.description}</span>
                        </div>
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted"
                >
                  {link.label}
                </Link>
              ))}

              <Link
                href="/docs"
                className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted"
              >
                Docs
              </Link>
            </div>

            {/* Desktop CTA */}
            <div className="hidden md:flex items-center gap-3">
              <Button variant="ghost" size="sm" className="text-muted-foreground">
                Sign in
              </Button>
              <Link href="/code-chamber">
                <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 glow-primary">
                  Get Started
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </nav>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 top-16 z-40 bg-background/95 backdrop-blur-xl md:hidden"
          >
            <nav className="p-6 space-y-4">
              <div className="space-y-2">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Products</span>
                {productLinks.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-lg font-medium text-foreground hover:bg-muted rounded-lg transition-colors"
                  >
                    <link.icon className={`w-5 h-5 ${link.color}`} />
                    {link.label}
                  </Link>
                ))}
              </div>

              <div className="h-px bg-border" />

              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-4 py-3 text-lg font-medium text-foreground hover:bg-muted rounded-lg transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-4 space-y-3">
                <Button variant="outline" className="w-full bg-transparent">
                  Sign in
                </Button>
                <Link href="/code-chamber" className="block">
                  <Button className="w-full bg-primary text-primary-foreground">Get Started</Button>
                </Link>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
