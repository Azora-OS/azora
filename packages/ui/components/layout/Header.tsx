import type { ReactNode } from 'react'
import { AzoraLogo } from '../azora/AzoraLogo'
import { cn } from '../../lib/utils'

interface HeaderProps {
  title?: string
  logo?: boolean
  actions?: ReactNode
  navigation?: ReactNode
  className?: string
}

/**
 * Header - Application header with Azora branding
 * Includes logo, title, navigation, and action buttons
 */
export function Header({ 
  title = 'Azora OS',
  logo = true,
  actions,
  navigation,
  className 
}: HeaderProps) {
  return (
    <div className={cn('mx-auto max-w-7xl px-4 sm:px-6 lg:px-8', className)}>
      <div className="flex h-16 items-center justify-between">
        {/* Logo and Title */}
        <div className="flex items-center gap-3">
          {logo && <AzoraLogo className="h-10 w-10" />}
          <span className="text-xl font-bold gradient-text-ubuntu">{title}</span>
        </div>
        
        {/* Navigation */}
        {navigation && (
          <nav className="hidden md:flex items-center gap-6">
            {navigation}
          </nav>
        )}
        
        {/* Actions */}
        {actions && (
          <div className="flex items-center gap-3">
            {actions}
          </div>
        )}
      </div>
    </div>
  )
}