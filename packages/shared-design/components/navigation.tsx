"use client"

import { Button } from "./ui/button"
import { Menu, Search, X } from "lucide-react"
import { useState } from "react"

export function Navigation() {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50">
            <div className="container mx-auto px-4 lg:px-8">
                <div className="flex items-center justify-between h-16 lg:h-20">
                    {/* Logo */}
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[oklch(0.65_0.19_35)] to-[oklch(0.55_0.25_260)] flex items-center justify-center">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-white">
                                <path
                                    d="M12 2L13.09 8.26L20 9L13.09 15.74L12 22L10.91 15.74L4 9L10.91 8.26L12 2Z"
                                    fill="currentColor"
                                />
                            </svg>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xl font-bold tracking-tight">Azora OS</span>
                            <span className="text-xs text-muted-foreground hidden sm:block">Ubuntu Philosophy</span>
                        </div>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden lg:flex items-center gap-8">
                        <a
                            href="#platform"
                            className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
                        >
                            Platform
                        </a>
                        <a
                            href="#solutions"
                            className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
                        >
                            Solutions
                        </a>
                        <a
                            href="#developers"
                            className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
                        >
                            Developers
                        </a>
                        <a
                            href="#resources"
                            className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
                        >
                            Resources
                        </a>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="icon" className="hidden md:inline-flex">
                            <Search className="h-5 w-5" />
                        </Button>
                        <Button variant="ghost" className="hidden md:inline-flex">
                            Sign In
                        </Button>
                        <Button className="bg-[oklch(0.65_0.19_35)] hover:bg-[oklch(0.6_0.19_35)] text-white">Get Started</Button>
                        <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setIsOpen(!isOpen)}>
                            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                        </Button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isOpen && (
                    <div className="lg:hidden py-4 border-t border-border/50">
                        <div className="flex flex-col gap-4">
                            <a href="#platform" className="text-sm font-medium">
                                Platform
                            </a>
                            <a href="#solutions" className="text-sm font-medium">
                                Solutions
                            </a>
                            <a href="#developers" className="text-sm font-medium">
                                Developers
                            </a>
                            <a href="#resources" className="text-sm font-medium">
                                Resources
                            </a>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    )
}
