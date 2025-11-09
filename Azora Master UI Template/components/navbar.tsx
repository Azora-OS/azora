"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Globe } from "lucide-react"

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
              <Globe className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-foreground">Azora Sapiens</span>
          </div>
          <div className="hidden gap-8 md:flex">
            <Link href="/explore" className="text-sm text-muted-foreground hover:text-foreground">
              Explore
            </Link>
            <Link href="/educators" className="text-sm text-muted-foreground hover:text-foreground">
              For Educators
            </Link>
            <Link href="/employers" className="text-sm text-muted-foreground hover:text-foreground">
              For Employers
            </Link>
          </div>
          <div className="flex gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/login">Sign In</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/signup">Get Started</Link>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}
