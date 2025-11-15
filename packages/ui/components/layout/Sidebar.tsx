import type { ReactNode } from 'react'
import { cn } from '../../lib/utils'

interface SidebarProps {
  children: ReactNode
  className?: string
  variant?: 'default' | 'glass' | 'gem'
}

interface SidebarSectionProps {
  title?: string
  children: ReactNode
  className?: string
}

interface SidebarItemProps {
  icon?: ReactNode
  label: string
  active?: boolean
  onClick?: () => void
  className?: string
}

/**
 * Sidebar - Navigation sidebar component
 */
export function Sidebar({ children, className, variant = 'default' }: SidebarProps) {
  return (
    <div 
      className={cn(
        'p-4 space-y-4',
        variant === 'glass' && 'glass-card',
        variant === 'gem' && 'constitutional-frame',
        className
      )}
    >
      {children}
    </div>
  )
}

/**
 * SidebarSection - Grouped section in sidebar
 */
export function SidebarSection({ title, children, className }: SidebarSectionProps) {
  return (
    <div className={cn('space-y-2', className)}>
      {title && (
        <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {title}
        </h3>
      )}
      <div className="space-y-1">
        {children}
      </div>
    </div>
  )
}

/**
 * SidebarItem - Individual navigation item
 */
export function SidebarItem({ 
  icon, 
  label, 
  active = false, 
  onClick,
  className 
}: SidebarItemProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all',
        active 
          ? 'bg-primary text-primary-foreground shadow-glow-sapphire' 
          : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
        className
      )}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span className="truncate">{label}</span>
    </button>
  )
}