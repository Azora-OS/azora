"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false)

  const navItems = [
    { label: "Home", href: "/" },
    { label: "Explore", href: "/explore" },
    { label: "Courses", href: "/courses" },
    { label: "Mentors", href: "/mentorship/mentors" },
    { label: "Marketplace", href: "/mentorship/marketplace" },
    { label: "Community", href: "/community/forums" },
    { label: "Jobs", href: "/jobs" },
    { label: "Dashboard", href: "/dashboard" },
  ]

  return (
    <nav className="sticky top-0 z-50 bg-background border-b border-border md:hidden">
      <div className="flex items-center justify-between px-4 py-3">
        <Link href="/" className="text-xl font-bold text-foreground">
          Azora
        </Link>
        <button onClick={() => setIsOpen(!isOpen)} className="p-2 hover:bg-muted rounded-lg transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {isOpen && (
        <div className="bg-card border-t border-border px-4 py-3 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block px-3 py-2 rounded-lg hover:bg-muted text-foreground transition-colors"
              onClick={() => setIsOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          <div className="flex gap-2 pt-2 border-t border-border">
            <Button variant="outline" className="flex-1 bg-transparent" size="sm">
              Login
            </Button>
            <Button className="flex-1" size="sm">
              Sign Up
            </Button>
          </div>
        </div>
      )}
    </nav>
  )
}
