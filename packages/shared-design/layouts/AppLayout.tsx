/**
 * AZORA PROPRIETARY LICENSE
 * Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.
 * 
 * AppLayout - Modern 2025 Application Layout
 * Demonstrates proper usage of Azora Master UI Template
 */

import type React from 'react'
import { AzoraLogo, MobileNav } from '../azora-master-components'
import { FooterStamps } from '../components/SignatureStamp'
import { cn } from '../utils'

interface AppLayoutProps {
  children: React.ReactNode
  className?: string
  showMobileNav?: boolean
  mobileNavItems?: React.ReactNode
  headerActions?: React.ReactNode
  sidebarContent?: React.ReactNode
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  className,
  showMobileNav = true,
  mobileNavItems,
  headerActions,
  sidebarContent
}) => {
  return (
    <div className={cn('min-h-screen bg-background', className)}>
      {/* Header with Glassmorphism */}
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-lg supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo Section */}
            <div className="flex items-center gap-3">
              <AzoraLogo className="h-10 w-10" />
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold bg-gradient-to-r from-[#667eea] to-[#764ba2] bg-clip-text text-transparent">
                  Azora OS
                </h1>
                <p className="text-xs text-muted-foreground">Constitutional AI</p>
              </div>
            </div>

            {/* Header Actions */}
            {headerActions && (
              <div className="flex items-center gap-4">
                {headerActions}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex min-h-[calc(100vh-4rem)]">
        {/* Sidebar (if provided) */}
        {sidebarContent && (
          <aside className="hidden lg:block w-64 border-r border-border/40 bg-card/50 backdrop-blur-sm">
            <div className="sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto p-4">
              {sidebarContent}
            </div>
          </aside>
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-x-hidden">
          <div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Navigation */}
      {showMobileNav && mobileNavItems && (
        <MobileNav>{mobileNavItems}</MobileNav>
      )}

      {/* Footer Stamps */}
      <FooterStamps />

      {/* Decorative Background Elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-[#667eea]/10 blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-[#764ba2]/10 blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-[#10b981]/5 blur-3xl" />
      </div>
    </div>
  )
}

export default AppLayout