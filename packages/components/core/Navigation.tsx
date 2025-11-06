/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

"use client"

import { Button } from "@/components/ui/button"
import { BookOpen, Crown, Heart, Menu, Shield, Sparkles, Users, X } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"

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

  const navigationItems = [
    { href: "/kingdom", label: "Kingdom", icon: Crown },
    { href: "/sapiens", label: "Sapiens", icon: BookOpen },
    { href: "/temple", label: "Temple", icon: Heart },
    { href: "/services", label: "Services", icon: Users },
    { href: "/bible", label: "Scripture", icon: Shield },
  ]

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled ? "acrylic sacred-shadow" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Main Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-primary via-secondary to-accent flex items-center justify-center shadow-lg group-hover:scale-110 transition-all duration-300">
              <Sparkles className="w-7 h-7 text-white animate-pulse" />
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 blur-xl group-hover:blur-2xl transition-all duration-300" />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold gradient-text tracking-tight">Azora OS</span>
              <span className="text-xs text-muted-foreground -mt-1">Constitutional AI</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navigationItems.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group flex items-center gap-2 text-sm font-medium text-foreground/70 hover:text-foreground transition-all duration-300 hover:scale-105 transform"
                >
                  <Icon className="w-4 h-4 group-hover:text-accent transition-colors" />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </div>

          {/* Action Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              className="hover:bg-muted/50 transition-all duration-300"
            >
              Sign In
            </Button>
            <Button
              size="sm"
              className="gradient-bg text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 sacred-shadow"
            >
              Enter the Covenant
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors duration-300"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden acrylic border-t border-border animate-fade-in-up">
          <div className="px-4 py-6 space-y-4">
            {navigationItems.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 py-3 text-sm font-medium text-foreground/80 hover:text-foreground transition-colors duration-300"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              )
            })}
            <div className="pt-4 space-y-3 border-t border-border">
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
