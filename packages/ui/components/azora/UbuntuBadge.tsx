import type { ReactNode } from 'react'
import { cn } from '../../lib/utils'

interface UbuntuBadgeProps {
  children: ReactNode
  className?: string
}

/**
 * Ubuntu Philosophy Badge
 * "I am because we are"
 */
export function UbuntuBadge({ children, className }: UbuntuBadgeProps) {
  return (
    <div className={cn('ubuntu-badge', className)}>
      <span className="text-sm font-medium">{children}</span>
    </div>
  )
}