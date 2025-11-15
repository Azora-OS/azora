import type { ReactNode } from 'react'
import { cn } from '../../lib/utils'

interface AppShellProps {
  children: ReactNode
  header?: ReactNode
  sidebar?: ReactNode
  className?: string
  gemTheme?: 'sapphire' | 'emerald' | 'ruby' | 'ubuntu'
}

/**
 * AppShell - Main application layout wrapper
 * Provides consistent structure with optional header and sidebar
 */
export function AppShell({ 
  children, 
  header, 
  sidebar,
  className,
  gemTheme 
}: AppShellProps) {
  const themeClass = gemTheme ? `bg-gradient-${gemTheme}` : ''
  
  return (
    <div className={cn('min-h-screen bg-background', themeClass, className)}>
      {header && (
        <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-sm">
          {header}
        </header>
      )}
      
      <div className="flex">
        {sidebar && (
          <aside className="sticky top-16 h-[calc(100vh-4rem)] w-64 border-r bg-card/50 backdrop-blur-sm overflow-y-auto">
            {sidebar}
          </aside>
        )}
        
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}